import express from "express";
import {
  getRazorPayKey,
  paymentVerification,
} from "../controllers/paymentcontroller.js";
import { isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();
// Verify Payment and save reference in database
router
  .route("/paymentverification")
  .post(isAuthenticatedUser, paymentVerification);

// Get Razorpay key
router.route("/razorpaykey").get(getRazorPayKey);

export default router;
