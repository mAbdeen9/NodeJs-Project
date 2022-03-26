const express = require("express");

const router = express.Router();
const registerCtrl = require("../controller/registerController");
//-routes

router.route("/").post(registerCtrl.register);

module.exports = router;
