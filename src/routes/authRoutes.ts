import express, { Router } from "express";
import { LoginRequestBody } from "../interfaces/authInterfaces.js";
import { authenticate } from "../service/authService.js";

const router: Router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: usuario@email.com
 *         password:
 *           type: string
 *           format: password
 *           example: "123456"
 *           writeOnly: true   # não aparece na resposta
 *
 *     LoginResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               example: "64f8e123456789abcdef12"
 *             name:
 *               type: string
 *               example: "João Silva"
 *             email:
 *               type: string
 *               example: "usuario@email.com"
 *           required:
 *             - id
 *             - email
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Credenciais inválidas"
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Realiza o login do usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       '200':
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       '401':
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Erro interno no servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/login",
  async (
    req: express.Request<{}, {}, LoginRequestBody>,
    res: express.Response
  ) => {
    try {
      const { email, password } = req.body;
      const result = await authenticate({ email, password });
      return res.json(result);
    } catch (error) {
      console.error("Login error", error);
      if (error instanceof Error) {
        return res.status(401).json({ error: error.message });
      }
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

export default router;