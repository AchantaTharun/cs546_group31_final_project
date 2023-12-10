import express from 'express';
import mongoose from 'mongoose';
import * as authController from '../controllers/authController.js';
import * as adminController from '../controllers/adminController.js';
import { Router } from 'express';

const router = Router();

router.patch(
  '/approve-gym/:gymId',
  authController.restrictTo('admin'),
  authController.protectRoute,
  adminController.approveGym
);
router.patch(
  '/reject-gym/:gymId',
  authController.restrictTo('admin'),
  authController.protectRoute,
  adminController.rejectGym
);

router.patch(
  '/approve-trainer/:trainerId',
  authController.restrictTo('admin'),
  authController.protectRoute,
  adminController.approveTrainer
);

router.patch(
  '/reject-trainer/:trainerId',
  authController.restrictTo('admin'),
  adminController.rejectTrainer
);

router.get(
  '/gymRequests',
  authController.restrictTo('admin'),
  authController.protectRoute,
  adminController.getAllGymsRequests
);

router.get(
  '/trainerRequests',
  authController.restrictTo('admin'),
  authController.protectRoute,
  adminController.getAllTrainersRequests
);

router.get(
  '/rejectedGyms',
  authController.restrictTo('admin'),
  authController.protectRoute,
  adminController.getAllRejectedRequestsGyms
);

router.get(
  '/rejectedTrainers',
  authController.restrictTo('admin'),
  authController.protectRoute,
  adminController.getAllRejectedRequestsTrainers
);

export default router;
