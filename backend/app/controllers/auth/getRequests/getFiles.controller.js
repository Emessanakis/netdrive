import db from "../../../models/index.js";

const { file: File, thumbnail: Thumbnail } = db;

const getFiles = async (req, res) => {
  try {
    const files = await File.findAll({
      where: { ownerId: req.user.id, is_deleted: false },
      order: [["uploaded_at", "DESC"]],
      attributes: [
        "id",
        "original_filename",
        "mime_type",
        "size_bytes",
        "uploaded_at",
        "is_favorite"
      ],
      include: [
        {
          model: Thumbnail,
          as: 'thumbnail',
          attributes: ['id', 'mime_type'],
          required: false
        }
      ]
    });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const start = (page - 1) * limit;
    const paginated = files.slice(start, start + limit);

    const mapped = paginated.map(f => {
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

    res.json({
      files: mapped,
      hasMore: start + limit < files.length,
    });

  } catch (err) {
    console.error("Error retrieving files:", err);
    res.status(500).json({ message: "An error occurred while fetching files." });
  }
};

export default getFiles;