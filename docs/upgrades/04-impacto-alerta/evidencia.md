# Evidencia — Upgrade 4: Impacto visual extremo de alerta

- Spec y plan: en esta misma carpeta.
- Versión inicial: `main`, commit `629e25b` (ver `../punto-inicial.md`).
- Versión final: commit final de la entrega, el mismo para los cinco upgrades.
- Entorno: Windows 10.0.26200, Node.js v22.16.0, Vite 6.4.3, Vitest 4.1.10.
- Herramienta y modelo: Claude (Anthropic), `claude-opus-5-5`.

## Registro cronológico resumido

| Hora (6/10) | Acción | Resultado | Decisión humana |
|---|---|---|---|
| 18:04 | Redacción de spec y plan. | Temblor de 300 ms, destello de 200 ms y signo `!` de 800 ms, una vez por entrada. | Aprobados a las 18:06 sin cambios. |
| 18:08 | Incremento 1: regla de disparo y pruebas. | 5 pruebas nuevas. | — |
| 18:10 | Incremento 2: efectos y telemetría. | Contador y estado de cámara en el HUD. | — |
| 18:16 | Comprobación visual con telemetría sobre la versión final. | Dos entradas en `ALERTA`, dos impactos; ninguno repetido. | — |

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
| `src/domain/behavior/alertImpact.ts` | Nuevo. Regla de disparo y duraciones. |
| `tests/behavior/alertImpact.test.ts` | Nuevo, 5 pruebas. |
| `src/game/scenes/GameScene.ts` | `cameras.main.shake`, `cameras.main.flash`, signo `!`, contador y estado de cámara en el HUD, `resetFX` al reiniciar. |

No se modificaron el medidor, la detección ni los controles.

## Matriz criterio–evidencia

| ID | Criterio | Comprobación | Resultado |
|---|---|---|---|
| C1 | Se dispara sólo al pasar a `ALERTA`. | `alertImpact.test.ts` › fires only on the transition into alert. Telemetría: cada `impacto` comparte instante con `SOSPECHA -> ALERTA` (t=62236 y t=107320). | Aprobado |
| C2 | Permanecer en `ALERTA` no lo repite. | `alertImpact.test.ts` › does not repeat while the level stays in alert / brief loss of sight. Telemetría: entre t=107320 y t=129054 (21,7 s en `ALERTA`) no hay otro impacto. | Aprobado |
| C3 | Salir y volver a entrar lo dispara otra vez. | `alertImpact.test.ts` › fires again after leaving alert… Telemetría: `impacto 1` y `impacto 2`. | Aprobado |
| C4 | Duración total menor a 1000 ms. | `alertImpact.test.ts` › declares a total duration under one second | Aprobado |
| C5 | Un impacto por entrada, contador +1 y cámara `ESTABLE` al terminar. | Capturas `02-estado-alerta.jpg` (`impactos 1 | camara ESTABLE`) y `04-segundo-impacto-contador-2.jpg` (`impactos 2 | camara ESTABLE`). | Aprobado, con la limitación de abajo |
| C6 | Validación completa. | `npm run validate`, salida de arriba. | Aprobado |

## Evidencia visual y telemetría

La comprobación visual se hizo sobre `npm run dev` en la computadora del estudiante (http://localhost:5173/), el 6/10/2026 entre 18:16 y 18:20. La ejecutó el agente desde el navegador integrado de la aplicación: teclas enviadas como eventos de teclado y destino manual con un clic real. El registro completo está en `../capturas/telemetria-sesion.txt`.

Secuencia reproducible: la misma del upgrade 8. Entrar en el cono hasta `ALERTA`, salir hasta `TRANQUILO` y volver a entrar.

## Limitaciones

- **No hay captura del instante del efecto.** El temblor, el destello y el signo `!` duran menos de un segundo y las capturas del agente llegan con uno a tres segundos de demora. La evidencia del efecto es la telemetría y el contador; las capturas muestran el estado posterior, con la cámara estable. Queda pendiente que el estudiante lo observe o lo grabe.
- No se probó en pantalla el reinicio con `R` durante el efecto; `create()` llama a `resetFX()`.
- Sin opción para desactivar el destello por accesibilidad.

## Revisión final y decisión humana

- Decisiones del estudiante: eligió los cinco upgrades (17:50), aprobó la spec y el plan de este upgrade (18:06) y delegó en el agente la implementación y la comprobación visual (18:06).
- Revisión de alcance: los archivos modificados coinciden con los previstos en el plan.
- Recomendación del agente: integrar.
- Decisión del estudiante: integrar. Confirmada a las 18:25, después de ver el juego en ejecución.
