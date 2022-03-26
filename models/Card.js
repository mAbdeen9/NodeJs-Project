/* eslint-disable no-constant-condition */
const mongoose = require("mongoose");
const _ = require("lodash");
const Joi = require("joi");

//-Schema
const cardSchema = new mongoose.Schema({
  bizName: {
    type: String,
    required: [true, "Must have a name"],
    minlength: [2, "min lenght 2"],
  },
  bizDescription: {
    type: String,
    required: [true, "Must have a Description"],
    minlength: [2, "min lenght 2"],
  },
  bizAddress: {
    type: String,
    required: [true, "Must have a Address"],
    minlength: [2, "min lenght 2"],
  },
  bizPhone: {
    type: String,
    required: [true, "Must have a Phone Number"],
  },
  bizImage: {
    type: String,
    required: [true, "Must have a Pic"],
  },
  bizNumber: {
    type: String,
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

function validateCard(body) {
  const cardRules = Joi.object({
    bizName: Joi.string().required().min(2),
    bizDescription: Joi.string().required().max(255),
    bizAddress: Joi.string().required().min(2),
    bizPhone: Joi.string()
      .required()
      .min(9)
      .max(10)
      .regex(/^\+?(972|0)(-)?0?(([23489]{1}\d{7})|[5]{1}\d{8})$/),
    bizImage: Joi.string().required().min(2),
  });
  return cardRules.validate(body);
}

//populate
cardSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user_id",
    select: "name email",
  });
  next();
});

const Card = mongoose.model("Card", cardSchema);

async function randomBizNumber() {
  while (true) {
    const bizNumber = _.random(1, 1000);
    // eslint-disable-next-line no-await-in-loop
    const card = await Card.exists({ bizNumber: bizNumber });
    if (!card) return bizNumber;
  }
}

module.exports = { Card, validateCard, randomBizNumber };
