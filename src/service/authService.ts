import { LoginRequestBody } from "../interfaces/authInterfaces.js";
import { AppDataSource } from "../../database/data-source.js";
import { User } from "../entity/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function authenticate(credentials: LoginRequestBody) {
  const { email, password } = credentials;

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      throw new Error("User not found");
    }

    const match = await bcrypt.compare(password, user.hash_password!);
    if (!match) {
      throw new Error("Incorrect password");
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET não está definido no .env");
    }

    const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret, {
      expiresIn: "1h",
    });

    return {
      message: "Login Successful",
      email: user.email,
      token,
    };
  } catch (error) {
    throw error;
  }
}
