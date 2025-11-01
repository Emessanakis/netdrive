// backend/controllers/auth/isFavourite.controller.js
import db from "../../models/index.js";

const { file: File } = db;

/**
 * Controller to toggle favorite status for a file
 * Adds or removes the file from favorites
 */
const toggleFavorite = async (req, res) => {
  try {
    const fileId = req.params.id;

    // 1. Find the file owned by the user
    const fileRecord = await File.findOne({
      where: { 
        id: fileId, 
        ownerId: req.user.id,
        is_deleted: false // Only work with non-deleted files
      }
    });

    if (!fileRecord) {
      return res.status(404).json({ 
        message: "File not found or not owned by you." 
      });
    }

    // 2. Toggle the is_favorite field
    const newFavoriteStatus = !fileRecord.is_favorite;
    
    const [affectedRows] = await File.update(
      { 
        is_favorite: newFavoriteStatus,
        updated_at: new Date()
      },
      { 
        where: { id: fileId }
      }
    );

    if (affectedRows === 0) {
      return res.status(500).json({ 
        message: "Failed to update favorite status." 
      });
    }

    res.json({
      message: newFavoriteStatus ? "File added to favorites" : "File removed from favorites",
      file: {
        id: fileRecord.id,
        name: fileRecord.original_filename,
        is_favorite: newFavoriteStatus
      }
    });

  } catch (err) {
    console.error("Error toggling favorite status:", err);
    
    if (err.name === 'SequelizeDatabaseError') {
      return res.status(500).json({ 
        message: "Database error updating favorite status." 
      });
    }

    res.status(500).json({ 
      message: "Failed to update favorite status.",
      error: err.message 
    });
  }
};

/**
 * Controller to set favorite status for multiple files
 */
const setMultipleFavorites = async (req, res) => {
  try {
    const { fileIds, isFavorite } = req.body;

    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({ 
        message: "File IDs array is required." 
      });
    }

    if (typeof isFavorite !== 'boolean') {
      return res.status(400).json({ 
        message: "isFavorite boolean field is required." 
      });
    }

    // 1. Find all files owned by the user that are not deleted
    const fileRecords = await File.findAll({
      where: { 
        id: fileIds, 
        ownerId: req.user.id,
        is_deleted: false
      },
      attributes: ['id', 'original_filename']
    });

    if (fileRecords.length === 0) {
      return res.status(404).json({ 
        message: "No files found to update." 
      });
    }

    const foundFileIds = fileRecords.map(f => f.id);
    const notFoundIds = fileIds.filter(id => !foundFileIds.includes(id));

    // 2. Update favorite status for all found files
    const [affectedRows] = await File.update(
      { 
        is_favorite: isFavorite,
        updated_at: new Date()
      },
      { 
        where: { id: foundFileIds }
      }
    );

    if (affectedRows === 0) {
      return res.status(500).json({ 
        message: "Failed to update favorite status." 
      });
    }

    const action = isFavorite ? "added to favorites" : "removed from favorites";

    res.json({
      message: `${affectedRows} files ${action}`,
      updatedCount: affectedRows,
      updatedFiles: fileRecords.map(f => ({
        id: f.id,
        name: f.original_filename,
        is_favorite: isFavorite
      })),
      notFoundIds: notFoundIds.length > 0 ? notFoundIds : undefined
    });

  } catch (err) {
    console.error("Error updating multiple favorite status:", err);
    
    res.status(500).json({ 
      message: "Failed to update favorite status.",
      error: err.message 
    });
  }
};

// backend/controllers/auth/isFavourite.controller.js - UPDATED hasMore logic
const getFavoriteFiles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 18;
    const offset = (page - 1) * limit;

    console.log(`🔍 Favorites API - Page: ${page}, Limit: ${limit}, Offset: ${offset}`);

    const { count, rows: files } = await File.findAndCountAll({
      where: { 
        ownerId: req.user.id, 
        is_deleted: false,
        is_favorite: true 
      },
      order: [["updated_at", "DESC"]],
      attributes: [
        "id",
        "original_filename",
        "mime_type",
        "size_bytes",
        "uploaded_at",
        "is_favorite"
      ],
      include: [{
        model: db.thumbnail,
        as: 'thumbnail',
        attributes: ['id', 'mime_type'],
        required: false
      }],
      limit: limit,
      offset: offset
    });

    console.log(`🔍 Favorites DB Result - Total: ${count}, This page: ${files.length}`);

    const mapped = files.map(f => {
      let type = "other";
      if (f.mime_type.startsWith("image/")) type = "image";
      else if (f.mime_type.startsWith("video/")) type = "video";

      const thumbnailId = f.thumbnail?.id;

      return {
        id: f.id,
        name: f.original_filename,
        url: `/api/auth/download/${f.id}`, 
        thumbnail_url: thumbnailId ? `/api/auth/download-thumbnail/${f.id}` : null,
        type,
        size: f.size_bytes,
        uploadedAt: f.uploaded_at,
        is_favorite: f.is_favorite
      };
    });

    // ✅ FIX: Ensure hasMore is calculated correctly
    const hasMore = offset + limit < count;
    
    console.log(`🔍 Favorites Response - hasMore: ${hasMore}, Calculation: ${offset} + ${limit} < ${count} = ${hasMore}`);

    res.json({
      files: mapped,
      totalFavorites: count,
      hasMore: hasMore, // ✅ Explicitly set hasMore
    });

  } catch (err) {
    console.error("Error retrieving favorite files:", err);
    res.status(500).json({ 
      message: "An error occurred while fetching favorite files.",
      error: err.message 
    });
  }
};

export default {
  toggleFavorite,
  setMultipleFavorites,
  getFavoriteFiles
};