import express from "express";
import * as authController from "../controllers/authController.js";
import * as userController from "../controllers/userController.js";
import { Router } from "express";

const router = Router();

router.get(
  "/fromCoord",
  authController.protectRoute,
  userController.getFromCoord
);
router.get("/search", authController.protectRoute, userController.search);
// router.get("/:userName", authController.protectRoute, userController.getUser);
// router.get("/", authController.protectRoute, userController.getAllUsers);
export default router;
