Evidencia encontrada (hechos comprobados en código)
Estado documental

docs/hitos.md:14-20: H0–H3 Completados, H4 (máquina de estados) Pendiente. README.md:16 confirma: la máquina de estados se incorpora en H4.
Percepción y memoria (ya existe)

src/domain/perception/memory.ts: PerceptionMemory guarda lastKnownPosition, lastPerceivedAtMs, source. rememberObservation prioriza visión ante evento simultáneo (líneas 33-45). timeSinceLastPerception devuelve Math.max(0, currentTimeMs - lastPerceivedAtMs) o null sin memoria (líneas 54-63).
src/domain/perception/perception.ts: evaluateVision (rango, cono, oclusión) y evaluateSound (radio + duración).
src/application/simulation/perceptionSimulation.ts: updatePerceptionSimulation combina sonido y visión; expira el sonido tras emittedAtMs + durationMs (línea 66).
Tests: tests/perception/memory.test.ts, tests/application/perceptionSimulation.test.ts.
Navegación y movimiento (ya existe)

src/domain/navigation/search.ts: findPathBfs y findPathAStar con SearchResult (status, path, totalCost, expandedNodes, maximumFrontier, explored) y fracasos explícitos invalid-start / invalid-goal / unreachable.
src/domain/navigation/pathFollower.ts: advanceAlongPath consume varios waypoints por paso y expone completed (línea 70).
Tests: tests/navigation/search.test.ts, tests/navigation/pathFollower.test.ts.
Escena Phaser (adaptador, sin decisión)

src/game/scenes/GameScene.ts:
El guardia sólo se mueve hacia un destino fijado por clic humano (handlePointerDown, línea 207). La memoria de percepción no alimenta el objetivo de navegación.
updatePerception (línea 283) sólo actualiza memoria y telemetría; timeSinceLastPerception se usa únicamente para el HUD (línea 336).
Marcador rojo de última posición conocida (líneas 328-332).
Constantes: VISION_RANGE=220, FIELD_OF_VIEW=π/2, SOUND_RADIUS=190, SOUND_DURATION_MS=800, GUARD_SPEED=115 (líneas 24-29).
src/application/simulation/labLevel.ts: GUARD_START {27,17}, PLAYER_START {2,2}. No existen puntos de patrulla.
Especificación del objetivo

docs/especificacion.md:5-12 ya define los criterios: abandono a los 3000 ms sin percepción, vuelta a persecución si recupera visión antes, salto temporal grande sin estado inválido, y "no cambia navegación ni representación visual".
Capacidades que no existen (necesarias para el objetivo)
Máquina de estados: no existe src/domain/behavior/ (previsto en docs/arquitectura.md:42), no hay tests/behavior/, y ningún símbolo Patrullar/Investigar/Perseguir/Buscar/Regresar en src/.
Ruta de patrulla original: sin PATROL_POINTS en labLevel.ts, ni lógica cíclica en GameScene.ts.
Conducción autónoma hacia la última posición conocida: la memoria no dispara navegación (docs/h3-percepcion-movimiento.md:60 lo declara explícitamente: "no inicia persecución o investigación").
Timeout de 3000 ms / abandono de búsqueda: no existe ninguna constante ni condición de vencimiento en src/. Los "3000 ms" sólo aparecen en docs/especificacion.md:5.
Recuperación de percepción → transición a persecución: no hay lógica.
Captura del jugador (RF-06/08 del producto): ausente.
Supuestos y preguntas abiertas
¿"Regresar a su ruta de patrulla original" implica crear puntos de patrulla nuevos, o el origen del guardia (GUARD_START) cuenta como patrulla? No hay nada definido hoy.
¿El timeout son 3000 ms sin percepción acumulados (abandono directo a patrulla), o se divide en buscar 3000 ms + regresar? docs/especificacion.md:5 sugiere lo primero.
El tiempo hoy proviene del reloj de Phaser (GameScene.update, tiempo real). El criterio pide "prueba con reloj controlado" (docs/especificacion.md:6), lo que exige inyectar un reloj en el dominio; aún no existe.
¿El objetivo requiere una transición previa a un estado "Investigar" si el guardia ve/u oye? Hoy ver/u oír sólo deja memoria.
docs/especificacion.md no está listado en README.md ni en AGENTS.md; conviene confirmar que es la fuente de aceptación oficial.
La carpeta no es un repo git (criterio 4 de docs/especificacion.md, "Diferencia de Git", no es verificable aquí).
Para tu objetivo, lo que falta es esencialmente H4 completo: módulo de comportamiento, puntos de patrulla, y un reloj inyectado para el vencimiento de 3000 ms. Todo lo demás (percepción, memoria, navegación, seguimiento) ya está y tiene pruebas.
