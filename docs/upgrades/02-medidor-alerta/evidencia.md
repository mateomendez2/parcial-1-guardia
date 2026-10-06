# Evidencia — Upgrade 8: Medidor de alerta y estados del nivel

- Spec y plan: en esta misma carpeta.
- Versión inicial: `main`, commit `629e25b` (ver `../punto-inicial.md`).
- Versión final: commit final de la entrega, el mismo para los cinco upgrades.
- Entorno: Windows 10.0.26200, Node.js v22.16.0, Vite 6.4.3, Vitest 4.1.10.
- Herramienta y modelo: Claude (Anthropic), `claude-opus-5-5`.

## Registro cronológico resumido

| Hora (6/10) | Acción | Resultado | Decisión humana |
|---|---|---|---|
| 18:04 | Redacción de spec y plan. | Medidor 0–100, tres estados e histéresis. | Aprobados a las 18:06 sin cambios. |
| 18:08 | Incremento 1: regla y pruebas. | 7 pruebas nuevas. | — |
| 18:10 | Incremento 2: barra, HUD y borde. | Visible en la escena. | — |
| 18:13 | Primera comprobación visual. | Fallo: el medidor tardó 1850 ms en pasar de 36 a 100; la spec pide unos 1070 ms. | — |
| 18:14 | Depuración por evidencia (ver abajo). | Corregido y repetido: 1100 ms. | — |
| 18:15 | Ajuste de presentación. | La barra tapaba la primera fila jugable; se movió a la fila superior. | — |
| 18:16 | Comprobación visual con telemetría sobre la versión final. | Tres estados, histéresis y regreso a `TRANQUILO`. | — |

Desvío respecto del plan: los incrementos de los upgrades 8, 2, 4 y 7 se programaron seguidos, por delegación del estudiante, y se validaron juntos.

## Depuración por evidencia

- **Reproducción:** con el guardia quieto mirando al jugador, la telemetría registró `TRANQUILO -> SOSPECHA` en t=53847 y `SOSPECHA -> ALERTA` en t=55697: 1850 ms para 64 puntos (35 por segundo en lugar de 60).
- **Hipótesis:** la escena pasaba al medidor el `delta` de Phaser, que está suavizado y acotado; con pocos cuadros por segundo ese valor es menor que el tiempo real transcurrido. Predicción: usando la diferencia de tiempo de escena, la subida vuelve a 60 por segundo.
- **Corrección mínima:** `GameScene.updateAlert` calcula `deltaMs` como diferencia entre tiempos de escena. La regla de dominio no cambió.
- **Repetición del caso:** t=61169 → t=62236, 1067 ms. Coincide con la predicción.

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
| `src/domain/behavior/alertMeter.ts` | Nuevo. Regla pura del medidor y de los estados. |
| `tests/behavior/alertMeter.test.ts` | Nuevo, 7 pruebas. |
| `src/domain/telemetry/telemetry.ts`, `tests/telemetry/telemetry.test.ts` | Nuevos. Evento estructurado (tiempo, estado anterior, evento, estado nuevo, causa), 2 pruebas. Lo usan los cinco upgrades. |
| `src/game/scenes/GameScene.ts` | Barra, etiqueta, borde por estado, línea de HUD y registro de cambios de nivel. |

No se modificaron `perception.ts` ni la FSM del parcial.

## Matriz criterio–evidencia

| ID | Criterio | Comprobación | Resultado |
|---|---|---|---|
| C1 | Sube 60 por segundo con visión. | `alertMeter.test.ts` › rises 60 points per second… Telemetría: 36→100 en 1067 ms (t=61169 a t=62236). | Aprobado |
| C2 | Baja 20 por segundo sin visión. | `alertMeter.test.ts` › decays 20 points per second… Telemetría: de 58 a 33 en 1250 ms (t=75786 a t=77036). | Aprobado |
| C3 | Nunca sale de 0–100. | `alertMeter.test.ts` › never leaves the 0-100 range… | Aprobado |
| C4 | Umbrales 35 y 100, histéresis hasta bajar de 60. | `alertMeter.test.ts` › moves through calm, suspicious and alert… / holds the alert level… Telemetría: `ALERTA -> SOSPECHA` con medidor 58 y 60. | Aprobado |
| C5 | `deltaMs` inválido produce error. | `alertMeter.test.ts` › rejects an invalid delta | Aprobado |
| C6 | Barra, estado y borde cambian en pantalla. | Capturas `02-estado-alerta.jpg`, `02-estado-sospecha.jpg`, `02-estado-tranquilo-tras-escape.jpg`. | Aprobado |
| C7 | Validación completa. | `npm run validate`, salida de arriba. | Aprobado |

## Evidencia visual y telemetría

La comprobación visual se hizo sobre `npm run dev` en la computadora del estudiante (http://localhost:5173/), el 6/10/2026 entre 18:16 y 18:20. La ejecutó el agente desde el navegador integrado de la aplicación: teclas enviadas como eventos de teclado y destino manual con un clic real. El registro completo está en `../capturas/telemetria-sesion.txt`.

Secuencia reproducible:

1. Hacer clic en la celda (6,1): el guardia va hasta ahí y queda mirando al este.
2. Mover al jugador a la derecha por la fila 2 hasta entrar en el cono: la barra sube, pasa a `SOSPECHA` y a `ALERTA`.
3. Volver a la izquierda, detrás del guardia: `ALERTA` se sostiene, luego `SOSPECHA` y `TRANQUILO`.

Caso de vistazo breve (t=40602 a t=44652): el guardia vio al jugador al pasar, llegó a `SOSPECHA` sin alcanzar 100 y volvió a `TRANQUILO` sin disparar alerta.

## Limitaciones

- El estado `ALERTA` no cambia la conducta del guardia (fuera de alcance).
- El sonido no suma al medidor.
- Con pocos cuadros por segundo el cambio de estado se registra uno o dos puntos pasado el umbral.

## Revisión final y decisión humana

- Decisiones del estudiante: eligió los cinco upgrades (17:50), aprobó la spec y el plan de este upgrade (18:06) y delegó en el agente la implementación y la comprobación visual (18:06).
- Revisión de alcance: los archivos modificados coinciden con los previstos en el plan, más el módulo de telemetría agregado para producir evidencia.
- Recomendación del agente: integrar.
- Decisión del estudiante: integrar. Confirmada a las 18:25, después de ver el juego en ejecución.
