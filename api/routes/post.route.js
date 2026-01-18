import express from "express";
import {verifyToken} from "../middleware/verifyToken.js";
import {
  addPost,
  getPosts,
  getPost,
  deletePost,
  addNeighborhoodReview,
  getNeighborhoodScores,
} from "../controllers/post.controller.js";

const router = express.Router();


router.get("/", getPosts);
router.get("/:id", getPost);
router.post("/", verifyToken, addPost);
//router.put("/:id", verifyToken, updatePost);
router.delete("/:id", verifyToken, deletePost);
router.post("/neighborhood/review", addNeighborhoodReview);
router.get("/neighborhood/scores", getNeighborhoodScores);

export default router;
