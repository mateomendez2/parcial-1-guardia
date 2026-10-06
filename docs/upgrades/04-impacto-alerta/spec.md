# Spec — Upgrade 4: Impacto visual extremo de alerta

- Catálogo: upgrade N.º 4.
- Versión base: `main`, commit `629e25b`, más los upgrades 1, 8 y 2 de esta entrega.
- Estado: APROBADA por el estudiante el 6/10/2026, 18:06, sin cambios sobre el borrador.

## Problema

Pasar a `ALERTA` es el momento más importante del sigilo y hoy sólo cambia un color. No hay un golpe que lo marque.

## Intención de diseño

Que ser descubierto resulte inconfundible y se sienta como un golpe, sin quitarle el control a quien juega.

## Objetivo

Al entrar en `ALERTA`, la cámara tiembla, hay un destello rojo y aparece un signo `!` sobre el guardia. Ocurre una sola vez por entrada y todo vuelve a la normalidad en menos de un segundo.

## Alcance

- Regla en dominio puro: el impacto se dispara sólo en la transición hacia `ALERTA`.
- Temblor de cámara de 300 ms, destello de 200 ms y signo `!` durante 800 ms.
- Telemetría en el HUD: contador de impactos y estado de la cámara (`ESTABLE` o `SACUDIDA`).
- Evento de telemetría estructurado en cada impacto.

## Fuera de alcance

- Cambios en la detección, el medidor, la navegación o los controles.
- Sonido, partículas o zoom.
- Pausar o ralentizar el juego.

## Restricciones

- `src/domain/` no importa Phaser. Sin dependencias nuevas.
- El jugador conserva el control durante el efecto.

## Caso normal

El medidor llega a 100: se dispara un único impacto, el contador sube en 1 y, antes de un segundo, la cámara figura `ESTABLE` y en su posición original.

## Casos límite

1. **Permanecer en alerta.** Seguir a la vista no vuelve a disparar el impacto.
2. **Repetición.** Bajar de `ALERTA` y volver a entrar dispara un impacto nuevo.
3. **Reinicio.** `R` durante el efecto deja la cámara estable y el contador en 0.

## Criterios de aceptación y evidencia prevista

| ID | Criterio | Evidencia prevista |
|---|---|---|
| C1 | El impacto se dispara sólo al pasar de otro estado a `ALERTA`. | Prueba automatizada en `tests/behavior/alertImpact.test.ts`. |
| C2 | Permanecer en `ALERTA` no lo repite. | Prueba automatizada. |
| C3 | Salir y volver a entrar lo dispara otra vez. | Prueba automatizada. |
| C4 | La duración total declarada del efecto es menor a 1000 ms. | Prueba automatizada sobre las constantes. |
| C5 | En pantalla: un impacto por entrada, contador +1 y cámara `ESTABLE` al terminar. | Secuencia manual con capturas durante y después del efecto. |
| C6 | Validación completa. | `npm run validate` con código de salida 0. |
