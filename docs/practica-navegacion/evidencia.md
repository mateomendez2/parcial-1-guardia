# Evidencia — práctica de navegación
Repositorio: https://github.com/mateomendez2/parcial-1-guardia
Commit inicial: bb0f2807677e7f7b6f5e29861c01ad9c94f4cef3
Commit de implementación: el commit final informado en la plataforma (contiene código, pruebas y estos tres documentos).
Versión de entrega: commit final informado por el estudiante en la plataforma.
Variante: A
Herramienta/modelo o trabajo manual: Claude (Anthropic), `claude-opus-5-5`.
Cambios previos: los cinco upgrades del 6/10 (commit `bb0f280`): patrulla, medidor de alerta, cono reactivo, impacto y distractor. Ninguno modificaba `search.ts`.
Línea base: `npm run validate` sobre `bb0f280`, 6/10/2026 18:20: 14 archivos de prueba, 94 pruebas aprobadas, build correcto. Sin fallos previos.

## Exploración mínima
| Capa | Ruta/símbolo | Capacidad comprobada |
|---|---|---|
| Búsqueda | `src/domain/navigation/search.ts` › `findPathBfs`, `findPathAStar` | BFS con cola; A* con Manhattan y desempate por menor h y orden de inserción. Antes del cambio, costo fijo 1 por paso. Estados `success`, `unreachable`, `invalid-start`, `invalid-goal`. |
| Seguimiento | `src/domain/navigation/pathFollower.ts` › `advanceAlongPath` | Consume puntos de la ruta; no conoce costos ni algoritmo. |
| Consumidor | `src/application/simulation/navigationDemo.ts` › `calculateRoute` | Elige BFS o A*; lo usan `GameScene` (clic y patrulla) y `planPatrolLeg`. |
| Pruebas | `tests/navigation/search.test.ts`, `tests/navigation/practicaNavegacion.test.ts` | Contrato existente de BFS/A* y pruebas nuevas del fixture y del anexo A. |

Contraste y decisión humana: se comprobó en `search.ts` que `totalCost` era `path.length - 1`, así que un A* ponderado habría informado 6 «pasos» y no el costo. Decisión: no crear un algoritmo nuevo ni tocar BFS; agregar un costo de entrada opcional a A* y al consumidor `calculateRoute`, con valor por defecto 1 para no cambiar la escena. El estudiante eligió la variante A y delegó la implementación por el tiempo disponible.
Spec/plan aprobados: 14/10/2026, 23:30, antes de editar código.

## Comparación común — fixture libre 5x3
Vecinos y desempate reales: cuatro vecinos en orden arriba, derecha, abajo, izquierda (`gridGraph.ts`). BFS toma la frontera en orden FIFO. A* elige menor f = g + h; si empata, menor h; si sigue empatado, el insertado antes.
| Algoritmo | Estado | Ruta | Pasos | Costo | Expandidos | Frontera máxima |
|---|---|---|---:|---:|---|---|
| BFS | success | (0,1) (1,1) (2,1) (3,1) (4,1) | 4 | 4 | 12 | 4 |
| A* | success | (0,1) (1,1) (2,1) (3,1) (4,1) | 4 | 4 | 5 | 9 |

Los valores están fijados como aserciones en `practicaNavegacion.test.ts` › BASE-AC2, así que la validación final los confirma. «Frontera máxima» de A* cuenta nodos descubiertos pendientes, incluidos los que no llegan a expandirse; por eso supera a la de BFS aunque A* expanda menos.

DFS (traza conceptual de la guía, no ejecutada): DFS recorre S, A, C, X, G y encuentra una ruta de 4 pasos porque sigue la primera rama hasta el fondo antes de mirar las demás; BFS encuentra S, B, D, G en 3. Encontrar primero una meta sólo dice que esa rama llegó, no que no exista una más corta en las ramas no exploradas.
Dijkstra (traza conceptual): extraer S=0 → A=1, B=3; extraer A=1 → G=10; extraer B=3 → G mejora a 6; extraer G → ruta S-B-G, costo 6. No hay que terminar al descubrir G por primera vez (10), porque un nodo con menor costo acumulado (B=3) todavía puede mejorarlo; sólo al extraer G su costo es definitivo. Ambas rutas tienen dos acciones: BFS no distingue sus costos.

