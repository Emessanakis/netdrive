const AuditLogModel = (sequelize, Sequelize) => {
  const AuditLog = sequelize.define(
    "audit_logs",
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      action: {
        type: Sequelize.ENUM('file_upload', 'file_delete', 'file_share', 'user_login', 'password_change', 'subscription_change'),
        allowNull: false,
      },
      resource_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      resource_id: {
        type: Sequelize.STRING(50), // Store as string to handle both INT and UUID
        allowNull: true,
      },
      details: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      // user_id is defined via association
    },
    {
      timestamps: false,
    }
  );
  return AuditLog;
};

export default AuditLogModel;