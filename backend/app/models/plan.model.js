const PlanModel = (sequelize, Sequelize) => {
  const Plan = sequelize.define(
    "plans",
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: 'unique_plans_name',
      },
      description: { 
        type: Sequelize.TEXT,
        allowNull: true,
      },
      storage_limit_bytes: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 10737418240, 
      },
      max_group_members: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      price_per_month_usd: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
    },
    {
      timestamps: true,
      createdAt: "createdDate",
      updatedAt: "updatedDate",
    }
  );

  return Plan;
};

export default PlanModel;
