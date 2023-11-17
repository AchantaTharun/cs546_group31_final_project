const mongoose = require("mongoose");
const validator = require("validator");

// Not Complete
const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please enter the title"],
    trim: true,
  },
  img: {
    type: String,
    required: [true, "Please enter the img"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please enter the description"],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
  comments: {
    trainers: [
      {
        userId: {
          type: mongoose.Schema.ObjectId,
          ref: "Trainer",
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
          default: Date.now,
        },
      },
    ],
    gyms: [
      {
        userId: {
          type: mongoose.Schema.ObjectId,
          ref: "Gym",
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
          default: Date.now,
        },
      },
    ],
    users: [
      {
        userId: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
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
          default: Date.now,
        },
      },
    ],
  },

  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User" || "Admin" || "Trainer" || "Gym",
  },
});

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
