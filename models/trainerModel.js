const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const trainerSchema = new mongoose.Schema({
  trainerName: {
    type: String,
    required: [true, "Please enter your name"],
    trim: true,
    minLength: [3, "Trainer Name must be at least 3 characters long"],
    maxLength: [50, "Trainer Name must be less than 50 characters long"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    trim: true,
    validate: [validator.isEmail, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    trim: true,
    minLength: [8, "Password must be at least 8 characters long"],
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
  phone: {
    type: String,
    required: [true, "Please enter your phone number"],
    trim: true,
    validate: [validator.isMobilePhone, "Please enter a valid phone number"],
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  reason: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  isTrainer: {
    type: Boolean,
    default: true,
  },
  //   businessLicense: {
  //     type: String,
  //     required: [true, "Please upload your business license"],
  //   },
});

trainerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
});

trainerSchema.methods.isPasswordCorrect = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const Trainer = mongoose.model("Trainer", trainerSchema);

module.exports = Trainer;
