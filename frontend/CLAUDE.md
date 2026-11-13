# Frontend - Corralink

## Stack
- Framework: Vue 3
- Router: vue-router 4
- HTTP: axios
- Build: Vite 7 con `@vitejs/plugin-vue`
- Node requerido: ^20.19.0 o >=22.12.0

## Comandos
- Instalar: `npm install`
- Desarrollo: `npm run dev`
- Compilar: `npm run build`
- Vista previa del build: `npm run preview`

## Reglas
- Revisa un componente existente antes de crear uno nuevo, para seguir su estilo (Options API o Composition API).
- No hay pruebas ni linter configurados; no asumas que existen.
- `vite-plugin-vue-devtools` es solo para desarrollo.
- No cambies versiones de dependencias sin pedírmelo.
- Prefiere ediciones parciales de archivos en lugar de reescribirlos completos.
- No agregues comentarios explicativos en el código generado, salvo que lo pida.