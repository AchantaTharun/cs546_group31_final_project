import { Router } from "express";

import * as authController from "../controllers/authController.js";
import * as sessionController from "../controllers/sessionController.js";

const router = Router();

router.post(
  "/createsession",
  authController.restrictTo("trainer"),
  authController.protectRoute,
  sessionController.createSession
);
router.put(
  "/updatesession/:sessionId",
  authController.restrictTo("trainer"),
  authController.protectRoute,
  sessionController.updateSession
);

router.get(
  "/:sessionId",
  authController.protectRoute,
  sessionController.getSessionDetails
);

router.get(
  "/active-sessions",
  authController.restrictTo("trainer"),
  authController.protectRoute,
  sessionController.getActiveSessions
);
router.get(
  "/inactive-sessions",
  authController.restrictTo("trainer"),
  authController.protectRoute,
  sessionController.getInactiveSessions
);

router.post(
  "/:sessionId/register",
  authController.protectRoute,
  authController.restrictTo("user"),
  sessionController.registerForSession
);

router.post(
  "/:sessionId/unregister",
  authController.protectRoute,
  authController.restrictTo("user"),
  sessionController.unregisterFromSession
);

router.post(
  "/:sessionId/:userId/unregister",
  authController.protectRoute,
  authController.restrictTo("trainer"),
  sessionController.unregisterUserFromSessionByTrainer
);

router.post(
  "/toggle/:sessionId",
  authController.restrictTo("trainer"),
  authController.protectRoute,
  sessionController.toggleSessionActivation
);

router.get(
  "/:sessionId/users",
  authController.protectRoute,
  sessionController.getSessionUsers
);

export default router;
