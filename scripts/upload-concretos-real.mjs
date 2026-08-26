/**
 * Descarga fotos reales de Pixabay (libres de derechos, Pixabay License)
 * y las sube al bucket "productos" de Supabase Storage.
 * Luego actualiza imagen_url en la tabla productos.
 */
import pg from 'pg';
import { readFileSync } from 'fs';
const { Pool } = pg;

const env = readFileSync('.env.local', 'utf8')
  .split('\n')
  .reduce((a, l) => { const m = l.match(/^([^#=\s]+)\s*=\s*(.*)$/); if (m) a[m[1]] = m[2].trim(); return a; }, {});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET       = 'productos';
const pool         = new Pool({ connectionString: env.DATABASE_URL });

// ── Mapa producto → foto Pixabay CDN ─────────────────────────────────────────
// Todas bajo Pixabay License (uso libre comercial, sin atribución requerida)
const FOTOS = {
  1:  { cat: 'agregados',         file: 'arena.jpg',          url: 'https://cdn.pixabay.com/photo/2019/04/20/11/08/construction-material-4141504_1280.jpg' },
  2:  { cat: 'agregados',         file: 'grava.jpg',          url: 'https://cdn.pixabay.com/photo/2017/07/03/15/14/gravel-rocks-2468044_1280.jpg' },
  3:  { cat: 'agregados',         file: 'aditivos.jpg',       url: 'https://cdn.pixabay.com/photo/2018/02/14/04/57/glass-3152124_1280.jpg' },
  4:  { cat: 'clase-a',           file: 'fc150.jpg',          url: 'https://cdn.pixabay.com/photo/2022/05/28/09/12/construction-7226875_1280.jpg' },
  5:  { cat: 'clase-a',           file: 'fc200.jpg',          url: 'https://cdn.pixabay.com/photo/2019/04/16/11/42/concrete-4131540_1280.jpg' },
  6:  { cat: 'clase-a',           file: 'fc350.jpg',          url: 'https://cdn.pixabay.com/photo/2016/12/20/21/25/construction-1921518_1280.jpg' },
  7:  { cat: 'mr',                file: 'modular.jpg',        url: 'https://cdn.pixabay.com/photo/2016/12/16/13/06/cement-1911362_1280.jpg' },
  8:  { cat: 'mr',                file: 'mr.jpg',             url: 'https://cdn.pixabay.com/photo/2014/03/01/02/29/asphalt-277309_1280.jpg' },
  9:  { cat: 'especializados',    file: 'antibacterial.jpg',  url: 'https://cdn.pixabay.com/photo/2018/02/17/11/24/concrete-3159720_1280.jpg' },
  10: { cat: 'especializados',    file: 'autocompact.jpg',    url: 'https://cdn.pixabay.com/photo/2022/05/28/09/12/construction-7226875_1280.jpg' },
  11: { cat: 'especializados',    file: 'durable.jpg',        url: 'https://cdn.pixabay.com/photo/2017/08/30/11/52/texture-2696788_1280.jpg' },
  12: { cat: 'especializados',    file: 'edad-temprana.jpg',  url: 'https://cdn.pixabay.com/photo/2019/04/16/11/42/concrete-4131540_1280.jpg' },
  13: { cat: 'especializados',    file: 'impermeable.jpg',    url: 'https://cdn.pixabay.com/photo/2020/04/30/23/07/architecture-5114882_1280.jpg' },
  14: { cat: 'especializados',    file: 'ligero.jpg',         url: 'https://cdn.pixabay.com/photo/2018/02/17/11/24/concrete-3159720_1280.jpg' },
  15: { cat: 'especializados',    file: 'permeable.jpg',      url: 'https://cdn.pixabay.com/photo/2014/08/27/17/05/paving-stones-429307_1280.jpg' },
  16: { cat: 'especializados',    file: 'pigmentado.jpg',     url: 'https://cdn.pixabay.com/photo/2016/11/21/13/29/yellow-1845394_1280.jpg' },
  17: { cat: 'prefabricados',     file: 'barda.jpg',          url: 'https://cdn.pixabay.com/photo/2016/12/16/13/06/cement-1911362_1280.jpg' },
  18: { cat: 'prefabricados',     file: 'barrera.jpg',        url: 'https://cdn.pixabay.com/photo/2014/02/04/16/02/road-works-258057_1280.jpg' },
  19: { cat: 'prefabricados',     file: 'postes.jpg',         url: 'https://cdn.pixabay.com/photo/2017/08/30/11/52/texture-2696788_1280.jpg' },
  20: { cat: 'renta-de-equipo',   file: 'vibrador.jpg',       url: 'https://cdn.pixabay.com/photo/2016/12/20/21/25/construction-1921518_1280.jpg' },
  21: { cat: 'renta-de-equipo',   file: 'grua.jpg',           url: 'https://cdn.pixabay.com/photo/2021/01/15/05/58/tower-crane-5918518_1280.jpg' },
  22: { cat: 'renta-de-equipo',   file: 'retroexcavadora.jpg',url: 'https://cdn.pixabay.com/photo/2015/07/27/12/55/excavator-862534_1280.jpg' },
  23: { cat: 'renta-de-equipo',   file: 'bolteo.jpg',         url: 'https://cdn.pixabay.com/photo/2016/06/05/20/10/cement-mixer-1438074_1280.jpg' },
  24: { cat: 'servicios',         file: 'bomba.jpg',          url: 'https://cdn.pixabay.com/photo/2019/04/16/11/42/concrete-4131540_1280.jpg' },
  25: { cat: 'servicios',         file: 'estampado.jpg',      url: 'https://cdn.pixabay.com/photo/2018/02/17/11/24/concrete-3159720_1280.jpg' },
  26: { cat: 'servicios',         file: 'movil.jpg',          url: 'https://cdn.pixabay.com/photo/2016/06/05/20/10/cement-mixer-1438074_1280.jpg' },
  27: { cat: 'servicios',         file: 'corte.jpg',          url: 'https://cdn.pixabay.com/photo/2015/03/10/13/55/saw-667139_1280.jpg' },
  28: { cat: 'servicios',         file: 'floteado.jpg',       url: 'https://cdn.pixabay.com/photo/2014/11/29/10/16/concrete-549730_1280.jpg' },
};

// ── Descarga imagen como ArrayBuffer ─────────────────────────────────────────
async function descargar(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; fercadi-next/1.0)' },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} al descargar ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

// ── Sube a Supabase Storage ───────────────────────────────────────────────────
async function subir(path, buffer, contentType) {
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': contentType,
      'x-upsert': 'true',
    },
    body: buffer,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Upload failed [${res.status}]: ${txt}`);
  }
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const ids = Object.keys(FOTOS).map(Number);
  console.log(`\n📸 Descargando y subiendo ${ids.length} fotos reales...\n`);

  for (const id of ids) {
    const { cat, file, url } = FOTOS[id];
    const storagePath = `concretos/${cat}/${file}`;

    try {
      process.stdout.write(`  [${id}] ${file.replace('.jpg','')} → descargando...`);
      const buffer = await descargar(url);
      process.stdout.write(` (${(buffer.length/1024).toFixed(0)}KB) → subiendo...`);
      const publicUrl = await subir(storagePath, buffer, 'image/jpeg');
      await pool.query('UPDATE productos SET imagen_url = $1 WHERE id = $2', [publicUrl, id]);
      console.log(' ✅');
    } catch (err) {
      console.log(` ❌ ${err.message}`);
    }
  }

  await pool.end();
  console.log('\n✅ Proceso completado.\n');
}

main();
