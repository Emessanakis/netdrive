const GroupMembershipModel = (sequelize, Sequelize) => {
  const GroupMembership = sequelize.define(
    "group_memberships",
    {
      role: {
        type: Sequelize.ENUM('owner', 'admin', 'member'),
        allowNull: false,
        defaultValue: 'member',
      },
      joined_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      // group_id and user_id are defined by the associations in index.js
    },
    {
      timestamps: false,
    }
  );
  return GroupMembership;
};

export default GroupMembershipModel;