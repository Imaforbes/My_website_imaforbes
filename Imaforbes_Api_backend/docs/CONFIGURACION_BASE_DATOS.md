# 🔧 Configuración de Base de Datos - Hostinger

## ⚠️ IMPORTANTE

Este proyecto **NO** usa conexiones locales hardcodeadas. Todas las credenciales deben estar en el archivo `.env`.

## 📋 Pasos para Configurar

### 1. Crear archivo `.env`

En la raíz de `api_db_portfolio/`, crea un archivo llamado `.env` (sin el `.example`).

### 2. Copiar el contenido de `.env.example`

Copia el contenido de `.env.example` y actualiza con tus credenciales de Hostinger:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASS=your_db_password
DB_NAME=your_db_name

# Email Configuration (SMTP)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USERNAME=your_email@your-domain.com
SMTP_PASSWORD=your_email_password
SMTP_SECURE=tls

# Email Settings
FROM_EMAIL=your_email@your-domain.com
FROM_NAME=IMAFORBES Portfolio
REPLY_TO_EMAIL=your_email@your-domain.com
```

### 3. Verificar que el archivo esté protegido

**NUNCA** subas el archivo `.env` a Git. Está en `.gitignore`.

### 4. Subir a Hostinger

1. Sube el archivo `.env` a: `public_html/api_db/.env`
2. Asegúrate de que los permisos sean correctos (644)

## 🔍 Verificar Configuración

Si la conexión falla, el sistema mostrará un error claro indicando qué variable falta:

- `DB_HOST not configured` → Falta `DB_HOST` en `.env`
- `DB_USER not configured` → Falta `DB_USER` en `.env`
- `DB_PASS not configured` → Falta `DB_PASS` en `.env`
- `DB_NAME not configured` → Falta `DB_NAME` en `.env`

## 🛠️ Estructura de Archivos

```
api_db_portfolio/
├── .env                    ← CREAR ESTE ARCHIVO (no subir a Git)
├── .env.example           ← Plantilla (sí subir a Git)
├── config/
│   └── database.php       ← Lee las variables de .env
└── ...
```

## ✅ Después de Configurar

1. Verifica que el archivo `.env` existe
2. Verifica que tiene todas las variables necesarias
3. Prueba la conexión visitando cualquier endpoint de la API
4. Revisa los logs de error si hay problemas

## 🔒 Seguridad

- ✅ El archivo `.env` está en `.gitignore`
- ✅ Las credenciales NO están hardcodeadas en el código
- ✅ Los errores no exponen credenciales completas
- ✅ Solo se leen variables de entorno

---

**Nota:** Si ves errores de conexión, verifica primero que el archivo `.env` existe y tiene las credenciales correctas de Hostinger.

