import db from "../../../models/index.js";

const { file: File, thumbnail: Thumbnail } = db;

const getFile = async (req, res) => {
  try {
    const fileId = req.params.id;

    const f = await File.findOne({
      where: { id: fileId, ownerId: req.user.id, is_deleted: false },
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
          attributes: ['id', 'mime_type', 'storage_filename'],
          required: false
        }
      ]
    });

    if (!f) return res.status(404).json({ message: 'File not found.' });

    let type = 'other';
    if (f.mime_type && f.mime_type.startsWith('image/')) type = 'image';
    else if (f.mime_type && f.mime_type.startsWith('video/')) type = 'video';

    const thumbnailId = f.thumbnail?.id || null;

    const mapped = {
      id: f.id,
      name: f.original_filename,
      url: `/api/auth/download/${f.id}`,
      thumbnail_id: thumbnailId,
      // Keep backward-compatible thumbnail_url (file-based endpoint)
      thumbnail_url: thumbnailId ? `/api/auth/download-thumbnail/${f.id}` : null,
      type,
      size: f.size_bytes,
      uploadedAt: f.uploaded_at,
      is_favorite: f.is_favorite
    };

    res.json({ file: mapped });
  } catch (err) {
    console.error('Error in getFile:', err);
    res.status(500).json({ message: 'An error occurred while fetching the file.' });
  }
};

export default getFile;
