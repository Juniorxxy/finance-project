import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { AppDataSource } from "../database/data-source.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
console.log("DB_URL no index.ts:", process.env.DB_URL);
const app = express();
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
AppDataSource.initialize()
    .then(() => {
    console.log("📦 Data Source has been initialized!");
    app.listen(3000, () => {
        console.log("🚀 Server running on http://localhost:3000");
    });
})
    .catch((error) => console.log("❌ Error during Data Source initialization:", error));
