import express, { Router } from "express";
import { AppDataSource } from "../../database/data-source.js";
import { User } from "../entity/User.js";
import { authMiddleware } from "../middleware/auth.js";
import { RegisterRequestBody } from "../interfaces/userInterfaces.js";
import { getUserProfile, userRegister } from "../service/userService.js";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Operações de registro, perfil e gerenciamento de parceiro
 *
 * components:
 *   schemas:
 *     UserRegister:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - cellphone
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           example: "João Silva"
 *         email:
 *           type: string
 *           format: email
 *           example: "joao.silva@email.com"
 *         cellphone:
 *           type: string
 *           pattern: '^(\+\d{1,3})?\d{10,15}$'
 *           example: "+5511987654321"
 *           description: "Número de celular com DDI (ex: +55 para Brasil)"
 *         password:
 *           type: string
 *           format: password
 *           minLength: 6
 *           writeOnly: true
 *           example: "senhaSegura123"
 *
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *           example: 5
 *         name:
 *           type: string
 *           example: "João Silva"
 *         email:
 *           type: string
 *           format: email
 *           example: "joao.silva@email.com"
 *         cellphone:
 *           type: string
 *           example: "+5511987654321"
 *         partnerId:
 *           type: integer
 *           format: int64
 *           nullable: true
 *           example: 8
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-11-20T10:15:30.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2025-11-20T10:15:30.000Z"
 *       required:
 *         - id
 *         - name
 *         - email
 *         - cellphone
 *         - createdAt
 *
 *     UserResponse:
 *       type: object
 *       properties:
 *         id:
 *           $ref: '#/components/schemas/User/properties/id'
 *         name:
 *           $ref: '#/components/schemas/User/properties/name'
 *         email:
 *           $ref: '#/components/schemas/User/properties/email'
 *         cellphone:
 *           $ref: '#/components/schemas/User/properties/cellphone'
 *         message:
 *           type: string
 *           example: "Usuário criado com sucesso"
 *
 *     PartnerRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "maria.silva@email.com"
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Email already used"
 */

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Registra um novo usuário
 *     description: "Cria uma nova conta de usuário. O email deve ser único. Não retorna a senha na resposta."
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegister'
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Dados inválidos ou campos obrigatórios ausentes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email já está em uso
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
  "/register",
  async (
    req: express.Request<{}, {}, RegisterRequestBody>,
    res: express.Response
  ) => {
    try {
      const { name, email, cellphone, password } = req.body;

      const result = await userRegister({ name, email, cellphone, password });

      return res.status(201).json(result);
    } catch (error) {
      console.error("Register error", error);

      if (error instanceof Error) {
        if (error.message === "Email already used") {
          return res.status(409).json({ error: error.message });
        }
        return res.status(400).json({ error: error.message || "Dados inválidos" });
      }

      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Obtém o perfil do usuário autenticado
 *     description: "Retorna os dados completos do perfil do usuário logado (sem a senha)."
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil do usuário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Usuário não encontrado
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
router.get(
  "/profile",
  authMiddleware,
  async (req: express.Request, res: express.Response) => {
    try {
      const result = await getUserProfile(req.user!.id);
      return res.status(200).json(result);
    } catch (error: any) {
      console.error("Profile error", error);
      const status = error.message === "User not found" ? 404 : 500;
      return res.status(status).json({
        error: error.message || "Internal Server Error"
      });
    }
  }
);

/**
 * @swagger
 * /users/partner:
 *   patch:
 *     summary: Associa um parceiro ao usuário autenticado
 *     description: "Busca um usuário pelo email e define-o como parceiro (partnerId) do usuário logado. Útil para casais, duplas de trabalho, etc. Não permite associar a si mesmo."
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PartnerRequest'
 *     responses:
 *       200:
 *         description: Parceiro associado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Partner added successfully"
 *       400:
 *         description: Email não informado ou tentativa de associar a si mesmo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Usuário parceiro não encontrado com o email informado
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
router.patch(
  "/partner",
  authMiddleware,
  async (
    req: express.Request<{}, {}, { email: string }>,
    res: express.Response
  ) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    try {
      const userRepository = AppDataSource.getRepository(User);

      const partnerUser = await userRepository.findOne({ where: { email } });
      if (!partnerUser) {
        return res.status(404).json({ error: "Partner user not found" });
      }

      if (partnerUser.id === req.user!.id) {
        return res.status(400).json({ error: "Cannot add yourself as partner" });
      }

      await userRepository.update(
        { id: req.user!.id },
        { partnerId: partnerUser.id }
      );

      return res.status(200).json({ message: "Partner added successfully" });
    } catch (error) {
      console.error("Update partner error", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

export default router;