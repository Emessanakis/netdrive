// backend/controllers/auth/downloadThumbnail.controller.js

import fs from "fs";
import path from "path";
import db from "../../models/index.js";
import { decryptFileBuffer } from "../../utils/gcmEncryption.js";

// Import File, Folder, and Thumbnail Models
const { file: FileModel, folder: FolderModel, thumbnail: ThumbnailModel } = db;
const uploadBaseDir = path.join(process.cwd(), "uploads");

/**
 * Downloads and decrypts the thumbnail associated with a file ID.
 */
const downloadThumbnail = async (req, res) => {
  try {
    const fileId = req.params.id;

    // 1. Fetch the File record with its Thumbnail and the Thumbnail's Folder
    const fileRecord = await FileModel.findOne({
      where: { 
        id: fileId, 
        ownerId: req.user.id 
      },
      include: [
        {
          model: ThumbnailModel,
          as: 'thumbnail',
          where: { ownerId: req.user.id }, // ADD THIS: Extra security check
          include: [
            {
              model: FolderModel,
              as: 'folder',
              attributes: ['folder_type'],
            }
          ]
        }
      ]
    });

    // if (fileRecord) {
    //   if (fileRecord.thumbnail) {
    //     console.log("DEBUG: Thumbnail folder type:", fileRecord.thumbnail.folder?.folder_type);
    //   }
    // }

    // 2. Perform security and existence checks
    if (!fileRecord) {
      console.error("DEBUG: File record not found");
      return res.status(404).json({ message: "File not found." });
    }

    if (!fileRecord.thumbnail) {
      console.error("DEBUG: Thumbnail record missing");
      return res.status(404).json({ message: "Thumbnail not found for this file." });
    }

    if (!fileRecord.thumbnail.folder) {
      console.error("DEBUG: Thumbnail folder record missing");
      return res.status(404).json({ message: "Thumbnail folder information missing." });
    }

    const thumbnailRecord = fileRecord.thumbnail;
    const thumbnailFolder = fileRecord.thumbnail.folder;

    // 3. Construct the path to the encrypted thumbnail
    const folderName = thumbnailFolder.folder_type;
    const encryptedPath = path.join(
      uploadBaseDir,
      req.user.username,
      folderName,
      thumbnailRecord.storage_filename
    );

    // Check if file exists
    if (!fs.existsSync(encryptedPath)) {
      console.error("DEBUG: Thumbnail file not found on disk at:", encryptedPath);
      return res.status(404).json({ message: "Thumbnail file missing on disk." });
    }

    // 4. Read and decrypt the thumbnail
    const encryptedBuffer = fs.readFileSync(encryptedPath);

    const decryptedBuffer = decryptFileBuffer(
      encryptedBuffer,
      thumbnailRecord.iv,
      thumbnailRecord.auth_tag
    );

    // 5. Send the decrypted buffer
    res.setHeader("Content-Type", thumbnailRecord.mime_type);
    res.setHeader("Content-Disposition", `inline; filename="thumb_${fileRecord.original_filename}"`);
    res.setHeader("Cache-Control", "public, max-age=3600");
    
    res.send(decryptedBuffer);

  } catch (err) {
    console.error("ERROR in downloadThumbnail:", err);
    console.error("ERROR stack:", err.stack);
    
    if (err.message.includes("integrity check failed")) {
      return res.status(500).json({ message: "Thumbnail integrity check failed during decryption." });
    }
    
    res.status(500).json({ 
      message: "An error occurred while retrieving the thumbnail.",
      error: err.message 
    });
  }
};

export default downloadThumbnail;