import { createLogger, transports, format, Logger } from "winston";
import LokiTransport from "winston-loki";

const logger: Logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "isoDateTime" }),
    format.json()
  ),
  transports: [
    new LokiTransport({
      host: "http://loki:3100",
      labels: { app: "service-a" },
      json: true,
    }),
    new transports.Console({
      format: format.combine(format.simple(), format.colorize()),
    }),
  ],
});

export default logger;
