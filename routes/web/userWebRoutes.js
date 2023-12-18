import { Router } from "express";
import * as authController from "../../controllers/authController.js";
import axios from "axios";
import moment from "moment";
import { generateUploadURL } from "../../utils/s3.js";
import multer from "multer";

import { checkId } from "../../Helpers.js";
const router = Router();
import * as help from "../../Helpers.js";

axios.defaults.withCredentials = true;
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

router.get("/get/myPosts", authController.protectRoute, async (req, res) => {
  const user = req.user;
  let posts = [];
  try {
    const response = await axios.get(
      "http://localhost:3000/api/v1/posts/get/myPosts",
      { headers: req.headers }
    );
    posts = response.data.data.posts;
    if (!posts)
      return res.render("user/userMyPosts", {
        layout: "userProfile.layout.handlebars",
        posts,
        user,
        title: "MY POSTS",
      });
    return res.render("user/userMyPosts", {
      layout: "userProfile.layout.handlebars",
      posts,
      user,
      title: "MY POSTS",
    });
  } catch (err) {
    return res.render("user/userMyPosts", {
      layout: "userProfile.layout.handlebars",
      posts,
      user,
      title: "MY POSTS",
    });
  }
});

router.get(
  "/home/search",
  authController.protectRoute,
  userControllerWeb.search
);

router.get("/events", authController.protectRoute, async (req, res) => {
  const user = req.user;
  try {
    const response = await axios.get("http://localhost:3000/api/v1/events/", {
      headers: { Cookie: `jwt=${req.cookies.jwt}` },
    });

    let events = response.data.data.events;

    const nowUTC = moment.utc();
    events = events.filter((event) => {
      const eventDateUTC = moment.utc(event.eventDate);
      return eventDateUTC.isSameOrAfter(nowUTC);
    });

    events.sort((a, b) =>
      moment.utc(a.eventDate).diff(moment.utc(b.eventDate))
    );

    events.forEach((event) => {
      event.eventDate = moment.utc(event.eventDate).local().format("LL");
    });

    return res.render("user/userEvents", {
      layout: "userHome.layout.handlebars",
      events,
      user,
      message: req.query.message,
    });
  } catch (err) {
    console.error(err);

    if (err.response && err.response.data && err.response.data.errors) {
      return res.render("user/userEvents", {
        layout: "userHome.layout.handlebars",
        events: [],
        user,
        message: err.response.data.errors[0], // 'No events have been made yet'
      });
    }
    return res.render("user/userEvents", {
      layout: "userHome.layout.handlebars",
      events: [],
      user,
      message: "An error occurred while fetching events.",
    });
  }
});

router.get(
  "/events/createEvent",
  authController.protectRoute,
  async (req, res) => {
    return res.render("user/userCreateEvent", {
      layout: "userCreateEvent.layout.handlebars",
      user: req.user.toObject(),
    });
  }
);

router.post(
  "/events/createEvent",
  authController.protectRoute,
  async (req, res) => {
    const user = req.user;
    let posts = [];
    console.log("first");
    try {
      const response1 = await axios.post(
        "http://localhost:3000/api/v1/events/create",
        req.body,
        {
          headers: {
            Cookie: `jwt=${req.cookies.jwt}`,
          },
        }
      );

      let message = "Event Created Successfully!";

      return res.redirect(
        `/user/events?message=${encodeURIComponent(message)}`
      );
    } catch (err) {
      return res.render("user/userCreateEvent", {
        layout: "userHome.layout.handlebars",
        errors: err.response.data.errors,
        user: user.toObject(),
      });
    }
  }
);

