import express from "express";
import { AppDataSource } from "../database/data-source.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
const app = express();
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
AppDataSource.initialize()
    .then(() => {
    console.log("📦 Data Source has been initialized!");
    app.listen(3000, () => {
        console.log("🚀 Server running on http://localhost:3000");
    });
})
    .catch((error) => console.log("❌ Error during Data Source initialization:", error));
