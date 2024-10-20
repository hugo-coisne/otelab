import { trace } from "@opentelemetry/api";
import express, { Express } from "express";
import { rollTheDice } from "./dice";
import { getLogger } from "./logger";

const logger = getLogger();

const tracer = trace.getTracer("dice-server", "0.1.0");

const PORT: number = parseInt(process.env.SERVICE_PORT || "8080");
const app: Express = express();

const cors = require('cors');
app.use(cors());

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
  console.log('rolled dice')
  res.send(JSON.stringify(rollTheDice(rolls, 1, 6)));
  
  
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
