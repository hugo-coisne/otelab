import { metrics, Span, trace } from "@opentelemetry/api";
import express, { Express, Request, Response } from "express";

import { getLogger } from "./logger";
import axios from "axios";

const logger = getLogger();
const tracer = trace.getTracer("service-b", "0.1.0");

const meter = metrics.getMeter('service-b', '0.1.0');
const totalRequestCounter = meter.createCounter('total-requests.counter');

const PORT: number = parseInt(process.env.SERVICE_B_PORT || "8081");
const app: Express = express();
app.use(express.json());

interface Statement {
  id: number;
  UserId: number;
  value: string;
}

interface User {
  id: number;
  name: string;
  surname: string;
}

let statements: Statement[] = [
  {
    id: 1,
    UserId: 1,
    value: "This is a statement.",
  },
  {
    id: 2,
    UserId: 1,
    value: "This is a statement from the same user.",
  },
  {
    id: 3,
    UserId: 2,
    value: "This is a statement from a different user.",
  },
];

// GET: Retrieve all statements
app.get("/statements", (req, res) => {
  const histogram = meter.createHistogram('get.statements.duration');
  const startTime = new Date().getTime();

  totalRequestCounter.add(1);
  logger.info("Fetching all statements.");
  res.json(statements);
  
  const endTime = new Date().getTime();
  const executionTime = endTime - startTime;

  // Record the duration of the task operation
  histogram.record(executionTime);
});

// POST: Add a new statement
function postHandler(req: Request) {
  return tracer.startActiveSpan("statementPostHandler", (span: Span) => {
    const maxId =
      statements.length > 0
        ? Math.max(...statements.map((stmt) => stmt.id))
        : 0;
    const statement: Statement = {
      id: maxId + 1, // Generate a unique ID
      UserId: parseInt(req.query.UserId!.toString()),
      value: req.query.value!.toString(),
    };
    statements.push(statement);
    logger.info(`New statement created: ${JSON.stringify(statement)}`);
    span.end();
  });
}

app.post("/statements", (req, res) => {
  const histogram = meter.createHistogram('get.statements.duration');
  const startTime = new Date().getTime();

  totalRequestCounter.add(1);
  postHandler(req);
  res.status(200).json(statements[statements.length - 1]);
  logger.info("Statement successfully added.");
  
  const endTime = new Date().getTime();
  const executionTime = endTime - startTime;

  // Record the duration of the task operation
  histogram.record(executionTime);
});

// PUT: Replace an existing statement by id
function putHandler(req: Request) {
  return tracer.startActiveSpan("statementPutHandler", (span: Span) => {
    const statementId = parseInt(req.params.id);
    const stmtIndex = statements.findIndex((stmt) => stmt.id === statementId);
    let data: { status: number; content: any } = { status: -1, content: null };

    if (stmtIndex !== -1) {
      const updatedStatement: Statement = {
        id: statementId,
        UserId: parseInt(req.query.UserId!.toString()),
        value: req.query.value!.toString(),
      };
      statements[stmtIndex] = updatedStatement;
      data = { status: 200, content: updatedStatement };
      logger.info(`Statement updated: ${JSON.stringify(updatedStatement)}`);
    } else {
      data = { status: 404, content: "Statement not found" };
      logger.warn(`Statement with id ${statementId} not found.`);
    }
    span.end();
    return data;
  });
}

app.put("/statements/:id", (req, res) => {
  const histogram = meter.createHistogram('get.statements.duration');
  const startTime = new Date().getTime();

  totalRequestCounter.add(1);
  const data: { status: number; content: any } = putHandler(req);
  res.status(data.status).json(data.content);
  logger.info(`PUT request completed with status ${data.status}.`);
  
  const endTime = new Date().getTime();
  const executionTime = endTime - startTime;

  // Record the duration of the task operation
  histogram.record(executionTime);
});

