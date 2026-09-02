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

  function selGrupo(slug: string | null) {
    router.push(build({ grupo: slug, cat: null, marca: null }));
  }

  function selCat(slug: string | null) {
    router.push(build({ cat: slug, marca: null }));
  }

  function selMarca(marca: string | null) {
    router.push(build({ marca }));
  }

  function limpiarTodo() {
    setQ('');
    router.push(pathname);
  }

  const grupoObj = grupos.find((g) => g.slug === grupoActual) ?? null;
  const hayFiltros = !!(grupoActual || catActual || marcaActual || q);

  return (
    <aside className={styles.sidebar}>
      <p className={styles.sidebarTitulo}>Filtros</p>

      {/* Búsqueda de texto */}
      <div className={styles.sidebarSeccion}>
        <p className={styles.sidebarSeccionTitulo}>Buscar</p>
        <div className={styles.buscadorWrap}>
          <i className="fa-solid fa-magnifying-glass" />
          <input
            className={styles.buscadorInput}
            value={q}
            onChange={(e) => onQ(e.target.value)}
            placeholder="Nombre del producto…"
          />
          {q && (
            <button className={styles.buscadorClear} onClick={() => onQ('')} aria-label="Borrar búsqueda">
              <i className="fa-solid fa-xmark" />
            </button>
          )}
        </div>
      </div>

      {/* Grupos */}
      <div className={styles.sidebarSeccion}>
        <p className={styles.sidebarSeccionTitulo}>Grupo</p>
        <div className={styles.marcaLista}>
          <button
            className={`${styles.marcaBtn} ${!grupoActual ? styles.marcaBtnActivo : ''}`}
            onClick={() => selGrupo(null)}
          >
            Todos los grupos
          </button>
          {grupos.map((g) => (
            <button
              key={g.slug}
              className={`${styles.marcaBtn} ${grupoActual === g.slug ? styles.marcaBtnActivo : ''}`}
              onClick={() => selGrupo(grupoActual === g.slug ? null : g.slug)}
            >
              {g.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Subcategorías del grupo seleccionado */}
      {grupoObj && grupoObj.subcategorias.length > 0 && (
        <div className={styles.sidebarSeccion}>
          <p className={styles.sidebarSeccionTitulo}>Subcategoría</p>
          <div className={styles.marcaLista}>
            <button
              className={`${styles.marcaBtn} ${!catActual ? styles.marcaBtnActivo : ''}`}
              onClick={() => selCat(null)}
            >
              Todas
            </button>
            {grupoObj.subcategorias.map((sc) => (
              <button
                key={sc.slug}
                className={`${styles.marcaBtn} ${catActual === sc.slug ? styles.marcaBtnActivo : ''}`}
                onClick={() => selCat(catActual === sc.slug ? null : sc.slug)}
              >
                {sc.nombre}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Marcas */}
      {marcas.length > 0 && (
        <div className={styles.sidebarSeccion}>
          <p className={styles.sidebarSeccionTitulo}>Marca</p>
          <div className={styles.marcaLista}>
            <button
              className={`${styles.marcaBtn} ${!marcaActual ? styles.marcaBtnActivo : ''}`}
              onClick={() => selMarca(null)}
            >
              Todas las marcas
            </button>
            {marcas.map((m) => (
              <button
                key={m}
                className={`${styles.marcaBtn} ${marcaActual === m ? styles.marcaBtnActivo : ''}`}
                onClick={() => selMarca(marcaActual === m ? null : m)}
              >
                {m}
              </button>
            ))}
          </div>
          {marcaActual && (
            <button className={styles.limpiarBtn} onClick={() => selMarca(null)}>
              <i className="fa-solid fa-xmark" /> Limpiar marca
            </button>
          )}
        </div>
      )}

      {/* Limpiar todo */}
      {hayFiltros && (
        <button className={styles.limpiarBtn} onClick={limpiarTodo}>
          <i className="fa-solid fa-filter-circle-xmark" /> Limpiar todo
        </button>
      )}
    </aside>
  );
}
