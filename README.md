# Sitio Web Imaforbes (Portafolio v2.0)

Proyecto web de portafolio **IMAFORBES**, actualizado a su versión más reciente con una arquitectura orientada al rendimiento (Astro) y un backend robusto en PHP.

## Arquitectura Actual (¡Actualizado!)

El proyecto se divide principalmente en dos carpetas activas:

- **`Imaforbes_astro/` (Frontend Activo 🚀)**: El nuevo frontend construido con **Astro**, **React**, **Tailwind CSS** y **Framer Motion**. Esta carpeta reemplaza por completo a la anterior SPA (Single Page Application). Al usar Astro, el sitio ahora soporta renderizado estático y mejora significativamente el SEO y el rendimiento (Performance). Todas las modificaciones visuales, páginas y componentes se realizan aquí.
  
- **`api_db/` (Backend Activo ⚙️)**: El backend en **PHP** (API REST). Maneja las conexiones con la base de datos MySQL, procesamiento de correos de contacto (con medidas Anti-Spam), control de sesiones, operaciones CRUD del blog, subida de imágenes, etc.

*Nota: Las carpetas `Imaforbes_frontend/` y `Imaforbes_Api_backend/` corresponden a las versiones antiguas de la aplicación y se conservan únicamente como respaldo (archivos históricos).*

## Cómo funciona la conexión (Frontend ↔ Backend)

- El **frontend (Astro)** consume datos JSON desde la **API (PHP)** ubicada en `api_db/api/`.
- **En entorno de desarrollo local**, Astro utiliza un **proxy de Vite** (configurado en `Imaforbes_astro/astro.config.mjs`) para evitar problemas de CORS:
  - Todas las peticiones a `/api` son redirigidas internamente hacia `http://localhost:8888/My_website_imaforbes/api_db`.
  - Las peticiones a `/uploads` son redirigidas a `http://localhost:8888/My_website_imaforbes/api_db/uploads`.

## Requisitos del Sistema

- **Node.js + npm** (para ejecutar y construir el frontend Astro).
- **PHP** (recomendado usar **MAMP** en macOS).
- **MySQL** (Base de datos local configurada en puerto 8889 por defecto en MAMP).

## Ejecutar en local (Modo Desarrollo)

### 1) Entorno Backend (MAMP)

1. Enciende los servidores de Apache y MySQL en la aplicación **MAMP**.
2. Verifica que la carpeta principal `My_website_imaforbes` esté ubicada dentro de la ruta `/Applications/MAMP/htdocs/`.
3. Tu base de datos MySQL debe contar con la estructura necesaria (usa el archivo `portfolio.sql` para importar las tablas a tu gestor local, ej. phpMyAdmin).
4. El backend estará disponible en `http://localhost:8888/My_website_imaforbes/api_db/`.

### 2) Entorno Frontend (Astro)

Abre una terminal, navega a la carpeta activa del frontend e inicializa el servidor:

```bash
cd /Applications/MAMP/htdocs/My_website_imaforbes/Imaforbes_astro
npm install
npm run dev
```

El sitio frontend cargará en tu navegador, generalmente en la dirección `http://localhost:4321`.

## Resumen de la carpeta Frontend (`Imaforbes_astro/`)

- **`src/pages/`**: Rutas nativas de Astro (`.astro`). Encargadas del layout principal y del SEO.
- **`src/pages_react/`**: Componentes de página complejos elaborados en React (`.jsx`) que requieren estado dinámico (useState, useEffect, animaciones de Framer Motion).
- **`src/components/`**: Componentes visuales reutilizables (Header, Footer, Tarjetas, Modales).
- **`src/services/` y `src/hooks/`**: Lógica de conexión a la API (`api.js`) y Custom Hooks para manejar el estado global.
- **`public/`**: Recursos estáticos (favicons, tipografías locales, etc.).
- **`astro.config.mjs`**: Archivo crucial de configuración donde se declaran las reglas del proxy y las integraciones de Astro (React, Tailwind).

## Resumen de la carpeta Backend (`api_db/`)

- **`api/`**: Archivos `.php` expuestos públicamente como endpoints (`blog.php`, `contact.php`, `projects.php`).
- **`config/`**: Archivos de conexión a base de datos (`database.php`) y manejo de respuestas (`response.php`).
- **`utils/`**: Herramientas críticas del backend como Protección CSRF, Rate Limiting (contra SPAM) y el envío de correos vía SMTP (`EmailSender.php`).
- **`uploads/images/`**: Directorio donde se almacenan físicamente las imágenes subidas a través de la API (por ejemplo, miniaturas del blog).

## Seguridad 🔒

- **Archivos Sensibles**: Evita compartir públicamente el archivo `api_db/config/database.php` y cualquier configuración de servidor SMTP. 
- La API de contacto incluye rate limiting por IP, impidiendo más de 3 solicitudes en 10 minutos para combatir spambots.

---
*Documentación generada y actualizada para reflejar el traslado exitoso a Astro Framework.*
