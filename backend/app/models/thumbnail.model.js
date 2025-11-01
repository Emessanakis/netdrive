// backend/models/thumbnail.model.js

const ThumbnailModel = (sequelize, Sequelize) => {
  const Thumbnail = sequelize.define(
    "thumbnails",
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      // Link back to the original file (One-to-One)
      file_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true, // Enforce one-to-one relationship
        references: {
          model: 'files',
          key: 'id'
        }
      },
      // --- Storage and Security fields ---
      storage_filename: {
        type: Sequelize.STRING(255),
        unique: 'unique_thumbnails_storage_filename',
        allowNull: false,
      },
      iv: {
        // IV for AES-256-GCM, stored as a hex string
        type: Sequelize.STRING(64), 
        allowNull: false,
      },
      auth_tag: {
        // Auth Tag for AES-256-GCM, stored as a hex string
        type: Sequelize.STRING(64), 
        allowNull: false,
      },
      // --- Metadata fields ---
      mime_type: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: 'image/png',
      },
      size_bytes: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      ownerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      folder_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'folders',
          key: 'id'
        }
      },
    },
    {
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
    }
  );

  return Thumbnail;
};

export default ThumbnailModel;