import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
const prisma = new PrismaClient();

async function main() {
  let event = await prisma.event.findFirst();
  if (!event) {
    event = await prisma.event.create({
      data: {
        title: "Driven.t",
        logoImageUrl: "https://files.driveneducation.com.br/images/logo-rounded.png",
        backgroundImageUrl: "linear-gradient(to right, #FA4098, #FFD77F)",
        startsAt: dayjs().toDate(),
        endsAt: dayjs().add(21, "days").toDate(),
      },
    });
  }
  console.log({ event });

  let ticketType = await prisma.ticketType.findMany();

  if (ticketType.length === 0) {
    await prisma.ticketType.createMany({
      data: [
        {
          name: "Presencial Com Hotel",
          price: 600,
          isRemote: false,
          includesHotel: true,
        },
        {
          name: "Presencial Sem Hotel",
          price: 250,
          isRemote: false,
          includesHotel: false,
        },
        {
          name: "Online",
          price: 100,
          isRemote: true,
          includesHotel: false,
        },
      ],
    });
    ticketType = await prisma.ticketType.findMany();
    console.log({ ticketType });
  }
  let hotels = await prisma.hotel.findMany();

  if (hotels.length === 0) {
    await prisma.hotel.createMany({
      data: [
        {
          name: "Driven Resort",
          image: "https://m7g2b8q3.stackpathcdn.com/wp-content/uploads/2018/06/melhores-hoteis-cordoba-nh.jpg",
        },
        {
          name: "Driven Palace",
          image:
            "https://www.melhoresdestinos.com.br/wp-content/uploads/2020/10/melhores-hoteis-do-mundo-capa2019-01.jpg",
        },
        {
          name: "Driven World",
          image:
            "https://www.melhoresdestinos.com.br/wp-content/uploads/2020/10/melhores-hoteis-do-mundo-capa2019-01.jpg",
        },
      ],
    });
    hotels = await prisma.hotel.findMany();
    console.log({ hotels });
  }
  let rooms = await prisma.room.findMany();

  if (rooms.length === 0) {
    await prisma.room.createMany({
      data: [
        {
          name: "01",
          capacity: 1,
          hotelId: hotels[0]?.id,
        },
        {
          name: "02",
          capacity: 2,
          hotelId: hotels[0]?.id,
        },
        {
          name: "03",
          capacity: 2,
          hotelId: hotels[0]?.id,
        },
        {
          name: "04",
          capacity: 1,
          hotelId: hotels[0]?.id,
        },
        {
          name: "01",
          capacity: 3,
          hotelId: hotels[1]?.id,
        },
        {
          name: "02",
          capacity: 2,
          hotelId: hotels[1]?.id,
        },
        {
          name: "03",
          capacity: 1,
          hotelId: hotels[1]?.id,
        },
        {
          name: "04",
          capacity: 2,
          hotelId: hotels[1]?.id,
        },
        {
          name: "01",
          capacity: 1,
          hotelId: hotels[2]?.id,
        },
        {
          name: "02",
          capacity: 1,
          hotelId: hotels[2]?.id,
        },
        {
          name: "03",
          capacity: 1,
          hotelId: hotels[2]?.id,
        },
        {
          name: "04",
          capacity: 1,
          hotelId: hotels[2]?.id,
        },
        {
          name: "05",
          capacity: 1,
          hotelId: hotels[2]?.id,
        },
        {
          name: "06",
          capacity: 1,
          hotelId: hotels[2]?.id,
        },
      ],
    });
    rooms = await prisma.room.findMany();
    console.log({ rooms });
  }

  let activityDays = await prisma.activityDay.findMany();

  if (activityDays.length === 0) {
    await prisma.activityDay.createMany({
      data: [
        {
          date: "Sexta, 22/10",
        },
        {
          date: "Sabado, 23/10",
        },
        {
          date: "Domingo, 24/10",
        },
      ],
    });
    activityDays = await prisma.activityDay.findMany();
    console.log({ activityDays });
  }

  let activityLocations = await prisma.activityLocation.findMany();

  if (activityLocations.length === 0) {
    await prisma.activityLocation.createMany({
      data: [
        {
          name: "Auditório Principal",
        },
        {
          name: "Auditório Lateral",
        },
        {
          name: "Sala de Workshop",
        },
      ],
    });
    activityLocations = await prisma.activityLocation.findMany();
    console.log({ activityLocations });
  }

  let acitivities = await prisma.activity.findMany();

  if (acitivities.length === 0) {
    await prisma.activity.createMany({
      data: [
        {
          name: "Palestra 1",
          capacity: 200,
          startsAt: new Date(2022, 9, 22, 9, 0, 0, 0),
          endsAt: new Date(2022, 9, 22, 10, 0, 0, 0),
          activityDayId: 1,
          ActivityLocationId: 1,
        },
        {
          name: "Palestra 2",
          capacity: 200,
          startsAt: new Date(2022, 9, 22, 10, 0, 0, 0),
          endsAt: new Date(2022, 9, 22, 11, 0, 0, 0),
          activityDayId: 1,
          ActivityLocationId: 2,
        },
        {
          name: "Palestra 3",
          capacity: 200,
          startsAt: new Date(2022, 9, 22, 11, 0, 0, 0),
          endsAt: new Date(2022, 9, 22, 12, 0, 0, 0),
          activityDayId: 1,
          ActivityLocationId: 3,
        },
        {
          name: "Palestra 4",
          capacity: 200,
          startsAt: new Date(2022, 9, 23, 9, 0, 0, 0),
          endsAt: new Date(2022, 9, 23, 10, 0, 0, 0),
          activityDayId: 2,
          ActivityLocationId: 1,
        },
        {
          name: "Palestra 5",
          capacity: 200,
          startsAt: new Date(2022, 9, 23, 10, 0, 0, 0),
          endsAt: new Date(2022, 9, 23, 11, 0, 0, 0),
          activityDayId: 2,
          ActivityLocationId: 2,
        },
        {
          name: "Palestra 6",
          capacity: 200,
          startsAt: new Date(2022, 9, 23, 11, 0, 0, 0),
          endsAt: new Date(2022, 9, 23, 12, 0, 0, 0),
          activityDayId: 2,
          ActivityLocationId: 3,
        },
        {
          name: "Palestra 7",
          capacity: 200,
          startsAt: new Date(2022, 9, 24, 9, 0, 0, 0),
          endsAt: new Date(2022, 9, 24, 10, 0, 0, 0),
          activityDayId: 3,
          ActivityLocationId: 1,
        },
        {
          name: "Palestra 8",
          capacity: 200,
          startsAt: new Date(2022, 9, 24, 10, 0, 0, 0),
          endsAt: new Date(2022, 9, 24, 11, 0, 0, 0),
          activityDayId: 3,
          ActivityLocationId: 2,
        },
        {
          name: "Palestra 9",
          capacity: 200,
          startsAt: new Date(2022, 9, 24, 11, 0, 0, 0),
          endsAt: new Date(2022, 9, 24, 12, 0, 0, 0),
          activityDayId: 3,
          ActivityLocationId: 3,
        },
      ],
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
