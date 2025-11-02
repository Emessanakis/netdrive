import jwt from "jsonwebtoken";
import config from "../../../config/auth.config.js";
import db from "../../../models/index.js";
import { encrypt, decrypt } from "../../../utils/crypto.js";
import bcrypt from "bcryptjs";
import axios from "axios";
import qs from "qs";
import { OAuth2Client } from "google-auth-library";
import { prepareUserResponse } from "../../../utils/prepareUserResponse.js";

const { user: User, plan: Plan, file: File, Sequelize } = db;
const Op = Sequelize.Op;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const GOOGLE_TOKEN_URL = process.env.GOOGLE_TOKEN_URL;
const GOOGLE_USERINFO_URL = process.env.GOOGLE_USERINFO_URL;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const signin = async (req, res) => {
  try {
    // ------------------ Google login ------------------
    if (req.body.code || req.body.credential) {
      let payload;

      if (req.body.code) {
        const tokenResponse = await axios.post(
          GOOGLE_TOKEN_URL,
          qs.stringify({
            code: req.body.code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: GOOGLE_REDIRECT_URI,
            grant_type: "authorization_code",
          }),
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        const accessToken = tokenResponse.data.access_token;

        const userInfoResponse = await axios.get(GOOGLE_USERINFO_URL, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        payload = userInfoResponse.data;
      } else if (req.body.credential) {
        const ticket = await client.verifyIdToken({
          idToken: req.body.credential,
          audience: GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
      }

      if (!payload?.email) {
        return res
          .status(400)
          .json({ status: "Error", message: "Google email not found." });
      }

      const user = await User.findOne({
        where: { email: payload.email },
        include: [{ model: Plan, as: "plan" }],
      });

      if (!user) {
        return res.status(404).json({
          status: "Error",
          message: "User not found. Please register first.",
        });
      }

      if (!user.is_active) {
        return res.status(403).json({
          status: "Error",
          message: "Account is deactivated. Please contact support.",
        });
      }

      const currentIcon = user.icon ? decrypt(user.icon) : null;
      if (!currentIcon || currentIcon !== payload.picture) {
        user.icon = encrypt(payload.picture);
      }

      user.last_login = new Date();
      await user.save();

      const { token, authorities, planDetails } = await prepareUserResponse(user);
      if (req.session) req.session.token = token;

      return res.status(200).json({
        status: "Success",
        message: "User authenticated via Google",
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          picture: decrypt(user.icon),
          roles: authorities,
          plan: planDetails,
          status: user.is_active,
        },
      });
    }

    // ------------------ Normal login ------------------
    const username = req.body.username?.trim();
    const password = req.body.password?.trim();

    if (!username || !password) {
      return res.status(400).json({
        status: "Error",
        message: "Username and password are required",
      });
    }

    const user = await User.findOne({
      where: { [Op.or]: [{ username }, { email: username }] },
      include: [{ model: Plan, as: "plan" }],
    });

    if (!user)
      return res
        .status(404)
        .json({ status: "Error", message: "User is not registered" });
    if (!user.is_active)
      return res
        .status(403)
        .json({ status: "Error", message: "Account is deactivated." });

    const passwordIsValid = await bcrypt.compare(password, user.password);
    if (!passwordIsValid)
      return res
        .status(401)
        .json({ status: "Error", message: "Invalid password" });

    user.last_login = new Date();
    await user.save();

    const { token, authorities, planDetails } = await prepareUserResponse(user);
    if (req.session) req.session.token = token;

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
        status: user.is_active,
      },
    });
  } catch (error) {
    console.error("Signin error:", error);
    if (!res.headersSent)
      return res
        .status(500)
        .json({ status: "Error", message: error.message });
  }
};

export default signin;
