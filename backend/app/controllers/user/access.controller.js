// Helper function from original user.controller.js
const sendContent = (content) => (req, res) => {
  const user = req.user || {}; 
  res.status(200).send({
    message: content,
    user: {
      id: user.id,
      username: user.username,
      roles: user.roles,
    },
  });
};

// ESM exports for role-based access testing
const allAccess = sendContent("Public Content.");
const userBoard = sendContent("User Content.");
const adminBoard = sendContent("Admin Content.");
const moderatorBoard = sendContent("Moderator Content.");

export default { allAccess, userBoard, adminBoard, moderatorBoard };

