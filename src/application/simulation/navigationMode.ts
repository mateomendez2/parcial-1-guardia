import { cellKey, createGridMap, type GridMap, type GridPoint } from "../../domain/model/grid";
import type { SearchAlgorithm, SearchResult } from "../../domain/navigation/search";
import { terrainEntryCost } from "../../domain/navigation/terrainCost";
import { calculateRoute } from "./navigationDemo";

export type NavigationMode = "short" | "safe";

export const RISK_ENTRY_COST = 5;

export interface PlannedRoute {
  readonly result: SearchResult;
  /** True when the safe mode had no route avoiding risk zones and the short route was used. */
  readonly safeFallback: boolean;
}

/**
 * Short: every free cell costs 1. Safe with A*: risk cells cost RISK_ENTRY_COST.
 * Safe with BFS (no costs): risk cells are forbidden, except start and goal; without a
 * route the short route is used and reported.
 */
export function planRoute(
  map: GridMap,
  start: GridPoint,
  goal: GridPoint,
  algorithm: SearchAlgorithm,
  mode: NavigationMode,
  riskCells: readonly GridPoint[],
): PlannedRoute {
  if (mode === "short" || riskCells.length === 0) {
    return { result: calculateRoute(map, start, goal, algorithm), safeFallback: false };
  }
  if (algorithm === "astar") {
    const entryCost = terrainEntryCost(riskCells.map((point) => ({ point, cost: RISK_ENTRY_COST })));
    return { result: calculateRoute(map, start, goal, "astar", entryCost), safeFallback: false };
  }

  const keep = new Set([cellKey(start), cellKey(goal)]);
  const blocked = [...map.blocked].map((key) => {
    const [x, y] = key.split(",").map(Number);
    return { x: x ?? 0, y: y ?? 0 };
  });
  const avoided = riskCells.filter((point) => !keep.has(cellKey(point)));
  const safeMap = createGridMap(map.width, map.height, [...blocked, ...avoided]);
  const safe = calculateRoute(safeMap, start, goal, "bfs");
  if (safe.status === "success") {
    return { result: safe, safeFallback: false };
  }
  return { result: calculateRoute(map, start, goal, "bfs"), safeFallback: true };
}
