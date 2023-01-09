import app, { init } from "@/app";
import supertest from "supertest";
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import { TicketStatus } from "@prisma/client";
import { cleanDb, generateValidTicket, generateValidToken } from "../helpers";
import {
  createUser,
  createHotelWithRooms,
  createEnrollmentWithAddress,
  createTicket,
  createTicketTypeWithOrWithoutHotel,
  createTicketTypeRemote,
  createTicketType,
} from "../factories";
import { createActivity, createDateActivity, createLocalActivity, createActivityTicket } from "../factories/activities-factory";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /activities/days", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/activities/days");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/activities/days").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session with given token", async () => {
    const userWithoutSession = await createUser();

    const token = jwt.sign({ user: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/activities/days").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 401 when user does not have an enrollment", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.get("/activities/days").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 402 when ticket have a valid ticket type but not is paid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithOrWithoutHotel();

      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const response = await server.get("/activities/days").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond with status 401 when ticket is online", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemote();

      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.get("/activities/days").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe("when ticket is valid", () => {
      it("should respond with status 200 and an empty array when there are no activity date created", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithOrWithoutHotel();

        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

        const response = await server.get("/activities/days").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.OK);
        expect(response.body).toEqual([]);
      });

      it("should respond with status 200 and with activity date data", async () => {
        await createHotelWithRooms();
        const user = await createUser();
        const token = await generateValidToken(user);
        await generateValidTicket(user);
        const date = await createDateActivity();

        const response = await server.get("/activities/days").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.OK);
        expect(response.body).toEqual([
          {
            id: date.id,
            date: date.date.toString(),
            createdAt: date.createdAt.toISOString(),
            updatedAt: date.updatedAt.toISOString(),
          },
        ]);
      });
    });
  });
});

describe("GET /activities/:eventDateId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/activities/1");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/activities/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session with given token", async () => {
    const userWithoutSession = await createUser();

    const token = jwt.sign({ user: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/activities/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 401 when user does not have an enrollment", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.get("/activities/1").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 when ticket is online", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemote();

      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.get("/activities/1").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 402 when ticket have a valid ticket type but not is paid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithOrWithoutHotel();

      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const response = await server.get("/activities/1").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    describe("when ticket is valid", () => {
      it("should respond with status 400 when param eventDateId is invalid", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        await generateValidTicket(user);

        const response = await server.get("/activities/0").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.BAD_REQUEST);
      });

      it("should respond with status 200 and an empty array of events when there are no events created", async () => {
        await createHotelWithRooms();
        const user = await createUser();
        const token = await generateValidToken(user);
        await generateValidTicket(user);
        const local = await createLocalActivity();
        const date = await createDateActivity();

        const response = await server.get(`/activities/${date.id}`).set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.OK);
        expect(response.body).toEqual([
          {
            id: local.id,
            name: local.name,
            createdAt: local.createdAt.toISOString(),
            updatedAt: local.updatedAt.toISOString(),
            Activity: [],
          },
        ]);
      });

      it("should respond with status 200 and with events data", async () => {
        await createHotelWithRooms();
        const user = await createUser();
        const token = await generateValidToken(user);
        await generateValidTicket(user);
        const local = await createLocalActivity();
        const date = await createDateActivity();
        const activity = await createActivity(date.id, local.id);

        const response = await server.get(`/activities/${date.id}`).set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.OK);
        expect(response.body).toEqual([
          {
            id: local.id,
            name: local.name,
            createdAt: local.createdAt.toISOString(),
            updatedAt: local.updatedAt.toISOString(),
            Activity: [
              {
                id: activity.id,
                name: activity.name,
                activityDayId: date.id,
                capacity: activity.capacity,
                ActivityLocationId: local.id,
                startsAt: activity.startsAt.toISOString(),
                endsAt: activity.endsAt.toISOString(),
                ActivityTicket: [],
                createdAt: activity.createdAt.toISOString(),
                updatedAt: activity.updatedAt.toISOString(),
              },
            ],
          },
        ]);
      });
    });
  });
});

describe("POST /activities/schedule/activityId", () => {
  describe("when token is not valid", () => {
    it("should respond with status 401 if no token is given", async () => {
      const response = await server.post("/activities/schedule/0");

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if given token is not valid", async () => {
      const token = faker.lorem.word();

      const response = await server.post("/activities/schedule/0").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  });
  describe("when token is valid", () => {
    it("should respond with status 401 if there is no session for given token", async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

      const response = await server.post("/activities/schedule/0").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("it should respond with status 400 if activityId is not a number", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      const local = await createLocalActivity();
      const date = await createDateActivity();

      const response = await server.post("/activities/schedule/a").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it("it should respond with status 400 if activityId is not a valid Id", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      const local = await createLocalActivity();
      const date = await createDateActivity();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.post("/activities/schedule/0").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it("it should respond with status 402 when user don't have a PAID ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      const local = await createLocalActivity();
      const date = await createDateActivity();
      const activity = await createActivity(date.id, local.id);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const response = await server.post("/activities/schedule/1").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it("it should respond with status 404 when activityId has no vacancy", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      const local = await createLocalActivity();
      const date = await createDateActivity();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const activity = await createActivity(date.id, local.id, 1);
      await createActivityTicket(activity.id, ticket.id);

      const response = await server.post(`/activities/schedule/${activity.id}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("it should respond with status 409 when activityId has a time conflict with an already schedule activity", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      const local = await createLocalActivity();
      const dateA = await createDateActivity();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const activityA = await createActivity(dateA.id, local.id);
      const activityB = await createActivity(dateA.id, local.id);
      await createActivityTicket(activityA.id, ticket.id);

      const response = await server.post(`/activities/schedule/${activityB.id}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.CONFLICT);
    });

    it("it should respond with status 409 when activityId has already been schedule by the user", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      const local = await createLocalActivity();
      const dateA = await createDateActivity();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const activity = await createActivity(dateA.id, local.id);
      await createActivityTicket(activity.id, ticket.id);

      const response = await server.post(`/activities/schedule/${activity.id}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.CONFLICT);
    });

    it("it should respond with status 200 and create an activity ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      const local = await createLocalActivity();
      const date = await createDateActivity();
      const activity = await createActivity(date.id, local.id);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.post(`/activities/schedule/${activity.id}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);
    });
  });
});
