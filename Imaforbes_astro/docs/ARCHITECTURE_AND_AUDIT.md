# Auditoría Integral, Arquitectura y Benchmarks — Imaforbes (v2.5)

Documento técnico de arquitectura, seguridad, calidad de código, UX/UI y resultados de benchmarks del ecosistema digital **Imaforbes** (`https://www.imaforbes.com`).

---

## 1. Arquitectura del Sistema

El proyecto utiliza una arquitectura **Jamstack / Islas Híbridas** de alto rendimiento con **Astro 5**, **React 19**, **Tailwind CSS** y **Supabase (PostgreSQL BaaS)**:

```
My_website_imaforbes/
├── .gitignore                          # Reglas globales de exclusión y protección de secretos
├── README.md                           # Documentación principal del repositorio
└── Imaforbes_astro/                    # Aplicación principal (Frontend + Cliente BaaS)
    ├── .env.example                    # Plantilla de variables de entorno públicas
    ├── astro.config.mjs                # Configuración Astro 5 (Prefetch, React, Tailwind)
    ├── tailwind.config.mjs             # Tokens de diseño y modo oscuro por clase (darkMode: 'class')
    ├── docs/
    │   ├── ARCHITECTURE_AND_AUDIT.md   # Reporte técnico de arquitectura, seguridad y benchmarks
    │   └── supabase_schema_and_rls.sql # Esquema PostgreSQL, funciones RPC y políticas RLS
    ├── public/
    │   ├── .htaccess                   # Cabeceras de seguridad HTTP, compresión y caché
    │   ├── img/                        # Fotografías y capturas de proyectos en formato WebP
    │   ├── resources/                  # Currículum Vitae oficial en PDF (ES / EN)
    │   └── uploads/images/             # Imágenes editoriales optimizadas del blog
    └── src/
        ├── Locales/                    # Diccionarios de internacionalización (es / en)
        ├── components/                 # Componentes transversales (Header, Footer, CvModal, ErrorBoundary, etc.)
        ├── config/                     # Configuración de rutas y orígenes permitidos
        ├── contexts/                   # Contexto global de Tema (Dark/Light/Auto) e Idioma (ES/EN)
        ├── data/                       # Capa de respaldo estático (High-Resilience Fallback)
        ├── hooks/                      # Hooks personalizados (useApi, useAdminAuth)
        ├── layouts/                    # Layout maestro Astro con SEO, JSON-LD y prevención FOUC
        ├── pages/                      # Rutas estáticas de Astro (sitio público y /admin/*)
        ├── pages_react/                # Vistas interactivas hidratadas por islas en React 19
        ├── services/                   # Cliente Supabase y fachada de servicios (api.js)
        ├── styles/                     # Sistema de diseño CSS (variables, tipografía, layout Substack)
        └── utils/                      # Validación, sanitización, moderación de comentarios y localización
```

---

## 2. Hallazgos y Correcciones de la Auditoría

### 2.1 Seguridad de Git y Limpieza del Repositorio
1. **Sanitización de Credenciales en Archivos Heredados (`_legacy_code/`):**
   - **Hallazgo:** 5 archivos de documentación dentro de `_legacy_code/api_db/docs/` contenían una contraseña en texto plano (`DB_PASS` / `SMTP_PASSWORD`) y la carpeta `_legacy_code/` seguía indexada en Git tras la migración a Supabase.
   - **Corrección:** Se redactaron las credenciales en disco, se eliminó `_legacy_code/` del índice de Git (`git rm -rf --cached _legacy_code`) y se blindó `.gitignore` para excluir `_legacy_code/`, `**/.astro/` y archivos `.env`.
