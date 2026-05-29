'use client'

import React, { useState, useCallback } from 'react'
import styles from '@/styles/calculadora.module.css'

/* ── Tipos ─────────────────────────────────────────────── */
type Unidad = 'cm' | 'm' | 'pies' | 'pulgadas'
type FormaId = 'losa' | 'columna' | 'tubo' | 'pared' | 'cimientos' | 'escaleras'

interface Dim { valor: string; unidad: Unidad }
interface FormaState {
  id: string
  forma: FormaId
  collapsed: boolean
  dims: Record<string, Dim>
  tipoConcreto: string
}

/* ── Constantes ────────────────────────────────────────── */
const UNIDADES: Unidad[] = ['cm', 'm', 'pies', 'pulgadas']
const FACTOR: Record<Unidad, number> = { cm: 0.01, m: 1, pies: 0.3048, pulgadas: 0.0254 }

const TIPOS_CONCRETO = [
  'Concreto Modular',
  'Concreto FC/150 KG/cm²',
  'Concreto FC/200 KG/cm²',
  'Concreto FC/350 KG/cm²',
  'Concreto MR',
  'Concreto Antibacterial',
  'Concreto Autocompactable',
  'Concreto Durable',
  'Concreto de Edad Temprana',
  'Concreto Impermeable',
  'Concreto Ligero',
  'Concreto Permeable',
  'Concreto Pigmentado',
]

const FORMAS: { id: FormaId; label: string; campos: { key: string; label: string }[]; icon: string }[] = [
  {
    id: 'losa', label: 'Cuadrado/Losa',
    campos: [{ key: 'longitud', label: 'Longitud' }, { key: 'ancho', label: 'Ancho' }, { key: 'altura', label: 'Altura' }],
    icon: '⬛',
  },
  {
    id: 'columna', label: 'Columna',
    campos: [{ key: 'diametro', label: 'Diámetro' }, { key: 'altura', label: 'Altura' }],
    icon: '🔵',
  },
  {
    id: 'tubo', label: 'Tubo',
    campos: [{ key: 'dExt', label: 'Diám. Exterior' }, { key: 'dInt', label: 'Diám. Interior' }, { key: 'altura', label: 'Altura' }],
    icon: '⭕',
  },
  {
    id: 'pared', label: 'Pared',
    campos: [{ key: 'longitud', label: 'Longitud' }, { key: 'altura', label: 'Altura' }, { key: 'espesor', label: 'Espesor' }],
    icon: '🟦',
  },
  {
    id: 'cimientos', label: 'Cimientos corridos',
    campos: [{ key: 'longitud', label: 'Longitud' }, { key: 'ancho', label: 'Ancho' }, { key: 'profundidad', label: 'Profundidad' }],
    icon: '📐',
  },
  {
    id: 'escaleras', label: 'Escaleras',
    campos: [{ key: 'longitud', label: 'Longitud' }, { key: 'ancho', label: 'Ancho' }, { key: 'altura', label: 'Altura' }, { key: 'pasos', label: 'N° Pasos' }],
    icon: '🪜',
  },
]

/* ── Cálculo de volumen ────────────────────────────────── */
function toM(dim: Dim): number {
  const v = parseFloat(dim.valor)
  return isNaN(v) ? 0 : v * FACTOR[dim.unidad]
}

function calcularVolumen(f: FormaState): number {
  const d = f.dims
  switch (f.forma) {
    case 'losa':      return toM(d.longitud) * toM(d.ancho) * toM(d.altura)
    case 'columna':   return Math.PI * Math.pow(toM(d.diametro) / 2, 2) * toM(d.altura)
    case 'tubo': {
      const re = toM(d.dExt) / 2, ri = toM(d.dInt) / 2
      return Math.PI * (re * re - ri * ri) * toM(d.altura)
    }
    case 'pared':     return toM(d.longitud) * toM(d.altura) * toM(d.espesor)
    case 'cimientos': return toM(d.longitud) * toM(d.ancho) * toM(d.profundidad)
    case 'escaleras': {
      const pasos = parseInt(d.pasos?.valor ?? '1') || 1
      return 0.5 * toM(d.longitud) * toM(d.ancho) * toM(d.altura) * pasos
    }
    default: return 0
  }
}

/* ── Estado inicial de una forma ───────────────────────── */
let idCounter = 1
function nuevaForma(forma: FormaId = 'losa'): FormaState {
  const def: Dim = { valor: '', unidad: 'cm' }
  return {
    id: String(idCounter++),
    forma,
    collapsed: false,
    tipoConcreto: TIPOS_CONCRETO[0],
    dims: { longitud: { ...def }, ancho: { ...def }, altura: { ...def }, espesor: { ...def }, diametro: { ...def }, dExt: { ...def }, dInt: { ...def }, profundidad: { ...def }, pasos: { valor: '1', unidad: 'm' } },
  }
}

