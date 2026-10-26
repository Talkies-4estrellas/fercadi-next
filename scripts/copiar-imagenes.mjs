#!/usr/bin/env node
// ============================================================
//  Copia las imágenes del bucket de Supabase (FERCADI)
//  Bucket: 'productos' — todas las imágenes de productos
//
//  Las imágenes NO viajan en el dump SQL; este script las copia.
//
//  USO:
//    cd "C:\fercadi-next"
//    node scripts/copiar-imagenes.mjs
//
//  Pide las credenciales por consola (no quedan en el historial).
//  Necesita la SERVICE ROLE KEY de ambos proyectos
//  (Dashboard → Settings → API → service_role).
// ============================================================

import { createClient } from '@supabase/supabase-js'
import readline from 'node:readline/promises'
import { stdin, stdout } from 'node:process'

const BUCKETS      = ['productos']
const CONCURRENCIA = 4

const rl = readline.createInterface({ input: stdin, output: stdout })

async function preguntar(texto) {
  return (await rl.question(texto)).trim()
}

async function copiarBucket(origen, destino, bucket) {
  console.log(`\n--- Bucket: ${bucket} ---`)
  const rutas = await listarRecursivo(origen, bucket, '')
  console.log(`Encontrados ${rutas.length} archivos.`)
  if (rutas.length === 0) return { ok: 0, fallidos: [] }

  let ok = 0
  const fallidos = []

  for (let i = 0; i < rutas.length; i += CONCURRENCIA) {
    const lote = rutas.slice(i, i + CONCURRENCIA)
    await Promise.all(lote.map(async (path) => {
      try {
        const { data: blob, error: errDown } = await origen.storage.from(bucket).download(path)
        if (errDown) throw errDown

        const buffer = Buffer.from(await blob.arrayBuffer())
        const { error: errUp } = await destino.storage
          .from(bucket)
          .upload(path, buffer, { contentType: blob.type || 'image/webp', upsert: true })
        if (errUp) throw errUp

        ok++
        process.stdout.write(`\r  ✓ ${ok}/${rutas.length} copiados...`)
      } catch (e) {
        fallidos.push({ path, error: e instanceof Error ? e.message : String(e) })
      }
    }))
  }

  console.log('')
  return { ok, fallidos }
}

async function listarRecursivo(client, bucket, prefijo) {
  const { data, error } = await client.storage.from(bucket).list(prefijo, { limit: 1000 })
  if (error) {
    console.error(`Error listando "${prefijo}": ${error.message}`)
    return []
  }
  let rutas = []
  for (const item of data ?? []) {
    const ruta = prefijo ? `${prefijo}/${item.name}` : item.name
    if (item.id === null) {
      rutas = rutas.concat(await listarRecursivo(client, bucket, ruta))
    } else {
      rutas.push(ruta)
    }
  }
  return rutas
}

async function main() {
  console.log('\n=== Copiar imágenes entre proyectos de Supabase — FERCADI ===\n')
  console.log('Datos en: Dashboard → Settings → API\n')

  const urlVieja = await preguntar('URL del proyecto VIEJO (https://xxxx.supabase.co): ')
  const keyVieja = await preguntar('service_role key del proyecto VIEJO:               ')
  const urlNueva = await preguntar('URL del proyecto NUEVO (https://xxxx.supabase.co): ')
  const keyNueva = await preguntar('service_role key del proyecto NUEVO:               ')
  rl.close()

  if (!urlVieja.startsWith('https://') || !urlNueva.startsWith('https://')) {
    console.error('\n❌ Las URLs deben empezar con https://')
    process.exit(1)
  }

  const origen  = createClient(urlVieja, keyVieja, { auth: { persistSession: false } })
  const destino = createClient(urlNueva, keyNueva, { auth: { persistSession: false } })

  const resumen = {}
  for (const bucket of BUCKETS) {
    resumen[bucket] = await copiarBucket(origen, destino, bucket)
  }

  console.log('\n\n=== Resultado ===')
  let totalFallidos = []
  for (const bucket of BUCKETS) {
    const r = resumen[bucket]
    console.log(`  ${bucket}: ✓ ${r.ok} copiados, ✗ ${r.fallidos.length} fallidos`)
    totalFallidos = totalFallidos.concat(r.fallidos.map(f => ({ bucket, ...f })))
  }
  if (totalFallidos.length > 0) {
    console.log('\nArchivos que fallaron:')
    totalFallidos.forEach(f => console.log(`  [${f.bucket}] ${f.path}: ${f.error}`))
  }
}

main().catch(e => {
  console.error('\nError inesperado:', e)
  process.exit(1)
})