router.get("/posts", authController.protectRoute, async (req, res) => {
  const user = req.user;
  let posts = [];
  console.log("first");
  try {
    const response = await axios.get("http://localhost:3000/api/v1/posts", {
      data: req.body,
      headers: { Cookie: `jwt=${req.cookies.jwt}` },
    }); //This had to be added.
    posts = response.data.data.posts;
    // console.log(response.data.data.posts);
    return res.render("user/userPosts", {
      layout: "userHome.layout.handlebars",
      posts,
      user,
    });
  } catch (err) {
    posts = [];
    return res.render("user/userPosts", {
      layout: "userHome.layout.handlebars",
      posts,
      user,
    });
  }
});

router.get(
  "/events/details/:eventId",
  authController.protectRoute,
  async (req, res) => {
    const user = req.user;
    const eventId = req.params.eventId;
    try {
      const response = await axios.get(
        `http://localhost:3000/api/v1/events/${eventId}`,
        {
          headers: {
            Cookie: `jwt=${req.cookies.jwt}`,
          },
        }
      );
      let event = response.data.data.event;

      event.eventDate = moment(event.eventDate).format("LL");
      event.startTime = moment(event.startTime).format("LT");
      event.endTime = moment(event.endTime).format("LT");

      let isEventCreator = user._id == event.user.userId;

      return res.render("user/userEventDetails", {
        layout: "userHome.layout.handlebars",
        event,
        user: user.toObject(),
        isEventCreator,
      });
    } catch (err) {
      return res.render("user/userEventDetails", {
        layout: "userHome.layout.handlebars",
        errors: err.response.data.errors,
        user: user.toObject(),
      });
    }
  }
);

router.post(
  "/events/rsvp/:eventId/:attendeeId",
  authController.protectRoute,
  async (req, res) => {
    try {
      const response = await axios.post(
        `http://localhost:3000/api/v1/events/${req.params.eventId}/${req.params.attendeeId}`,
        {},
        { headers: { Cookie: `jwt=${req.cookies.jwt}` } }
      );

      let message = "You are successfully registered for the event!";

      return res.redirect(
        `/user/events?message=${encodeURIComponent(message)}`
      );
    } catch (err) {
      return res.redirect(
        `/user/events?message=${encodeURIComponent(
          err.response.data.errors[0]
        )}`
      );
    }
  }
);

router.post(
  "/events/rsvp/:eventId/:attendeeId/remove",
  authController.protectRoute,
  async (req, res) => {
    const user = req.user;
    const eventId = req.params.eventId;
    const attendeeId = req.params.attendeeId;

    try {
      await axios.delete(
        `http://localhost:3000/api/v1/events/${eventId}/${attendeeId}/remove`,
        {
          data: { attendeeId: attendeeId },
          headers: { Cookie: `jwt=${req.cookies.jwt}` },
        }
      );

      const response = await axios.get("http://localhost:3000/api/v1/events/");
      let events = response.data.data.events;

      const nowUTC = moment.utc();
      events = events.filter((event) => {
        const eventDateUTC = moment.utc(event.eventDate);
        return eventDateUTC.isSameOrAfter(nowUTC);
      });

      events.sort((a, b) =>
        moment.utc(a.eventDate).diff(moment.utc(b.eventDate))
      );

      events.forEach((event) => {
        event.eventDate = moment.utc(event.eventDate).local().format("LL");
      });

      return res.render("user/userEvents", {
        layout: "userHome.layout.handlebars",
        events,
        user,
        message: "You have successfully withdrawn your RSVP.",
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
        const response = await axios.get(
          "http://localhost:3000/api/v1/events/"
        );
        let events = response.data.data.events;

        const nowUTC = moment.utc();
        events = events.filter((event) => {
          const eventDateUTC = moment.utc(event.eventDate);
          return eventDateUTC.isSameOrAfter(nowUTC);
        });

        events.sort((a, b) =>
          moment.utc(a.eventDate).diff(moment.utc(b.eventDate))
        );

        events.forEach((event) => {
          event.eventDate = moment.utc(event.eventDate).local().format("LL");
        });

        return res.render("user/userEvents", {
          layout: "userHome.layout.handlebars",
          events,
          user,
          message,
        });
      } catch (error) {
        console.error(error);
        return res.render("user/userEvents", {
          layout: "userHome.layout.handlebars",
          events: [],
          user,
          message: "Failed to fetch events.",
        });
      }
    }
  }
);

router.post(
  "/events/delete/:eventId",
  authController.protectRoute,
  async (req, res) => {
    const eventId = req.params.eventId;
    const user = req.user;

    try {
      const response1 = await axios.delete(
        `http://localhost:3000/api/v1/events/${eventId}`,
        {
          headers: { Cookie: `jwt=${req.cookies.jwt}` },
        }
      );
      const response2 = await axios.get(
        "http://localhost:3000/api/v1/events/",
        {
          headers: { Cookie: `jwt=${req.cookies.jwt}` },
        }
      );

      let events = response2.data.data.events;
      const nowUTC = moment.utc();
      events = events.filter((event) => {
        const eventDateUTC = moment.utc(event.eventDate);
        return eventDateUTC.isSameOrAfter(nowUTC);
      });

      events.sort((a, b) =>
        moment.utc(a.eventDate).diff(moment.utc(b.eventDate))
      );

      events.forEach((event) => {
        event.eventDate = moment.utc(event.eventDate).local().format("LL");
      });

      return res.render("user/userEvents", {
        layout: "userHome.layout.handlebars",
        events,
        user,
        message: "Event successfully deleted.",
      });
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data && error.response.data.errors) {
        return res.render("user/userEvents", {
          layout: "userHome.layout.handlebars",
          events: [],
          user,
          message:
            "Event successfully deleted. " + error.response.data.errors[0], // 'No events have been made yet'
        });
      }
      return res.render("user/userEvents", {
        layout: "userHome.layout.handlebars",
        events: [],
        user,
        message: "Uh-oh an error occurred while fetching events.",
      });
    }
  }
);

