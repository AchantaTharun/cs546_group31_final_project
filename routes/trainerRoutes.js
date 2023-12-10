import { Router } from 'express';

import * as authController from '../controllers/authController.js';
import * as trainerController from '../controllers/trainerController.js';

const router = Router();

router.get(
  '/:trainerId',
  authController.protectRoute,
  trainerController.getTrainerDetails
);

router.put(
  '/:trainerId',
  authController.protectRoute,
  trainerController.updateTrainer
);

router.delete(
  '/:trainerId',
  authController.protectRoute,
  trainerController.deleteTrainer
);

router.put(
  '/:trainerId/updatepassword',
  authController.protectRoute,
  trainerController.updateTrainerPassword
);

router.get(
  '/:trainerId/sessions',
  authController.protectRoute,
  trainerController.getSessionsOfTrainer
);

export default router;
