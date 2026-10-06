import { describe, expect, it } from "vitest";
import { LAB_MAP, PATROL_POINTS } from "../../src/application/simulation/labLevel";
import {
  firstStepDirection,
  planPatrolLeg,
} from "../../src/application/simulation/patrolSimulation";
import { createGridMap, isWalkable, type GridPoint } from "../../src/domain/model/grid";
import { findPathAStar } from "../../src/domain/navigation/search";

// 5x3 map split in two by a full wall at x = 2.
const SPLIT_MAP = createGridMap(5, 3, [
  { x: 2, y: 0 },
  { x: 2, y: 1 },
  { x: 2, y: 2 },
]);
const LEFT: GridPoint = { x: 0, y: 1 };

describe("patrol simulation", () => {
  it("uses walkable, mutually connected patrol points in the lab level (C6)", () => {
    expect(PATROL_POINTS.length).toBe(4);
    PATROL_POINTS.forEach((point, index) => {
      const next = PATROL_POINTS[(index + 1) % PATROL_POINTS.length];
      if (!next) {
        throw new Error("Missing patrol point.");
      }
      expect(isWalkable(LAB_MAP, point)).toBe(true);
      expect(findPathAStar(LAB_MAP, point, next).status).toBe("success");
    });
  });

  it("plans the preferred point when it is reachable", () => {
    const leg = planPatrolLeg(SPLIT_MAP, LEFT, [{ x: 1, y: 0 }, { x: 1, y: 2 }], 1, "astar");
    expect(leg?.targetIndex).toBe(1);
    expect(leg?.route.totalCost).toBe(2);
  });

  it("skips an unreachable point and plans the next one (C5)", () => {
    const leg = planPatrolLeg(SPLIT_MAP, LEFT, [{ x: 4, y: 1 }, { x: 1, y: 1 }], 0, "astar");
    expect(leg?.targetIndex).toBe(1);
    expect(leg?.route.status).toBe("success");
  });

  it("skips a point placed on a wall", () => {
    const leg = planPatrolLeg(SPLIT_MAP, LEFT, [{ x: 2, y: 1 }, { x: 1, y: 1 }], 0, "bfs");
    expect(leg?.targetIndex).toBe(1);
  });

  it("reports no leg, without throwing, when every point is unreachable (C5)", () => {
    expect(planPatrolLeg(SPLIT_MAP, LEFT, [{ x: 4, y: 1 }, { x: 3, y: 0 }], 0, "astar")).toBeNull();
  });

  it("rejects a preferred index outside the patrol points", () => {
    expect(() => planPatrolLeg(SPLIT_MAP, LEFT, [{ x: 1, y: 1 }], 1, "astar")).toThrow();
  });

  it("gives the direction of the first step, or null for a route that does not move", () => {
    const moving = planPatrolLeg(SPLIT_MAP, LEFT, [{ x: 1, y: 1 }], 0, "astar");
    const still = planPatrolLeg(SPLIT_MAP, LEFT, [LEFT], 0, "astar");
    if (!moving || !still) {
      throw new Error("Expected reachable legs.");
    }
    expect(firstStepDirection(moving.route)).toEqual({ x: 1, y: 0 });
    expect(firstStepDirection(still.route)).toBeNull();
  });
});
