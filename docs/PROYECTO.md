# Corralink (S T E P) - Documentación del proyecto

## Resumen

Sistema de gestión de un corralón de vehículos (Nuevo Laredo, Tamaulipas). Tiene dos partes:

- **Backend:** Node.js + Express 5 en la raíz, un solo archivo (`server.js`), base de datos SQL Server vía `mssql`.
- **Frontend:** Vue 3 + Vite 7 + vue-router 4 + axios en `frontend/`.

Tres tipos de usuario:

- **Público:** ve el dashboard, busca vehículos y consulta detalles.
- **Ciudadano:** se registra, inicia sesión, envía reclamos o intereses de compra y consulta sus solicitudes.
- **Empleado:** roles `Administrador`, `RolOperativo` y `RolCobranza`. Registran, editan y eliminan vehículos, cambian estatus, gestionan solicitudes y generan reportes.

## Estructura de archivos

### Raíz (backend)
| Archivo | Función |
|---|---|
| `server.js` | Servidor Express: conexión a SQL Server, multer, todas las rutas |
| `package.json` | Dependencias del backend (`main` apunta a `script.js`) |
| `.env` | Variables de conexión (ignorado por git) |
| `.gitignore` | Ignora `node_modules/` y `.env` |
| `CLAUDE.md` | Reglas del proyecto para Claude |
| `index.html`, `script.js`, `style.css` | Restos: HTML en blanco y dos archivos de 0 bytes |
| `uploads/` | Fotos subidas por multer |
| `docs/PROYECTO.md` | Este documento |

### `frontend/`
| Archivo | Función |
|---|---|
| `index.html`, `vite.config.js`, `jsconfig.json` | Entrada y configuración de Vite (alias `@` a `src`) |
| `CLAUDE.md` | Reglas del frontend |
| `src/main.js` | Monta la app con el router |
| `src/App.vue` | Layout: `Sidebar` + `<router-view>` |
| `src/router/index.js` | Rutas y guard por rol |
| `src/assets/` | `main.css` e imágenes |
| `src/components/` | Vistas y modales (ver sección Frontend) |

## Backend (rutas y base de datos)

### Conexión
- Driver `mssql` con `ConnectionPool`, `encrypt:false`, `trustServerCertificate:true`.
- Lee `DB_USER`, `DB_PASS`, `DB_SERVER` y `DB_NAME` de `process.env` (`dotenv`).
- Un único pool (`poolPromise`) compartido por todas las rutas. Si falla la conexión, el proceso termina con `process.exit(1)`.
- Puerto fijo: 3000.
- Arranque: `node server.js` (no hay script `start`).

### Middlewares
`cors()` abierto, `express.json`, `express.urlencoded`, `express.static` para `/uploads` (declarado dos veces) y `multer` con almacenamiento en disco (`uploads/`, nombre `campo-timestamp-random.ext`).

### Rutas
| Método | Path | Función |
|---|---|---|
| POST | `/api/registrar-vehiculo` | Alta de vehículo con hasta 20 fotos (`fotos`) |
| GET | `/api/vehiculos` | Lista de vehículos por `fecha_ingreso` descendente |
| GET | `/api/vehiculos/:id` | Detalle de un vehículo |
| PUT | `/api/vehiculos/:id` | Edición; combina fotos actuales y nuevas (`fotosNuevas`) |
| PATCH | `/api/vehiculos/:id/estatus` | Cambia estatus con el SP `sp_LiberarVehiculo` |
| DELETE | `/api/vehiculos/:id` | Elimina un vehículo |
| GET | `/api/stats` | Total activos, ingresos de hoy y liberados de hoy |
| GET | `/api/reportes/productividad` | Conteo de vehículos agrupado por estatus |
| POST | `/api/login/empleados` | Login de empleados (tabla `empleados`) |
| POST | `/api/login/ciudadanos` | Login de ciudadanos (tabla `usuarios`) |
| POST | `/api/registro/ciudadanos` | Registro de ciudadanos |
| POST | `/api/reclamos` | Crea solicitud de reclamo |
| POST | `/api/compras` | Crea interés de compra |
| GET | `/api/admin/reclamos` | Lista de reclamos con JOIN a vehículos |
| GET | `/api/admin/compras` | Lista de compras con JOIN a vehículos |
| PATCH | `/api/admin/reclamos/:id/estatus` | Cambia estatus de un reclamo |
| PATCH | `/api/admin/compras/:id/estatus` | Cambia estatus de una compra |
| GET | `/api/ciudadano/solicitudes?correo=` | Reclamos y compras de un ciudadano |
| DELETE | `/api/maintenance/clean-releases` | Borra vehículos `Liberado` o `Vendido` con más de 7 días |

