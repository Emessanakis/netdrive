// backend/controllers/auth/softDelete.controller.js
import db from "../../models/index.js";

const { file: File, thumbnail: Thumbnail } = db;

/**
 * Controller to soft delete a file (move to recycle bin)
 * Sets is_deleted to true and updates the timestamp
 */
const softDeleteFile = async (req, res) => {
  try {
    const fileId = req.params.id;

    // 1. Find the file owned by the user that is not already deleted
    const fileRecord = await File.findOne({
      where: { 
        id: fileId, 
        ownerId: req.user.id,
        is_deleted: false // Only soft delete files that are not already deleted
      },
      include: [{
        model: Thumbnail,
        as: 'thumbnail',
        attributes: ['id'],
        required: false
      }]
    });

    if (!fileRecord) {
      return res.status(404).json({ 
        message: "File not found, already deleted, or not owned by you." 
      });
    }

    // 2. Soft delete the file by setting is_deleted to true
    const [affectedRows] = await File.update(
      { 
        is_deleted: true,
        updated_at: new Date() // Update the timestamp to reflect deletion time
      },
      { 
        where: { id: fileId }
      }
    );

    if (affectedRows === 0) {
      return res.status(500).json({ 
        message: "Failed to delete file." 
      });
    }

    res.json({
      message: "File moved to recycle bin successfully",
      deletedFile: {
        id: fileRecord.id,
        name: fileRecord.original_filename,
        type: fileRecord.file_type,
        size: fileRecord.size_bytes,
        deletedAt: new Date()
      }
    });

  } catch (err) {
    console.error("Error during file deletion:", err);
    
    if (err.name === 'SequelizeDatabaseError') {
      return res.status(500).json({ 
        message: "Database error during deletion." 
      });
    }

    res.status(500).json({ 
      message: "Failed to delete file.",
      error: err.message 
    });
  }
};

/**
 * Controller to soft delete multiple files in batch
 */
const softDeleteMultipleFiles = async (req, res) => {
  try {
    const { fileIds } = req.body;

    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({ 
        message: "File IDs array is required." 
      });
    }

    // 1. Find all files owned by the user that are not already deleted
    const fileRecords = await File.findAll({
      where: { 
        id: fileIds, 
        ownerId: req.user.id,
        is_deleted: false // Only soft delete files that are not already deleted
      },
      attributes: ['id', 'original_filename', 'file_type', 'size_bytes']
    });

    if (fileRecords.length === 0) {
      return res.status(404).json({ 
        message: "No files found for deletion." 
      });
    }

    const foundFileIds = fileRecords.map(f => f.id);
    const notFoundIds = fileIds.filter(id => !foundFileIds.includes(id));

    // 2. Soft delete all found files
    const [affectedRows] = await File.update(
      { 
        is_deleted: true,
        updated_at: new Date()
      },
      { 
        where: { id: foundFileIds }
      }
    );

    if (affectedRows === 0) {
      return res.status(500).json({ 
        message: "Failed to delete files." 
      });
    }

    res.json({
      message: `${affectedRows} files moved to recycle bin successfully`,
      deletedCount: affectedRows,
      deletedFiles: fileRecords.map(f => ({
        id: f.id,
        name: f.original_filename,
        type: f.file_type,
        size: f.size_bytes
      })),
      notFoundIds: notFoundIds.length > 0 ? notFoundIds : undefined
    });

  } catch (err) {
    console.error("Error during batch file deletion:", err);
    
    res.status(500).json({ 
      message: "Failed to delete files.",
      error: err.message 
    });
  }
};

export default {
  softDeleteFile,
  softDeleteMultipleFiles
};