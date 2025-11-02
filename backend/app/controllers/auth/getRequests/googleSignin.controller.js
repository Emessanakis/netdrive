import jwt from "jsonwebtoken";
import config from "../../../config/auth.config.js";
import db from "../../../models/index.js";
import { encrypt, decrypt } from "../../../utils/crypto.js";
import axios from "axios";
import qs from "qs";

const { user: User, role: Role, plan: Plan, file: File } = db;

const googleSignin = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(404).json({
      status: "Error",
      message: "Google authentication failed: no code received",
    });
  }

  try {
    // Step 1: Exchange code for tokens
    const tokenResponse = await axios.post(
      process.env.GOOGLE_TOKEN_URL,
      qs.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    const accessToken = tokenResponse.data.access_token;

    // Step 2: Fetch user info
    const userInfoResponse = await axios.get(process.env.GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const userInfo = userInfoResponse.data;

    // Step 3: Find or create user
    let user = await User.findOne({
      where: { email: userInfo.email },
      include: [{ model: Role }, { model: Plan, as: "plan" }]
    });

    if (!user) {
      user = await User.create({
        username: userInfo.email.split("@")[0],
        email: userInfo.email,
        password: "google_oauth_no_password",
        name: userInfo.name,
        icon: encrypt(userInfo.picture),
      });

      const defaultRole = await Role.findOne({ where: { name: "user" } });
      if (defaultRole) await user.setRoles([defaultRole]);

      user = await User.findByPk(user.id, {
        include: [{ model: Role }, { model: Plan, as: "plan" }]
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        status: "Error",
        message: "Account is deactivated. Please contact support.",
        requiresActivation: true, 
      });
    }

    const currentIcon = user.icon ? decrypt(user.icon) : null;
    if (!currentIcon || currentIcon !== userInfo.picture) {
      user.icon = encrypt(userInfo.picture);
      await user.save();
    }

    const roles = await user.getRoles();
    const authorities = roles.map(role => "ROLE_" + role.name.toUpperCase());

    const token = jwt.sign({ id: user.id, role: authorities[0] }, config.secret, {
      algorithm: "HS256",
      expiresIn: 86400,
    });

    if (req.session) req.session.token = token;

    // Fetch Plan Storage Limit
    const storageLimitBytes = user.plan?.storage_limit_bytes || 0;

    // Fetch Current Usage from files table
    const currentUsageBytes = await File.sum("size_bytes", {
      where: { ownerId: user.id }
    }) || 0;

    return res.status(200).json({
      status: "Success",
      message: "User authenticated successfully via Google OAuth2",
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        picture: decrypt(user.icon),
        roles: authorities,
        plan: user.plan ? { id: user.plan.id, name: user.plan.name } : null,
        status: user.is_active,
        storageLimitBytes,
        currentUsageBytes,
      },
    });

  } catch (error) {
    console.error("Google Signin Callback Error:", error);
    if (!res.headersSent) {
      return res.status(500).json({ status: "Error", message: "Google signin failed due to server error." });
    }
  }
};

export default googleSignin;
