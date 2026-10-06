# Laboratorio de intervención agéntica completa — cinco upgrades

Entrega del 6/10/2026. Cada carpeta contiene `spec.md`, `plan.md` y `evidencia.md`.

| Carpeta | Upgrade del catálogo |
|---|---|
| `01-patrulla-pausas-mirada/` | N.º 1 — Patrulla con pausas y mirada direccional |
| `02-medidor-alerta/` | N.º 8 — Medidor de alerta y estados del nivel |
| `03-cono-vision-reactivo/` | N.º 2 — Cono de visión visible y reactivo |
| `04-impacto-alerta/` | N.º 4 — Impacto visual extremo de alerta |
| `05-distractor-sonoro/` | N.º 7 — Distractores sonoros interactivos |

- `punto-inicial.md`: versión base, entorno y validación de referencia.
- `capturas/`: capturas del juego y `telemetria-sesion.txt`, el registro de eventos de la comprobación visual.

El orden de las carpetas es el de implementación: el cono y el impacto usan los estados del medidor.

Validación de la versión final: `npm run validate` → 14 archivos de prueba, 94 pruebas, compilación correcta (6/10/2026, 18:20).
