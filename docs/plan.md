# Plan de Intervención

## Modificación mínima planificada
1. **Paso 1:** Reproducir el fallo actual (el guardia persigue para siempre).
2. **Paso 2:** Modificar la máquina de estados / comportamiento del guardia para que pase al estado de "investigación" al perder visión.
3. **Paso 3:** Agregar un temporizador de 3000 ms. Si se cumple sin ver al jugador, el guardia vuelve a "patrulla".
4. **Paso 4:** Ejecutar pruebas del dominio para validar recuperación de visión y saltos temporales.

## Archivos previstos a modificar
- Sólo se modificarán archivos dentro de `src/` relacionados al dominio del guardia (ej: la máquina de estados, memoria o percepción).
- NO se tocará nada de representación visual ni librerías externas.

## Condiciones de detención
Se detendrá el uso del agente si:
- Intenta modificar el motor del juego o animaciones.
- Falla una prueba y no logra arreglarla tras un intento.
- Pide instalar dependencias nuevas.
