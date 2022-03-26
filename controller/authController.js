//Check the token that was given by user
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const { User } = require("../models/User");
const catchAsync = require("../utility/catchAsync");
const AppError = require("../utility/appError");
const sendEmail = require("../utility/email");
require("dotenv").config();

// Hey if you are confused about catchAsync function ⚠️⚠️⚠️
// I wrapped the Functions instead to rewrite Try Catch for every function ..
exports.authCtrl = catchAsync(async (req, res, next) => {
  const token = req.header("Authorization");
  if (!token)
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );

  const payload = await promisify(jwt.verify)(token, process.env.jwtKey);
  console.log(payload);
  req.user = payload;
  next();
});

exports.restrictTo =
  (...role) =>
  (req, res, next) => {
    if (!role.includes(req.user.role)) {
      next(new AppError("you dont have permission", 403));
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1- Get User Based on Posted Email
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError("There is no user with this email", 404));

  // 2- generate random reset tokien

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\n
  If you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending the email. Try again later!"),
      500
    );
  }
});
//
exports.resetPassword = catchAsync(async (req, res, next) => {
  //1  Get User based on the Token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //2 if token doesnt expired and there is a user , set the new password
  if (!user) return next(new AppError("Token is Unvaild or expierd ", 400));

  //3 update and change the changedPassword at for the user
  user.password = req.body.password;
  user.passwordConfirm = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  //4 log the user in , send jwt
  //sending Cookies
  const token = user.generateToken();
  user.cookiJwt(res, token);
  res.status(200).json({ status: "Success", token: token });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const isVaild = await bcrypt.compare(req.body.oldpassword, user.password);
  if (!isVaild) return next(new AppError("Incorrect Password 🧐 ", 401));

  if (req.body.passwordConfirm !== req.body.password)
    return next(new AppError("Incorrect Password 🧐 ", 401));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.save();

  res
    .status(200)
    .json({ status: "Success", message: "Password Updated Succesfuly" });
});
