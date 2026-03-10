# Guía de Despliegue - Sistema de Experiencias Laborales

## Archivos Nuevos a Subir a Hostinger

### 1. Backend (API) - `/api_db_portfolio/`

#### Archivo Nuevo:
- ✅ **`api/experiences.php`** - Nuevo endpoint API para gestionar experiencias laborales

#### Archivos Modificados (ya deberían estar actualizados):
- `config/response.php` - Ya contiene la clase `InputValidator` (no necesita cambios)
- `auth/session.php` - Ya existe (no necesita cambios)

### 2. Frontend (React) - `/my-portfolio-react/`

#### Archivos Nuevos:
- ✅ **`src/pages/AdminExperiences.jsx`** - Nueva página de administración de experiencias

#### Archivos Modificados (deben actualizarse):
- ✅ `src/config/api.js` - Agregado endpoint `EXPERIENCES`
- ✅ `src/services/api.js` - Agregados métodos `experiences.getAll()`, `experiences.create()`, `experiences.update()`, `experiences.delete()`
- ✅ `src/App.jsx` - Agregada ruta `/admin/experiences` y lazy loading
- ✅ `src/pages/Dashboard.jsx` - Agregado enlace a "Experiencias" en el dashboard
- ✅ `src/pages/AboutPage.jsx` - Modificado para obtener experiencias desde la API

### 3. Base de Datos

#### Migración SQL:
- ✅ **`migrations/create_experiences_table.sql`** - Script para crear la tabla `work_experiences`

---

## Pasos para Desplegar en Hostinger

### Paso 1: Subir Archivos Backend

1. **Subir el nuevo archivo API:**
   ```
   api_db_portfolio/api/experiences.php
   ```
   → Subir a: `tu-dominio.com/api_db/api/experiences.php`

2. **Verificar que los archivos de configuración estén actualizados:**
   - `api_db_portfolio/config/response.php` (ya debería estar)
   - `api_db_portfolio/auth/session.php` (ya debería estar)

### Paso 2: Crear la Tabla en la Base de Datos

1. **Accede a phpMyAdmin en Hostinger**

2. **Selecciona tu base de datos** (ej: `u179926833_portfolio`)

3. **Ve a la pestaña "SQL"**

4. **Ejecuta el siguiente SQL:**
   ```sql
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

5. **Verifica que la tabla se creó correctamente:**
   ```sql
   SHOW TABLES LIKE 'work_experiences';
   DESCRIBE work_experiences;
   ```

### Paso 3: Construir y Subir Frontend

1. **Construir para producción:**
   ```bash
   cd my-portfolio-react
   npm run build
   ```

2. **Subir los archivos del build:**
   - Sube todo el contenido de la carpeta `dist/` a tu servidor
   - Asegúrate de incluir:
     - `index.html`
     - `assets/` (todos los archivos JS, CSS, imágenes)
     - `.htaccess` (si existe)

3. **Archivos específicos nuevos/modificados a verificar:**
   - `assets/js/[hash]-[name].js` (contendrá AdminExperiences.jsx compilado)
   - Los archivos modificados estarán en los bundles compilados

### Paso 4: Verificar Funcionamiento

1. **Verifica que la API funciona:**
   - Abre: `https://www.imaforbes.com/api_db/api/experiences.php`
   - Deberías ver una respuesta JSON con `{"success":true,"data":[],...}`

2. **Verifica el dashboard:**
   - Inicia sesión en: `https://www.imaforbes.com/admin`
   - Deberías ver la nueva tarjeta "Experiencias"

3. **Prueba crear una experiencia:**
   - Haz clic en "Experiencias"
   - Crea una nueva experiencia de prueba
   - Verifica que aparece en la página About (`/about`)

---

## Resumen de Archivos

### Archivos Nuevos (3):
1. `api_db_portfolio/api/experiences.php`
2. `my-portfolio-react/src/pages/AdminExperiences.jsx`
3. `api_db_portfolio/migrations/create_experiences_table.sql` (solo para referencia)

### Archivos Modificados (5):
1. `my-portfolio-react/src/config/api.js`
2. `my-portfolio-react/src/services/api.js`
3. `my-portfolio-react/src/App.jsx`
4. `my-portfolio-react/src/pages/Dashboard.jsx`
5. `my-portfolio-react/src/pages/AboutPage.jsx`

---

## Notas Importantes

1. **Base de Datos:** Asegúrate de ejecutar el SQL antes de probar la funcionalidad
2. **CORS:** El archivo `experiences.php` ya incluye la configuración de CORS para producción
3. **Autenticación:** Las operaciones de escritura (POST, PUT, DELETE) requieren autenticación
4. **Build:** Siempre ejecuta `npm run build` antes de subir cambios del frontend
5. **Cache:** Después de subir, limpia la caché del navegador (Ctrl+Shift+R)

---

## Solución de Problemas

### Si la API retorna error 500:
- Verifica que la tabla `work_experiences` existe
- Revisa los logs de error de PHP en Hostinger
- Verifica que los archivos de configuración están correctos

### Si no aparece la opción "Experiencias" en el dashboard:
- Verifica que `AdminExperiences.jsx` está en el build
- Verifica que `App.jsx` tiene la ruta `/admin/experiences`
- Limpia la caché del navegador

### Si las experiencias no aparecen en la página About:
- Verifica que la API retorna datos correctamente
- Abre la consola del navegador (F12) y revisa errores
- Verifica que las experiencias tienen `status = 'published'`

