const FileShareModel = (sequelize, Sequelize) => {
  const FileShare = sequelize.define(
    "file_shares",
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      permissions: {
        type: Sequelize.ENUM('view', 'download', 'edit'),
        allowNull: false,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      // file_id, shared_with_user_id, shared_with_group_id are defined via associations
    },
    {
      timestamps: false,
    }
  );
  return FileShare;
};

export default FileShareModel;