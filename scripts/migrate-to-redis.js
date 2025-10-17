import fs from 'fs';
import { Redis } from '@upstash/redis';

// Usar las variables de entorno correctas que están en tu archivo .env
const redis = new Redis({
  url: process.env.KV_REST_API_URL || "",
  token: process.env.KV_REST_API_TOKEN || "",
});

async function migrateData() {
  try {
    // Leer data.json
    const data = JSON.parse(fs.readFileSync('./data.json', 'utf-8'));
    
    console.log("Datos leídos de data.json:", Object.keys(data));
    
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

// Mostrar las variables de entorno disponibles (sin mostrar valores completos por seguridad)
console.log("Variables de entorno disponibles:");
if (process.env.KV_REST_API_URL) console.log("KV_REST_API_URL: ✓");
if (process.env.KV_REST_API_TOKEN) console.log("KV_REST_API_TOKEN: ✓");

migrateData();
