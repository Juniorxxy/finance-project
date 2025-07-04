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
import { userRegister } from "../service/userService.js";
const router = express.Router();
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, cellphone, password } = req.body;
        const result = yield userRegister({ name, email, cellphone, password });
        return res.status(201).json(result);
    }
    catch (error) {
        console.error("Register error", error);
        if (error instanceof Error) {
            if (error.message === "Email already used") {
                return res.status(409).json({ error: error.message });
            }
            return res.status(400).json({ error: error.message });
        }
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
// Rota PATCH para atualizar parceiro (substitui /couple)
router.patch("/partner", authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }
    try {
        const userRepository = AppDataSource.getRepository(User);
        // Busca usuário parceiro pelo email
        const partnerUser = yield userRepository.findOne({ where: { email } });
        if (!partnerUser) {
            return res.status(404).json({ error: "Partner user not found" });
        }
        // Atualiza o partnerId do usuário autenticado
        yield userRepository.update({ id: req.user.id }, { partnerId: partnerUser.id });
        return res.status(200).json({ message: "Partner added successfully" });
    }
    catch (error) {
        console.error("Update partner error", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}));
export default router;
