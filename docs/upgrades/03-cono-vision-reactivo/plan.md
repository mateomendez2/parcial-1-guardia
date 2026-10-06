# Plan — Upgrade 2: Cono de visión visible y reactivo

- Spec: en esta carpeta.
- Estado: APROBADO por el estudiante el 6/10/2026, 18:06.

| N.º | Cambio | Archivos previstos | Criterios | Validación | Riesgo |
|---|---|---|---|---|---|
| 1 | Contorno del cono por rayos. | `src/domain/perception/visionCone.ts`, `tests/perception/visionCone.test.ts` | C1–C4 | `npx vitest run tests/perception/visionCone.test.ts` | Costo por cuadro si hay demasiados rayos. |
| 2 | Dibujo recortado y color por estado. | `src/game/scenes/GameScene.ts` | C5–C7 | `npm run validate` y secuencia manual | Que el cono dibujado contradiga la detección. |
| 3 | Evidencia y revisión del diff. | `evidencia.md` | Todos | Lectura del diff | — |

## Condiciones para detenerse

- Hace falta modificar `evaluateVision`.
- El dibujo baja visiblemente la fluidez del juego.

## Reversibilidad

El incremento 1 sólo agrega archivos. El incremento 2 cambia únicamente `drawPerception` en `GameScene.ts`.
