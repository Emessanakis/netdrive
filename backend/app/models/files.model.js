const FileModel = (sequelize, Sequelize) => {
  const File = sequelize.define(
    "files",
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      original_filename: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      storage_filename: {
        type: Sequelize.STRING(255),
        unique: 'unique_files_storage_filename',
        allowNull: false,
      },
      iv: {
        // IV for AES-256-GCM, stored as a hex string (16 bytes = 32 hex chars)
        type: Sequelize.STRING(64), 
        allowNull: false,
      },
      auth_tag: {
        // ADDED: AUTH TAG for AES-256-GCM, stored as a hex string (16 bytes = 32 hex chars)
        type: Sequelize.STRING(64), 
        allowNull: false, 
      },
      // ------------------------------------------------
      mime_type: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      file_type: {
        type: Sequelize.ENUM('image', 'video', 'document', 'other'),
        allowNull: false,
      },
      size_bytes: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      is_favorite: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_hidden: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_deleted: { // Soft delete
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      uploaded_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      last_accessed: {
        type: Sequelize.DATE,
      },
      last_updated_user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      thumbnail_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'thumbnails',  // <--- CORRECTED: Reference the 'thumbnails' table
          key: 'id'
        }
      }
      // owner_user_id, parent_folder_id, group_id are defined via associations
    },
    {
      timestamps: true,
      updatedAt: 'updated_at',
      createdAt: 'uploaded_at',
    }
  );

  return File;
};

export default FileModel;