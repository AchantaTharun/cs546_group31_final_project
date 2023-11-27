const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const authController = require("../controllers/authController");
const adminController = require("../controllers/adminController");

router.post("/login", authController.adminLogin);

router.patch(
  "/approve-gym/:gymId",
  authController.restrictTo("admin"),
  authController.protectRoute,
  adminController.approveGym
);
router.patch(
  "/reject-gym/:gymId",
  authController.restrictTo("admin"),
  authController.protectRoute,
  adminController.rejectGym
);

router.patch(
  "/approve-trainer/:trainerId",
  authController.restrictTo("admin"),
  authController.protectRoute,
  adminController.approveTrainer
);

router.patch(
  "/reject-trainer/:trainerId",
  authController.restrictTo("admin"),
  adminController.rejectTrainer
);

router.get(
  "/gymRequests",
  authController.restrictTo("admin"),
  authController.protectRoute,
  adminController.getAllGymsRequests
);

router.get(
  "/trainerRequests",
  authController.restrictTo("admin"),
  authController.protectRoute,
  adminController.getAllTrainersRequests
);

router.get(
  "/rejectedGyms",
  authController.restrictTo("admin"),
  authController.protectRoute,
  adminController.getAllRejectedRequestsGyms
);

router.get(
  "/rejectedTrainers",
  authController.restrictTo("admin"),
  authController.protectRoute,
  adminController.getAllRejectedRequestsTrainers
);
module.exports = router;
