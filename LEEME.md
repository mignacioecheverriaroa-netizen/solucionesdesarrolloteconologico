# SDT — Soluciones en Desarrollo Tecnológico

## Cómo abrirlo
1. Descomprime el `.zip`.
2. Haz doble clic en `index.html` para verlo en el navegador.
3. Para editarlo, abre la carpeta `sdt-web` en Visual Studio Code (Archivo → Abrir carpeta).

## Estructura
```
sdt-web/
├── index.html      → estructura y textos
├── css/styles.css  → diseño, colores y adaptación a celular
├── js/script.js    → formulario de consultas, WhatsApp y correo
└── img/logo.svg    → logo SDT
```

## Formulario de consultas
- El cliente escribe su nombre, qué le interesa y su consulta, y elige a cuál de los
  dos WhatsApp enviarla (+56 9 3436 1183 o +56 9 7789 4839).
- Al enviar, se abre WhatsApp con la consulta escrita.

## Agregar el correo (cuando lo tengas)
En `js/script.js`, línea `const CORREO = "";`, escribe el correo entre las comillas:
```js
const CORREO = "tucorreo@ejemplo.cl";
```
Con eso:
1. El correo aparece solo en la sección de contacto.
2. Cada consulta también llega a ese correo mediante FormSubmit (gratuito).
   La primera vez, abre la página con Live Server o publicada en internet, envía una
   consulta de prueba y presiona "Activate Form" en el correo que te llegará de FormSubmit.

## Fotografías
Las cuatro fotos de la sección "Así nace tu proyecto" son de **Unsplash**, con licencia de uso
libre (incluso comercial), sin pedir permiso y sin obligación de dar crédito. Igual se incluyen
los créditos de los fotógrafos al pie de la sección, como buena práctica.
- Se cargan desde internet. Sin conexión, se muestra un fondo azul cuadriculado en su lugar.
- Para tenerlas dentro del proyecto: descárgalas desde los enlaces de los créditos, guárdalas
  en `img/` y cambia cada `src` en `index.html` (por ejemplo `img/paso-1.jpg`).

## Seguridad incluida
**En la página (funciona siempre):**
- Política de contenido (CSP): el navegador solo acepta los archivos propios de la página,
  las fuentes de Google, las fotos de Unsplash y FormSubmit. Bloquea código insertado por terceros.
- Los enlaces externos no comparten datos de la página (`noopener noreferrer`).
- Formulario:
  - campo trampa invisible y bloqueo de envíos hechos en menos de 3 segundos (robots);
  - espera de 30 segundos entre consultas, para evitar envíos repetidos;
  - limpieza del texto: quita etiquetas HTML y caracteres ocultos, y limita el largo;
  - el nombre solo acepta letras, y la consulta no acepta enlaces (spam);
  - solo envía a los dos números autorizados, aunque alguien modifique la página.

**En el servidor (al publicar):** sube también `.htaccess` (Apache/cPanel) o `_headers`
(Netlify/Cloudflare). Agregan: bloqueo de marcos externos, HTTPS obligatorio, protección de
tipos de archivo y bloqueo de cámara, micrófono y ubicación.
Activa el HTTPS obligatorio solo cuando tu dominio ya tenga certificado SSL.

**Al agregar el correo:** FormSubmit te enviará un código. Úsalo en lugar del correo dentro
de `js/script.js` para que tu dirección no quede visible en el código.
