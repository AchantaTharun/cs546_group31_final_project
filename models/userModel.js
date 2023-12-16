import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import * as Helpers from "../Helpers.js";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Please enter your first name"],
    trim: true,
    validate: [
      validator.isAlpha,
      "Please enter a valid first name, user name can only contain letters",
    ],
    minLength: [2, "First name must be at least 2 characters long"],
    maxLength: [20, "First name must be less than 20 characters long"],
  },
  lastName: {
    type: String,
    required: [true, "Please enter your last name"],
    trim: true,
    validate: [
      validator.isAlpha,
      "Please enter a valid last name,last name can only contain letters",
    ],
    minLength: [2, "Last name must be at least 2 characters long"],
    maxLength: [20, "Last name must be less than 20 characters long"],
  },
  userName: {
    type: String,
    required: [true, "Please enter your user name"],
    trim: true,
    unique: true,
    validate: [
      validator.isAlphanumeric,
      "Please enter a valid user name, user name can only contain letters and numbers",
    ],
    minLength: [2, "User name must be at least 2 characters long"],
    maxLength: [20, "User name must be less than 20 characters long"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    trim: true,
    unique: true,
    validate: [validator.isEmail, "Please enter a valid email"],
  },
  phone: {
    type: String,
    required: [true, "Please enter your phone number"],
    trim: true,
    unique: true,
    validate: [
      validator.isMobilePhone,
      "Please enter a valid phone number",
      "en-US",
    ],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    trim: true,
    minLength: [8, "Password must be at least 8 characters long"],
    maxLength: [20, "Password must be less than 20 characters long"],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    trim: true,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords do not match",
    },
  },
  location: {
    type: {
      type: String,
      default: "Point",
    },
    coordinates: { type: [Number], index: "2dsphere" },
  },
  passwordChangedAt: {
    type: Date,
  },
  isUser: {
    type: Boolean,
    default: true,
  },
  favoriteWorkout: {
    type: String,
    default: "cardio",
    enum: [
      "cardio",
      "strength",
      "flexibility",
      "sports",
      "crossFit",
      "bodyWeight",
    ],
    required: [true, "Please enter your favorite workout"],
    trim: true,
  },
  bio: {
    type: String,
    trim: true,
    minLength: [10, "Bio must be at least 10 characters long"],
    maxLength: [200, "Bio must be less than 200 characters long"],
  },
  dateOfBirth: {
    type: String,
    trim: true,
    validate: {
      validator: Helpers.isValidDOB,
      message: "Please enter a valid date of birth",
    },
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
  },
  height: {
    type: String,
    trim: true,
    validate: [validator.isNumeric, "Please enter a valid height"],
  },
  weight: {
    type: String,
    trim: true,
    validate: [validator.isNumeric, "Please enter a valid weight"],
  },
  hUnit: {
    type: String,
    enum: ["ft", "m"],
  },
  wUnit: {
    type: String,
    enum: ["lb", "kg"],
  },
  address: {
    street: {
      type: String,
      trim: true,
      minLength: [3, "Street must be at least 3 characters long"],
      maxLength: [50, "Street must be less than 50 characters long"],
    },
    apartment: {
      type: String,
      trim: true,
      minLength: [3, "Apartment must be at least 3 characters long"],
      maxLength: [50, "Apartment must be less than 50 characters long"],
    },
    city: {
      type: String,
      trim: true,
      minLength: [3, "City must be at least 3 characters long"],
      maxLength: [50, "City must be less than 50 characters long"],
    },
    state: {
      type: String,
      trim: true,
      uppercase: true,
      length: [2, "State must be 2 characters long"],
      validate: {
        validator: Helpers.checkState,
        message: "Please enter a valid state",
      },
    },
    zip: {
      type: String,
      trim: true,
      length: [5, "Zip must be 5 characters long"],
      validate: [validator.isNumeric, "Please enter a valid zip code"],
    },
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.isPasswordCorrect = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const passwordChangedAtTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < passwordChangedAtTimestamp;
  }
  return false;
};

const User = mongoose.model("User", userSchema);
export default User;
