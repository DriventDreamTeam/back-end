import sessionRepository from "@/repositories/session-repository";
import userRepository from "@/repositories/user-repository";
import { exclude } from "@/utils/prisma-utils";
import { User } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { invalidCredentialsError } from "./errors";
import { createUser } from "../users-service";

async function signIn(params: SignInParams): Promise<SignInResult> {
  const { email, password, provider } = params;

  const user = await getUserOrFail(email, password, provider);

  await validatePasswordOrFail(password, user.password);

  const token = await createSession(user.id);

  return {
    user: exclude(user, "password"),
    token,
  };
}

async function getUserOrFail(email: string, password: string, provider: string): Promise<GetUserOrFailResult> {
  let user = await userRepository.findByEmail(email, { id: true, email: true, password: true });

  if(!user && provider === "github.com") {
    const userCreated = await createUser({ email, password });

    if (!userCreated) throw invalidCredentialsError();

    user = await userRepository.findByEmail(email, { id: true, email: true, password: true });
  }

  if (!user) throw invalidCredentialsError();

  return user;
}

async function createSession(userId: number) {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET);
  await sessionRepository.create({
    token,
    userId,
  });

  return token;
}

async function validatePasswordOrFail(password: string, userPassword: string) {
  const isPasswordValid = await bcrypt.compare(password, userPassword);
  if (!isPasswordValid) throw invalidCredentialsError();
}

export type SignInParams = Pick<User, "email" | "password" | "provider">;

type SignInResult = {
  user: Pick<User, "id" | "email">;
  token: string;
};

type GetUserOrFailResult = Pick<User, "id" | "email" | "password">;

const authenticationService = {
  signIn,
};

export default authenticationService;
export * from "./errors";
