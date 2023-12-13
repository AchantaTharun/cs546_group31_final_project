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

  try {
    const { selectUser, favoriteWorkout, searchType, search } = req.query;

    let users;

    if (selectUser && favoriteWorkout && searchType && search) {
      const response = await axios.get(
        "http://localhost:3000/api/v1/user/search",
        {
          params: {
            selectUser,
            favoriteWorkout,
            searchType,
            search,
          },
        }
      );
      users = response.data.data.user;
      console.log(users);
      return res.render("user/userHome", {
        layout: "userHome.layout.handlebars",
        users,
        user,
      });
    } else {
      const response = await axios.get(
        "http://localhost:3000/api/v1/user/fromCoord",
        {
          params: {
            lng: user.location.coordinates[0],
            lat: user.location.coordinates[1],
          },
        }
      );
      users = response.data.data.user;
    }
    return res.render("user/userHome", {
      layout: "userHome.layout.handlebars",
      users,
      user,
    });
  } catch (err) {
    console.log(err.message);
  }
});

router.post("/logout", async (req, res) => {
  if (req.cookies.jwt) {
    res.clearCookie("jwt");
  }
  return res.render("user/userLogin");
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

router.get("/:id", authController.protectRoute, async (req, res) => {
  const user = req.user;
  try {
    const response = await axios.get(
      `http://localhost:3000/api/v1/user/${req.params.id}`
    );
    const user = response.data.data.user;
    return res.render("user/userPage", {
      layout: "main.handlebars",
      user,
    });
  } catch (err) {
    console.log(err);
  }
});

router.get("/profile/edit", authController.protectRoute, async (req, res) => {
  res.render("user/userEditProfile", {
    layout: "userEditProfile.layout.handlebars",
  });
});
router.get(
  "/profile/workout",
  authController.protectRoute,
  async (req, res) => {
    res.render("user/userWorkouts", {
      layout: "userEditProfile.layout.handlebars",
    });
  }
);
export default router;
