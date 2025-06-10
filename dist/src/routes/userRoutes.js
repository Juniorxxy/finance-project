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
import { User } from "../entity/User.js";
import { authMiddleware } from "../middleware/auth.js";
import bcrypt from "bcrypt";
const router = express.Router();
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, cellphone, password } = req.body;
    if (!name || !email || !cellphone || !password) {
        return res
            .status(400)
            .json({ error: "Name, email, cellphone and password are required" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
    }
    try {
        const userRepository = AppDataSource.getRepository(User);
        const existingUser = yield userRepository.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ error: "Email already used" });
        }
        const hash_password = yield bcrypt.hash(password, 10);
        const newUser = userRepository.create({
            name,
            email,
            cellphone,
            hash_password,
        });
        yield userRepository.save(newUser);
        return res
            .status(201)
            .json({ message: "User created successfully", email });
    }
    catch (error) {
        console.error("Register error", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}));
router.get("/profile", authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userRepository = AppDataSource.getRepository(User);
        const user = yield userRepository.findOne({
            where: { id: req.user.id },
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        return res.json({
            name: user.name,
            email: user.email,
            cellphone: user.cellphone,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        });
    }
    catch (error) {
        console.error("Profile error", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}));
export default router;
