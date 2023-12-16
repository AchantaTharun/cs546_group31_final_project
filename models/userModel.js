import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

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
    type: Date,
    trim: true,
    validate: [validator.isDate, "Please enter a valid date of birth"],
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
  },
  height: {
    type: Number,
    trim: true,
    validate: [validator.isNumeric, "Please enter a valid height"],
  },
  weight: {
    type: Number,
    trim: true,
    validate: [validator.isNumeric, "Please enter a valid weight"],
  },
  hUnit: {
    type: String,
    enum: ["ft", "m"],
  },
  wUnit: {
    type: String,
    enum: ["lbs", "kg"],
  },
  address: {
    street: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    zipCode: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
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
