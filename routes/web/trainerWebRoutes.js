import { Router } from "express";
import Trainer from "../../models/trainerModel.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import * as authController from "../../controllers/authController.js";
import * as trainerController from "../../controllers/trainerController.js";
axios.defaults.withCredentials = true;
import { generateUploadURL } from "../../utils/s3.js";
import multer from "multer";
import axios from "axios";
import * as help from "../../Helpers.js";
import moment from "moment";

const router = Router();

router.get("/signup", async (req, res) => {
  return res.render("trainer/trainerSignUp", { layout: "main" });
});

router.post("/signup", authController.trainerSignup);

router.get("/login", async (req, res) => {
  return res.render("trainer/trainerLogin", { layout: "main" });
});

router.get(
  "/profile",
  authController.protectRoute,
  trainerController.renderTrainerProfile
);

router.get(
  "/profile/info",
  authController.protectRoute,
  trainerController.renderTrainerProfileInfo
);
router.post(
  "/profile",
  authController.protectRoute,
  trainerController.updateTrainerProfile
);

router.get(
  "/mealplans",
  authController.protectRoute,
  trainerController.renderTrainerMealPlans
);

router.get(
  "/followers",
  authController.protectRoute,
  trainerController.renderTrainerFollowers
);

router.get(
  "/mealplans/create",
  authController.protectRoute,
  trainerController.renderTrainerMealPlansCreate
);

router.get(
  "/mealplans/delete/:mealplanId",
  authController.protectRoute,
  trainerController.renderTrainerMealPlanDelete
);

router.post("/login", authController.trainerLogin);

router.get(
  "/dashboard",
  authController.protectRoute,
  trainerController.renderTrainerDashboard
);

router.get(
  "/sessions",
  authController.protectRoute,
  trainerController.renderTrainerSessions
);

router.get("/gyms", authController.protectRoute, async (req, res) => {
  const trainer = req.trainer;
  return res.render("trainer/trainerGyms", {
    name: trainer.trainerName,
    type: "trainer",
  });
});

router.get("/events", authController.protectRoute, async (req, res) => {
  const user = req.trainer;
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

    return res.render("trainer/trainerEvents", {
      trainer: req.trainer.toObject(),
      layout: "trainerHome.handlebars",
      events,
      user,
      message: req.query.message,
    });
  } catch (err) {
    if (err.response && err.response.data && err.response.data.errors) {
      return res.render("trainer/trainerEvents", {
        layout: "trainerHome.handlebars",
        events: [],
        user,
        message: err.response.data.errors[0], // 'No events have been made yet'
      });
    }
    return res.render("trainer/trainerEvents", {
      layout: "trainerHome.handlebars",
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
    return res.render("trainer/trainerCreateEvent", {
      layout: "trainerHome.handlebars",
      userId: req.trainer._id,
    });
  }
);

router.post(
  "/events/createEvent",
  authController.protectRoute,
  async (req, res) => {
    let user = req.trainer;
    user = Object.assign({}, user, { _id: user._id });

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
        `/trainer/events?message=${encodeURIComponent(message)}`
      );
    } catch (err) {
      return res.render("trainer/trainerCreateEvent", {
        layout: "trainerHome.handlebars",
        errors: err.response.data.errors,
        user: user._id.toString(),
      });
    }
  }
);

