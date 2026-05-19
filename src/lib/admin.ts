/**
 * lib/admin.ts — utilidades de autorización del backoffice.
 *
 * Estrategia de seguridad:
 *   - Como el sitio NO usa sesiones reales (sólo localStorage del frontend),
 *     todo endpoint admin recibe `usuario_id` en el body o el header
 *     `x-usuario-id`, y lo verifica contra la tabla `usuarios`.
 *   - Sólo si `rol = 'admin'` se permite la operación.
 *   - El frontend, por separado, esconde el menú /admin a quien no
 *     tenga el rol — pero la fuente de verdad es esta función.
 *
 * Limitación conocida:
 *   - Sin firma criptográfica, un usuario malicioso puede mandar
 *     `usuario_id` de otra cuenta admin si conoce el id. Para un
 *     proyecto B2B local con dueño único, es razonable; para producción
 *     debería migrarse a JWT o cookies httpOnly.
 */

import { db } from './db';
import { NextResponse } from 'next/server';

export interface AdminContext {
  ok: true;
  usuario: { id: number; nombre: string; correo: string; rol: 'admin' };
}

export interface AdminError {
  ok: false;
  response: NextResponse;
}

/**
 * Obtiene el usuario_id desde el body de la request o desde el header
 * `x-usuario-id`. Devuelve null si no se encuentra.
 */
async function obtenerUsuarioId(request: Request): Promise<number | null> {
  // 1. Header (preferido, no consume el body)
  const headerId = request.headers.get('x-usuario-id');
  if (headerId) {
    const id = Number(headerId);
    return isNaN(id) ? null : id;
  }

  // 2. Query string ?usuarioId=X
  try {
    const url = new URL(request.url);
    const queryId = url.searchParams.get('usuarioId');
    if (queryId) {
      const id = Number(queryId);
      return isNaN(id) ? null : id;
    }
  } catch {
    /* request.url puede no estar disponible */
  }

  return null;
}

/**
 * Valida que la request venga de un admin. Si todo está bien devuelve
 * el contexto del admin; si no, devuelve una NextResponse con el error
 * apropiado para que el endpoint la retorne directamente.
 *
 * Uso típico en una API route:
 *
 *   export async function POST(req: Request) {
 *     const auth = await requerirAdmin(req);
 *     if (!auth.ok) return auth.response;
 *     // ... aquí ya sabemos que auth.usuario es admin
 *   }
 */
export async function requerirAdmin(request: Request): Promise<AdminContext | AdminError> {
  const usuarioId = await obtenerUsuarioId(request);

  if (!usuarioId) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, message: 'Se requiere x-usuario-id o ?usuarioId=' },
        { status: 401 }
      ),
    };
  }

  try {
    const [rows]: any = await db.query(
      'SELECT id, nombre, correo, rol FROM usuarios WHERE id = ? LIMIT 1',
      [usuarioId]
    );

    if (rows.length === 0) {
      return {
        ok: false,
        response: NextResponse.json(
          { ok: false, message: 'Usuario no encontrado' },
          { status: 401 }
        ),
      };
    }

    const usuario = rows[0];
    if (usuario.rol !== 'admin') {
      return {
        ok: false,
        response: NextResponse.json(
          { ok: false, message: 'Acceso denegado. Se requiere rol de administrador.' },
          { status: 403 }
        ),
      };
    }

    return { ok: true, usuario };
  } catch (error: any) {
    console.error('[requerirAdmin] error:', error);
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, message: 'Error al validar permisos', detalle: error?.message },
        { status: 500 }
      ),
    };
  }
}
