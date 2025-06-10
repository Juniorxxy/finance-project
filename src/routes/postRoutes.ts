import express, { Router } from "express";
import { AppDataSource } from "../../database/data-source.js";
import { Post } from "../entity/Post.js";
import { User } from "../entity/User.js";
import { authMiddleware } from "../middleware/auth.js";
import { CreatePostRequestBody } from "../interfaces/postInterface.js";

const router: Router = express.Router();

router.post(
  "/posts",
  authMiddleware,
  async (
    req: express.Request<{}, {}, CreatePostRequestBody>,
    res: express.Response
  ) => {
    const { title, content, recipientId } = req.body;

    if (!title || !content || !recipientId) {
      return res
        .status(400)
        .json({ error: "Title, content, and recipientId are required" });
    }

    try {
      const userRepository = AppDataSource.getRepository(User);
      const recipient = await userRepository.findOne({
        where: { id: recipientId },
      });
      if (!recipient) {
        return res.status(404).json({ error: "Recipient user not found" });
      }

      if (recipientId === req.user!.id) {
        return res
          .status(400)
          .json({ error: "Cannot send a post to yourself" });
      }

      const postRepository = AppDataSource.getRepository(Post);
      const newPost = postRepository.create({
        title,
        content,
        userId: req.user!.id,
        recipientId,
      });

      await postRepository.save(newPost);

      // Remove hash_password do user e recipient na resposta
      const safePost = {
        ...newPost,
        user: newPost.user
          ? {
              id: newPost.user.id,
              name: newPost.user.name,
              email: newPost.user.email,
              cellphone: newPost.user.cellphone,
              createdAt: newPost.user.createdAt,
              updatedAt: newPost.user.updatedAt,
            }
          : undefined,
        recipient: newPost.recipient
          ? {
              id: newPost.recipient.id,
              name: newPost.recipient.name,
              email: newPost.recipient.email,
              cellphone: newPost.recipient.cellphone,
              createdAt: newPost.recipient.createdAt,
              updatedAt: newPost.recipient.updatedAt,
            }
          : undefined,
      };

      return res
        .status(201)
        .json({ message: "Post created successfully", post: safePost });
    } catch (error) {
      console.error("Create post error", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.get(
  "/",
  authMiddleware,
  async (req: express.Request, res: express.Response) => {
    try {
      const postRepository = AppDataSource.getRepository(Post);
      const posts = await postRepository.find({
        where: { recipientId: req.user!.id },
        relations: ["user", "recipient"],
      });

      if (posts.length === 0) {
        return res.status(404).json({ error: "No posts found for this user" });
      }

      const safePosts = posts.map((post) => ({
        ...post,
        user: post.user
          ? {
              id: post.user.id,
              name: post.user.name,
              email: post.user.email,
              cellphone: post.user.cellphone,
              createdAt: post.user.createdAt,
              updatedAt: post.user.updatedAt,
            }
          : undefined,
        recipient: post.recipient
          ? {
              id: post.recipient.id,
              name: post.recipient.name,
              email: post.recipient.email,
              cellphone: post.recipient.cellphone,
              createdAt: post.recipient.createdAt,
              updatedAt: post.recipient.updatedAt,
            }
          : undefined,
      }));

      return res.json(safePosts);
    } catch (error) {
      console.error("Get posts error", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

export default router;
