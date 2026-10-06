import { describe, expect, it } from "vitest";
import {
  PATROL_LOOK_AHEAD_MS,
  PATROL_PAUSE_MS,
  initialPatrolState,
  resumePatrol,
  updatePatrol,
  withPatrolTarget,
  type PatrolState,
} from "../../src/domain/behavior/patrol";

const POINT_COUNT = 4;

function arriveAt(state: PatrolState, timeMs: number): PatrolState {
  return updatePatrol(state, { pointCount: POINT_COUNT, arrived: true, timeMs }).state;
}

describe("patrol", () => {
  it("visits the points in cyclic order (C1)", () => {
    let state = initialPatrolState();
    let timeMs = 0;
    const visited: number[] = [];

    for (let step = 0; step < 5; step += 1) {
      visited.push(state.targetIndex);
      state = arriveAt(state, timeMs);
      timeMs += PATROL_PAUSE_MS;
      const departure = updatePatrol(state, { pointCount: POINT_COUNT, arrived: true, timeMs });
      expect(departure.departed).toBe(true);
      state = departure.state;
    }

    expect(visited).toEqual([0, 1, 2, 3, 0]);
  });

  it("keeps moving while the point has not been reached", () => {
    const state = initialPatrolState();
    expect(updatePatrol(state, { pointCount: POINT_COUNT, arrived: false, timeMs: 50 })).toEqual({
      state,
      look: "travel",
      departed: false,
    });
  });

  it("holds the pause until its full duration has elapsed (C2)", () => {
    const paused = arriveAt(initialPatrolState(), 1000);
    expect(paused).toEqual({ targetIndex: 1, phase: "pausing", pauseStartedAtMs: 1000 });

    const before = updatePatrol(paused, {
      pointCount: POINT_COUNT,
      arrived: true,
      timeMs: 1000 + PATROL_PAUSE_MS - 1,
    });
    expect(before.departed).toBe(false);
    expect(before.state.phase).toBe("pausing");

    const after = updatePatrol(paused, {
      pointCount: POINT_COUNT,
      arrived: true,
      timeMs: 1000 + PATROL_PAUSE_MS,
    });
    expect(after.departed).toBe(true);
    expect(after.state).toEqual({ targetIndex: 1, phase: "moving", pauseStartedAtMs: null });
  });

  it("looks as it arrived first and toward the next leg afterwards (C3)", () => {
    const paused = arriveAt(initialPatrolState(), 0);

    expect(updatePatrol(paused, {
      pointCount: POINT_COUNT,
      arrived: true,
      timeMs: PATROL_LOOK_AHEAD_MS - 1,
    }).look).toBe("arrival");
    expect(updatePatrol(paused, {
      pointCount: POINT_COUNT,
      arrived: true,
      timeMs: PATROL_LOOK_AHEAD_MS,
    }).look).toBe("next");
  });

  it("ends the pause once and advances a single point after a time jump (C4)", () => {
    const paused = arriveAt(initialPatrolState(), 0);
    const jump = updatePatrol(paused, { pointCount: POINT_COUNT, arrived: true, timeMs: 1_000_000 });

    expect(jump.departed).toBe(true);
    expect(jump.state).toEqual({ targetIndex: 1, phase: "moving", pauseStartedAtMs: null });

    const next = updatePatrol(jump.state, {
      pointCount: POINT_COUNT,
      arrived: false,
      timeMs: 1_000_016,
    });
    expect(next.departed).toBe(false);
    expect(next.state.targetIndex).toBe(1);
  });

  it("does not leave the pause when time moves backwards", () => {
    const paused = arriveAt(initialPatrolState(), 5000);
    const result = updatePatrol(paused, { pointCount: POINT_COUNT, arrived: true, timeMs: 100 });
    expect(result.departed).toBe(false);
    expect(result.look).toBe("arrival");
  });

  it("stays on the only point of a single-point patrol", () => {
    const paused = updatePatrol(initialPatrolState(), { pointCount: 1, arrived: true, timeMs: 0 });
    expect(paused.state.targetIndex).toBe(0);
  });

  it("redirects and resumes without keeping a stale pause", () => {
    const paused = arriveAt(initialPatrolState(), 0);
    expect(withPatrolTarget(paused, 3, POINT_COUNT).targetIndex).toBe(3);
    expect(resumePatrol(paused)).toEqual({ targetIndex: 1, phase: "moving", pauseStartedAtMs: null });
  });

  it("rejects invalid input", () => {
    const state = initialPatrolState();
    expect(() => updatePatrol(state, { pointCount: 0, arrived: false, timeMs: 0 })).toThrow();
    expect(() => updatePatrol(state, {
      pointCount: POINT_COUNT,
      arrived: false,
      timeMs: Number.NaN,
    })).toThrow();
    expect(() => withPatrolTarget(state, 4, POINT_COUNT)).toThrow();
  });
});
