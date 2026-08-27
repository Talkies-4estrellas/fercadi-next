export const revalidate = 300

import Link from 'next/link';
import { getFerreteriaCategorias } from '@/lib/productos';
import styles from '@/styles/ferreteria.module.css';

export const metadata = {
  title: 'Ferretería — FERCADI',
  description: 'Catálogo de ferretería: más de 15,000 productos organizados por familia. Herramientas, materiales, fijaciones y más.',
};

export default async function FerreteriaPrincipalPage() {
  const categorias = await getFerreteriaCategorias();

  const totalProductos = categorias.reduce((acc, c) => acc + c.total, 0);

  return (
    <>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroEtiqueta}>
            <i className="fa-solid fa-wrench" /> Ferretería
          </div>
          <h1 className={styles.heroTitulo}>Catálogo de Ferretería</h1>
          <p className={styles.heroSub}>
            Encuentra herramientas, materiales y accesorios para construcción y mantenimiento.
          </p>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>{totalProductos.toLocaleString('es-MX')}</span>
              <span className={styles.heroStatLabel}>Productos</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>{categorias.length}</span>
              <span className={styles.heroStatLabel}>Familias</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <div className={styles.categoriasHeader}>
        <h2>Familias de productos</h2>
        <span>{categorias.length} categorías disponibles</span>
      </div>

      <div className={styles.categoriasGrid}>
        {categorias.map((cat) => (
          <Link
            key={cat.slug}
            href={`/ferreteria/${cat.slug}`}
            className={styles.catCard}
          >
            <div className={styles.catCardIcono}>
              <i className="fa-solid fa-box-open" />
            </div>
            <p className={styles.catCardNombre}>{cat.nombre}</p>
            <p className={styles.catCardTotal}>
              <i className="fa-solid fa-tag" />
              {cat.total.toLocaleString('es-MX')} productos
            </p>
            <span className={styles.catCardArrow}>
              Ver catálogo <i className="fa-solid fa-arrow-right" />
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
