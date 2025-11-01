import jwt from "jsonwebtoken";
import config from "../config/auth.config.js";
import db from "../models/index.js";

const User = db.user;
const Role = db.role;

// Assumed utility function to extract token from session/cookie
const getTokenFromRequest = (req) => {
  // Check for JWT in the session (common for cookie-based auth)
  if (req.session && req.session.token) {
    return req.session.token;
  }
  // Fallback for cookie-based systems
  if (req.cookies && req.cookies.accessToken) {
    return req.cookies.accessToken;
  }
  return null;
};

/**
 * Middleware to verify the JWT token and attach user ID to the request.
 */
const verifyToken = (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(403).send({
      message: "No token provided! Access denied.",
    });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized! Token is invalid or expired.",
      });
    }
    // Attach the user ID to the request object
    req.userId = decoded.id; 
    next();
  });
};

/**
 * Middleware to check if the authenticated user has the 'admin' role.
 * Requires verifyToken to run first to populate req.userId.
 */
const isAdmin = async (req, res, next) => {
  try {
    // 1. Find the user by ID
    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).send({ message: "Admin check failed: User not found." });
    }

    // 2. Get all roles associated with the user
    const roles = await user.getRoles();

    // 3. Check if any of the user's roles is 'admin'
    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === "admin") {
        next(); // User is an admin, proceed
        return;
      }
    }

    // If loop completes without finding 'admin' role
    return res.status(403).send({
      message: "Require Admin Role!",
    });
  } catch (error) {
    console.error("Error checking Admin role:", error);
    return res.status(500).send({ message: "Unable to authorize admin role." });
  }
};

const getUserById = async (req, res, next) => {
  if (!req.userId) {
    return res.status(401).send({ message: "User ID not found in request." });
  }

  try {
    // Fetch the user and include their Role and Plan if needed later
    const user = await User.findByPk(req.userId); 

    if (!user) {
        return res.status(404).send({ message: "User not found." });
    }

    // Attach the *user object* to the request for subsequent middleware/controllers
    req.user = user.get({ plain: true }); 
    next();
  } catch (dbError) {
    console.error("Database error fetching user details:", dbError);
    // If the database query fails (e.g., connection lost), this is a 500 error.
    return res.status(500).send({ message: "Could not fetch user details." });
  }
};


const authJwt = {
  verifyToken,
  isAdmin,
  getUserById
};

export default authJwt;