/* ── Íconos SVG de formas ──────────────────────────────── */
function ShapeIcon({ id, active }: { id: FormaId; active: boolean }) {
  const color = active ? '#fff' : '#3565c5'
  const s = { fill: 'none', stroke: color, strokeWidth: 1.5 }
  const icons: Record<FormaId, React.ReactElement> = {
    losa: (
      <svg viewBox="0 0 40 40" width="36" height="36">
        <rect x="4" y="14" width="24" height="14" {...s} />
        <line x1="4" y1="14" x2="12" y2="6" {...s} />
        <line x1="28" y1="14" x2="36" y2="6" {...s} />
        <line x1="12" y1="6" x2="36" y2="6" {...s} />
        <line x1="36" y1="6" x2="36" y2="20" {...s} />
        <line x1="28" y1="28" x2="36" y2="20" {...s} />
      </svg>
    ),
    columna: (
      <svg viewBox="0 0 40 40" width="36" height="36">
        <ellipse cx="20" cy="10" rx="14" ry="5" {...s} />
        <ellipse cx="20" cy="30" rx="14" ry="5" {...s} />
        <line x1="6" y1="10" x2="6" y2="30" {...s} />
        <line x1="34" y1="10" x2="34" y2="30" {...s} />
      </svg>
    ),
    tubo: (
      <svg viewBox="0 0 40 40" width="36" height="36">
        <ellipse cx="20" cy="10" rx="14" ry="5" {...s} />
        <ellipse cx="20" cy="10" rx="7" ry="2.5" {...s} />
        <ellipse cx="20" cy="30" rx="14" ry="5" {...s} />
        <ellipse cx="20" cy="30" rx="7" ry="2.5" {...s} />
        <line x1="6" y1="10" x2="6" y2="30" {...s} />
        <line x1="34" y1="10" x2="34" y2="30" {...s} />
      </svg>
    ),
    pared: (
      <svg viewBox="0 0 40 40" width="36" height="36">
        <rect x="6" y="8" width="28" height="24" {...s} />
        <line x1="6" y1="16" x2="34" y2="16" {...s} />
        <line x1="6" y1="24" x2="34" y2="24" {...s} />
        <line x1="20" y1="8" x2="20" y2="16" {...s} />
        <line x1="13" y1="16" x2="13" y2="24" {...s} />
        <line x1="27" y1="16" x2="27" y2="24" {...s} />
        <line x1="20" y1="24" x2="20" y2="32" {...s} />
      </svg>
    ),
    cimientos: (
      <svg viewBox="0 0 40 40" width="36" height="36">
        <rect x="2" y="20" width="36" height="12" {...s} />
        <line x1="2" y1="20" x2="8" y2="12" {...s} />
        <line x1="38" y1="20" x2="38" y2="20" {...s} />
        <line x1="8" y1="12" x2="38" y2="12" {...s} />
        <line x1="38" y1="12" x2="38" y2="20" {...s} />
      </svg>
    ),
    escaleras: (
      <svg viewBox="0 0 40 40" width="36" height="36">
        <polyline points="4,36 4,28 14,28 14,20 24,20 24,12 34,12 34,36" {...s} />
        <line x1="4" y1="36" x2="34" y2="36" {...s} />
      </svg>
    ),
  }
  return icons[id]
}

