// app/controllers/auth/testMail.controller.js
import nodemailer from "nodemailer";
import { google } from "googleapis";

const CLIENT_ID = process.env.MAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.MAIL_CLIENT_SECRET;
const REDIRECT_URI = process.env.MAIL_REDIRECT_URI;
const REFRESH_TOKEN = process.env.MAIL_REFRESH_TOKEN;
const MAIL_USER = process.env.MAIL_USER;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const sendTestEmail = async (req, res) => {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: MAIL_USER,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    const mailOptions = {
      from: `"NetDrive Test" <${MAIL_USER}>`,
      to: MAIL_USER,
      subject: "Test Email from Gmail OAuth2",
      text: "Hello! This is a test email using Gmail OAuth2 and Nodemailer.",
      html: "<h1>Hello!</h1><p>This is a test email using Gmail OAuth2 and Nodemailer.</p>",
    };

    const info = await transporter.sendMail(mailOptions);
    return res.status(200).json({
      status: "Success",
      message: "Test email sent successfully",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("Error sending test email:", error);
    return res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

export default sendTestEmail;
