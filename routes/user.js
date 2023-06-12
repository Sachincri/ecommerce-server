import express from "express";
import {
  signUp,
  login,
  logout,
  forgetPassword,
  resetPassword,
  getUserDetails,
  updatePassword,
  updateProfile,
  getAllUser,
  deleteUser,
  getSingleUser,
  updateUserRole,
  updateprofilepicture
} from "../controllers/usercontroller.js";
import { isAuthenticatedUser, authorizeRoles } from "../middlewares/auth.js";
import {singleUpload} from "../middlewares/multer.js";
const router = express.Router();

router.route("/register").post(singleUpload, signUp);

router.route("/login").post(login);

router.route("/password/forget").post(forgetPassword);

router.route("/password/reset/:token").put(resetPassword);

router.route("/logout").get(logout);

router.route("/me").get(isAuthenticatedUser, getUserDetails);

router.route("/password/update").put(isAuthenticatedUser, updatePassword);

router.route("/me/update").put(isAuthenticatedUser, updateProfile);
// UpdateProfilePicture
router
  .route("/updateprofilepicture")
  .put(isAuthenticatedUser, singleUpload, updateprofilepicture);
router
  .route("/admin/users")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAllUser);

router
  .route("/admin/user/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getSingleUser)
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateUserRole)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUser);

export default router;
