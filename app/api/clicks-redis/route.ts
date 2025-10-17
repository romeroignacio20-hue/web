import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

// Crear cliente Redis
const redis = new Redis({
  url: process.env.KV_REST_API_URL || "",
  token: process.env.KV_REST_API_TOKEN || "",
});

// Tipo para el negocio (ahora solo Grupo Jugando)
type BusinessType = "Grupo Jugando";

// Interfaz para los datos de negocio
interface BusinessData {
  clickCount: number;
  uniqueUsers: string[];
  dailyClicks: Record<string, number>;
  currentNumber?: string | null;
}

// Números de WhatsApp por defecto
const DEFAULT_WHATSAPP_NUMBERS = [
  "https://api.whatsapp.com/send/?phone=5491173651087&text=Hola!+Quiero+un+usuario+porfavor!",
  "https://api.whatsapp.com/send/?phone=5492915279266&text=Hola!+Quiero+un+usuario+porfavor!"
];

// Función para obtener los números de WhatsApp actuales
const getNumbers = async (): Promise<Record<BusinessType, string[]>> => {
    try {
        // Intentar obtener los números directamente de Redis
        const numbers = await redis.get<string[]>("whatsapp-numbers");
        
        // Si hay números en Redis, usarlos
        if (numbers && Array.isArray(numbers) && numbers.length > 0) {
            return {
                "Grupo Jugando": numbers.filter(Boolean),
            };
        }
    } catch (error) {
        console.error("Error al obtener números de WhatsApp:", error);
    }
    
    try {
        // Guardar los números por defecto en Redis
        await redis.set("whatsapp-numbers", DEFAULT_WHATSAPP_NUMBERS);
        console.log("Números de WhatsApp creados en Redis con datos por defecto");
    } catch (error) {
        console.error("Error al crear números en Redis:", error);
    }
    
    // Retornar los números por defecto
    return {
        "Grupo Jugando": DEFAULT_WHATSAPP_NUMBERS,
    };
};

// Función para inicializar datos de negocio si no existen
const initializeBusinessData = async (business: BusinessType): Promise<BusinessData> => {
    const statsKey = `stats-${business}`;
    
    try {
        // Intentar obtener datos existentes
        const existingData = await redis.get<BusinessData>(statsKey);
        
        if (existingData) {
            // Si los datos existen, asegurar que tengan todas las propiedades necesarias
            const completeData: BusinessData = {
                clickCount: existingData.clickCount || 0,
                uniqueUsers: existingData.uniqueUsers || [],
                dailyClicks: existingData.dailyClicks || {},
                currentNumber: existingData.currentNumber
            };
            
            // Actualizar en Redis si faltaban propiedades
            if (!existingData.dailyClicks || !existingData.uniqueUsers) {
                await redis.set(statsKey, completeData);
                console.log(`Datos de ${business} actualizados con propiedades faltantes`);
            }
            
            return completeData;
        }
        
        // Si no existen datos, crear datos iniciales
        const initialData: BusinessData = {
            clickCount: 0,
            uniqueUsers: [],
            dailyClicks: {}
        };
        
        await redis.set(statsKey, initialData);
        console.log(`Datos iniciales creados para ${business}`);
        
        return initialData;
        
    } catch (error) {
        console.error(`Error al inicializar datos para ${business}:`, error);
        
        // Retornar datos por defecto en caso de error
        return {
            clickCount: 0,
            uniqueUsers: [],
            dailyClicks: {}
        };
    }
};

// Nuevo endpoint para obtener clicks individuales
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const business = searchParams.get('business');
    const limit = parseInt(searchParams.get('limit') || '1000', 10);
    if (!business || business !== "Grupo Jugando") {
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
        const businessData = await initializeBusinessData(business as BusinessType);
        const numberIndex = numbers[business as BusinessType].length > 0 
            ? businessData.clickCount % numbers[business as BusinessType].length 
            : 0;
        const currentNumber = numbers[business as BusinessType].length > 0 
            ? numbers[business as BusinessType][numberIndex]
            : null;

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
            business !== "Grupo Jugando"
        ) {
            return NextResponse.json({ error: "Datos inválidos o negocio no válido" }, { status: 400 });
        }
        
        const businessKey = business as BusinessType;
        
        // Obtener números actuales
        const numbers = await getNumbers();
        
        // Obtener o inicializar datos del negocio
        const businessData = await initializeBusinessData(businessKey);
        
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
            : null;
        
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
        const statsKey = `stats-${businessKey}`;
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
