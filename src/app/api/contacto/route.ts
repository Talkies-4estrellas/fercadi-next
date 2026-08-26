import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { nombre, email, mensaje } = await req.json()

    if (!nombre || !email || !mensaje) {
      return NextResponse.json({ error: 'Campos incompletos' }, { status: 400 })
    }

    // Resend integration — requiere RESEND_API_KEY en variables de entorno
    const apiKey = process.env.RESEND_API_KEY

    if (!apiKey) {
      console.warn('[contacto] RESEND_API_KEY no definida — correo no enviado')
      return NextResponse.json({ ok: true })
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'contacto@fercadi.com',
        to: process.env.CONTACTO_EMAIL ?? 'ew.eloywalls@gmail.com',
        subject: `Mensaje de ${nombre} - Formulario FERCADI`,
        text: `Nombre: ${nombre}\nEmail: ${email}\n\nMensaje:\n${mensaje}`,
        reply_to: email,
      }),
    })

    if (!res.ok) {
      console.error('Resend error:', await res.text())
      return NextResponse.json({ error: 'Error al enviar email' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('API contacto error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
