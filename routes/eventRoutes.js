import express from "express";

import { Router } from "express";
import * as eventController from "../controllers/eventController.js";
import * as authController from "../controllers/authController.js";

const router = Router();

router
  .get("/", eventController.getAllEvents);

router
  .post("/create", authController.protectRoute, eventController.createEvent);

router
  .route("/:eventId")
  .get(authController.protectRoute, eventController.getEventById)
  .patch(authController.protectRoute, eventController.updateEvent)
  .delete(authController.protectRoute, eventController.deleteEvent);

router
  .post('/:eventId/:attendeeId',
    authController.protectRoute, eventController.addAttendee)
  .delete('/:eventId/:attendeeId/remove',
    authController.protectRoute, eventController.removeAttendee);
  
export default router;
