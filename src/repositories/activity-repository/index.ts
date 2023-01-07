import { prisma } from "@/config";

async function findActivityDates() {
  return prisma.activityDay.findMany();
}

async function findActivityByDateId(dateId: number) {
  return prisma.activityLocation.findMany({
    include: {
      Activity: {
        where: {
          activityDayId: dateId,
        },
        include: {
          ActivityTicket: true,
        },
      },
    },
  });
}

async function findActivityById(activityId: number) {
  return prisma.activity.findFirst({
    where: { id: activityId },
    include: { ActivityTicket: true },
  });
}

async function findscheduledActivitiesByticketId(ticketId: number) {
  return prisma.activityTicket.findMany({
    where: {
      ticketId: ticketId,
    },
    include: {
      Activity: true
    }
  });
}

async function findActivitiesById(activityId: number) {
  return prisma.activity.findFirst({
    where: {
      id: activityId
    },
    include: {
      _count: {
        select: {
          ActivityTicket: true
        }
      }
    }

  });
}

async function createActivityTicket(activityId: number, ticketId: number) {
  return prisma.activityTicket.create({
    data: {
      activityId: activityId,
      ticketId: ticketId
    }
  });
}
const acitivyRepository = {
  findActivityDates,
  findActivityByDateId,
  findActivityById,
  findscheduledActivitiesByticketId,
  findActivitiesById,
  createActivityTicket
};

export default acitivyRepository;
