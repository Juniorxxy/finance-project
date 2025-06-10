import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../src/entity/User.js";
import { Post } from "../src/entity/Post.js";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DB_URL,
  synchronize: true,
  logging: ["error"],
  entities: [User, Post],
  migrations: [],
  subscribers: [],
});
