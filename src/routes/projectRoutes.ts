import express, { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { createProjectRequestBody } from "../interfaces/projectInterface.js";
import { projectRegister } from "../service/projectService.js";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Operações relacionadas a projetos (criação, gerenciamento, etc.)
 *
 * components:
 *   schemas:
 *     ProjectCreate:
 *       type: object
 *       required:
 *         - name
 *         - description
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *           example: "Gerenciamento de Contas Pessoais"
 *           description: Nome do projeto (deve ser único por usuário)
 *         description:
 *           type: string
 *           maxLength: 1000
 *           example: "Gerenciamento de contas pessoais da minha casa."
 *           description: Descrição detalhada do projeto
 *
 *     Project:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *           example: 7
 *         name:
 *           type: string
 *           example: "Gerenciamento de Contas Pessoais"
 *         description:
 *           type: string
 *           example: "Gerenciamento de contas pessoais da minha casa."
 *         ownerId:
 *           type: integer
 *           format: int64
 *           example: 1
 *           description: ID do usuário criador/dono do projeto
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-03-10T14:35:22.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-03-10T14:35:22.000Z"
 *           nullable: true
 *       required:
 *         - id
 *         - name
 *         - description
 *         - ownerId
 *         - createdAt
 *
 *     ProjectResponse:
 *       type: object
 *       properties:
 *         id:
 *           $ref: '#/components/schemas/Project/properties/id'
 *         name:
 *           $ref: '#/components/schemas/Project/properties/name'
 *         description:
 *           $ref: '#/components/schemas/Project/properties/description'
 *         ownerId:
 *           $ref: '#/components/schemas/Project/properties/ownerId'
 *         createdAt:
 *           $ref: '#/components/schemas/Project/properties/createdAt'
 *         message:
 *           type: string
 *           example: "Projeto criado com sucesso"
 *       required:
 *         - id
 *         - name
 *         - description
 *         - ownerId
 *         - createdAt
 *         - message
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Name and description are required"
 */

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Cria um novo projeto
 *     description: Cria um projeto associado ao usuário autenticado. O usuário logado automaticamente se torna o dono/criador do projeto. Requer autenticação via JWT (Bearer Token).
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProjectCreate'
 *     responses:
 *       201:
 *         description: Projeto criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectResponse'
 *       400:
 *         description: Dados inválidos, campos obrigatórios ausentes ou nome já em uso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Não autenticado (token ausente ou inválido)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno no servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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
      if (!req.user?.id) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }

      const result = await projectRegister({ name, description }, req.user.id);

      // Garantindo formato consistente na resposta
      return res.status(201).json({
        ...result,
        message: result.message || "Projeto criado com sucesso",
      });
    } catch (error: any) {
      console.error("Create project error:", error);
      const status = error.message?.includes("já está em uso") ? 400 : 500;
      return res.status(status).json({
        error: error.message || "Erro ao criar projeto",
      });
    }
  }
);

export default router;