// PATCH: Partially update a statement by id
function patchHandler(req: Request) {
  return tracer.startActiveSpan("statementPatchHandler", (span: Span) => {
    let data: { status: number; content: any } = { status: -1, content: null };
    const statementId = parseInt(req.params.id);
    const statement = statements.find((stmt) => stmt.id === statementId);

    if (statement) {
      if (req.query.UserId) {
        statement.UserId = parseInt(req.query.UserId!.toString());
        logger.info(`Updated statement UserId to: ${statement.UserId}`);
      }
      if (req.query.value) {
        statement.value = req.query.value!.toString();
        logger.info(`Updated statement value to: ${statement.value}`);
      }
      data = { status: 200, content: statement };
    } else {
      data = { status: 404, content: "Statement not found" };
      logger.warn(`Statement with id ${statementId} not found.`);
    }
    span.end();
    return data;
  });
}

app.patch("/statements/:id", (req, res) => {
  const histogram = meter.createHistogram('get.statements.duration');
  const startTime = new Date().getTime();

  totalRequestCounter.add(1);
  const data: { status: number; content: any } = patchHandler(req);
  res.status(data.status).json(data.content);
  logger.info(`PATCH request completed with status ${data.status}.`);
  
  const endTime = new Date().getTime();
  const executionTime = endTime - startTime;

  // Record the duration of the task operation
  histogram.record(executionTime);
});

// DELETE: Remove a statement by id
function deleteHandler(req: Request) {
  return tracer.startActiveSpan("statementDeleteHandler", (span: Span) => {
    let data: { status: number; content: any } = { status: -1, content: null };
    const statementId = parseInt(req.params.id);
    const stmtIndex = statements.findIndex((stmt) => stmt.id === statementId);

    if (stmtIndex !== -1) {
      const deletedStatement = statements.splice(stmtIndex, 1); // Remove the statement from the array
      data = { status: 200, content: deletedStatement };
      logger.info(`Statement deleted: ${JSON.stringify(deletedStatement)}`);
    } else {
      data = { status: 404, content: "Statement not found" };
      logger.warn(`Statement with id ${statementId} not found.`);
    }
    span.end();
    return data;
  });
}

app.delete("/statements/:id", (req, res) => {
  const histogram = meter.createHistogram('get.statements.duration');
  const startTime = new Date().getTime();

  totalRequestCounter.add(1);
  const data: { status: number; content: any } = deleteHandler(req);
  res.status(data.status).json(data.content);
  logger.info(`DELETE request completed with status ${data.status}.`);
  
  const endTime = new Date().getTime();
  const executionTime = endTime - startTime;

  // Record the duration of the task operation
  histogram.record(executionTime);
});

// Error generator for demonstration purposes
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
  const histogram = meter.createHistogram('get.error.duration');
  const startTime = new Date().getTime();

  totalRequestCounter.add(1);
  const data = errorCreator();
  logger.info("throwing useless error");
  res.status(data.status).json(data.content);
  
  const endTime = new Date().getTime();
  const executionTime = endTime - startTime;

  // Record the duration of the task operation
  histogram.record(executionTime);
});

// GET: Fetch statements with user data from another service
app.get("/statements_with_user_data", (req: Request, res: Response) => {
  const histogram = meter.createHistogram('get.statements.duration');
  const startTime = new Date().getTime();

  totalRequestCounter.add(1);
  logger.info("Fetching all users from service-a.");

  return tracer.startActiveSpan("fetchStatementsWithUserData", async (span: Span) => {
    try {
      // Fetch users from the external service
      const response = await axios.get("http://service-a:8080/users");
      const users = response.data;

      logger.info("Users fetched successfully.");

      // Map statements with corresponding user data
      const statementsWithUsers = statements.map((statement) => {
        const user = users.find((u: { id: number }) => u.id === statement.UserId);
        return {
          statementId: statement.id,
          value: statement.value,
          userName: user ? user.name : "Unknown",
          userSurname: user ? user.surname : "",
        };
      });

      res.status(200).json(statementsWithUsers);
      logger.info("Statements with user data fetched successfully.");
    } catch (error) {
      logger.error("Error fetching users: ", error);
      res.status(500).json({ error: "Failed to fetch user data." });
      span.recordException(error as Error); // Record the error in the span
    } finally {
      span.end(); // Ensure to end the span
    }
    
    const endTime = new Date().getTime();
    const executionTime = endTime - startTime;
    
    // Record the duration of the task operation
    histogram.record(executionTime);
  });
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
