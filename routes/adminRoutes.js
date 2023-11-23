const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const authController = require("../controllers/authController");
const adminController = require("../controllers/adminController");

router.post("/login", authController.adminLogin);

router.patch(
  "/approve-gym/:gymId",
  authController.restrictTo("admin"),
  adminController.approveGym
);
router.patch(
  "/reject-gym/:gymId",
  authController.restrictTo("admin"),
  adminController.rejectGym
);

router.patch(
  "/approve-trainer/:trainerId",
  authController.restrictTo("admin"),
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
  adminController.getAllGymsRequests
);
router.get(
  "/trainerRequests",
  authController.restrictTo("admin"),
  adminController.getAllTrainersRequests
);
router.get(
  "/rejectedGyms",
  authController.restrictTo("admin"),
  adminController.getAllRejectedRequestsGyms
);
router.get(
  "/rejectedTrainers",
  authController.restrictTo("admin"),
  adminController.getAllRejectedRequestsTrainers
);
module.exports = router;
