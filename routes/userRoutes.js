import express from "express";
import * as authController from "../controllers/authController.js";
import * as userController from "../controllers/userController.js";
import { Router } from "express";

const router = Router();

router.get("/", userController.getAllUsers);

router.get("/:id", userController.getUser);
export default router;
