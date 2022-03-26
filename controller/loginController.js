const bcrypt = require("bcrypt");
const { User, validateLogin } = require("../models/User");
const AppError = require("../utility/appError");
const catchAsync = require("../utility/catchAsync");

// Hey if you are confused about catchAsync function ⚠️⚠️⚠️
// I wrapped the Functions instead to rewrite Try Catch for every function ..
exports.login = catchAsync(async (req, res, next) => {
  //- Joi Validation
  const { error } = validateLogin(req.body);
  if (error) return next(new AppError(error.message, 400));
  //- Check in DB
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new AppError("Incorrect Username Or Password 🧐 ", 401));
  //- Check password with Bcrypt
  const isVaild = await bcrypt.compare(req.body.password, user.password);
  if (!isVaild)
    return next(new AppError("Incorrect Username Or Password 🧐 ", 401));
  //-Sending Response
  const token = user.generateToken();
  user.cookiJwt(res, token);
  res.status(200).json({
    status: "Success",
    message: "Successful logged in 🔑 ",
    token: token,
  });
});
