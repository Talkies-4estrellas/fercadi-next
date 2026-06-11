'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from '@/styles/comentarios.module.css';

/* ── Tipos ─────────────────────────────────────────────────── */
interface Comentario {
  id: number;
  nombre: string;
  comentario: string;
  calificacion: number;
  creado_en: string;
}

interface Props {
  productoId: number;
}

const MAX_CHARS = 500;

/* ── Helper: renderizar estrellas (solo lectura) ─────────────── */
function Estrellas({ valor, size = 'sm' }: { valor: number; size?: 'sm' | 'md' }) {
  const cls = size === 'md' ? { full: styles.starFull, empty: styles.starEmpty } : { full: styles.starFull, empty: styles.starEmpty };
  return (
    <span className={styles.starsRow} aria-label={`${valor} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <i
          key={n}
          className={`fa-solid fa-star ${n <= valor ? cls.full : styles.starEmpty}`}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

/* ── Helper: promedio ───────────────────────────────────────── */
function calcPromedio(lista: Comentario[]): number {
  if (!lista.length) return 0;
  return lista.reduce((s, c) => s + c.calificacion, 0) / lista.length;
}

/* ── Helper: fecha legible ──────────────────────────────────── */
function formatFecha(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-MX', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch {
    return '';
  }
}

/* ── Helper: inicial de nombre ──────────────────────────────── */
function inicial(nombre: string): string {
  return (nombre?.trim()?.[0] ?? '?').toUpperCase();
}

/* ════════════════════════════════════════════════════════════════
   Componente principal
   ════════════════════════════════════════════════════════════════ */
export default function ComentariosProducto({ productoId }: Props) {
  const { user } = useAuth();

  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [cargando, setCargando]       = useState(true);

  // Formulario
  const [calificacion, setCalificacion] = useState(5);
  const [hover, setHover]               = useState(0);
  const [texto, setTexto]               = useState('');
  const [enviando, setEnviando]         = useState(false);
  const [error, setError]               = useState('');
  const [exito, setExito]               = useState(false);

  /* ── Carga inicial ─────────────────────────────────────────── */
  const cargarComentarios = useCallback(async () => {
    setCargando(true);
    try {
      const res = await fetch(`/api/comentarios?producto_id=${productoId}`);
      const data = await res.json();
      if (data.ok) setComentarios(data.comentarios ?? []);
    } catch {
      // silencio
    } finally {
      setCargando(false);
    }
  }, [productoId]);

  useEffect(() => { cargarComentarios(); }, [cargarComentarios]);

  /* ── Enviar comentario ─────────────────────────────────────── */
  const enviar = async () => {
    setError('');
    if (!texto.trim()) { setError('Escribe un comentario antes de enviar.'); return; }
    if (texto.trim().length < 10) { setError('El comentario debe tener al menos 10 caracteres.'); return; }

    setEnviando(true);
    try {
      const res = await fetch('/api/comentarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-usuario-id': String(user!.id),
        },
        body: JSON.stringify({ producto_id: productoId, comentario: texto, calificacion }),
      });
      const data = await res.json();

      if (data.ok) {
        setExito(true);
        setTexto('');
        setCalificacion(5);
        await cargarComentarios();
      } else {
        setError(data.error ?? 'No se pudo guardar el comentario.');
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  /* ── Promedio y total ──────────────────────────────────────── */
  const promedio  = calcPromedio(comentarios);
  const totalComs = comentarios.length;

  /* ── Ya comentó este usuario ────────────────────────────────── */
  const yaComento = user
    ? comentarios.some((c) => c.nombre === user.nombre)
    : false;

  /* ── Render ────────────────────────────────────────────────── */
  return (
    <section className={styles.seccion}>
      {/* ── Encabezado ── */}
      <div className={styles.header}>
        <h2 className={styles.titulo}>
          <i className="fa-solid fa-comments" aria-hidden="true" />
          Opiniones de clientes
        </h2>

        {totalComs > 0 && (
          <div className={styles.resumenEstrellas}>
            <span className={styles.promedioNum}>{promedio.toFixed(1)}</span>
            <div className={styles.promedioStars}>
              <Estrellas valor={Math.round(promedio)} />
              <span className={styles.promedioTotal}>
                {totalComs} {totalComs === 1 ? 'opinión' : 'opiniones'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Lista ── */}
      {cargando ? (
        <div className={styles.vacio}>
          <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />
          <span style={{ display: 'block', marginTop: 8 }}>Cargando opiniones…</span>
        </div>
      ) : comentarios.length === 0 ? (
        <div className={styles.vacio}>
          <i className="fa-regular fa-comment-dots" aria-hidden="true" />
          Sé el primero en opinar sobre este producto.
        </div>
      ) : (
        <ul className={styles.lista} style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {comentarios.map((c) => (
            <li key={c.id} className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.cardAutor}>
                  <div className={styles.avatar}>{inicial(c.nombre)}</div>
                  <div>
                    <div className={styles.nombre}>{c.nombre}</div>
                    <div className={styles.fecha}>{formatFecha(c.creado_en)}</div>
                  </div>
                </div>
                <div className={styles.cardStars}>
                  <Estrellas valor={c.calificacion} />
                </div>
              </div>
              <p className={styles.cardTexto}>{c.comentario}</p>
            </li>
          ))}
        </ul>
      )}

      {/* ── Formulario / Login ── */}
      {!user ? (
        <div className={styles.loginReq}>
          <i className="fa-regular fa-user" aria-hidden="true" style={{ marginRight: 6 }} />
          <Link href="/login">Inicia sesión</Link> o{' '}
          <Link href="/registro">regístrate</Link> para dejar tu opinión.
        </div>
      ) : yaComento && !exito ? (
        <div className={styles.loginReq}>
          <i className="fa-solid fa-circle-check" aria-hidden="true" style={{ color: '#1a7a4a', marginRight: 6 }} />
          Ya dejaste tu opinión sobre este producto. ¡Gracias!
        </div>
      ) : exito ? (
        <div className={styles.msgOk}>
          <i className="fa-solid fa-circle-check" aria-hidden="true" />
          ¡Gracias por tu opinión! Ya aparece en la lista.
        </div>
      ) : (
        <div className={styles.formBox}>
          <p className={styles.formTitulo}>
            <i className="fa-solid fa-pen-to-square" aria-hidden="true" />
            Deja tu opinión
          </p>

          {/* Selector de estrellas */}
          <div className={styles.starsSelector} role="group" aria-label="Calificación">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className={`${styles.starBtn} ${n <= (hover || calificacion) ? styles.activa : ''}`}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setCalificacion(n)}
                aria-label={`${n} estrellas`}
              >
                <i className="fa-solid fa-star" aria-hidden="true" />
              </button>
            ))}
            <span style={{ fontSize: '0.82rem', color: 'var(--azul-medio)', marginLeft: 8, alignSelf: 'center' }}>
              {['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'][hover || calificacion]}
            </span>
          </div>

          {/* Área de texto */}
          <textarea
            className={styles.textarea}
            placeholder="Comparte tu experiencia con este producto… (mín. 10 caracteres)"
            value={texto}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CHARS) {
                setTexto(e.target.value);
                setError('');
                setExito(false);
              }
            }}
            rows={4}
          />

          <div className={styles.formFoot}>
            <span className={styles.charCount}>{texto.length} / {MAX_CHARS}</span>
            <button
              className={styles.btnEnviar}
              onClick={enviar}
              disabled={enviando || !texto.trim()}
            >
              {enviando
                ? <><i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Enviando…</>
                : <><i className="fa-solid fa-paper-plane" aria-hidden="true" /> Publicar opinión</>
              }
            </button>
          </div>

          {error && <p className={styles.msgError}><i className="fa-solid fa-triangle-exclamation" aria-hidden="true" /> {error}</p>}
        </div>
      )}
    </section>
  );
}
