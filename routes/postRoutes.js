import express from "express";
import * as postsController from "../controllers/postsController.js";
import * as authController from "../controllers/authController.js";

import { Router } from "express";

const router = Router();

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

router
  .route("/get/myPosts")
  .get(authController.protectRoute,postsController.getPostByEntity)

export default router;
