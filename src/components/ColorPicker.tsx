'use client'

import { useState } from 'react'
import styles from '@/styles/colorpicker.module.css'

const familias = [
  { id: 'blanco',   label: 'Blanco',    color: '#daeef5' },
  { id: 'amarillo', label: 'Amarillo',  color: '#f5e520' },
  { id: 'naranja',  label: 'Naranja',   color: '#f5901e' },
  { id: 'rojo',     label: 'Rojo',      color: '#cc2020' },
  { id: 'rosa',     label: 'Rosa',      color: '#e060a0' },
  { id: 'morado',   label: 'Morado',    color: '#9060c8' },
  { id: 'petroleo', label: 'Petróleo',  color: '#1a7a8a' },
  { id: 'teal',     label: 'Teal',      color: '#1a9090' },
  { id: 'verde',    label: 'Verde',     color: '#1a7a40' },
  { id: 'lima',     label: 'Lima',      color: '#c8d820' },
  { id: 'azulgris', label: 'Azul Gris', color: '#8aacbe' },
  { id: 'gris',     label: 'Gris',      color: '#888888' },
  { id: 'dorado',   label: 'Dorado',    color: '#b8860b' },
]

const superficies = [
  'Todas las Superficies',
  'Interior',
  'Exterior',
  'Madera',
  'Metal',
  'Concreto',
]

