import { describe, expect, it } from "vitest";
import { planRoute } from "../../src/application/simulation/navigationMode";
import { createGridMap, type GridPoint } from "../../src/domain/model/grid";

const FREE = createGridMap(5, 3, []);
const S: GridPoint = { x: 0, y: 1 };
const G: GridPoint = { x: 4, y: 1 };
const STRIP = [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }];
const touchesRisk = (path: readonly GridPoint[], risk: readonly GridPoint[]): boolean =>
  path.some((p) => risk.some((r) => r.x === p.x && r.y === p.y));

describe("navigation mode", () => {
  it("short route crosses the risk strip with both algorithms", () => {
    for (const algorithm of ["astar", "bfs"] as const) {
      const route = planRoute(FREE, S, G, algorithm, "short", STRIP);
      expect(route.result.path.length - 1).toBe(4);
      expect(touchesRisk(route.result.path, STRIP)).toBe(true);
    }
  });

  it("safe A* takes the cheaper detour (cost 6 instead of 16)", () => {
    const route = planRoute(FREE, S, G, "astar", "safe", STRIP);
    expect(route.result.totalCost).toBe(6);
    expect(touchesRisk(route.result.path, STRIP)).toBe(false);
    expect(route.safeFallback).toBe(false);
  });

  it("safe BFS forbids risk cells", () => {
    const route = planRoute(FREE, S, G, "bfs", "safe", STRIP);
    expect(route.result.status).toBe("success");
    expect(touchesRisk(route.result.path, STRIP)).toBe(false);
    expect(route.result.path.length - 1).toBe(6);
  });

  it("safe BFS falls back to the short route when every path crosses risk", () => {
    const column = [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }];
    const route = planRoute(FREE, S, G, "bfs", "safe", column);
    expect(route.safeFallback).toBe(true);
    expect(route.result.status).toBe("success");
    expect(route.result.path.length - 1).toBe(4);
  });

  it("finds a route when start and goal are inside risk zones", () => {
    const risk = [S, G];
    for (const algorithm of ["astar", "bfs"] as const) {
      expect(planRoute(FREE, S, G, algorithm, "safe", risk).result.status).toBe("success");
    }
  });
});
