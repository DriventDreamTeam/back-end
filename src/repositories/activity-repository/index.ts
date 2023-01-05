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

const acitivyRepository = {
  findActivityDates,
  findActivityByDateId,
  findActivityById,
};

export default acitivyRepository;
