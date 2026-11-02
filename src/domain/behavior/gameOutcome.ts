import type { GridPoint } from "../model/grid";
import { distanceBetween, type Vector2 } from "../model/vector";

export const CATCH_DISTANCE = 20;

export type GameOutcome = "playing" | "won" | "caught";

export interface OutcomeInput {
  readonly playerCell: GridPoint;
  readonly exit: GridPoint;
  readonly player: Vector2;
  readonly guard: Vector2;
}

/** Capture is checked first: reaching the exit while being caught still loses. */
export function evaluateOutcome(input: OutcomeInput): GameOutcome {
  if (distanceBetween(input.player, input.guard) < CATCH_DISTANCE) {
    return "caught";
  }
  if (input.playerCell.x === input.exit.x && input.playerCell.y === input.exit.y) {
    return "won";
  }
  return "playing";
}
