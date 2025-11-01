import authJwt from "./authJwt.js";
import validate from "./validate.js";
import uploadMulter from "./upload.middleware.js";

// Destructure functions from default exports
const { verifyToken, isAdmin, getUserById } = authJwt;

export default { verifyToken, isAdmin, getUserById, validate, uploadMulter };