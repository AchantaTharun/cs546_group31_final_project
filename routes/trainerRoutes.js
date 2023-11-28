import { Router } from "express";

import * as authController from "../controllers/authController.js";
import * as trainerController from "../controllers/trainerController.js";

const router = Router();
router.post("/signup", authController.trainerSignup);
router.post("/login", authController.trainerLogin);
export default router;
