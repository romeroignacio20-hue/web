# Instrucciones para configurar Upstash Redis

Para solucionar el problema de los clicks y la persistencia de datos en Vercel, hemos implementado una solución usando Upstash Redis, que es una base de datos Redis serverless con un plan gratuito generoso. Sigue estos pasos para configurarlo correctamente:

## 1. Instalar la dependencia de Upstash Redis

```bash
npm install @upstash/redis
```

## 2. Configurar Upstash Redis en tu proyecto

1. Ve al [Dashboard de Vercel](https://vercel.com)
2. Selecciona tu proyecto
3. Ve a la pestaña "Integrations"
4. Busca "Upstash Redis" y haz clic en "Add Integration"
5. Sigue las instrucciones para crear una base de datos Redis
6. Una vez creada, Vercel añadirá automáticamente las variables de entorno necesarias a tu proyecto

## 3. Variables de entorno necesarias

Asegúrate de que las siguientes variables de entorno estén configuradas en tu proyecto de Vercel:

```
KV_URL=
KV_REST_API_READ_ONLY_TOKEN=""
REDIS_URL=""
KV_REST_API_TOKEN=""
KV_REST_API_URL=""
```

## 4. Configuración local (desarrollo)

Para desarrollo local, crea un archivo `.env.local` en la raíz del proyecto con las variables anteriores:

```
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
contrasena=admin123
```

## 5. Migrar datos existentes (opcional)

Si ya tienes datos en `data.json` y quieres migrarlos a Upstash Redis, puedes crear un script de migración:

```javascript
// scripts/migrate-to-redis.js
const fs = require('fs');
const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function migrateData() {
  try {
    // Leer data.json
    const data = JSON.parse(fs.readFileSync('./data.json', 'utf-8'));
    
    // Migrar datos de Hero
    if (data.Hero) {
      await redis.set('stats-Hero', data.Hero);
      console.log('Datos de Hero migrados correctamente');
    }
    
    // Migrar datos de GoldenBot
    if (data.GoldenBot) {
      await redis.set('stats-GoldenBot', data.GoldenBot);
      console.log('Datos de GoldenBot migrados correctamente');
    }
    
    // Migrar configuración
    if (data.config) {
      await redis.set('site-config', data.config);
      console.log('Configuración migrada correctamente');
    }
    
    console.log('Migración completada');
  } catch (error) {
    console.error('Error en la migración:', error);
  }
}

migrateData();
```

Ejecuta el script con:

```bash
node -r dotenv/config scripts/migrate-to-redis.js
```

## Notas importantes

1. **Cambios en las APIs**: Hemos creado nuevas APIs que usan Upstash Redis:
   - `/api/clicks-redis` para los clicks
   - `/api/config-redis` para la configuración

2. **Componentes actualizados**: Todos los componentes han sido actualizados para usar las nuevas APIs.

3. **Manejo de errores mejorado**: Se ha mejorado el manejo de errores en todas las APIs.

4. **Conteo de clicks**: Ahora cada clic se registra correctamente, incluso si viene del mismo usuario.

Con esta implementación, los datos persistirán entre despliegues en Vercel y los clicks funcionarán correctamente.
