# Especificación: Memoria del guardia de sigilo

## Criterios de Aceptación y Evidencia

1. **Criterio:** Si el guardia no tiene nueva percepción (no ve al jugador), pasa a patrulla a los 3000 ms.
   - **Evidencia prevista:** Prueba con reloj controlado.

2. **Criterio:** Si recupera visión antes de los 3000 ms, vuelve a persecución.
   - **Evidencia prevista:** Prueba de transición.

3. **Criterio:** Un salto temporal grande no deja un estado inválido.
   - **Evidencia prevista:** Prueba de caso límite.

4. **Criterio:** No cambia navegación ni representación visual.
   - **Evidencia prevista:** Diferencia de Git (revisar que esos archivos no se hayan modificado).