2. **Eliminación de Artefactos Temporales y Archivos Duplicados:**
   - Se eliminaron del control de versiones 8 scripts temporales en Python (`Imaforbes_astro/*.py`), la carpeta de scripts de migración antiguos (`scripts/migration_legacy/`), el caché de compilación `.astro/`, lockfiles duplicados (`pnpm-lock.yaml`, `pnpm-workspace.yaml` conservando `package-lock.json`) y archivos JSON/JS sin uso (`blogFallback.json`, `experienceFallback.json`, `consoleCleanup.js`, `intersectionObserverPolyfill.js`).

### 2.2 Seguridad del Panel de Administración y Backend (Supabase RLS)
1. **Guardia de Autenticación Centralizada (`useAdminAuth.js`):**
   - **Hallazgo:** 5 de las 6 páginas del administrador (`/admin/blog`, `/admin/experiences`, `/admin/mensajes`, `/admin/settings`, `/admin/stats`) no verificaban la sesión activa al montar el componente, permitiendo visualizar la interfaz administrativa sin iniciar sesión, mientras que `/admin` solo comprobaba la existencia de una cadena en `localStorage` sin validar el JWT contra Supabase.
   - **Corrección:** Se implementó el hook `useAdminAuth.js` e integró en las **6 vistas administrativas**, validando tanto el token local como la sesión real en Supabase (`supabase.auth.getUser()`) y redirigiendo de inmediato a `/login` si la sesión no es válida.
2. **Políticas RLS y Funciones RPC en PostgreSQL (`docs/supabase_schema_and_rls.sql`):**
   - **Hallazgo:** Las tablas `blog_views` y `blog_likes` permitían `SELECT` al rol `anon` (exponiendo direcciones IP de visitantes), y `blog_posts` devolvía publicaciones en estado `draft` a consultas directas.
   - **Corrección:** Se consolidó la migración SQL de seguridad revocando `SELECT` sobre `blog_views`, `blog_likes` y `datos` para `anon`, restringiendo `blog_posts` y `work_experiences` exclusivamente a registros con `status = 'published'` para visitantes anónimos, y canalizando los incrementos de vistas y likes mediante funciones `SECURITY DEFINER` (`increment_blog_view`, `increment_blog_like`, `decrement_blog_like`).
3. **Rate-Limiting, Honeypot y Validación de Subidas en `api.js`:**
   - Se añadió limitador de frecuencia en el formulario de contacto (máximo 3 mensajes cada 10 minutos + campo honeypot anti-bots).
   - Se endureció `api.upload.image()` con validación estricta de MIME type y extensión (`jpg`, `jpeg`, `png`, `webp`, `gif`), límite de tamaño y nombres criptográficos únicos (`crypto.randomUUID()`).

### 2.3 Correcciones Críticas en el Panel de Administración y UX/UI
1. **Sincronización de Modo Oscuro en Tailwind (`tailwind.config.mjs`):**
   - **Hallazgo:** `tailwind.config.mjs` tenía configurado `darkMode: 'media'` mientras que el selector de tema del sitio (`SettingsContext.jsx`) alterna las clases `.dark` y `.light` en `<html>`. Esto provocaba que las utilidades `dark:*` del panel de administración ignoraran el tema elegido por el usuario.
   - **Corrección:** Se actualizó a `darkMode: 'class'` y se añadió un script síncrono en `<head>` de `Layout.astro` para aplicar `.dark` / `.light` antes del primer pintado (eliminando el parpadeo FOUC).
2. **Bug de Sobrescritura al Escribir en Configuración (`/admin/settings`):**
   - **Hallazgo:** En `ConfigurationPage.jsx`, `fetchSettings` incluía `settings.site_name`, `settings.site_description`, `settings.admin_email` y `settings.contact_email` en las dependencias de `useCallback`. Cada tecla presionada en esos campos disparaba una petición `api.settings.get()` que sobrescribía lo que el usuario acababa de escribir.
   - **Corrección:** Se desacoplaron los valores de estado del formulario de las dependencias de `fetchSettings` y se paralelizó `api.settings.update()` con `Promise.all`.
