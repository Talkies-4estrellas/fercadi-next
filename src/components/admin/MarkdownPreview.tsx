'use client';

import React from 'react';
import tipStyles from '@/styles/tips.module.css';
import styles from '@/styles/adminTips.module.css';

function parseInline(texto: string): React.ReactNode[] {
  return texto.split(/\*\*(.+?)\*\*/g).map((p, k) =>
    k % 2 === 1 ? <strong key={k}>{p}</strong> : p
  );
}

function renderContenido(texto: string): React.ReactNode[] {
  const normalizado = texto
    .replace(/ - /g, '\n- ')
    .replace(/\n{3,}/g, '\n\n');

  const lineas = normalizado.split('\n');
  const elementos: React.ReactNode[] = [];
  let listaActual: string[] = [];
  let parrafoActual: React.ReactNode[] = [];
  let key = 0;

  const flushLista = () => {
    if (listaActual.length === 0) return;
    elementos.push(
      <ul key={key++} className={tipStyles.contenidoLista}>
        {listaActual.map((item, i) => <li key={i}>{parseInline(item)}</li>)}
      </ul>
    );
    listaActual = [];
  };

  const flushParrafo = () => {
    if (parrafoActual.length === 0) return;
    elementos.push(
      <p key={key++} className={tipStyles.contenidoParrafo}>{parrafoActual}</p>
    );
    parrafoActual = [];
  };

  for (const linea of lineas) {
    const t = linea.trim();

    if (t === '') { flushLista(); flushParrafo(); continue; }

    if (t.startsWith('### ')) {
      flushLista(); flushParrafo();
      elementos.push(<h3 key={key++} className={tipStyles.contenidoH3}>{parseInline(t.slice(4))}</h3>);
      continue;
    }
    if (t.startsWith('## ') || t.startsWith('# ')) {
      flushLista(); flushParrafo();
      const nivel = t.startsWith('## ') ? 3 : 2;
      elementos.push(<h2 key={key++} className={tipStyles.contenidoH2}>{parseInline(t.slice(nivel))}</h2>);
      continue;
    }
    if (t.startsWith('- ') || t.startsWith('* ')) {
      flushParrafo();
      listaActual.push(t.slice(2));
      continue;
    }

    flushLista();
    if (parrafoActual.length > 0) parrafoActual.push(<br key={`br-${key++}`} />);
    parrafoActual.push(...parseInline(t));
  }

  flushLista();
  flushParrafo();
  return elementos;
}

interface Props {
  texto: string;
}

export default function MarkdownPreview({ texto }: Props) {
  if (!texto.trim()) {
    return (
      <div className={styles.previewVacio}>
        <i className="fa-regular fa-file-lines" aria-hidden="true" />
        <span>El contenido aparecerá aquí…</span>
      </div>
    );
  }

  return (
    <div className={styles.previewBox}>
      {renderContenido(texto)}
    </div>
  );
}