## Criterio → evidencia
| Criterio | Prueba/archivo y comando o reproducción | Observado | Cumple/pendiente |
|---|---|---|---|
| BASE-AC1 | Esta evidencia: repositorio, commit inicial, capas, cambios previos y línea base | Datos de `bb0f280` y validación del 6/10 | Cumple |
| BASE-AC2 | `practicaNavegacion.test.ts` › BASE-AC2 | BFS y A*: ruta cardinal de 4 pasos, costo 4; métricas de la tabla | Cumple |
| BASE-AC3 | `practicaNavegacion.test.ts` › inicio=meta / barrera x=2 | Inicio=meta: `success`, ruta [S], costo 0. Barrera: `unreachable`, costo `null`. (-1,1): `invalid-start`; (5,1): `invalid-goal` | Cumple |
| BASE-AC4 | `spec.md` y `plan.md` (Aprobados 23:30), contraste y decisión de arriba | Sólo anexo A | Cumple |
| A-AC1 | `practicaNavegacion.test.ts` › A-AC1 | Directa: 4 pasos, costo 16. A* ponderado: (0,1) (0,0) (1,0) (2,0) (3,0) (4,0) (4,1), 6 pasos, `totalCost` 6, sin entrar en la franja; 7 expandidos, frontera 5 | Cumple |
| A-AC2 | `practicaNavegacion.test.ts` › A-AC2 / A-04 | Con la franja en costo 1: 4 pasos, costo 4 | Cumple |
| A-AC3 | `practicaNavegacion.test.ts` › A-AC3 (llama a `calculateRoute`) | Ponderado: 6 pasos, costo 6. Sin `entryCost`: 4 pasos, costo 4 | Cumple |
| BASE-AC5 | `npm run validate` (14/10, 23:35); diff revisado | 15 archivos de prueba, 102 pruebas aprobadas (94 previas sin cambios + 8 nuevas), build correcto | Cumple |
| BASE-AC6 | URL, commit final y estos tres documentos en el mismo commit | Registrado en la plataforma el 14/10 | Cumple al registrar la entrega |

## Registro mínimo de intervención
Prompts: pasos 1 a 8 de la guía con el prompt orientativo del anexo A; sin cambios relevantes.
Decisión tras incremento 1: aceptar. `totalCost` informa el costo acumulado y no la cantidad de pasos; BFS no se tocó.
Decisión tras incremento 2: aceptar. El consumidor sin `entryCost` mantiene el resultado unitario que usan la escena y la patrulla.
Validación final: `npm run validate`, 14/10/2026 23:35 → `tsc --noEmit` sin errores; `vitest run`: Test Files 15 passed (15), Tests 102 passed (102), incluido `tests/navigation/practicaNavegacion.test.ts (8 tests)`; `vite build`: 27 módulos, built in 4.60s.
Diff revisado: `src/domain/navigation/search.ts` (parámetro opcional y costo acumulado), `src/domain/navigation/terrainCost.ts` (nuevo), `src/application/simulation/navigationDemo.ts` (pasa el parámetro), `tests/navigation/practicaNavegacion.test.ts` (nuevo) y los tres documentos. No se tocaron FSM, percepción, controles ni las pruebas existentes.
Conclusión: si todas las celdas cuestan lo mismo, BFS y A* encuentran el mismo camino y A* expande menos nodos. Cuando hay terreno con costos distintos, contar pasos ya no alcanza: BFS sigue eligiendo la ruta directa de costo 16. A* con costos de entrada y Manhattan (admisible porque el costo mínimo es 1) encuentra el rodeo de costo 6. Para el guardia conviene A* ponderado cuando el diseño quiere expresar preferencias de terreno, y el modo unitario cuando sólo importa llegar.
Limitaciones: el nivel del juego no define terreno lento, así que la escena sigue en modo unitario; la mejora se verifica con pruebas sobre el fixture y el consumidor `calculateRoute`, no con captura. Las trazas DFS y Dijkstra son conceptuales, no ejecuciones del proyecto. Los incrementos se aplicaron seguidos por el tiempo disponible.
