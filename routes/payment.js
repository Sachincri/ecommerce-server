import express from "express";
import {
  getRazorPayKey,
  paymentVerification,
} from "../controllers/paymentcontroller.js";
import { isAuthUser } from "../middlewares/auth.js";

const router = express.Router();
router
  .route("/paymentverification")
  .post(isAuthUser, paymentVerification);

// Get Razorpay key
router.route("/razorpaykey").get(getRazorPayKey);

export default router;
