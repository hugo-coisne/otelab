import { Span, trace } from "@opentelemetry/api";
import express, { Express, Request, Response } from "express";
import { rollTheDice } from "./dice";

import { getLogger } from "./logger";

const logger = getLogger();
const tracer = trace.getTracer("service-a", "0.1.0");

const PORT: number = parseInt(process.env.SERVICE_PORT || "8080");
const app: Express = express();


interface User {
  id: number;
  name: string;
  surname: string;
}

let users: User[] = [
  {
    id: 1,
    name: "hugo",
    surname: "coisne",
  },
  {
    id: 2,
    name: "leo",
    surname: "saintier",
  },
  {
    id: 3,
    name: "fabio",
    surname: "petrillo",
  },
];

// GET: Retrieve all users
app.get("/users", (req, res) => {
  logger.info("Fetching all users.");
  res.json(users);
});

function postHandler(req: Request) {
  return tracer.startActiveSpan("userPostHandler", (span: Span) => {
    const maxId = users.length > 0 ? Math.max(...users.map((user) => user.id)) : 0;
    const user: User = {
      id: maxId + 1, // Generate a unique ID
      name: req.query.name!.toString(),
      surname: req.query.surname!.toString(),
    };
    users.push(user);
    logger.info(`New user created: ${JSON.stringify(user)}`);
    span.end();
  });
}

// POST: Add a new user
app.post("/users", (req, res) => {
  postHandler(req);
  res.status(200).json(users[users.length - 1]);
  logger.info("User successfully added.");
});

function putHandler(req: Request) {
  return tracer.startActiveSpan("userPutHandler", (span: Span) => {
    const userId = parseInt(req.params.id);
    const userIndex = users.findIndex((user) => user.id === userId);
    let data: { status: number; content: any } = { status: -1, content: null };

    if (userIndex !== -1) {
      const updatedUser: User = {
        id: userId,
        name: req.query.name!.toString(),
        surname: req.query.surname!.toString(),
      };
      users[userIndex] = updatedUser;
      data = { status: 200, content: updatedUser };
      logger.info(`User updated: ${JSON.stringify(updatedUser)}`);
    } else {
      data = { status: 404, content: "User not found" };
      logger.warn(`User with id ${userId} not found.`);
    }
    span.end();
    return data;
  });
}

// PUT: Replace an existing user by id
app.put("/users/:id", (req, res) => {
  const data: { status: number; content: string } = putHandler(req);
  res.status(data.status).json(data.content);
  logger.info(`PUT request completed with status ${data.status}.`);
});

function patchHandler(req: Request) {
  return tracer.startActiveSpan("userPatchHandler", (span: Span) => {
    let data: { status: number; content: any } = { status: -1, content: null };
    const userId = parseInt(req.params.id);
    const user = users.find((u) => u.id === userId);

    if (user) {
      if (req.query.name) {
        user.name = req.query.name!.toString();
        logger.info(`Updated user name to: ${user.name}`);
      }
      if (req.query.surname) {
        user.surname = req.query.surname!.toString();
        logger.info(`Updated user surname to: ${user.surname}`);
      }
      data = { status: 200, content: user };
    } else {
      data = { status: 404, content: "User not found" };
      logger.warn(`User with id ${userId} not found.`);
    }
    span.end();
    return data;
  });
}

// PATCH: Partially update a user by id
app.patch("/users/:id", (req, res) => {
  const data: { status: number; content: string } = patchHandler(req);
  res.status(data.status).json(data.content);
  logger.info(`PATCH request completed with status ${data.status}.`);
});

function deleteHandler(req: Request) {
  return tracer.startActiveSpan("userDeleteHandler", (span: Span) => {
    let data: { status: number; content: any } = { status: -1, content: null };
    const userId = parseInt(req.params.id);
    const userIndex = users.findIndex((user) => user.id === userId);

    if (userIndex !== -1) {
      const deletedUser = users.splice(userIndex, 1); // Remove the user from the array
      data = { status: 200, content: deletedUser };
      logger.info(`User deleted: ${JSON.stringify(deletedUser)}`);
    } else {
      data = { status: 404, content: "User not found" };
      logger.warn(`User with id ${userId} not found.`);
    }
    span.end();
    return data;
  });
}

app.delete("/users/:id", (req, res) => {
  const data: { status: number; content: string } = deleteHandler(req);
  res.status(data.status).json(data.content);
  logger.info(`DELETE request completed with status ${data.status}.`);
});

function errorCreator() {
  return tracer.startActiveSpan("errorCreator", (span: Span) => {
    let data: { status: number; content: any } = { status: -1, content: null };
    try {
      throw new Error("Useless error message");
    } catch (error) {
      if (error instanceof Error) {
        data = { status: 400, content: error.message };
        logger.error(`Error caught: ${error.message}`);
      } else {
        data = { status: 400, content: "Unexpected error" };
        logger.error("Unexpected error occurred.");
      }
    }
    span.end();
    return data;
  });
}

app.get("/error", (req, res) => {
  const data = errorCreator();
  logger.info("throwing useless error");
  res.status(data.status).json(data.content);
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
