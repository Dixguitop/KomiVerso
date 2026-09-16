# KōmiVerso

Lector de manga, manhwa y manhua construido con React + Vite + Tailwind, conectado en vivo a la API pública de MangaDex.

## Requisitos

- Node.js 18 o superior
- npm

## Instalación y uso local

```bash
npm install
npm run dev
```

Esto abre el proyecto en `http://localhost:5173`. Para probarlo desde tu celular en la misma red, usa la URL tipo `http://TU_IP_LOCAL:5173` que aparece en la consola (el server ya está configurado con `host: true`).

## Compilar para producción

```bash
npm run build
```

Esto genera la carpeta `dist/` con los archivos estáticos listos para subir a cualquier hosting (Vercel, Netlify, GitHub Pages, tu propio servidor, etc.). Para previsualizar el build:

```bash
npm run preview
```

## Cosas importantes que debes saber

### 1. Almacenamiento local, no una base de datos real
`src/storage-shim.js` reemplaza la función `window.storage` (que solo existe dentro de un Artifact de Claude) usando `localStorage` del navegador. Esto significa:

- Las cuentas, favoritos, historial y comentarios se guardan **solo en el navegador de cada persona**, no en un servidor compartido.
- Si alguien crea una cuenta en el celular y luego abre la página en la laptop, **no** podrá iniciar sesión con esos mismos datos ahí — porque no existe backend real.
- Los comentarios que escriba una persona solo los verá ella misma, no otros usuarios.

Para que las cuentas y comentarios sean de verdad compartidos entre distintos usuarios/dispositivos, necesitas un backend propio (por ejemplo una API en Node.js/Express con una base de datos como PostgreSQL o MongoDB) que reemplace las llamadas de `storage-shim.js` por peticiones HTTP a ese servidor. Es un proyecto aparte — si llegas a ese punto, pídeme ayuda para armarlo.

### 2. MangaDex y CORS
La API de MangaDex no envía cabeceras CORS, así que el navegador bloquea las peticiones directas. El archivo `App.jsx` ya resuelve esto pasando las peticiones de datos por un proxy público (`allorigins.win`, con `codetabs.com` como respaldo). Son servicios gratuitos con límites de peticiones por minuto — si notas fallos de conexión frecuentes, la solución más estable a largo plazo es montar tu propio proxy en un servidor Node.js.

### 3. Contraseñas sin verificación por correo
Tal como se pidió, el registro es solo correo + contraseña, sin envío de código de verificación. La "recuperación de contraseña" tampoco verifica que el correo le pertenezca a quien la pide — está pensado como demo/proyecto personal, no como sistema de producción con datos sensibles reales.

## Estructura del proyecto

```
mangaverso/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── public/
│   └── manifest.json
└── src/
    ├── main.jsx          # punto de entrada
    ├── App.jsx           # toda la app (páginas, lector, etc.)
    ├── storage-shim.js   # reemplazo de window.storage con localStorage
    └── index.css         # estilos base + Tailwind
```
