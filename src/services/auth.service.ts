import bcrypt from "bcrypt";
import type { LoginRequest, RegisterRequest, JwtPayload, User, } from "../types.ts";
import { generateToken } from "../utils/jwt.utils.js";
import { AppError } from "../middleware/error.middleware.js";
import { readData, writeData } from "../utils/json.utils.js";

export const registerUser = async (credentials: RegisterRequest,): Promise<string> => {
  const { name, email, password } = credentials;
  if (!name || !email || !password) {
    throw new AppError("Name, email, and password are required", 400);
  }
  const users = await readData<User>("users.json");
  if (users.find((u) => u.email === email)) {
    throw new AppError("Email already exists", 400);
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const newUser: User = {
    id: (users.length + 1).toString(),
    name,
    email,
    passwordHash,
  };
  users.push(newUser);
  await writeData<User>("users.json", users);
  const payload: JwtPayload = { userId: newUser.id, email: newUser.email };
  const token = generateToken(payload);
  return token;
};

export const loginUser = async (credentials: LoginRequest): Promise<string> => {
  const { email, password } = credentials;
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }
  const users = await readData<User>("users.json");
  const user = users.find((u) => u.email === email);
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }
  const payload: JwtPayload = { userId: user.id, email: user.email, };
  const token = generateToken(payload);
  return token;
};
