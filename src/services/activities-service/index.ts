import { notFoundError, unauthorizedError } from "@/errors";
import { createClient } from "redis";
import activityRepository from "@/repositories/activity-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { Activity, ActivityLocation, ActivityTicket, TicketStatus } from "@prisma/client";
import { paymentRequiredError } from "@/errors/payment-required-error";
import { timeConflictError } from "@/errors/time-conflict-error";

const redisClient = createClient();

async function connectRedis() {
  redisClient.connect();
}

async function disconnectRedis() {
  redisClient.disconnect();
}

type activities = (ActivityLocation & {
  Activity: (Activity & {
    ActivityTicket: ActivityTicket[];
    isScheduled?: boolean;
  })[];
})[]

async function getActivityDates(userId: number) {
  await validateUserTicketOrFail(userId);
  await connectRedis();
  const days = await redisClient.exists("days");

  if (!days) {
    const activyDate = await activityRepository.findActivityDates();
    await redisClient.set("days", JSON.stringify(activyDate));
    await redisClient.disconnect();
    
    return activyDate;
  }
  
  const cache = await redisClient.get("days");
  await disconnectRedis();
  
  return JSON.parse(cache);
}

async function getActivityByDate(dateId: number, userId: number) {
  const ticketId = await validateUserTicketOrFail(userId);
  await connectRedis();
  const activityCache = await redisClient.get(`activities${dateId}`);

  if (!activityCache) {
    const activities = await activityRepository.findActivityByDateId(dateId) as activities;
    for (let i = 0; i < activities.length; i++) {
      for (let j = 0; j < activities[i].Activity.length; j++) {
        if (activities[i].Activity[j].ActivityTicket.length === 0) {
          activities[i].Activity[j].isScheduled = false;
        }
        for (let k = 0; k < activities[i].Activity[j].ActivityTicket.length; k++) {
          if (activities[i].Activity[j].ActivityTicket[k].ticketId === ticketId) {
            activities[i].Activity[j].isScheduled = true;
          } else {
            activities[i].Activity[j].isScheduled = false;
          }
        }
      }
    }
    await redisClient.set(`activities${dateId}`, JSON.stringify(activities));
    await disconnectRedis();

    return activities;
  }
  
  const cache = await redisClient.get(`activities${dateId}`);
  await disconnectRedis();

  return JSON.parse(cache);
}

async function validateUserTicketOrFail(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);

  if (!enrollment) throw unauthorizedError();

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket || ticket.TicketType.isRemote) throw unauthorizedError();

  if (ticket.status !== TicketStatus.PAID) throw paymentRequiredError();

  return ticket.id;
}

async function createActivityTicket(activityId: number, userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw unauthorizedError();

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (ticket.status !== TicketStatus.PAID) throw paymentRequiredError();

  const activity = await activityRepository.findActivitiesById(activityId);
  if (activity._count.ActivityTicket >= activity.capacity) {
    throw notFoundError();
  }

  //check if user already has any activity scheduled
  const scheduledActivities = await activityRepository.findscheduledActivitiesByticketId(ticket.id);

  if (scheduledActivities.length === 0) {
    await connectRedis();
    await redisClient.del(`activities${activity.activityDayId}`);
    await disconnectRedis();
    return await activityRepository.createActivityTicket(activityId, ticket.id);
  }

  const sameDayActivities = scheduledActivities.filter((value) => {
    return value.Activity.activityDayId === activity.activityDayId;
  });

  if (sameDayActivities.length === 0) {
    await connectRedis();
    await redisClient.del(`activities${activity.activityDayId}`);
    await disconnectRedis();
  
    return await activityRepository.createActivityTicket(activityId, ticket.id);
  }

  let timeConflict = false;
  for (let i = 0; sameDayActivities.length > i; i++) {
    //check if time range is the same as another activity.
    const sameTime = (activity.startsAt.getTime() === sameDayActivities[i].Activity.startsAt.getTime());
    //check if startsAt is inside other activity time range
    const startsInMiddle = (activity.startsAt.getTime() > sameDayActivities[i].Activity.startsAt.getTime() && activity.startsAt.getTime() < sameDayActivities[i].Activity.endsAt.getTime());
    //check if endsAt is inside other activity time range
    const endsInMiddle = (activity.endsAt.getTime() > sameDayActivities[i].Activity.startsAt.getTime() && activity.endsAt.getTime() < sameDayActivities[i].Activity.endsAt.getTime());

    if (sameTime || startsInMiddle || endsInMiddle) {
      timeConflict = true;
      break;
    }
  }
  if (timeConflict) throw timeConflictError();

  await connectRedis();
  await redisClient.del(`activities${activity.activityDayId}`);
  await disconnectRedis();

  return await activityRepository.createActivityTicket(activityId, ticket.id);
}

const activyService = {
  getActivityDates,
  getActivityByDate,
  createActivityTicket
};

export default activyService;