router.get(
  "/events/edit/:eventId",
  authController.protectRoute,
  async (req, res) => {
    const inheritedUser = req.user;
    const eventId = req.params.eventId;
    let message = req.query.message ? req.query.message : "";

    try {
      const response = await axios.get(
        `http://localhost:3000/api/v1/events/${eventId}`,
        {
          headers: {
            Cookie: `jwt=${req.cookies.jwt}`,
          },
        }
      );
      let event = response.data.data.event;
      event.eventDate = moment(event.eventDate).format("YYYY-MM-DD");
      event.startTime = moment(event.startTime).format("HH:mm");
      event.endTime = moment(event.endTime).format("HH:mm");

      const user = Object.assign({}, inheritedUser, { _id: inheritedUser._id });

      const states = [
        { abbreviation: "AL", name: "Alabama" },
        { abbreviation: "AK", name: "Alaska" },
        { abbreviation: "AZ", name: "Arizona" },
        { abbreviation: "AR", name: "Arkansas" },
        { abbreviation: "CA", name: "California" },
        { abbreviation: "CO", name: "Colorado" },
        { abbreviation: "CT", name: "Connecticut" },
        { abbreviation: "DE", name: "Delaware" },
        { abbreviation: "FL", name: "Florida" },
        { abbreviation: "GA", name: "Georgia" },
        { abbreviation: "HI", name: "Hawaii" },
        { abbreviation: "ID", name: "Idaho" },
        { abbreviation: "IL", name: "Illinois" },
        { abbreviation: "IN", name: "Indiana" },
        { abbreviation: "IA", name: "Iowa" },
        { abbreviation: "KS", name: "Kansas" },
        { abbreviation: "KY", name: "Kentucky" },
        { abbreviation: "LA", name: "Louisiana" },
        { abbreviation: "ME", name: "Maine" },
        { abbreviation: "MD", name: "Maryland" },
        { abbreviation: "MA", name: "Massachusetts" },
        { abbreviation: "MI", name: "Michigan" },
        { abbreviation: "MN", name: "Minnesota" },
        { abbreviation: "MS", name: "Mississippi" },
        { abbreviation: "MO", name: "Missouri" },
        { abbreviation: "MT", name: "Montana" },
        { abbreviation: "NE", name: "Nebraska" },
        { abbreviation: "NV", name: "Nevada" },
        { abbreviation: "NH", name: "New Hampshire" },
        { abbreviation: "NJ", name: "New Jersey" },
        { abbreviation: "NM", name: "New Mexico" },
        { abbreviation: "NY", name: "New York" },
        { abbreviation: "NC", name: "North Carolina" },
        { abbreviation: "ND", name: "North Dakota" },
        { abbreviation: "OH", name: "Ohio" },
        { abbreviation: "OK", name: "Oklahoma" },
        { abbreviation: "OR", name: "Oregon" },
        { abbreviation: "PA", name: "Pennsylvania" },
        { abbreviation: "RI", name: "Rhode Island" },
        { abbreviation: "SC", name: "South Carolina" },
        { abbreviation: "SD", name: "South Dakota" },
        { abbreviation: "TN", name: "Tennessee" },
        { abbreviation: "TX", name: "Texas" },
        { abbreviation: "UT", name: "Utah" },
        { abbreviation: "VT", name: "Vermont" },
        { abbreviation: "VA", name: "Virginia" },
        { abbreviation: "WA", name: "Washington" },
        { abbreviation: "WV", name: "West Virginia" },
        { abbreviation: "WI", name: "Wisconsin" },
        { abbreviation: "WY", name: "Wyoming" },
      ];

      return res.render("user/userUpdateEvent", {
        layout: "userHome.layout.handlebars",
        event,
        user,
        states,
        message,
      });
    } catch (err) {
      console.error(err);
    }
  }
);

