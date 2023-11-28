const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.post(
  "/signup",
  // upload.single("businessLicense"),
  authController.gymSignup
);

router.get("/signup", (req, res) => {
  res.render("gymSignup");
});
router.post("/login", authController.gymLogin);

module.exports = router;
