import fetch from "node-fetch";

/**
 * Sends an invitation email to a new user using the EmailJS Secure REST API endpoint.
 * CRITICAL: This method uses the Private API Key for server-side authentication, 
 * which is required when making API calls from Node.js (non-browser) applications.
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

    // 2. Extract necessary environment variables and validate
    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_INVITE_TEMPLATE_ID;
    // CRITICAL: We now require the PRIVATE key for server-side security
    const privateKey = process.env.EMAILJS_PRIVATE_KEY; 
    
    // NOTE: The Public Key (User ID) is no longer required in the payload, 
    // but the Private Key must be present in the headers.

    if (!serviceId || !templateId || !privateKey) {
        // Log an error and throw
        const missing = [];
        if (!serviceId) missing.push("EMAILJS_SERVICE_ID");
        if (!templateId) missing.push("EMAILJS_INVITE_TEMPLATE_ID");
        // Update the missing key reference
        if (!privateKey) missing.push("EMAILJS_PRIVATE_KEY (Private Key)"); 
        
        const error = new Error(`Missing required EmailJS environment variables: ${missing.join(', ')}. Please check your .env file.`);
        console.error("EmailJS Configuration Error:", error.message);
        throw error;
    }

    // 3. Construct the payload for the EmailJS API (using the template and service IDs)
    const payload = {
        service_id: serviceId,
        template_id: templateId,
        template_params: templateParams
    };

    // 4. Make the SECURE API request
    try {
        const response = await fetch("https://api.emailjs.com/api/v1.0/email/send-secure", { // CRITICAL: Use the secure endpoint
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                // CRITICAL: Pass the Private Key in the Authorization header
                "Authorization": `Bearer ${privateKey}` 
            },
            body: JSON.stringify(payload)
        });

        // 5. Check for response success
        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`EmailJS API Error (${response.status}): ${errorBody}`);
            // Re-throw a standardized error message that the controller can catch
            throw new Error(`Failed to send invitation email via EmailJS (HTTP ${response.status}). EmailJS Response: ${errorBody}`);
        }

        console.log(`Invitation email successfully sent to ${emailDetails.to_email}.`);
        
    } catch (error) {
        // Log the full error object for server-side monitoring
        console.error("Error sending invitation email:", error.message);
        
        // Ensure a string message is always thrown
        const errorMessage = error.message || JSON.stringify(error) || "An unknown error occurred during email transmission.";
        throw new Error(`Email sending failed: ${errorMessage}`);
    }
};

export default sendInvitationEmail;
