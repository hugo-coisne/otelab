"use strict";

const { LogLevel } = require("@opentelemetry/core");
const { NodeTracerProvider, SimpleSpanProcessor } = require("@opentelemetry/sdk-trace-node");
const provider = new NodeTracerProvider({
  logLevel: LogLevel.ERROR,
});
provider.register();

provider.addSpanProcessor(
  new SimpleSpanProcessor(
    new ZipkinExporter({
      serviceName: 'our-service'
    })
  )
)