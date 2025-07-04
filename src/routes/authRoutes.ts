import express, { Router } from "express";
import { LoginRequestBody } from "../interfaces/authInterfaces.js";
import { authenticate } from "../service/authService.js";

const router: Router = express.Router();

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
