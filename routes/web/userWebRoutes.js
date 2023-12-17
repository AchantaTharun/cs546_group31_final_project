import { Router } from "express";
import * as authController from "../../controllers/authController.js";
import axios from "axios";
import moment from "moment";
import { generateUploadURL } from "../../utils/s3.js";
import multer from "multer";

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
    const response = await axios.get("http://localhost:3000/api/v1/events/", {
      headers: { Cookie: `jwt=${req.cookies.jwt}` }
    });
    
    let events = response.data.data.events;
   
   const nowUTC = moment.utc();
   events = events.filter(event => {
     const eventDateUTC = moment.utc(event.eventDate);
     return eventDateUTC.isSameOrAfter(nowUTC);
   });

   events.sort((a, b) => moment.utc(a.eventDate).diff(moment.utc(b.eventDate)));

    events.forEach(event => {
      event.eventDate = moment.utc(event.eventDate).local().format('LL');
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


router.get("/events/createEvent",
  authController.protectRoute,
  async (req, res) => {
    return res.render("user/userCreateEvent", {
      layout: "userCreateEvent.layout.handlebars",
      user: req.user.toObject()
    });
  }
);

router.post("/events/createEvent", authController.protectRoute, async (req, res) => {
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

    let message = "Event Created Successfully!";

    return res.redirect(`/user/events?message=${encodeURIComponent(message)}`);

  } catch (err) {
    return res.render("user/userCreateEvent", { 
      layout: "userHome.layout.handlebars",
      errors: err.response.data.errors,
      user: user.toObject()
    });
  }
});

router.get("/events/details/:eventId", authController.protectRoute, async (req, res) => {
  const user = req.user;
  const eventId = req.params.eventId;
  try {
    const response = await axios.get(`http://localhost:3000/api/v1/events/${eventId}`, {
      headers: {
        Cookie: `jwt=${req.cookies.jwt}`
      }
    });
    let event = response.data.data.event; 

    event.eventDate = moment(event.eventDate).format('LL');
    event.startTime = moment(event.startTime).format('LT');
    event.endTime = moment(event.endTime).format('LT');

    let isEventCreator = (user._id == event.user.userId);

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
      user: user.toObject()
    });
  }
});

