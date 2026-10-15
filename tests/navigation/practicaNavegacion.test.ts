import { describe, expect, it } from "vitest";
import { calculateRoute } from "../../src/application/simulation/navigationDemo";
import { createGridMap, isWalkable, type GridPoint } from "../../src/domain/model/grid";
import { findPathAStar, findPathBfs, type SearchResult } from "../../src/domain/navigation/search";
import { routeCost, terrainEntryCost } from "../../src/domain/navigation/terrainCost";

// Fixture común de la práctica: 5x3, cuatro vecinos, S=(0,1), G=(4,1), costo 1.
const FREE = createGridMap(5, 3, []);
const S: GridPoint = { x: 0, y: 1 };
const G: GridPoint = { x: 4, y: 1 };
const BARRIER = createGridMap(5, 3, [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }]);
const SLOW_STRIP = [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }];
const SLOW = terrainEntryCost(SLOW_STRIP.map((point) => ({ point, cost: 5 })));
const RESTORED = terrainEntryCost(SLOW_STRIP.map((point) => ({ point, cost: 1 })));
const DIRECT: GridPoint[] = [S, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, G];

function steps(result: SearchResult): number {
  return result.path.length - 1;
}

function isCardinalRoute(path: readonly GridPoint[]): boolean {
  return path.every((point, index) => {
    const previous = path[index - 1];
    return !previous || Math.abs(point.x - previous.x) + Math.abs(point.y - previous.y) === 1;
  });
}

describe("práctica de navegación — fixture común", () => {
  it("BASE-AC2: BFS y A* dan una ruta cardinal de 4 pasos y costo 4 en el mapa libre", () => {
    const bfs = findPathBfs(FREE, S, G);
    const astar = findPathAStar(FREE, S, G);
    for (const result of [bfs, astar]) {
      expect(result.status).toBe("success");
      expect(result.path).toEqual(DIRECT);
      expect(steps(result)).toBe(4);
      expect(result.totalCost).toBe(4);
      expect(isCardinalRoute(result.path)).toBe(true);
    }
    // Métricas reales registradas en evidencia.md.
    expect([bfs.expandedNodes, bfs.maximumFrontier]).toEqual([12, 4]);
    expect([astar.expandedNodes, astar.maximumFrontier]).toEqual([5, 9]);
  });

  it("BASE-AC3: inicio igual a meta es éxito de costo 0", () => {
    for (const result of [findPathBfs(FREE, S, S), findPathAStar(FREE, S, S)]) {
      expect(result.status).toBe("success");
      expect(result.path).toEqual([S]);
      expect(result.totalCost).toBe(0);
    }
  });

  it("BASE-AC3: la barrera completa en x=2 da inaccesible, distinto de extremos inválidos", () => {
    for (const result of [findPathBfs(BARRIER, S, G), findPathAStar(BARRIER, S, G)]) {
      expect(result.status).toBe("unreachable");
      expect(result.path).toEqual([]);
      expect(result.totalCost).toBeNull();
    }
    expect(findPathAStar(FREE, { x: -1, y: 1 }, G).status).toBe("invalid-start");
    expect(findPathAStar(FREE, S, { x: 5, y: 1 }).status).toBe("invalid-goal");
    expect(findPathBfs(FREE, { x: -1, y: 1 }, G).status).toBe("invalid-start");
    expect(findPathBfs(FREE, S, { x: 5, y: 1 }).status).toBe("invalid-goal");
  });
});

describe("anexo A — terreno lento", () => {
  it("A-AC1: la ruta directa cuesta 16 y A* ponderado devuelve un rodeo de 6 pasos y costo 6", () => {
    expect(routeCost(DIRECT, SLOW)).toBe(16);

    const result = findPathAStar(FREE, S, G, SLOW);
    expect(result.status).toBe("success");
    expect(steps(result)).toBe(6);
    expect(result.totalCost).toBe(6);
    expect(routeCost(result.path, SLOW)).toBe(6);
    expect([result.expandedNodes, result.maximumFrontier]).toEqual([7, 5]);
    expect(isCardinalRoute(result.path)).toBe(true);
    expect(result.path.every((point) => isWalkable(FREE, point))).toBe(true);
    expect(result.path.some((point) => SLOW_STRIP.some((slow) =>
      slow.x === point.x && slow.y === point.y))).toBe(false);
  });

  it("A-AC2 / A-04: con la franja restaurada a costo 1 recupera 4 pasos y costo 4", () => {
    const slow = findPathAStar(FREE, S, G, SLOW);
    const restored = findPathAStar(FREE, S, G, RESTORED);
    expect(steps(slow)).toBe(6);
    expect(steps(restored)).toBe(4);
    expect(restored.totalCost).toBe(4);
  });

  it("A-01: BFS conserva su semántica unitaria y no es oráculo del mínimo ponderado", () => {
    const bfs = calculateRoute(FREE, S, G, "bfs", SLOW);
    expect(steps(bfs)).toBe(4);
    expect(bfs.totalCost).toBe(4);
    expect(routeCost(bfs.path, SLOW)).toBe(16);
  });

  it("rechaza costos de entrada menores que 1", () => {
    expect(() => terrainEntryCost([{ point: S, cost: 0 }])).toThrow();
    expect(() => findPathAStar(FREE, S, G, () => 0.5)).toThrow();
  });

  it("A-AC3: el consumidor calculateRoute usa el modo ponderado y conserva el unitario", () => {
    const weighted = calculateRoute(FREE, S, G, "astar", SLOW);
    expect(weighted.status).toBe("success");
    expect(steps(weighted)).toBe(6);
    expect(weighted.totalCost).toBe(6);

    const unit = calculateRoute(FREE, S, G, "astar");
    expect(steps(unit)).toBe(4);
    expect(unit.totalCost).toBe(4);
  });
});
