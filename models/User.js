/* eslint-disable no-undef */
const mongoose = require("mongoose");
const crypto = require("crypto");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

//-Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Must have a name"],
    minlength: 2,
  },
  email: {
    type: String,
    required: [true, "Must have email"],
    unique: true,
    minlength: 5,
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
  password: {
    type: String,
    required: [true, "Must have password"],
    minlength: 8,
    maxlength: 1000,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same!",
    },
  },
  biz: {
    type: Boolean,
    required: [true, "Must have biz"],
    default: false,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  passwordChangeAt: Date,
  passwordResetToken: String,
  passwordResetExpire: Date,
});

// hashing password before saveing to database
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
  this.passwordConfirm = undefined;
  next();
});

//Token
userSchema.methods.generateToken = function () {
  const token = jwt.sign(
    { _id: this._id, biz: this.biz, role: this.role },
    process.env.jwtKey,
    {
      expiresIn: process.env.JWT_expiresIn,
    }
  );
  return token;
};

//Sending Token To browser Cookies
userSchema.methods.cookiJwt = function (res, token) {
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);
};

//
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model("User", userSchema);

//-Joi validation
function validateRegister(body) {
  const registerRules = Joi.object({
    name: Joi.string().required().min(2),
    email: Joi.string().email().required().min(5),
    password: Joi.string().required().min(8),
    biz: Joi.boolean().required(),
    role: Joi.string(),
    passwordConfirm: Joi.string().required().min(8),
  });
  return registerRules.validate(body);
}

function validateLogin(body) {
  const loginRules = Joi.object({
    email: Joi.string().email().required().min(5),
    password: Joi.string().required().min(8),
  });
  return loginRules.validate(body);
}

//=>Exprots

module.exports = { User, validateLogin, validateRegister };
