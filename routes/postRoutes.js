const express = require("express");
const postsController = require("../controllers/postsController");
const authController = require("../controllers/authController");
const router = express.Router();
router
  .route("/")
  .get(postsController.getAllPosts)
  .post(authController.protect, postsController.createPost);

router
  .route("/:id")
  .get(authController.protect, postsController.getPostById)
  .patch(authController.protect, postsController.updatePost)
  .delete(authController.protect, postsController.deletePost);

router
  .route("/:id/comments")
  .post(authController.protect, postsController.addComment)
  .delete(authController.protect, postsController.deleteComment)
  .patch(authController.protect, postsController.updateComment);
module.exports = router;
