export const ALERT_MAX = 100;
export const ALERT_RISE_PER_SECOND = 60;
export const ALERT_DECAY_PER_SECOND = 20;
export const SUSPICION_THRESHOLD = 35;
export const ALERT_RELEASE_THRESHOLD = 60;

export type AlertLevel = "calm" | "suspicious" | "alert";

export interface AlertMeterState {
  readonly value: number;
  readonly level: AlertLevel;
}

export interface AlertMeterInput {
  readonly playerVisible: boolean;
  readonly deltaMs: number;
}

export function initialAlertMeter(): AlertMeterState {
  return { value: 0, level: "calm" };
}

export function updateAlertMeter(current: AlertMeterState, input: AlertMeterInput): AlertMeterState {
  if (!Number.isFinite(input.deltaMs) || input.deltaMs < 0) {
    throw new Error("Alert meter delta must be finite and non-negative.");
  }

  const rate = input.playerVisible ? ALERT_RISE_PER_SECOND : -ALERT_DECAY_PER_SECOND;
  const value = Math.min(ALERT_MAX, Math.max(0, current.value + rate * input.deltaMs / 1000));
  return { value, level: levelFor(value, current.level) };
}

function levelFor(value: number, previous: AlertLevel): AlertLevel {
  if (value >= ALERT_MAX) {
    return "alert";
  }
  // Hysteresis: once alerted, the level holds until the meter drops below the release threshold.
  if (previous === "alert" && value >= ALERT_RELEASE_THRESHOLD) {
    return "alert";
  }
  return value >= SUSPICION_THRESHOLD ? "suspicious" : "calm";
}
