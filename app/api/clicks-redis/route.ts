import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { siteConfig } from "@/config/site";

// Crear cliente Redis
const redis = new Redis({
  url: process.env.KV_REST_API_URL || "",
  token: process.env.KV_REST_API_TOKEN || "",
});

// Tipos permitidos para las claves de numbers
type BusinessType = "Hero" | "GoldenBot" | "Fichas Ya";

// Interfaz para los datos de negocio
interface BusinessData {
  clickCount: number;
  uniqueUsers: string[];
  dailyClicks: Record<string, number>;
  currentNumber?: string;
}

// Interfaz para la configuración del sitio
interface SiteConfig {
  whatsappNumbers: {
    descartableHero: string[];
    principalGolden: string[];
  };
}

// Función para obtener los números de WhatsApp actuales
const getNumbers = async (): Promise<Record<BusinessType, string[]>> => {
    try {
        // Intentar obtener la configuración de Redis
        const config = await redis.get<SiteConfig>("site-config");
        
        // Si hay configuración en Redis, usarla
        if (config && config.whatsappNumbers) {
            return {
                Hero: config.whatsappNumbers.descartableHero || [],
                GoldenBot: config.whatsappNumbers.principalGolden || [],
                "Fichas Ya": config.whatsappNumbers.descartableHero || [],
            };
        }
    } catch (error) {
        console.error("Error al obtener números de WhatsApp:", error);
    }
    
    // Usar la configuración por defecto si no hay datos en Redis
    return {
        Hero: siteConfig.whatsappNumbers.descartableHero,
        GoldenBot: siteConfig.whatsappNumbers.principalGolden,
        "Fichas Ya": siteConfig.whatsappNumbers.descartableHero,
    };
};

// Nuevo endpoint para obtener clicks individuales
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const business = searchParams.get('business');
    const limit = parseInt(searchParams.get('limit') || '1000', 10);
    if (!business || !(business === "Hero" || business === "GoldenBot" || business === "Fichas Ya")) {
        return NextResponse.json({ error: "Negocio no válido" }, { status: 400 });
    }
    const clicksListKey = `clicks-${business}`;
    try {
        // Obtener clicks individuales
        const rawClicks = await redis.lrange(clicksListKey, 0, limit - 1);
        type ClickEvent = {
            userId: string;
            timestamp: number;
            business: string;
        };
        const clicks = rawClicks
            .map((item): ClickEvent | null => {
                if (typeof item === 'string') {
                    try {
                        return JSON.parse(item) as ClickEvent;
                    } catch {
                        return null;
                    }
                } else if (typeof item === 'object' && item !== null) {
                    return item as ClickEvent;
                } else {
                    return null;
                }
            })
            .filter((item): item is ClickEvent => !!item);

        // Obtener currentNumber (igual que en GET_STATS)
        const numbers = await getNumbers();
        const statsKey = `stats-${business}`;
        const businessData = await redis.get<BusinessData>(statsKey) || { 
            clickCount: 0, 
            uniqueUsers: [], 
            dailyClicks: {} 
        };
        const numberIndex = numbers[business as BusinessType].length > 0 
            ? businessData.clickCount % numbers[business as BusinessType].length 
            : 0;
        const currentNumber = numbers[business as BusinessType].length > 0 
            ? numbers[business as BusinessType][numberIndex]
            : "";

        return NextResponse.json({ clicks, currentNumber });
    } catch (error) {
        return NextResponse.json({ error: 'Error al obtener clicks', details: error }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        // Obtener los datos del cuerpo de la solicitud
        const body = await request.json();
        const { userId, business } = body;
        
        // Validación de entrada
        if (
            !userId ||
            !business ||
            typeof userId !== "string" ||
            typeof business !== "string" ||
            !(business === "Hero" || business === "GoldenBot" || business === "Fichas Ya")
        ) {
            return NextResponse.json({ error: "Datos inválidos o negocio no válido" }, { status: 400 });
        }
        
        const businessKey = business as BusinessType;
        
        // Obtener números actuales
        const numbers = await getNumbers();
        
        // Obtener datos actuales desde Redis
        const statsKey = `stats-${businessKey}`;
        const businessData = await redis.get<BusinessData>(statsKey) || { 
            clickCount: 0, 
            uniqueUsers: [], 
            dailyClicks: {} 
        };
        
        // Obtener la fecha actual en formato YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0];
        
        // Inicializar datos del día si no existen
        if (!businessData.dailyClicks) {
            businessData.dailyClicks = {};
        }
        
        if (!businessData.dailyClicks[today]) {
            businessData.dailyClicks[today] = 0;
        }
        
        // Incrementar siempre el contador de clicks
        businessData.clickCount = (businessData.clickCount || 0) + 1;
        
        // Incrementar el contador de clicks del día
        businessData.dailyClicks[today] = (businessData.dailyClicks[today] || 0) + 1;
        
        // Verificar usuario único (opcional, para estadísticas)
        const baseUserId = userId.split('_')[0]; // Extraer el ID base sin el timestamp
        if (!businessData.uniqueUsers) {
            businessData.uniqueUsers = [];
        }
        if (!businessData.uniqueUsers.includes(baseUserId)) {
            businessData.uniqueUsers.push(baseUserId);
        }
        
        // Asegurarse de que el índice no exceda el número de elementos en el array
        const numberIndex = numbers[businessKey].length > 0 
            ? businessData.clickCount % numbers[businessKey].length 
            : 0;
        
        // Usar el enlace tal como está, sin formatear
        const currentNumber = numbers[businessKey].length > 0 
            ? numbers[businessKey][numberIndex]
            : "";
        
        businessData.currentNumber = currentNumber;
        
        // Guardar el click individual en una lista para analítica avanzada
        // Estructura: { userId, timestamp, business }
        const clickEvent = {
            userId: baseUserId,
            timestamp: Date.now(),
            business: businessKey
        };
        const clicksListKey = `clicks-${businessKey}`;
        console.log('[DEBUG] Guardando click en Redis:', typeof clickEvent, clickEvent, '->', JSON.stringify(clickEvent));
        await redis.lpush(clicksListKey, JSON.stringify(clickEvent));

        // Guardar datos agregados para eficiencia
        await redis.set(statsKey, businessData);
        
        return NextResponse.json({
            clickCount: businessData.clickCount,
            uniqueUsers: businessData.uniqueUsers.length,
            currentNumber: businessData.currentNumber,
            dailyClicks: businessData.dailyClicks,
            message: "Número actualizado correctamente",
        });
    } catch (error) {
        console.error("Error en POST:", error);
        return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 });
    }
}
