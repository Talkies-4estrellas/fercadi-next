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
    const rol = usuario.rol ?? 'usuario'
    const res = NextResponse.json({
      message: 'Inicio de sesión exitoso',
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol,
      }
    }, { status: 200 });

    // Cookie de sesión para que el middleware pueda proteger /admin/* en el servidor.
    // httpOnly impide que JS del cliente la lea; secure la envía solo por HTTPS en prod.
    res.cookies.set('fercadi_session', String(usuario.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });
    // Cookie legible por el cliente para saber si tiene acceso a /admin.
    res.cookies.set('fercadi_rol', rol, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' }, 
      { status: 500 }
    );
  }
}