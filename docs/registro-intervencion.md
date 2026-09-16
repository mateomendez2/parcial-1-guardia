Archivos modificados
Archivo	Tipo
src/domain/behavior/guardBehavior.ts	Nuevo — máquina de estados del guardia (dominio puro)
tests/behavior/guardBehavior.test.ts	Nuevo — pruebas con reloj controlado
No toqué src/game/, src/application/, ni ningún archivo de Phaser/visual. La implementación quedó aislada en src/domain/ como exige la arquitectura (docs/arquitectura.md:42, contrato "Comportamiento").

Qué hace guardBehavior.ts
Estados: patrolling | pursuing | investigating | returning. decideGuardBehavior(state, { timeMs, playerVisible, memory }) devuelve { state, action }, y la transición clave está en src/domain/behavior/guardBehavior.ts:47-55:

persiguiendo → pierde visión → investigating y fija investigationStartedAtMs = timeMs (inicia el temporizador).
investigando, sin visión → si timeMs - investigationStartedAtMs >= SEARCH_TIMEOUT_MS (constante 3000) → returning (regresar a patrullar).
investigando/regresando + visión recuperada antes del límite → pursuing y se limpia el temporizador.
Incluye validaciones: tiempo no finito lanza error; investigar sin lastKnownPosition lanza error (invariante RF, sin fallos silenciosos).

Cómo cumple los criterios de docs/especificacion.md
3000 ms sin percepción → patrulla: testeado en el límite exacto (2999 ms sigue investigando, 3000 ms pasa a returning).
Recupera visión antes de 3000 ms → persigue: testeado a los 1500 ms y también desde returning.
Salto temporal grande → estado válido: testeado (t=10.000.000 ms → returning consistente).
Sin cambios en navegación ni visual: no se modificó ningún archivo de src/game/, src/application/ ni del módulo navigation.
Los 12 tests nuevos cubren: patrulla inicial y sin percepción, transición a persecución, inicio de investigación en el instante exacto de pérdida, frontera del timeout, recuperación de visión, casos límite (salto temporal, tiempos no finitos, sin memoria).
