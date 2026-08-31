import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTipBySlug } from '@/lib/tips';
import styles from '@/styles/tips.module.css';

export const dynamic = 'force-dynamic';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const tip = await getTipBySlug(slug);
  if (!tip) return { title: 'Tip no encontrado — FERCADI' };
  return {
    title: `${tip.titulo} — Tips FERCADI`,
    description: tip.descripcion ?? undefined,
  };
}

/** Convierte **texto** → <strong> dentro de una línea */
function parseInline(texto: string): React.ReactNode[] {
  return texto.split(/\*\*(.+?)\*\*/g).map((p, k) =>
    k % 2 === 1 ? <strong key={k}>{p}</strong> : p
  );
}

/**
 * Parser Markdown mínimo que convierte el contenido generado por la IA:
 *  - ### Título   → <h3>
 *  - ## Título    → <h2>
 *  - # Título     → <h2>
 *  - - item       → <ul><li>  (agrupa ítems consecutivos)
 *  - **negrita**  → <strong>
 *  - párrafos     → <p>
 *
 * También maneja listas inline del estilo "texto. - item1 - item2"
 * que algunos modelos generan en una sola línea.
 */
function renderContenido(texto: string): React.ReactNode[] {
  // Normalizar: asegurar salto antes de cada "- " de lista inline
  const normalizado = texto
    .replace(/ - /g, '\n- ')          // "texto. - item" → líneas separadas
    .replace(/\n{3,}/g, '\n\n');      // colapsar más de 2 saltos

  const lineas = normalizado.split('\n');
  const elementos: React.ReactNode[] = [];
  let listaActual: string[] = [];
  let parrafoActual: React.ReactNode[] = [];
  let key = 0;

  const flushLista = () => {
    if (listaActual.length === 0) return;
    elementos.push(
      <ul key={key++} className={styles.contenidoLista}>
        {listaActual.map((item, i) => <li key={i}>{parseInline(item)}</li>)}
      </ul>
    );
    listaActual = [];
  };

  const flushParrafo = () => {
    if (parrafoActual.length === 0) return;
    elementos.push(
      <p key={key++} className={styles.contenidoParrafo}>{parrafoActual}</p>
    );
    parrafoActual = [];
  };

  for (const linea of lineas) {
    const t = linea.trim();

    if (t === '') {
      flushLista();
      flushParrafo();
      continue;
    }

    // Encabezados
    if (t.startsWith('### ')) {
      flushLista(); flushParrafo();
      elementos.push(<h3 key={key++} className={styles.contenidoH3}>{parseInline(t.slice(4))}</h3>);
      continue;
    }
    if (t.startsWith('## ') || t.startsWith('# ')) {
      flushLista(); flushParrafo();
      const nivel = t.startsWith('## ') ? 3 : 2;
      elementos.push(<h2 key={key++} className={styles.contenidoH2}>{parseInline(t.slice(nivel))}</h2>);
      continue;
    }

    // Ítem de lista
    if (t.startsWith('- ') || t.startsWith('* ')) {
      flushParrafo();
      listaActual.push(t.slice(2));
      continue;
    }

    // Línea normal → párrafo
    flushLista();
    if (parrafoActual.length > 0) parrafoActual.push(<br key={`br-${key++}`} />);
    parrafoActual.push(...parseInline(t));
  }

  flushLista();
  flushParrafo();

  return elementos;
}

export default async function TipPage({ params }: { params: Params }) {
  const { slug } = await params;
  const tip = await getTipBySlug(slug);
  if (!tip) notFound();

  return (
    <div className={styles.detallePage}>
      <div className={styles.detalleContainer}>

        <p className={styles.breadcrumb}>
          <Link href="/">Inicio</Link> ›{' '}
          <Link href="/tips">Tips y Tutoriales</Link> ›{' '}
          {tip.titulo}
        </p>

        {tip.imagen && (
          <div className={styles.detalleBanner}>
            <Image
              src={tip.imagen}
              alt={tip.titulo}
              fill
              sizes="(max-width: 860px) 100vw, 860px"
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
        )}

        <h1 className={styles.detalleTitulo}>{tip.titulo}</h1>

        {tip.descripcion && (
          <p className={styles.detalleDesc}>{tip.descripcion}</p>
        )}

        {tip.contenido && (
          <div className={styles.contenido}>
            {renderContenido(tip.contenido)}
          </div>
        )}

        <div className={styles.detalleVolver}>
          <Link href="/tips" className={styles.btnVolver}>
            <i className="fa-solid fa-arrow-left" /> Ver todos los tips
          </Link>
        </div>
      </div>
    </div>
  );
}
