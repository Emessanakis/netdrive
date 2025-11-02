// GET request controllers
import getFiles from "./getRequests/getFiles.controller.js";
import getFile from "./getRequests/getFile.controller.js";
import getCurrentUser from "./getRequests/getCurrentUser.controller.js";
import getPlans from "./getRequests/getPlans.controller.js";
import getRoles from "./getRequests/getRoles.controller.js";
import downloadFile from "./getRequests/downloadFile.controller.js";
import downloadThumbnail from "./getRequests/downloadThumbnail.controller.js";
import getStorageStats from "./getRequests/getStorageStats.controller.js";
import getIsDeleted from "./getRequests/getIsDeleted.js";
import googleSignin from "./getRequests/googleSignin.controller.js";
import googleCredential from "./getRequests/googleCredential.controller.js";
import mailOauthControllers from "./getRequests/mailOauth.controller.js";
import favoriteControllers from "./getRequests/getFavoriteFiles.controller.js";

// POST request controllers
import signup from "./postRequests/signup.controller.js";
import signin from "./postRequests/signin.controller.js";
import signout from "./postRequests/signout.controller.js";
import inviteUser from "./postRequests/inviteUser.controller.js";
import uploadFilesControllers from "./postRequests/upload.controller.js";
import softDeleteControllers from "./postRequests/softDelete.controller.js";

// PUT request controllers
import changePassword from "./putRequests/changePassword.controller.js";
import restoreControllers from "./putRequests/restoreFile.controller.js";
import toggleFavoriteControllers from "./putRequests/toggleFavorite.controller.js";

// DELETE request controllers
import permanentDeleteControllers from "./deleteRequests/permanentDelete.controller.js";
import softDeleteFileControllers from "./deleteRequests/softDeleteFile.controller.js";

// Additional POST controllers for multiple operations
import setMultipleFavoritesControllers from "./postRequests/setMultipleFavorites.controller.js";

// Destructure functions from default exports
const { redirectToGoogleOAuth, handleGoogleOAuthCallback } = mailOauthControllers;
const { uploadFiles } = uploadFilesControllers;
const { permanentDelete, permanentDeleteMultiple } = permanentDeleteControllers;
const { restoreFile, restoreMultipleFiles } = restoreControllers;
const { softDeleteMultipleFiles } = softDeleteControllers;
const { softDeleteFile } = softDeleteFileControllers;
const { getFavoriteFiles } = favoriteControllers;
const { toggleFavorite } = toggleFavoriteControllers;
const { setMultipleFavorites } = setMultipleFavoritesControllers; 

export default {
  getFiles,
  getFile,
  signup,
  signin,
  signout,
  googleSignin,
  googleCredential,
  changePassword,
  getCurrentUser,
  getPlans,
  getRoles,
  inviteUser,
  getStorageStats,
  // Upload file functions
  uploadFiles,
  downloadFile,
  downloadThumbnail,
  getIsDeleted,
  permanentDeleteMultiple,
  permanentDelete,
  restoreMultipleFiles,
  restoreFile,
  softDeleteFile,
  softDeleteMultipleFiles,
  toggleFavorite,
  setMultipleFavorites,
  getFavoriteFiles,
  // Mail OAuth functions
  redirectToGoogleOAuth,
  handleGoogleOAuthCallback
};
