// sendGmailApiEmail.mjs
import nodemailer from "nodemailer";
import { google } from "googleapis";
import 'dotenv/config';

const CLIENT_ID = process.env.MAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.MAIL_CLIENT_SECRET;
const REDIRECT_URI = process.env.MAIL_REDIRECT_URI;
const REFRESH_TOKEN = process.env.MAIL_REFRESH_TOKEN;
const SENDER_EMAIL = process.env.MAIL_USER; // netdrive.service@gmail.com

// 1️⃣ Setup Google OAuth2 client
const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendEmail() {
  try {
    // 2️⃣ Get access token
    const accessTokenResponse = await oAuth2Client.getAccessToken();
    const accessToken = accessTokenResponse.token;

    if (!accessToken) throw new Error("Failed to get access token");

    // 3️⃣ Create Nodemailer transporter using Gmail API (HTTPS)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: SENDER_EMAIL,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    // 4️⃣ Compose email
    const mailOptions = {
      from: `"NetDrive Test" <${SENDER_EMAIL}>`,
      to: SENDER_EMAIL, // send to yourself for testing
      subject: "Test Email via Gmail API (HTTPS)",
      text: "Hello! This email was sent via Gmail API + OAuth2 without SMTP.",
      html: "<b>Hello! This email was sent via Gmail API + OAuth2 without SMTP.</b>",
    };

    // 5️⃣ Send email
    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully! Message ID:", result.messageId);

  } catch (err) {
    console.error("Failed to send email:", err);
  }
}

// 6️⃣ Run the test
sendEmail();
