# Spec: generación de escenarios

## Objetivo
Generar con la tecla G un escenario distinto a partir de una semilla, siempre válido y jugable, para comprobar que búsqueda, navegación y patrulla se adaptan a mapas que no fueron preparados a mano.

## Comportamiento esperado
- Cuadrícula de 30x20 con bordes cerrados.
- Varía: entre 6 y 10 tramos de pared (horizontales o verticales, de 3 a 8 celdas), entre 2 y 4 zonas de riesgo rectangulares, la salida (columna 27), el inicio del guardia y sus 4 puntos de patrulla.
- Se mantiene: el jugador empieza en la columna 2.
- La misma semilla genera siempre el mismo escenario (R reinicia el mismo; G pide otra semilla).
- El HUD muestra la semilla.

## Reglas de validez
1. Jugador, salida, guardia y puntos de patrulla sobre celdas libres.
2. Existe camino del jugador a la salida (comprobado con BFS).
3. Los 4 puntos de patrulla se alcanzan desde el inicio del guardia.
4. El guardia empieza a 10 celdas o más (Manhattan) del jugador.
Si una regla falla, se descarta el intento y se genera otro con la misma semilla base; tras 50 intentos se usa el mapa fijo del laboratorio.

## Fuera de alcance
Editor de niveles, varios guardias, decoración o arte.

## Cómo comprobarlo
- Prueba: 200 semillas generan escenarios que cumplen las 4 reglas.
- Prueba: la misma semilla da el mismo escenario.
- Prueba: el validador detecta un mapa sin camino a la salida.
- Jugando: G cambia paredes, zonas y patrulla; las rutas se recalculan.
