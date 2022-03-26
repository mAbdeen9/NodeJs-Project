const express = require("express");

const router = express.Router();
const auth = require("../controller/authController");
const profile = require("../controller/profile");

router.route("/updateMyPassword").patch(auth.authCtrl, auth.updatePassword);

router
  .route("/updateMyProfile")
  .patch(
    auth.authCtrl,
    profile.uploadUserPhoto,
    profile.resizeImg,
    profile.updateProfile
  );

router.route("/deleteMyProfile").delete(auth.authCtrl, profile.deleteProfile);

module.exports = router;
