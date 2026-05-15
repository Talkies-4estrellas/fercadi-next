import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcrypt'; // npm install bcrypt (opcional para cifrar)

export async function POST(request: Request) {
  try {
    const { nombre, correo, password } = await request.json();

    // Validar si el usuario ya existe
    const [rows]: any = await db.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
    if (rows.length > 0) {
      return NextResponse.json({ message: 'El correo ya está registrado' }, { status: 400 });
    }

    // Guardar en la base de datos (En un proyecto real, cifra el password aquí)
    await db.query(
      'INSERT INTO usuarios (nombre, correo, password) VALUES (?, ?, ?)',
      [nombre, correo, password]
    );

    return NextResponse.json({ message: 'Usuario registrado con éxito' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error en el servidor' }, { status: 500 });
  }
}