router.post("/events/rsvp/:eventId/:attendeeId", authController.protectRoute, async (req, res) => {
  try {
    const response = await axios.post(
      `http://localhost:3000/api/v1/events/${req.params.eventId}/${req.params.attendeeId}`,
      {},
      { headers: { Cookie: `jwt=${req.cookies.jwt}` } }
    );     
    
    let message = "You are successfully registered for the event!";

    return res.redirect(`/user/events?message=${encodeURIComponent(message)}`)
    }
   catch (err) {

    return res.redirect(`/user/events?message=${encodeURIComponent(err.response.data.errors[0])}`);
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
    let events = response.data.data.events;

    const nowUTC = moment.utc();
    events = events.filter(event => {
      const eventDateUTC = moment.utc(event.eventDate);
      return eventDateUTC.isSameOrAfter(nowUTC);
    });
 
    events.sort((a, b) => moment.utc(a.eventDate).diff(moment.utc(b.eventDate)));
 
     events.forEach(event => {
       event.eventDate = moment.utc(event.eventDate).local().format('LL');
     });
 
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
      let events = response.data.data.events;

      const nowUTC = moment.utc();
      events = events.filter(event => {
        const eventDateUTC = moment.utc(event.eventDate);
        return eventDateUTC.isSameOrAfter(nowUTC);
      });
   
      events.sort((a, b) => moment.utc(a.eventDate).diff(moment.utc(b.eventDate)));
   
       events.forEach(event => {
         event.eventDate = moment.utc(event.eventDate).local().format('LL');
       });
   
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

router.post('/events/delete/:eventId', authController.protectRoute, async (req, res) => {
  const eventId = req.params.eventId;
  const user = req.user;

  try {
    const response1 = await axios.delete(`http://localhost:3000/api/v1/events/${eventId}`, {
      headers: { Cookie: `jwt=${req.cookies.jwt}` }
    });
    const response2 = await axios.get("http://localhost:3000/api/v1/events/", {
      headers: { Cookie: `jwt=${req.cookies.jwt}` }
    });

    let events = response2.data.data.events;
    const nowUTC = moment.utc();
    events = events.filter(event => {
      const eventDateUTC = moment.utc(event.eventDate);
      return eventDateUTC.isSameOrAfter(nowUTC);
    });
 
    events.sort((a, b) => moment.utc(a.eventDate).diff(moment.utc(b.eventDate)));
 
     events.forEach(event => {
       event.eventDate = moment.utc(event.eventDate).local().format('LL');
     });
 
    return res.render("user/userEvents", {
      layout: "userHome.layout.handlebars",
      events,
      user,
      message: "Event successfully deleted."
    });
  } catch (error) {
    console.error(error);
    if (error.response && error.response.data && error.response.data.errors) {
      return res.render("user/userEvents", {
        layout: "userHome.layout.handlebars",
        events: [],
        user,
        message: "Event successfully deleted. "+error.response.data.errors[0] // 'No events have been made yet'
      });
    }
    return res.render("user/userEvents", {
      layout: "userHome.layout.handlebars",
      events: [],
      user,
      message: "Uh-oh an error occurred while fetching events."
    });
  }
  }
);

router.get("/events/edit/:eventId",
  authController.protectRoute, async (req, res) => {
    const inheritedUser = req.user;
    const eventId = req.params.eventId;
    let message =  req.query.message ? req.query.message : "";
    
    try {
      const response = await axios.get(`http://localhost:3000/api/v1/events/${eventId}`, {
        headers: {
          Cookie: `jwt=${req.cookies.jwt}`
        }
      });
      let event = response.data.data.event; 
      event.eventDate = moment(event.eventDate).format('YYYY-MM-DD');
      event.startTime = moment(event.startTime).format('HH:mm');
      event.endTime = moment(event.endTime).format('HH:mm');    

      const user = Object.assign({}, inheritedUser, {_id: inheritedUser._id});

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
        { abbreviation: "WY", name: "Wyoming" }
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
  });

router.post("/events/update/:eventId", authController.protectRoute, async (req, res) => {
   const inheritedUser = req.user;
  const eventId = req.params.eventId;
  try { 

    const response1 = await axios.patch(
      `http://localhost:3000/api/v1/events/${eventId}`,
      req.body,
      {
        headers: {
          Cookie: `jwt=${req.cookies.jwt}`
        }
      }
    );

      const response = await axios.get(`http://localhost:3000/api/v1/events/${eventId}`, {
        headers: {
          Cookie: `jwt=${req.cookies.jwt}`
        }
      });
      let event = response.data.data.event; 
      const user = Object.assign({}, inheritedUser, {_id: inheritedUser._id});

    let isEventCreator = (user._id == event.user.userId);

    event.eventDate = moment(event.eventDate).format('LL');
    event.startTime = moment(event.startTime).format('LT');
    event.endTime = moment(event.endTime).format('LT');


    return res.render("user/userEventDetails", {
      layout: "userHome.layout.handlebars",
      event,
      user,
      isEventCreator,
      message: "Event details updated successfully!"
    });
  } catch (err) {
    
    if (err.response && err.response.data && err.response.data.errors) {
      return res.redirect(`/user/events/edit/${eventId}?message=${encodeURIComponent(err.response.data.errors[0])}`);
    }
    return res.render("user/userEvents", {
      layout: "userHome.layout.handlebars",
      events: [],
      user,
      message: "An error occurred while fetching events."
    });
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
  
}
});

router.get("/:userName", authController.protectRoute, async (req, res) => {
  const user = req.user;
  
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
