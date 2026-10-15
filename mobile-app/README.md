# São Paulo · Un buen plan

Versión alternativa de la guía, diseñada como una web app móvil. La versión original no se modifica. Esta carpeta es autónoma: incluye contenido y fotografías con sus créditos.

## Abrir

Abre `index.html` directamente o inicia un servidor desde esta carpeta:

```sh
python3 -m http.server 4182 --bind 127.0.0.1
```

La navegación, la búsqueda y los guardados funcionan sin dependencias externas. La geolocalización requiere localhost o HTTPS y permiso del navegador. Los guardados permanecen en el navegador; no se sincronizan entre dispositivos.

## Experiencia

- Inicio de estilo app con hero por ubicación, recomendaciones y lugares cercanos.
- Navegación inferior en teléfono; lateral en escritorio.
- 93 lugares con búsqueda sin distinción de acentos, categorías, barrio y estilo.
- Fichas con reserva, precio, dirección, fotos, créditos y enlace a Google Maps.
- Favoritos locales y selección aleatoria.
- Distancias en línea recta desde una referencia aproximada de Vila Buarque, o desde la ubicación autorizada por el usuario.
- Consejos del directorio original, sin nueva verificación editorial de su contenido.
- Estados vacíos, control por teclado, foco visible y respeto por movimiento reducido.

## Actualizar contenido

Desde la carpeta superior, `python3 mobile-app/prepare.py` vuelve a combinar `places.json`, `tips.json` y los archivos `photos_*.json`; copia solo imágenes existentes y genera `data.js`. No altera los archivos originales. No hace falta ejecutarlo para abrir la versión entregada.

## Distribuir

Publica el contenido completo de esta carpeta como sitio estático. El proceso de construcción de la guía original no incluye esta versión alternativa.

## Instalar en iPhone

1. Publica esta carpeta en una URL HTTPS (puede estar en la raíz o en una subcarpeta).
2. Abre esa URL en Safari en el iPhone.
3. Toca Compartir → Añadir a pantalla de inicio.
4. Activa «Abrir como app web» si aparece y toca Añadir.

Incluye manifiesto, iconos PNG para iOS, modo standalone y márgenes seguros. No requiere framework, backend ni App Store. La instalación real debe comprobarse en un iPhone; las pruebas locales no sustituyen esa comprobación.

## Uso sin conexión y actualizaciones

El service worker descarga la interfaz y los 93 lugares durante la primera visita con conexión. Deja terminar esa carga antes de salir. Las fotos se guardan al consultarlas una vez que el service worker controla la página; no se descargan todas de antemano. Las fotos no guardadas muestran un aviso al estar offline. Google Maps y los sitios externos requieren conexión. iOS puede eliminar los datos locales cuando necesita espacio; esto no constituye una copia de seguridad de los favoritos.

Después de editar HTML, CSS, JavaScript o iconos, ejecuta `python3 mobile-app/build_offline.py` desde la carpeta superior y publica todos los archivos juntos. `prepare.py` lo ejecuta automáticamente al actualizar contenido. Una nueva versión se descarga con conexión y se activa después de cerrar las ventanas de la versión anterior. El trabajador solo administra cachés de esta app y no intercepta enlaces externos.

Comprobaciones locales: `node mobile-app/verify-offline.mjs`. Verifica navegación y datos offline, fotos guardadas, fallback de imágenes, aislamiento de cachés y manifiesto. Para probar la instalación en un iPhone se necesita la URL HTTPS; abrir un archivo local o una dirección HTTP de la red no basta para el service worker.

## Hero por ubicación

`location.js` mantiene una selección editorial de imperdibles del directorio. El hero elige el más próximo de esa selección por distancia en línea recta, excluyendo fichas marcadas como no confirmadas. La selección no verifica apertura en tiempo real: el hero invita a consultar horarios y reserva.

- Primera visita: solicita automáticamente la ubicación al abrir la app, sin bloquear la guía. El usuario debe aceptar el aviso nativo de iOS. El botón queda disponible para reintentar o actualizar.
- Permiso previamente concedido: intenta actualizar automáticamente al abrir y al volver a la app tras cinco minutos. Sin soporte de Permissions API, también solicita automáticamente la ubicación al abrir. Si la solicitud falla o se rechaza, no repite automáticamente el aviso durante esa sesión; permite reintentar con el botón.
- Coordenadas conservadas solo en memoria, sin enviarlas a servidores ni guardarlas en almacenamiento local. No usa seguimiento continuo ni geocodificación externa.
- Sin permiso: usa Vila Buarque y lo indica. Un error al actualizar conserva y señala la última ubicación de la sesión.
- A más de 30 km de la referencia de São Paulo: muestra una sugerencia para el viaje, sin llamarla cercana. «Cerca de ti» requiere un imperdible a 3 km o menos y precisión de ubicación de 1,5 km o mejor.
- Los lugares sin fotografía utilizan una composición gráfica, sin inventar fotos del lugar.

Pruebas: `node mobile-app/verify-location.mjs` comprueba cuatro barrios, distancia, permisos, errores, reanudación y ubicaciones lejanas. La instalación y permisos reales de iOS deben verificarse en un iPhone tras publicar por HTTPS.

## Fotos en las fichas

Las fotos se muestran en un carrusel superior con desplazamiento táctil nativo, flechas, puntos y contador. Admite teclado (flechas, Inicio y Fin) y respeta la preferencia de movimiento reducido. No avanza automáticamente. Una sola foto no muestra controles; las fichas sin fotos conservan su composición con inicial. Los créditos de todas las fotografías siguen al pie de la ficha.

## Estilo visual

Identidad «Guía de calle»: tipografía sans serif contundente, etiquetas monoespaciadas, fondo grafito y acento lima. Geometría recta, fotografías sin contenedores de tarjeta y navegación de alto contraste. Iconos de inicio y tema de la app comparten la misma paleta.
