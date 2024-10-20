import { trace } from "@opentelemetry/api";
import express, { Express } from "express";
import { rollTheDice } from "./dice";

import logger from './logger';

const tracer = trace.getTracer("dice-server", "0.1.0");

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
    name: 'hugo',
    surname: 'coisne',
  },
  {
    id: 2,
    name: 'leo',
    surname: 'saintier',
  },
  {
    id: 3,
    name: 'fabio',
    surname: 'petrillo',
  },
];

// GET: Retrieve all users
app.get('/users', (req, res) => {
  res.json(users);
});

// POST: Add a new user
app.post('/users', (req, res) => {
  const maxId = users.length > 0 ? Math.max(...users.map(user => user.id)) : 0;
  const user: User = {
    id: maxId+1, // Generate a unique ID
    name: req.query.name!.toString(),
    surname: req.query.surname!.toString(),
  };
  users.push(user);
  res.status(200).json(user);
});

// PUT: Replace an existing user by id
app.put('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex((user) => user.id === userId);

  if (userIndex !== -1) {
    const updatedUser: User = {
      id: userId, // Keep the same ID
      name: req.query.name!.toString(),
      surname: req.query.surname!.toString(),
    };
    users[userIndex] = updatedUser;
    res.status(200).json(updatedUser);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// PATCH: Partially update a user by id
app.patch('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find((u) => u.id === userId);

  if (user) {
    if (req.query.name) {
      user.name = req.query.name!.toString();
    }
    if (req.query.surname) {
      user.surname = req.query.surname!.toString();
    }
    res.status(200).json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.delete('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex((user) => user.id === userId);

  if (userIndex !== -1) {
    const deletedUser = users.splice(userIndex, 1); // Remove the user from the array
    res.status(200).json(deletedUser[0]); // Return the deleted user
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.get("/error", (req, res) => {
  try {
    throw new Error("Useless error message");
  } catch (error) {
    res.status(404).send(error);
  }
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
