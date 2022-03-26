const _ = require("lodash");
const { User, validateRegister } = require("../models/User");
const AppError = require("../utility/appError");
const catchAsync = require("../utility/catchAsync");

// Hey if you are confused about catchAsync function ⚠️⚠️⚠️
// I wrapped the Functions instead to rewrite Try Catch for every function ..
exports.register = catchAsync(async (req, res, next) => {
  //- Joi Validate
  const { error } = validateRegister(req.body);
  if (error) return next(new AppError(error.message, 400));
  //- Check if user is already exist in DB
  const user = await User.findOne({ email: req.body.email });
  if (user) return next(new AppError("User is already exist!", 400));
  //- Register New User To DB => Encrypt Password will be handled by the moongose midleware ⚠️
  //  in the user model (fat model skinny controller) ⚠️
  const newUser = await User.create(req.body);
  //sending Cookies
  const token = newUser.generateToken();
  newUser.cookiJwt(res, token);
  //-Sending Response
  res.status(200).json({
    status: "Success",
    data: _.pick(newUser, ["name", "email"]),
    token: token,
  });
});
