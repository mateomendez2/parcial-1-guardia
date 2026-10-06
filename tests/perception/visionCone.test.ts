import { describe, expect, it } from "vitest";
import { createGridMap } from "../../src/domain/model/grid";
import { distanceBetween } from "../../src/domain/model/vector";
import { visionConeOutline, type VisionConeQuery } from "../../src/domain/perception/visionCone";

const TILE = 32;
const OPEN_MAP = createGridMap(20, 20, []);
// Vertical wall at x = 12 covering every row.
const WALLED_MAP = createGridMap(
  20,
  20,
  Array.from({ length: 20 }, (_unused, y) => ({ x: 12, y })),
);
const OBSERVER = { x: 10 * TILE + TILE / 2, y: 10 * TILE + TILE / 2 };

function query(overrides: Partial<VisionConeQuery>): VisionConeQuery {
  return {
    map: OPEN_MAP,
    tileSize: TILE,
    observer: OBSERVER,
    facing: { x: 1, y: 0 },
    range: 220,
    fieldOfViewRadians: Math.PI / 2,
    rayCount: 9,
    ...overrides,
  };
}

describe("vision cone outline", () => {
  it("reaches the full range when nothing blocks the rays (C1)", () => {
    const points = visionConeOutline(query({}));
    expect(points.length).toBe(9);
    for (const point of points) {
      expect(distanceBetween(OBSERVER, point)).toBeCloseTo(220, 6);
    }
  });

  it("stops the rays before a wall (C2)", () => {
    const points = visionConeOutline(query({ map: WALLED_MAP }));
    const wallStart = 12 * TILE;
    for (const point of points) {
      expect(point.x).toBeLessThan(wallStart);
    }
    const center = points[4];
    if (!center) {
      throw new Error("Missing center ray.");
    }
    // The observer is 48 px from the wall; the ray stops within one step (4 px) of it.
    expect(center.x).toBeGreaterThan(wallStart - 5);
    expect(center.y).toBeCloseTo(OBSERVER.y, 6);
  });

  it("spans exactly the field of view, centered on the facing direction (C3)", () => {
    const points = visionConeOutline(query({ facing: { x: 0, y: 1 }, range: 100 }));
    const first = points[0];
    const middle = points[4];
    const last = points[8];
    if (!first || !middle || !last) {
      throw new Error("Missing rays.");
    }
    const angleOf = (point: { x: number; y: number }): number =>
      Math.atan2(point.y - OBSERVER.y, point.x - OBSERVER.x);
    expect(angleOf(middle)).toBeCloseTo(Math.PI / 2, 6);
    expect(angleOf(first)).toBeCloseTo(Math.PI / 4, 6);
    expect(angleOf(last)).toBeCloseTo(3 * Math.PI / 4, 6);
  });

  it("returns zero-length rays toward an adjacent wall without failing", () => {
    const beside = { x: 11 * TILE + TILE - 1, y: OBSERVER.y };
    const points = visionConeOutline(query({ map: WALLED_MAP, observer: beside, rayCount: 3 }));
    const center = points[1];
    if (!center) {
      throw new Error("Missing center ray.");
    }
    expect(distanceBetween(beside, center)).toBe(0);
  });

  it("returns an empty outline for an invalid facing and rejects invalid configuration (C4)", () => {
    expect(visionConeOutline(query({ facing: { x: 0, y: 0 } }))).toEqual([]);
    expect(() => visionConeOutline(query({ rayCount: 1 }))).toThrow();
    expect(() => visionConeOutline(query({ range: -1 }))).toThrow();
    expect(() => visionConeOutline(query({ tileSize: 0 }))).toThrow();
  });
});
