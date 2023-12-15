import mongoose from "mongoose";
import validator from "validator";
import * as help from "../Helpers.js";


const eventSchema = new mongoose.Schema({
  img: {
    type: String,
    required: [true, "Please enter the image"],
    trim: true,
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
        validator: validator.isEmail,
        message: "Please enter a valid email",
      },
      {
        validator: help.emailc,
        message: "Enter Valid Email Address",
      },
    ],
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
  eventDate: {
    //It has to be taken from date time local
    type: Date,
    required: [true, "Please enter the eventDate"],
    trim: true,
    validate: {
      validator: function (el) {
        return el >= (new Date());
      },
      message: "Please enter a valid eventDate",
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
    type: Date,
    required: [true, "Please enter the startTime"],
    trim: true,
    validate: [
      {
        validator: function (el) {
          return el >= this.eventDate;
        },
        message: "Please enter a valid startTime",
      },
      {
        validator: function (el) {
          return isSameDay(this.eventDate, el);
        },
        message: "StartTime and evenDate must represent the same day",
      },
    ],
  },
  endTime: {
    type: Date,
    required: [true, "Please enter the endTime"],
    trim: true,
    validate: [
      {
        validator: function (el) {
          return el >= this.startTime;
        },
        message: "Please enter a valid endTime",
      },
      {
        validator: function (el) {
          return isSameDay(this.startTime, el);
        },
        message: "StartTime and EndTime must be on the same day",
      },
    ],
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

  attendees: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User" || "Trainer" || "Gym",
    },
  ],
},{
  timestamps: true
});

function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
}

const Event = mongoose.model("Event", eventSchema);

export default Event;
