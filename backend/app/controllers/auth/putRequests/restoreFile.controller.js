// backend/controllers/auth/restore.controller.js
import db from "../../../models/index.js";

const { file: File, thumbnail: Thumbnail } = db;

/**
 * Controller to restore a soft-deleted file
 * Sets is_deleted to false and updates the timestamp
 */
const restoreFile = async (req, res) => {
  try {
    const fileId = req.params.id;

    // 1. Find the soft-deleted file owned by the user
    const fileRecord = await File.findOne({
      where: { 
        id: fileId, 
        ownerId: req.user.id,
        is_deleted: true // Only restore files that are soft-deleted
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
        message: "File not found, already restored, or not owned by you." 
      });
    }

    // 2. Restore the file by setting is_deleted to false
    const [affectedRows] = await File.update(
      { 
        is_deleted: false,
        updated_at: new Date() // Update the timestamp to reflect restoration
      },
      { 
        where: { id: fileId }
      }
    );

    if (affectedRows === 0) {
      return res.status(500).json({ 
        message: "Failed to restore file." 
      });
    }

    res.json({
      message: "File restored successfully",
      restoredFile: {
        id: fileRecord.id,
        name: fileRecord.original_filename,
        type: fileRecord.file_type,
        size: fileRecord.size_bytes,
        restoredAt: new Date()
      }
    });

  } catch (err) {
    console.error("Error during file restoration:", err);
    
    if (err.name === 'SequelizeDatabaseError') {
      return res.status(500).json({ 
        message: "Database error during restoration." 
      });
    }

    res.status(500).json({ 
      message: "Failed to restore file.",
      error: err.message 
    });
  }
};

/**
 * Controller to restore multiple soft-deleted files in batch
 */
const restoreMultipleFiles = async (req, res) => {
  try {
    const { fileIds } = req.body;

    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({ 
        message: "File IDs array is required." 
      });
    }

    // 1. Find all soft-deleted files owned by the user
    const fileRecords = await File.findAll({
      where: { 
        id: fileIds, 
        ownerId: req.user.id,
        is_deleted: true // Only restore files that are soft-deleted
      },
      attributes: ['id', 'original_filename', 'file_type', 'size_bytes']
    });

    if (fileRecords.length === 0) {
      return res.status(404).json({ 
        message: "No files found for restoration." 
      });
    }

    const foundFileIds = fileRecords.map(f => f.id);
    const notFoundIds = fileIds.filter(id => !foundFileIds.includes(id));

    // 2. Restore all found files
    const [affectedRows] = await File.update(
      { 
        is_deleted: false,
        updated_at: new Date()
      },
      { 
        where: { id: foundFileIds }
      }
    );

    if (affectedRows === 0) {
      return res.status(500).json({ 
        message: "Failed to restore files." 
      });
    }

    res.json({
      message: `${affectedRows} files restored successfully`,
      restoredCount: affectedRows,
      restoredFiles: fileRecords.map(f => ({
        id: f.id,
        name: f.original_filename,
        type: f.file_type,
        size: f.size_bytes
      })),
      notFoundIds: notFoundIds.length > 0 ? notFoundIds : undefined
    });

  } catch (err) {
    console.error("Error during batch file restoration:", err);
    
    res.status(500).json({ 
      message: "Failed to restore files.",
      error: err.message 
    });
  }
};

export default {
  restoreFile,
  restoreMultipleFiles
};