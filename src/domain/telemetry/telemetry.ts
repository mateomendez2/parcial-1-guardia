export interface TelemetryEvent {
  readonly timeMs: number;
  readonly subject: string;
  readonly previous: string;
  readonly event: string;
  readonly next: string;
  readonly cause: string;
}

/** Builds a structured event: time, previous state, event, new state and cause. */
export function telemetryEvent(
  timeMs: number,
  subject: string,
  previous: string,
  event: string,
  next: string,
  cause: string,
): TelemetryEvent {
  if (!Number.isFinite(timeMs)) {
    throw new Error("Telemetry time must be finite.");
  }
  return { timeMs: Math.round(timeMs), subject, previous, event, next, cause };
}

export function formatTelemetryEvent(event: TelemetryEvent): string {
  return `[telemetria] t=${event.timeMs} ${event.subject}: ${event.previous} -> ${event.next}`
    + ` | evento=${event.event} | causa=${event.cause}`;
}
