// backend/controllers/files/downloadFile.controller.js
import fs from "fs";
import path from "path";
import db from "../../models/index.js";
import { decryptFileBuffer } from "../../utils/gcmEncryption.js";

const { file: FileModel, folder: FolderModel } = db;
const uploadBaseDir = path.join(process.cwd(), "uploads");

const downloadFile = async (req, res) => {
  try {
    const fileId = req.params.id;

    // 2. INCLUDE FOLDER MODEL IN QUERY TO GET THE DIRECTORY NAME
    const fileRecord = await FileModel.findOne({
      where: { id: fileId, ownerId: req.user.id },
      include: [
        { 
          model: FolderModel, 
          as: 'folder', 
          attributes: ['folder_type'],
          foreignKey: 'folderId', 
        }
      ]
    });

    if (!fileRecord || !fileRecord.folder || !fileRecord.folder.folder_type) {
      return res.status(404).json({ message: "File not found or folder path missing in database." });
    }

    // 3. CONSTRUCT THE CORRECT PATH USING THE FOLDER TYPE
    const folderName = fileRecord.folder.folder_type;
    const encryptedPath = path.join(uploadBaseDir, req.user.username, folderName, fileRecord.storage_filename);
    
    if (!fs.existsSync(encryptedPath)) {
      return res.status(404).json({ message: "File missing on disk" });
    }

    const encryptedBuffer = fs.readFileSync(encryptedPath);

    // 4. DECRYPT with IV and the new AUTH TAG from the database
    const decryptedBuffer = decryptFileBuffer(
      encryptedBuffer,
      fileRecord.iv,
      fileRecord.auth_tag 
    );

    res.setHeader("Content-Type", fileRecord.mime_type);
    res.setHeader("Content-Disposition", `inline; filename="${fileRecord.original_filename}"`);
    res.send(decryptedBuffer);

  } catch (err) {
    console.error("Error downloading file:", err);
    const message = err.message.includes("integrity check failed") 
      ? "File integrity check failed during decryption." 
      : "Failed to download file.";
    res.status(500).json({ message });
  }
};

export default downloadFile;