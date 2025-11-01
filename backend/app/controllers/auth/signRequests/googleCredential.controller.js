import db from "../../../models/index.js";

const { user: User, plan: Plan, file: File, Sequelize } = db;

import jwt from "jsonwebtoken";
import config from "../../../config/auth.config.js";
import { encrypt, decrypt } from "../../../utils/crypto.js";
import { OAuth2Client } from "google-auth-library";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);


const googleCredentialLogin = async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ status: "Error", message: "Google ID token is required" });
  }

  try {
    // 1. Verify the ID Token with Google
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    // 2. Find the user in the database, eagerly loading the associated Plan
    let user = await User.findOne({ 
      where: { email: payload.email },
      include: [
        { model: Plan, as: 'plan' } // Eagerly load the Plan model
      ]
    });

    if (!user) {
      // If user doesn't exist, registration logic (optional, based on app rules)
      return res.status(404).json({ status: "Error", message: "User not found. Please register first." });
    }

    // 3. CRITICAL: Check for Pending Activation Status
    if (!user.is_active) {
      return res.status(403).json({
        status: "Error",
        message: "Account is deactivated. Please contact support.",
        requiresActivation: true,
      });
    }

    // 4. Generate JWT
    const token = jwt.sign({ id: user.id }, config.secret, { 
      algorithm: "HS256", 
      expiresIn: 86400
    });
    
    // Store the JWT in the session, which will be sent as a cookie to the client
    if (req.session) req.session.token = token;

    // 5. Get user roles
    const roles = await user.getRoles();
    const authorities = roles.map(role => "ROLE_" + role.name.toUpperCase());

    // 6. Prepare plan details for the response
    const currentUsageBytes = await File.sum("size_bytes", {
      where: { ownerId: user.id }
    }) || 0;

    const planDetails = user.plan
      ? {
          id: user.plan.id,
          name: user.plan.name,
          storageLimitBytes: user.plan.storage_limit_bytes,
          currentUsageBytes: currentUsageBytes,
        }
      : null;

    return res.status(200).json({
      status: "Success",
      message: "User authenticated successfully",
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        picture: user.icon ? decrypt(user.icon) : null,
        roles: authorities,
        plan: planDetails,
        status: user.is_active
      },
    });

  } catch (error) {
    console.error("Google Credential Login Error:", error.message);

    // Handle specific verification errors vs. general server errors
    if (error.code === 'ERR_INVALID_ARG_VALUE' || error.message.includes('Invalid token')) {
      return res.status(401).json({ status: "Error", message: "Invalid Google credential." });
    }
    return res.status(500).json({ status: "Error", message: "Internal server error during Google login." });
  }
};

export default googleCredentialLogin;