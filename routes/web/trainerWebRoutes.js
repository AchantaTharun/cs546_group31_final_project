import { Router } from "express";
import Trainer from "../../models/trainerModel.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import * as authController from "../../controllers/authController.js";
import * as trainerController from "../../controllers/trainerController.js";
import moment from "moment";
import axios from "axios";

const router = Router();

router.get("/signup", async (req, res) => {
  return res.render("trainer/trainerSignUp", { layout: "main" });
});

router.post("/signup", authController.trainerSignup);

router.get("/login", async (req, res) => {
  return res.render("trainer/trainerLogin", { layout: "main" });
});

router.get("/profile", async (req, res) => {
  return res.render("trainer/trainerProfile", { layout: "trainerHome" });
});

router.get(
  "/mealplans",
  authController.protectRoute,
  trainerController.renderTrainerMealPlans
);

router.get(
  "/mealplans/create",
  authController.protectRoute,
  trainerController.renderTrainerMealPlansCreate
);

router.get(
  "/mealplans/edit",
  authController.protectRoute,
  trainerController.renderTrainerMealPlansEdit
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

    return res.render("trainer/trainerEvents", {
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
        message: err.response.data.errors[0] // 'No events have been made yet'
      });
    }
    return res.render("trainer/trainerEvents", {
      layout: "trainerHome.handlebars",
      events: [],
      user,
      message: "An error occurred while fetching events."
    });
  }
});

router.get("/posts", authController.protectRoute, async (req, res) => {
  const trainer = req.trainer;
  return res.render("trainer/trainerPosts", {
    trainer: trainer.toObject(),
    type: "trainer",
    layout: "trainerHome",
  });
});

router.get("/events/createEvent",
  authController.protectRoute,
  async (req, res) => {
    return res.render("trainer/trainerCreateEvent", {
      layout: "trainerHome.handlebars",
      userId: req.trainer._id
    });
  }
);

router.post("/events/createEvent", authController.protectRoute, async (req, res) => {
  let user = req.trainer;
  user = Object.assign({}, user, {_id: user._id});
  
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

    return res.redirect(`/trainer/events?message=${encodeURIComponent(message)}`);

  } catch (err) {
    return res.render("trainer/trainerCreateEvent", { 
      layout: "trainerHome.handlebars",
      errors: err.response.data.errors,
      user: user._id.toString(),
    });
  }
});

router.get("/events/details/:eventId", authController.protectRoute, async (req, res) => {
  const user = req.trainer;
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

    return res.redirect(`/trainer/events?message=${encodeURIComponent(message)}`)
    }
   catch (err) {

    return res.redirect(`/trainer/events?message=${encodeURIComponent(err.response.data.errors[0])}`);
}
});

router.post("/events/rsvp/:eventId/:attendeeId/remove", authController.protectRoute, async (req, res) => {
  const user = req.trainer;
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
 
    return res.render("trainer/trainerEvents", {
      layout: "trainerHome.handlebars",
      events,
      user,
      message: "You have successfully withdrawn your RSVP."
    });
  } catch (err) {

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
   
      return res.render("trainer/trainerEvents", {
        layout: "trainerHome.handlebars",
        events,
        user,
        message
      });
    } catch (error) {
      console.error(error);
      return res.render("trainer/trainerEvents", {
        layout: "trainerHome.handlebars",
        events: [],
        user,
        message: "Failed to fetch events."
      });
    }
  }
});

router.post('/events/delete/:eventId', authController.protectRoute, async (req, res) => {
  const eventId = req.params.eventId;
  const user = req.trainer;

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
 
    return res.render("trainer/trainerEvents", {
      layout: "trainerHome.handlebars",
      events,
      user,
      message: "Event successfully deleted."
    });
  } catch (error) {
    
    if (error.response && error.response.data && error.response.data.errors) {
      return res.render("trainer/trainerEvents", {
        layout: "trainerHome.handlebars",
        events: [],
        user,
        message: "Event successfully deleted. "+error.response.data.errors[0] // 'No events have been made yet'
      });
    }
    return res.render("trainer/trainerEvents", {
      layout: "trainerHome.handlebars",
      events: [],
      user,
      message: "Uh-oh an error occurred while fetching events."
    });
  }
  }
);

router.get("/events/edit/:eventId",
  authController.protectRoute, async (req, res) => {
    const inheritedUser = req.trainer;
    const user = Object.assign({}, inheritedUser, {_id: inheritedUser._id});
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
        user: user.toObject()
      });
    }
  });

router.post("/events/update/:eventId", authController.protectRoute, async (req, res) => {
   const inheritedUser = req.trainer;
  const eventId = req.params.eventId;
  const user = Object.assign({}, inheritedUser, {_id: inheritedUser._id});
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
    

    let isEventCreator = (user._id == event.user.userId);

    event.eventDate = moment(event.eventDate).format('LL');
    event.startTime = moment(event.startTime).format('LT');
    event.endTime = moment(event.endTime).format('LT');


    return res.render("trainer/trainerEventDetails", {
      layout: "trainerHome.handlebars",
      event,
      user,
      isEventCreator,
      message: "Event details updated successfully!"
    });
  } catch (err) {
    
    if (err.response && err.response.data && err.response.data.errors) {
      return res.redirect(`/trainer/events/edit/${eventId}?message=${encodeURIComponent(err.response.data.errors[0])}`);
    }
    return res.render("trainer/trainerUpdateEvent", {
      layout: "trainerHome.handlebars",
      events: [],
      user,
      message: "An error occurred while fetching events."
    });
  }
  
});


router.get(
  "/:sessionId/users",
  authController.protectRoute,
  trainerController.renderTrainerSessionUsers
);
export default router;