router.post(
  "/events/update/:eventId",
  authController.protectRoute,
  async (req, res) => {
    const inheritedUser = req.user;
    const eventId = req.params.eventId;
    try {
      const response1 = await axios.patch(
        `http://localhost:3000/api/v1/events/${eventId}`,
        req.body,
        {
          headers: {
            Cookie: `jwt=${req.cookies.jwt}`,
          },
        }
      );

      const response = await axios.get(
        `http://localhost:3000/api/v1/events/${eventId}`,
        {
          headers: {
            Cookie: `jwt=${req.cookies.jwt}`,
          },
        }
      );
      let event = response.data.data.event;
      const user = Object.assign({}, inheritedUser, { _id: inheritedUser._id });

      let isEventCreator = user._id == event.user.userId;

      event.eventDate = moment(event.eventDate).format("LL");
      event.startTime = moment(event.startTime).format("LT");
      event.endTime = moment(event.endTime).format("LT");

      return res.render("user/userEventDetails", {
        layout: "userHome.layout.handlebars",
        event,
        user,
        isEventCreator,
        message: "Event details updated successfully!",
      });
    } catch (err) {
      if (err.response && err.response.data && err.response.data.errors) {
        return res.redirect(
          `/user/events/edit/${eventId}?message=${encodeURIComponent(
            err.response.data.errors[0]
          )}`
        );
      }
      return res.render("user/userEvents", {
        layout: "userHome.layout.handlebars",
        events: [],
        user,
        message: "An error occurred while fetching events.",
      });
    }
  }
);

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
  } catch (err) {}
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
  "/trainerProfile/:trainerName/followers",
  authController.protectRoute,
  userControllerWeb.getTrainerFollowersPage
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

router.post(
  "/follow/:userId/:userType",
  authController.protectRoute,
  userControllerWeb.followUser
);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.get("/post/:id", authController.protectRoute, async (req, res) => {
  let id = req.params.id;
  try {
    id = req.params.id;
    id = help.checkId(id);
  } catch (e) {
    return res.render("user/postEntity", {
      layout: "userHome.layout.handlebars",
      post,
      hasData: true,
      error: "ID seems to be invalid, this shouldn't be possible",
    });
  }
  try {
    const response = await axios.get(
      `http://localhost:3000/api/v1/posts/${id}`,
      { headers: req.headers }
    );
    const post = response.data.data.post;
    return res.render("user/postEntity", {
      layout: "userHome.layout.handlebars",
      post,
      hasData: true,
    });
  } catch (err) {
    return res.redirect("/user/posts");
  }
});

