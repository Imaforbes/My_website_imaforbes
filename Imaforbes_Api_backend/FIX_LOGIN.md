# 🔧 Fix Login CORS Error

## ✅ Problema Resuelto

El frontend estaba intentando hacer login a `/login.php` pero el endpoint correcto es `/api/auth/login.php`.

## 🔧 Cambios Realizados

### 1. **Frontend Actualizado**
- ✅ `src/config/api.js` - Endpoints actualizados:
  - `LOGIN: '/api/auth/login.php'`
  - `LOGOUT: '/api/auth/logout.php'`
  - `VERIFY: '/api/auth/verify.php'`

- ✅ `src/pages/LoginPage.jsx` - Ahora usa `API_CONFIG.ENDPOINTS.LOGIN`
- ✅ `src/services/api.js` - Usa `API_CONFIG.ENDPOINTS.VERIFY`

### 2. **Backend - Archivos Alias Creados**
- ✅ `login.php` (raíz) - Redirige a `api/auth/login.php` con CORS
- ✅ `logout.php` (raíz) - Redirige a `api/auth/logout.php` con CORS

## 📤 Archivos a Subir

### Frontend (Rebuild necesario):
```
my-portfolio-react/
├── src/
│   ├── config/
│   │   └── api.js          ← ACTUALIZAR
│   ├── pages/
│   │   └── LoginPage.jsx   ← ACTUALIZAR
│   └── services/
│       └── api.js          ← ACTUALIZAR
```

**Después de actualizar:**
```bash
npm run build
# Subir la carpeta dist/ a Hostinger
```

### Backend (Subir directamente):
```
api_db/
├── login.php               ← NUEVO (alias con CORS)
└── logout.php              ← NUEVO (alias con CORS)
```

## ✅ Verificación

1. **Rebuild frontend:**
   ```bash
   cd my-portfolio-react
   npm run build
   ```

2. **Subir archivos a Hostinger:**
   - Backend: `login.php` y `logout.php` a `public_html/api_db/`
   - Frontend: Carpeta `dist/` actualizada

3. **Probar login:**
   - Ve a `https://imaforbes.com/login`
   - Intenta hacer login
   - No debe aparecer error CORS

## 🎯 Resultado

- ✅ Login funciona correctamente
- ✅ Headers CORS configurados
- ✅ Compatibilidad hacia atrás mantenida (también funciona `/login.php`)

---

**NOTA:** Después de subir, recarga la página con Ctrl+Shift+R para limpiar cache del navegador.

