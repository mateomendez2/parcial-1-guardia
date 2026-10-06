# Evidencia — Upgrade 7: Distractores sonoros interactivos

- Spec y plan: en esta misma carpeta.
- Versión inicial: `main`, commit `629e25b` (ver `../punto-inicial.md`).
- Versión final: commit final de la entrega, el mismo para los cinco upgrades.
- Entorno: Windows 10.0.26200, Node.js v22.16.0, Vite 6.4.3, Vitest 4.1.10.
- Herramienta y modelo: Claude (Anthropic), `claude-opus-5-5`.

## Registro cronológico resumido

| Hora (6/10) | Acción | Resultado | Decisión humana |
|---|---|---|---|
| 18:04 | Redacción de spec y plan. | Tecla `E`, hasta 5 celdas, recarga de 3 s, mirar 1,5 s. | Aprobados a las 18:06 sin cambios. |
| 18:08 | Incremento 1: caída, recarga e investigación, con pruebas. | 8 pruebas nuevas. | — |
| 18:10 | Incremento 2: tecla `E`, reacción del guardia y HUD. | — | — |
| 18:13 | Primera comprobación visual. | La marca del distractor quedaba en pantalla si nadie lo investigaba. | — |
| 18:14 | Corrección. | La marca se oculta cuando el sonido termina y no hay investigación. | — |
| 18:16 | Comprobación visual con telemetría sobre la versión final. | Lanzamiento lejos sin reacción; lanzamiento cerca con ida, espera y regreso a patrulla. | — |

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
| `src/domain/behavior/distraction.ts` | Nuevo. Punto de caída, recarga y fases de la investigación. |
| `tests/behavior/distraction.test.ts` | Nuevo, 8 pruebas. |
| `src/game/scenes/GameScene.ts` | Tecla `E`, marca del distractor, reacción al sonido, regreso a patrulla y líneas de HUD. |
| `README.md`, `index.html` | Control `E`. |

No se modificaron `perception.ts`, `memory.ts` ni la FSM del parcial. `Q` sigue emitiendo desde el jugador.

## Matriz criterio–evidencia

| ID | Criterio | Comprobación | Resultado |
|---|---|---|---|
| C1 | Cae en la celda libre más lejana, hasta 5. | `distraction.test.ts` › lands on the farthest free cell… Telemetría: desde (2,2) cae en `7,2`; desde (3,2) cae en `8,2`. | Aprobado |
| C2 | Con pared pegada, cae en la celda de origen. | `distraction.test.ts` › lands on the origin cell when a wall is right next to it | Aprobado |
| C3 | La recarga impide lanzar antes de 3000 ms. | `distraction.test.ts` › blocks a second throw… Telemetría: dos pulsaciones de `E` con 0,65 s de diferencia producen un solo evento (t=20884). | Aprobado |
| C4 | Ir, mirar al llegar y terminar a los 1500 ms. | `distraction.test.ts` › goes, looks on arrival and finishes… Telemetría: `INVESTIGA -> MIRA` en t=142021 y `MIRA -> PATRULLA` en t=143521, 1500 ms después. | Aprobado |
| C5 | El guardia oye, va, mira y vuelve a patrullar. | Telemetría t=141255 a t=153472: `PATRULLA -> INVESTIGA`, `MIRA`, `PATRULLA` y luego llegada al punto de patrulla pendiente. Captura `05-guardia-mira-el-distractor.jpg` (`guardia MIRA`, `distractor RECARGA 0.9s`, `memoria sound`). | Aprobado |
| C6 | Fuera de alcance, el guardia no reacciona. | Telemetría t=20884: hay evento `distractor` y ningún evento `guardia`; la patrulla sigue con sus llegadas normales. | Aprobado, sin captura del HUD |
| C7 | Validación completa. | `npm run validate`, salida de arriba. | Aprobado |

## Evidencia visual y telemetría

La comprobación visual se hizo sobre `npm run dev` en la computadora del estudiante (http://localhost:5173/), el 6/10/2026 entre 18:16 y 18:20. La ejecutó el agente desde el navegador integrado de la aplicación: teclas enviadas como eventos de teclado y destino manual con un clic real. El registro completo está en `../capturas/telemetria-sesion.txt`.

Secuencia reproducible:

1. Con el guardia lejos, apretar `E` dos veces seguidas: un solo lanzamiento y ninguna reacción.
2. Llevar al guardia con un clic a la celda (6,1). Desde la celda (3,2), mirando a la derecha, apretar `P` y enseguida `E`.
3. El guardia va al punto de caída (8,2), el HUD muestra `guardia MIRA` y, 1,5 s después, `guardia PATRULLA`.

## Limitaciones

- Mientras el guardia investiga, la línea `patrulla Pn/4` del HUD sigue diciendo `EN CAMINO`; el estado real está en la línea `guardia`.
- El caso «origen inalcanzable» no se pudo provocar en este nivel: toda celda libre está conectada. Queda cubierto sólo por el código que marca `SONIDO INALCANZABLE`, sin prueba automatizada.
- La captura pedida en C6 (`sonido FUERA DE RANGO`) no se obtuvo: el aviso dura 0,8 s. Se reemplaza por telemetría.
- El guardia investiga cualquier sonido que oye, también el de `Q`, y no distingue visión de sonido (H4).

## Revisión final y decisión humana

- Decisiones del estudiante: eligió los cinco upgrades (17:50), aprobó la spec y el plan de este upgrade (18:06) y delegó en el agente la implementación y la comprobación visual (18:06).
- Revisión de alcance: los archivos modificados coinciden con los previstos en el plan.
- Recomendación del agente: integrar.
- Decisión del estudiante: integrar. Confirmada a las 18:25, después de ver el juego en ejecución.
