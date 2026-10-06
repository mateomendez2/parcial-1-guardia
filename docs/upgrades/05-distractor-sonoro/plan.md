# Plan — Upgrade 7: Distractores sonoros interactivos

- Spec: en esta carpeta.
- Estado: APROBADO por el estudiante el 6/10/2026, 18:06.

| N.º | Cambio | Archivos previstos | Criterios | Validación | Riesgo |
|---|---|---|---|---|---|
| 1 | Punto de caída, recarga e investigación en dominio. | `src/domain/behavior/distraction.ts`, `tests/behavior/distraction.test.ts` | C1–C4 | `npx vitest run tests/behavior/distraction.test.ts` | Caer dentro de una pared. |
| 2 | Tecla `E`, reacción del guardia y HUD. | `src/game/scenes/GameScene.ts`, `README.md`, `index.html` (controles) | C5–C7 | `npm run validate` y secuencia manual | Romper la patrulla del upgrade 1. |
| 3 | Evidencia y revisión del diff. | `evidencia.md` | Todos | Lectura del diff | — |

## Condiciones para detenerse

- Hace falta modificar `perception.ts`, `memory.ts` o la FSM del parcial.
- La patrulla deja de retomarse después de investigar.

## Reversibilidad

El incremento 1 sólo agrega archivos. El incremento 2 se concentra en `GameScene.ts`.
