import db from "../../../models/index.js";
const { user: User } = db;

const changePassword = async (req, res) => {
  try {

const userIdFromToken = req.userId; 
const { email, newPassword } = req.body; 

    const user = await User.findOne({ 
        where: { 
            id: userIdFromToken, 
            email: email.trim() 
        } 
    });
    
    if (!user) {
      return res.status(404).json({
        status: "Error",
        message: "User not found or email mismatch.",
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      status: "Success",
      message: "Password changed successfully!",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

export default changePassword;