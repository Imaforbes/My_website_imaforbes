# Configuración local portable

Este backend puede vivir en cualquier directorio y no requiere MAMP ni una
carpeta `htdocs` específica.

## Requisitos

- PHP 8+ con extensiones MySQL requeridas por el proyecto.
- MySQL o MariaDB, preferentemente en Docker para desarrollo local.
- Un archivo `.env` local basado en `.env.example`; nunca se versiona.

## Base de datos

1. Crea una base local usando los datos de tu `.env`.
2. Importa el esquema `portfolio.sql` con las mismas credenciales.
3. Ejecuta las migraciones o scripts de `api_db/` desde la raíz del backend.

## Ejecución

Configura un servidor PHP o proxy inverso para exponer el directorio `api_db/`.
El frontend debe consumir la URL del backend a través de su variable de entorno,
nunca mediante una ruta absoluta del equipo de desarrollo.

En Windows, crea las mismas variables en el archivo `.env` o en el servicio que
ejecute PHP. En Mac, Docker puede proporcionar PHP y MySQL sin modificar el
sistema operativo.
