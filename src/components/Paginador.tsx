'use client';

/**
 * Paginador basado en <Link> — sin useSearchParams (evita Suspense).
 * El componente padre calcula `baseHref` preservando todos los query
 * params relevantes y solo falta concatenar el número de página.
 *
 * Ejemplo de uso desde un Server Component:
 *   const base = `/ferreteria/p085?marca=truper&page=`;
 *   <Paginador page={2} pages={10} total={230} limit={24} baseHref={base} />
 */

import Link from 'next/link';
import styles from '@/styles/ferreteria.module.css';

interface Props {
  page:     number;
  pages:    number;
  total:    number;
  limit:    number;
  /** URL completa hasta "page=" (sin el número). Ej: "/ferreteria/p085?marca=truper&page=" */
  baseHref: string;
}

export default function Paginador({ page, pages, total, limit, baseHref }: Props) {
  if (pages <= 1) return null;

  const inicio = ((page - 1) * limit + 1).toLocaleString('es-MX');
  const fin    = Math.min(page * limit, total).toLocaleString('es-MX');
  const tot    = total.toLocaleString('es-MX');

  // Genera hasta 5 números de página alrededor de la actual
  function rango(): number[] {
    const delta = 2;
    const start = Math.max(1, page - delta);
    const end   = Math.min(pages, page + delta);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  return (
    <nav className={styles.paginador} aria-label="Paginación">
      <span className={styles.paginadorInfo}>
        {inicio}–{fin} de {tot} productos
      </span>

      <div className={styles.paginadorBtns}>
        {/* Primera / Anterior */}
        {page > 1 ? (
          <>
            <Link href={`${baseHref}1`} className={styles.paginadorBtn} title="Primera página">
              <i className="fa-solid fa-angles-left" aria-hidden="true" />
            </Link>
            <Link href={`${baseHref}${page - 1}`} className={styles.paginadorBtn} title="Anterior">
              <i className="fa-solid fa-angle-left" aria-hidden="true" />
            </Link>
          </>
        ) : (
          <>
            <span className={`${styles.paginadorBtn} ${styles.paginadorBtnDisabled}`}>
              <i className="fa-solid fa-angles-left" aria-hidden="true" />
            </span>
            <span className={`${styles.paginadorBtn} ${styles.paginadorBtnDisabled}`}>
              <i className="fa-solid fa-angle-left" aria-hidden="true" />
            </span>
          </>
        )}

        {/* Números de página */}
        {rango().map((p) => (
          <Link
            key={p}
            href={`${baseHref}${p}`}
            className={`${styles.paginadorBtn} ${p === page ? styles.paginadorBtnActivo : ''}`}
          >
            {p}
          </Link>
        ))}

        {/* Siguiente / Última */}
        {page < pages ? (
          <>
            <Link href={`${baseHref}${page + 1}`} className={styles.paginadorBtn} title="Siguiente">
              <i className="fa-solid fa-angle-right" aria-hidden="true" />
            </Link>
            <Link href={`${baseHref}${pages}`} className={styles.paginadorBtn} title="Última página">
              <i className="fa-solid fa-angles-right" aria-hidden="true" />
            </Link>
          </>
        ) : (
          <>
            <span className={`${styles.paginadorBtn} ${styles.paginadorBtnDisabled}`}>
              <i className="fa-solid fa-angle-right" aria-hidden="true" />
            </span>
            <span className={`${styles.paginadorBtn} ${styles.paginadorBtnDisabled}`}>
              <i className="fa-solid fa-angles-right" aria-hidden="true" />
            </span>
          </>
        )}
      </div>
    </nav>
  );
}
