// src/index.ts
import express, { Express } from "express";
import dotenv from "dotenv";
dotenv.config();

import { AppDataSource } from "../database/data-source.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";

console.log("DB_URL no index.ts:", process.env.DB_URL);

const app: Express = express();
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/projects", projectRoutes);

async function startServer() {
  try {
    console.log("⏳ Inicializando Data Source...");
    await AppDataSource.initialize();
    console.log("📦 Data Source has been initialized!");

    app.listen(3000, "0.0.0.0", () => {
      console.log("🚀 Server running on http://localhost:3000");
    });
  } catch (error) {
    console.error("❌ Error during Data Source initialization:", error);
    process.exit(1);
  }
}

startServer();
