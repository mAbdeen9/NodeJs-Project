const express = require("express");

const router = express.Router();
const loginCtrl = require("../controller/loginController");
const auth = require("../controller/authController");
const profile = require("../controller/profile");
//Update User Password
router.route("/forgotPassword").post(auth.forgotPassword);
router.route("/resetPassword/:token").patch(auth.resetPassword);

//login
router.route("/").post(loginCtrl.login).get(auth.authCtrl, profile.profile);

module.exports = router;
