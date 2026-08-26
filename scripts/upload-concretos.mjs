/**
 * Genera SVG placeholder para cada producto de concretos,
 * los sube a Supabase Storage y actualiza imagen_url en la BD.
 */
import { readFileSync } from 'fs';
import pg from 'pg';
const { Pool } = pg;

const env = readFileSync('.env.local', 'utf8')
  .split('\n')
  .reduce((a, l) => { const m = l.match(/^([^#=\s]+)\s*=\s*(.*)$/); if (m) a[m[1]] = m[2].trim(); return a; }, {});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET       = 'productos';
const pool         = new Pool({ connectionString: env.DATABASE_URL });

// ── Paleta por categoría ──────────────────────────────────────────────────────
const CATEGORIAS = {
  agregados:        { color: '#8B6914', icono: '⬡', label: 'Agregados' },
  'clase-a':        { color: '#1565C0', icono: '◈', label: 'Concreto' },
  mr:               { color: '#00695C', icono: '◈', label: 'Concreto MR' },
  especializados:   { color: '#4527A0', icono: '◈', label: 'Especializado' },
  prefabricados:    { color: '#37474F', icono: '▣', label: 'Prefabricado' },
  'renta-de-equipo':{ color: '#BF360C', icono: '⚙', label: 'Renta equipo' },
  servicios:        { color: '#1B5E20', icono: '✦', label: 'Servicio' },
};

// ── Productos con su categoría ────────────────────────────────────────────────
const PRODUCTOS = [
  { id: 1,  nombre: 'Arena',               cat: 'agregados',         subtitulo: 'Granular natural' },
  { id: 2,  nombre: 'Grava',               cat: 'agregados',         subtitulo: 'Material pétreo' },
  { id: 3,  nombre: 'Aditivos',            cat: 'agregados',         subtitulo: 'Químicos para concreto' },
  { id: 4,  nombre: 'FC/150 kg/cm²',       cat: 'clase-a',           subtitulo: 'Resistencia estándar' },
  { id: 5,  nombre: 'FC/200 kg/cm²',       cat: 'clase-a',           subtitulo: 'Cimentaciones y losas' },
  { id: 6,  nombre: 'FC/350 kg/cm²',       cat: 'clase-a',           subtitulo: 'Alta resistencia' },
  { id: 7,  nombre: 'Modular',             cat: 'mr',                subtitulo: 'Prefabricados' },
  { id: 8,  nombre: 'Concreto MR',         cat: 'mr',                subtitulo: 'Módulo de ruptura' },
  { id: 9,  nombre: 'Antibacterial',       cat: 'especializados',    subtitulo: 'Inhibe microorganismos' },
  { id: 10, nombre: 'Autocompactable',     cat: 'especializados',    subtitulo: 'Sin vibración' },
  { id: 11, nombre: 'Durable',             cat: 'especializados',    subtitulo: 'Alta durabilidad' },
  { id: 12, nombre: 'Edad Temprana',       cat: 'especializados',    subtitulo: 'Fraguado rápido' },
  { id: 13, nombre: 'Impermeable',         cat: 'especializados',    subtitulo: 'Baja permeabilidad' },
  { id: 14, nombre: 'Ligero',              cat: 'especializados',    subtitulo: 'Baja densidad' },
  { id: 15, nombre: 'Permeable',           cat: 'especializados',    subtitulo: 'Recarga freática' },
  { id: 16, nombre: 'Pigmentado',          cat: 'especializados',    subtitulo: 'Acabados decorativos' },
  { id: 17, nombre: 'Barda Pre-Fabricada', cat: 'prefabricados',     subtitulo: 'Delimitación de predios' },
  { id: 18, nombre: 'Barrera',             cat: 'prefabricados',     subtitulo: 'Control de tráfico' },
  { id: 19, nombre: 'Postes',              cat: 'prefabricados',     subtitulo: 'Cercas y señalización' },
  { id: 20, nombre: 'Vibrador',            cat: 'renta-de-equipo',   subtitulo: 'Consolidación de mezclas' },
  { id: 21, nombre: 'Grúa',               cat: 'renta-de-equipo',   subtitulo: 'Levantamiento de cargas' },
  { id: 22, nombre: 'Retroexcavadora',     cat: 'renta-de-equipo',   subtitulo: 'Excavación' },
  { id: 23, nombre: 'Bolteo',             cat: 'renta-de-equipo',   subtitulo: 'Transporte de mezcla' },
  { id: 24, nombre: 'Bomba Telescópica',   cat: 'servicios',         subtitulo: 'Bombeo de concreto' },
  { id: 25, nombre: 'Concreto Estampado',  cat: 'servicios',         subtitulo: 'Acabados decorativos' },
  { id: 26, nombre: 'Concreto Móvil',      cat: 'servicios',         subtitulo: 'Planta móvil' },
  { id: 27, nombre: 'Corte de Concreto',   cat: 'servicios',         subtitulo: 'Corte y demolición' },
  { id: 28, nombre: 'Floteado y Pulido',   cat: 'servicios',         subtitulo: 'Acabado de pisos' },
];

// ── Genera SVG ────────────────────────────────────────────────────────────────
function generarSVG(nombre, subtitulo, cat) {
  const { color, icono, label } = CATEGORIAS[cat];

  // Acortar nombre si es muy largo
  const nombreCorto = nombre.length > 18 ? nombre.substring(0, 16) + '…' : nombre;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:1"/>
      <stop offset="100%" style="stop-color:${color};stop-opacity:0.75"/>
    </linearGradient>
    <linearGradient id="overlay" x1="0%" y1="60%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#000;stop-opacity:0"/>
      <stop offset="100%" style="stop-color:#000;stop-opacity:0.5"/>
    </linearGradient>
  </defs>
  <!-- Fondo -->
  <rect width="400" height="300" fill="url(#bg)"/>
  <!-- Patrón hexagonal decorativo -->
  <g opacity="0.08" fill="#ffffff">
    <polygon points="60,30 90,30 105,55 90,80 60,80 45,55" />
    <polygon points="120,30 150,30 165,55 150,80 120,80 105,55" />
    <polygon points="180,30 210,30 225,55 210,80 180,80 165,55" />
    <polygon points="240,30 270,30 285,55 270,80 240,80 225,55" />
    <polygon points="300,30 330,30 345,55 330,80 300,80 285,55" />
    <polygon points="360,30 390,30 405,55 390,80 360,80 345,55" />
    <polygon points="90,80 120,80 135,105 120,130 90,130 75,105" />
    <polygon points="150,80 180,80 195,105 180,130 150,130 135,105" />
    <polygon points="210,80 240,80 255,105 240,130 210,130 195,105" />
    <polygon points="270,80 300,80 315,105 300,130 270,130 255,105" />
    <polygon points="330,80 360,80 375,105 360,130 330,130 315,105" />
    <polygon points="60,130 90,130 105,155 90,180 60,180 45,155" />
    <polygon points="120,130 150,130 165,155 150,180 120,180 105,155" />
    <polygon points="300,130 330,130 345,155 330,180 300,180 285,155" />
    <polygon points="360,130 390,130 405,155 390,180 360,180 345,155" />
  </g>
  <!-- Overlay inferior -->
  <rect width="400" height="300" fill="url(#overlay)"/>
  <!-- Etiqueta de categoría -->
  <rect x="20" y="20" width="${label.length * 9 + 20}" height="28" rx="4" fill="#ffffff" opacity="0.2"/>
  <text x="30" y="39" font-family="Arial, sans-serif" font-size="13" fill="#ffffff" font-weight="600" opacity="0.95">${label}</text>
  <!-- Nombre del producto -->
  <text x="200" y="170" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="34" fill="#ffffff" text-anchor="middle" style="text-shadow:0 2px 8px rgba(0,0,0,0.4)">${nombreCorto}</text>
  <!-- Subtítulo -->
  <text x="200" y="205" font-family="Arial, sans-serif" font-size="16" fill="#ffffff" text-anchor="middle" opacity="0.85">${subtitulo}</text>
  <!-- Línea decorativa -->
  <line x1="140" y1="220" x2="260" y2="220" stroke="#ffffff" stroke-width="1.5" opacity="0.4"/>
  <!-- Logo FERCADI -->
  <text x="200" y="268" font-family="Arial, sans-serif" font-size="12" fill="#ffffff" text-anchor="middle" opacity="0.5" letter-spacing="3">FERCADI</text>
</svg>`;
}

// ── Sube a Supabase Storage ───────────────────────────────────────────────────
async function subirSupabase(path, svgContent) {
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'image/svg+xml',
      'x-upsert': 'true',
    },
    body: svgContent,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Upload failed [${res.status}]: ${txt}`);
  }
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🚀 Subiendo ${PRODUCTOS.length} imágenes a Supabase Storage...\n`);

  for (const p of PRODUCTOS) {
    const svg  = generarSVG(p.nombre, p.subtitulo, p.cat);
    const path = `productos/concretos/${p.cat}/${p.id}.svg`;

    try {
      const publicUrl = await subirSupabase(path, svg);
      await pool.query('UPDATE productos SET imagen_url = $1 WHERE id = $2', [publicUrl, p.id]);
      console.log(`  ✅ [${p.id}] ${p.nombre}`);
    } catch (err) {
      console.error(`  ❌ [${p.id}] ${p.nombre}: ${err.message}`);
    }
  }

  await pool.end();
  console.log('\n✅ Proceso completado.\n');
}

main();
