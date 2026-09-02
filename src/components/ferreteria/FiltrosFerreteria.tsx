'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import styles from '@/styles/ferreteria.module.css';
import type { FerreteriaGrupo } from '@/lib/productos';

interface Props {
  grupos:      FerreteriaGrupo[];
  grupoActual: string | null;
  catActual:   string | null;
  marcas:      string[];
  marcaActual: string | null;
  qActual:     string | null;
}

export default function FiltrosFerreteria({
  grupos, grupoActual, catActual, marcas, marcaActual, qActual,
}: Props) {
  const router   = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(qActual ?? '');
  const timer     = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setQ(qActual ?? ''); }, [qActual]);

  function build(overrides: Record<string, string | null>) {
    const current: Record<string, string | null> = {
      q:     q || null,
      grupo: grupoActual,
      cat:   catActual,
      marca: marcaActual,
    };
    const merged = { ...current, ...overrides };
    const params = new URLSearchParams();
    params.set('page', '1');
    Object.entries(merged).forEach(([k, v]) => { if (v) params.set(k, v); });
    return `${pathname}?${params.toString()}`;
  }

  function onQ(val: string) {
    setQ(val);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      router.push(build({ q: val || null }));
    }, 380);
  }

  function onGrupo(slug: string) {
    router.push(build({ grupo: slug || null, cat: null, marca: null }));
  }

  function onCat(slug: string) {
    router.push(build({ cat: slug || null, marca: null }));
  }

  function onMarca(marca: string) {
    router.push(build({ marca: marca || null }));
  }

  function limpiarTodo() {
    setQ('');
    router.push(pathname);
  }

  const grupoObj  = grupos.find((g) => g.slug === grupoActual) ?? null;
  const hayFiltros = !!(grupoActual || catActual || marcaActual || q);

  return (
    <div className={styles.filtrosBar}>

      {/* Buscador */}
      <div className={styles.filtroItem}>
        <div className={styles.buscadorWrap}>
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
          <input
            className={styles.buscadorInput}
            value={q}
            onChange={(e) => onQ(e.target.value)}
            placeholder="Buscar producto…"
          />
          {q && (
            <button className={styles.buscadorClear} onClick={() => onQ('')} aria-label="Borrar">
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Grupo */}
      <div className={styles.filtroItem}>
        <select
          className={styles.filtroSelect}
          value={grupoActual ?? ''}
          onChange={(e) => onGrupo(e.target.value)}
        >
          <option value="">Todos los grupos</option>
          {grupos.map((g) => (
            <option key={g.slug} value={g.slug}>{g.nombre}</option>
          ))}
        </select>
      </div>

      {/* Subcategoría */}
      {grupoObj && grupoObj.subcategorias.length > 0 && (
        <div className={styles.filtroItem}>
          <select
            className={styles.filtroSelect}
            value={catActual ?? ''}
            onChange={(e) => onCat(e.target.value)}
          >
            <option value="">Todas las familias</option>
            {grupoObj.subcategorias.map((sc) => (
              <option key={sc.slug} value={sc.slug}>{sc.nombre}</option>
            ))}
          </select>
        </div>
      )}

      {/* Marca */}
      {marcas.length > 0 && (
        <div className={styles.filtroItem}>
          <select
            className={styles.filtroSelect}
            value={marcaActual ?? ''}
            onChange={(e) => onMarca(e.target.value)}
          >
            <option value="">Todas las marcas</option>
            {marcas.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      )}

      {/* Limpiar */}
      {hayFiltros && (
        <button className={styles.limpiarBtn} onClick={limpiarTodo}>
          <i className="fa-solid fa-filter-circle-xmark" aria-hidden="true" /> Limpiar
        </button>
      )}
    </div>
  );
}
