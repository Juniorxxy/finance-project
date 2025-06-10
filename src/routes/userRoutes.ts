import express, { Router } from "express";
import { AppDataSource } from "../../database/data-source.js";
import { User } from "../entity/User.js";
import { authMiddleware } from "../middleware/auth.js";
import bcrypt from "bcrypt";
import { RegisterRequestBody, UpdateCoupleBody } from "../interfaces/userInterfaces.js";

const router: Router = express.Router();

router.post(
  "/register",
  async (
    req: express.Request<{}, {}, RegisterRequestBody>,
    res: express.Response
  ) => {
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
      const existingUser = await userRepository.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ error: "Email already used" });
      }

      const hash_password = await bcrypt.hash(password, 10);

      const newUser = userRepository.create({
        name,
        email,
        cellphone,
        hash_password,
      });

      await userRepository.save(newUser);

      return res
        .status(201)
        .json({ message: "User created successfully", email });
    } catch (error) {
      console.error("Register error", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.get(
  "/profile",
  authMiddleware,
  async (req: express.Request, res: express.Response) => {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: req.user!.id },
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
    } catch (error) {
      console.error("Profile error", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.patch(
  "/couple",
  authMiddleware,
  async (
    req: express.Request<{}, {}, UpdateCoupleBody>,
    res: express.Response
  ) => {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({error: "email is required"});
    }

    try {
      const userRepository = AppDataSource.getRepository(User);
      const updateCouple = userRepository.update({
        user
      })
    }
  }
)
  
  
  
  export default router;