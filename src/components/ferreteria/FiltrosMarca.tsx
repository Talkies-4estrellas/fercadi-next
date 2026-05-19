'use client';

/**
 * Sidebar de filtros para el catálogo de ferretería.
 * Cambia la URL (useRouter.push) para disparar la re-render del Server Component padre.
 * No usa useSearchParams — evita el requisito de <Suspense>.
 */

import { useRouter, usePathname } from 'next/navigation';
import styles from '@/styles/ferreteria.module.css';

interface Props {
  marcas:      string[];
  marcaActual: string | null;
}

export default function FiltrosMarca({ marcas, marcaActual }: Props) {
  const router   = useRouter();
  const pathname = usePathname();

  function navegar(marca: string) {
    const params = new URLSearchParams();
    if (marca) params.set('marca', marca);
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  }

  if (marcas.length === 0) return null;

  return (
    <aside className={styles.sidebar}>
      <p className={styles.sidebarTitulo}>Filtros</p>

      <div className={styles.sidebarSeccion}>
        <p className={styles.sidebarSeccionTitulo}>Marca</p>

        <div className={styles.marcaLista}>
          <button
            className={`${styles.marcaBtn} ${!marcaActual ? styles.marcaBtnActivo : ''}`}
            onClick={() => navegar('')}
          >
            Todas las marcas
          </button>

          {marcas.map((m) => (
            <button
              key={m}
              className={`${styles.marcaBtn} ${marcaActual === m ? styles.marcaBtnActivo : ''}`}
              onClick={() => navegar(m)}
            >
              {m}
            </button>
          ))}
        </div>

        {marcaActual && (
          <button className={styles.limpiarBtn} onClick={() => navegar('')}>
            <i className="fa-solid fa-xmark" /> Limpiar filtro
          </button>
        )}
      </div>
    </aside>
  );
}
