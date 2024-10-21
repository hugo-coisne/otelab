import { Span, trace } from "@opentelemetry/api";
import express, { Express, Request, Response } from "express";
import { rollTheDice } from "./dice";

import { getLogger } from "./logger";

const logger = getLogger();
const tracer = trace.getTracer("service", "0.1.0");

const PORT: number = parseInt(process.env.SERVICE_PORT || "8080");
const app: Express = express();

app.get("/rolldice", (req, res) => {
  const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
  if (isNaN(rolls)) {
    res
      .status(400)
      .send("Request parameter 'rolls' is missing or not a number.");
    console.log(`missing paramters`);

    logger.info("rolling dice");
    return;
  }
  console.log("rolled dice");
  res.send(JSON.stringify(rollTheDice(rolls, 1, 6)));
});

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
  res.json(users);
});

function postHandler(req: Request) {
  return tracer.startActiveSpan("userPostHandler", (span: Span) => {
    const maxId =
      users.length > 0 ? Math.max(...users.map((user) => user.id)) : 0;
    const user: User = {
      id: maxId + 1, // Generate a unique ID
      name: req.query.name!.toString(),
      surname: req.query.surname!.toString(),
    };
    users.push(user);
    span.end();
  });
}

// POST: Add a new user
app.post("/users", (req, res) => {
  postHandler(req);
  res.status(200).json(users[users.length - 1]);
});

function putHandler(req: Request) {
  return tracer.startActiveSpan("userPutHandler", (span: Span) => {
    const userId = parseInt(req.params.id);
    const userIndex = users.findIndex((user) => user.id === userId);
    let data: { status: number; content: any } = { status: -1, content: null };
    if (userIndex !== -1) {
      const updatedUser: User = {
        id: userId, // Keep the same ID
        name: req.query.name!.toString(),
        surname: req.query.surname!.toString(),
      };
      users[userIndex] = updatedUser;
      data = { status: 200, content: updatedUser };
    } else {
      data = { status: 404, content: "User not found" };
    }
    span.end();
    return data;
  });
}

// PUT: Replace an existing user by id
app.put("/users/:id", (req, res) => {
  const data: { status: number; content: string } = putHandler(req);
  res.status(data.status).json(data.content);
});

function patchHandler(req: Request) {
  return tracer.startActiveSpan("userPatchHandler", (span: Span) => {
    let data: { status: number; content: any } = { status: -1, content: null };
    const userId = parseInt(req.params.id);
    const user = users.find((u) => u.id === userId);

    if (user) {
      if (req.query.name) {
        user.name = req.query.name!.toString();
      }
      if (req.query.surname) {
        user.surname = req.query.surname!.toString();
      }
      data = { status: 200, content: user };
    } else {
      data = { status: 404, content: "User not found" };
    }
    span.end();
    return data;
  });
}

// PATCH: Partially update a user by id
app.patch("/users/:id", (req, res) => {
  const data: { status: number; content: string } = patchHandler(req);
  res.status(data.status).json(data.content);
});

function deleteHandler(req: Request) {
  return tracer.startActiveSpan("userPatchHandler", (span: Span) => {
    let data: { status: number; content: any } = { status: -1, content: null };
    const userId = parseInt(req.params.id);
    const userIndex = users.findIndex((user) => user.id === userId);

    if (userIndex !== -1) {
      const deletedUser = users.splice(userIndex, 1); // Remove the user from the array
      data = { status: 200, content: deletedUser };
    } else {
      data = { status: 404, content: "User not found" };
    }
    span.end();
    return data;
  });
}

app.delete("/users/:id", (req, res) => {
  const data: { status: number; content: string } = deleteHandler(req);
  res.status(data.status).json(data.content);
});

function errorCreator() {
  return tracer.startActiveSpan("errorCreator", (span: Span) => {
    let data: { status: number; content: any } = { status: -1, content: null };
    try {
      throw new Error("Useless error message");
    } catch (error) {
      if (error instanceof Error) {
        data = { status: 400, content: error.message };
      } else {
        data = { status: 400, content: "Unexpected error" };
      }
    }
    span.end();
    return data;
  });
}

app.get("/error", (req, res) => {
  const data = errorCreator();
  res.status(data.status).json(data.content);
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
