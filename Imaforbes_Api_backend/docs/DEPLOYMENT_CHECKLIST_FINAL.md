# ✅ Checklist Final de Despliegue - Experiencias Laborales

## 📋 Resumen de Cambios

### Archivos Nuevos Creados:
1. ✅ `api/experiences.php` - Endpoint API para experiencias
2. ✅ `src/pages/AdminExperiences.jsx` - Página de administración
3. ✅ `migrations/create_experiences_table.sql` - Script SQL

### Archivos Modificados:
1. ✅ `src/config/api.js` - Agregado endpoint EXPERIENCES
2. ✅ `src/services/api.js` - Agregados métodos de API
3. ✅ `src/App.jsx` - Agregada ruta /admin/experiences
4. ✅ `src/pages/Dashboard.jsx` - Agregado enlace a Experiencias
5. ✅ `src/pages/AboutPage.jsx` - Modificado para obtener desde API

### Archivos Organizados:
- ✅ Todos los archivos .md movidos a `docs/`
- ✅ Todos los archivos .sql movidos a `migrations/`
- ✅ Archivos .DS_Store eliminados

---

## 🚀 Pasos para Desplegar en Hostinger

### 1. Base de Datos (CRÍTICO - Hacer primero)
```sql
-- Ejecutar en phpMyAdmin de Hostinger
CREATE TABLE IF NOT EXISTS work_experiences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    company VARCHAR(200) NOT NULL,
    location VARCHAR(200),
    period VARCHAR(100) NOT NULL,
    description TEXT,
    responsibilities JSON,
    technologies JSON,
    sort_order INT DEFAULT 0,
    status ENUM('draft', 'published', 'archived') DEFAULT 'published',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. Backend - Subir Archivo API
- **Archivo:** `api_db_portfolio/api/experiences.php`
- **Destino:** `tu-dominio.com/api_db/api/experiences.php`

### 3. Frontend - Construir y Subir
```bash
cd my-portfolio-react
npm run build
```
- Subir todo el contenido de `dist/` a tu servidor

### 4. Verificar
1. ✅ API funciona: `https://www.imaforbes.com/api_db/api/experiences.php`
2. ✅ Dashboard muestra "Experiencias"
3. ✅ Puedes crear/editar experiencias
4. ✅ Experiencias aparecen en `/about`

---

## 📁 Estructura de Archivos Organizada

### Backend:
```
api_db_portfolio/
├── api/
│   └── experiences.php ⭐ NUEVO
├── migrations/
│   ├── create_experiences_table.sql ⭐ NUEVO
│   └── ... (otros SQL)
└── docs/
    ├── DEPLOYMENT_GUIDE_EXPERIENCES.md
    └── ... (otros docs)
```

### Frontend:
```
my-portfolio-react/
├── src/
│   └── pages/
│       └── AdminExperiences.jsx ⭐ NUEVO
└── docs/
    └── ... (todos los .md organizados)
```

---

## ⚠️ Archivos que NO Subir a Producción

- `node_modules/` (ya en .gitignore)
- `dist/` (se regenera con build)
- Archivos `.md` de documentación (opcional)
- `setup.php` (solo desarrollo)
- `.DS_Store` (archivos del sistema)

---

## ✅ Todo Listo para Desplegar

Todos los archivos están organizados y listos. Solo necesitas:
1. Ejecutar el SQL
2. Subir `experiences.php`
3. Hacer build y subir `dist/`

¡Listo! 🎉

