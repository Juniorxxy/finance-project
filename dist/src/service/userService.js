var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { AppDataSource } from "../../database/data-source.js";
import { User } from "../entity/User.js";
import bcrypt from "bcrypt";
export function userRegister(dataUserRegister) {
    return __awaiter(this, void 0, void 0, function* () {
        const { name, email, cellphone, password } = dataUserRegister;
        if (!name || !email || !cellphone || !password) {
            throw new Error("Name, email, cellphone and password are required");
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error("Invalid email format");
        }
        const userRepository = AppDataSource.getRepository(User);
        const existingUser = yield userRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new Error("Email already used");
        }
        const hash_password = yield bcrypt.hash(password, 10);
        const newUser = userRepository.create({
            name,
            email,
            cellphone,
            hash_password,
        });
        yield userRepository.save(newUser);
        return {
            message: "User created successfully",
            email: newUser.email,
        };
    });
}