//We have to make a new create new post function
router.get("/create/newPosts", async (req, res) => {
  return res.render("user/userCreatePost", {
    layout: "main",
    title: "NEW POST",
    hasData: true,
  });
});

//Insert the code for image insertion.
// Set up multer storage and file naming
const storage = multer.memoryStorage(); // Use memory storage for handling file in memory

// Initialize multer with specified storage options
const upload = multer({ storage: storage });

router.post(
  "/create/newPosts",
  authController.protectRoute,
  upload.single("imageInput"),
  async (req, res) => {
    let img = undefined;
    try {
      /////////////////////////////////////////////////////////////////////////////////////////////////////////
      //Initially img value is going to be empty.
      //Therefore we need to fill it first, before we start with the validation part
      const url = await generateUploadURL();
      console.log({ url });
      await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: req.file.buffer,
      });
      console.log("first");
      img = url.split("?")[0];
      console.log({ img });
      /////////////////////////////////////////////////////////////////////////////////////////////////////////////
    } catch (e) {
      return res.status(400).render("user/userCreatePost", {
        layout: "main",
        title: "NEW POST",
        hasData: false,
        error: "AWS ERROR",
      });
    }
    let { title, description, comment } = req.body;
    req.body = {
      ...{ title: title, description: description, img: img },
      ...req.body,
    };
    if (!title || !img || !description) {
      return res.status(400).render("user/userCreatePost", {
        layout: "main",
        title: "NEW POST",
        hasData: false,
        error:
          "Some Fields were missing, all of the fields above, except the comment one are required ",
      });
    }
    try {
      title = help.checkString(title);
      img = help.checkString(img);
      description = help.checkString(description);
    } catch (e) {
      return res.status(400).render("user/userCreatePost", {
        layout: "main",
        title: "NEW POST",
        hasData: false,
        error: "Some Fields are not in a proper format",
      });
    }
    let post = undefined;
    try {
      const response = await axios.post(
        `http://localhost:3000/api/v1/posts/`,
        req.body,
        { headers: { Cookie: `jwt=${req.cookies.jwt}` } } //req.body,{headers:{Cookie:`jwt=${req.cookies.jwt}`}}        //{title,description,img},{headers:req.headers}
      );
      post = response.data.data.post;
      if (!post) {
        throw "This is some kind of an internal server error";
      }
    } catch (err) {
      return res.status(500).render("user/userCreatePost", {
        layout: "main",
        title: "NEW POST",
        hasData: false,
        error: "Axios error",
      });
    }
    try {
      //Now Since the Post has been created
      if (!comment) {
        return res.redirect("/user/posts");
      } else {
        req.body = { ...{ comment: comment }, ...req.body };
        comment = help.checkString(comment);
        const response_2 = await axios.post(
          `http://localhost:3000/api/v1/posts/${post._id}/comments`,
          req.body,
          { headers: { Cookie: `jwt=${req.cookies.jwt}` } }
        );
        const post_2 = response_2.data.data.post;
        if (!post_2) {
          return res.status(500).render("user/userCreatePost", {
            layout: "main",
            title: "NEW POST",
            hasData: false,
            error: "Internal Server error, occured while creating comment",
          });
        }
        return res.redirect("/user/posts");
      }
    } catch (e) {
      return res.status(500).render("user/userCreatePost", {
        layout: "main",
        title: "NEW POST",
        hasData: false,
        error: "This seems to be kind of an Internal Server error",
      });
    }
  }
);

