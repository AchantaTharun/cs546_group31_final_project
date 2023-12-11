import express from "express";
import * as authController from "../controllers/authController.js";

import { Router } from "express";

const router = Router();

import multer from "multer";
//import upload from "../utils/multer.js";
const upload = multer({dest:"uploads/"});
router.post(
  "/signup",
  upload.single("businessLicense"),
  authController.gymSignup
);

router.get("/signup", (req, res) => {
  res.render("gymSignup");
});
router.post("/login", authController.gymLogin);

export default router;
