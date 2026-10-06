# Evidencia — Upgrade 1: Patrulla con pausas y mirada direccional

- Spec y plan: en esta misma carpeta.
- Versión inicial: `main`, commit `629e25b` (ver `../punto-inicial.md`).
- Versión final: commit final de la entrega, el mismo para los cinco upgrades.
- Entorno: Windows 10.0.26200, Node.js v22.16.0, Vite 6.4.3, Vitest 4.1.10.
- Herramienta y modelo: Claude (Anthropic), `claude-opus-5-5`.

## Registro cronológico resumido

| Hora (6/10) | Acción | Resultado | Decisión humana |
|---|---|---|---|
| 17:43 | Exploración en lectura de README, AGENTS, arquitectura, escena, dominio y pruebas. | El guardia sólo se mueve por clic; la FSM del parcial no está conectada a la escena. | Elegir los upgrades 1, 2, 4, 7 y 8. |
| 17:50 | Redacción de spec y plan. | Cuatro puntos, pausa de 1200 ms y mirada desde 600 ms. | Aprobados a las 17:58 sin cambios. |
| 17:55 | Validación de referencia. | 51 pruebas, compilación correcta. | Continuar. |
| 17:58 | Incrementos 1 a 3 del plan. | Regla de dominio, planificación de tramos y conexión con la escena. | — |
| 18:02 | `npm run validate`. | 67 pruebas, compilación correcta. | El estudiante miró el juego y lo dio por bueno (18:06). |
| 18:16 | Comprobación visual con telemetría sobre la versión final. | Ciclo completo P2→P3→P4→P1, suspensión por clic y reanudación con `P`. | — |

Desvío respecto del plan: los incrementos 1, 2 y 3 se aplicaron seguidos y se validaron juntos, sin una autorización separada por incremento, por el tiempo disponible antes del cierre.

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

## Cambios (diff respecto de `629e25b`)

| Archivo | Cambio |
|---|---|
| `src/domain/behavior/patrol.ts` | Nuevo. Regla pura de patrulla: orden cíclico, pausa y mirada. |
| `src/application/simulation/patrolSimulation.ts` | Nuevo. Elige el próximo punto alcanzable y la dirección del primer paso. |
| `src/application/simulation/labLevel.ts` | Agrega `PATROL_POINTS`. |
| `src/game/scenes/GameScene.ts` | Patrulla al iniciar, tecla `P`, mirada anticipada, marcadores P1–P4 y línea de HUD. |
| `tests/behavior/patrol.test.ts` | Nuevo, 9 pruebas. |
| `tests/application/patrolSimulation.test.ts` | Nuevo, 7 pruebas. |
| `README.md`, `index.html` | Controles: tecla `P` y efecto del clic. |

No se modificaron `search.ts`, `pathFollower.ts` ni la percepción.

## Matriz criterio–evidencia

| ID | Criterio | Comprobación | Resultado |
|---|---|---|---|
| C1 | Orden 0→1→2→3→0. | `patrol.test.ts` › visits the points in cyclic order. Telemetría: llegadas con `proximo P2`, `P3`, `P4`, `P1` (t=8034 a t=32335). | Aprobado |
| C2 | No avanza antes de 1200 ms. | `patrol.test.ts` › holds the pause until its full duration has elapsed. Telemetría: pausas de 1200, 1200, 1216 y 1233 ms. | Aprobado |
| C3 | Mirada de llegada antes de 600 ms y hacia el próximo tramo después. | `patrol.test.ts` › looks as it arrived first… Captura `01-patrulla-pausa-y-mirada.jpg`: llegó a P1 caminando hacia el este y el cono apunta al norte, hacia P2. | Aprobado |
| C4 | Salto temporal: una sola salida, un único punto. | `patrol.test.ts` › ends the pause once… | Aprobado |
| C5 | Punto inalcanzable salteado; ninguno alcanzable sin excepción. | `patrolSimulation.test.ts` › skips an unreachable point… / reports no leg… | Aprobado |
| C6 | Puntos del nivel transitables y conectados. | `patrolSimulation.test.ts` › uses walkable, mutually connected patrol points | Aprobado |
| C7 | El clic suspende y `P` retoma. | Telemetría t=35068 (`activa -> suspendida`, clic) y t=140488 (`suspendida -> activa`, tecla P). Capturas `01-patrulla-suspendida-por-clic.jpg` y `01-patrulla-retomada-con-p.jpg`. | Aprobado |
| C8 | Dominio sin Phaser y validación completa. | `npm run validate`, salida de arriba. | Aprobado |

## Evidencia visual y telemetría

La comprobación visual se hizo sobre `npm run dev` en la computadora del estudiante (http://localhost:5173/), el 6/10/2026 entre 18:16 y 18:20. La ejecutó el agente desde el navegador integrado de la aplicación: teclas enviadas como eventos de teclado y destino manual con un clic real. El registro completo está en `../capturas/telemetria-sesion.txt`.

Secuencia reproducible:

1. `npm run dev` y abrir la dirección local.
2. Esperar a que el guardia llegue a un rombo: el HUD muestra `patrulla Pn/4 PAUSA` y el cono gira antes de salir.
3. Hacer clic en una celda libre: el HUD muestra `SUSPENDIDA` y `guardia MANUAL`.
4. Apretar `P`: el HUD vuelve a `EN CAMINO` y el guardia retoma hacia el punto pendiente.

Capturas en `../capturas/`: `01-patrulla-pausa-y-mirada.jpg`, `01-patrulla-suspendida-por-clic.jpg`, `01-patrulla-retomada-con-p.jpg`.

## Limitaciones

- La fase `BLOQUEADA` sólo está cubierta por pruebas: el nivel actual no tiene puntos inalcanzables.
- La patrulla no reacciona a la visión; eso corresponde a la máquina de estados (H4), fuera de alcance.
- Las pausas medidas en pantalla superan 1200 ms por hasta un cuadro de dibujo (33 ms como máximo en la sesión).

## Revisión final y decisión humana

- Decisiones del estudiante: eligió los cinco upgrades (17:50), aprobó la spec y el plan de este upgrade (17:58) y delegó en el agente la implementación y la comprobación visual (18:06).
- Revisión de alcance: los archivos modificados coinciden con los previstos en el plan, más `index.html` para listar el control.
- Recomendación del agente: integrar.
- Decisión del estudiante: integrar. Confirmada a las 18:25, después de ver el juego en ejecución.
