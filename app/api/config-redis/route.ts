import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

// Números de WhatsApp por defecto
const DEFAULT_WHATSAPP_NUMBERS = [
  "https://api.whatsapp.com/send/?phone=5491173651087&text=Hola!+Quiero+un+usuario+porfavor!",
  "https://api.whatsapp.com/send/?phone=5492915279266&text=Hola!+Quiero+un+usuario+porfavor!"
];

// Crear cliente Redis
const redis = new Redis({
  url: process.env.KV_REST_API_URL || "",
  token: process.env.KV_REST_API_TOKEN || "",
});

export async function GET() {
  try {
    // Intentar obtener los números de WhatsApp de Redis
    const numbers = await redis.get<string[]>("whatsapp-numbers");
    
    // Si hay números en Redis, usarlos
    if (numbers && Array.isArray(numbers)) {
      return NextResponse.json({ whatsappNumbers: numbers });
    }
    
    // Si no hay números en Redis, usar los por defecto
    return NextResponse.json({ whatsappNumbers: DEFAULT_WHATSAPP_NUMBERS });
  } catch (error) {
    console.error('Error al obtener la configuración:', error);
    return NextResponse.json({ error: 'Error al obtener la configuración' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { whatsappNumbers } = await request.json();
    
    // Validar que sea un array de strings
    if (!Array.isArray(whatsappNumbers) || !whatsappNumbers.every(num => typeof num === 'string')) {
      return NextResponse.json({ success: false, error: 'Los números de WhatsApp deben ser un array de strings' }, { status: 400 });
    }
    
    // Guardar los números de WhatsApp en Redis
    await redis.set("whatsapp-numbers", whatsappNumbers);
    
    return NextResponse.json({ success: true, message: 'Números de WhatsApp actualizados correctamente' });
  } catch (error) {
    console.error('Error al actualizar los números:', error);
    return NextResponse.json({ success: false, error: 'Error al actualizar los números de WhatsApp' }, { status: 500 });
  }
}
