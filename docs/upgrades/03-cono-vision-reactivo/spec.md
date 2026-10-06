# Spec — Upgrade 2: Cono de visión visible y reactivo

- Catálogo: upgrade N.º 2.
- Versión base: `main`, commit `629e25b`, más los upgrades 1 y 8 de esta entrega.
- Estado: APROBADA por el estudiante el 6/10/2026, 18:06, sin cambios sobre el borrador.

## Problema

El cono actual se dibuja como un sector completo que atraviesa las paredes: muestra zonas donde el guardia en realidad no ve. Además casi no cambia cuando la amenaza crece.

## Intención de diseño

Que quien juega pueda confiar en el cono: lo que está pintado es lo que el guardia ve, y su color dice cuánta amenaza hay.

## Objetivo

El cono se recorta contra las paredes y cambia de color según el estado del nivel.

## Alcance

- Función de dominio que calcula el contorno del cono lanzando rayos desde el guardia hasta la primera pared o hasta el alcance.
- Color por estado del nivel (upgrade 8): azul en `TRANQUILO`, amarillo en `SOSPECHA`, rojo en `ALERTA`.
- Más opaco y con borde marcado mientras el jugador es visible en ese instante.

## Fuera de alcance

- Cambiar alcance, ángulo o la regla que decide si el jugador es visible.
- Sombras suaves, iluminación o texturas.

## Restricciones

- `src/domain/` no importa Phaser. Sin dependencias nuevas.
- La regla de detección `evaluateVision` no se modifica: el cono es sólo representación.

## Caso normal

En un pasillo abierto el cono llega al alcance completo. Frente a una pared, el cono termina en la pared y no pinta del otro lado.

## Casos límite

1. **Guardia pegado a una pared.** Los rayos hacia la pared tienen longitud casi nula y no hay error.
2. **Dirección inválida** (vector cero): el contorno queda vacío y no se dibuja cono.
3. **Límite de representación.** El recorte usa muestreo por pasos; puede diferir de la detección en las esquinas por menos de una celda. Se declara como limitación.

## Criterios de aceptación y evidencia prevista

| ID | Criterio | Evidencia prevista |
|---|---|---|
| C1 | Sin paredes, todos los rayos llegan al alcance. | Prueba automatizada en `tests/perception/visionCone.test.ts`. |
| C2 | Con una pared delante, los rayos terminan antes de la pared. | Prueba automatizada. |
| C3 | Los rayos cubren exactamente el ángulo de visión, centrado en la dirección de mirada. | Prueba automatizada. |
| C4 | Dirección inválida produce contorno vacío; configuración inválida produce error. | Prueba automatizada. |
| C5 | El color del cono corresponde al estado del nivel. | Secuencia manual con capturas en los tres estados. |
| C6 | En pantalla el cono no atraviesa paredes. | Captura con el guardia frente a una pared. |
| C7 | Validación completa. | `npm run validate` con código de salida 0. |
