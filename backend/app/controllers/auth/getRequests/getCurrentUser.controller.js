import jwt from "jsonwebtoken";
import config from "../../../config/auth.config.js";
import db from "../../../models/index.js";
import { decrypt } from "../../../utils/crypto.js";
import { prepareUserResponse } from "../../../utils/prepareUserResponse.js";

const { user: User, plan: Plan } = db;

const getCurrentUser = async (req, res) => {
  const token = req.session?.token;

  if (!token) {
    return res.status(401).json({
      status: "Error",
      message: "Unauthorized: No active session found.",
    });
  }

  try {
    const decoded = jwt.verify(token, config.secret, {
      algorithms: ["HS256"],
    });
    const userId = decoded.id;

    const user = await User.findByPk(userId, {
      include: [{ model: Plan, as: "plan" }],
    });

    if (!user) {
      if (req.session) req.session.token = null;
      return res.status(404).json({
        status: "Error",
        message: "User not found. Session cleared.",
      });
    }

    const { token: newToken, authorities, planDetails } =
      await prepareUserResponse(user);

    if (req.session) req.session.token = newToken;

    return res.status(200).json({
      status: "Success",
      message: "User session validated.",
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        picture: user.icon ? decrypt(user.icon) : null,
        roles: authorities,
        plan: planDetails,
        status: user.is_active,
      },
    });
  } catch (error) {
    console.error("Session Validation Error:", error.message);
    if (req.session) req.session.token = null;

    return res.status(401).json({
      status: "Error",
      message: "Session expired or invalid. Please log in again.",
    });
  }
};

export default getCurrentUser;
