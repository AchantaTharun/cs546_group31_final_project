import { Router } from 'express';
import User from '../../models/userModel.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import * as authController from '../../controllers/authController.js';
const router = Router();

router.get('/signup', async (req, res) => {
  return res.render('user/userSignUp');
});

router.post('/signup', authController.userSignup);

router.get('/dashboard', authController.protectRoute, async (req, res) => {
  const user = req.user;
  return res.render('user/userDashboard', {
    name: user.firstName,
    type: 'user',
  });
});

export default router;
