import express, { Express } from "express";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// Configuração para ES Modules resolver caminhos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { AppDataSource } from "../database/data-source.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";

const app: Express = express();
app.use(express.json());

// --- CONFIGURAÇÃO SWAGGER DEFINITIVA ---
const swaggerOptions: swaggerJsDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Finance Project API",
      version: "1.0.0",
      description: "Documentação interativa",
    },
    servers: [{ url: "http://localhost:3000" }],
  },
  // Como o comando é 'node dist/src/index.js', os comentários 
  // estarão nos arquivos .js dentro da pasta dist.
  apis: [
    path.resolve(__dirname, "./index.js"),
    path.resolve(__dirname, "./routes/*.js")
  ],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
// ---------------------------------------

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/projects", projectRoutes);

async function startServer() {
  try {
    await AppDataSource.initialize();
    app.listen(3000, "0.0.0.0", () => {
      console.log("🚀 Server: http://localhost:3000");
      console.log("📖 Docs: http://localhost:3000/api-docs");
    });
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

startServer();