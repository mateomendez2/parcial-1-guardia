import type { GridMap, GridPoint } from "../../domain/model/grid";
import type { Vector2 } from "../../domain/model/vector";
import type { SearchAlgorithm, SearchResult } from "../../domain/navigation/search";
import { calculateRoute } from "./navigationDemo";

export interface PatrolLeg {
  readonly targetIndex: number;
  readonly route: SearchResult;
}

/**
 * Picks the next patrol point that can be reached, starting at the preferred one.
 * Returns null when no patrol point is reachable from the current cell.
 */
export function planPatrolLeg(
  map: GridMap,
  from: GridPoint,
  points: readonly GridPoint[],
  preferredIndex: number,
  algorithm: SearchAlgorithm,
): PatrolLeg | null {
  if (!Number.isInteger(preferredIndex) || preferredIndex < 0 || preferredIndex >= points.length) {
    throw new Error("Preferred patrol index is outside the patrol points.");
  }

  for (let offset = 0; offset < points.length; offset += 1) {
    const targetIndex = (preferredIndex + offset) % points.length;
    const point = points[targetIndex];
    if (!point) {
      throw new Error("Patrol point invariant failed.");
    }
    const route = calculateRoute(map, from, point, algorithm);
    if (route.status === "success") {
      return { targetIndex, route };
    }
  }

  return null;
}

/** Direction of the first step of a route, or null when the route does not move. */
export function firstStepDirection(route: SearchResult): Vector2 | null {
  const start = route.path[0];
  const next = route.path[1];
  if (!start || !next) {
    return null;
  }
  return { x: next.x - start.x, y: next.y - start.y };
}
