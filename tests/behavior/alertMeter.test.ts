import { describe, expect, it } from "vitest";
import {
  ALERT_MAX,
  initialAlertMeter,
  updateAlertMeter,
  type AlertMeterState,
} from "../../src/domain/behavior/alertMeter";

function seen(state: AlertMeterState, deltaMs: number): AlertMeterState {
  return updateAlertMeter(state, { playerVisible: true, deltaMs });
}

function unseen(state: AlertMeterState, deltaMs: number): AlertMeterState {
  return updateAlertMeter(state, { playerVisible: false, deltaMs });
}

describe("alert meter", () => {
  it("rises 60 points per second while the player is visible (C1)", () => {
    expect(seen(initialAlertMeter(), 500).value).toBeCloseTo(30, 6);
    expect(seen(initialAlertMeter(), 1000).value).toBeCloseTo(60, 6);
  });

  it("decays 20 points per second while the player is not visible (C2)", () => {
    const start = seen(initialAlertMeter(), 1000);
    expect(unseen(start, 1000).value).toBeCloseTo(40, 6);
  });

  it("never leaves the 0-100 range, even after a time jump (C3)", () => {
    expect(seen(initialAlertMeter(), 10_000_000).value).toBe(ALERT_MAX);
    expect(unseen(initialAlertMeter(), 10_000_000).value).toBe(0);
  });

  it("moves through calm, suspicious and alert at the thresholds (C4)", () => {
    const calm = seen(initialAlertMeter(), 500);
    expect(calm.level).toBe("calm");

    const suspicious = seen(calm, 100);
    expect(suspicious.value).toBeCloseTo(36, 6);
    expect(suspicious.level).toBe("suspicious");

    const almost = seen(suspicious, 1000);
    expect(almost.value).toBeCloseTo(96, 6);
    expect(almost.level).toBe("suspicious");

    expect(seen(almost, 100).level).toBe("alert");
  });

  it("holds the alert level until the meter drops below 60 (C4)", () => {
    const alert = seen(initialAlertMeter(), 2000);
    expect(alert).toEqual({ value: 100, level: "alert" });

    const stillAlert = unseen(alert, 1900);
    expect(stillAlert.value).toBeCloseTo(62, 6);
    expect(stillAlert.level).toBe("alert");

    const released = unseen(stillAlert, 200);
    expect(released.value).toBeCloseTo(58, 6);
    expect(released.level).toBe("suspicious");

    expect(unseen(released, 1500).level).toBe("calm");
  });

  it("does not report alert at 62 when it was never alerted", () => {
    expect(seen(initialAlertMeter(), 1034).level).toBe("suspicious");
  });

  it("rejects an invalid delta (C5)", () => {
    expect(() => seen(initialAlertMeter(), -1)).toThrow();
    expect(() => seen(initialAlertMeter(), Number.NaN)).toThrow();
  });
});
