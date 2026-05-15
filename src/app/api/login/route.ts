import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { correo, password } = await request.json();

    // 1. Buscamos al usuario en la base de datos de XAMPP
    // Seleccionamos específicamente los campos que necesitamos para la sesión
    const [rows]: any = await db.query(
      'SELECT id, nombre, correo, password FROM usuarios WHERE correo = ?', 
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
    // Devolvemos el nombre para poder personalizar la bienvenida en el frontend
    return NextResponse.json({ 
      message: 'Inicio de sesión exitoso', 
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo
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