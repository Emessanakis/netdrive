const GroupModel = (sequelize, Sequelize) => {
  const Group = sequelize.define(
    "groups",
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      // owner_user_id will be defined via association
    },
    {
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false, // Groups typically don't need an updated_at time
    }
  );
  return Group;
};

export default GroupModel;