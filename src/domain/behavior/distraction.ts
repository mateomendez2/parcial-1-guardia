import { isWalkable, type GridMap, type GridPoint } from "../model/grid";
import { assertFiniteVector, type Vector2 } from "../model/vector";

export const DISTRACTION_MAX_CELLS = 5;
export const DISTRACTION_COOLDOWN_MS = 3000;
export const INVESTIGATION_LOOK_MS = 1500;

/**
 * Cell where a thrown distraction lands: the farthest free cell, up to maxCells, in the given
 * direction. A wall right next to the origin makes it land on the origin itself.
 */
export function distractionLanding(
  map: GridMap,
  origin: GridPoint,
  direction: Vector2,
  maxCells: number = DISTRACTION_MAX_CELLS,
): GridPoint | null {
  assertFiniteVector(direction);
  if (!Number.isInteger(maxCells) || maxCells < 0) {
    throw new Error("Distraction distance must be a non-negative integer.");
  }

  const stepX = Math.sign(direction.x);
  const stepY = Math.sign(direction.y);
  if ((stepX === 0 && stepY === 0) || !isWalkable(map, origin)) {
    return null;
  }

  let landing = origin;
  for (let step = 0; step < maxCells; step += 1) {
    const next = { x: landing.x + stepX, y: landing.y + stepY };
    const cutsCorner = stepX !== 0 && stepY !== 0 && (
      !isWalkable(map, { x: landing.x + stepX, y: landing.y })
      || !isWalkable(map, { x: landing.x, y: landing.y + stepY })
    );
    if (!isWalkable(map, next) || cutsCorner) {
      break;
    }
    landing = next;
  }
  return landing;
}

export function distractionCooldownRemaining(lastThrowAtMs: number | null, timeMs: number): number {
  if (!Number.isFinite(timeMs)) {
    throw new Error("Distraction time must be finite.");
  }
  if (lastThrowAtMs === null) {
    return 0;
  }
  return Math.max(0, DISTRACTION_COOLDOWN_MS - Math.max(0, timeMs - lastThrowAtMs));
}

export function canThrowDistraction(lastThrowAtMs: number | null, timeMs: number): boolean {
  return distractionCooldownRemaining(lastThrowAtMs, timeMs) === 0;
}

export type InvestigationPhase = "going" | "looking" | "done";

export interface InvestigationState {
  readonly phase: InvestigationPhase;
  readonly lookStartedAtMs: number | null;
}

export interface InvestigationInput {
  readonly arrived: boolean;
  readonly timeMs: number;
}

export function startInvestigation(): InvestigationState {
  return { phase: "going", lookStartedAtMs: null };
}

export function updateInvestigation(
  current: InvestigationState,
  input: InvestigationInput,
): InvestigationState {
  if (!Number.isFinite(input.timeMs)) {
    throw new Error("Investigation time must be finite.");
  }

  if (current.phase === "going") {
    return input.arrived ? { phase: "looking", lookStartedAtMs: input.timeMs } : current;
  }
  if (current.phase === "looking") {
    if (current.lookStartedAtMs === null) {
      throw new Error("Looking phase requires a start time.");
    }
    return input.timeMs - current.lookStartedAtMs >= INVESTIGATION_LOOK_MS
      ? { phase: "done", lookStartedAtMs: null }
      : current;
  }
  return current;
}
