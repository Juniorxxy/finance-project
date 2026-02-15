import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../src/entity/User.js";
import { Note } from "../src/entity/Note.js";
import { Project } from "../src/entity/Project.js";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DB_URL,
  synchronize: true,
  logging: ["error"],
  entities: [User, Note, Project],
  migrations: [],
  subscribers: [],
  extra: {
    family: 4
  },
});
