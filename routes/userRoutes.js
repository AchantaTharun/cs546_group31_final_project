const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();

router.post("/signup", authController.userSignup);
router.post("/login", authController.userLogin);

router.get("/", (req, res) => {
  res.status(200).json({ message: "User route" });
});
module.exports = router;
