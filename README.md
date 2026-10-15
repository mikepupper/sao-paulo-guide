# São Paulo · Guía de bolsillo

Directorio en español de 93 lugares de São Paulo (comer, hamburguesas, bares y cerveja artesanal, música y paseos), ordenados de más cerca a más lejos de Vila Buarque. Es un proyecto independiente del de Cambridge: vive en su propia carpeta, con su propio `places.json`, imágenes y generador.

## Abrir la guía

Abre `index.html` en un navegador, con `styles.css`, `guide.js` y la carpeta `imágenes` a su lado. `npm run dev` levanta un servidor local en el puerto 4174.

## Contenido

- `places.json`: una ficha por lugar (zona, tag clásico/tendencia, qué pedir o hacer, precio, reserva, coordenadas y hasta 3 fotos con su fuente y atribución).
- `tips.json`: contenido de la pestaña «Consejos» (top 10, reservas, seguridad, cómo llegar).
- Los datos salen del directorio «São Paulo octubre 2026» (revisado el 9 de octubre de 2026). La agenda de conciertos no se incluyó.
- Las coordenadas se obtuvieron de OpenStreetMap (Nominatim); algunas son aproximadas. Las distancias son en línea recta.
- Las fotos vienen de Wikimedia Commons o del sitio oficial de cada lugar; cada una lleva su crédito. Los lugares sin foto verificable muestran una inicial.

## Actualizar

Edita `places.json` o `tips.json`, ejecuta `python3 generate.py` y luego `python3 validate.py`. `npm run build` crea una copia estática en `dist`.
