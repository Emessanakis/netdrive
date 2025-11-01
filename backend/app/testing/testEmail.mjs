import 'dotenv/config';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';

const CLIENT_ID = process.env.MAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.MAIL_CLIENT_SECRET;
const REDIRECT_URI = process.env.MAIL_REDIRECT_URI;
const REFRESH_TOKEN = process.env.MAIL_REFRESH_TOKEN;
const MAIL_USER = process.env.MAIL_USER;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function testEmail() {
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

    const info = await transporter.sendMail({
      from: `"NetDrive Test" <${MAIL_USER}>`,
      to: MAIL_USER, // send to yourself for testing
      subject: "Test Email from NetDrive",
      text: "This is a test email sent via Gmail OAuth2.",
    });

    console.log("Email sent successfully! Message ID:", info.messageId);

  } catch (err) {
    console.error("Email sending failed:", err);
  }
}

testEmail();
