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
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const router = express.Router();
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }
    try {
        const userRepository = AppDataSource.getRepository(User);
        const user = yield userRepository.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }
        const match = yield bcrypt.compare(password, user.hash_password);
        if (!match) {
            return res.status(401).json({ error: "Incorrect password" });
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error("JWT_SECRET não está definido no .env");
        }
        const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret, {
            expiresIn: "1h",
        });
        return res.json({
            message: "Login Successful",
            email: user.email,
            token,
        });
    }
    catch (error) {
        console.error("Login error", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}));
export default router;
