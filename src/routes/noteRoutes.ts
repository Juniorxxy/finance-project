import express, { Router } from "express";
import { AppDataSource } from "../../database/data-source.js";
import { Note } from "../entity/Note.js";
import { User } from "../entity/User.js";
import { authMiddleware } from "../middleware/auth.js";
import { CreateNoteRequestBody } from "../interfaces/noteInterface.js";

const router: Router = express.Router();

router.post(
  "/",
  authMiddleware,
  async (
    req: express.Request<{}, {}, CreateNoteRequestBody>,
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
        return res.status(404).json({ error: "Recipient not found" });
      }

      if (recipientId === req.user!.id) {
        return res
          .status(400)
          .json({ error: "Cannot send a note to yourself" });
      }

      const noteRepository = AppDataSource.getRepository(Note);
      const newNote = noteRepository.create({
        title,
        content,
        userId: req.user!.id,
        recipientId,
      });

      await noteRepository.save(newNote);

      return res
        .status(201)
        .json({ message: "Note created successfully", note: newNote });
    } catch (error) {
      console.error("Create note error", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.get(
  "/",
  authMiddleware,
  async (req: express.Request, res: express.Response) => {
    try {
      const noteRepository = AppDataSource.getRepository(Note);
      const notes = await noteRepository.find({
        where: { recipientId: req.user!.id },
        relations: ["user", "recipient"],
      });

      if (notes.length === 0) {
        return res.status(404).json({ error: "No notes found for this user" });
      }

      return res.json(notes);
    } catch (error) {
      console.error("Get notes error", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

export default router;