const coloresPorFamilia: Record<string, { hex: string; nombre: string }[]> = {
  blanco: [
    { hex: '#ffffff', nombre: 'Blanco Puro' }, { hex: '#f5f5f5', nombre: 'Blanco Niebla' },
    { hex: '#eef4f8', nombre: 'Blanco Azulado' }, { hex: '#f0f0e8', nombre: 'Blanco Marfil' },
    { hex: '#e8ede8', nombre: 'Blanco Verde' }, { hex: '#f8f0e8', nombre: 'Blanco Cálido' },
    { hex: '#ede8f0', nombre: 'Blanco Lila' }, { hex: '#f0ece0', nombre: 'Crema' },
    { hex: '#e8e0d8', nombre: 'Crema Oscuro' }, { hex: '#d8d0c8', nombre: 'Arena Claro' },
    { hex: '#e4e4e4', nombre: 'Gris Perla' }, { hex: '#dcdcdc', nombre: 'Plata Claro' },
  ],
  amarillo: [
    { hex: '#fff9c4', nombre: 'Amarillo Pálido' }, { hex: '#fff176', nombre: 'Amarillo Claro' },
    { hex: '#ffee58', nombre: 'Amarillo Suave' }, { hex: '#fdd835', nombre: 'Amarillo' },
    { hex: '#fbc02d', nombre: 'Amarillo Intenso' }, { hex: '#f9a825', nombre: 'Ámbar' },
    { hex: '#f5e520', nombre: 'Amarillo Brillante' }, { hex: '#e6d000', nombre: 'Oro' },
    { hex: '#ffe082', nombre: 'Crema Amarillo' }, { hex: '#ffd54f', nombre: 'Miel' },
    { hex: '#ffca28', nombre: 'Dorado Claro' }, { hex: '#ffb300', nombre: 'Dorado' },
  ],
  naranja: [
    { hex: '#ffe0b2', nombre: 'Durazno Claro' }, { hex: '#ffcc80', nombre: 'Durazno' },
    { hex: '#ffb74d', nombre: 'Naranja Claro' }, { hex: '#ffa726', nombre: 'Naranja' },
    { hex: '#fb8c00', nombre: 'Naranja Intenso' }, { hex: '#f57c00', nombre: 'Naranja Oscuro' },
    { hex: '#e65100', nombre: 'Naranja Quemado' }, { hex: '#bf360c', nombre: 'Teja' },
    { hex: '#ffab91', nombre: 'Salmón Claro' }, { hex: '#ff8a65', nombre: 'Salmón' },
    { hex: '#ff7043', nombre: 'Coral' }, { hex: '#f4511e', nombre: 'Rojo Naranja' },
  ],
  rojo: [
    { hex: '#fde8e8', nombre: 'Rosa Muy Claro' }, { hex: '#fcc8c8', nombre: 'Rosa Claro' },
    { hex: '#f9a0a0', nombre: 'Rosa' }, { hex: '#f57070', nombre: 'Rojo Claro' },
    { hex: '#f04040', nombre: 'Rojo Suave' }, { hex: '#cc2020', nombre: 'Rojo' },
    { hex: '#aa1818', nombre: 'Rojo Oscuro' }, { hex: '#881010', nombre: 'Rojo Profundo' },
    { hex: '#d4786e', nombre: 'Terracota Claro' }, { hex: '#c45848', nombre: 'Terracota' },
    { hex: '#b43838', nombre: 'Carmín' }, { hex: '#8b3a3a', nombre: 'Borgoña' },
    { hex: '#e8b0a0', nombre: 'Coral Claro' }, { hex: '#d89080', nombre: 'Coral' },
    { hex: '#f0d0c8', nombre: 'Salmón Pálido' }, { hex: '#e8b8a8', nombre: 'Salmón Claro' },
    { hex: '#7a2a2a', nombre: 'Vino' }, { hex: '#6a1a1a', nombre: 'Granate' },
    { hex: '#f0c0b8', nombre: 'Rosa Salmón' }, { hex: '#e0a098', nombre: 'Melocotón' },
    { hex: '#e8d0cc', nombre: 'Rosa Viejo' }, { hex: '#d8b0a8', nombre: 'Rosa Polvoso' },
    { hex: '#5a1010', nombre: 'Granate Oscuro' }, { hex: '#c86868', nombre: 'Frambuesa' },
  ],
  rosa: [
    { hex: '#fce4ec', nombre: 'Rosa Pálido' }, { hex: '#f8bbd0', nombre: 'Rosa Claro' },
    { hex: '#f48fb1', nombre: 'Rosa' }, { hex: '#f06292', nombre: 'Rosa Intenso' },
    { hex: '#ec407a', nombre: 'Rosa Fuerte' }, { hex: '#e91e63', nombre: 'Fresa' },
    { hex: '#c2185b', nombre: 'Rosa Oscuro' }, { hex: '#880e4f', nombre: 'Fucsia Oscuro' },
    { hex: '#f0a0c0', nombre: 'Chicle' }, { hex: '#e060a0', nombre: 'Fucsia' },
    { hex: '#ff80ab', nombre: 'Rosa Neón' }, { hex: '#ff4081', nombre: 'Magenta' },
  ],
  morado: [
    { hex: '#f3e5f5', nombre: 'Lila Pálido' }, { hex: '#e1bee7', nombre: 'Lavanda Claro' },
    { hex: '#ce93d8', nombre: 'Lavanda' }, { hex: '#ba68c8', nombre: 'Lila' },
    { hex: '#ab47bc', nombre: 'Orquídea' }, { hex: '#9c27b0', nombre: 'Morado' },
    { hex: '#7b1fa2', nombre: 'Morado Oscuro' }, { hex: '#4a148c', nombre: 'Violeta Oscuro' },
    { hex: '#9060c8', nombre: 'Violeta' }, { hex: '#7c4dff', nombre: 'Índigo' },
    { hex: '#b39ddb', nombre: 'Malva' }, { hex: '#9575cd', nombre: 'Amatista' },
  ],
  petroleo: [
    { hex: '#e0f2f1', nombre: 'Verde Agua Pálido' }, { hex: '#b2dfdb', nombre: 'Verde Agua' },
    { hex: '#80cbc4', nombre: 'Turquesa Claro' }, { hex: '#4db6ac', nombre: 'Turquesa' },
    { hex: '#26a69a', nombre: 'Verde Petróleo' }, { hex: '#00897b', nombre: 'Jade' },
    { hex: '#00695c', nombre: 'Petróleo' }, { hex: '#004d40', nombre: 'Petróleo Oscuro' },
    { hex: '#1a7a8a', nombre: 'Azul Petróleo' }, { hex: '#00838f', nombre: 'Cian Oscuro' },
    { hex: '#006064', nombre: 'Teal Oscuro' }, { hex: '#004c5a', nombre: 'Azul Verde' },
  ],
  teal: [
    { hex: '#e0f7fa', nombre: 'Cian Pálido' }, { hex: '#b2ebf2', nombre: 'Cian Claro' },
    { hex: '#80deea', nombre: 'Cian' }, { hex: '#4dd0e1', nombre: 'Cian Intenso' },
    { hex: '#26c6da', nombre: 'Turquesa Brillante' }, { hex: '#00bcd4', nombre: 'Cian Vivo' },
    { hex: '#00acc1', nombre: 'Pavo Real' }, { hex: '#0097a7', nombre: 'Teal' },
    { hex: '#1a9090', nombre: 'Verde Teal' }, { hex: '#00838f', nombre: 'Teal Oscuro' },
    { hex: '#006064', nombre: 'Verde Profundo' }, { hex: '#00e5ff', nombre: 'Cian Neón' },
  ],
  verde: [
    { hex: '#e8f5e9', nombre: 'Verde Pálido' }, { hex: '#c8e6c9', nombre: 'Verde Claro' },
    { hex: '#a5d6a7', nombre: 'Verde Suave' }, { hex: '#81c784', nombre: 'Verde Manzana' },
    { hex: '#66bb6a', nombre: 'Verde' }, { hex: '#4caf50', nombre: 'Verde Vivo' },
    { hex: '#388e3c', nombre: 'Verde Oscuro' }, { hex: '#1b5e20', nombre: 'Verde Bosque' },
    { hex: '#1a7a40', nombre: 'Verde Selva' }, { hex: '#2e7d32', nombre: 'Verde Hoja' },
    { hex: '#558b2f', nombre: 'Verde Olivo' }, { hex: '#33691e', nombre: 'Verde Musgo' },
  ],
  lima: [
    { hex: '#f9fbe7', nombre: 'Lima Pálido' }, { hex: '#f0f4c3', nombre: 'Lima Claro' },
    { hex: '#e6ee9c', nombre: 'Lima Suave' }, { hex: '#dce775', nombre: 'Lima' },
    { hex: '#d4e157', nombre: 'Lima Intenso' }, { hex: '#cddc39', nombre: 'Lima Vivo' },
    { hex: '#afb42b', nombre: 'Lima Oscuro' }, { hex: '#827717', nombre: 'Oliva' },
    { hex: '#c8d820', nombre: 'Lima Brillante' }, { hex: '#b0c010', nombre: 'Kiwi' },
    { hex: '#9acd32', nombre: 'Verde Lima' }, { hex: '#8db600', nombre: 'Verde Amarillo' },
  ],
  azulgris: [
    { hex: '#eceff1', nombre: 'Azul Hielo' }, { hex: '#cfd8dc', nombre: 'Azul Claro' },
    { hex: '#b0bec5', nombre: 'Azul Gris Claro' }, { hex: '#90a4ae', nombre: 'Azul Gris' },
    { hex: '#78909c', nombre: 'Acero' }, { hex: '#607d8b', nombre: 'Acero Oscuro' },
    { hex: '#455a64', nombre: 'Pizarra' }, { hex: '#263238', nombre: 'Pizarra Oscuro' },
    { hex: '#8aacbe', nombre: 'Celeste' }, { hex: '#7090a8', nombre: 'Azul Acero' },
    { hex: '#bbdefb', nombre: 'Azul Pálido' }, { hex: '#90caf9', nombre: 'Azul Cielo' },
  ],
  gris: [
    { hex: '#fafafa', nombre: 'Blanco Gris' }, { hex: '#f5f5f5', nombre: 'Gris 100' },
    { hex: '#eeeeee', nombre: 'Gris 200' }, { hex: '#e0e0e0', nombre: 'Gris 300' },
    { hex: '#bdbdbd', nombre: 'Gris 400' }, { hex: '#9e9e9e', nombre: 'Gris 500' },
    { hex: '#757575', nombre: 'Gris 600' }, { hex: '#616161', nombre: 'Gris 700' },
    { hex: '#424242', nombre: 'Gris 800' }, { hex: '#212121', nombre: 'Gris 900' },
    { hex: '#888888', nombre: 'Gris Medio' }, { hex: '#555555', nombre: 'Gris Oscuro' },
  ],
  dorado: [
    { hex: '#fff8e1', nombre: 'Crema Dorado' }, { hex: '#ffecb3', nombre: 'Mantequilla' },
    { hex: '#ffe082', nombre: 'Dorado Pálido' }, { hex: '#ffd54f', nombre: 'Dorado Claro' },
    { hex: '#ffca28', nombre: 'Dorado' }, { hex: '#ffb300', nombre: 'Dorado Intenso' },
    { hex: '#ff8f00', nombre: 'Ámbar Oscuro' }, { hex: '#e65100', nombre: 'Bronce' },
    { hex: '#b8860b', nombre: 'Oro Viejo' }, { hex: '#a0780a', nombre: 'Ocre' },
    { hex: '#8b6914', nombre: 'Cobre' }, { hex: '#6d4c41', nombre: 'Marrón Dorado' },
  ],
}