//////////////////UPDATE FUNCTION
router.get(
  "/update/post/:id",
  authController.protectRoute,
  async (req, res) => {
    let id;
    try {
      id = req.params.id;
      id = help.checkId(id);
    } catch (e) {
      return res.redirect("/user/get/myPosts");
    }
    try {
      const response = await axios.get(
        `http://localhost:3000/api/v1/posts/${id}`,
        { headers: req.headers }
      );
      const post = response.data.data.post;
      if (!post) {
        return res.redirect("/user/get/myPosts");
      }
      return res.render("user/postUpdateEntity", {
        layout: "userProfile.layout.handlebars",
        post,
        hasData: true,
        title: "UPDATE POST",
      });
    } catch (err) {
      return res.redirect("/user/get/myPosts");
    }
  }
);

//////////////////DELETE FUNCTION
router.get(
  "/delete/post/:id",
  authController.protectRoute,
  async (req, res) => {
    let id;
    try {
      id = req.params.id;
      id = help.checkId(id);
    } catch (e) {
      return res.redirect("/user/get/myPosts");
    }
    try {
      const response = await axios.get(
        `http://localhost:3000/api/v1/posts/${id}`,
        { headers: req.headers }
      );
      const post = response.data.data.post;
      if (!post) {
        return res.redirect("/user/get/myPosts");
      }
      return res.render("user/postDeleteEntity", {
        layout: "userProfile.layout.handlebars",
        post,
        hasData: true,
        title: "UPDATE POST",
      });
    } catch (err) {
      return res.redirect("/user/get/myPosts");
    }
  }
);

router.post(
  "/post/addComment",
  authController.protectRoute,
  async (req, res) => {
    let { id, comment } = req.body;

    //Checking if id and comment is there
    if (!id || !comment) {
      return res.redirect("/user/posts");
    }

    //Checking if id and comment is correct
    try {
      id = help.checkId(id);
      comment = help.checkString(comment);
    } catch (e) {
      return res.redirect("/user/posts");
    }

    try {
      const response = await axios.post(
        `http://localhost:3000/api/v1/posts/${id}/comments`,
        req.body,
        { headers: { Cookie: `jwt=${req.cookies.jwt}` } }
      );
      const post = response.data.data.post;
      if (!post) {
        return res.redirect("/user/posts");
      }

      return res.render("user/postEntity", {
        layout: "userHome.layout.handlebars",
        post,
        title: "POST",
        hasData: true,
        error: "",
      });
    } catch (err) {
      return res.redirect("/user/posts");
    }
  }
);

