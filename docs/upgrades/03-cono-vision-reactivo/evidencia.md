# Evidencia — Upgrade 2: Cono de visión visible y reactivo

- Spec y plan: en esta misma carpeta.
- Versión inicial: `main`, commit `629e25b` (ver `../punto-inicial.md`).
- Versión final: commit final de la entrega, el mismo para los cinco upgrades.
- Entorno: Windows 10.0.26200, Node.js v22.16.0, Vite 6.4.3, Vitest 4.1.10.
- Herramienta y modelo: Claude (Anthropic), `claude-opus-5-5`.

## Registro cronológico resumido

| Hora (6/10) | Acción | Resultado | Decisión humana |
|---|---|---|---|
| 18:04 | Redacción de spec y plan. | Cono recortado por rayos y color por estado. | Aprobados a las 18:06 sin cambios. |
| 18:08 | Incremento 1: contorno por rayos y pruebas. | 5 pruebas nuevas. | — |
| 18:10 | Incremento 2: dibujo recortado y color. | 41 rayos por cuadro. | — |
| 18:16 | Comprobación visual sobre la versión final. | El cono termina en las paredes y cambia con el estado. | — |

## Validación completa de la versión final

`npm run validate` (tipos, pruebas y compilación), 6/10/2026 18:20, en la computadora del estudiante:

```text
> tsc --noEmit

 RUN  v4.1.10

 ✓ tests/behavior/patrol.test.ts (9 tests)
 ✓ tests/behavior/alertImpact.test.ts (5 tests)
 ✓ tests/behavior/alertMeter.test.ts (7 tests)
 ✓ tests/behavior/distraction.test.ts (8 tests)
 ✓ tests/behavior/guardBehavior.test.ts (12 tests)
 ✓ tests/navigation/pathFollower.test.ts (6 tests)
 ✓ tests/model/grid.test.ts (5 tests)
 ✓ tests/perception/perception.test.ts (12 tests)
 ✓ tests/perception/visionCone.test.ts (5 tests)
 ✓ tests/navigation/search.test.ts (9 tests)
 ✓ tests/application/patrolSimulation.test.ts (7 tests)
 ✓ tests/perception/memory.test.ts (5 tests)
 ✓ tests/application/perceptionSimulation.test.ts (2 tests)
 ✓ tests/telemetry/telemetry.test.ts (2 tests)

 Test Files  14 passed (14)
      Tests  94 passed (94)
   Start at  18:20:54

vite v6.4.3 building for production...
✓ 27 modules transformed.
✓ built in 4.19s
```

## Cambios

| Archivo | Cambio |
|---|---|
| `src/domain/perception/visionCone.ts` | Nuevo. Contorno del cono: cada rayo termina en la primera pared o en el alcance. |
| `tests/perception/visionCone.test.ts` | Nuevo, 5 pruebas. |
| `src/game/scenes/GameScene.ts` | `drawPerception` dibuja el contorno recortado con el color del estado; más opaco y con borde si el jugador es visible. |

`evaluateVision` no se modificó: la detección es la misma de H3.

## Matriz criterio–evidencia

| ID | Criterio | Comprobación | Resultado |
|---|---|---|---|
| C1 | Sin paredes, los rayos llegan al alcance. | `visionCone.test.ts` › reaches the full range… | Aprobado |
| C2 | Con pared delante, terminan antes de la pared. | `visionCone.test.ts` › stops the rays before a wall | Aprobado |
| C3 | Cubren exactamente el ángulo de visión. | `visionCone.test.ts` › spans exactly the field of view… | Aprobado |
| C4 | Dirección inválida: contorno vacío; configuración inválida: error. | `visionCone.test.ts` › returns an empty outline… | Aprobado |
| C5 | Color según el estado del nivel. | Capturas `02-estado-alerta.jpg` (rojo), `02-estado-sospecha.jpg` (amarillo), `03-cono-jugador-visible.jpg` (azul, más opaco y con borde). | Aprobado |
| C6 | El cono no atraviesa paredes. | Captura `03-cono-recortado-por-pared.jpg`: guardia mirando al sur, cono cortado en línea recta por la pared de la fila 15. | Aprobado |
| C7 | Validación completa. | `npm run validate`, salida de arriba. | Aprobado |

## Evidencia visual

La comprobación visual se hizo sobre `npm run dev` en la computadora del estudiante (http://localhost:5173/), el 6/10/2026 entre 18:16 y 18:20. La ejecutó el agente desde el navegador integrado de la aplicación: teclas enviadas como eventos de teclado y destino manual con un clic real. El registro completo está en `../capturas/telemetria-sesion.txt`.

Secuencia reproducible: dejar patrullar al guardia y observar el tramo de P2 a P3; al bajar por la columna 18 el cono queda cortado por la pared horizontal de la fila 15.

## Limitaciones

- El recorte usa pasos de 4 px: en las esquinas puede diferir de la detección por menos de una celda.
- En la captura `05-guardia-mira-el-distractor.jpg` el cono casi no se ve porque el guardia mira una pared que está a 16 px.
- 41 rayos por cuadro; no se midió el costo en equipos lentos.

## Revisión final y decisión humana

- Decisiones del estudiante: eligió los cinco upgrades (17:50), aprobó la spec y el plan de este upgrade (18:06) y delegó en el agente la implementación y la comprobación visual (18:06).
- Revisión de alcance: los archivos modificados coinciden con los previstos en el plan.
- Recomendación del agente: integrar.
- Decisión del estudiante: integrar. Confirmada a las 18:25, después de ver el juego en ejecución.