export default function ColorPicker() {
  const [familiaActiva, setFamiliaActiva] = useState('rojo')
  const [superficie, setSuperficie] = useState('Todas las Superficies')
  const [busqueda, setBusqueda] = useState('')
  const [colorSeleccionado, setColorSeleccionado] = useState<{ hex: string; nombre: string } | null>(null)
  const [familiasOpen, setFamiliasOpen] = useState(true)
  const [tendenciasOpen, setTendenciasOpen] = useState(false)
  const [lineasOpen, setLineasOpen] = useState(false)
  const [otrosOpen, setOtrosOpen] = useState(false)

  const colores = coloresPorFamilia[familiaActiva] ?? []
  const coloresFiltrados = busqueda
    ? Object.values(coloresPorFamilia).flat().filter(
        (c) =>
          c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          c.hex.toLowerCase().includes(busqueda.toLowerCase())
      )
    : colores

  const wallColor = colorSeleccionado?.hex ?? '#e2dcd5'

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.titulo}>Elige tu color</h2>

      {/* ── Preview de habitación ── */}
      <div className={styles.muruWrap}>
        <svg className={styles.muruSvg} viewBox="0 0 700 260" xmlns="http://www.w3.org/2000/svg">
          {/* Techo */}
          <rect x="0" y="0" width="700" height="30" fill="#f2f0ee"/>
          <rect x="0" y="28" width="700" height="4" fill="#e0dbd4"/>
          {/* Pared principal */}
          <rect x="0" y="32" width="700" height="198" fill={wallColor} style={{ transition: 'fill 0.35s ease' }}/>
          {/* Rodapié */}
          <rect x="0" y="224" width="700" height="10" fill="#ddd8cc"/>
          {/* Piso */}
          <rect x="0" y="234" width="700" height="26" fill="#c4a97a"/>
          <line x1="0"   y1="245" x2="700" y2="245" stroke="#b89560" strokeWidth="1" strokeOpacity="0.4"/>
          <line x1="140" y1="234" x2="140" y2="260" stroke="#b89560" strokeWidth="1" strokeOpacity="0.4"/>
          <line x1="280" y1="234" x2="280" y2="260" stroke="#b89560" strokeWidth="1" strokeOpacity="0.4"/>
          <line x1="420" y1="234" x2="420" y2="260" stroke="#b89560" strokeWidth="1" strokeOpacity="0.4"/>
          <line x1="560" y1="234" x2="560" y2="260" stroke="#b89560" strokeWidth="1" strokeOpacity="0.4"/>
          {/* Ventana */}
          <rect x="80" y="65" width="165" height="120" rx="2" fill="none" stroke="#c0b8a8" strokeWidth="5"/>
          <rect x="83" y="68" width="159" height="114" rx="1" fill="#cce8f4" fillOpacity="0.6"/>
          <rect x="83" y="68" width="159" height="114" rx="1" fill="url(#windowLight)" fillOpacity="0.5"/>
          <line x1="163" y1="68" x2="163" y2="182" stroke="#c0b8a8" strokeWidth="3"/>
          <line x1="83"  y1="125" x2="242" y2="125" stroke="#c0b8a8" strokeWidth="3"/>
          <rect x="76" y="60" width="173" height="12" rx="3" fill="#ddd8cc"/>
          <rect x="76" y="182" width="173" height="8"  rx="2" fill="rgba(0,0,0,0.06)"/>
          {/* Puerta */}
          <rect x="475" y="90" width="130" height="144" rx="2" fill="none" stroke="#c0a880" strokeWidth="5"/>
          <rect x="478" y="93" width="124" height="138" rx="1" fill="#c8a870" fillOpacity="0.45"/>
          <rect x="490" y="108" width="45" height="60" rx="2" fill="rgba(0,0,0,0.06)"/>
          <rect x="553" y="108" width="38" height="60" rx="2" fill="rgba(0,0,0,0.06)"/>
          <circle cx="508" cy="165" r="7" fill="#c8a040"/>
          <circle cx="508" cy="165" r="4" fill="#b89030"/>
          <rect x="468" y="83" width="149" height="14" rx="3" fill="#ddd8cc"/>
          {/* Cuadro decorativo */}
          <rect x="310" y="75" width="110" height="80" rx="3" fill="rgba(0,0,0,0.07)" stroke="#c8c0b0" strokeWidth="2"/>
          <rect x="316" y="81" width="98"  height="68" rx="2" fill="rgba(255,255,255,0.35)"/>
          <defs>
            <linearGradient id="windowLight" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="white" stopOpacity="0.5"/>
              <stop offset="100%" stopColor="white" stopOpacity="0"/>
            </linearGradient>
          </defs>
        </svg>
        {colorSeleccionado ? (
          <div className={styles.muruInfo}>
            <div className={styles.muruChip} style={{ backgroundColor: colorSeleccionado.hex }}/>
            <div>
              <p className={styles.muruNombre}>{colorSeleccionado.nombre}</p>
              <p className={styles.muruHex}>{colorSeleccionado.hex.toUpperCase()}</p>
            </div>
          </div>
        ) : (
          <div className={styles.muruHint}>Selecciona un color para visualizarlo</div>
        )}
      </div>

      <div className={styles.layout}>
        {/* Panel izquierdo */}
        <div className={styles.panelIzq}>
          {/* Buscador y superficie */}
          <div className={styles.filtros}>
            <div className={styles.buscadorWrap}>
              <label className={styles.filtroLabel}>Busca colores por nombre o código</label>
              <div className={styles.inputWrap}>
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className={styles.input}
                  placeholder=""
                />
                <span className={styles.lupaIcon}>&#128269;</span>
              </div>
            </div>
            <div className={styles.superficieWrap}>
              <label className={styles.filtroLabel}>¿Sobre qué superficie vas a trabajar?</label>
              <select
                value={superficie}
                onChange={(e) => setSuperficie(e.target.value)}
                className={styles.select}
              >
                {superficies.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Familias de Color */}
          <div className={styles.acordeon}>
            <button className={styles.acordeonHeader} onClick={() => setFamiliasOpen((o) => !o)}>
              <span>Familias de Color</span>
              <span className={styles.acordeonIcon}>{familiasOpen ? '−' : '+'}</span>
            </button>
            {familiasOpen && (
              <div className={styles.familiasGrid}>
                {familias.map((f) => (
                  <button
                    key={f.id}
                    title={f.label}
                    className={`${styles.familiaBtn} ${familiaActiva === f.id ? styles.familiaActiva : ''}`}
                    style={{ backgroundColor: f.color }}
                    onClick={() => { setFamiliaActiva(f.id); setBusqueda('') }}
                  >
                    {familiaActiva === f.id && <span className={styles.check}>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tendencias */}
          <div className={styles.acordeon}>
            <button className={styles.acordeonHeader} onClick={() => setTendenciasOpen((o) => !o)}>
              <span>Tendencias de Color</span>
              <span className={styles.acordeonIcon}>{tendenciasOpen ? '›' : '›'}</span>
            </button>
            {tendenciasOpen && (
              <p className={styles.acordeonTexto}>Próximamente disponible.</p>
            )}
          </div>

          {/* Colores de Línea */}
          <div className={styles.acordeon}>
            <button className={styles.acordeonHeader} onClick={() => setLineasOpen((o) => !o)}>
              <span>Colores de Línea</span>
              <span className={styles.acordeonIcon}>{lineasOpen ? '−' : '+'}</span>
            </button>
            {lineasOpen && (
              <p className={styles.acordeonTexto}>Próximamente disponible.</p>
            )}
          </div>

          {/* Otros */}
          <div className={styles.acordeon}>
            <button className={styles.acordeonHeader} onClick={() => setOtrosOpen((o) => !o)}>
              <span>Otros</span>
              <span className={styles.acordeonIcon}>{otrosOpen ? '−' : '+'}</span>
            </button>
            {otrosOpen && (
              <p className={styles.acordeonTexto}>Próximamente disponible.</p>
            )}
          </div>
        </div>

        {/* Panel derecho — grid de colores */}
        <div className={styles.panelDer}>
          {colorSeleccionado && (
            <div className={styles.colorInfo}>
              <div className={styles.colorMuestra} style={{ backgroundColor: colorSeleccionado.hex }} />
              <div>
                <p className={styles.colorNombre}>{colorSeleccionado.nombre}</p>
                <p className={styles.colorCodigo}>{colorSeleccionado.hex.toUpperCase()}</p>
              </div>
            </div>
          )}
          <div className={styles.coloresGrid}>
            {coloresFiltrados.map((c) => (
              <button
                key={c.hex + c.nombre}
                title={`${c.nombre} — ${c.hex}`}
                className={`${styles.swatchBtn} ${colorSeleccionado?.hex === c.hex ? styles.swatchActivo : ''}`}
                style={{ backgroundColor: c.hex }}
                onClick={() => setColorSeleccionado(c)}
              />
            ))}
            {coloresFiltrados.length === 0 && (
              <p className={styles.sinResultados}>Sin resultados para &quot;{busqueda}&quot;</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
