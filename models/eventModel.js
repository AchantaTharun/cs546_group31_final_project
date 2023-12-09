import mongoose from "mongoose";
import validator from "validator";
import * as help from "../Helpers.js";

// Not Complete
const eventSchema = new mongoose.Schema({
  img: {
    type: String,
    required: [true, "Please enter the image"],
    trim: true,
    validate:[help.checkIdtf,"Enter a valid Image Id"]
  },
  title: {
    type: String,
    required: [true, "Please enter the title"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please enter the description"],
    trim: true,
  },
  contactEmail: {
    type: String,
    required: [true, "Please enter the contactEmail"],
    trim: true,
    validate: [
    {
      validator:validator.isEmail, 
      message:"Please enter a valid email"},
    {
      validator:help.emailc,
      message:"Enter Valid Email Address"
    }
  ]
  },
  eventLocation: {
    streetAddress: {
      type: String,
      required: [true, "Please enter the streetAddress"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "Please enter the city"],
      trim: true,
    },
    state: {
      type: String,
      required: [true, "Please enter the state"],
      trim: true,
      uppercase: true,
      validate: {
        validator: function (el) {
          const states = [
            "AL",
            "AK",
            "AZ",
            "AR",
            "CA",
            "CO",
            "CT",
            "DE",
            "FL",
            "GA",
            "HI",
            "ID",
            "IL",
            "IN",
            "IA",
            "KS",
            "KY",
            "LA",
            "ME",
            "MD",
            "MA",
            "MI",
            "MS",
            "MO",
            "MT",
            "NE",
            "NV",
            "NH",
            "NJ",
            "NM",
            "NY",
            "NC",
            "ND",
            "OH",
            "OK",
            "OR",
            "PA",
            "RI",
            "SC",
            "SD",
            "TN",
            "TX",
            "UT",
            "VT",
            "VA",
            "WA",
            "WV",
            "WI",
          ];
          return el.length === 2 && states.includes(el.toUpperCase());
        },
        message: "Please enter a valid state",
      },
    },
    zipCode: {
      type: String,
      required: [true, "Please enter the zipCode"],
      trim: true,
      validate: {
        validator: function (el) {
          return el.length === 5 && validator.isNumeric(el);
        },
        message: "Please enter a valid zip code",
      },
    },
  },

  maxCapacity: {
    type: Number,
    required: [true, "Please enter the maxCapacity"],
    trim: true,
    validate: {
      validator: function (el) {
        return el >= 0;
      },
      message: "Please enter a valid maxCapacity",
    },
  },
  priceOfAdmission: {
    type: Number,
    required: [true, "Please enter the priceOfAdmission"],
    trim: true,
    validate: {
      validator: function (el) {
        return el >= 0;
      },
      message: "Please enter a valid priceOfAdmission",
    },
  },
  comments: [
    {
      userId: {
        type: mongoose.Schema.ObjectId,
        ref: "User" || "Trainer" || "Gym",
      },
      comment: {
        type: String,
        required: [true, "Please enter the comment"],
        trim: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
      },
    },
  ],
  user: {
    userId: {
      type: String,
    },
    userType: {
      type: String,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
  startTime: {
    type: String,
    required: [true, "Please enter the startTime"],
    trim: true,
    validate: [{
      validator: function (el) {
        return ((new Date(el) ) >= (new Date()));
      },
      message: "Please enter a valid startTime",
    },
    {
      validator: help.dateCheck,
      message: "You have to enter a valid startTime"
    }
  ]
  },
  endTime: {
    type: String,
    required: [true, "Please enter the endTime"],
    trim: true,
    validate: [{
      validator: function (el) {
        return (new Date(el)) > new Date(this.startTime);
      },
      message: "The End time is not ordered properly",
    },
    {
      validator:help.dateCheck,
      message: "The End time is invalid"
    }
  ]
  },

  totalNumberOfAttendees: {
    type: Number,
    required: [true, "Please enter the totalNumberOfAttendees"],
    trim: true,
    validate: {
      validator: function (el) {
        return el >= 0;
      },
      message: "Please enter a valid totalNumberOfAttendees",
    },
  },
  // needs to change
  attendees: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User" || "Trainer" || "Gym",
    },
  ],
});


const Event = mongoose.model("Event", eventSchema);

export default Event;
