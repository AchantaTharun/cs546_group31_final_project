import { Router } from "express";
import * as authController from "../../controllers/authController.js";
import axios from "axios";
const router = Router();

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

router.get("/home", authController.protectRoute, async (req, res) => {
  const user = req.user;
  console.log(user);
  try {
    const response = await axios.get("http://localhost:3000/api/v1/user");
    console.log(response.data);
    const users = response.data.data.users;
    return res.render("user/userHome", {
      layout: "userHome.layout.handlebars",
      users,
      user,
    });
  } catch (err) {
    console.log(err);
  }
});

router.post("/logout", async (req, res) => {
  if (req.cookies.jwt) {
    res.clearCookie("jwt");
  }
  return res.render("/user/login");
});

router.get("/profile", authController.protectRoute, async (req, res) => {
  const user = req.user;
  return res.render("user/userProfile", {
    layout: "userProfile.layout.handlebars",
    user,
  });
});

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

export default router;