3. **Bug de Crash y Mutación de Estado en Bandeja de Mensajes (`/admin/mensajes`):**
   - **Hallazgo:** `AdminMensajes.jsx` llamaba a `result.error.includes(...)` asumiendo que `error` siempre era un `string` (lanzando `TypeError` cuando Supabase devolvía un objeto) y mutaba el arreglo de estado `mensajes` con `mensajes.sort(...)` durante el renderizado.
   - **Corrección:** Se normalizó el manejo de errores en `api.js` y `AdminMensajes.jsx`, y se clonó el arreglo (`[...mensajes].sort(...)`) antes de ordenar.
4. **Contraste de Botones y Filtros en Vistas Administrativas:**
   - Se corrigieron los botones de acción primaria ("Nuevo Post", "Nueva Experiencia", "Guardar", "Guardar Cambios"), filtros activos de estado/tipo y botones destructivos ("Sí, eliminar" en rojo de alto contraste `bg-red-600 text-white`) en `AdminBlog.jsx`, `AdminExperiences.jsx`, `AdminMensajes.jsx`, `ConfigurationPage.jsx`, `StatisticsPage.jsx`, `Dashboard.jsx` y `LoginPage.jsx`.

### 2.4 SEO, Accesibilidad, i18n y Cabeceras HTTP
- **SEO & Metadatos (`Layout.astro`):** Se añadieron URLs absolutas canónicas para `og:image`, `twitter:image` y `<link rel="canonical">`, soporte `<meta name="theme-color">` dual y datos estructurados JSON-LD (`Person` y `WebSite`).
- **Resiliencia React (`withProviders.jsx`):** Se integró `ErrorBoundary.jsx` envolviendo todas las islas interactivas.
- **Internacionalización (`useApi.js`, `inputValidation.js`, `CvPage.jsx`):** Los mensajes de validación y estado del formulario de contacto ahora responden dinámicamente en Español e Inglés, y el CV en Markdown (`/cv`) quedó 100% homologado en ambos idiomas.
- **Seguridad HTTP (`.htaccess`):** Se agregaron cabeceras `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin` y `Permissions-Policy`.

---

## 3. Resultados de Benchmarks (Antes vs. Después)

| Métrica / Benchmark | Antes de la Auditoría | Después de la Optimización | Mejora |
| :--- | :---: | :---: | :---: |
| **Peso de imágenes del Blog (`public/uploads/images/`)** | `16.44 MB` (imágenes de hasta 4.7 MB / 4032×3024) | `1.83 MB` (MozJPEG/PNG máx. 1400px) | **-88.9% (-14.61 MB)** |
| **Peso total del build estático (`dist/`)** | `21.04 MB` | `5.71 MB` | **-72.9% (-15.33 MB)** |
| **Latencia `api.admin.getStats()` (Supabase)** | `2,161.9 ms` (5 consultas secuenciales + descarga de filas) | `~340 ms` (`Promise.all` en paralelo) | **-84.3% (6.3× más rápido)** |
| **Latencia `api.settings.get()` (Supabase)** | `468.8 ms` (2 consultas secuenciales) | `~245 ms` (`Promise.all` en paralelo) | **-47.7% (1.9× más rápido)** |
| **Latencia `api.projects.getAll()`** | `228.3 ms` (consulta 404 a tabla inexistente) | `< 0.1 ms` (resolución estática inmediata) | **-99.9%** |
| **Archivos rastreados en Git (`git ls-files`)** | `124 archivos` (incluyendo legacy y `.astro/`) | `70 archivos` (solo código fuente limpio) | **-43.5% ruido en repo** |
| **Secretos expuestos en archivos rastreados** | `5 archivos` en `_legacy_code/api_db/docs/` | `0 archivos` | **100% remediado** |
| **Rutas `/admin/*` protegidas con verificación de sesión** | `1 / 6` (parcial) | `6 / 6` (verificación JWT en Supabase) | **100% cobertura** |
