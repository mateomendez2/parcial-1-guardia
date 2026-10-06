# Plan — Upgrade 8: Medidor de alerta y estados del nivel

- Spec: en esta carpeta.
- Estado: APROBADO por el estudiante el 6/10/2026, 18:06.

| N.º | Cambio | Archivos previstos | Criterios | Validación | Riesgo |
|---|---|---|---|---|---|
| 1 | Regla del medidor y de los estados. | `src/domain/behavior/alertMeter.ts`, `tests/behavior/alertMeter.test.ts` | C1–C5 | `npx vitest run tests/behavior/alertMeter.test.ts` | Error en el borde de la histéresis. |
| 2 | Barra, línea de HUD y borde por estado. | `src/game/scenes/GameScene.ts` | C6, C7 | `npm run validate` y secuencia manual | Tapar el HUD existente. |
| 3 | Evidencia y revisión del diff. | `evidencia.md` | Todos | Lectura del diff | Capturas de otra versión. |

## Condiciones para detenerse

- Hace falta cambiar `perception.ts` o la FSM del parcial.
- Una prueba existente deja de pasar.
- Se necesita decidir qué hace el guardia en `ALERTA` (fuera de alcance).

## Reversibilidad

El incremento 1 sólo agrega archivos. El incremento 2 se limita a `GameScene.ts`.
