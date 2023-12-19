import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import * as help from "../Helpers.js";

const gymSchema = new mongoose.Schema({
  gymName: {
    type: String,
    required: [true, "Please enter your name"],
    trim: true,
    minLength: [3, "Gym Name must be at least 3 characters long"],
    maxLength: [50, "Gym Name must be less than 50 characters long"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    trim: true,
    validate: [validator.isEmail, "Please enter a valid email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    trim: true,
    minLength: [8, "Password must be at least 8 characters long"],
  },
  passwordConfirm: {
    type: String,
    trim: true,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords do not match",
    },
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
      length: [5, "Zip must be 5 characters long"],
    },
  },
  phone: {
    type: String,
    required: [true, "Please enter your phone number"],
    trim: true,
    length: [10, "Phone number must be 10 characters long"],
    unique: true,
  },
  ownerFName: {
    type: String,
    required: [true, "Please enter your name"],
    trim: true,
    minLength: [3, "Owner Name must be at least 3 characters long"],
    maxLength: [50, "Owner Name must be less than 50 characters long"],
  },
  ownerLName: {
    type: String,
    required: [true, "Please enter your name"],
    trim: true,
    minLength: [3, "Owner Name must be at least 3 characters long"],
    maxLength: [50, "Owner Name must be less than 50 characters long"],
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  passwordChangedAt: {
    type: Date,
  },
  // businessLicense: {
  //   type: String,
  //   required: [true, "Please upload your business license"],
  // },
  isGym: {
    type: Boolean,
    default: true,
  },
  reason: {
    type: String,
    trim: true,
  },
  ratings: [
    {
      comment: {
        type: String,
        trim: true,
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      ratedBy: {
        type: String,
      },
      raterType: {
        type: String,
        enum: ["User", "Trainer", "Gym"],
      },
    },
  ],
  ratingAvg: {
    type: Number,
    default: 0,
  },
  members: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      membership: {
        startDate: {
          type: Date,
        },
        endDate: {
          type: Date,
        },
      },
    },
  ],
  following: {
    users: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    gyms: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Gym",
      },
    ],
    trainers: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Trainer",
      },
    ],
  },
  followers: {
    users: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    gyms: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Gym",
      },
    ],
    trainers: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Trainer",
      },
    ],
  },
  location: {
    type: {
      type: String,
      default: "Point",
    },
    coordinates: { type: [Number], index: "2dsphere" },
  },
});

gymSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});

gymSchema.methods.isPasswordCorrect = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const Gym = mongoose.model("Gym", gymSchema);

export default Gym;
