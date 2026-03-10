# Sitio_Web_imaforbes

Proyecto web de portafolio **IMAFORBES** compuesto por:

- **`Imaforbes_frontend/`**: Frontend en **React + Vite + Tailwind**.
- **`Imaforbes_Api_backend/`**: Backend en **PHP** (API REST) para proyectos, blog, contacto, auth y uploads.

## Cómo funciona (arquitectura)

- El **frontend** consume datos desde la **API PHP** (proyectos, blog, mensajes de contacto, etc.).
- En **desarrollo**, el frontend usa un **proxy de Vite** para evitar problemas de CORS:
  - Ruta: `/api_db_portfolio`
  - Target: `http://localhost:8888` (configurado en `Imaforbes_frontend/vite.config.js`)
- La **API** responde en **JSON** con un formato estándar (ver `Imaforbes_Api_backend/docs/API_ENDPOINTS.md`).

## Requisitos

- **Node.js + npm** (para el frontend)
- **PHP** (recomendado con **MAMP** en macOS)
- **MySQL** (para persistencia de datos)

## Ejecutar en local (desarrollo)

### 1) Backend (PHP) en MAMP

1. Coloca/expón la carpeta del backend en el servidor local (MAMP).
2. Asegúrate de poder acceder a la API desde el navegador, por ejemplo:
   - `http://localhost:8888/api_db_portfolio/api/projects.php`

Notas:
- La documentación incluye configuración local para MAMP y base de datos.
- **No subas credenciales reales a Git** (ver sección “Seguridad”).

### 2) Frontend (React + Vite)

Desde `Imaforbes_frontend/`:

```bash
npm install
npm run dev
```

Opcional: crea un archivo `.env` (o usa tu estrategia) tomando como base `Imaforbes_frontend/env.example`.

## Variables de entorno

### Frontend

- Plantilla: `Imaforbes_frontend/env.example`
- Variables comunes:
  - `VITE_APP_ENV`
  - `VITE_API_BASE_URL` (en desarrollo normalmente se usa `/api_db_portfolio` para que aplique el proxy)

### Backend

- Plantilla: `Imaforbes_Api_backend/.env.example`
- Variables típicas:
  - DB: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`
  - SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_SECURE`, `FROM_EMAIL`, etc.

## Resumen de carpetas

### `Imaforbes_frontend/`

- **`src/`**: Código fuente React (rutas/páginas, componentes, hooks, servicios, i18n, contextos).
- **`public/`**: Assets públicos servidos tal cual.
- **`docs/`**: Guías de despliegue, seguridad, documentación de consumo de API y checklists.
- **`vite.config.js`**: Config de Vite (incluye proxy `/api_db_portfolio` → `http://localhost:8888`).
- **`deploy.js` / `prepare-for-hostinger.js` / `start-dev.sh`**: utilidades de despliegue y scripts.

### `Imaforbes_Api_backend/`

- **`api/`**: Endpoints de la API (por ejemplo `projects.php`, `contact.php`, `blog.php`, `upload/`, `auth/`, `admin/`).
- **`auth/`**: Lógica de autenticación/sesión (según implementación).
- **`config/`**: Configuración (DB, email, CORS, etc.; normalmente lee variables de entorno).
- **`migrations/`**: Scripts/migraciones de base de datos.
- **`uploads/`**: Archivos subidos (imágenes/documentos). Suele requerir permisos de escritura.
- **`storage/`**: Almacenamiento auxiliar (según implementación).
- **`utils/`**: Helpers/utilidades compartidas.
- **`docs/`**: Documentación técnica (endpoints, seguridad, CORS fixes, MAMP setup, despliegue).

## Documentación útil (dentro del repo)

- **API endpoints**: `Imaforbes_Api_backend/docs/API_ENDPOINTS.md`
- **Docs backend**: `Imaforbes_Api_backend/docs/README.md`
- **Docs frontend**: `Imaforbes_frontend/docs/README.md`

## Seguridad (muy importante)

- **Nunca** subas archivos con secretos:
  - Backend: `Imaforbes_Api_backend/.env`
  - Frontend: `Imaforbes_frontend/.env`, `.env.local`, etc.
- Usa siempre los archivos `*.example` como plantilla y mantén credenciales reales fuera del control de versiones.

