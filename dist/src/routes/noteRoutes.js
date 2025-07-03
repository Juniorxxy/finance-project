var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from "express";
import { AppDataSource } from "../../database/data-source.js";
import { Note } from "../entity/Note.js";
import { User } from "../entity/User.js";
import { authMiddleware } from "../middleware/auth.js";
const router = express.Router();
router.post("/", authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, content, recipientId } = req.body;
    if (!title || !content || !recipientId) {
        return res
            .status(400)
            .json({ error: "Title, content, and recipientId are required" });
    }
    try {
        const userRepository = AppDataSource.getRepository(User);
        const recipient = yield userRepository.findOne({
            where: { id: recipientId },
        });
        if (!recipient) {
            return res.status(404).json({ error: "Recipient not found" });
        }
        if (recipientId === req.user.id) {
            return res
                .status(400)
                .json({ error: "Cannot send a note to yourself" });
        }
        const noteRepository = AppDataSource.getRepository(Note);
        const newNote = noteRepository.create({
            title,
            content,
            userId: req.user.id,
            recipientId,
        });
        yield noteRepository.save(newNote);
        return res
            .status(201)
            .json({ message: "Note created successfully", note: newNote });
    }
    catch (error) {
        console.error("Create note error", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}));
router.get("/", authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const noteRepository = AppDataSource.getRepository(Note);
        const notes = yield noteRepository.find({
            where: { recipientId: req.user.id },
            relations: ["user", "recipient"],
        });
        if (notes.length === 0) {
            return res.status(404).json({ error: "No notes found for this user" });
        }
        return res.json(notes);
    }
    catch (error) {
        console.error("Get notes error", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}));
export default router;
