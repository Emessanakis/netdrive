// services/emailjs.service.js

import fetch from "node-fetch";

/**
 * Sends an invitation email to a new user using the EmailJS REST API.
 * * @param {object} emailDetails - Object containing necessary email template data.
 * @param {string} emailDetails.to_email - The recipient's email address.
 * @param {string} emailDetails.name - The recipient's full name.
 * @param {string} emailDetails.username - The generated username.
 * @param {string} emailDetails.temp_password - The temporary password.
 * @param {string} emailDetails.verify_url - The account verification link.
 * @returns {Promise<void>}
 */
const sendInvitationEmail = async (emailDetails) => {
    // 1. Prepare template parameters (data)
    const templateParams = {
        company_name: "NetDrive",
        company_email: "support@netdrive.com",
        year: new Date().getFullYear(),
        ...emailDetails, 
    };

    // 2. Construct the payload for the EmailJS API
    const payload = {
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_INVITE_TEMPLATE_ID, // Assuming you have a specific invite template ID
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        template_params: templateParams
    };

    // 3. Make the API request
    try {
        const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        // 4. Check for response success
        if (!response.ok) {
            // Log the error and throw a detailed message
            const errorBody = await response.text();
            console.error(`EmailJS API Error (${response.status}): ${errorBody}`);
            throw new Error(`Failed to send invitation email via EmailJS (HTTP ${response.status}).`);
        }

        // The EmailJS API usually returns a simple status, but we can consume it if needed
        console.log(`Invitation email successfully sent to ${emailDetails.to_email}`);
        
    } catch (error) {
        // Log the error for server-side monitoring
        console.error("Error sending invitation email:", error.message);
        
        // Re-throw or handle the error as needed by your application's flow
        throw error; 
    }
};

export default sendInvitationEmail; // Added default export
