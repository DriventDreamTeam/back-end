import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares";
import httpStatus from "http-status";
import activityService from "@/services/activities-service";

export async function getDatesEvents(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId } = req;
    const dateEvent = await activityService.getActivityDates(userId);

    return res.status(httpStatus.OK).send(dateEvent);
  } catch (error) {
    if (error.name === "PaymentRequiredError") return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    return res.sendStatus(httpStatus.UNAUTHORIZED);
  }
}

export async function getEventsByDateId(req: AuthenticatedRequest, res: Response) {
  const dateId = Number(req.params.eventDateId);

  if (!dateId || dateId < 1) return res.sendStatus(httpStatus.BAD_REQUEST);

  try {
    const { userId } = req;
    const events = await activityService.getActivityByDate(dateId, userId);

    return res.status(httpStatus.OK).send(events);
  } catch (error) {
    if (error.name === "PaymentRequiredError") {
      return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    }
    return res.sendStatus(httpStatus.UNAUTHORIZED);
  }
}
