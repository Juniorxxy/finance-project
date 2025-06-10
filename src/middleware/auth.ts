import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  id: number;
  email: string;
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não fornecido ou inválido" });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET não está definido no .env");
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    req.user = decoded; // Adiciona os dados do usuário ao objeto req
    next(); // Passa pro próximo handler
  } catch (error) {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
};

// Adiciona a propriedade user ao tipo Request
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
