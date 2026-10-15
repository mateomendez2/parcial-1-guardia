import { cellKey, type GridPoint } from "../model/grid";
import type { EntryCost } from "./search";

export interface TerrainCell {
  readonly point: GridPoint;
  readonly cost: number;
}

/** Builds an entry-cost function from explicit slow cells; every other cell costs 1. */
export function terrainEntryCost(cells: Iterable<TerrainCell>): EntryCost {
  const costs = new Map<string, number>();
  for (const cell of cells) {
    if (!Number.isFinite(cell.cost) || cell.cost < 1) {
      throw new Error(`Terrain cost must be finite and at least 1: ${cellKey(cell.point)}.`);
    }
    costs.set(cellKey(cell.point), cell.cost);
  }
  return (point) => costs.get(cellKey(point)) ?? 1;
}

/** Sums the entry cost of every cell after the first one. */
export function routeCost(path: readonly GridPoint[], entryCost: EntryCost): number {
  return path.slice(1).reduce((total, point) => total + entryCost(point), 0);
}
