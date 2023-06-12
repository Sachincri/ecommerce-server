import express from "express";
import {
  placeOrder,
  getSingleOrder,
  myOrders,
  getAllOrders,
  updateOrder,
  deleteOrder,
  placeOrderOnline,
  // paymentVerification
} from "../controllers/ordercontroller.js";
import { isAuthenticatedUser, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

router.route("/createorder").post(isAuthenticatedUser, placeOrder);

router.route("/createorderonline").post(isAuthenticatedUser, placeOrderOnline);
 
// router
//   .route("/paymentverification")
//   .post(isAuthenticatedUser, paymentVerification);

router.route("/order/:id").get(isAuthenticatedUser, getSingleOrder);

router.route("/orders/me").get(isAuthenticatedUser, myOrders);

router
  .route("/admin/orders")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);

router
  .route("/admin/order/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateOrder)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteOrder);

export default router;
