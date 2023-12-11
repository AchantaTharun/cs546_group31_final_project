import express from "express";

import { Router } from "express";

const router = Router();
router.get("/", (req, res) => {
  res.status(200).json({ message: "Event route" });
});
export default router;
