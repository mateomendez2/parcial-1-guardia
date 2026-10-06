# Plan — Upgrade 1: Patrulla con pausas y mirada direccional

- Spec: `docs/upgrades/01-patrulla-pausas-mirada/spec.md`.
- Estado: APROBADO por el estudiante el 6/10/2026, 17:58.

## Incrementos

| N.º | Cambio | Archivos previstos | Criterios | Validación | Riesgo |
|---|---|---|---|---|---|
| 1 | Regla de patrulla en dominio: orden cíclico, pausa y mirada. | `src/domain/behavior/patrol.ts`, `tests/behavior/patrol.test.ts` | C1–C4 | `npx vitest run tests/behavior/patrol.test.ts` | Error de borde en el tiempo de pausa. |
| 2 | Puntos del nivel y elección del próximo tramo alcanzable. | `src/application/simulation/labLevel.ts`, `src/application/simulation/patrolSimulation.ts`, `tests/application/patrolSimulation.test.ts` | C5, C6 | `npx vitest run tests/application/patrolSimulation.test.ts` | Un punto elegido cae sobre una pared. |
| 3 | Conexión con la escena: patrulla al iniciar, tecla `P`, mirada y línea de HUD. | `src/game/scenes/GameScene.ts`, `README.md` (controles) | C7, C8 | `npm run validate` y secuencia manual con `npm run dev` | Romper el destino manual de H3. |
| 4 | Registro de evidencia y revisión del diff. | `docs/upgrades/01-patrulla-pausas-mirada/evidencia.md` | Todos | Lectura del diff completo | Evidencia que no corresponde a la versión final. |

## Condiciones para detenerse

- Una prueba existente deja de pasar.
- Hace falta modificar `search.ts`, `pathFollower.ts` o la percepción.
- La regla necesita importar algo de Phaser en `src/domain/`.
- Aparece una decisión de diseño no cubierta por la spec.

## Reversibilidad

Los incrementos 1 y 2 sólo agregan archivos y constantes. El incremento 3 se concentra en `GameScene.ts`; revertir ese archivo devuelve el comportamiento de H3.
