// ------------------ Signout ------------------
const signout = async (req, res) => {
  try {
    // Check if a session token exists and destroy the session
    if (req.session) {
      req.session = null; 
      return res.status(200).json({ 
        status: "Success",
        message: "You've been signed out!",
      });
    }

    // Handle case where no session exists (or was already cleared)
    return res.status(200).json({ 
      status: "Success",
      message: "No active session to sign out from.",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

export default signout;
