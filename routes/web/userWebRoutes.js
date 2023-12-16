import { Router } from "express";
import * as authController from "../../controllers/authController.js";
import axios from "axios";
const router = Router();
import * as userController from "../../controllers/userController.js";
import * as userControllerWeb from "../../controllers/userControllerWeb.js";

// login , signup, logout
router
  .get("/signup", async (req, res) => {
    return res.render("user/userSignUp", {
      layout: "main",
    });
  })
  .post("/signup", authController.userSignup);

router
  .get("/login", async (req, res) => {
    return res.render("user/userLogin", {
      layout: "main",
    });
  })
  .post("/login", authController.userLogin);

router.post("/logout", async (req, res) => {
  if (req.cookies.jwt) {
    res.clearCookie("jwt");
  }
  return res.render("user/userLogin");
});

// home page and profile
router.get("/home", authController.protectRoute, userControllerWeb.getHomePage);

router.get(
  "/home/search",
  authController.protectRoute,
  userControllerWeb.search
);

router.get(
  "/:userName",
  authController.protectRoute,
  userControllerWeb.getUserFromUserName
);

router.get("/events", authController.protectRoute, async (req, res) => {
  const user = req.user;
  try {
    const response = await axios.get("http://localhost:3000/api/v1/events");
    const events = response.data.data;
    return res.render("user/userEvents", {
      layout: "userHome.layout.handlebars",
      events,
      user,
    });
  } catch (err) {
    console.log(err);
  }
});

router.get("/posts", authController.protectRoute, async (req, res) => {
  const user = req.user;
  try {
    const response = await axios.get("http://localhost:3000/api/v1/posts");
    const posts = response.data.data.posts;
    return res.render("user/userPosts", {
      layout: "userHome.layout.handlebars",
      posts,
      user,
    });
  } catch (err) {
    console.log(err);
  }
});

// profile routes
router
  .route("/profile/edit")
  .get(authController.protectRoute, userControllerWeb.getEditProfile)
  .post(authController.protectRoute, userControllerWeb.updateUser);

router.get(
  "/profile/workout",
  authController.protectRoute,
  async (req, res) => {
    res.render("user/userWorkouts", {
      layout: "userEditProfile.layout.handlebars",
    });
  }
);

router.get(
  "/profile/:userName",
  authController.protectRoute,
  userControllerWeb.getProfilePage
);

router.get(
  "/trainerProfile/:userName",
  authController.protectRoute,
  userControllerWeb.getTrainerProfilePage
);

router.get(
  "/gymProfile/:id",
  authController.protectRoute,
  userControllerWeb.getGymProfilePage
);
export default router;
