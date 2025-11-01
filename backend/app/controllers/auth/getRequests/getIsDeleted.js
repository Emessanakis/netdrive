
// backend/controllers/auth/getIsDeleted.controller.js
import db from "../../../models/index.js";

const { file: File, thumbnail: Thumbnail } = db;

/**
 * Controller to get soft-deleted files for the authenticated user
 * This allows users to view and potentially restore their deleted files
 */
const getIsDeleted = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    console.log(`🗑️ Deleted Files API - Page: ${page}, Limit: ${limit}, Offset: ${offset}`);

    // Use findAndCountAll for proper database-level pagination
    const { count, rows: files } = await File.findAndCountAll({
      where: { 
        ownerId: req.user.id, 
        is_deleted: true // Only get soft-deleted files
      },
      order: [["updated_at", "DESC"]], // Sort by when they were deleted (most recent first)
      attributes: [
        "id",
        "original_filename",
        "mime_type",
        "size_bytes",
        "uploaded_at",
        "updated_at", // This will show when the file was soft-deleted
        "is_deleted"
      ],
      // Include thumbnail data if available
      include: [{
        model: Thumbnail,
        as: 'thumbnail',
        attributes: ['id', 'mime_type'],
        required: false
      }],
      limit: limit,
      offset: offset
    });

    console.log(`🗑️ Deleted Files DB Result - Total: ${count}, This page: ${files.length}`);

    const mapped = files.map(f => {
      let type = "other";
      if (f.mime_type.startsWith("image/")) type = "image";
      else if (f.mime_type.startsWith("video/")) type = "video";
      else if (f.mime_type.startsWith("application/") || 
               f.mime_type.includes("document") || 
               f.mime_type.includes("pdf") || 
               f.mime_type.includes("text")) {
        type = "document";
      }

      const thumbnailId = f.thumbnail?.id;

      return {
        id: f.id,
        name: f.original_filename,
        url: `/api/auth/download/${f.id}`, 
        thumbnail_url: thumbnailId ? `/api/auth/download-thumbnail/${f.id}` : null,
        type,
        size: f.size_bytes,
        uploadedAt: f.uploaded_at,
        deletedAt: f.updated_at,
        isDeleted: f.is_deleted
      };
    });

    // ✅ FIX: Ensure hasMore is calculated correctly
    const hasMore = offset + limit < count;
    
    console.log(`🗑️ Deleted Files Response - hasMore: ${hasMore}, Calculation: ${offset} + ${limit} < ${count} = ${hasMore}`);

    res.json({
      files: mapped,
      totalDeleted: count,
      hasMore: hasMore, // ✅ Explicitly set hasMore
    });

  } catch (err) {
    console.error("Error retrieving deleted files:", err);
    res.status(500).json({ 
      message: "An error occurred while fetching deleted files.",
      error: err.message 
    });
  }
};

export default getIsDeleted;