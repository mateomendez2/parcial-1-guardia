# Spec — Upgrade 7: Distractores sonoros interactivos

- Catálogo: upgrade N.º 7.
- Versión base: `main`, commit `629e25b`, más los upgrades 1, 8, 2 y 4 de esta entrega.
- Estado: APROBADA por el estudiante el 6/10/2026, 18:06, sin cambios sobre el borrador.

## Problema

El único sonido disponible (`Q`) sale desde el jugador y el guardia no reacciona: no hay forma de usar el ruido a favor.

## Intención de diseño

Darle a quien juega una herramienta para planificar: hacer ruido en otro lado para mover al guardia y abrirse paso.

## Objetivo

El jugador lanza un distractor que suena donde cae. Si el guardia lo oye, deja la patrulla, va hasta ese punto, mira un momento y vuelve a patrullar.

## Alcance

- Tecla `E`: lanza un distractor en la última dirección de movimiento del jugador; cae hasta 5 celdas adelante o en la última celda libre antes de una pared.
- Recarga de 3 s entre lanzamientos, visible en el HUD.
- El sonido usa el radio y la duración existentes, con origen en el punto de caída.
- Si el guardia oye un sonido (de `E` o de `Q`), va a su origen, mira 1,5 s y retoma la patrulla en el punto pendiente.
- HUD: `distractor LISTO` o `RECARGA n s`, y `guardia INVESTIGA` o `MIRA`.
- Eventos de telemetría estructurados al lanzar, al oír, al llegar y al terminar de mirar.

## Fuera de alcance

- Persecución por visión y prioridad visión/sonido de la FSM (H4).
- Que el distractor sume al medidor de alerta.
- Audio real, inventario o cantidad limitada de distractores.

## Restricciones

- `src/domain/` no importa Phaser. Sin dependencias nuevas.
- El guardia sólo conoce el origen del sonido, nunca la posición del jugador.
- `Q` conserva su comportamiento de H3 (sonido desde el jugador).

## Caso normal

El jugador, a menos de 190 px del guardia en línea recta hasta el punto de caída, aprieta `E`. El guardia interrumpe la patrulla, llega al punto, mira 1,5 s y vuelve a su recorrido.

## Casos límite

1. **Pared pegada.** Si la primera celda en esa dirección es pared, el distractor cae en la celda del jugador.
2. **Recarga.** Apretar `E` antes de los 3 s no lanza nada.
3. **Fuera de alcance.** Si el guardia está a más de 190 px del punto de caída, no reacciona.
4. **Origen inalcanzable.** Si no hay ruta hasta el sonido, el guardia sigue patrullando.

## Criterios de aceptación y evidencia prevista

| ID | Criterio | Evidencia prevista |
|---|---|---|
| C1 | El punto de caída es la celda libre más lejana, hasta 5, en la dirección dada. | Prueba automatizada en `tests/behavior/distraction.test.ts`. |
| C2 | Con pared pegada, cae en la celda de origen. | Prueba automatizada. |
| C3 | La recarga impide lanzar antes de 3000 ms. | Prueba automatizada. |
| C4 | La investigación pasa de ir a mirar al llegar y termina a los 1500 ms. | Prueba automatizada. |
| C5 | En pantalla: el guardia oye, va, mira y vuelve a patrullar. | Secuencia manual con capturas. |
| C6 | En pantalla: fuera de alcance, el guardia no reacciona. | Secuencia manual con captura del HUD (`sonido FUERA DE RANGO`). |
| C7 | Validación completa. | `npm run validate` con código de salida 0. |
