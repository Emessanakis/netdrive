/**
 * Returns the HTML content for the verification email.
 * @param {object} emailDetails - { name, username, temp_password, verify_url, company_name, year }
 * @returns {string} HTML content
 */

const verifyUserHtml = (emailDetails) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <title>Welcome Invitation</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f7; padding: 20px; }
        .container { background-color: #ffffff; border-radius: 8px; padding: 25px; max-width: 600px; margin: auto; box-shadow: 0 2px 6px rgba(0,0,0,0.1);}
        .header { font-size: 22px; font-weight: bold; margin: 10px 0 20px 0; color: #333333; text-align: left; }
        .content { font-size: 14px; line-height: 1.6; color: #555555; }
        .credentials { background: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 6px; padding: 15px; margin: 15px 0; font-family: monospace; }
        .button { display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #4f46e5; color: #ffffff; border-radius: 6px; text-decoration: none; font-weight: bold; }
        .footer { margin-top: 25px; font-size: 12px; color: #999999; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div style="text-align: left; margin-bottom: 10px;">
            <img src="https://emessanakis.gr/assets/database-B7vf6uvA.png" alt="Company Logo" style="max-width: 50px; display: inline-block;" />
        </div>
        <div class="header">Welcome to ${emailDetails.company_name}</div>
        <div class="content">
            <p>Hello <strong>${emailDetails.name}</strong>,</p>
            <p>We’re excited to have you on board! Below are your login credentials:</p>
            <div class="credentials">
                Username: <strong>${emailDetails.username}</strong><br />
                Temporary Password: <strong>${emailDetails.temp_password}</strong>
            </div>
            <p>In order to complete your account registration, you need to verify your account. Please click the button below:</p>
            <a href="${emailDetails.verify_url}" class="button">Verify Account</a>
            <p>If you didn’t request this account, please ignore this email.</p>
        </div>
        <div class="footer">&copy; ${emailDetails.year} ${emailDetails.company_name}. All rights reserved.</div>
    </div>
</body>
</html>
`;

export default verifyUserHtml;
