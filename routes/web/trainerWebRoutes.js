import { Router } from "express";
import Trainer from "../../models/trainerModel.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import * as authController from "../../controllers/authController.js";
import * as trainerController from "../../controllers/trainerController.js";

const router = Router();

router.get("/signup", async (req, res) => {
  return res.render("trainer/trainerSignUp", { layout: "main" });
});

router.post("/signup", authController.trainerSignup);

router.get("/login", async (req, res) => {
  return res.render("trainer/trainerLogin", { layout: "main" });
});

router.get(
  "/profile",
  authController.protectRoute,
  trainerController.renderTrainerProfile
);

router.get(
  "/mealplans",
  authController.protectRoute,
  trainerController.renderTrainerMealPlans
);

router.get(
  "/mealplans/create",
  authController.protectRoute,
  trainerController.renderTrainerMealPlansCreate
);

router.get(
  "/mealplans/delete/:mealplanId",
  authController.protectRoute,
  trainerController.renderTrainerMealPlanDelete
);

router.post("/login", authController.trainerLogin);

router.get(
  "/dashboard",
  authController.protectRoute,
  trainerController.renderTrainerDashboard
);

router.get(
  "/sessions",
  authController.protectRoute,
  trainerController.renderTrainerSessions
);

router.get("/gyms", authController.protectRoute, async (req, res) => {
  const trainer = req.trainer;
  return res.render("trainer/trainerGyms", {
    name: trainer.trainerName,
    type: "trainer",
  });
});

router.get("/events", authController.protectRoute, async (req, res) => {
  const trainer = req.trainer;
  return res.render("trainer/trainerEvents", {
    trainer: trainer.toObject(),
    type: "trainer",
    layout: "trainerHome",
  });
});

router.get("/posts", authController.protectRoute, async (req, res) => {
  const trainer = req.trainer;
  return res.render("trainer/trainerPosts", {
    trainer: trainer.toObject(),
    type: "trainer",
    layout: "trainerHome",
  });
});

router.get(
  "/:sessionId/users",
  authController.protectRoute,
  trainerController.renderTrainerSessionUsers
);
export default router;
