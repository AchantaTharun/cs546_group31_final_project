import mongoose from "mongoose";
import validator from "validator";

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
    userId: String,
    userType: String,
  },
});

const Post = mongoose.model("Post", postSchema);
export default Post;
