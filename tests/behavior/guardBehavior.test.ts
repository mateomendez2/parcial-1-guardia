import { describe, expect, it } from "vitest";
import {
  SEARCH_TIMEOUT_MS,
  decideGuardBehavior,
  initialGuardBehaviorState,
  type GuardBehaviorState,
} from "../../src/domain/behavior/guardBehavior";
import type { PerceptionMemory } from "../../src/domain/perception/memory";

const MEMORY: PerceptionMemory = {
  lastKnownPosition: { x: 10, y: 12 },
  lastPerceivedAtMs: 0,
  source: "vision",
};

const NO_MEMORY: PerceptionMemory = {
  lastKnownPosition: null,
  lastPerceivedAtMs: null,
  source: null,
};

function decide(
  state: GuardBehaviorState,
  timeMs: number,
  playerVisible: boolean,
  memory: PerceptionMemory = MEMORY,
) {
  return decideGuardBehavior(state, { timeMs, playerVisible, memory });
}

function tick(
  state: GuardBehaviorState,
  timeMs: number,
  playerVisible: boolean,
  memory: PerceptionMemory = MEMORY,
): GuardBehaviorState {
  return decide(state, timeMs, playerVisible, memory).state;
}

describe("guard behavior", () => {
  it("starts patrolling without a pending investigation timer", () => {
    const result = decide(initialGuardBehaviorState(), 0, false);

    expect(result.state.state).toBe("patrolling");
    expect(result.state.investigationStartedAtMs).toBeNull();
    expect(result.action.kind).toBe("patrol");
  });

  it("keeps patrolling while there is no perception", () => {
    const state = tick(initialGuardBehaviorState(), 1000, false);

    expect(state.state).toBe("patrolling");
  });

  it("pursues when the player becomes visible while patrolling", () => {
    const result = decide(initialGuardBehaviorState(), 200, true);

    expect(result.state.state).toBe("pursuing");
    expect(result.action.kind).toBe("pursue");
  });

  it("starts investigating at the exact loss-of-vision time", () => {
    const state = tick(initialGuardBehaviorState(), 100, true);
    const result = decide(state, 500, false);

    expect(result.state.state).toBe("investigating");
    expect(result.state.investigationStartedAtMs).toBe(500);
    expect(result.action.kind).toBe("investigate");
  });

  it("keeps investigating before the timeout expires", () => {
    const state = tick(initialGuardBehaviorState(), 100, true);
    const investigating = tick(state, 500, false);
    const result = decide(investigating, 500 + SEARCH_TIMEOUT_MS - 1, false);

    expect(result.state.state).toBe("investigating");
    expect(result.state.investigationStartedAtMs).toBe(500);
    expect(result.action.kind).toBe("investigate");
  });

  it("returns to patrol as soon as the timeout is reached", () => {
    const state = tick(initialGuardBehaviorState(), 100, true);
    const investigating = tick(state, 500, false);
    const result = decide(investigating, 500 + SEARCH_TIMEOUT_MS, false);

    expect(result.state.state).toBe("returning");
    expect(result.state.investigationStartedAtMs).toBeNull();
    expect(result.action.kind).toBe("return-to-patrol");
  });

  it("pursues again when vision is recovered before the timeout", () => {
    const state = tick(initialGuardBehaviorState(), 100, true);
    const investigating = tick(state, 500, false);
    const result = decide(investigating, 500 + 1500, true);

    expect(result.state.state).toBe("pursuing");
    expect(result.state.investigationStartedAtMs).toBeNull();
    expect(result.action.kind).toBe("pursue");
  });

  it("pursues again when vision is recovered while returning", () => {
    const state = tick(initialGuardBehaviorState(), 100, true);
    const investigating = tick(state, 500, false);
    const returning = tick(investigating, 500 + SEARCH_TIMEOUT_MS, false);
    const result = decide(returning, 500 + SEARCH_TIMEOUT_MS + 700, true);

    expect(result.state.state).toBe("pursuing");
    expect(result.action.kind).toBe("pursue");
  });

  it("stays returning after the timeout while still without vision", () => {
    const state = tick(initialGuardBehaviorState(), 100, true);
    const investigating = tick(state, 500, false);
    const returning = tick(investigating, 500 + SEARCH_TIMEOUT_MS, false);
    const result = decide(returning, 500 + SEARCH_TIMEOUT_MS + 5000, false);

    expect(result.state.state).toBe("returning");
    expect(result.action.kind).toBe("return-to-patrol");
  });

  it("handles a large temporal jump without leaving an invalid state", () => {
    const state = tick(initialGuardBehaviorState(), 100, true);
    const investigating = tick(state, 500, false);
    const result = decide(investigating, 10_000_000, false);

    expect(result.state.state).toBe("returning");
    expect(result.state.investigationStartedAtMs).toBeNull();
  });

  it("rejects unfinite behavior time", () => {
    expect(() => decide(initialGuardBehaviorState(), Number.NaN, false)).toThrow(
      "Behavior time",
    );
  });

  it("rejects investigation without a last known position", () => {
    const state = tick(initialGuardBehaviorState(), 100, true, NO_MEMORY);
    expect(() => decide(state, 200, false, NO_MEMORY)).toThrow(
      "Cannot investigate without a last known position.",
    );
  });
});