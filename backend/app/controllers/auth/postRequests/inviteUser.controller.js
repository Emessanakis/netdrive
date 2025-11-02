import db from "../../../models/index.js";
import crypto from "crypto";
import sendInvitationEmail from "../../../services/email.service.js"; 

const { user: User, role: Role, plan: Plan } = db;

/**
 * Controller to invite a new user (Admin Only).
 * This function handles user creation and invitation in a transactionally safe manner:
 * 1. Generates temporary credentials and the activation link.
 * 2. Attempts to send the invitation email.
 * 3. ONLY if the email is successfully sent, the user record is created in the database.
 * * Pre-requisites: authJwt.verifyToken, authJwt.isAdmin, checkDuplicateEmail, checkPlanExisted
 */
const inviteUser = async (req, res) => {
  try {
    const { email, name, planId, roleId } = req.body;

    // --- 1. Generate Temporary Credentials & Username ---
    const tempPassword = crypto.randomBytes(12).toString('hex');
    
    // Simple username generation: use email prefix + a short random suffix for uniqueness
    const usernamePrefix = email.split('@')[0];
    const uniqueSuffix = crypto.randomBytes(2).toString('hex');
    const username = `${usernamePrefix}_${uniqueSuffix}`.substring(0, 50); 

    // --- 2. Prepare Email Details & Activation Link ---
    const activationPath = `/auth/activate?email=${encodeURIComponent(email)}&temp=${tempPassword}`;
    const frontendUrl = process.env.FRONTEND_URL;

    const emailDetails = {
        to_email: email, 
        name: name || username,
        username: username,
        temp_password: tempPassword,
        verify_url: `${frontendUrl}${activationPath}`,
        company_name: 'NetDrive',
        year: new Date().getFullYear(),
    };

    // --- 3. Send Invitation Email (CRITICAL: Attempt this FIRST) ---
    await sendInvitationEmail(emailDetails);
    
    // If the email fails, 'sendInvitationEmail' will throw an error, aborting this block.
    // try {
    //   const res = await fetch('/api/admin/users/invite', { ... });
    //   if (!res.ok) throw new Error(`Server responded with status ${res.status}`);
    //   const data = await res.json();
    // } catch(err) {
    //   console.error("Invite user failed:", err);
    // }


    // --- 4. Create User Record (ONLY if email send was successful) ---
    // Status: -1 (Pending Invitation/Activation)
    const newUser = await User.create({
      username: username,
      email: email,
      password: tempPassword,
      name: name || username,
      icon: null,
      planId: planId,
      status: -1, 
    });

    // Set Role 
    await newUser.setRoles([roleId]); 

    // --- 5. Success Response ---
    // Fetch final role name and plan name for the response
    const [finalRole] = await newUser.getRoles();
    const finalPlan = await Plan.findByPk(newUser.planId);

    return res.status(201).json({
      status: "Success",
      message: `User '${newUser.username}' invited successfully. Invitation email sent.`,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        role: "ROLE_" + (finalRole?.name || 'user').toUpperCase(),
        planName: finalPlan ? finalPlan.name : 'default',
        status: newUser.status,
      },
    });

  } catch (error) {
    // Log the full error object for better debugging, which helps troubleshoot the 'undefined' error
    console.error("Admin Invite User Error:", error); 
    
    // Construct a meaningful message
    const errorMessage = error.message || "An unknown server error occurred.";

    if (!res.headersSent) {
      // The user account was NOT created because the error (likely from email service) occurred first.
      return res.status(500).json({
        status: "Error",
        message: `User invitation failed. The user record was NOT created. Reason: ${errorMessage}`,
      });
    }
  }
};

export default inviteUser;
