import express from "express";
import {
  placeOrder,
  getSingleOrder,
  myOrders,
  getAllOrders,
  updateOrder,
  deleteOrder,
  placeOrderOnline,
} from "../controllers/ordercontroller.js";
import { isAuthUser, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

router.route("/createorder").post(isAuthUser, placeOrder);

router.route("/createorderonline").post(isAuthUser, placeOrderOnline);

router.route("/order/:id").get(isAuthUser, getSingleOrder);

router.route("/orders/me").get(isAuthUser, myOrders);

router
  .route("/admin/orders")
  .get(isAuthUser, authorizeRoles("admin"), getAllOrders);

router
  .route("/admin/order/:id")
  .put(isAuthUser, authorizeRoles("admin"), updateOrder)
  .delete(isAuthUser, authorizeRoles("admin"), deleteOrder);

export default router;
