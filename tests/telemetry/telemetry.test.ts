import { describe, expect, it } from "vitest";
import { formatTelemetryEvent, telemetryEvent } from "../../src/domain/telemetry/telemetry";

describe("telemetry", () => {
  it("builds and formats a structured event", () => {
    const event = telemetryEvent(1234.6, "alerta", "suspicious", "nivel", "alert", "medidor 100");
    expect(event).toEqual({
      timeMs: 1235,
      subject: "alerta",
      previous: "suspicious",
      event: "nivel",
      next: "alert",
      cause: "medidor 100",
    });
    expect(formatTelemetryEvent(event)).toBe(
      "[telemetria] t=1235 alerta: suspicious -> alert | evento=nivel | causa=medidor 100",
    );
  });

  it("rejects a non-finite time", () => {
    expect(() => telemetryEvent(Number.NaN, "a", "b", "c", "d", "e")).toThrow();
  });
});
