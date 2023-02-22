import { prisma } from "@/config";
import { Booking } from "@prisma/client";

type CreateParams = Omit<Booking, "id" | "createdAt" | "updatedAt">;
type UpdateParams = Omit<Booking, "createdAt" | "updatedAt">;

async function create({ roomId, userId }: CreateParams): Promise<Booking | void> {
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  const roomCapacity = room?.capacity;
  return await prisma.$transaction(async (tx) => {
    const roomBookings = await tx.booking.findMany({ where: { roomId } });
    const createdBooking = await tx.booking.create({
      data: {
        roomId,
        userId,
      },
    });
    if (roomBookings.length >= roomCapacity) {
      throw new Error("There are no more vacancies!");
    }
    return createdBooking;
  });
}

async function findByRoomId(roomId: number) {
  return prisma.booking.findMany({
    where: {
      roomId,
    },
    include: {
      Room: true,
    },
  });
}

async function findByUserId(userId: number) {
  return prisma.booking.findFirst({
    where: {
      userId,
    },
    include: {
      Room: true,
    },
  });
}

async function upsertBooking({ id, roomId, userId }: UpdateParams): Promise<Booking | void> {
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  const roomCapacity = room?.capacity;
  return await prisma.$transaction(async (tx) => {
    const roomBookings = await tx.booking.findMany({ where: { roomId } });
    const updateBooking = await tx.booking.upsert({
      where: {
        id,
      },
      create: {
        roomId,
        userId,
      },
      update: {
        roomId,
      },
    });
    if (roomBookings.length >= roomCapacity) {
      throw new Error("There are no more vacancies!");
    }
    return updateBooking;
  });
}

async function findCompleteBookingByUserId(userId: number) {
  return prisma.booking.findFirst({
    where: {
      userId,
    },
    include: {
      Room: {
        include: {
          Hotel: true,
          _count: {
            select: {
              Booking: true,
            },
          },
        },
      },
    },
  });
}

const bookingRepository = {
  create,
  findByRoomId,
  findByUserId,
  upsertBooking,
  findCompleteBookingByUserId,
};

export default bookingRepository;