### Tablas y objetos usados
`Vehiculos` (campo `fotos` guarda un JSON de rutas), `empleados`, `usuarios`, `SolicitudesReclamo`, `SolicitudesCompra` y el stored procedure `sp_LiberarVehiculo`.

## Frontend (vistas y componentes)

Cada componente define `API_BASE_URL = 'http://localhost:3000'` por su cuenta. Se arranca con `npm run dev` dentro de `frontend/`.

### Vistas con ruta
| Ruta | Componente | Acceso |
|---|---|---|
| `/` | `Dashboard` | Público (el guard por rol está comentado) |
| `/registrar` | `RegistroVehiculo` | Administrador, RolOperativo |
| `/inventario` | `Inventario` | Administrador, RolOperativo, RolCobranza |
| `/buscar` | `Buscador` | Público |
| `/vehiculo/:id` | `VehiculoDetalle` | Público (`?modo=editar` activa la edición) |
| `/sobre-nosotros` | `SobreNosotros` | Público |
| `/login` | `Login` | Público (redirige si ya hay sesión) |
| `/reportes` | `Reportes` | Administrador |
| `/registro-ciudadano` | `RegistroCiudadano` | Público |
| `/bandeja` | `BandejaAdmin` | Administrador, RolCobranza |
| `/mis-solicitudes` | `MisSolicitudes` | ciudadano |

### Componentes sin ruta
- `Sidebar`: menú lateral por rol y cierre de sesión (usado en `App`).
- `ModalDetalleVehiculo`: galería y detalle (usado en `Dashboard` y `Buscador`).
- `ModalReclamo` y `ModalCompra`: formularios (usados en `Dashboard`, `Buscador` y `VehiculoDetalle`).
- `EditarVehiculo`: formulario de edición (usado en `VehiculoDetalle`).
- `Placeholder`: "Página en Construcción", sin uso.

### Sesión y estatus
- Al iniciar sesión se guardan en `localStorage` las claves `rolUsuario`, `usuario` y `correoUsuario`. El guard del router y el `Sidebar` leen el rol de ahí.
- Estatus de vehículo en el detalle: `Sin especificar`, `Para triturar`, `Para vender`, `Liberado`.
- `Reportes` genera el PDF en el navegador con `jspdf` y `jspdf-autotable`, a partir de `/api/vehiculos`.

## Flujo de datos

