import mongoose from "mongoose";
import validator from "validator";
import * as help from "../Helpers.js";

const rejectedRequestSchema = new mongoose.Schema({
  requestType: {
    type: String,
    enum: ["gym", "trainer"],
    required: [true, "Type of Rejected Request is required "],
  },
  email: {
    type: String,
    required: [true, "email is required"],
    validate: [{validator:validator.isEmail, 
      message:"Please enter a valid email"},
    {
      validator: help.emailc,
      message: "Please enter a valid email"
    }],
  },
  phone: {
    type: String,
    required: [true, "phone is required"],
    validate: [validator.isMobilePhone, "Please enter a valid phone number"],
  },
  reason: {
    type: String,
    trim: true,
    required: [true, "reason is required"],
  },
  rejectedAt: {
    type: Date,
    default: Date.now(),
  },
  address: {
    street: {
      type: String,
      required: [true, "Please enter your street"],
      trim: true,
      minLength: [3, "Street must be at least 3 characters long"],
      maxLength: [50, "Street must be less than 50 characters long"],
    },
    city: {
      type: String,
      required: [true, "Please enter your city"],
      trim: true,
      minLength: [3, "City must be at least 3 characters long"],
      maxLength: [50, "City must be less than 50 characters long"],
    },
    state: {
      type: String,
      required: [true, "Please enter your state"],
      trim: true,
      length: [2, "State must be 2 characters long"],
    },
    zip: {
      type: String,
      required: [true, "Please enter your zip"],
      trim: true,
    },
  },
});

const RejectedRequest = mongoose.model(
  "RejectedRequest",
  rejectedRequestSchema
);

export default RejectedRequest;
