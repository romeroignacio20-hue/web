import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;
    
    // Verificar la contraseña con la variable de entorno
    const correctPassword = process.env.contrasena;
    
    if (!password || password !== correctPassword) {
      return NextResponse.json({ 
        success: false, 
        message: "Contraseña incorrecta" 
      }, { status: 401 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Contraseña correcta" 
    });
  } catch (error) {
    console.error("Error al verificar la contraseña:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Error al verificar la contraseña" 
    }, { status: 500 });
  }
}
