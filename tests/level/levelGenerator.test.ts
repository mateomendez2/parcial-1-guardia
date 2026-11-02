import { describe, expect, it } from "vitest";
import { FIXED_LEVEL } from "../../src/application/simulation/labLevel";
import {
  MIN_GUARD_DISTANCE,
  generateLevel,
  levelProblems,
} from "../../src/domain/level/levelGenerator";
import { createGridMap, isWalkable } from "../../src/domain/model/grid";
import { findPathBfs } from "../../src/domain/navigation/search";

describe("level generator", () => {
  it("generates playable levels for 200 seeds", () => {
    let generated = 0;
    for (let seed = 1; seed <= 200; seed += 1) {
      const level = generateLevel(seed, FIXED_LEVEL);
      expect(levelProblems(level)).toEqual([]);
      expect(level.patrolPoints.length).toBe(4);
      expect(level.playerStart.x).toBe(2);
      expect(level.riskCells.every((cell) => isWalkable(level.map, cell))).toBe(true);
      expect(findPathBfs(level.map, level.playerStart, level.exit).status).toBe("success");
      const distance = Math.abs(level.guardStart.x - level.playerStart.x)
        + Math.abs(level.guardStart.y - level.playerStart.y);
      expect(distance).toBeGreaterThanOrEqual(MIN_GUARD_DISTANCE);
      if (!level.fallback) {
        generated += 1;
      }
    }
    expect(generated).toBeGreaterThan(190);
  });

  it("is deterministic for a seed and varies between seeds", () => {
    const first = generateLevel(42, FIXED_LEVEL);
    const again = generateLevel(42, FIXED_LEVEL);
    const other = generateLevel(43, FIXED_LEVEL);
    expect([...again.map.blocked].sort()).toEqual([...first.map.blocked].sort());
    expect(again.patrolPoints).toEqual(first.patrolPoints);
    expect([...other.map.blocked].sort()).not.toEqual([...first.map.blocked].sort());
  });

  it("detects a level without a path to the exit", () => {
    const walled = createGridMap(5, 3, [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }]);
    const problems = levelProblems({
      map: walled,
      riskCells: [],
      playerStart: { x: 0, y: 1 },
      exit: { x: 4, y: 1 },
      guardStart: { x: 0, y: 0 },
      patrolPoints: [{ x: 0, y: 2 }],
    });
    expect(problems).toContain("no-path-to-exit");
    expect(problems).toContain("guard-too-close");
  });

  it("the fixed fallback level is itself valid", () => {
    expect(levelProblems(FIXED_LEVEL)).toEqual([]);
  });
});
