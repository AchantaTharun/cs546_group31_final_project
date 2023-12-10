import { Router } from 'express';
import Trainer from '../../models/trainerModel.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import * as authController from '../../controllers/authController.js';
import * as trainerController from '../../controllers/trainerController.js';

const router = Router();

router.get('/signup', async (req, res) => {
  return res.render('/trainer/trainerSignUp');
});

router.post('/signup', authController.trainerSignup);

router.get(
  '/dashboard',
  authController.protectRoute,
  trainerController.renderTrainerDashboard
);

router.get(
  '/sessions',
  authController.protectRoute,
  trainerController.renderTrainerSessions
);

router.get('/gyms', authController.protectRoute, async (req, res) => {
  const trainer = req.trainer;
  return res.render('trainer/trainerGyms', {
    name: trainer.trainerName,
    type: 'trainer',
  });
});

router.get(
  '/:sessionId/users',
  authController.protectRoute,
  trainerController.renderTrainerSessionUsers
);
export default router;
