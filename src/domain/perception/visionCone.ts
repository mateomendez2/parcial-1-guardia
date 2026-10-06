import { isWalkable, worldToCell, type GridMap } from "../model/grid";
import { assertFiniteVector, normalized, type Vector2 } from "../model/vector";

export interface VisionConeQuery {
  readonly map: GridMap;
  readonly tileSize: number;
  readonly observer: Vector2;
  readonly facing: Vector2;
  readonly range: number;
  readonly fieldOfViewRadians: number;
  readonly rayCount: number;
}

/**
 * End points of the rays that outline the visible part of the cone. Each ray stops at the
 * first wall or at the vision range. This is a drawing aid: detection stays in evaluateVision.
 */
export function visionConeOutline(query: VisionConeQuery): Vector2[] {
  assertFiniteVector(query.observer);
  assertFiniteVector(query.facing);
  if (
    !Number.isFinite(query.tileSize)
    || query.tileSize <= 0
    || !Number.isFinite(query.range)
    || query.range < 0
    || !Number.isFinite(query.fieldOfViewRadians)
    || query.fieldOfViewRadians < 0
    || query.fieldOfViewRadians > Math.PI * 2
    || !Number.isInteger(query.rayCount)
    || query.rayCount < 2
  ) {
    throw new Error("Vision cone configuration is invalid.");
  }

  const facing = normalized(query.facing);
  if (!facing) {
    return [];
  }

  const facingAngle = Math.atan2(facing.y, facing.x);
  const startAngle = facingAngle - query.fieldOfViewRadians / 2;
  const angleStep = query.fieldOfViewRadians / (query.rayCount - 1);
  const stepSize = query.tileSize / 8;
  const points: Vector2[] = [];

  for (let ray = 0; ray < query.rayCount; ray += 1) {
    const angle = startAngle + angleStep * ray;
    const direction = { x: Math.cos(angle), y: Math.sin(angle) };
    const length = rayLength(query, direction, stepSize);
    points.push({
      x: query.observer.x + direction.x * length,
      y: query.observer.y + direction.y * length,
    });
  }

  return points;
}

function rayLength(query: VisionConeQuery, direction: Vector2, stepSize: number): number {
  if (!isWalkable(query.map, worldToCell(query.observer, query.tileSize))) {
    return 0;
  }

  let reached = 0;
  while (reached < query.range) {
    const next = Math.min(query.range, reached + stepSize);
    const point = {
      x: query.observer.x + direction.x * next,
      y: query.observer.y + direction.y * next,
    };
    if (!isWalkable(query.map, worldToCell(point, query.tileSize))) {
      break;
    }
    reached = next;
  }
  return reached;
}
