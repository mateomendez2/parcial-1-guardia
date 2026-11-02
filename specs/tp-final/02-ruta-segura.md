# Spec: navegación ruta corta / ruta segura

## Objetivo
Ofrecer dos formas de recorrer el mapa, seleccionables con la tecla N, y mostrar qué algoritmo puede usar costos.

## Comportamiento esperado
- Ruta corta: toda celda libre cuesta 1.
- Ruta segura: las zonas de riesgo son transitables pero el guardia prefiere evitarlas.
  - Con A*: entrar en una zona de riesgo cuesta 5 (resto 1). Manhattan sigue siendo admisible porque el costo mínimo es 1.
  - Con BFS (no maneja costos): las zonas de riesgo se tratan como prohibidas. Si así no hay camino, se usa la ruta corta y el HUD indica "sin ruta segura".
- La navegación elegida se aplica a patrulla, persecución, investigación y regreso.
- El HUD muestra navegación, algoritmo y costo de la ruta actual.

## Fuera de alcance
Exposición dinámica según visión, probabilidades, evasión local.

## Cómo comprobarlo
- Prueba: en un mapa con franja de riesgo, A* seguro devuelve un rodeo de menor costo y ruta corta la cruza.
- Prueba: BFS seguro no pisa celdas de riesgo; si no hay alternativa, cae en ruta corta con aviso.
- Prueba: si inicio o meta están dentro de una zona de riesgo, igual hay ruta.
- Jugando: con N cambia el recorrido de la patrulla cuando hay zonas en el camino.
