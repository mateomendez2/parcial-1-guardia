# GDD: Guardia de Sigilo

## Experiencia de juego
El jugador debe infiltrarse evitando ser detectado. El guardia debe comportarse de forma lógica, reaccionando a estímulos (visión y sonido) sin ser omnisciente.

## Problema actual
Al perder de vista al jugador, el guardia lo persigue indefinidamente y rompe la mecánica de sigilo.

## Comportamiento esperado (Objetivo)
El guardia debe investigar la última posición conocida del jugador. Si no recupera la percepción (visión) durante un tiempo determinado, debe abandonar la búsqueda y regresar a su ruta de patrulla original.

## Reglas y Restricciones
- La visión tiene prioridad sobre el sonido.
- Una pérdida de visión no borra la última posición conocida.
- El dominio no puede importar Phaser, DOM ni APIs del navegador.
- Decisiones, búsqueda, seguimiento y locomoción deben ser capas separadas.

## Fuera de alcance
No se modificarán: navegación, cono visual, animaciones, dificultad, ni sistema de sonido.

## Caso Límite
¿Qué sucede si ocurre un salto temporal grande mientras el guardia está buscando, o si recupera la visión en el último milisegundo antes de volver a patrullar? El estado no debe quedar inválido.
