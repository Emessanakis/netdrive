import bcrypt from "bcryptjs";

const UserModel = (sequelize, Sequelize) => {
  const User = sequelize.define(
    "users",
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: 'unique_username',
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: 'unique_email',
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      icon: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      planId: { 
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      storage_used_bytes: {
        type: Sequelize.BIGINT,
        defaultValue: 0,
        allowNull: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      last_login: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            user.password = await bcrypt.hash(user.password, 12);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed("password")) {
            user.password = await bcrypt.hash(user.password, 12);
          }
        },
      },
    }
  );
  
  // Note: Associations (like belongsTo Plan) are defined in models/index.js

  return User;
};

export default UserModel;