router.get(
  "/events/details/:eventId",
  authController.protectRoute,
  async (req, res) => {
    const user = req.trainer;
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

      return res.render("trainer/trainerEventDetails", {
        layout: "trainerHome.handlebars",
        event,
        user: user.toObject(),
        isEventCreator,
      });
    } catch (err) {
      return res.render("trainer/trainerEventDetails", {
        layout: "trainerHome.handlebars",
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
        `/trainer/events?message=${encodeURIComponent(message)}`
      );
    } catch (err) {
      return res.redirect(
        `/trainer/events?message=${encodeURIComponent(
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
    const user = req.trainer;
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

      return res.render("trainer/trainerEvents", {
        layout: "trainerHome.handlebars",
        events,
        user,
        message: "You have successfully withdrawn your RSVP.",
      });
    } catch (err) {
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

        return res.render("trainer/trainerEvents", {
          layout: "trainerHome.handlebars",
          events,
          user,
          message,
        });
      } catch (error) {
        console.error(error);
        return res.render("trainer/trainerEvents", {
          layout: "trainerHome.handlebars",
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
    const user = req.trainer;

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

      return res.render("trainer/trainerEvents", {
        layout: "trainerHome.handlebars",
        events,
        user,
        message: "Event successfully deleted.",
      });
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        return res.render("trainer/trainerEvents", {
          layout: "trainerHome.handlebars",
          events: [],
          user,
          message:
            "Event successfully deleted. " + error.response.data.errors[0], // 'No events have been made yet'
        });
      }
      return res.render("trainer/trainerEvents", {
        layout: "trainerHome.handlebars",
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
    const inheritedUser = req.trainer;
    const user = Object.assign({}, inheritedUser, { _id: inheritedUser._id });
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

      return res.render("trainer/trainerUpdateEvent", {
        layout: "trainerHome.handlebars",
        event,
        user,
        states,
        message,
      });
    } catch (err) {
      return res.render("trainer/trainerEventDetails", {
        layout: "trainerHome.handlebars",
        errors: err.response.data.errors,
        user: user,
      });
    }
  }
);

router.post(
  "/events/update/:eventId",
  authController.protectRoute,
  async (req, res) => {
    const inheritedUser = req.trainer;
    const eventId = req.params.eventId;
    const user = Object.assign({}, inheritedUser, { _id: inheritedUser._id });
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

      let isEventCreator = user._id == event.user.userId;

      event.eventDate = moment(event.eventDate).format("LL");
      event.startTime = moment(event.startTime).format("LT");
      event.endTime = moment(event.endTime).format("LT");

      return res.render("trainer/trainerEventDetails", {
        layout: "trainerHome.handlebars",
        event,
        user,
        isEventCreator,
        message: "Event details updated successfully!",
      });
    } catch (err) {
      if (err.response && err.response.data && err.response.data.errors) {
        return res.redirect(
          `/trainer/events/edit/${eventId}?message=${encodeURIComponent(
            err.response.data.errors[0]
          )}`
        );
      }
      return res.render("trainer/trainerUpdateEvent", {
        layout: "trainerHome.handlebars",
        events: [],
        user,
        message: "An error occurred while fetching events.",
      });
    }
  }
);

router.get(
  "/:sessionId/users",
  authController.protectRoute,
  trainerController.renderTrainerSessionUsers
);

//For reference
// router.get("/posts", authController.protectRoute, async (req, res) => {
//   const trainer = req.trainer;
//   return res.render("trainer/trainerPosts", {
//     trainer: trainer.toObject(),
//     type: "trainer",
//     layout: "trainerHome",
//   });
// });

///////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
//All the functions, I will consider their order later:
router.get("/get/myPosts", authController.protectRoute, async (req, res) => {
  const user = req.trainer;
  let posts = [];
  try {
    const response = await axios.get(
      "http://localhost:3000/api/v1/posts/get/myPosts",
      { headers: req.headers }
    );
    posts = response.data.data.posts;
    if (!posts)
      return res.render("trainer/trainerMyPosts", {
        layout: "trainerHome.handlebars",
        posts,
        user,
        title: "MY POSTS",
        trainer: req.trainer.toObject(),
      });
    return res.render("trainer/trainerMyPosts", {
      layout: "trainerHome.handlebars",
      posts,
      user,
      title: "MY POSTS",
      trainer: req.trainer.toObject(),
    });
  } catch (err) {
    return res.render("trainer/trainerMyPosts", {
      layout: "trainerHome.handlebars",
      posts,
      user,
      title: "MY POSTS",
      trainer: req.trainer.toObject(),
    });
  }
});

router.get("/posts", authController.protectRoute, async (req, res) => {
  const user = req.trainer;
  let posts = [];
  try {
    const response = await axios.get("http://localhost:3000/api/v1/posts", {
      data: req.body,
      headers: { Cookie: `jwt=${req.cookies.jwt}` },
    }); //This had to be added.
    posts = response.data.data.posts;
    // console.log(response.data.data.posts);
    return res.render("trainer/trainerPosts", {
      layout: "trainerHome.handlebars",
      posts,
      user,
      trainer: req.trainer.toObject(),
    });
  } catch (err) {
    posts = [];
    return res.render("trainer/trainerPosts", {
      layout: "trainerHome.handlebars",
      posts,
      user,
      trainer: req.trainer.toObject(),
    });
  }
});

/////////////
router.get("/post/:id", authController.protectRoute, async (req, res) => {
  let id = undefined;
  try {
    id = req.params.id;
    id = help.checkId(id);
  } catch (e) {
    return res.redirect("/trainer/posts");
  }
  try {
    const response = await axios.get(
      `http://localhost:3000/api/v1/posts/${id}`,
      { headers: req.headers }
    );
    const post = response.data.data.post;
    return res.render("trainer/postEntity", {
      layout: "trainerHome.handlebars",
      post,
      hasData: true,
    });
  } catch (err) {
    return res.redirect("/trainer/posts");
  }
});

