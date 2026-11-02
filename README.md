# Guardia de Sigilo — TP final integrador (PIAPC 2026)

**Integrantes:** Mateo Méndez y Natasha Pistarelli.

Juego de sigilo 2D visto desde arriba. El jugador cruza el nivel hasta la **salida** sin que el guardia lo atrape. El guardia es un NPC con visión, oído y memoria, que decide con una máquina de estados (patrulla, persecución, investigar, volver). Cada escenario se genera a partir de una semilla y siempre es jugable.

## Cómo ejecutarlo

Requiere Node.js 22 o superior.

```bash
npm ci
npm run dev        # abre el juego en http://localhost:5173
npm run validate   # tipos, pruebas y compilación
```

## Controles

| Tecla | Acción |
|---|---|
| WASD / flechas | Mover al jugador |
| B | Cambiar algoritmo de búsqueda: A* / BFS |
| N | Cambiar navegación: ruta corta / ruta segura |
| G | Generar otro escenario |
| R | Reiniciar el mismo escenario |
| E | Lanzar un distractor sonoro (recarga de 3 s) |
| Q | Hacer ruido en la posición del jugador |

El HUD (arriba a la derecha) muestra la semilla del escenario, la navegación, el algoritmo con costo y nodos expandidos, el estado de la máquina de estados, la patrulla y la percepción. La ruta calculada se dibuja en celeste y los casilleros explorados en azul.

## Qué implementa

- **Búsqueda:** BFS y A* con distancia Manhattan (`src/domain/navigation/search.ts`).
- **Navegación:** ruta corta (todas las celdas cuestan 1) y ruta segura, que evita las zonas de riesgo (marrones). Con A* esas zonas cuestan 5; con BFS, que no maneja costos, se prohíben y, si no queda camino, se usa la ruta corta (`src/application/simulation/navigationMode.ts`).
- **Escenarios variables:** paredes, zonas de riesgo, salida, guardia y puntos de patrulla al azar con reglas de validez comprobadas con BFS (`src/domain/level/levelGenerator.ts`). La patrulla recalcula sus rutas en cada escenario.
- **Comportamiento:** FSM del guardia (`src/domain/behavior/guardBehavior.ts`) conectada a la escena, más investigación de sonidos y distractores.
- **Ganar y perder:** `src/domain/behavior/gameOutcome.ts`.

## Documentación

- GDD: [`docs/tp-final/GDD.md`](docs/tp-final/GDD.md)
- Specs: [`specs/tp-final/`](specs/tp-final/)
- Presentación: [`docs/tp-final/presentacion`](docs/tp-final/) (para la clase del 4/11)
- Trabajos anteriores: [`docs/upgrades/`](docs/upgrades/) y [`docs/practica-navegacion/`](docs/practica-navegacion/)

## Arquitectura

`src/domain/` es TypeScript puro (no importa Phaser); `src/application/` coordina casos de uso; `src/game/` adapta Phaser y dibuja. Las pruebas están en `tests/`.
