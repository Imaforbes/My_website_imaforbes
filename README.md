# Imaforbes — Portfolio & Editorial Platform (v2.5)

Sitio web personal, portafolio de ingeniería de software y plataforma editorial tipo periódico/Substack de **Imanol Pérez Arteaga (Imaforbes)** — [`https://www.imaforbes.com`](https://www.imaforbes.com).

---

## Arquitectura Tecnológica

El proyecto está construido bajo una arquitectura moderna **Jamstack con Islas Interactivas** y **Backend-as-a-Service (BaaS)** con capa de alta disponibilidad:

- **Framework Core:** [Astro 5](https://astro.build/) (Static Site Generation + View Transitions con `ClientRouter` y `prefetchAll`).
- **UI & Islas Interactivas:** [React 19](https://react.dev/) + [Framer Motion 12](https://www.framer.com/motion/) (con soporte `reducedMotion="user"`).
- **Sistema de Diseño y Estilos:** [Tailwind CSS 3.4](https://tailwindcss.com/) (`darkMode: 'class'`) + Design Tokens CSS personalizados (`Plus Jakarta Sans`, `Geist Sans`, `Geist Mono`, modos Claro/Oscuro/Auto sin FOUC).
- **Backend & Base de Datos:** [Supabase](https://supabase.com/) (PostgreSQL con Row Level Security `RLS`, funciones RPC `SECURITY DEFINER`, Supabase Auth JWT y Supabase Storage).
- **Resiliencia Offline (100% Uptime Fallback):** Capa de respaldo estático en `src/data/` (`blogFallback.js`, `experienceFallback.js`) que garantiza que el blog y la trayectoria profesional siempre se rendericen incluso sin conexión o si el servicio en la nube entra en mantenimiento.
- **Internacionalización (i18n):** Soporte bilingüe completo **Español (`es`) / Inglés (`en`)** con `i18next` y localización dinámica de trayectoria profesional, proyectos y CV.

---

## Estructura del Repositorio

```text
My_website_imaforbes/
├── .gitignore                          # Protección global de variables de entorno, cachés y código legacy
├── README.md                           # Documentación general del proyecto
└── Imaforbes_astro/                    # Aplicación principal
    ├── .env.example                    # Plantilla de variables de entorno de Supabase
    ├── astro.config.mjs                # Configuración de Astro, integraciones y prefetching
    ├── package.json                    # Dependencias y scripts de construcción
    ├── tailwind.config.mjs             # Configuración de Tailwind CSS
    ├── docs/
    │   ├── ARCHITECTURE_AND_AUDIT.md   # Reporte técnico de auditoría, seguridad y benchmarks
    │   └── supabase_schema_and_rls.sql # Script SQL consolidado (Tablas, RPCs y políticas RLS)
    ├── public/
    │   ├── .htaccess                   # Cabeceras HTTP de seguridad, compresión GZIP y caché
    │   ├── img/                        # Activos gráficos del portafolio en formato WebP
    │   ├── resources/                  # Currículum Vitae descargable en PDF (ES y EN)
    │   └── uploads/images/             # Fotografías optimizadas de las publicaciones del blog
    └── src/
        ├── Locales/                    # Traducciones ES / EN (translation.json)
        ├── components/                 # Header, Footer, CvModal, ProtectedImage, ErrorBoundary, etc.
        ├── contexts/                   # SettingsContext (Tema Oscuro/Claro e Idioma sincronizados)
        ├── data/                       # Datos de respaldo de alta disponibilidad
        ├── hooks/                      # useApi (datos y contacto) y useAdminAuth (protección JWT)
        ├── layouts/                    # Layout.astro (SEO, Open Graph, JSON-LD, anti-FOUC)
        ├── pages/                      # Rutas Astro (/, /about, /trajectory, /projects, /blog, /contact, /cv, /login, /admin/*)
        ├── pages_react/                # Vistas completas en React 19 (públicas y panel de administración)
        ├── services/                   # Cliente Supabase (supabase.js) y API unificada (api.js)
        ├── styles/                     # Sistema de diseño editorial e interfaz tipo Substack (index.css)
        └── utils/                      # Validación bilingüe, moderación anti-spam y localización
```

---

## Requisitos e Instalación Local

### 1. Prerrequisitos
- **Node.js** `>= 20.x` y **npm** `>= 10.x`
- Proyecto activo en **Supabase** (opcional para desarrollo visual gracias a la capa de fallback estático)

### 2. Configuración de Variables de Entorno
Copia el archivo `.env.example` a `.env` dentro de `Imaforbes_astro/`:

```bash
cd Imaforbes_astro
cp .env.example .env
```

Edita `.env` con las credenciales públicas (`anon`) de tu proyecto en Supabase:

```env
PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
PUBLIC_SUPABASE_ANON_KEY=tu-llave-publica-anon
```

### 3. Ejecución en Modo Desarrollo

```bash
cd Imaforbes_astro
npm ci
npm run dev
```

El servidor de desarrollo estará disponible en `http://localhost:4321`.

### 4. Compilación para Producción

```bash
cd Imaforbes_astro
npm run build
npm run preview
```

---

## Seguridad y Base de Datos (Supabase)

El archivo [`Imaforbes_astro/docs/supabase_schema_and_rls.sql`](Imaforbes_astro/docs/supabase_schema_and_rls.sql) contiene toda la configuración de seguridad de la base de datos:

- **Row Level Security (RLS):**
  - `blog_posts` y `work_experiences`: Los visitantes anónimos (`anon`) solo pueden consultar registros con `status = 'published'`. La creación, edición y eliminación están restringidas a usuarios autenticados (`authenticated`).
  - `datos` (Mensajes de Contacto): Los visitantes anónimos solo tienen permiso `INSERT` (con validación de longitud, sanitización XSS, honeypot y rate-limiting de máximo 3 mensajes cada 10 minutos). Solo el administrador autenticado puede leer o eliminar mensajes.
  - `blog_views` y `blog_likes`: Se revoca el permiso `SELECT` al rol `anon` para proteger las direcciones IP y User-Agents de los lectores; los incrementos se realizan mediante funciones RPC `SECURITY DEFINER` (`increment_blog_view`, `increment_blog_like`, `decrement_blog_like`).
  - `blog_comments`: Moderación inteligente en cliente (`src/utils/commentModeration.js`) contra lenguaje inapropiado (ES/EN), enlaces de spam y flooding (cooldown de 30s), respaldada por restricciones `CHECK` y RLS en PostgreSQL.
- **Panel de Administración (`/login` y `/admin/*`):**
  - Todas las rutas administrativas (`/admin`, `/admin/blog`, `/admin/experiences`, `/admin/mensajes`, `/admin/stats`, `/admin/settings`) están protegidas por el guardia `useAdminAuth.js`, que verifica la sesión JWT activa contra Supabase Auth antes de renderizar la interfaz.

Para más detalles sobre la auditoría técnica y los benchmarks de rendimiento, consulta [`Imaforbes_astro/docs/ARCHITECTURE_AND_AUDIT.md`](Imaforbes_astro/docs/ARCHITECTURE_AND_AUDIT.md).
