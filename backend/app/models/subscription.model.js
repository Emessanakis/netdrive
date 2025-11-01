const SubscriptionModel = (sequelize, Sequelize) => {
  const Subscription = sequelize.define(
    "subscriptions",
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      external_sub_id: {
        type: Sequelize.STRING(255),
        unique: 'unique_subscriptions_external_sub_id',
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('active', 'canceled', 'trialing', 'past_due'),
        allowNull: false,
      },
      started_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      // user_id, plan_id are defined via associations
    },
    {
      timestamps: false,
    }
  );
  return Subscription;
};

export default SubscriptionModel;