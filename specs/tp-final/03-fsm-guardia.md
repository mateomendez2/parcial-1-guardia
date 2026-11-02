# Spec: máquina de estados del guardia

## Objetivo
Conectar a la escena la FSM del parcial (`src/domain/behavior/guardBehavior.ts`) para que el guardia patrulle, persiga, investigue y vuelva.

## Comportamiento esperado
- Patrulla: recorre los puntos de patrulla del escenario (upgrade 1).
- Si ve al jugador → Persecución: calcula ruta hasta la celda del jugador con el algoritmo y la navegación elegidos; recalcula sólo cuando el jugador cambia de celda.
- Si lo pierde de vista → Investigar: va a la última posición conocida; al llegar mira 3 s (el temporizador empieza al llegar).
- Si no lo encuentra → Volver: va al punto de patrulla más cercano y retoma la patrulla.
- Desde Patrulla o Volver, un sonido oído inicia la investigación del sonido (upgrade 7). Durante la persecución se ignoran sonidos: la visión tiene prioridad.
- Si no hay ruta posible, el guardia se queda en una celda válida y no atraviesa paredes.
- El HUD y la telemetría muestran cada cambio de estado.

## Fuera de alcance
Coordinación entre varios guardias, combate, animaciones.

## Cómo comprobarlo
- Pruebas existentes de `guardBehavior.test.ts` (transiciones).
- Jugando: sin ser visto, patrulla; al ser visto, persigue; al esconderse, investiga y vuelve.
- No detecta a través de paredes (pruebas de percepción existentes).
