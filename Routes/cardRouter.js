const express = require("express");

const router = express();
const card = require("../controller/cardController");
const auth = require("../controller/authController");

//Admins Only
router
  .route("/allcards")
  .get(auth.authCtrl, auth.restrictTo("admin"), card.getAllCards);
//Login in Users Only
router.route("/").post(auth.authCtrl, card.cardNew);
router
  .route("/:id")
  .get(auth.authCtrl, card.getCard)
  .delete(auth.authCtrl, card.delCard)
  .put(auth.authCtrl, card.updateCard);
//GET All Relative User Cards array
router.route("/").get(auth.authCtrl, card.getUserCards);

module.exports = router;
