# Plan — Upgrade 4: Impacto visual extremo de alerta

- Spec: en esta carpeta.
- Estado: APROBADO por el estudiante el 6/10/2026, 18:06.

| N.º | Cambio | Archivos previstos | Criterios | Validación | Riesgo |
|---|---|---|---|---|---|
| 1 | Regla de disparo y duraciones. | `src/domain/behavior/alertImpact.ts`, `tests/behavior/alertImpact.test.ts` | C1–C4 | `npx vitest run tests/behavior/alertImpact.test.ts` | Disparos repetidos. |
| 2 | Temblor, destello, signo `!` y telemetría. | `src/game/scenes/GameScene.ts` | C5, C6 | `npm run validate` y secuencia manual | Cámara desplazada al terminar. |
| 3 | Evidencia y revisión del diff. | `evidencia.md` | Todos | Lectura del diff | — |

## Condiciones para detenerse

- El efecto requiere tocar el medidor o la detección.
- La cámara no vuelve a su posición.

## Reversibilidad

El incremento 1 sólo agrega archivos. El incremento 2 se limita a `GameScene.ts`.
