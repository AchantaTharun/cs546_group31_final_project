const express = require("express");
const authController = require("../controllers/authController");
const trainerController = require("../controllers/trainerController");
const router = express.Router();
router.post("/signup", authController.trainerSignup);
router.post("/login", authController.trainerLogin);
module.exports = router;
