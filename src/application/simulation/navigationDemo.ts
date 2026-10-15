import type { GridMap, GridPoint } from "../../domain/model/grid";
import {
  findPathAStar,
  findPathBfs,
  type EntryCost,
  type SearchAlgorithm,
  type SearchResult,
} from "../../domain/navigation/search";

/**
 * Entry point used by the scene. Without entryCost every cell costs 1 (previous behavior).
 * With entryCost, A* minimizes the summed entry cost; BFS keeps its unit-step semantics.
 */
export function calculateRoute(
  map: GridMap,
  start: GridPoint,
  goal: GridPoint,
  algorithm: SearchAlgorithm,
  entryCost?: EntryCost,
): SearchResult {
  return algorithm === "astar"
    ? findPathAStar(map, start, goal, entryCost)
    : findPathBfs(map, start, goal);
}
