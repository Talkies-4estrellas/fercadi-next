export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getFerreteriaGrupos } from '@/lib/productos';
import styles from '@/styles/ferreteria.module.css';

export const metadata = {
  title: 'Ferretería — FERCADI',
  description: 'Catálogo de ferretería: más de 15,000 productos organizados por familia. Herramientas, materiales, fijaciones y más.',
};

const GRUPO_ICONOS: Record<string, string> = {
  'herramientas-manuales':    'fa-solid fa-wrench',
  'herramientas-de-corte':    'fa-solid fa-scissors',
  'medicion-y-trazo':         'fa-solid fa-ruler-combined',
  'maquinas-portatiles':      'fa-solid fa-plug-circle-bolt',
  'jardin-y-agricultura':     'fa-solid fa-seedling',
  'accesorios-para-maquinas': 'fa-solid fa-gears',
  'electricidad':             'fa-solid fa-bolt',
  'plomeria':                 'fa-solid fa-faucet',
  'gas-y-calefaccion':        'fa-solid fa-fire-flame-simple',
  'cerrajeria':               'fa-solid fa-lock',
  'seguridad-personal':       'fa-solid fa-helmet-safety',
  'fijaciones-y-amarre':      'fa-solid fa-screwdriver',
  'pintura-y-acabados':       'fa-solid fa-paint-roller',
  'almacenaje-y-transporte':  'fa-solid fa-box-open',
  'hogar-y-bano':             'fa-solid fa-house',
  'mallas-y-lonas':           'fa-solid fa-grip',
  'exhibidores':              'fa-solid fa-store',
  'miscelaneos':              'fa-solid fa-ellipsis',
};

export default async function FerreteriaPrincipalPage() {
  const grupos = await getFerreteriaGrupos();

  const totalProductos = grupos.reduce((a, g) => a + g.totalProductos, 0);
  const totalCategorias = grupos.reduce((a, g) => a + g.subcategorias.length, 0);

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
            Encuentra herramientas, materiales y accesorios organizados por familia de producto.
          </p>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>{totalProductos.toLocaleString('es-MX')}</span>
              <span className={styles.heroStatLabel}>Productos</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>{grupos.length}</span>
              <span className={styles.heroStatLabel}>Grupos</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>{totalCategorias}</span>
              <span className={styles.heroStatLabel}>Familias</span>
            </div>
          </div>
        </div>
      </section>

      {/* Árbol de grupos */}
      <div className={styles.arbolWrapper}>
        <div className={styles.arbolHeader}>
          <h2>Familias de productos</h2>
          <span>Haz clic en un grupo para ver sus subcategorías</span>
        </div>

        <div className={styles.gruposGrid}>
          {grupos.map((grupo) => {
            const icono = GRUPO_ICONOS[grupo.slug] ?? 'fa-solid fa-layer-group';
            return (
              <details key={grupo.slug} className={styles.grupoDetalle}>
                <summary className={styles.grupoResumen}>
                  <div className={styles.grupoIcono}>
                    <i className={icono} />
                  </div>
                  <div className={styles.grupoTexto}>
                    <span className={styles.grupoNombre}>{grupo.nombre}</span>
                    <span className={styles.grupoMeta}>
                      {grupo.subcategorias.length} familias
                      {grupo.totalProductos > 0 && (
                        <> · {grupo.totalProductos.toLocaleString('es-MX')} productos</>
                      )}
                    </span>
                  </div>
                  <i className={`fa-solid fa-chevron-right ${styles.grupoChevron}`} />
                </summary>

                <div className={styles.grupoHijos}>
                  {grupo.subcategorias.map((sub) => (
                    <Link
                      key={sub.slug}
                      href={`/ferreteria/${sub.slug}`}
                      className={styles.subcatLink}
                    >
                      <span className={styles.subcatNombre}>{sub.nombre}</span>
                      {sub.total > 0 && (
                        <span className={styles.subcatTotal}>
                          {sub.total.toLocaleString('es-MX')}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </details>
            );
          })}
        </div>
      </div>
    </>
  );
}