//////////////////////
//We have to make a new create new post function
router.get("/create/newPosts", async (req, res) => {
  return res.render("trainer/trainerCreatePost", {
    layout: "trainerHome.handlebars",
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
      img = url.split("?")[0];
      console.log({ img });
      /////////////////////////////////////////////////////////////////////////////////////////////////////////////
    } catch (e) {
      return res.status(400).render("trainer/trainerCreatePost", {
        layout: "trainerHome.handlebars",
        title: "NEW POST",
        hasData: false,
        error: "IMAGE UPLOAD ERROR",
      });
    }
    let { title, description, comment } = req.body;
    req.body = {
      ...{ title: title, description: description, img: img },
      ...req.body,
    };
    if (!title || !img || !description) {
      return res.status(400).render("trainer/trainerCreatePost", {
        layout: "trainerHome.handlebars",
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
      return res.status(400).render("trainer/trainerCreatePost", {
        layout: "trainerHome.handlebars",
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
      return res.status(500).render("trainer/trainerCreatePost", {
        layout: "trainerHome.handlebars",
        title: "NEW POST",
        hasData: false,
        error: "Axios error",
      });
    }
    try {
      //Now Since the Post has been created
      if (!comment) {
        return res.redirect("/trainer/posts");
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
          return res.status(500).render("trainer/trainerCreatePost", {
            layout: "trainerHome.handlebars",
            title: "NEW POST",
            hasData: false,
            error: "Internal Server error, occured while creating comment",
          });
        }
        return res.redirect("/trainer/posts");
      }
    } catch (e) {
      return res.status(500).render("trainer/trainerCreatePost", {
        layout: "trainerHome.handlebars",
        title: "NEW POST",
        hasData: false,
        error: "This seems to be kind of an Internal Server error",
      });
    }
  }
);
//////////////////UPDATE FUNCTION [BASICALLY JUST USED FOR RENDERING]
router.get(
  "/update/post/:id",
  authController.protectRoute,
  async (req, res) => {
    let id;
    try {
      id = req.params.id;
      id = help.checkId(id);
    } catch (e) {
      return res.redirect("/trainer/get/myPosts");
    }
    try {
      const response = await axios.get(
        `http://localhost:3000/api/v1/posts/${id}`,
        { headers: req.headers }
      );
      const post = response.data.data.post;
      if (!post) {
        return res.redirect("/trainer/get/myPosts");
      }
      return res.render("trainer/postUpdateEntity", {
        layout: "trainerHome.handlebars",
        post,
        hasData: true,
        title: "UPDATE POST",
      });
    } catch (err) {
      return res.redirect("/trainer/get/myPosts");
    }
  }
);
////////////////////////////////SECOND UPDATE FOR PROCESSING
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
    return res.status(400).render("trainer/postUpdateEntity", {
      layout: "trainerHome.handlebars",
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
    return res.redirect("/trainer/get/myPosts");
  }
  if (!title || !description) {
    return res.status(400).render("trainer/postUpdateEntity", {
      layout: "trainerHome.handlebars",
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
      return res.status(400).render("trainer/postUpdateEntity", {
        layout: "trainerHome.handlebars",
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
      return res.status(500).render("trainer/postUpdateEntity", {
        layout: "trainerHome.handlebars",
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
    return res.redirect("/trainer/get/myPosts");
  } catch (err) {
    // console.log(err);
    return res.status(500).render("trainer/postUpdateEntity", {
      layout: "trainerHome.handlebars",
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

////////////////////////////////ADD COMMENTS
router.post(
  "/post/addComment",
  authController.protectRoute,
  async (req, res) => {
    let { id, comment } = req.body;

    //Checking if id and comment is there
    if (!id || !comment) {
      return res.redirect("/trainer/posts");
    }

    //Checking if id and comment is correct
    try {
      id = help.checkId(id);
      comment = help.checkString(comment);
    } catch (e) {
      return res.redirect("/trainer/posts");
    }

    try {
      const response = await axios.post(
        `http://localhost:3000/api/v1/posts/${id}/comments`,
        req.body,
        { headers: { Cookie: `jwt=${req.cookies.jwt}` } }
      );
      const post = response.data.data.post;
      if (!post) {
        return res.redirect("/trainer/posts");
      }

      return res.render("trainer/postEntity", {
        layout: "trainerHome.handlebars",
        post,
        title: "POST",
        hasData: true,
        error: "",
      });
    } catch (err) {
      return res.redirect("/trainer/posts");
    }
  }
);

/////////////////////////////////////DELETE FUNCTION 1
router.get(
  "/delete/post/:id",
  authController.protectRoute,
  async (req, res) => {
    let id;
    try {
      id = req.params.id;
      id = help.checkId(id);
    } catch (e) {
      return res.redirect("/trainer/get/myPosts");
    }
    try {
      const response = await axios.get(
        `http://localhost:3000/api/v1/posts/${req.params.id}`,
        { headers: req.headers }
      );
      const post = response.data.data.post;
      if (!post) {
        return res.redirect("/trainer/get/myPosts");
      }
      return res.render("trainer/postDeleteEntity", {
        layout: "trainerHome.handlebars",
        post,
        hasData: true,
        title: "UPDATE POST",
      });
    } catch (err) {
      return res.redirect("/trainer/get/myPosts");
    }
  }
);

////////////////////////////////DELETE FUNCTION 2
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
    return res.redirect("/trainer/get/myPosts");
  } catch (err) {
    return res.redirect("/trainer/get/myPosts");
  }
});

//////////////////////////////////NEED TO KEEP THIS AT THE END
// router.get(
//   "/:userName",
//   authController.protectRoute,
//   userControllerWeb.getUserFromUserName
// );
export default router;
