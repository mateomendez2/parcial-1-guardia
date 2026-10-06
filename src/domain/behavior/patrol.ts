export const PATROL_PAUSE_MS = 1200;
export const PATROL_LOOK_AHEAD_MS = 600;

export type PatrolPhase = "moving" | "pausing";

/** Where the guard should look: along its route, as it arrived, or toward the next leg. */
export type PatrolLook = "travel" | "arrival" | "next";

export interface PatrolState {
  /** Point the guard is heading to; while pausing, the point it will leave for. */
  readonly targetIndex: number;
  readonly phase: PatrolPhase;
  readonly pauseStartedAtMs: number | null;
}

export interface PatrolInput {
  readonly pointCount: number;
  readonly arrived: boolean;
  readonly timeMs: number;
}

export interface PatrolResult {
  readonly state: PatrolState;
  readonly look: PatrolLook;
  /** True only on the update in which the pause ends. */
  readonly departed: boolean;
}

export function initialPatrolState(): PatrolState {
  return { targetIndex: 0, phase: "moving", pauseStartedAtMs: null };
}

export function updatePatrol(current: PatrolState, input: PatrolInput): PatrolResult {
  assertPointCount(input.pointCount);
  assertTargetIndex(current.targetIndex, input.pointCount);
  if (!Number.isFinite(input.timeMs)) {
    throw new Error("Patrol time must be finite.");
  }

  if (current.phase === "moving") {
    if (!input.arrived) {
      return { state: current, look: "travel", departed: false };
    }
    return {
      state: {
        targetIndex: (current.targetIndex + 1) % input.pointCount,
        phase: "pausing",
        pauseStartedAtMs: input.timeMs,
      },
      look: "arrival",
      departed: false,
    };
  }

  if (current.pauseStartedAtMs === null) {
    throw new Error("Pausing state requires a pause start time.");
  }

  const elapsed = Math.max(0, input.timeMs - current.pauseStartedAtMs);
  if (elapsed >= PATROL_PAUSE_MS) {
    return {
      state: { targetIndex: current.targetIndex, phase: "moving", pauseStartedAtMs: null },
      look: "next",
      departed: true,
    };
  }

  return {
    state: current,
    look: elapsed >= PATROL_LOOK_AHEAD_MS ? "next" : "arrival",
    departed: false,
  };
}

/** Redirects the patrol to another point, for example when the planned one is unreachable. */
export function withPatrolTarget(
  current: PatrolState,
  targetIndex: number,
  pointCount: number,
): PatrolState {
  assertPointCount(pointCount);
  assertTargetIndex(targetIndex, pointCount);
  return { ...current, targetIndex };
}

/** Resumes a suspended patrol toward the pending point, discarding any pause in progress. */
export function resumePatrol(current: PatrolState): PatrolState {
  return { targetIndex: current.targetIndex, phase: "moving", pauseStartedAtMs: null };
}

function assertPointCount(pointCount: number): void {
  if (!Number.isInteger(pointCount) || pointCount <= 0) {
    throw new Error("Patrol requires at least one point.");
  }
}

function assertTargetIndex(targetIndex: number, pointCount: number): void {
  if (!Number.isInteger(targetIndex) || targetIndex < 0 || targetIndex >= pointCount) {
    throw new Error("Patrol target index is outside the patrol points.");
  }
}
