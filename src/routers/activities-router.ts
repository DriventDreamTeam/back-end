import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getDatesEvents, getEventsByDateId, scheduleActivity } from "@/controllers/activities-controller";

const activityRouter = Router();

activityRouter
  .all("/*", authenticateToken)
  .get("/days", getDatesEvents)
  .get("/:eventDateId", getEventsByDateId)
  .post("/schedule/:activityId", scheduleActivity);

export { activityRouter };
