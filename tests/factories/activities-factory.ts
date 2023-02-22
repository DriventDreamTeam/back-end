import faker from "@faker-js/faker";
import { prisma } from "@/config";
import dayjs from "dayjs";

export function createDateActivity() {
  return prisma.activityDay.create({
    data: {
      date: String(faker.date.future()),
    },
  });
}

export function createLocalActivity() {
  return prisma.activityLocation.create({
    data: {
      name: faker.name.jobArea(),
    },
  });
}

export function createActivity(activityDayId: number, ActivityLocationId: number, capacity?: number) {
  return prisma.activity.create({
    data: {
      name: faker.name.jobArea(),
      activityDayId,
      capacity: capacity || 10,
      ActivityLocationId,
      startsAt: dayjs().add(1, "days").hour(9).toDate(),
      endsAt: dayjs().add(1, "days").hour(10).toDate(),
    },
  });
}

export function createActivityTicket(activityId: number, ticketId: number) {
  return prisma.activityTicket.create({
    data: {
      activityId: activityId,
      ticketId: ticketId
    }
  });
}
