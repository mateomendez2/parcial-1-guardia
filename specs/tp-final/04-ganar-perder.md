# Spec: ganar y perder

## Objetivo
Dar un objetivo al jugador: llegar a la salida sin ser atrapado.

## Comportamiento esperado
- Gana al entrar en la celda de salida.
- Pierde si el centro del guardia queda a menos de 20 px del centro del jugador.
- Al terminar, el juego se congela y muestra el resultado con las opciones R (mismo escenario) y G (otro escenario).

## Fuera de alcance
Puntaje, vidas, menús.

## Cómo comprobarlo
- Prueba: celda de salida → ganó; guardia cerca → atrapado; si ambas ocurren a la vez, gana la captura.
- Jugando: llegar a la salida muestra "GANASTE"; dejarse alcanzar muestra "TE ATRAPARON".
