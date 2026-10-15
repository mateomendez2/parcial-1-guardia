# Plan — práctica de navegación
Estado: Aprobado (14/10/2026, 23:30)
Variante: A
Spec: spec.md

| Incremento | Trabajo | Archivos reales | Criterios | Comprobación |
|---|---|---|---|---|
| 1 | Costo de entrada opcional en A* (`entryCost`, mínimo 1, Manhattan intacta), `totalCost` con el costo acumulado; utilidades `terrainEntryCost` y `routeCost`; pruebas de franja y restauración | `src/domain/navigation/search.ts`, `src/domain/navigation/terrainCost.ts`, `tests/navigation/practicaNavegacion.test.ts` | A-AC1, A-AC2 | `npx vitest run tests/navigation/practicaNavegacion.test.ts` |
| 2 | Pasar `entryCost` por el consumidor existente `calculateRoute` y probar modo ponderado y unitario | `src/application/simulation/navigationDemo.ts`, `tests/navigation/practicaNavegacion.test.ts` | A-AC3, BASE-AC5 | `npx vitest run tests/navigation/practicaNavegacion.test.ts` |
| 3 | Validación final, diff y cierre de evidencia | `docs/practica-navegacion/*.md` | BASE-AC1 a BASE-AC6 | `npm run validate` |

Referencia previa: comparación y casos comunes BASE-01 a BASE-04 completados.
Riesgos: que `totalCost` siga contando pasos aunque la prioridad use costos; que el cambio altere el resultado unitario que usan la escena y la patrulla.
Detenerse si: faltan permisos, hay cambios ajenos, conflicto de contrato,
regresión nueva o se requiere dependencia/UI/refactorización fuera del alcance.
No crear commits ni publicar automáticamente.
