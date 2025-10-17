import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { siteConfig } from '@/config/site';

// Ruta al archivo de configuración
const configFilePath = path.join(process.cwd(), 'config', 'site.ts');

// Ruta al archivo JSON para persistencia
const filePath = path.resolve("./data.json");

// Función para leer datos del archivo de configuración
const readConfig = () => {
    try {
        // Verificar si el archivo existe, si no, crearlo con un objeto vacío
        if (!fs.existsSync(configFilePath)) {
            fs.writeFileSync(configFilePath, 'export const siteConfig = {};', "utf-8");
        }
        const configContent = fs.readFileSync(configFilePath, "utf-8");
        // Extraer la configuración del archivo
        const configMatch = configContent.match(/export const siteConfig = ({[\s\S]*?});/);
        if (configMatch) {
            return JSON.parse(configMatch[1]);
        } else {
            return {};
        }
    } catch (error) {
        console.error("Error al leer configuración:", error);
        return {};
    }
};

// Función para escribir datos en el archivo de configuración
const writeConfig = (data: object) => {
    try {
        // Leer el archivo de configuración actual
        const configContent = fs.readFileSync(configFilePath, 'utf-8');
        
        // Convertir el objeto de configuración a una cadena formateada
        const configString = JSON.stringify(data, null, 2)
          .replace(/"([^"]+)":/g, '$1:') // Eliminar comillas de las claves
          .replace(/"(https?:\/\/[^"]+)"/g, '"$1"') // Mantener comillas en URLs
          .replace(/"/g, '\''); // Cambiar comillas dobles por simples
        
        // Reemplazar la configuración en el archivo
        const newConfigContent = configContent.replace(
          /export const siteConfig = ({[\s\S]*?});/,
          `export const siteConfig = ${configString};`
        );
        
        // Escribir el nuevo contenido al archivo
        fs.writeFileSync(configFilePath, newConfigContent, 'utf-8');
    } catch (error) {
        console.error("Error al escribir configuración:", error);
    }
};

// Función para leer datos del archivo JSON
const readData = () => {
    try {
        // Verificar si el archivo existe, si no, crearlo con un objeto vacío
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify({}, null, 2), "utf-8");
        }
        const jsonData = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(jsonData);
    } catch (error) {
        console.error("Error al leer datos:", error);
        return {};
    }
};

// Función para escribir datos en el archivo JSON
const writeData = (data: object) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    } catch (error) {
        console.error("Error al escribir datos:", error);
    }
};

export async function GET() {
  try {
    // Primero intentar leer la configuración de data.json
    const data = readData();
    if (data.config) {
      return NextResponse.json(data.config);
    }
    
    // Si no hay configuración en data.json, usar la importada
    const config = readConfig();
    if (Object.keys(config).length > 0) {
      return NextResponse.json(config);
    }
    
    // Si todo falla, usar la configuración importada directamente
    return NextResponse.json(siteConfig);
  } catch (error) {
    console.error('Error al obtener la configuración:', error);
    return NextResponse.json({ error: 'Error al obtener la configuración' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const newConfig = await request.json();
    
    // Guardar en el archivo de configuración
    writeConfig(newConfig);
    
    // Guardar también en data.json para que esté disponible para la API de clicks
    const data = readData();
    data.config = newConfig;
    writeData(data);
    
    return NextResponse.json({ success: true, message: 'Configuración actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar la configuración:', error);
    // LOG EXTRA: mostrar el error exacto que se enviará al frontend
    if (error instanceof Error) {
      console.error('Mensaje enviado al frontend:', error.message);
    } else {
      console.error('Mensaje enviado al frontend:', String(error));
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
