import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { scheduleActivity } from "@/controllers/activities-controller";

const scheduleRouter = Router();

scheduleRouter
  .all("/*", authenticateToken)
  .post("/:activityId", scheduleActivity);

export { scheduleRouter };
