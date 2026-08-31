# Memoria del Proyecto — Convenciones de Sesiones

## ¿Qué es esto?

Este archivo documenta cómo se registra el trabajo en este proyecto.  
Cada sesión de trabajo genera un archivo en `Doc/sesiones/sesion-DD-MM-YYYY.md`.

---

## Formato de sesión

```
# Sesión DD-MM-YYYY — [Tema principal]

## Objetivo del día
[Qué se buscaba lograr en esta sesión]

## Lo que se hizo

### 1. [Título del cambio]
- **Archivo:** `ruta/al/archivo.ext`
- **Problema:** [Qué estaba mal o qué faltaba]
- **Solución:** [Qué se hizo para resolverlo]
- **Resultado:** [Qué quedó funcionando]

### 2. [Título del cambio]
...

## Verificación
[Cómo se comprobó que los cambios funcionan]

## Pendiente
- [ ] Tarea pendiente 1
- [ ] Tarea pendiente 2
```

---

## Reglas de las sesiones

- El nombre del archivo siempre es `sesion-DD-MM-YYYY.md` (día-mes-año)
- Se documenta al final de la sesión o al inicio de la siguiente
- Se incluyen errores importantes y cómo se resolvieron
- Los commits pendientes se listan en "Pendiente" si aún no se hicieron

---

## Convención de commits

- Los commits se hacen **solo cuando el usuario lo indica explícitamente**
- Formato del mensaje: resumen en presente + archivos clave afectados
- No se usa `--no-verify` ni se omiten hooks

---

## Stack del proyecto

- **Framework:** Next.js 16 (App Router, `'use client'`)
- **Base de datos:** PostgreSQL en Supabase (Transaction Pooler, puerto 6543)
- **Deploy:** Vercel
- **Estilos:** CSS Modules
- **Auth:** Contexto propio (no NextAuth)
