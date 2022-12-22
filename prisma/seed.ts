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

  if (ticketType.length===0) {
    await prisma.ticketType.createMany({
      data: [{
        name: "Presencial Com Hotel",
        price: 600,
        isRemote: false,
        includesHotel: true
      }, {
        name: "Presencial Sem Hotel",
        price: 250,
        isRemote: false,
        includesHotel: false
      }, {
        name: "Online",
        price: 100,
        isRemote: true,
        includesHotel: false
      },
      
      ] });
    ticketType = await prisma.ticketType.findMany();
    console.log({ ticketType });
  }
  let hotels = await prisma.hotel.findMany();

  if (hotels.length===0) {
    await prisma.hotel.createMany({
      data: [{
        name: "Driven Resort",
        image: "https://m7g2b8q3.stackpathcdn.com/wp-content/uploads/2018/06/melhores-hoteis-cordoba-nh.jpg"
      }, {
        name: "Driven Palace",
        image: "https://www.melhoresdestinos.com.br/wp-content/uploads/2020/10/melhores-hoteis-do-mundo-capa2019-01.jpg"
      }
      , {
        name: "Driven World",
        image: "https://www.melhoresdestinos.com.br/wp-content/uploads/2020/10/melhores-hoteis-do-mundo-capa2019-01.jpg"
      }
      ] });
    hotels = await prisma.hotel.findMany();
    console.log({ hotels });
  }
  let rooms = await prisma.room.findMany();

  if (rooms.length===0) {
    await prisma.room.createMany({
      data: [{
        name: "01",
        capacity: 1,
        hotelId: hotels[0]?.id
      }, {
        name: "02",
        capacity: 2,
        hotelId: hotels[0]?.id
      }, {
        name: "03",
        capacity: 2,
        hotelId: hotels[0]?.id
      }, {
        name: "04",
        capacity: 1,
        hotelId: hotels[0]?.id
      },
      {
        name: "01",
        capacity: 3,
        hotelId: hotels[1]?.id
      },
      {
        name: "02",
        capacity: 2,
        hotelId: hotels[1]?.id
      },
      {
        name: "03",
        capacity: 1,
        hotelId: hotels[1]?.id
      },
      {
        name: "04",
        capacity: 2,
        hotelId: hotels[1]?.id
      }, {
        name: "01",
        capacity: 1,
        hotelId: hotels[2]?.id
      }, {
        name: "02",
        capacity: 1,
        hotelId: hotels[2]?.id
      }, {
        name: "03",
        capacity: 1,
        hotelId: hotels[2]?.id
      }, {
        name: "04",
        capacity: 1,
        hotelId: hotels[2]?.id
      }, {
        name: "05",
        capacity: 1,
        hotelId: hotels[2]?.id
      }, {
        name: "06",
        capacity: 1,
        hotelId: hotels[2]?.id
      }
      ] });
    rooms = await prisma.room.findMany();
    console.log({ rooms });
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
