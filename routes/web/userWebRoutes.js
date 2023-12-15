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
    const response = await axios.get(
      "http://localhost:3000/api/v1/user/fromCoord",
      {
        params: {
          lng: user.location.coordinates[0],
          lat: user.location.coordinates[1],
        },
      }
    );
    let users = response.data.data.users;
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

router.get("/home/search", authController.protectRoute, async (req, res) => {
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
    }
  } catch (err) {
    console.log(err.message);
  }
});

router.get("/events", authController.protectRoute, async (req, res) => {
  const user = req.user;
  try {
    const response = await axios.get("http://localhost:3000/api/v1/events/");
    
    const events = response.data.data.events;
    return res.render("user/userEvents", {
      layout: "userHome.layout.handlebars",
      events,
      user
    });
  } catch (err) {
    console.error(err);

    if (err.response && err.response.data && err.response.data.errors) {
      return res.render("user/userEvents", {
        layout: "userHome.layout.handlebars",
        events: [],
        user,
        message: err.response.data.errors[0] // 'No events have been made yet'
      });
    }
    return res.render("user/userEvents", {
      layout: "userHome.layout.handlebars",
      events: [],
      user,
      message: "An error occurred while fetching events."
    });
  }
});


router.get(
  "/events/createEvent",
  authController.protectRoute,
  async (req, res) => {
    return res.render("user/userCreateEvent", {
      layout: "userCreateEvent.layout.handlebars",
    });
  }
);

router.post("/events/create", authController.protectRoute, async (req, res) => {
  const user = req.user;
  try {

    const response1 = await axios.post(
      "http://localhost:3000/api/v1/events/create",
      req.body,
      {
        headers: {
          Cookie: `jwt=${req.cookies.jwt}`
        }
      }
    );
      const response2 = await axios.get("http://localhost:3000/api/v1/events/");
      
      const events = response2.data.data.events;
  
      return res.render("user/userEvents", {
        layout: "userHome.layout.handlebars",
        events,
        user,
        message: "Event created successfully!"
      });
  } catch (err) {
    console.dir(err,{depth: null});
  }
});

router.get("/events/details/:eventId", authController.protectRoute, async (req, res) => {
  const inheritedUser = req.user;
  const eventId = req.params.eventId;
  try {
    const response = await axios.get(`http://localhost:3000/api/v1/events/${eventId}`, {
      headers: {
        Cookie: `jwt=${req.cookies.jwt}`
      }
    });
    const event = response.data.data.event; 
    const user = Object.assign({}, inheritedUser, {_id: inheritedUser._id});
    return res.render("user/userEventDetails", { 
      layout: "userHome.layout.handlebars",
      event,
      user,
    });
  } catch (err) {
    console.error(err);
  }
});

router.post("/events/rsvp/:eventId/:attendeeId", authController.protectRoute, async (req, res) => {
  const user = req.user;

  try {
    await axios.post(
      `http://localhost:3000/api/v1/events/${req.params.eventId}/${req.params.attendeeId}`,
      {},
      { headers: { Cookie: `jwt=${req.cookies.jwt}` } }
    );

    const response = await axios.get("http://localhost:3000/api/v1/events/");
    const events = response.data.data.events;

    let message = "You are attending the event!";
    return res.render("user/userEvents", {
      layout: "userHome.layout.handlebars",
      events,
      user,
      message
    });
  } catch (err) {
    console.error(err);

    let message = "An error occurred while processing your RSVP.";
    if (err.response && err.response.status === 400) {
      message = "You are already registered as an attendee.";
    } else if (err.response && err.response.status === 404) {
      message = "Event not found.";
    }
    
    try {
      const response = await axios.get("http://localhost:3000/api/v1/events/");
      const events = response.data.data.events;

      return res.render("user/userEvents", {
        layout: "userHome.layout.handlebars",
        events,
        user,
        message
      });
    } catch (error) {
      console.error(error);
      return res.render("user/userEvents", {
        layout: "userHome.layout.handlebars",
        events: [],
        user,
        message: "Failed to fetch events."
      });
    }
  }
});

router.post("/events/rsvp/:eventId/:attendeeId/remove", authController.protectRoute, async (req, res) => {
  const user = req.user;
  const eventId = req.params.eventId;
  const attendeeId = req.params.attendeeId;

  try {
    await axios.delete(
      `http://localhost:3000/api/v1/events/${eventId}/${attendeeId}/remove`,
      {
        data: { attendeeId: attendeeId },
        headers: { Cookie: `jwt=${req.cookies.jwt}` }
      }
    );

    const response = await axios.get("http://localhost:3000/api/v1/events/");
    const events = response.data.data.events;

    return res.render("user/userEvents", {
      layout: "userHome.layout.handlebars",
      events,
      user,
      message: "You have successfully withdrawn your RSVP."
    });
  } catch (err) {
    console.error(err);

    let message = "An error occurred while processing your RSVP withdrawal.";
    if (err.response && err.response.status === 400) {
      message = "You are already not registered for the event";
    } else if (err.response && err.response.status === 404) {
      message = "Event not found.";
    }

    try {
      const response = await axios.get("http://localhost:3000/api/v1/events/");
      const events = response.data.data.events;

      return res.render("user/userEvents", {
        layout: "userHome.layout.handlebars",
        events,
        user,
        message
      });
    } catch (error) {
      console.error(error);
      return res.render("user/userEvents", {
        layout: "userHome.layout.handlebars",
        events: [],
        user,
        message: "Failed to fetch events."
      });
    }
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

router.get("/:userName", authController.protectRoute, async (req, res) => {
  const user = req.user;
  console.log(req.params.userName);
  try {
    const response = await axios.get(
      `http://localhost:3000/api/v1/user/${req.params.userName}`
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
