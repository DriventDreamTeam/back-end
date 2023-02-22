import { PrismaClient } from "@prisma/client";
import { createClient } from "redis";

export let prisma: PrismaClient;
export function connectDb(): void {
  prisma = new PrismaClient();
}

export async function disconnectDB(): Promise<void> {
  await prisma?.$disconnect();
}

export const redisClient = createClient();

export async function connectRedis() {
  redisClient.connect();
}

export async function disconnectRedis() {
  redisClient.disconnect();
}
