import { NextResponse } from 'next/server';
import { requerirAdmin } from '@/lib/admin';

/**
 * POST /api/admin/tips/ia
 * Body: { tema: string }
 *
 * Llama a Groq (Llama 3.3 70B) y devuelve
 * { ok: true, titulo, descripcion, contenido } listos para rellenar
 * el formulario de /admin/tips/nuevo.
 *
 * Requiere: GROQ_API_KEY en .env.local
 * Obtener gratis en: https://console.groq.com/keys
 * Free tier: 30 req/min · 14,400 req/día · sin tarjeta
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
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: 'Falta GROQ_API_KEY en las variables de entorno del servidor.' },
      { status: 500 }
    );
  }

  // ── 4. Prompt de ingeniería ─────────────────────────────────────
  const prompt = `Eres un experto técnico de la empresa "FERCADI / Josman Texturizados", dedicada a la venta de concretos, materiales de construcción, acabados texturizados, adhesivos y ferretería en México.

Genera un artículo de tip o tutorial técnico basado en el siguiente tema: "${tema}".

Responde ÚNICAMENTE con un objeto JSON válido, sin bloques de código, sin comentarios, sin texto adicional antes o después del JSON.
El JSON debe tener exactamente esta estructura:
{
  "titulo": "Título llamativo y profesional, en mayúsculas, máximo 80 caracteres",
  "descripcion": "Descripción corta de 1 a 2 oraciones para la tarjeta de previsualización. Sin markdown.",
  "contenido": "REGLAS DE FORMATO OBLIGATORIAS para el campo contenido:\\n1. Usa ### para subtítulos (ejemplo: ### Materiales necesarios)\\n2. Cada ítem de lista debe estar en su PROPIA LÍNEA comenzando con '- ' (guión espacio)\\n3. NUNCA pongas varios ítems de lista en la misma línea separados por guiones\\n4. Usa **palabra** para negritas en términos clave\\n5. Separa cada sección con una línea en blanco\\n6. Mínimo 300 palabras\\n7. Redacta en español mexicano, orientado a constructores y albañiles\\nEjemplo de lista CORRECTA:\\n- Primer elemento\\n- Segundo elemento\\n- Tercer elemento\\nEjemplo INCORRECTO (NO hagas esto): texto. - item1 - item2 - item3"
}`;

  // ── 5. Llamada a Groq (compatible con OpenAI) ───────────────────
  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!groqRes.ok) {
      const errData = await groqRes.json().catch(() => ({}));
      console.error('[IA Tips] Error de Groq:', errData);
      return NextResponse.json(
        { ok: false, error: `Error de Groq (${groqRes.status}): ${(errData as any)?.error?.message ?? 'sin detalle'}` },
        { status: 502 }
      );
    }

    const groqData = await groqRes.json();
    const textoRaw: string = groqData?.choices?.[0]?.message?.content ?? '';

    if (!textoRaw) {
      return NextResponse.json({ ok: false, error: 'El modelo no devolvió contenido.' }, { status: 502 });
    }

    // Limpiar posibles bloques de código que el modelo inyecte por error
    let jsonLimpio = textoRaw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();

    // Sanitizar caracteres de control literales dentro de los strings JSON.
    // El modelo a veces devuelve saltos de línea reales en vez de \n escapados,
    // lo que rompe JSON.parse. Este regex reemplaza solo dentro de strings "…".
    jsonLimpio = jsonLimpio.replace(
      /"(?:[^"\\]|\\.)*"/g,
      (match) => match
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
    );

    const resultado = JSON.parse(jsonLimpio);

    if (!resultado.titulo || !resultado.contenido) {
      throw new Error('El JSON no tiene la estructura esperada (faltan titulo o contenido).');
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
