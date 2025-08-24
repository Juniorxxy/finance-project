import express, { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { createProjectRequestBody } from "../interfaces/projectInterface.js";
import { projectRegister } from "../service/projectService.js";

const router: Router = express.Router();

// Criar projeto
router.post(
  "/",
  authMiddleware,
  async (
    req: express.Request<{}, {}, createProjectRequestBody>,
    res: express.Response
  ) => {
    const { name, description } = req.body;

    if (!name || !description) {
      return res
        .status(400)
        .json({ error: "Name and description are required" });
    }

    try {
      if (!req.user) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }

      const result = await projectRegister({ name, description }, req.user.id);

      return res.status(201).json(result);
    } catch (error: any) {
      console.error("Create project error:", error);
      return res
        .status(400)
        .json({ error: error.message || "Internal Server Error" });
    }
  }
);

export default router;
