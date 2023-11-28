import express from "express";
import * as authController from "../controllers/authController.js";

import { Router } from "express";

const router = Router();
router.post("/signup", authController.userSignup);
router.post("/login", authController.userLogin);

router.get("/", (req, res) => {
  res.status(200).json({ message: "User route" });
});
export default router;
