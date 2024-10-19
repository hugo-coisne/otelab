/*app.ts*/
import { trace } from "@opentelemetry/api";
import express, { Express } from "express";
import { rollTheDice } from "./dice";
import { getLogger } from "./logger";

const logger = getLogger();

const tracer = trace.getTracer("dice-server", "0.1.0");

const PORT: number = parseInt(process.env.PORT || "8080");
const app: Express = express();

app.get("/rolldice", (req, res) => {
  const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
  if (isNaN(rolls)) {
    res
      .status(400)
      .send("Request parameter 'rolls' is missing or not a number.");
    console.log(`rolling dice`);

    logger.info("rolling dice");
    return;
  }
  res.send(JSON.stringify(rollTheDice(rolls, 1, 6)));
});

app.get("/metrics", (req, res) => {
  res.send("OK");
  console.log(`sending metrics`);
  logger.info("sending metrics");
  return;
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
