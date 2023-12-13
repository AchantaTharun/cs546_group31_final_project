import { Router } from 'express';

import * as authController from '../../controllers/authController.js';
const router = Router();

router.get('/signup', async (req, res) => {
  return res.render('gymSignUp');
});

router.post(
  '/signup',
  // upload.single("businessLicense"),
  authController.gymSignup
);

router.get('/dashboard', async (req, res) => {
  return res.render('gymDashboard');
});

export default router;
