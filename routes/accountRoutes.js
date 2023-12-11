import { Router } from "express";
import * as authController from "../controllers/authController.js";
const router = Router();

// router.get("/home", async (req, res) => {
//   return res.render("homepage");
// });
// router.get("/login", async (req, res) => {
//   return res.render("accountSignIn");
// });

// router.post("/login", (req, res) => {
//   const userType = req.body.userType;

//   switch (userType) {
//     case "trainer":
//       authController.trainerLogin(req, res);
//       break;
//     case "user":
//       authController.userLogin(req, res);
//       break;
//     case "gym":
//       authController.gymLogin(req, res);
//       break;
//     default:
//       res.redirect("/login");
//   }
// });

// router.get("/logout", async (req, res) => {
//   if (req.cookies.jwt) {
//     res.clearCookie("jwt");
//   }
//   return res.render("homepage");
// });

export default router;
