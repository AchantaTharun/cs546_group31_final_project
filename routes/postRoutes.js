const express = require("express");
const postsController = require("../controllers/postsController");
const authController = require("../controllers/authController");
const router = express.Router();
router
  .route("/")
  .get(postsController.getAllPosts)
  .post(authController.protectRoute, postsController.createPost);

router
  .route("/:id")
  .get(authController.protectRoute, postsController.getPostById)
  .patch(authController.protectRoute, postsController.updatePost)
  .delete(authController.protectRoute, postsController.deletePost);

router
  .route("/:id/comments")
  .post(authController.protectRoute, postsController.addComment)
  .delete(authController.protectRoute, postsController.deleteComment)
  .patch(authController.protectRoute, postsController.updateComment);
module.exports = router;
