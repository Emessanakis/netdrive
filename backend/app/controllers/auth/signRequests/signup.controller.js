import db from "../../../models/index.js";
import { initDefaultUserFolders } from "../../../utils/folderInit.js";

const { user: User, role: Role, plan: Plan } = db;

const signup = async (req, res) => {
  try {
    const { username, email, password, name, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        status: "Error",
        message: "Authentication Error: Username, email, and password are required",
      });
    }

    // Create user
    const user = await User.create({
      username: username.trim(),
      email: email.trim(),
      password: password.trim(), 
      name: name?.trim() || null,
      icon: null,
      status: 1, 
      planId: 1, 
    });

    // Assign role
    const requestedRole = (role || "user").toLowerCase();
    const roleObj = await Role.findOne({ where: { name: requestedRole } });
    if (roleObj) {
      await user.setRoles([roleObj]);
      // Update the user's roleId in the user record
      await user.update({ roleId: roleObj.id }); 
    } else {
      const defaultRole = await Role.findOne({ where: { name: "user" } });
      if (defaultRole) {
        await user.setRoles([defaultRole]);
        await user.update({ roleId: defaultRole.id }); 
      }
    }

    // Initialize default folders for this user
    await initDefaultUserFolders(user.id, user.username);

    // Fetch the plan details to include in the response (default is planId 1)
    const userPlan = await Plan.findByPk(user.planId);

    // Success response
    return res.status(201).json({ 
      status: "Success",
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: "ROLE_" + requestedRole.toUpperCase(),
        picture: null,
        planId: user.planId,
        planName: userPlan ? userPlan.name : 'default',
        status: user.status, 
      },
    });
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      if (error.name === 'SequelizeUniqueConstraintError' || error.name === 'SequelizeValidationError') {
        const field = error.errors[0]?.path || 'field';
        const message = `Registration failed: ${field} is already in use or invalid.`;
        return res.status(409).json({ status: "Error", message });
      }
      return res.status(500).json({ status: "Error", message: error.message });
    }
  }
};

export default signup;
