import transporter from "../utils/nodemailer.js";
import verifyUserHtml from "../utils/verifyUserHtml.js";

const sendInvitationEmail = async (emailDetails) => {
  try {
    const htmlContent = verifyUserHtml(emailDetails);

    const mailOptions = {
      from: `"NetDrive Support Team" <${process.env.MAIL_USER}>`,
      to: emailDetails.to_email,
      subject: "Your NetDrive Invitation is Ready!",
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Invitation email sent to ${emailDetails.to_email}`);
    console.log("Message ID:", info.messageId);

  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

export default sendInvitationEmail;
