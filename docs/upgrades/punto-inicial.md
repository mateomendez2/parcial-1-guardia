# Punto inicial común a los cinco upgrades

- Fecha: 6/10/2026, 17:55 (hora de Argentina).
- Repositorio: https://github.com/mateomendez2/parcial-1-guardia
- Rama y commit base: `main`, `629e25b438452e1ff1564e6b834503fab2fad06b`.
- Estado de Git al iniciar: sin cambios pendientes sobre el commit base.
- Entorno: Windows 10.0.26200, Node.js v22.16.0, npm con `npm ci` sobre `package-lock.json`.
- Herramienta y modelo: Claude (Anthropic), modelo configurado `claude-opus-5-5`.

## Validación de referencia

Comando: `npm run validate` (tipos, pruebas y compilación). Resultado: terminó sin errores.

```text
> tsc --noEmit

 RUN  v4.1.10

 ✓ tests/model/grid.test.ts (5 tests)
 ✓ tests/perception/memory.test.ts (5 tests)
 ✓ tests/application/perceptionSimulation.test.ts (2 tests)
 ✓ tests/navigation/pathFollower.test.ts (6 tests)
 ✓ tests/behavior/guardBehavior.test.ts (12 tests)
 ✓ tests/perception/perception.test.ts (12 tests)
 ✓ tests/navigation/search.test.ts (9 tests)

 Test Files  7 passed (7)
      Tests  51 passed (51)

vite v6.4.3 building for production...
✓ 20 modules transformed.
✓ built in 4.21s
```

Aviso no bloqueante de Vite: el paquete generado supera 500 kB (incluye Phaser).

## Cambios preexistentes que se conservan

- Hitos H0 a H3 del laboratorio.
- Máquina de estados del parcial en `src/domain/behavior/guardBehavior.ts` con sus 12 pruebas. No está conectada a la escena.
