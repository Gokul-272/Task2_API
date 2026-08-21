import bcrypt from "bcrypt";
import type { LoginRequest, RegisterRequest, JwtPayload, User, } from "../types.ts";
import { generateToken } from "../utils/jwt.utils.js";
import { AppError } from "../middleware/error.middleware.js";
import { UserModel } from "../models/user.js";
import type { StringValue } from "ms";

export const registerUser = async (credentials: RegisterRequest,): Promise<string> => {
  const { name, email, password } = credentials;
  if (!name || !email || !password) {
    throw new AppError("Name, email, and password are required", 400);
  }
  const user = await UserModel.findOne({ email });
  if (user) {
    throw new AppError("Email already exists", 400);
  }
  const newUser: User = {
    name,
    email,
    password,
  };
  const savedUser = await UserModel.create(newUser);
  const payload: JwtPayload = { userId: savedUser.id, email: savedUser.email };
  const secret = process.env.JWT_SECRET;
   if (!secret) {
    throw new Error("JWT_SECRET is not defined in the .env file");
   }
    const expires: StringValue = process.env.JWT_EXPIRES_IN as StringValue || "15m";
  const token = generateToken(payload,secret,expires);
  return token;
};

export const loginUser = async (credentials: LoginRequest): Promise<string> => {
  const { email, password } = credentials;
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new AppError("Invalid email", 401);
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError("Invalid password", 401);
  }
  const payload: JwtPayload = { userId: user.id, email: user.email, };
  const secret = process.env.JWT_SECRET;
   if (!secret) {
    throw new Error("JWT_SECRET is not defined in the .env file");
   }
    const expires: StringValue = process.env.JWT_EXPIRES_IN as StringValue || "15m";
  const token = generateToken(payload,secret,expires);
  return token;
};
