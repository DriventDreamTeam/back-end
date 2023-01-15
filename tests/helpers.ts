import * as jwt from "jsonwebtoken";
import { TicketStatus, User } from "@prisma/client";

import { createEnrollmentWithAddress, createTicket, createTicketTypeWithOrWithoutHotel, createUser } from "./factories";
import { createSession } from "./factories/sessions-factory";
import { connectRedis, disconnectRedis, prisma, redisClient } from "@/config";

export async function cleanDb() {
  await cleanRedis();
  await prisma.address.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.activityTicket.deleteMany({});
  await prisma.activity.deleteMany({});
  await prisma.activityDay.deleteMany({});
  await prisma.activityLocation.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.ticketType.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.hotel.deleteMany({});
  await prisma.user.deleteMany({});
}

async function cleanRedis() {
  await connectRedis();
  await redisClient.FLUSHALL();
  await disconnectRedis();
}

export async function generateValidToken(user?: User) {
  const incomingUser = user || (await createUser());
  const token = jwt.sign({ userId: incomingUser.id }, process.env.JWT_SECRET);

  await createSession(token);

  return token;
}

export async function generateValidTicket(user?: User) {
  const incomingUser = user || (await createUser());
  const enrollment = await createEnrollmentWithAddress(incomingUser);
  const ticketType = await createTicketTypeWithOrWithoutHotel();

  await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
}
