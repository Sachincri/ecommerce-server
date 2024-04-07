import express from "express";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductDetails,
  createProductReview,
  getProductReviews,
  deleteReview,
  getAdminProducts,
} from "../controllers/productcontroller.js";
import { isAuthUser, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

router.route("/products").get(getAllProducts);

router
  .route("/admin/products")
  .get(isAuthUser, authorizeRoles("admin"), getAdminProducts);

router
  .route("/admin/product/new")
  .post(isAuthUser, authorizeRoles("admin"), createProduct);

router.route("/product/:id").get(getProductDetails);

router
  .route("/admin/product/:id")
  .put(isAuthUser, authorizeRoles("admin"), updateProduct)
  .delete(isAuthUser, authorizeRoles("admin"), deleteProduct);

router.route("/review").put(isAuthUser, createProductReview);

router
  .route("/reviews")
  .get(getProductReviews)
  .delete(isAuthUser, deleteReview);

export default router;
