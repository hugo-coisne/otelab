import * as opentelemetry from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { Resource } from "@opentelemetry/resources";

const sdk = new opentelemetry.NodeSDK({
  resource: new Resource({
    [ATTR_SERVICE_NAME]: 'service-a',
    [ATTR_SERVICE_VERSION]: '1.0',
  }),
  traceExporter: new OTLPTraceExporter({
    // optional - default url is http://localhost:4318/v1/traces
    url: "http://otel-col:4318/v1/traces",
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      // url is optional and can be omitted - default is http://localhost:4318/v1/metrics
      url: "http://otel-col:4318/v1/metrics",
    }),
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