/* ── Componente principal ──────────────────────────────── */
export default function CalculadoraVolumen() {
  const [formas, setFormas] = useState<FormaState[]>([nuevaForma('losa')])
  const [reserva, setReserva] = useState('10')

  const update = useCallback((id: string, patch: Partial<FormaState>) =>
    setFormas((fs) => fs.map((f) => f.id === id ? { ...f, ...patch } : f)), [])

  const updateDim = useCallback((id: string, key: string, patch: Partial<Dim>) =>
    setFormas((fs) => fs.map((f) =>
      f.id === id ? { ...f, dims: { ...f.dims, [key]: { ...f.dims[key], ...patch } } } : f
    )), [])

  const agregar = () => setFormas((fs) => [...fs, nuevaForma('losa')])
  const eliminar = (id: string) => setFormas((fs) => fs.filter((f) => f.id !== id))

  const volumenes = formas.map((f) => calcularVolumen(f))
  const totalBase = volumenes.reduce((s, v) => s + v, 0)
  const pct = parseFloat(reserva) || 0
  const extra = totalBase * (pct / 100)
  const total = totalBase + extra

  const fmt = (v: number) => v.toFixed(2)

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.titulo}>Calcula tu volumen</h2>
      <div className={styles.layout}>
        {/* ── Columna izquierda ── */}
        <div className={styles.izq}>

          {formas.map((f, idx) => {
            const def = FORMAS.find((x) => x.id === f.forma)!
            const vol = volumenes[idx]

            return (
              <div key={f.id} className={styles.formaCard}>
                {/* Cabecera */}
                <div className={styles.formaHeader}>
                  <span className={styles.formaLabel}>Forma {String.fromCharCode(65 + idx)}</span>
                  <div className={styles.formaActions}>
                    <button className={styles.iconBtn} title="Eliminar" onClick={() => eliminar(f.id)}>🗑</button>
                    <button className={styles.iconBtn} onClick={() => update(f.id, { collapsed: !f.collapsed })}>
                      {f.collapsed ? '▼' : '▲'}
                    </button>
                  </div>
                </div>

                {!f.collapsed && (
                  <>
                    {/* Selector de forma */}
                    <div className={styles.shapesGrid}>
                      {FORMAS.map((s) => (
                        <button
                          key={s.id}
                          className={`${styles.shapeBtn} ${f.forma === s.id ? styles.shapeBtnActivo : ''}`}
                          onClick={() => update(f.id, { forma: s.id })}
                          title={s.label}
                        >
                          <ShapeIcon id={s.id} active={f.forma === s.id} />
                          <span>{s.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Campos de dimensiones */}
                    <div className={styles.campos}>
                      {def.campos.map((c) => (
                        <div key={c.key} className={styles.campoRow}>
                          <div className={styles.campoGroup}>
                            <label className={styles.campoLabel}>{c.label}</label>
                            <input
                              type="number"
                              min="0"
                              className={styles.campoInput}
                              value={f.dims[c.key]?.valor ?? ''}
                              onChange={(e) => updateDim(f.id, c.key, { valor: e.target.value })}
                            />
                          </div>
                          {c.key !== 'pasos' && (
                            <div className={styles.campoGroup}>
                              <label className={styles.campoLabel}>Unidad</label>
                              <select
                                className={styles.campoSelect}
                                value={f.dims[c.key]?.unidad ?? 'cm'}
                                onChange={(e) => updateDim(f.id, c.key, { unidad: e.target.value as Unidad })}
                              >
                                {UNIDADES.map((u) => <option key={u}>{u}</option>)}
                              </select>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Tipo de concreto */}
                      <div className={styles.campoGroup} style={{ marginTop: 8 }}>
                        <label className={styles.campoLabel}>Tipo de concreto</label>
                        <select
                          className={styles.campoSelect}
                          style={{ maxWidth: 280 }}
                          value={f.tipoConcreto}
                          onChange={(e) => update(f.id, { tipoConcreto: e.target.value })}
                        >
                          {TIPOS_CONCRETO.map((t) => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>

                    <p className={styles.volPrev}>
                      Volumen calculado: <strong>{fmt(vol)} m³</strong>
                    </p>
                  </>
                )}
              </div>
            )
          })}

          <button className={styles.agregarBtn} onClick={agregar}>+ Agregar forma</button>
        </div>

        {/* ── Panel derecho ── */}
        <div className={styles.panel}>
          <h3 className={styles.panelTitulo}>Detalle del pedido</h3>

          <div className={styles.panelItems}>
            {formas.map((f, idx) => (
              <div key={f.id} className={styles.panelItem}>
                <span className={styles.panelItemNombre}>
                  {FORMAS.find((x) => x.id === f.forma)?.label}
                </span>
                <span className={styles.panelItemVol}>{fmt(volumenes[idx])} m³</span>
              </div>
            ))}
          </div>

          <div className={styles.reservaRow}>
            <span className={styles.reservaLabel}>Volumen de reserva</span>
            <div className={styles.reservaInputWrap}>
              <input
                type="number"
                min="0"
                max="100"
                className={styles.reservaInput}
                value={reserva}
                onChange={(e) => setReserva(e.target.value)}
              />
              <span className={styles.reservaPct}>%</span>
            </div>
            <span className={styles.reservaExtra}>+{fmt(extra)} m³</span>
          </div>

          <div className={styles.totalRow}>
            <span>Volumen total</span>
            <span className={styles.totalVal}>{fmt(total)} m³</span>
          </div>

          <a href="/cotizacion" className={styles.cotizarBtn}>COTIZAR</a>
        </div>
      </div>
    </div>
  )
}
