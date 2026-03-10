# 🛠️ Configuración para Desarrollo Local

## ✅ Configuración Automática

El sistema ahora detecta automáticamente si estás en **local** o en **producción (Hostinger)**:

### 🔍 Detección Automática

- **LOCAL**: Si la URL contiene `localhost`, `127.0.0.1`, `8888`, o `8889`
- **PRODUCCIÓN**: Si la URL contiene `imaforbes.com` o cualquier otra URL

## 🏠 Desarrollo Local

### Configuración por Defecto (MAMP)

Si estás usando **MAMP**, el sistema usa estos valores automáticamente:

```php
Host: 127.0.0.1
Port: 8889
User: root
Password: root
Database: portfolio
```

**NO necesitas crear un archivo `.env` para desarrollo local.**

### Personalizar Configuración Local

Si tu configuración local es diferente, crea un archivo `.env` en la raíz de `api_db_portfolio/`:

```env
DB_HOST=127.0.0.1
DB_PORT=8889
DB_USER=root
DB_PASS=tu_password
DB_NAME=portfolio
```

### Para XAMPP

Si usas **XAMPP**, la contraseña suele estar vacía:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=portfolio
```

## 🌐 Producción (Hostinger)

### Configuración Requerida

En **Hostinger**, DEBES crear un archivo `.env` con las credenciales de producción:

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

## 📝 Archivos de Ejemplo

- `.env.local.example` - Ejemplo para desarrollo local
- `.env.production.example` - Ejemplo para producción (Hostinger)

## ✅ Cómo Funciona

1. **En Local**: 
   - El sistema detecta que estás en `localhost:8888`
   - Usa credenciales locales automáticamente
   - Puedes crear `.env` solo si quieres personalizar

2. **En Producción**:
   - El sistema detecta que estás en `imaforbes.com`
   - **REQUIERE** archivo `.env` con credenciales de Hostinger
   - Lanza error si falta el `.env`

## 🚀 Flujo de Trabajo

1. **Desarrollo Local**:
   ```bash
   # No necesitas hacer nada, funciona automáticamente
   # O crea .env si necesitas personalizar
   ```

2. **Deploy a Producción**:
   ```bash
   # Sube el archivo .env con credenciales de Hostinger
   # El sistema detectará automáticamente que es producción
   ```

## ⚠️ Notas Importantes

- **NO** subas el archivo `.env` local a producción
- **NO** subas el archivo `.env` de producción a Git
- El sistema detecta automáticamente el entorno
- Las credenciales de Hostinger están comentadas en el código (seguridad)

---

**¡Ahora puedes desarrollar localmente sin configurar nada!** 🎉

