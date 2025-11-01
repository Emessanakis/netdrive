const FolderModel = (sequelize, Sequelize) => {
  const Folder = sequelize.define(
    "folders",
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        // plaintext folder name for easy querying
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      owner_user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      parent_folder_id: {
        type: Sequelize.UUID,
        allowNull: true, // null for root folders like photos, videos, thumbnails
      },
      // Optional: you can still encrypt folder metadata if desired
      iv: {
        type: Sequelize.STRING(64),
        allowNull: true,
      },
      auth_tag: {
        type: Sequelize.STRING(64),
        allowNull: true,
      },
      folder_type: {
        type: Sequelize.ENUM('photos','videos','thumbnails','files'),
        allowNull: false,
      }
    },
    {
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
    }
  );

  // Associations
  Folder.associate = (models) => {
    Folder.belongsTo(models.User, { foreignKey: "owner_user_id" });
    Folder.hasMany(models.File, { foreignKey: "folder_id" });
    Folder.hasMany(Folder, { foreignKey: "parent_folder_id", as: "subfolders" });
  };

  return Folder;
};

export default FolderModel;
