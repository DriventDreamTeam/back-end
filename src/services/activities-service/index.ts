import { unauthorizedError } from "@/errors";
import activityRepository from "@/repositories/activity-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { TicketStatus } from "@prisma/client";
import { paymentRequiredError } from "@/errors/payment-required-error";

async function getActivityDates(userId: number) {
  await validateUserTicketOrFail(userId);
  const activyDate = await activityRepository.findActivityDates();

  return activyDate;
}

async function getActivityByDate(dateId: number, userId: number) {
  await validateUserTicketOrFail(userId);
  const events = await activityRepository.findActivityByDateId(dateId);

  return events;
}

async function validateUserTicketOrFail(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);

  if (!enrollment) throw unauthorizedError();

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket || ticket.TicketType.isRemote) throw unauthorizedError();

  if (ticket.status !== TicketStatus.PAID) throw paymentRequiredError();
}

const activyService = {
  getActivityDates,
  getActivityByDate,
};

export default activyService;
