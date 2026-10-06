import { describe, expect, it } from "vitest";
import {
  DISTRACTION_COOLDOWN_MS,
  INVESTIGATION_LOOK_MS,
  canThrowDistraction,
  distractionCooldownRemaining,
  distractionLanding,
  startInvestigation,
  updateInvestigation,
} from "../../src/domain/behavior/distraction";
import { createGridMap } from "../../src/domain/model/grid";

// 10x5 map with a wall cell at (6, 2).
const MAP = createGridMap(10, 5, [{ x: 6, y: 2 }]);

describe("distraction landing", () => {
  it("lands on the farthest free cell, up to five, in the given direction (C1)", () => {
    expect(distractionLanding(MAP, { x: 1, y: 0 }, { x: 1, y: 0 })).toEqual({ x: 6, y: 0 });
    expect(distractionLanding(MAP, { x: 1, y: 2 }, { x: 1, y: 0 })).toEqual({ x: 5, y: 2 });
    expect(distractionLanding(MAP, { x: 1, y: 0 }, { x: 0.3, y: 0 }, 2)).toEqual({ x: 3, y: 0 });
  });

  it("stops at the edge of the map", () => {
    expect(distractionLanding(MAP, { x: 8, y: 4 }, { x: 1, y: 0 })).toEqual({ x: 9, y: 4 });
    expect(distractionLanding(MAP, { x: 2, y: 1 }, { x: 0, y: -1 })).toEqual({ x: 2, y: 0 });
  });

  it("lands on the origin cell when a wall is right next to it (C2)", () => {
    expect(distractionLanding(MAP, { x: 5, y: 2 }, { x: 1, y: 0 })).toEqual({ x: 5, y: 2 });
  });

  it("does not cut through a wall corner on a diagonal throw", () => {
    expect(distractionLanding(MAP, { x: 5, y: 1 }, { x: 1, y: 1 })).toEqual({ x: 5, y: 1 });
    expect(distractionLanding(MAP, { x: 0, y: 0 }, { x: 1, y: 1 })).toEqual({ x: 4, y: 4 });
  });

  it("returns null without a direction or from a blocked origin", () => {
    expect(distractionLanding(MAP, { x: 1, y: 1 }, { x: 0, y: 0 })).toBeNull();
    expect(distractionLanding(MAP, { x: 6, y: 2 }, { x: 1, y: 0 })).toBeNull();
  });
});

describe("distraction cooldown", () => {
  it("blocks a second throw before the cooldown has elapsed (C3)", () => {
    expect(canThrowDistraction(null, 0)).toBe(true);
    expect(canThrowDistraction(1000, 1000 + DISTRACTION_COOLDOWN_MS - 1)).toBe(false);
    expect(canThrowDistraction(1000, 1000 + DISTRACTION_COOLDOWN_MS)).toBe(true);
    expect(distractionCooldownRemaining(1000, 2000)).toBe(DISTRACTION_COOLDOWN_MS - 1000);
  });
});

describe("investigation", () => {
  it("goes, looks on arrival and finishes after the look time (C4)", () => {
    const going = startInvestigation();
    expect(updateInvestigation(going, { arrived: false, timeMs: 100 })).toEqual(going);

    const looking = updateInvestigation(going, { arrived: true, timeMs: 500 });
    expect(looking).toEqual({ phase: "looking", lookStartedAtMs: 500 });

    expect(updateInvestigation(looking, {
      arrived: true,
      timeMs: 500 + INVESTIGATION_LOOK_MS - 1,
    }).phase).toBe("looking");

    const done = updateInvestigation(looking, { arrived: true, timeMs: 500 + INVESTIGATION_LOOK_MS });
    expect(done).toEqual({ phase: "done", lookStartedAtMs: null });
    expect(updateInvestigation(done, { arrived: true, timeMs: 99_999 })).toEqual(done);
  });

  it("rejects a non-finite time", () => {
    expect(() => updateInvestigation(startInvestigation(), {
      arrived: false,
      timeMs: Number.POSITIVE_INFINITY,
    })).toThrow();
  });
});
