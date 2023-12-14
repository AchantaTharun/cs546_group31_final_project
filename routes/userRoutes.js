import express from "express";
import * as authController from "../controllers/authController.js";
import * as userController from "../controllers/userController.js";
import { Router } from "express";

const router = Router();

router.get("/fromCoord", userController.getFromCoord);
router.get("/search", userController.search);
router.get("/:userName", userController.getUser);
router.get("/", userController.getAllUsers);
export default router;
