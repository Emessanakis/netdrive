const RoleModel = (sequelize, Sequelize) => {
  const Role = sequelize.define(
    "roles",
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: 'unique_roles_name',
      },
      description: {
        type: Sequelize.STRING(255),
      },
    },
    {
      timestamps: true,
      createdAt: "createdDate",
      updatedAt: "updatedDate",
    }
  );

  return Role;
};

export default RoleModel;
