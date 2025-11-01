import authControllers from "../controllers/auth/index.js";  // all controllers
import authMiddlewares from "../middleware/index.js";        // all middleware
import authValidators from "../validators/auth/index.js";    // all validators

// ---------------- Destructure controllers ----------------
const { 
  getFiles, getFile, signup, signin, signout, downloadFile, changePassword, getCurrentUser, getPlans, getRoles,
  uploadFiles, redirectToGoogleOAuth, handleGoogleOAuthCallback, inviteUser , downloadThumbnail, 
  getStorageStats, getIsDeleted, permanentDeleteMultiple, permanentDelete, restoreFile, restoreMultipleFiles,
  softDeleteFile, softDeleteMultipleFiles, toggleFavorite, setMultipleFavorites, getFavoriteFiles
} = authControllers;

// ---------------- Destructure middlewares ----------------
const { verifyToken, isAdmin, getUserById, validate, uploadMulter } = authMiddlewares;

// ---------------- Destructure validators ----------------
const { 
  checkDuplicateEmail, checkPlanExisted, 
  checkDuplicateUsernameOrEmail, checkRolesExisted, 
  checkPasswordRequiredFields, checkRequiredFields 
} = authValidators;

// ---------------- Auth routes ----------------
const authRoutes = (router) => {
  // CORS headers for all requests
  router.use((req, res, next) => {
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
    next();
  });

    // ---------------- SignUp ----------------
    router.post(
      "/api/auth/signup",
      [checkDuplicateUsernameOrEmail, checkRolesExisted],
      signup
    );  
    // ---------------- SignIn ----------------
    router.post("/api/auth/signin", signin);

    // ---------------- Signout ----------------
    router.post("/api/auth/signout", [verifyToken], signout);

    // ---------------- Change Password ----------------
    router.put(
      "/api/auth/change-password",
      [verifyToken, checkPasswordRequiredFields],
      changePassword
    );  
    // ---------------- Get Storage Data files ----------------
    router.get("/api/auth/user/storage-stats", [verifyToken, getUserById], getStorageStats);

    // ---------------- Current User ----------------
    router.get("/api/auth/me", [verifyToken], getCurrentUser);

    // ---------------- Get Plans ----------------
    router.get("/api/auth/getPlans", [verifyToken], getPlans);

    // ---------------- Get Roles ----------------
    router.get("/api/auth/getRoles", [verifyToken], getRoles);

    // ---------------- Mail OAuth ----------------
    router.get("/api/oauth", redirectToGoogleOAuth);
    router.get("/api/oauth/callback", handleGoogleOAuthCallback);

    // ---------------- Get files ----------------
    router.get("/api/auth/getfiles", [verifyToken, getUserById], getFiles);
  // ---------------- Get single file (useful after upload to reconcile thumbnail_id) ----------------
  router.get("/api/auth/get-file/:id", [verifyToken, getUserById], getFile);

    // ---------------- Get deleted files ----------------
    router.get("/api/auth/get-deleted-files", [verifyToken, getUserById], getIsDeleted);

    // ---------------- Download files ----------------
    router.get("/api/auth/download/:id", [verifyToken, getUserById], downloadFile); 
    
    // --- NEW: Download Thumbnail ---
      router.get("/api/auth/download-thumbnail/:id", [verifyToken, getUserById], downloadThumbnail);

      // Alias route for legacy client paths or simple file access. This will stream the thumbnail
      // and uses the same controller so authentication is enforced via cookie (verifyToken).
      router.get("/api/auth/file/:id", [verifyToken, getUserById], downloadThumbnail);

    // ---------------- Upload files ----------------
    router.post(
      "/api/auth/upload",
      [verifyToken, getUserById, uploadMulter().array("files")],
      uploadFiles
    );  

    // ---------------- Invite User (Admin Only) ----------------
    router.post(
      "/api/admin/users/invite",
      [verifyToken, isAdmin, checkDuplicateEmail, checkPlanExisted],
      inviteUser
    );

    // ---------------- Soft Delete files (Move to Recycle Bin) ----------------
    router.delete(
      "/api/auth/delete/:id",
      [verifyToken, getUserById],
      softDeleteFile
    );

    router.post(
      "/api/auth/delete-multiple",
      [verifyToken, getUserById],
      softDeleteMultipleFiles
    );

    // ---------------- Permanent Delete files ----------------
    router.delete(
    "/api/auth/permanent-delete/:id",
    [verifyToken, getUserById],
    permanentDelete
    );

    // ---------------- Restore soft-deleted files ----------------
    router.put(
      "/api/auth/restore/:id",
      [verifyToken, getUserById],
      restoreFile
    );

    router.put(
      "/api/auth/restore-multiple",
      [verifyToken, getUserById],
      restoreMultipleFiles
    );

    router.post(
    "/api/auth/permanent-delete-multiple",
    [verifyToken, getUserById],
    permanentDeleteMultiple
    );

    // ---------------- Favorite files ----------------
    router.put(
      "/api/auth/favorite/:id",
      [verifyToken, getUserById],
      toggleFavorite
    );

    router.post(
      "/api/auth/favorite-multiple",
      [verifyToken, getUserById],
      setMultipleFavorites
    );

    router.get(
      "/api/auth/favorite-files",
      [verifyToken, getUserById],
      getFavoriteFiles
    );
};

export default authRoutes;
