import { cellKey, createGridMap, isWalkable, type GridMap, type GridPoint } from "../model/grid";
import { findPathBfs } from "../navigation/search";

export const LEVEL_WIDTH = 30;
export const LEVEL_HEIGHT = 20;
export const MAX_ATTEMPTS = 50;
export const MIN_GUARD_DISTANCE = 10;
export const PATROL_POINT_COUNT = 4;

export interface Level {
  readonly seed: number;
  readonly attempt: number;
  readonly fallback: boolean;
  readonly map: GridMap;
  readonly riskCells: readonly GridPoint[];
  readonly playerStart: GridPoint;
  readonly exit: GridPoint;
  readonly guardStart: GridPoint;
  readonly patrolPoints: readonly GridPoint[];
}

/** Deterministic pseudo-random generator (mulberry32). */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** Returns the broken validity rules; an empty list means the level is playable. */
export function levelProblems(level: Omit<Level, "seed" | "attempt" | "fallback">): string[] {
  const problems: string[] = [];
  const actors = [level.playerStart, level.exit, level.guardStart, ...level.patrolPoints];
  if (!actors.every((point) => isWalkable(level.map, point))) {
    problems.push("actor-on-wall");
    return problems;
  }
  if (findPathBfs(level.map, level.playerStart, level.exit).status !== "success") {
    problems.push("no-path-to-exit");
  }
  if (level.patrolPoints.some((point) =>
    findPathBfs(level.map, level.guardStart, point).status !== "success")) {
    problems.push("patrol-unreachable");
  }
  if (manhattan(level.guardStart, level.playerStart) < MIN_GUARD_DISTANCE) {
    problems.push("guard-too-close");
  }
  return problems;
}

/**
 * Generates a valid level for the seed. Each attempt derives its own random stream from the
 * seed; after MAX_ATTEMPTS invalid attempts the fixed fallback level is returned.
 */
export function generateLevel(seed: number, fallback: Omit<Level, "seed" | "attempt" | "fallback">): Level {
  if (!Number.isInteger(seed)) {
    throw new Error("Level seed must be an integer.");
  }
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const candidate = buildCandidate(seededRandom(seed * 1000 + attempt));
    if (candidate && levelProblems(candidate).length === 0) {
      return { ...candidate, seed, attempt, fallback: false };
    }
  }
  return { ...fallback, seed, attempt: MAX_ATTEMPTS, fallback: true };
}

function buildCandidate(random: () => number): Omit<Level, "seed" | "attempt" | "fallback"> | null {
  const between = (min: number, max: number): number => min + Math.floor(random() * (max - min + 1));
  const playerStart = { x: 2, y: between(2, LEVEL_HEIGHT - 3) };
  const exit = { x: LEVEL_WIDTH - 3, y: between(2, LEVEL_HEIGHT - 3) };
  const reserved = new Set([cellKey(playerStart), cellKey(exit)]);

  const blocked: GridPoint[] = [];
  for (let x = 0; x < LEVEL_WIDTH; x += 1) {
    blocked.push({ x, y: 0 }, { x, y: LEVEL_HEIGHT - 1 });
  }
  for (let y = 1; y < LEVEL_HEIGHT - 1; y += 1) {
    blocked.push({ x: 0, y }, { x: LEVEL_WIDTH - 1, y });
  }
  const wallCount = between(6, 10);
  for (let wall = 0; wall < wallCount; wall += 1) {
    const horizontal = random() < 0.5;
    const length = between(3, 8);
    const x = between(4, LEVEL_WIDTH - 5);
    const y = between(2, LEVEL_HEIGHT - 3);
    for (let step = 0; step < length; step += 1) {
      const cell = horizontal ? { x: x + step, y } : { x, y: y + step };
      if (cell.x < LEVEL_WIDTH - 1 && cell.y < LEVEL_HEIGHT - 1 && !reserved.has(cellKey(cell))) {
        blocked.push(cell);
      }
    }
  }
  const map = createGridMap(LEVEL_WIDTH, LEVEL_HEIGHT, blocked);

  const riskCells: GridPoint[] = [];
  const riskKeys = new Set<string>();
  const zoneCount = between(2, 4);
  for (let zone = 0; zone < zoneCount; zone += 1) {
    const width = between(2, 3);
    const height = between(2, 3);
    const x = between(4, LEVEL_WIDTH - 4 - width);
    const y = between(1, LEVEL_HEIGHT - 1 - height);
    for (let dy = 0; dy < height; dy += 1) {
      for (let dx = 0; dx < width; dx += 1) {
        const cell = { x: x + dx, y: y + dy };
        if (isWalkable(map, cell) && !riskKeys.has(cellKey(cell))) {
          riskKeys.add(cellKey(cell));
          riskCells.push(cell);
        }
      }
    }
  }

  const free: GridPoint[] = [];
  for (let y = 1; y < LEVEL_HEIGHT - 1; y += 1) {
    for (let x = 1; x < LEVEL_WIDTH - 1; x += 1) {
      const cell = { x, y };
      if (isWalkable(map, cell) && !reserved.has(cellKey(cell))) {
        free.push(cell);
      }
    }
  }
  const far = free.filter((cell) => manhattan(cell, playerStart) >= MIN_GUARD_DISTANCE);
  const guardStart = far[Math.floor(random() * far.length)];
  if (!guardStart) {
    return null;
  }

  const patrolPoints: GridPoint[] = [guardStart];
  for (let tries = 0; tries < 200 && patrolPoints.length < PATROL_POINT_COUNT; tries += 1) {
    const candidate = free[Math.floor(random() * free.length)];
    if (candidate && patrolPoints.every((point) => manhattan(point, candidate) >= 6)) {
      patrolPoints.push(candidate);
    }
  }
  if (patrolPoints.length < PATROL_POINT_COUNT) {
    return null;
  }

  return { map, riskCells, playerStart, exit, guardStart, patrolPoints };
}

function manhattan(from: GridPoint, to: GridPoint): number {
  return Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
}
