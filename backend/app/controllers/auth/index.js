import getFiles from "./getRequests/getFiles.controller.js";
import getFile from "./getRequests/getFile.controller.js";
import signup from "./signRequests/signup.controller.js";
import signin from "./signRequests/signin.controller.js";
import signout from "./signRequests/signout.controller.js";
import googleSignin from "./signRequests/googleSignin.controller.js";
import googleCredential from "./signRequests/googleCredential.controller.js";
import changePassword from "./changePassword.controller.js";
import getCurrentUser from "./getRequests/getCurrentUser.controller.js";
import getPlans from "./getRequests/getPlans.controller.js";
import getRoles from "./getRequests/getRoles.controller.js";
import inviteUser from "./inviteUser.controller.js";
import downloadFile from "./downloadFile.controller.js";
// Import mail OAuth and upload controllers (default exports)
import mailOauthControllers from "./signRequests/mailOauth.controller.js";
import uploadFilesControllers from "./upload.controller.js";
import downloadThumbnail from "./downloadThumbnail.controller.js";
import getStorageStats from "./getRequests/getStorageStats.controller.js";
import getIsDeleted from "./getRequests/getIsDeleted.js";
import permanentDeleteControllers from "./permanentDelete.controller.js";
import restoreControllers from "./isDeletedFalse.controller.js"
import softDeleteControllers from "./softDelete.controller.js"
import favoriteControllers from "./isFavourite.controller.js"

// Destructure functions from default exports
const { redirectToGoogleOAuth, handleGoogleOAuthCallback } = mailOauthControllers;
const { uploadFiles } = uploadFilesControllers;
const { permanentDelete, permanentDeleteMultiple } = permanentDeleteControllers;
const { restoreFile, restoreMultipleFiles } = restoreControllers;
const { softDeleteFile, softDeleteMultipleFiles } = softDeleteControllers;
const { toggleFavorite, setMultipleFavorites, getFavoriteFiles } = favoriteControllers; 

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
