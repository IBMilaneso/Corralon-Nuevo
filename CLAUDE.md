# Corralink

Proyecto con backend en la raíz y frontend en la carpeta `frontend/`.

## Estructura
- Raíz: backend en Node.js (Express 5), punto de entrada `server.js`.
- `frontend/`: aplicación Vue 3 + Vite. Sus reglas están en `frontend/CLAUDE.md`.
- `uploads/`: archivos subidos por multer. No la modifiques ni la versiones.
- `index.html`, `script.js`, `style.css` en la raíz: Son restos vacíos o de una interfaz anterior; no los modifiques
. No los modifiques sin pedírmelo.

## Backend
- Runtime: Node.js con Express 5.
- Base de datos: SQL Server (driver `mssql`). La dependencia `mysql2` está instalada; no la uses sin confirmarlo.
- Subida de archivos: `multer`.
- Generación de PDF: `jspdf` y `jspdf-autotable`.
- Variables de entorno: `dotenv`, desde el archivo `.env`.

### Comandos
- Instalar: `npm install`
- Ejecutar: `node server.js`
- Pruebas: no están configuradas; no asumas que existen.

## Reglas generales
- Prefiere ediciones parciales de archivos en lugar de reescribirlos completos.
- No agregues comentarios explicativos en el código generado, salvo que lo pida.
- Para SQL, prefiere consultas simples (SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY). Usa JOIN o subconsultas cuando sea necesario.
- Nunca incluyas contraseñas, cadenas de conexión ni credenciales en el código ni en estos archivos.
- No cambies versiones de dependencias sin pedírmelo.
- Sé directo y ve al grano.

## Qué no leer
- node_modules/ (dependencias de terceros)
- uploads/ (imágenes subidas por usuarios)
- .git/
- Archivos *.map