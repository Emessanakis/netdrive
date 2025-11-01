// app/controllers/mailOauth.controller.js
import { google } from "googleapis";

const CLIENT_ID = process.env.MAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.MAIL_CLIENT_SECRET;
const REDIRECT_URI = process.env.MAIL_REDIRECT_URI; // e.g., https://emessanakis.gr/api/mail/oauth/callback

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

/**
 * Step 1: Redirect user/admin to Google OAuth consent page
 */
 const redirectToGoogleOAuth = (req, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline", // ensures refresh token is returned
    scope: [
      "https://www.googleapis.com/auth/gmail.send" // or "https://mail.google.com" for full SMTP
    ],
    prompt: "consent", // forces refresh token issuance
  });

  return res.redirect(authUrl);
};

/**
 * Step 2: Handle OAuth callback and exchange code for tokens
 */
 const handleGoogleOAuthCallback = async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) {
      return res.status(400).json({ status: "Error", message: "Authorization code is missing." });
    }

    const { tokens } = await oAuth2Client.getToken(code);

    // tokens contain: access_token, refresh_token, expiry_date
    console.log("OAuth Tokens:", tokens);

    // You can save the refresh_token securely in your database or .env
    // Only the refresh_token is needed for long-term email sending
    if (!tokens.refresh_token) {
      return res.status(400).json({
        status: "Error",
        message: "No refresh token received. Make sure prompt=consent is set."
      });
    }

    return res.status(200).json({
      status: "Success",
      message: "OAuth2 setup complete. Refresh token obtained.",
      refresh_token: tokens.refresh_token
    });
  } catch (error) {
    console.error("Google OAuth Callback Error:", error);
    return res.status(500).json({ status: "Error", message: error.message });
  }
};


const mailOauthControllers = {
  redirectToGoogleOAuth,
  handleGoogleOAuthCallback,
};

export default mailOauthControllers;
