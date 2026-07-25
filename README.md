# Imaforbes Website (Portfolio v2.0)

**IMAFORBES** web portfolio project, updated to its latest version with a performance-oriented architecture (Astro) and a robust PHP backend.

## Current Architecture (Updated!)

The project is mainly divided into two active folders:

- **`Imaforbes_astro/` (Active Frontend 🚀)**: The new frontend built with **Astro**, **React**, **Tailwind CSS**, and **Framer Motion**. This folder completely replaces the previous SPA (Single Page Application). By using Astro, the site now supports static rendering and significantly improves SEO and performance. All visual modifications, pages, and components are handled here.
  
- **`api_db/` (Active Backend ⚙️)**: The **PHP** backend (REST API). It manages connections to the MySQL database, processing of contact emails (with Anti-Spam measures), session control, blog CRUD operations, image uploads, etc.

*Note: The `Imaforbes_frontend/` and `Imaforbes_Api_backend/` folders correspond to the old versions of the application and are kept only as a backup (historical files).*

## How the Connection Works (Frontend ↔ Backend)

- The **frontend (Astro)** consumes JSON data from the **API (PHP)** located at `api_db/api/`.
- **In the local development environment**, Astro uses a **Vite proxy** (configured in `Imaforbes_astro/astro.config.mjs`) to avoid CORS issues:
  - All requests to `/api` are internally redirected to `http://localhost:8888/My_website_imaforbes/api_db`.
  - Requests to `/uploads` are redirected to `http://localhost:8888/My_website_imaforbes/api_db/uploads`.

## System Requirements

- **Node.js + npm** (to run and build the Astro frontend).
- **PHP** (using **MAMP** on macOS is recommended).
- **MySQL** (Local database configured on port 8889 by default in MAMP).

## Run Locally (Development Mode)

### 1) Backend Environment (MAMP)

1. Start the Apache and MySQL servers in the **MAMP** application.
2. Ensure that the main `My_website_imaforbes` folder is located inside the `/Applications/MAMP/htdocs/` path.
3. Your MySQL database must have the necessary structure (use the `portfolio.sql` file to import the tables to your local manager, e.g., phpMyAdmin).
4. The backend will be available at `http://localhost:8888/My_website_imaforbes/api_db/`.

### 2) Frontend Environment (Astro)

Open a terminal, navigate to the active frontend folder, and start the server:

```bash
cd /Applications/MAMP/htdocs/My_website_imaforbes/Imaforbes_astro
npm install
npm run dev
```

The frontend site will load in your browser, usually at the address `http://localhost:4321`.

## Frontend Folder Overview (`Imaforbes_astro/`)

- **`src/pages/`**: Native Astro routes (`.astro`). Responsible for the main layout and SEO.
- **`src/pages_react/`**: Complex page components built in React (`.jsx`) that require dynamic state (useState, useEffect, Framer Motion animations).
- **`src/components/`**: Reusable visual components (Header, Footer, Cards, Modals).
- **`src/services/` and `src/hooks/`**: API connection logic (`api.js`) and Custom Hooks to manage global state.
- **`public/`**: Static assets (favicons, local fonts, etc.).
- **`astro.config.mjs`**: Crucial configuration file where proxy rules and Astro integrations (React, Tailwind) are declared.

## Backend Folder Overview (`api_db/`)

- **`api/`**: `.php` files publicly exposed as endpoints (`blog.php`, `contact.php`, `projects.php`).
- **`config/`**: Database connection files (`database.php`) and response management (`response.php`).
- **`utils/`**: Critical backend tools such as CSRF Protection, Rate Limiting (against SPAM), and sending emails via SMTP (`EmailSender.php`).
- **`uploads/images/`**: Directory where images uploaded via the API are physically stored (e.g., blog thumbnails).

## Deployment & Hosting (Hostinger / Apache)

For production deployment, the frontend must be built statically:
1. Run `npm run build` inside `Imaforbes_astro/`.
2. Upload the contents of the newly generated `dist/` folder to the `public_html` directory of your hosting provider (e.g., Hostinger).
3. **Caching Optimization:** The project includes a highly optimized `.htaccess` file (located in `public/.htaccess` which gets copied to `dist/`). This file is configured to:
   - Provide GZIP/Brotli compression.
   - Set aggressive caching for static assets (JS, CSS, Images) for up to a year.
   - Force `no-cache` and `must-revalidate` for HTML files. This prevents 404 errors during new deployments by ensuring browsers always fetch the latest `.html` file that references the newest JavaScript and CSS chunks.

## Security 🔒

- **Sensitive Files**: Avoid publicly sharing the `api_db/config/database.php` file and any SMTP server configuration.
- The contact API includes rate limiting by IP, preventing more than 3 requests in 10 minutes to combat spambots.

---
*Documentation generated and updated to reflect the successful migration to the Astro Framework.*
