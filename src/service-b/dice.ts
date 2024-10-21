import { Span, trace } from "@opentelemetry/api";

const tracer = trace.getTracer("dice-lib");

function rollOnce(i: number, min: number, max: number) {
  return tracer.startActiveSpan(`rollOnce:${i}`, (span: Span) => {
    const result = Math.floor(Math.random() * (max - min) + min);
    span.setAttribute("dicelib.rolled", result.toString());
    span.end();
    return result;
  });
}

export function rollTheDice(rolls: number, min: number, max: number) {
  return tracer.startActiveSpan(
    "rollTheDice",
    { attributes: { "dicelib.rolls": rolls.toString() } },
    (parentSpan: Span) => {
      const result: number[] = [];
      for (let i = 0; i < rolls; i++) {
        result.push(rollOnce(i, min, max));
      }
      parentSpan.end();
      return result;
    }
  );
}
