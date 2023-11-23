const Post = require("../models/postModel");

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find();
    if (!posts) {
      return res.status(404).json({
        status: "fail",
        message: "No posts have been made yet",
      });
    }
    return res.status(200).json({
      status: "success",
      results: posts.length,
      data: {
        posts,
      },
    });
  } catch (e) {
    return res.status(500).json({
      status: "fail",
      message: e.message,
    });
  }
};

exports.createPost = async (req, res) => {
  console.log("first");
  try {
    const { title, description, author, img } = req.body;
    const newPost = await Post.create({ title, description, author, img });
    return res.status(201).json({
      status: "success",
      data: {
        post: newPost,
      },
    });
  } catch (e) {
    return res.status(500).json({
      status: "fail",
      message: e.message,
    });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        status: "fail",
        message: "No post found with that ID",
      });
    }
    return res.status(200).json({
      status: "success",
      data: {
        post,
      },
    });
  } catch (e) {
    return res.status(500).json({
      status: "fail",
      message: e.message,
    });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        status: "fail",
        message: "No post found with that ID",
      });
    }
    const { title, description, author, img } = req.body;
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { title, description, author, img },
      { new: true }
    );
    return res.status(200).json({
      status: "success",
      data: {
        post: updatedPost,
      },
    });
  } catch (e) {
    return res.status(500).json({
      status: "fail",
      message: e.message,
    });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        status: "fail",
        message: "No post found with that ID",
      });
    }
    await Post.findByIdAndDelete(req.params.id);
    return res.status(204).json({
      status: "success",
      data: "Deleted post!",
    });
  } catch (e) {
    return res.status(500).json({
      status: "fail",
      message: e.message,
    });
  }
};

exports.addComment = async (req, res) => {
  const { comment, user } = req.body;
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        status: "fail",
        message: "No post found with that ID",
      });
    }
    console.log(req.user);
    const commentsKey = commentedBy(req.user);
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          [`comments.${commentsKey}`]: { comment, userId: req.user._id },
        },
      },
      { new: true }
    );
    return res.status(200).json({
      status: "success",
      data: {
        post: updatedPost,
      },
    });
  } catch (e) {
    return res.status(500).json({
      status: "fail",
      message: e.message,
    });
  }
};

exports.deleteComment = async (req, res) => {
  res.send("this route is not yet defined");
};

exports.updateComment = async (req, res) => {
  res.send("this route is not yet defined");
};

const commentedBy = (user) => {
  if ("isUser" in user) {
    return "users";
  }

  if ("isGym" in user) {
    return "gyms";
  }

  if ("isTrainer" in user) {
    return "trainers";
  }
};
