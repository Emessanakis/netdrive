// backend/controllers/auth/downloadThumbnailById.controller.js

import fs from "fs";
import path from "path";
import db from "../../../models/index.js";
import { decryptFileBuffer } from "../../../utils/gcmEncryption.js";

const { thumbnail: ThumbnailModel, folder: FolderModel } = db;
const uploadBaseDir = path.join(process.cwd(), "uploads");

const downloadThumbnailById = async (req, res) => {
  try {
    const thumbnailId = req.params.id;

    const thumbnailRecord = await ThumbnailModel.findOne({
      where: { id: thumbnailId, ownerId: req.user.id },
      include: [
        {
          model: FolderModel,
          as: 'folder',
          attributes: ['folder_type']
        }
      ]
    });

    if (!thumbnailRecord) {
      return res.status(404).json({ message: "Thumbnail not found." });
    }

    if (!thumbnailRecord.folder || !thumbnailRecord.folder.folder_type) {
      return res.status(404).json({ message: "Thumbnail folder information missing." });
    }

    const folderName = thumbnailRecord.folder.folder_type;
    const encryptedPath = path.join(uploadBaseDir, req.user.username, folderName, thumbnailRecord.storage_filename);

    if (!fs.existsSync(encryptedPath)) {
      return res.status(404).json({ message: "Thumbnail file missing on disk." });
    }

    const encryptedBuffer = fs.readFileSync(encryptedPath);
    const decryptedBuffer = decryptFileBuffer(encryptedBuffer, thumbnailRecord.iv, thumbnailRecord.auth_tag);

    res.setHeader("Content-Type", thumbnailRecord.mime_type);
    res.setHeader("Content-Disposition", `inline; filename="thumb_${thumbnailRecord.storage_filename}"`);
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(decryptedBuffer);
  } catch (err) {
    console.error("ERROR in downloadThumbnailById:", err);
    res.status(500).json({ message: "Failed to retrieve thumbnail.", error: err.message });
  }
};

export default downloadThumbnailById;
