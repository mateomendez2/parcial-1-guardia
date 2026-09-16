import { assertFiniteVector } from "../model/vector";
import type { PerceptionMemory } from "../perception/memory";

export const SEARCH_TIMEOUT_MS = 3000;

export type GuardState = "patrolling" | "pursuing" | "investigating" | "returning";

export type GuardActionKind = "patrol" | "pursue" | "investigate" | "return-to-patrol";

export interface GuardAction {
  readonly kind: GuardActionKind;
}

export interface GuardBehaviorState {
  readonly state: GuardState;
  readonly investigationStartedAtMs: number | null;
}

export interface GuardBehaviorInput {
  readonly timeMs: number;
  readonly playerVisible: boolean;
  readonly memory: PerceptionMemory;
}

export interface GuardBehaviorResult {
  readonly state: GuardBehaviorState;
  readonly action: GuardAction;
}

export function initialGuardBehaviorState(): GuardBehaviorState {
  return { state: "patrolling", investigationStartedAtMs: null };
}

export function decideGuardBehavior(
  current: GuardBehaviorState,
  input: GuardBehaviorInput,
): GuardBehaviorResult {
  if (!Number.isFinite(input.timeMs)) {
    throw new Error("Behavior time must be finite.");
  }

  switch (current.state) {
    case "patrolling":
      return input.playerVisible ? pursueResult() : patrolResult();
    case "pursuing":
      return input.playerVisible ? pursueResult() : investigateResult(input.memory, input.timeMs);
    case "investigating": {
      if (current.investigationStartedAtMs === null) {
        throw new Error("Investigating state requires an investigation start time.");
      }
      if (input.playerVisible) {
        return pursueResult();
      }
      if (input.timeMs - current.investigationStartedAtMs >= SEARCH_TIMEOUT_MS) {
        return returnToPatrolResult();
      }
      return stayInvestigatingResult(current);
    }
    case "returning":
      return input.playerVisible ? pursueResult() : returnToPatrolResult();
  }
}

function patrolResult(): GuardBehaviorResult {
  return {
    state: { state: "patrolling", investigationStartedAtMs: null },
    action: { kind: "patrol" },
  };
}

function pursueResult(): GuardBehaviorResult {
  return {
    state: { state: "pursuing", investigationStartedAtMs: null },
    action: { kind: "pursue" },
  };
}

function investigateResult(memory: PerceptionMemory, startedAtMs: number): GuardBehaviorResult {
  if (memory.lastKnownPosition === null) {
    throw new Error("Cannot investigate without a last known position.");
  }
  assertFiniteVector(memory.lastKnownPosition);
  return {
    state: { state: "investigating", investigationStartedAtMs: startedAtMs },
    action: { kind: "investigate" },
  };
}

function stayInvestigatingResult(current: GuardBehaviorState): GuardBehaviorResult {
  return { state: current, action: { kind: "investigate" } };
}

function returnToPatrolResult(): GuardBehaviorResult {
  return {
    state: { state: "returning", investigationStartedAtMs: null },
    action: { kind: "return-to-patrol" },
  };
}