import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Números de WhatsApp por defecto
const DEFAULT_WHATSAPP_NUMBERS = [
  "https://api.whatsapp.com/send/?phone=5491173651087&text=Hola!+Quiero+un+usuario+porfavor!",
  "https://api.whatsapp.com/send/?phone=5492915279266&text=Hola!+Quiero+un+usuario+porfavor!"
];

// Ruta al archivo JSON para persistencia
const filePath = path.resolve("./data.json");

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
    // Intentar leer los números de WhatsApp de data.json
    const data = readData();
    if (data.whatsappNumbers && Array.isArray(data.whatsappNumbers)) {
      return NextResponse.json({ whatsappNumbers: data.whatsappNumbers });
    }
    
    // Si no hay números guardados, usar los por defecto
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
      return NextResponse.json({ error: 'Los números de WhatsApp deben ser un array de strings' }, { status: 400 });
    }
    
    // Guardar los números en data.json
    const data = readData();
    data.whatsappNumbers = whatsappNumbers;
    writeData(data);
    
    return NextResponse.json({ success: true, message: 'Números de WhatsApp actualizados correctamente' });
  } catch (error) {
    console.error('Error al actualizar los números:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
