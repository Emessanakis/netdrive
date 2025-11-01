// ------------------ Signin Validation ------------------
const checkRequiredFields = (req, res, next) => {
  const { username, password } = req.body;

  if (!username && !password) {
    return res.status(400).json({
      status: "Error",
      message: "Username and Password is required for signin.",
    });
  }

  if (!username) {
    return res.status(400).json({
      status: "Error",
      message: "Username is required for signin.",
    });
  }
  
  if (!password) {
    return res.status(400).json({
      status: "Error",
      message: "Password is required for signin.",
    });
  }


  next();
};

export default checkRequiredFields;
