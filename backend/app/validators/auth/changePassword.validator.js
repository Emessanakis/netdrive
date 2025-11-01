// changePassword.validator.js

const checkPasswordRequiredFields = (req, res, next) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ 
      status: "Error",
      message: "Email and new password are required.",
    });
  }

  next();
};

export default checkPasswordRequiredFields;