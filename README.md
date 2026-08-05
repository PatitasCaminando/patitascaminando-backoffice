# Patitas Caminando — Backoffice Angular

Frontend administrativo conectado al backend NestJS del proyecto Patitas Caminando.

## Alcance incluido

- Inicio de sesión de administradores y operadores.
- Recuperación y cambio de contraseña con Supabase.
- Dashboard administrativo.
- Gestión de animales y carga de imágenes en Supabase Storage.
- Gestión de solicitudes de adopción.
- Gestión de donaciones.
- Notificaciones.
- Administración de contenido del sitio.
- Creación de operadores.
- Diseño responsive con el branding institucional.

Este proyecto no contiene landing, catálogo público ni formularios públicos. Esas pantallas pueden integrarse posteriormente por separado.

## Configuración

Edite `src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  supabaseUrl: 'https://TU-PROYECTO.supabase.co',
  supabaseAnonKey: 'TU-ANON-KEY',
  storageBucket: 'animals',
  storagePublicUrl: 'https://TU-PROYECTO.supabase.co/storage/v1/object/public/animals'
};
```

En el backend configure:

```env
PASSWORD_RESET_REDIRECT_URL=http://localhost:4200/reset-password
```

## Ejecutar

```bash
npm install
npm start
```

Abrir `http://localhost:4200`. La aplicación redirige directamente a `/login`.

## Endpoints usados

- `POST /auth/login`
- `POST /auth/forgot-password`
- `GET /auth/me`
- `/admin/animals`
- `/admin/adoptions/applications`
- `/admin/donations/offers`
- `/admin/notifications`
- `/admin/site-sections`
- `POST /admin/users/operators`

## Ajuste visual del backoffice

Se armonizó la interfaz posterior al inicio de sesión con la identidad visual de Patitas Caminando:

- naranja `#F69222`
- turquesa `#62D9D9`
- azul `#153970`
- morado `#612758`
- fondos crema y turquesa suaves
- logo conservado en el menú lateral
- menú, encabezado, tablas, tarjetas, botones y estados rediseñados de forma consistente

La lógica, rutas y conexión con Supabase no fueron modificadas.
