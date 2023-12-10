import express from 'express';
import * as authController from '../controllers/authController.js';
import * as mealPlanController from '../controllers/mealPlanController.js';
const router = express.Router();

router.post(
  '/meal-plans',
  authController.restrictTo('trainer'),
  authController.protectRoute,
  mealPlanController.createMealPlan
);

router.put(
  '/meal-plans/:mealPlanId/assign/:userId',
  authController.restrictTo('trainer'),
  authController.protectRoute,
  mealPlanController.assignMealPlan
);

export default router;
