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
  addToWishList,
  recentlyViewedProduct,
  getRecentlyViewedProduct,
} from "../controllers/usercontroller.js";
import { isAuthUser, authorizeRoles } from "../middlewares/auth.js";
const router = express.Router();

router.route("/register").post(signUp);

router.route("/login").post(login);

router.route("/password/forget").post(forgetPassword);

router
  .route("/recentlyViewed")
  .post(isAuthUser, recentlyViewedProduct);

router.route("/addToWishList").put(isAuthUser, addToWishList);

router.route("/password/reset/:token").put(resetPassword);

router.route("/logout").get(logout);

router
  .route("/getRecentlyViewedProduct")
  .get(isAuthUser, getRecentlyViewedProduct);

router.route("/me").get(isAuthUser, getUserDetails);

router.route("/password/update").put(isAuthUser, updatePassword);

router.route("/me/update").put(isAuthUser, updateProfile);

router
  .route("/admin/users")
  .get(isAuthUser, authorizeRoles("admin"), getAllUser);

router
  .route("/admin/user/:id")
  .get(isAuthUser, authorizeRoles("admin"), getSingleUser)
  .put(isAuthUser, authorizeRoles("admin"), updateUserRole)
  .delete(isAuthUser, authorizeRoles("admin"), deleteUser);

export default router;
