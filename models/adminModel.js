const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const adminSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Please enter your first name"],
    trim: true,
    validate: [validator.isAlpha, "Please enter a valid first name"],
  },
  lastName: {
    type: String,
    required: [true, "Please enter your last name"],
    trim: true,
    validate: [validator.isAlpha, "Please enter a valid last name"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    trim: true,
    validate: [validator.isEmail, "Please enter a valid email"],
    unique: true,
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
  isAdmin: {
    type: Boolean,
    default: true,
  },
  updatedAt: {
    type: Date,
  },
  contactNumber: {
    type: Number,
    required: [true, "Please enter your contact number"],
    trim: true,
    validate: [validator.isMobilePhone, "Please enter a valid contact number"],
    unique: true,
  },
});

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);

  // removing passwordConfirm field because we don't need to persist it
  this.passwordConfirm = undefined;
  next();
});

adminSchema.methods.isPasswordCorrect = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
