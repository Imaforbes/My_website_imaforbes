# 🔧 INSTRUCCIONES PARA ARREGLAR CORS EN HOSTINGER

## ⚠️ PROBLEMA ACTUAL

Los errores CORS indican que los headers **NO se están enviando** desde el servidor. Esto significa que:

1. Los archivos en Hostinger NO están actualizados
2. O hay un error PHP que impide enviar headers

## ✅ SOLUCIÓN PASO A PASO

### Paso 1: Subir Archivos Actualizados

**SUBIR ESTOS ARCHIVOS ACTUALIZADOS:**

```
api_db/
├── api/
│   ├── .htaccess              ← NUEVO (para backup CORS)
│   ├── settings.php           ← ACTUALIZAR
│   ├── blog.php               ← ACTUALIZAR
│   ├── test_headers.php       ← NUEVO (para diagnóstico)
│   ├── auth/
│   │   ├── login.php          ← ACTUALIZAR
│   │   └── logout.php         ← ACTUALIZAR
│   ├── contact.php            ← VERIFICAR
│   ├── messages.php           ← VERIFICAR
│   └── projects.php           ← VERIFICAR
├── config/
│   ├── database.php           ← ACTUALIZAR (maneja puerto en host)
│   └── response.php           ← VERIFICAR
└── .env                       ← CREAR/ACTUALIZAR con estas credenciales
```

### Paso 2: Crear/Actualizar archivo `.env`

En `public_html/api_db/.env` (no en una subcarpeta), crear con:

```env
DB_HOST=127.0.0.1:3306
DB_PORT=3306
DB_USER=your_db_user
DB_PASS=your_db_password
DB_NAME=your_db_name

SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USERNAME=your_email@your-domain.com
SMTP_PASSWORD=your_email_password
SMTP_SECURE=tls

FROM_EMAIL=your_email@your-domain.com
FROM_NAME=IMAFORBES Portfolio
REPLY_TO_EMAIL=your_email@your-domain.com
```

**IMPORTANTE:**
- El archivo debe llamarse exactamente `.env` (con el punto al inicio)
- Debe estar en `public_html/api_db/.env`
- Permisos: 644

### Paso 3: Verificar Headers CORS

1. **Visita en navegador:**
   ```
   https://www.imaforbes.com/api_db/api/test_headers.php
   ```

2. **Deberías ver JSON con:**
   ```json
   {
     "success": true,
     "cors_configured": true,
     "cors_origin_set": "https://imaforbes.com"
   }
   ```

3. **Si NO funciona**, revisa:
   - ¿Hay algún error PHP en los logs?
   - ¿El archivo `test_headers.php` existe?
   - ¿Hay espacios o caracteres antes de `<?php`?

### Paso 4: Verificar en Network Tab

1. Abre DevTools (F12)
2. Ve a la pestaña **Network**
3. Intenta hacer una petición a `settings.php`
4. **Verifica:**
   - ¿Aparece el header `Access-Control-Allow-Origin`?
   - ¿Qué valor tiene?
   - ¿Hay algún error 500?

### Paso 5: Verificar Archivos PHP

**CRÍTICO:** Los archivos PHP NO deben tener:
- ❌ Espacios antes de `<?php`
- ❌ Caracteres BOM (Byte Order Mark)
- ❌ Saltos de línea antes de `<?php`

**Formato correcto:**
```php
<?php
// Primera línea debe ser <?php sin espacios antes
```

## 🔍 DIAGNÓSTICO

### Si sigue fallando:

1. **Revisa logs de error de Hostinger:**
   - Ve a cPanel → Error Logs
   - Busca errores recientes

2. **Prueba test_headers.php:**
   ```
   https://www.imaforbes.com/api_db/api/test_headers.php
   ```
   
   Si esto NO muestra headers CORS, hay un problema más profundo.

3. **Verifica que .htaccess esté activo:**
   - Algunos hosts bloquean `.htaccess` en subdirectorios
   - Verifica en cPanel si `mod_headers` está habilitado

## ✅ CHECKLIST FINAL

- [ ] Archivos PHP actualizados subidos
- [ ] Archivo `.env` creado con credenciales correctas
- [ ] Archivo `api/.htaccess` subido
- [ ] `test_headers.php` muestra headers CORS
- [ ] Network tab muestra `Access-Control-Allow-Origin` header
- [ ] No hay errores 500 en los logs

## 🚨 SI NADA FUNCIONA

Si después de todo esto sigue fallando:

1. **Verifica versión PHP:**
   - Hostinger debe tener PHP 7.4 o superior
   - Verifica en cPanel → Select PHP Version

2. **Verifica que mod_headers esté habilitado:**
   - Contacta soporte de Hostinger si es necesario

3. **Prueba sin .htaccess:**
   - Renombra `api/.htaccess` a `api/.htaccess.bak`
   - Verifica si funciona solo con headers PHP

---

**NOTA:** El problema más común es que los archivos en Hostinger NO están actualizados. Asegúrate de subir TODOS los archivos modificados.

