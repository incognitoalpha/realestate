import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";
import { calculateEcoRating } from "../services/ecoRating.service.js";


export const getPosts = async (req, res) => {
  const query = req.query;

  try {
    const posts = await prisma.post.findMany({
      where: {
        city: query.city || undefined,
        type: query.type || undefined,
        property: query.property || undefined,
        bedroom: parseInt(query.bedroom) || undefined,
        price: {
          gte: parseInt(query.minPrice) || undefined,
          lte: parseInt(query.maxPrice) || undefined,
        },
      },
    });

    // setTimeout(() => {
    res.status(200).json(posts);
    // }, 3000);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get posts" });
  }
};

export const getPost = async (req, res) => {
  const id = req.params.id;
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        postDetail: true,
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
      },
    });

    const token = req.cookies?.token;

    if (token) {
      // Return early for the token case
      return jwt.verify(
        token,
        process.env.JWT_SECRET_KEY,
        async (err, payload) => {
          if (!err) {
            const saved = await prisma.savedPost.findUnique({
              where: {
                userId_postId: {
                  postId: id,
                  userId: payload.id,
                },
              },
            });
            return res
              .status(200)
              .json({ ...post, isSaved: saved ? true : false });
          }
          // If there's an error in verification, fall through to the non-token case
          return res.status(200).json({ ...post, isSaved: false });
        },
      );
    }
    // Non-token case
    return res.status(200).json({ ...post, isSaved: false });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get post" });
  }
};

export const addPost = async (req, res) => {
  const body = req.body;
  const tokenUserId = req.userId;

  try {
    const ecoData = await calculateEcoRating({
      latitude: body.postData.latitude,
      longitude: body.postData.longitude,
      city: body.postData.city,
      property: body.postData.property,
    });

    const newPost = await prisma.post.create({
      data: {
        ...body.postData,
        ...ecoData,        
        userId: tokenUserId,
        postDetail: {
          create: body.postDetail,
        },
      },
    });
    res.status(200).json(newPost);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return res.status(409).json({
        message: "This property is already listed."
      });
    }

    console.log(err);
    res.status(500).json({ message: "Failed to create post" 

    });
  }
};

export const updatePost = async (req, res) => {
  try {
    res.status(200).json();
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to update posts" });
  }
};

export const deletePost = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (post.userId !== tokenUserId) {
      return res.status(403).json({ message: "Not Authorized!" });
    }

    await prisma.post.delete({
      where: { id },
    });

    res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete post" });
  }
};


import { analyzeNeighborhoodSentiment } from "../services/sentiment.service.js";

export const addNeighborhoodReview = async (req, res) => {
  const { city, locality, text } = req.body;

  try {
    const scores = await analyzeNeighborhoodSentiment(text);

    const review = await prisma.neighborhoodReview.create({
      data: {
        city,
        locality,
        text,
        ...scores,
      },
    });

    return res.status(201).json(review);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Failed to analyze neighborhood",
    });
  }
};


export const getNeighborhoodScores = async (req, res) => {
  const { city, locality } = req.query;

  try {
    const reviews = await prisma.neighborhoodReview.findMany({
      where: { city, locality },
    });

    if (!reviews.length) {
      return res.status(200).json({
        safety: "N/A",
        cleanliness: "N/A",
        livability: "N/A",
      });
    }

    const avg = (key) =>
      Math.round(
        reviews.reduce((sum, r) => sum + r[key], 0) / reviews.length
      );

    return res.status(200).json({
      safety: avg("safety"),
      cleanliness: avg("cleanliness"),
      livability: avg("livability"),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Failed to fetch neighborhood scores",
    });
  }
};
