import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncErrors from "../middlewares/catchAsyncError.js";
import { User } from "../models/userModel.js";
import sendToken from "../utils/sendToken.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import { Product } from "../models/productModel.js";

// SignUp a User
export const signUp = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return next(new ErrorHandler("Please fill all field", 400));

  let user = await User.findOne({ email });

  if (user) return next(new ErrorHandler("User Already Exist", 409));

  user = await User.create({
    name,
    email,
    password,
  });

  sendToken(res, user, "Registered Successfully", 201);
});

// Login User
export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new ErrorHandler("Please enter all field", 400));

  const user = await User.findOne({ email }).select("+password");

  if (!user) return next(new ErrorHandler("Incorrect Email or Password", 401));

  const isMatch = await user.comparePassword(password);

  if (!isMatch)
    return next(new ErrorHandler("Incorrect Email or Password", 401));

  sendToken(res, user, `Welcome back ${user.name}`, 200);
});

// Logout User
export const logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

// Forget Password
export const forgetPassword = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) return next(new ErrorHandler("User not found", 400));

  const resetToken = await user.getResetToken();

  await user.save();

  const url = `${process.env.FRONTEND_URL_1}/password/reset/${resetToken}`;

  const message = `Click on the link to reset your password. ${url}. If you have not request then please ignore.`;

  // Send token via email
  await sendEmail(user.email, " Reset Password", message);

  res.status(200).json({
    success: true,
    message: `Reset Token has been sent to ${user.email}`,
  });
});

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.params;

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: {
      $gt: Date.now(),
    },
  });

  if (!user)
    return next(new ErrorHandler("Token is invalid or has been expired", 401));

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password Changed Successfully",
  });
});
// Add and Remove Wishlist
export const addToWishList = catchAsyncErrors(async (req, res, next) => {
  const { productId } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) return next(new ErrorHandler("user not found", 401));

  const product = await Product.findById(productId);

  if (!product) return next(new ErrorHandler("product not found", 401));

  const productExist = user.wishList.find(
    (prod) => prod.product.toString() === product._id.toString()
  );

  if (productExist) {
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { wishList: { product: product._id } } },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Product is removed from Wishlist",
    });
  } else {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: {
          wishList: {
            product: product._id,
            name: product.name,
            price: product.price,
            image: product.images[0].url,
            rating: product.ratings,
            numOfReviews: product.numOfReviews,
            cuttedPrice: product.cuttedPrice,
          },
        },
      },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Product is added to My Wishlist",
    });
  }
});

export const recentlyViewedProduct = catchAsyncErrors(
  async (req, res, next) => {
    const { productId } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) return next(new ErrorHandler("User not found", 404));

    const product = await Product.findById(productId);

    if (!product) return next(new ErrorHandler("Product not found", 404));

    const productExist = user.recentlyViewed.find(
      (prod) => prod.product.toString() === product._id.toString()
    );

    if (productExist) {
      return next(new ErrorHandler(404));
    }

    if (user.recentlyViewed.length >= 10) {
      user.recentlyViewed.pop();
    }

    user.recentlyViewed.push({
      product: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0].url,
      rating: product.ratings,
      discount: product.discount,
      numOfReviews: product.numOfReviews,
      cuttedPrice: product.cuttedPrice,
    });

    await user.save();

    res.status(200).json({ success: true });
  }
);

// Get User Detail
export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    user,
  });
});

export const getRecentlyViewedProduct = catchAsyncErrors(
  async (req, res, next) => {
    const user = await User.findById(req.user._id);

    const { recentlyViewed } = user;

    res.status(200).json({
      success: true,
      recentlyViewed,
    });
  }
);

// update User password
export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Old password is incorrect", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("password does not match", 400));
  }

  user.password = req.body.newPassword;

  await user.save();

  sendToken(user, 200, res);
});

// update User Profile
export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  const { name, email } = req.body;

  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (email) user.email = email;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile Updated Successfully",
  });
});

// Get all users(admin)
export const getAllUser = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

// Get single user (admin)
export const getSingleUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user)
    return next(
      new ErrorHandler(`User does not exist with Id: ${req.params.id}`)
    );

  res.status(200).json({
    success: true,
    user,
  });
});

// update User Role -- Admin
export const updateUserRole = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return next(new ErrorHandler("User not found", 404));

  if (user.role === "user") user.role = "admin";
  else user.role = "user";

  await user.save();

  res.status(200).json({
    success: true,
    message: "Role Updated",
  });
});

// Delete User --Admin
export const deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 400)
    );
  }

  await user.remove();

  res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
  });
});
