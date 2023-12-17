import express from "express";
import * as authController from "../controllers/authController.js";
import * as gymController from "../controllers/gymController.js";

import { Router } from "express";

const router = Router();

router.route("/").get(gymController.getAllGyms);

router
	.route("/:id")
	.get(authController.protectRoute, gymController.getGymById)
	.patch(authController.protectRoute, gymController.updateGym)
	.delete(authController.protectRoute, gymController.deleteGym);

router.route("/search").get(authController.protectRoute, gymController.search);

router.post(
	"/addMembers",
	authController.protectRoute,
	gymController.addMembers
);
export default router;
