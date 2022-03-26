const { Card, validateCard, randomBizNumber } = require("../models/Card");
const AppError = require("../utility/appError");
const catchAsync = require("../utility/catchAsync");

// Hey if you are confused about catchAsync function ⚠️⚠️⚠️
// I wrapped the Functions instead to rewrite Try Catch for every function ..
exports.cardNew = catchAsync(async (req, res, next) => {
  //Joi
  const { error } = validateCard(req.body);
  if (error) return next(new AppError(error.message, 400));
  // Add to DB
  const card = new Card({
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    ...req.body,
    bizNumber: await randomBizNumber(),
    user_id: req.user._id,
  });
  await card.save();
  res.status(200).json({ status: "Success", data: card });
});

exports.getCard = catchAsync(async (req, res, next) => {
  const card = await Card.findById(req.params.id);
  //Checking Card in DB
  if (!card) return next(new AppError("No Card Match This ID"), 404);
  //Sending RES
  res.status(200).json({ status: "Success", data: card });
});

// exports.queyCard = catchAsync(async (req, res, next) => {
//   let card = await Card.
// });

exports.updateCard = catchAsync(async (req, res, next) => {
  const card = await Card.findById(req.params.id);
  if (!card) return next(new AppError("No Card Match This ID", 404));
  //Checking if the card relevant to the user
  if (card.user_id.valueOf() !== req.user._id)
    return next(
      new AppError("Access denied !,Update Only For Revlants Cards To You"),
      404
    );
  //updating
  await Card.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  //sending res
  res.status(200).json({ status: "Success", data: card });
});

exports.delCard = catchAsync(async (req, res, next) => {
  const card = await Card.findById(req.params.id);
  if (!card) return next(new AppError("No Card Match This ID", 404));
  //Checking if the card relevant to the user
  if (card.user_id.valueOf() !== req.user._id)
    return next(
      new AppError("Access denied !,Delete Only For Revlants Cards To You"),
      404
    );
  //Del from database
  await Card.findByIdAndDelete(req.params.id);
  //sending res
  res.status(204).json({
    status: "Success",
    data: null,
  });
});

exports.getUserCards = catchAsync(async (req, res, next) => {
  const cards = await Card.find({ user_id: req.user._id }).exec();
  if (!cards) return next(new AppError("error", 404));
  res.status(200).json({ status: "Success", data: cards });
});
//For Admins Only
exports.getAllCards = catchAsync(async (req, res, next) => {
  const cards = await Card.find();
  if (!cards) return next(new AppError("error", 404));
  res.status(200).json({ status: "Success", data: cards });
});