1. El componente Vue llama con axios a `http://localhost:3000/api/...` desde `onMounted` o desde un evento.
2. Express recibe la petición. `cors` la permite, `express.json` o `multer` leen el cuerpo, y la ruta correspondiente la atiende.
3. La ruta espera `poolPromise`, arma un `request()` con parámetros tipados (`.input`) y ejecuta `.query()` o `.execute()` contra SQL Server.
4. Las filas vuelven como `recordset`. En vehículos, `fotos` se convierte con `JSON.parse` antes de responder.
5. Express responde JSON y el componente actualiza su estado reactivo.
6. Las imágenes se piden directo a `http://localhost:3000/<ruta>`, servidas por `express.static('/uploads')`. El frontend reemplaza `\` por `/` en las rutas.

Ejemplo, login de empleado: `Login.vue` envía `POST /api/login/empleados` con `username` y `password`. El backend consulta `empleados` y responde `{success, user, rol}`. El frontend guarda el rol en `localStorage` y redirige a `/`.

## Dependencias importantes

**Backend:** `express` ^5.1.0, `mssql` ^12.2.1, `multer` ^2.0.2, `cors`, `dotenv`, `jspdf` y `jspdf-autotable` (solo los usa el frontend). `mysql2` está instalada pero no se usa.

**Frontend:** `vue` ^3.5.22, `vue-router` ^4.5.1, `axios` ^1.12.2, `vite` ^7.1.7, `@vitejs/plugin-vue`, `vite-plugin-vue-devtools`. Node requerido: ^20.19.0 o >=22.12.0.

## Problemas y riesgos detectados

Solo detectados. No se ha corregido nada.

### Críticos (funcionalidad rota)
1. **Variables de entorno que no coinciden:** `server.js:16` lee `DB_PASS` y `server.js:18` lee `DB_NAME`, pero `.env` define `DB_PASSWORD` y `DB_DATABASE`. La conexión no puede funcionar así.
2. **Registro de ciudadanos roto:** `server.js:268` usa `adminPoolPromise`, que no existe. La ruta lanza `ReferenceError` y devuelve 500.

### Seguridad
3. **Contraseñas en texto plano:** ambos logins las comparan directo en el SQL, y el registro las guarda sin hash.
4. **Sin autenticación en la API:** no hay sesión ni token. El rol vive solo en `localStorage`, por lo que cualquiera puede llamar a `DELETE`, `PUT`, `PATCH`, `/api/admin/*` y `/api/maintenance/clean-releases`.
5. **`GET /api/ciudadano/solicitudes?correo=`** devuelve las solicitudes de cualquier correo sin verificar quién pregunta.
6. **CORS abierto** a cualquier origen.
7. **Contraseña de `sa` expuesta en una conversación de revisión:** conviene cambiarla.
8. **Uso de `sa` como usuario de la aplicación** en lugar de uno con permisos limitados.
9. **Edición solo por parámetro:** `?modo=editar` en `/vehiculo/:id` activa la edición sin verificar el rol.

### Robustez
10. `POST /api/login/empleados` (`server.js:223`) no tiene `try/catch`: un error de BD deja la petición colgada.
11. `POST /api/registrar-vehiculo` y `PUT /api/vehiculos/:id` no validan campos ni tipo de archivo subido.
12. `PUT /api/vehiculos/:id` usa `JSON.parse` sobre `fotosActualesJson` dentro del `try`, pero sin validar su contenido. Las fotos eliminadas no se borran de `uploads/`.
13. Los logs de `server.js:396` y `server.js:423` imprimen en consola los datos completos de reclamos y compras.
14. El estatus `Vendido` se borra en el mantenimiento, pero el detalle solo ofrece `Sin especificar`, `Para triturar`, `Para vender` y `Liberado`.

### Mantenimiento y limpieza
15. `package.json` raíz: `main` apunta a `script.js` (vacío) y no hay script `start`.
16. `mysql2` está instalada sin uso.
17. `index.html`, `script.js` y `style.css` de la raíz son restos.
18. `uploads/` tiene 221 archivos versionados en git, aunque `CLAUDE.md` dice que no se versione. `.gitignore` no la excluye.
19. `Reportes.vue` importa `jspdf` y `jspdf-autotable`, que no están en `frontend/package.json`. Funciona porque Vite los resuelve desde el `node_modules` de la raíz.
20. `http://localhost:3000` está repetido en 13 componentes.
21. `express.static` de `/uploads` declarado dos veces y puerto 3000 fijo en el código.
22. Las rutas de `fotos` se guardan con `\` de Windows.
23. `Dashboard.vue` tiene `esInvitado = true` fijo.
24. `VehiculoDetalle.vue`: `agendarCita` solo hace `console.log` y `alert`, no guarda la cita.
25. `Placeholder.vue` sin uso.
26. `Login.vue` usa `window.location.href` en lugar del router, lo que recarga toda la app.
27. Mezcla de español e inglés y comentarios de depuración en el código.

## Pendientes sugeridos

Ordenados por prioridad.

1. Alinear los nombres de variables entre `.env` y `server.js` (`DB_PASS` y `DB_NAME`), y confirmar que el backend conecta.
2. Corregir `adminPoolPromise` en `server.js:268` y probar el registro de ciudadanos.
3. Cambiar la contraseña de `sa` y crear un usuario SQL con permisos limitados.
4. Agregar `try/catch` a `POST /api/login/empleados`.
5. Guardar contraseñas con hash (por ejemplo `bcrypt`) y migrar las existentes.
6. Agregar autenticación (JWT o sesión) y proteger por rol las rutas de escritura, `/api/admin/*` y mantenimiento.
7. Restringir CORS al origen del frontend.
8. Validar entradas y tipos de archivo en las rutas de vehículos.
9. Agregar `uploads/` a `.gitignore` y sacarla del historial de git, tras decidir qué hacer con las fotos existentes.
10. Corregir `main` en `package.json`, agregar un script `start` y quitar `mysql2`.
11. Declarar `jspdf` y `jspdf-autotable` en `frontend/package.json`.
12. Centralizar `API_BASE_URL` en una variable de entorno de Vite (`VITE_API_URL`) o en un módulo de axios.
13. Decidir qué hacer con `index.html`, `script.js` y `style.css` de la raíz.
14. Quitar los `console.log` de depuración y el componente `Placeholder`.
15. Implementar o retirar la función de agendar cita.
16. Alinear los estatus del frontend con los del mantenimiento (`Vendido`).
17. Normalizar las rutas de `fotos` con `/` al guardarlas.
