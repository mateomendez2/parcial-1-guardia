# Spec — Upgrade 1: Patrulla con pausas y mirada direccional

- Catálogo: upgrade N.º 1.
- Versión base: rama `main`, commit `629e25b`.
- Estado: REVISADA y aprobada por el estudiante el 6/10/2026, 17:58.

## Problema

El guardia sólo se mueve cuando una persona hace clic en un destino (H3). Quieto, no comunica ritmo ni intención: quien juega no puede anticipar por dónde va a pasar.

## Intención de diseño

Que el recorrido del guardia se pueda leer y anticipar: se detiene en cada punto y, antes de salir, mira hacia donde va a ir.

## Objetivo

El guardia recorre de forma cíclica cuatro puntos fijos del nivel. Al llegar a cada uno hace una pausa y, durante la segunda mitad de la pausa, gira su mirada (y su cono de visión) hacia el próximo tramo.

## Alcance

- Regla de patrulla en dominio puro: orden cíclico, pausa y dirección de mirada.
- Cuatro puntos de patrulla en el nivel: (27,17) → (27,2) → (12,13) → (2,17) → vuelve al primero.
- Pausa de 1200 ms por punto. Mirada hacia el próximo tramo desde los 600 ms.
- Cálculo de cada tramo con la búsqueda existente (A* o BFS según el selector).
- Conexión con la escena: patrulla activa al iniciar; tecla `P` la activa o suspende.
- Una línea de telemetría en el HUD: punto destino y fase (`EN CAMINO`, `PAUSA`, `SUSPENDIDA`, `BLOQUEADA`).

## Fuera de alcance

- Persecución, investigación o regreso a patrulla (máquina de estados de H4).
- Cambios en la detección, el alcance de visión o el sonido.
- Cambios en los algoritmos de búsqueda o en el seguidor de caminos.
- Sprites, animaciones o recursos externos.

## Restricciones

- `src/domain/` no importa Phaser, DOM ni APIs del navegador.
- El tiempo se recibe como dato; la regla no lee relojes.
- Sin dependencias nuevas.
- Se conserva H3: el clic sigue enviando al guardia a un destino manual.

## Caso normal

El guardia parte de (27,17), llega a (27,2), se detiene 1200 ms, a los 600 ms gira hacia el tramo siguiente y luego sale hacia (12,13). Tras el cuarto punto vuelve al primero.

## Casos límite

1. **Salto temporal.** Una sola actualización con un tiempo muy posterior al inicio de la pausa: el guardia termina la pausa una vez y avanza un único punto; no saltea puntos.
2. **Punto inalcanzable.** Si el próximo punto no tiene ruta, se saltea y se prueba el siguiente; si ninguno es alcanzable, el guardia queda quieto con fase `BLOQUEADA` y no hay error.
3. **Destino manual.** Un clic suspende la patrulla; `P` la retoma hacia el punto que estaba pendiente.

## Criterios de aceptación y evidencia prevista

| ID | Criterio | Evidencia prevista |
|---|---|---|
| C1 | Los puntos se visitan en orden 0→1→2→3→0. | Prueba automatizada en `tests/behavior/patrol.test.ts`. |
| C2 | Al llegar, el guardia no avanza hasta cumplir 1200 ms de pausa. | Prueba automatizada. |
| C3 | Antes de 600 ms mira en la dirección de llegada; desde 600 ms mira hacia el próximo tramo. | Prueba automatizada. |
| C4 | Un salto temporal termina la pausa una sola vez y avanza un único punto. | Prueba automatizada. |
| C5 | Un punto inalcanzable se saltea; si ninguno es alcanzable, fase `BLOQUEADA` sin excepción. | Prueba automatizada en `tests/application/patrolSimulation.test.ts`. |
| C6 | Los cuatro puntos del nivel son transitables y están conectados entre sí. | Prueba automatizada sobre `LAB_MAP`. |
| C7 | El clic suspende la patrulla y `P` la retoma. | Secuencia manual reproducible con captura del HUD. |
| C8 | El dominio no importa Phaser y la validación completa pasa. | `npm run validate` con código de salida 0. |
