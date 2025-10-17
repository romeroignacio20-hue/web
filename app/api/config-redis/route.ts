import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { siteConfig } from "@/config/site";

// Interfaz para la configuración del sitio
interface SiteConfig {
  whatsappNumbers: {
    descartableHero: string[];
    principalGolden: string[];
  };
}

// Crear cliente Redis
const redis = new Redis({
  url: process.env.KV_REST_API_URL || "",
  token: process.env.KV_REST_API_TOKEN || "",
});

export async function GET() {
  try {
    // Intentar obtener la configuración de Redis
    const config = await redis.get<SiteConfig>("site-config");
    
    // Si hay configuración en Redis, usarla
    if (config) {
      return NextResponse.json(config);
    }
    
    // Si no hay configuración en Redis, usar la importada directamente
    return NextResponse.json(siteConfig);
  } catch (error) {
    console.error('Error al obtener la configuración:', error);
    return NextResponse.json({ error: 'Error al obtener la configuración' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const newConfig = await request.json();
    
    // Guardar la configuración en Redis
    await redis.set("site-config", newConfig);
    
    return NextResponse.json({ success: true, message: 'Configuración actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar la configuración:', error);
    return NextResponse.json({ success: false, error: 'Error al actualizar la configuración' }, { status: 500 });
  }
}
