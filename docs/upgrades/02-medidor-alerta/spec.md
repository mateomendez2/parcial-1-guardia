# Spec — Upgrade 8: Medidor de alerta y estados del nivel

- Catálogo: upgrade N.º 8.
- Versión base: `main`, commit `629e25b`, más el upgrade 1 de esta entrega.
- Estado: APROBADA por el estudiante el 6/10/2026, 18:06, sin cambios sobre el borrador.

## Problema

Ser visto por el guardia no tiene consecuencia visible: el HUD dice `vision VISIBLE` y nada más. Quien juega no sabe cuánto riesgo acumuló ni cuánto margen le queda.

## Intención de diseño

Que el peligro se sienta gradual: un instante a la vista no es lo mismo que quedarse parado frente al guardia.

## Objetivo

Un medidor de 0 a 100 que sube mientras el guardia ve al jugador y baja cuando lo pierde, con tres estados del nivel: `TRANQUILO`, `SOSPECHA` y `ALERTA`.

## Alcance

- Regla en dominio puro: sube 60 puntos por segundo con visión, baja 20 por segundo sin visión, siempre entre 0 y 100.
- Estados: `TRANQUILO` por debajo de 35; `SOSPECHA` desde 35; `ALERTA` al llegar a 100.
- Histéresis: una vez en `ALERTA`, se mantiene hasta que el medidor baja de 60.
- Barra en pantalla con color por estado y una línea de HUD con valor y estado.
- Borde del escenario teñido según el estado del nivel.
- Evento de telemetría estructurado (consola y `window.__telemetria`) en cada cambio de estado.

## Fuera de alcance

- Que el guardia cambie de conducta según el medidor (persecución, H4).
- Fin de partida, puntaje o reinicio automático.
- Cambios en la regla de visión o de sonido. El sonido no suma al medidor.

## Restricciones

- `src/domain/` no importa Phaser. El tiempo llega como dato (`deltaMs`).
- Sin dependencias nuevas. Se conservan H3 y el upgrade 1.

## Caso normal

El jugador entra en el cono: el medidor sube, pasa a `SOSPECHA` cerca de los 0,6 s y a `ALERTA` cerca de 1,7 s. Al salir de la vista, baja; `ALERTA` se sostiene 2 s (de 100 a 60) y luego vuelve a `SOSPECHA` y a `TRANQUILO`.

## Casos límite

1. **Salto temporal.** Un `deltaMs` enorme no supera 100 ni baja de 0.
2. **Entrar y salir rápido.** En el borde de 100, perder la visión no hace parpadear el estado: sigue en `ALERTA` hasta bajar de 60.
3. **Entrada inválida.** `deltaMs` negativo o no finito produce un error explícito.

## Criterios de aceptación y evidencia prevista

| ID | Criterio | Evidencia prevista |
|---|---|---|
| C1 | Con visión, el medidor sube 60 por segundo. | Prueba automatizada en `tests/behavior/alertMeter.test.ts`. |
| C2 | Sin visión, baja 20 por segundo. | Prueba automatizada. |
| C3 | El valor nunca sale de 0–100, aun con saltos temporales. | Prueba automatizada. |
| C4 | Umbrales 35 y 100, e histéresis de `ALERTA` hasta bajar de 60. | Prueba automatizada. |
| C5 | `deltaMs` inválido produce error. | Prueba automatizada. |
| C6 | La barra, el estado y el borde cambian en pantalla al ser visto y al escapar. | Secuencia manual con capturas de los tres estados. |
| C7 | Validación completa y pruebas anteriores sin cambios. | `npm run validate` con código de salida 0. |
