# GDD — Guardia de Sigilo (TP final integrador)

- Integrantes: Mateo Méndez y Natasha Pistarelli.
- Repositorio público: https://github.com/mateomendez2/parcial-1-guardia
- Base: continuamos el laboratorio Guardia de Sigilo trabajado en clase (Phaser + TypeScript).

## Idea y objetivo
Juego de sigilo 2D visto desde arriba, en una cuadrícula de 30x20. El jugador tiene que cruzar el nivel desde la entrada hasta la salida sin que el guardia lo atrape. Gana si llega a la salida; pierde si el guardia lo alcanza. Cada partida puede usar un escenario generado distinto.

## Controles
| Tecla | Acción |
|---|---|
| WASD / flechas | Mover al jugador |
| E | Lanzar un distractor sonoro (recarga de 3 s) |
| Q | Hacer ruido en la posición del jugador |
| B | Cambiar algoritmo de búsqueda: BFS / A* |
| N | Cambiar navegación: ruta corta / ruta segura |
| G | Generar otro escenario |
| R | Reiniciar el mismo escenario |

El HUD muestra el algoritmo, la navegación, el estado del guardia, el medidor de alerta y la semilla del escenario.

## NPC: el guardia
**Percepción**
- Visión: cono de 90° y 220 px; las paredes la bloquean.
- Oído: oye sonidos dentro de un radio de 190 px.
- Memoria: recuerda la última posición conocida del jugador. La visión tiene prioridad sobre el sonido.

**Objetivos y comportamiento (FSM)**
| Estado | Qué hace | Pasa a… |
|---|---|---|
| Patrulla | Recorre puntos de patrulla, con pausas, mirando hacia el próximo tramo | Persecución si ve al jugador; Investigar si oye un sonido |
| Persecución | Calcula ruta hacia el jugador y la sigue | Investigar si lo pierde de vista |
| Investigar | Va a la última posición conocida (o al sonido) y mira 3 s | Persecución si lo ve; Volver si no encuentra nada |
| Volver | Regresa al punto de patrulla más cercano | Patrulla al llegar; Persecución si lo ve |

Si el guardia llega a la celda del jugador, lo atrapa y la partida termina. El medidor de alerta (tranquilo / sospecha / alerta) muestra el nivel de peligro.

## Búsqueda (2 algoritmos)
- **BFS:** encuentra la ruta con menos pasos; supone que todos los pasos cuestan lo mismo, así que no puede tener en cuenta zonas más caras.
- **A\*** con distancia Manhattan: encuentra la ruta de menor costo y explora menos casilleros que BFS. Acepta costos por celda (ya probado con terreno lento).

Se cambian con la tecla B y se ven en pantalla: ruta calculada y casilleros explorados.

## Navegación (2 alternativas)
- **Ruta corta:** todas las celdas libres cuestan 1. El guardia toma el camino más directo.
- **Ruta segura:** el mapa tiene zonas de riesgo (charcos de aceite). El guardia prefiere evitarlas:
  - con A*, entrar en una zona de riesgo cuesta 5 en lugar de 1 (penalización): la cruza sólo si el rodeo es demasiado largo;
  - con BFS, que no maneja costos, las zonas de riesgo se tratan como prohibidas; si no queda camino sin pisarlas, usa la ruta corta y lo indica en el HUD.

Se cambian con la tecla N. Afecta la patrulla, la persecución y la investigación. En algunos mapas ambas rutas pueden coincidir si no hay zonas de riesgo en el camino.

## Escenarios variables
Con la tecla G se genera un escenario nuevo a partir de una semilla:
- **Qué varía:** 6 a 10 tramos de pared en posiciones al azar, 2 a 4 zonas de riesgo, la posición de la salida, el inicio del guardia y sus 4 puntos de patrulla.
- **Qué se mantiene:** bordes cerrados y entrada del jugador en el lado izquierdo.

**Reglas de validez.** Si alguna falla, se descarta y se genera otro (hasta 50 intentos; si no, se usa el mapa fijo actual):
- jugador, guardia, salida y puntos de patrulla sobre celdas libres;
- existe un camino del jugador a la salida, comprobado con BFS;
- todos los puntos de patrulla se alcanzan desde el inicio del guardia;
- el guardia empieza lejos del jugador (al menos 10 celdas).

**Patrulla adaptable.** Los puntos de patrulla se eligen en cada escenario y las rutas entre ellos se recalculan con el algoritmo y la navegación seleccionados; no hay trayectorias fijas.

## Alcance del prototipo
**Incluye:** un guardia, un nivel por partida, gráficos geométricos simples, las 2 búsquedas, las 2 navegaciones, la FSM de 4 estados y la generación de escenarios.

**Ya existe en el repositorio:** BFS y A*, A* con costos por celda, seguimiento de rutas, visión, oído y memoria, patrulla con pausas, medidor de alerta, cono de visión, distractor y la FSM del parcial (todavía sin conectar a la escena).

**Queda afuera:** varios guardias, combate, animaciones, sonido real, menús, editor de niveles, guardado y modelos de lenguaje dentro del juego.

## Desarrollo
Flujo GDD → specs → implementación con un asistente agéntico, revisando cada plan antes de aplicarlo. Specs previstas: generación de escenarios, ruta segura, FSM del guardia y captura/victoria.
