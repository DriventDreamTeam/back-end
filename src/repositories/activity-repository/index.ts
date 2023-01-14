import { prisma } from "@/config";

async function findActivityDates() {
  return prisma.activityDay.findMany();
}

async function findActivityByDateId(dateId: number) {
  return prisma.activityLocation.findMany({
    include: {
      Activity: {
        orderBy: { startsAt: "asc" },
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
      Activity: true,
    },
  });
}

async function findActivitiesById(activityId: number) {
  return prisma.activity.findFirst({
    where: {
      id: activityId,
    },
    include: {
      _count: {
        select: {
          ActivityTicket: true,
        },
      },
    },
  });
}
async function createActivityTicket(activityId: number, ticketId: number) {
  const activity = await prisma.activity.findUnique({ where: { id: activityId } });
  const activityCapacity = activity?.capacity;
  return await prisma.$transaction(async (tx) => {
    const activityTickets = await tx.activityTicket.findMany({ where: { activityId } });
    await tx.activityTicket.create({
      data: {
        activityId: activityId,
        ticketId: ticketId,
      },
    });
    if (activityTickets.length >= activityCapacity) {
      throw new Error("There are no more vacancies!");
    }
  });
}
const acitivyRepository = {
  findActivityDates,
  findActivityByDateId,
  findActivityById,
  findscheduledActivitiesByticketId,
  findActivitiesById,
  createActivityTicket,
};

export default acitivyRepository;
