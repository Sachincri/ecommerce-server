import catchAsyncError from "../middlewares/catchAsyncError.js";
import { Product } from "../models/productModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import cloudinary from "cloudinary";
import SearchFeatures from "../utils/searchFeatures.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/uploadOnCloudinary.js";

// Create Product
export const createProduct = catchAsyncError(async (req, res, next) => {
  const {
    name,
    category,
    cuttedPrice,
    price,
    discount,
    offers,
    highlights,
    stock,
    warranty,
    description,
  } = req.body;

  if (
    [
      name,
      category,
      cuttedPrice,
      price,
      discount,
      offers,
      highlights,
      stock,
      description,
    ].some((fields) => fields.trim() !== "")
  ) {
    return next(new ErrorHandler("All fields are required", 400));
  }

  const files = req.files;

  if (!files) {
    return next(new ErrorHandler("Please add image", 400));
  }

  const imagesLinks = [];

  for (let i = 0; i < files.length; i++) {
    const result = await uploadOnCloudinary(files[i].path, {
      folder: "products",
    });

    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  await Product.create({
    name,
    category,
    cuttedPrice,
    price,
    discount,
    offers,
    highlights,
    stock,
    warranty,
    description,
    user: req.user._id,
    images: imagesLinks,
  });

  res.status(201).json({
    success: true,
    message: "Product Created Successfully",
  });
});

// Get Product

export const getAllProducts = catchAsyncError(async (req, res, next) => {
  const resultPerPage = 12;
  const productsCount = await Product.countDocuments();

  const apiFeature = new SearchFeatures(Product.find(), req.query)
    .search()
    .filter();

  let products = await apiFeature.query;

  let filteredProductsCount = products.length;

  apiFeature.pagination(resultPerPage);

  products = await apiFeature.query.clone();

  res.status(200).json({
    success: true,
    products,
    productsCount,
    resultPerPage,
    filteredProductsCount,
  });
});

// Get Product --> admin
export const getAdminProducts = catchAsyncError(async (req, res, next) => {
  const productsCount = await Product.countDocuments();
  const products = await Product.find({});

  const outOfStock = products.filter((i) => i.stock === 0);

  res.status(200).json({
    success: true,
    products,
    outOfStock: outOfStock.length,
    inStock: products.length - outOfStock.length,
    productsCount,
  });
});

export const getProductDetails = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate("category");

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

// Update Product --> admin
export const updateProduct = catchAsyncError(async (req, res, next) => {
  const {
    name,
    category,
    cuttedPrice,
    price,
    discount,
    offers,
    highlights,
    stock,
    warranty,
    description,
  } = req.body;

  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const files = req.files;

  const imagesLinks = [];

  const update = {
    name,
    category,
    cuttedPrice,
    price,
    discount,
    offers,
    highlights,
    stock,
    warranty,
    description,
  };

  if (files && files.length !== 0) {
    for (let i = 0; i < product.images.length; i++) {
      await deleteFromCloudinary(product.images[i].public_id);
    }

    for (let i = 0; i < files.length; i++) {
      const result = await uploadOnCloudinary(files[i].path, {
        folder: "products",
      });

      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }
    update.images = imagesLinks;
  }

  product = await Product.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    message: "Product Updated Successfully",
  });
});

export const deleteProduct = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  // Deleting Images From Cloudinary
  for (let i = 0; i < product.images.length; i++) {
    await cloudinary.v2.uploader.destroy(product.images[i].public_id);
  }

  await product.remove();

  res.status(200).json({
    success: true,
    message: "Product Delete Successfully",
  });
});

// Create New Review or Update the review
export const createProductReview = catchAsyncError(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString())
        (rev.rating = rating), (rev.comment = comment);
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  let avg = 0;

  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });

  product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Thanks for your feedback.",
  });
});

// Get All Reviews of a product
export const getProductReviews = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// Delete Review
export const deleteReview = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let ratings = 0;

  if (reviews.length === 0) {
    ratings = 0;
  } else {
    ratings = avg / reviews.length;
  }

  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
    message: "Review Delete Successfully",
  });
});
