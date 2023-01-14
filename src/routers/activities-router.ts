import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getDatesEvents, getEventsByDateId, postActivityTicket } from "@/controllers/activities-controller";

const activityRouter = Router();

activityRouter
  .all("/*", authenticateToken)
  .get("/days", getDatesEvents)
  .get("/:eventDateId", getEventsByDateId)
  .post("/schedule/:activityId", postActivityTicket);
  
export { activityRouter };
