import express, { Router } from "express";
import { AppDataSource } from "../../database/data-source.js";
import { Note } from "../entity/Note.js";
import { User } from "../entity/User.js";
import { authMiddleware } from "../middleware/auth.js";
import { CreateNoteRequestBody } from "../interfaces/noteInterface.js";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notes
 *   description: Operações relacionadas a notas/mensagens privadas entre usuários
 *
 * components:
 *   schemas:
 *     NoteCreate:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - recipientId
 *       properties:
 *         title:
 *           type: string
 *           maxLength: 100
 *           example: "Pagar conta de luz"
 *         content:
 *           type: string
 *           maxLength: 2000
 *           example: "Não esqueça de pagar a conta de luz até o dia 10 para evitar corte de energia."
 *         recipientId:
 *           type: integer
 *           format: int64
 *           example: 42
 *           description: ID do usuário destinatário
 *
 *     Note:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *           example: 15
 *         title:
 *           type: string
 *           example: "Pagar conta de luz"
 *         content:
 *           type: string
 *           example: "Não esqueça de pagar a conta de luz até o dia 10 para evitar corte de energia."
 *         userId:
 *           type: integer
 *           format: int64
 *           example: 7
 *           description: ID do remetente (usuário autenticado)
 *         recipientId:
 *           type: integer
 *           format: int64
 *           example: 42
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-10-15T14:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-10-15T14:30:00.000Z"
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *               nullable: true
 *             email:
 *               type: string
 *         recipient:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *               nullable: true
 *             email:
 *               type: string
 *       example:
 *         id: 15
 *         title: "Lembrete importante"
 *         content: "Não esqueça da reunião amanhã às 14h!"
 *         userId: 7
 *         recipientId: 42
 *         createdAt: "2025-10-15T14:30:00.000Z"
 *         user:
 *           id: 7
 *           name: "Ana Souza"
 *           email: "ana@example.com"
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Title, content, and recipientId are required"
 */

/**
 * @swagger
 * /notes:
 *   post:
 *     summary: Cria e envia uma nova nota para outro usuário
 *     description: Requer autenticação. O usuário autenticado envia uma nota para outro usuário (recipientId). Não é permitido enviar para si mesmo.
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NoteCreate'
 *     responses:
 *       201:
 *         description: Nota criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Note created successfully"
 *                 note:
 *                   $ref: '#/components/schemas/Note'
 *       400:
 *         description: Dados inválidos ou tentativa de enviar nota para si mesmo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Não autenticado (token inválido ou ausente)
 *       404:
 *         description: Destinatário não encontrado
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
    req: express.Request<{}, {}, CreateNoteRequestBody>,
    res: express.Response
  ) => {
    const { title, content, recipientId } = req.body;

    if (!title || !content || !recipientId) {
      return res
        .status(400)
        .json({ error: "Title, content, and recipientId are required" });
    }

    try {
      const userRepository = AppDataSource.getRepository(User);
      const recipient = await userRepository.findOne({
        where: { id: recipientId },
      });

      if (!recipient) {
        return res.status(404).json({ error: "Recipient not found" });
      }

      if (recipientId === req.user!.id) {
        return res
          .status(400)
          .json({ error: "Cannot send a note to yourself" });
      }

      const noteRepository = AppDataSource.getRepository(Note);
      const newNote = noteRepository.create({
        title,
        content,
        userId: req.user!.id,
        recipientId,
      });

      await noteRepository.save(newNote);

      // Recarrega a nota com relations para retornar completa
      const savedNote = await noteRepository.findOne({
        where: { id: newNote.id },
        relations: ["user", "recipient"],
      });

      return res
        .status(201)
        .json({ message: "Note created successfully", note: savedNote });
    } catch (error) {
      console.error("Create note error", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

/**
 * @swagger
 * /notes:
 *   get:
 *     summary: Lista todas as notas recebidas pelo usuário autenticado
 *     description: Retorna as notas em que o usuário autenticado é o destinatário (recipient). Inclui informações do remetente.
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de notas recebidas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Note'
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Nenhuma nota encontrada para este usuário
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
  "/",
  authMiddleware,
  async (req: express.Request, res: express.Response) => {
    try {
      const noteRepository = AppDataSource.getRepository(Note);
      const notes = await noteRepository.find({
        where: { recipientId: req.user!.id },
        relations: ["user", "recipient"],
        order: { createdAt: "DESC" },
      });

      if (notes.length === 0) {
        return res.status(404).json({ error: "No notes found for this user" });
      }

      return res.json(notes);
    } catch (error) {
      console.error("Get notes error", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

export default router;