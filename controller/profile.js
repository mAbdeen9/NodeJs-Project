const _ = require("lodash");
const multer = require("multer");
const sharp = require("sharp");
const { User } = require("../models/User");
const AppError = require("../utility/appError");
const catchAsync = require("../utility/catchAsync");

//MULTER
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/img");
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split("/")[1];
//     cb(null, `user-${req.user._id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const mullterFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an Image! Please upload only images", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: mullterFilter,
});

exports.uploadUserPhoto = upload.single("photo");

//photos resizer sharp midelware
exports.resizeImg = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(400, 400)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/${req.file.filename}`);
  next();
});

//
const filterdObj = (obj, ...allowed) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowed.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// Hey if you are confused about catchAsync function ⚠️⚠️⚠️
// I wrapped the Functions instead to rewrite Try Catch for every function ..
exports.profile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) next(new AppError("Error not found ", 400));
  res.status(200).json({
    status: "Success",
    data: _.pick(user, ["id", "name", "email", "biz"]),
  });
});

exports.updateProfile = catchAsync(async (req, res, next) => {
  // console.log(req.file.filename);
  // Create error if user POSTS Password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError("This route is not for password update", 400));
  }
  const filterBody = filterdObj(req.body, "name", "email");
  if (req.file) filterBody.photo = req.file.filename;
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filterBody, {
    new: true,
    runValidators: true,
  });
  //Update User Profile

  res.status(200).json({
    status: "Success",
    data: _.pick(updatedUser, ["id", "name", "email", "biz", "photo"]),
  });
});

exports.deleteProfile = catchAsync(async (req, res, next) => {
  const userToDel = await User.findByIdAndDelete(req.user._id);
  if (!userToDel) return new AppError("error user not found", 404);
  res.status(200).json({ status: "Success", message: "User removed " });
});
