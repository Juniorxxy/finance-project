import express, { Router } from "express";
import { AppDataSource } from "../../database/data-source.js";
import { User } from "../entity/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { LoginRequestBody } from "../interfaces/authInterfaces.js";

const router: Router = express.Router();

router.post(
  "/login",
  async (
    req: express.Request<{}, {}, LoginRequestBody>,
    res: express.Response
  ) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    try {
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { email } });

      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      const match = await bcrypt.compare(password, user.hash_password!);
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
    } catch (error) {
      console.error("Login error", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

export default router;
