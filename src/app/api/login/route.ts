import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { correo, password } = await request.json();

    // 1. Buscar usuario en Supabase
    // `rol` se incluye para que el frontend sepa si puede acceder a /admin.
    const [rows]: any = await db.query(
      'SELECT id, nombre, correo, password, rol FROM usuarios WHERE correo = ?',
      [correo]
    );

    // 2. Validación de existencia
    if (rows.length === 0) {
      // Usamos un mensaje genérico por seguridad
      return NextResponse.json(
        { message: 'Correo o contraseña incorrectos' }, 
        { status: 401 }
      );
    }

    const usuario = rows[0];

    // 3. Comparamos la contraseña enviada con el hash de la base de datos
    const passwordValido = await bcrypt.compare(password, usuario.password);
    
    if (!passwordValido) {
      return NextResponse.json(
        { message: 'Correo o contraseña incorrectos' }, 
        { status: 401 }
      );
    }

    // 4. Respuesta exitosa
    // Devolvemos el rol además del nombre para que el frontend pueda
    // mostrar/ocultar opciones reservadas al admin (entrada /admin, etc.).
    return NextResponse.json({
      message: 'Inicio de sesión exitoso',
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol ?? 'usuario',
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' }, 
      { status: 500 }
    );
  }
}