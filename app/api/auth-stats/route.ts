import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    // Obtener la clave desde las variables de entorno
    const correctPassword = process.env.STATS_PASSWORD || "admin123";
    
    if (password === correctPassword) {
      // Generar un token simple (en producción usar JWT)
      const token = Buffer.from(`stats-auth-${Date.now()}`).toString('base64');
      
      return NextResponse.json({ 
        success: true, 
        token,
        message: "Autenticación exitosa" 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: "Clave incorrecta" 
      }, { status: 401 });
    }
  } catch (error) {
    console.error('Error en autenticación:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Token no proporcionado' 
      }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    
    // Validar token simple (en producción usar JWT)
    if (token && token.startsWith('c3RhdHMtYXV0aC0')) { // Base64 de "stats-auth-"
      return NextResponse.json({ 
        success: true, 
        message: "Token válido" 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Token inválido' 
      }, { status: 401 });
    }
  } catch (error) {
    console.error('Error en validación de token:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
