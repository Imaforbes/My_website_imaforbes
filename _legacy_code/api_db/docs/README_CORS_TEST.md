# Instrucciones para Probar CORS

## URLs Correctas para Probar:

### 1. Test del Servidor (Raíz):
```
http://localhost:8888/api_db_portfolio/test_server.php
```

### 2. Test Minimal CORS (API):
```
http://localhost:8888/api_db_portfolio/api/test_minimal.php
```

### 3. Test Simple CORS (API):
```
http://localhost:8888/api_db_portfolio/api/test_simple_cors.php
```

### 4. API Real - Blog:
```
http://localhost:8888/api_db_portfolio/api/blog.php?status=published
```

### 5. API Real - Settings:
```
http://localhost:8888/api_db_portfolio/api/settings.php
```

## Verificar que MAMP está corriendo:

1. Abre MAMP
2. Verifica que Apache está en puerto **8888**
3. Verifica que MySQL está en puerto **8889**
4. Click en "Start Servers"

## Si sigue dando "Not Found":

1. Verifica que el servidor PHP tenga como raíz pública el directorio correcto
   del proyecto o que el proxy apunte al proceso PHP configurado.

2. Verifica que los archivos estén dentro de la copia Git activa de `api_db/`.

3. Prueba acceder directamente desde el navegador:
   - La URL local configurada por tu servidor, por ejemplo
     `http://127.0.0.1:8080/test_server.php`

## Verificar CORS en el Navegador:

1. Abre DevTools (F12)
2. Ve a la pestaña "Network"
3. Intenta hacer una petición
4. Click en la petición
5. Ve a "Headers" → "Response Headers"
6. Debe mostrar: `Access-Control-Allow-Origin: http://localhost:5173`