router.post("/update/post", authController.protectRoute, async (req, res) => {
  let { title, description, id, titleOld, descriptionOld, imageSrc } = req.body;
  console.log(req.body);

  try {
    id = help.checkId(id);
    title = help.checkString(title);
    description = help.checkString(description);
    titleOld = help.checkString(titleOld);
    descriptionOld = help.checkString(descriptionOld);
  } catch (e) {
    return res.status(400).render("user/postUpdateEntity", {
      layout: "userProfile.layout.handlebars",
      hasData: true,
      title: "UPDATE POST",
      post: {
        title: titleOld,
        description: descriptionOld,
        _id: id,
        img: imageSrc,
      },
      error: e,
    });
  }
  if (!id) {
    //This should never come to pass, but if it does, it could be because of lags
    return res.redirect("/user/get/myPosts");
  }
  if (!title || !description) {
    return res.status(400).render("user/postUpdateEntity", {
      layout: "userProfile.layout.handlebars",
      hasData: true,
      title: "UPDATE POST",
      post: {
        title: titleOld,
        description: descriptionOld,
        _id: id,
        img: imageSrc,
      },
      error: "The fields in the form cannot be empty or just spaces",
    });
  }

  try {
    if (title === titleOld && description === descriptionOld) {
      return res.status(400).render("user/postUpdateEntity", {
        layout: "userProfile.layout.handlebars",
        hasData: true,
        title: "UPDATE POST",
        post: {
          title: titleOld,
          description: descriptionOld,
          _id: id,
          img: imageSrc,
        },
        error: "No Change in the initial values",
      });
    }
    const response = await axios.patch(
      `http://localhost:3000/api/v1/posts/${id}`,
      req.body,
      { headers: { Cookie: `jwt=${req.cookies.jwt}` } }
    );
    const updatedPost = response.data.data.post;
    console.log("The updated post is : ", updatedPost);

    if (!updatedPost) {
      return res.status(500).render("user/postUpdateEntity", {
        layout: "userProfile.layout.handlebars",
        hasData: true,
        title: "UPDATE POST",
        post: {
          title: titleOld,
          description: descriptionOld,
          _id: id,
          img: imageSrc,
        },
        error: "Please Redo, there was a minor server error",
      });
    }
    //Redirect to the original page
    return res.redirect("/user/get/myPosts");
  } catch (err) {
    // console.log(err);
    return res.status(500).render("user/postUpdateEntity", {
      layout: "userProfile.layout.handlebars",
      hasData: true,
      title: "UPDATE POST",
      post: {
        title: titleOld,
        description: descriptionOld,
        _id: id,
        img: imageSrc,
      },
      error: "Connection Error, please try this later",
    });
  }
});
// router.post(
//   "/update/post",
//   authController.protectRoute,
//   async (req, res) => {
//     let {title,description,id} = req.body;
//     try
//     {
//       id = help.checkId(id);
//       title = help.checkString(title);
//       description = help.checkString(description);
//     }catch(e)
//     {
//       return res.render("user/postUpdateEntity", {
//         layout: "userProfile.layout.handlebars",
//         hasData:false,
//         title:"UPDATE POST",
//         error:"The fields in the form cannot be empty or just spaces"
//       });
//     }
//     if(!id)
//     {
//       //This should never come to pass, but if it does, it could be because of lags
//       return res.redirect("/user/get/myPosts");
//     }
//     if(!title || !description)
//     {
//       return res.render("user/postUpdateEntity", {
//         layout: "userProfile.layout.handlebars",
//         hasData:false,
//         title:"UPDATE POST",
//         error:"The fields in the form cannot be empty"
//       });
//     }

//     try {
//       const response =  await axios.patch(
//         `http://localhost:3000/api/v1/posts/${id}`,
//         req.body,{headers:{Cookie:`jwt=${req.cookies.jwt}`}}
//       );
//       const updatedPost = response.data.data.post;
//       console.log("The updated post is : ",updatedPost);

//       if(!updatedPost)
//       {
//         return res.render("user/postUpdateEntity", {
//           layout: "userProfile.layout.handlebars",
//           hasData:false,
//           title:"UPDATE POST",
//           error:"Internal Server Error"
//         });
//       }
//       //Redirect to the original page
//       return res.redirect("/user/get/myPosts");

//     } catch (err) {
//       // console.log(err);
//       return res.render("user/postUpdateEntity", {
//         layout: "userProfile.layout.handlebars",
//         hasData:false,
//         title:"UPDATE POST",
//         error:"Nothing Was Updated"
//       });
//     }
//   })

router.post("/delete/post", authController.protectRoute, async (req, res) => {
  let { title, img, description, id } = req.body;
  // console.log("THese are the contents of Req.BODY:",req.body);
  try {
    const response = await axios.delete(
      `http://localhost:3000/api/v1/posts/${id}`,
      { data: req.body, headers: { Cookie: `jwt=${req.cookies.jwt}` } }
    );
    const postDeletionResponse = response.data;
    // console.log("The post was : ",postDeletionResponse);

    //Redirect to the original page
    return res.redirect("/user/get/myPosts");
  } catch (err) {
    return res.redirect("/user/get/myPosts");
  }
});
router.get(
  "/:userName",
  authController.protectRoute,
  userControllerWeb.getUserFromUserName
);
export default router;
