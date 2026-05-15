import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    // Desestructuramos todos los nuevos campos del cuerpo de la petición
    const { 
      nombre, 
      correo, 
      password, 
      edad, 
      domicilio, 
      colonia, 
      estado, 
      ciudad, 
      fecha_nacimiento, 
      profesion 
    } = await request.json();

    // 1. Validar si el usuario ya existe por correo
    const [rows]: any = await db.query('SELECT id FROM usuarios WHERE correo = ?', [correo]);
    if (rows.length > 0) {
      return NextResponse.json({ message: 'El correo ya está registrado' }, { status: 400 });
    }

    // 2. Cifrar la contraseña
    const hash = await bcrypt.hash(password, 10);

    // 3. Insertar el nuevo registro con la lista extendida de columnas
    // Asegúrate de que el orden en VALUES (?, ?, ...) coincida con el orden de las columnas
    await db.query(
      `INSERT INTO usuarios 
      (nombre, correo, password, edad, domicilio, colonia, estado, ciudad, fecha_nacimiento, profesion) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre, 
        correo, 
        hash, 
        edad, 
        domicilio, 
        colonia, 
        estado, 
        ciudad, 
        fecha_nacimiento, 
        profesion
      ]
    );

    return NextResponse.json({ message: 'Usuario registrado con éxito' }, { status: 201 });
  } catch (error) {
    console.error('Error en el registro:', error);
    return NextResponse.json({ message: 'Error en el servidor' }, { status: 500 });
  }
}