import { Router } from "express";
import * as authController from "../controllers/authController.js";
const router = Router();


router.get("/", async (req, res) => {
  return res.render("homepage",{layout : "main"});
});


router.get("/logout", async (req, res) => {
  if (req.cookies.jwt) {
    res.clearCookie("jwt");
  }
  return res.render("homepage");
});

export default router;
