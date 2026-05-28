import { NextResponse } from 'next/server';
import { requerirAdmin } from '@/lib/admin';

/**
 * POST /api/admin/tips/ia
 * Body: { tema: string }
 *
 * Llama a Gemini 1.5 Flash con un prompt de ingeniería y devuelve
 * { ok: true, titulo, descripcion, contenido } listos para rellenar
 * el formulario de /admin/tips/nuevo.
 *
 * Requiere: GEMINI_API_KEY en .env.local
 */
export async function POST(req: Request) {
  // ── 1. Verificar que sea administrador ──────────────────────────
  const auth = await requerirAdmin(req);
  if (!auth.ok) return auth.response;

  // ── 2. Validar entrada ──────────────────────────────────────────
  let tema = '';
  try {
    const body = await req.json();
    tema = body?.tema?.trim() ?? '';
  } catch {
    return NextResponse.json({ ok: false, error: 'Body JSON inválido.' }, { status: 400 });
  }

  if (!tema) {
    return NextResponse.json({ ok: false, error: 'El campo "tema" es requerido.' }, { status: 400 });
  }

  // ── 3. Verificar API Key ────────────────────────────────────────
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: 'Falta GEMINI_API_KEY en las variables de entorno del servidor.' },
      { status: 500 }
    );
  }

  // ── 4. Prompt de ingeniería ────────────────────────────────────
  const prompt = `
Eres un experto técnico de la empresa "FERCADI / Josman Texturizados", dedicada a la venta de concretos, materiales de construcción, acabados texturizados, adhesivos y ferretería en México.

Genera un artículo de tip o tutorial técnico basado en el siguiente tema: "${tema}".

Responde ÚNICAMENTE con un objeto JSON válido, sin bloques de código, sin comentarios, sin texto adicional antes o después.
El JSON debe tener exactamente esta estructura:
{
  "titulo": "Título llamativo y profesional, en mayúsculas, máximo 80 caracteres",
  "descripcion": "Descripción corta de 1 a 2 oraciones para la tarjeta de previsualización. Sin markdown.",
  "contenido": "El tutorial completo en Markdown. Usa ### para subtítulos, **negritas** para términos clave, guiones - para listas. Mínimo 250 palabras. Orientado a clientes constructores o albañiles de México."
}
`.trim();

  // ── 5. Llamada a Gemini ─────────────────────────────────────────
  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errData = await geminiRes.json().catch(() => ({}));
      console.error('[IA Tips] Error de Gemini:', errData);
      return NextResponse.json(
        { ok: false, error: `Error de Gemini (${geminiRes.status}): ${(errData as any)?.error?.message ?? 'sin detalle'}` },
        { status: 502 }
      );
    }

    const geminiData = await geminiRes.json();
    const textoRaw: string = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    if (!textoRaw) {
      return NextResponse.json({ ok: false, error: 'Gemini no devolvió contenido.' }, { status: 502 });
    }

    // Limpiar posibles bloques de código que el modelo inyecte por error
    const jsonLimpio = textoRaw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();

    const resultado = JSON.parse(jsonLimpio);

    if (!resultado.titulo || !resultado.contenido) {
      throw new Error('El JSON de Gemini no tiene la estructura esperada.');
    }

    return NextResponse.json({
      ok: true,
      titulo:      resultado.titulo      ?? '',
      descripcion: resultado.descripcion ?? '',
      contenido:   resultado.contenido   ?? '',
    });

  } catch (e: any) {
    console.error('[IA Tips] Error procesando respuesta:', e);
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'Error al procesar la respuesta de la IA.' },
      { status: 500 }
    );
  }
}
