// backend/controllers/auth/upload.controller.js

import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import path from "path";
import { spawn } from "child_process";
import encryption from "../../../utils/gcmEncryption.js";
import db from "../../../models/index.js";
import sharp from "sharp";

// Import File, Folder, and Thumbnail Models
const { file: FileModel, folder: FolderModel, thumbnail: ThumbnailModel } = db; 
const STORAGE_DIR = process.env.LOCAL_STORAGE_DIR || path.join(process.cwd(), "uploads");

const getUserDir = async (username, folderName) => {
  const dir = path.join(STORAGE_DIR, username, folderName);
  await fs.mkdir(dir, { recursive: true });
  return dir;
};

const determineFileType = (mimeType) => {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return "other";
};

// ... generateVideoThumbnail function (omitted for brevity) ...
const generateVideoThumbnail = async (videoBuffer) => {
  const tempVideo = path.join("/tmp", `${uuidv4()}.mp4`);
  await fs.writeFile(tempVideo, videoBuffer);
  const tempThumbnail = tempVideo.replace(".mp4", ".png");

  await new Promise((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", [
      "-i", tempVideo,
      "-ss", "00:00:01",
      "-frames:v", "1",
      "-s", "320x240",
      tempThumbnail
    ]);

    ffmpeg.on("error", reject);
    ffmpeg.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error("FFmpeg failed with code " + code));
    });
  });

  const buffer = await fs.readFile(tempThumbnail);
  await fs.unlink(tempVideo);
  await fs.unlink(tempThumbnail);
  return buffer;
};


const uploadFiles = async (req, res) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);
    if (!files.length) return res.status(400).json({ message: "No file uploaded." });

    const username = req.user.username;

    // Retrieve user's default folders from DB
    const userFolders = await FolderModel.findAll({
      where: { owner_user_id: req.user.id },
    });
    const folderMap = {};
    userFolders.forEach(f => folderMap[f.folder_type] = f.id);

    if (!folderMap["photos"] || !folderMap["videos"] || !folderMap["thumbnails"] || !folderMap["files"]) {
        return res.status(500).json({ message: "User folders are not initialized properly." });
    }

    const uploadedRecords = [];

    for (const file of files) {
      if (!file.buffer) continue;

      const fileType = determineFileType(file.mimetype);
      let folderType = fileType === "image" ? "photos" : fileType === "video" ? "videos" : "files";
      const folderId = folderMap[folderType];

      // Encrypt main file
      const { 
        encryptedBuffer, 
        ivHex, 
        authTagHex 
      } = encryption.encryptFileBuffer(file.buffer);
      
      const userDir = await getUserDir(username, folderType);
      const storageFilename = `${uuidv4()}.dat`;
      const filePath = path.join(userDir, storageFilename);
      
      await fs.writeFile(filePath, encryptedBuffer);

      // 1. Create the File record (NULL thumbnail_id initially)
      const fileRecord = await FileModel.create({
          original_filename: file.originalname,
          storage_filename: storageFilename,
          iv: ivHex,
          auth_tag: authTagHex,
          mime_type: file.mimetype,
          file_type: fileType,
          size_bytes: file.size,
          ownerId: req.user.id,
          folderId: folderId,
          thumbnail_id: null, // Initialized as NULL
      });
      
  let thumbnailCreated = false;
  let thumbnailId = null;

      // Thumbnail logic
      if (fileType === "image" || fileType === "video") {
        let thumbBuffer;
        let thumbMimeType = 'image/png';
        let thumbSize;

        if (fileType === "image") {
          thumbBuffer = await sharp(file.buffer)
            .resize(320, 240, { fit: "cover" })
            .png()
            .toBuffer();
          thumbSize = thumbBuffer.length;

        } else if (fileType === "video") {
          try {
            thumbBuffer = await generateVideoThumbnail(file.buffer);
            thumbSize = thumbBuffer.length;
          } catch (thumbErr) {
            console.error("Video thumbnail generation failed:", thumbErr);
            thumbBuffer = null; // Don't create a thumbnail record if generation failed
          }
        }
        
        if (thumbBuffer) {
          const thumbDir = await getUserDir(username, "thumbnails");
          const thumbStorageFilename = `${uuidv4()}.dat`;
          
          // Encrypt thumbnail
          const { 
            encryptedBuffer: encryptedThumb,
            ivHex: thumbIvHex,
            authTagHex: thumbAuthTagHex
          } = encryption.encryptFileBuffer(thumbBuffer);
          
          await fs.writeFile(path.join(thumbDir, thumbStorageFilename), encryptedThumb);

          // DEBUG: Check if we have the thumbnails folder ID
          console.log("DEBUG: folderMap contents:", folderMap);
          console.log("DEBUG: thumbnails folder ID:", folderMap["thumbnails"]);

          if (!folderMap["thumbnails"]) {
            console.error("ERROR: thumbnails folder not found in folderMap");
            continue; // Skip thumbnail creation if folder not found
          }

          // 2. Create the Thumbnail record WITH folder_id
          const thumbnailRecord = await ThumbnailModel.create({
            file_id: fileRecord.id, // Link to the file
            ownerId: req.user.id, // ADD THIS: Set the owner
            folder_id: folderMap["thumbnails"], // Assign to thumbnails folder
            storage_filename: thumbStorageFilename,
            iv: thumbIvHex,
            auth_tag: thumbAuthTagHex,
            mime_type: thumbMimeType,
            size_bytes: thumbSize,
          });

          // 3. Update the File record with the new thumbnail_id
          await fileRecord.update({ thumbnail_id: thumbnailRecord.id });

          thumbnailCreated = true;
          thumbnailId = thumbnailRecord.id;
          console.log("DEBUG: Thumbnail created successfully with ID:", thumbnailRecord.id);
        }
      }

      // Build absolute URLs using the incoming request host/protocol so the client can load them directly
  // Use relative URLs so the frontend requests use the same origin as the page (avoids CSP issues)
  const fileUrl = `/api/auth/download/${fileRecord.id}`;
  const thumbUrl = thumbnailCreated ? `/api/auth/thumbnail/${thumbnailId}` : null;

      uploadedRecords.push({
        id: fileRecord.id,
        original_filename: fileRecord.original_filename,
        uploaded_at: fileRecord.uploaded_at,
        // expose canonical URLs so frontend doesn't have to construct them
        url: fileUrl,
        thumbnail_url: thumbUrl,
        has_thumbnail: thumbnailCreated,
        thumbnail_id: thumbnailId,
      });
    }

    res.status(201).json({
      message: "Files uploaded and encrypted successfully.",
      files: uploadedRecords,
    });
  } catch (err) {
    console.error("File upload error:", err);
    res.status(500).json({ message: "Failed to upload files.", error: err.message });
  }
};

export default { uploadFiles };