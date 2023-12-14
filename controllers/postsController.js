import Post from "../models/postModel.js";

export const getAllPosts = async (req, res) => {
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

export const createPost = async (req, res) => {
  console.log("first");
  try {
    const { title, description, author, img } = req.body;
    const newPost = new Post({ title, description, author, img });
    const validationErrors = newPost.validateSync();
    if (validationErrors) {
      const errors = Object.values(validationErrors.errors).map(
        (error) => error.message
      );
      return res.status(400).json({ status: 'fail', errors });
    }
    const savedPost = await newPost.save();
    return res.status(201).json({
      status: "success",
      data: {
        post: savedPost,
      },
    });
  } catch (e) {
    return res.status(500).json({
      status: "fail",
      message: e.message,
    });
  }
};

export const getPostById = async (req, res) => {
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

export const updatePost = async (req, res) => {
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

export const deletePost = async (req, res) => {
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

export const addComment = async (req, res) => {
  const { comment } = req.body;
  const user = req.user;
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        status: "fail",
        message: "No post found with that ID",
      });
    }
    const commentsKey = commentedBy(user);
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          [`comments.${commentsKey}`]: { comment, userId: user._id },
        },
      },
      { new: true }
    );
    console.log(updatedPost);
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

export const deleteComment = async (req, res) => {
  res.send("this route is not yet defined");
};

export const updateComment = async (req, res) => {
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
