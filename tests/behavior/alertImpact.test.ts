import { describe, expect, it } from "vitest";
import { IMPACT_TOTAL_MS, shouldTriggerAlertImpact } from "../../src/domain/behavior/alertImpact";
import {
  initialAlertMeter,
  updateAlertMeter,
  type AlertMeterState,
} from "../../src/domain/behavior/alertMeter";

function countImpacts(frames: readonly boolean[], frameMs: number): number {
  let state: AlertMeterState = initialAlertMeter();
  let impacts = 0;
  for (const playerVisible of frames) {
    const next = updateAlertMeter(state, { playerVisible, deltaMs: frameMs });
    if (shouldTriggerAlertImpact(state.level, next.level)) {
      impacts += 1;
    }
    state = next;
  }
  return impacts;
}

describe("alert impact", () => {
  it("fires only on the transition into alert (C1)", () => {
    expect(shouldTriggerAlertImpact("calm", "alert")).toBe(true);
    expect(shouldTriggerAlertImpact("suspicious", "alert")).toBe(true);
    expect(shouldTriggerAlertImpact("calm", "suspicious")).toBe(false);
    expect(shouldTriggerAlertImpact("alert", "suspicious")).toBe(false);
    expect(shouldTriggerAlertImpact("calm", "calm")).toBe(false);
  });

  it("does not repeat while the level stays in alert (C2)", () => {
    expect(shouldTriggerAlertImpact("alert", "alert")).toBe(false);
    // 5 seconds in sight at 100 ms per frame: a single impact.
    expect(countImpacts(Array.from({ length: 50 }, () => true), 100)).toBe(1);
  });

  it("fires again after leaving alert and entering it again (C3)", () => {
    const frames = [
      ...Array.from({ length: 20 }, () => true),
      ...Array.from({ length: 30 }, () => false),
      ...Array.from({ length: 20 }, () => true),
    ];
    expect(countImpacts(frames, 100)).toBe(2);
  });

  it("does not fire again on a brief loss of sight held by hysteresis (C2)", () => {
    const frames = [
      ...Array.from({ length: 20 }, () => true),
      ...Array.from({ length: 5 }, () => false),
      ...Array.from({ length: 20 }, () => true),
    ];
    expect(countImpacts(frames, 100)).toBe(1);
  });

  it("declares a total duration under one second (C4)", () => {
    expect(IMPACT_TOTAL_MS).toBeLessThan(1000);
  });
});
