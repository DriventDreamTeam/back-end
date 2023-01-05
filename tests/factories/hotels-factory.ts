import faker from "@faker-js/faker";
import { prisma } from "@/config";

//Sabe criar objetos - Hotel do banco
export async function createHotel() {
  return await prisma.hotel.create({
    data: {
      name: faker.name.findName(),
      image: faker.image.imageUrl(),
    },
  });
}

export async function createRoomWithHotelId(hotelId: number) {
  return prisma.room.create({
    data: {
      name: "1020",
      capacity: 3,
      hotelId: hotelId,
    },
  });
}

export function createHotelWithRooms() {
  return prisma.hotel.create({
    data: {
      name: faker.name.findName(),
      image: faker.image.city(),
      Rooms: {
        createMany: {
          data: [
            {
              name: faker.datatype.number().toString(),
              capacity: 1,
            },
            {
              name: faker.datatype.number().toString(),
              capacity: 2,
            },
          ],
        },
      },
    },
    include: { Rooms: { orderBy: { id: "asc" } } },
  });
}
