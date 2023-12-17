import { Router } from "express";
import Event from "../models/eventModel.js";
const router = Router();
router.get("/", async (req, res) => {
  const events = await Event.find({});
  return res.status(200).json({
    status: "success",
    data: events,
  });
});
export default router;
