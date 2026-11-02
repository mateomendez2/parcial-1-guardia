import { describe, expect, it } from "vitest";
import { evaluateOutcome } from "../../src/domain/behavior/gameOutcome";

const base = { playerCell: { x: 5, y: 5 }, exit: { x: 27, y: 9 }, player: { x: 176, y: 176 } };

describe("game outcome", () => {
  it("keeps playing when far from guard and exit", () => {
    expect(evaluateOutcome({ ...base, guard: { x: 400, y: 400 } })).toBe("playing");
  });
  it("wins on the exit cell", () => {
    expect(evaluateOutcome({ ...base, playerCell: { x: 27, y: 9 }, guard: { x: 400, y: 400 } }))
      .toBe("won");
  });
  it("is caught when the guard is closer than 20 px, even on the exit", () => {
    expect(evaluateOutcome({ ...base, guard: { x: 190, y: 176 } })).toBe("caught");
    expect(evaluateOutcome({ ...base, playerCell: { x: 27, y: 9 }, guard: { x: 180, y: 176 } }))
      .toBe("caught");
  });
});
