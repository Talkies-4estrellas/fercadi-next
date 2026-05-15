import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { nombre, telefono, email, producto, cantidad, descripcion } = await req.json()

    if (!nombre || !telefono || !producto) {
      return NextResponse.json({ error: 'Campos incompletos' }, { status: 400 })
    }

    const apiKey = process.env.RESEND_API_KEY

    if (!apiKey) {
      console.log('Cotización recibida (sin RESEND_API_KEY):', { nombre, telefono, email, producto, cantidad, descripcion })
      return NextResponse.json({ ok: true })
    }

    const cuerpo = [
      `Nombre: ${nombre}`,
      `Teléfono/WhatsApp: ${telefono}`,
      `Correo: ${email || 'No proporcionado'}`,
      `Producto de interés: ${producto}`,
      `Cantidad/Volumen: ${cantidad || 'No especificado'}`,
      `\nDescripción del proyecto:\n${descripcion || 'Sin descripción'}`,
    ].join('\n')

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'cotizacion@fercadi.com',
        to: process.env.CONTACTO_EMAIL ?? 'ew.eloywalls@gmail.com',
        subject: `Solicitud de cotización — ${nombre} (${producto})`,
        text: cuerpo,
        reply_to: email || undefined,
      }),
    })

    if (!res.ok) {
      console.error('Resend error:', await res.text())
      return NextResponse.json({ error: 'Error al enviar' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('API cotizacion error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
