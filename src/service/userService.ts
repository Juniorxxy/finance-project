import { RegisterRequestBody } from "../interfaces/userInterfaces.js";
import { AppDataSource } from "../../database/data-source.js";
import { User } from "../entity/User.js";
import bcrypt from "bcrypt";

export async function userRegister(dataUserRegister: RegisterRequestBody) {
  const { name, email, cellphone, password } = dataUserRegister;

  if (!name || !email || !cellphone || !password) {
    throw new Error("Name, email, cellphone and password are required");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format");
  }

  const userRepository = AppDataSource.getRepository(User);
  const existingUser = await userRepository.findOne({ where: { email } });
  if (existingUser) {
    throw new Error("Email already used");
  }

  const hash_password = await bcrypt.hash(password, 10);

  const newUser = userRepository.create({
    name,
    email,
    cellphone,
    hash_password,
  });

  await userRepository.save(newUser);

  return {
    message: "User created successfully",
    email: newUser.email,
  };
}

export async function getUserProfile(userId: number) {
  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOne({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return {
    name: user.name,
    email: user.email,
    cellphone: user.cellphone,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
