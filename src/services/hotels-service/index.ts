import hotelRepository from "@/repositories/hotel-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { notFoundError } from "@/errors";
import { cannotListHotelsError } from "@/errors/cannot-list-hotels-error";
import { Hotel, Room } from "@prisma/client";

type hotelUniqueType = Hotel & {
  Rooms: (Room & {
    _count?: {
      Booking: number;
    }
    Booking?: number;
  })[];
}

async function listHotels(userId: number) {
  //Tem enrollment?
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }
  //Tem ticket pago isOnline false e includesHotel true
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket || ticket.status === "RESERVED" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw cannotListHotelsError();
  }
}

async function getHotels(userId: number) {
  await listHotels(userId);

  const hotels = await hotelRepository.findHotels();
  return hotels;
}

async function getHotelsWithRooms(userId: number, hotelId: number) {
  await listHotels(userId);
  const hotel = await hotelRepository.findRoomsByHotelId(hotelId) as hotelUniqueType;

  if (!hotel) {
    throw notFoundError();
  }

  for (let i = 0; i < hotel.Rooms.length; i++) {
    hotel.Rooms[i].Booking = hotel.Rooms[i]._count.Booking;
    delete hotel.Rooms[i]._count;
  }

  return hotel;
}

const hotelService = {
  getHotels,
  getHotelsWithRooms,
};

export default hotelService;
