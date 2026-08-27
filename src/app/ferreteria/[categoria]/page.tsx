export const revalidate = 300

import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getProductosFerreteria,
  getFerreteriaMarcas,
  getFerreteriaCategorias,
} from '@/lib/productos';
import { resolverImagenProducto } from '@/lib/imagen';
import FiltrosMarca from '@/components/ferreteria/FiltrosMarca';
import Paginador    from '@/components/Paginador';
import styles from '@/styles/ferreteria.module.css';

type Params       = Promise<{ categoria: string }>;
type SearchParams = Promise<{ page?: string; marca?: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { categoria } = await params;
  return {
    title: `Ferretería — ${categoria.toUpperCase()} | FERCADI`,
    description: `Catálogo de productos de ferretería de la familia ${categoria}.`,
  };
}

const LIMIT = 24;

export default async function FerreteriaCategPage({
  params,
  searchParams,
}: {
  params:       Params;
  searchParams: SearchParams;
}) {
  const { categoria }          = await params;
  const { page: pageStr, marca } = await searchParams;

  const page = Math.max(1, parseInt(pageStr ?? '1', 10));

  // Traer datos en paralelo: productos paginados + marcas disponibles + nombre de categoría
  const [paginada, marcas, todasCats] = await Promise.all([
    getProductosFerreteria({ categoriaSlug: categoria, marca: marca ?? undefined, page, limit: LIMIT }),
    getFerreteriaMarcas(categoria),
    getFerreteriaCategorias(),
  ]);

  // Si la categoría no existe en la DB, 404
  const catInfo = todasCats.find((c) => c.slug === categoria);
  if (!catInfo && paginada.total === 0) notFound();

  const categoriaNombre = catInfo?.nombre ?? categoria.toUpperCase();

  // Construir baseHref para el paginador: preserva el filtro de marca
  const filtroParams = new URLSearchParams();
  if (marca) filtroParams.set('marca', marca);
  const baseHref = `/ferreteria/${categoria}?${filtroParams.toString() ? filtroParams.toString() + '&' : ''}page=`;

  return (
    <>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroEtiqueta}>
            <i className="fa-solid fa-wrench" /> Ferretería
          </div>
          <h1 className={styles.heroTitulo}>{categoriaNombre}</h1>
          <p className={styles.heroSub}>
            {paginada.total.toLocaleString('es-MX')} productos disponibles
            {marca && <> · Marca: <strong>{marca}</strong></>}
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/">Inicio</Link> /{' '}
        <Link href="/ferreteria">Ferretería</Link> /{' '}
        {categoriaNombre}
      </div>

      {/* Layout principal: sidebar + productos */}
      <div className={styles.catLayout}>

        {/* ── Sidebar de filtros ── */}
        <FiltrosMarca marcas={marcas} marcaActual={marca ?? null} />

        {/* ── Área de productos ── */}
        <main className={styles.main}>
          <div className={styles.mainHeader}>
            <div>
              <h2 className={styles.mainTitulo}>{categoriaNombre}</h2>
              <p className={styles.mainSubtitulo}>
                {paginada.total.toLocaleString('es-MX')} productos
                {marca && ` · ${marca}`}
                {paginada.pages > 1 && ` · Página ${page} de ${paginada.pages}`}
              </p>
            </div>
          </div>

          {/* Chip de filtro activo */}
          {marca && (
            <div className={styles.filtroActivo}>
              <i className="fa-solid fa-filter" /> {marca}
            </div>
          )}

          {paginada.productos.length === 0 ? (
            <div className={styles.emptyState}>
              <i className="fa-solid fa-box-open" />
              <p>No hay productos con los filtros seleccionados.</p>
            </div>
          ) : (
            <>
              <div className={styles.productosGrid}>
                {paginada.productos.map((p) => {
                  const img = resolverImagenProducto(p.imagen_url ?? undefined);
                  return (
                    <Link
                      key={p.id}
                      href={`/ferreteria/${categoria}/${p.slug}`}
                      className={styles.prodCard}
                    >
                      {/* Imagen */}
                      {img ? (
                        <div className={styles.prodCardImg}>
                          <Image
                            src={img}
                            alt={p.nombre}
                            fill
                            sizes="(max-width: 480px) 50vw, (max-width: 900px) 33vw, 220px"
                            style={{ objectFit: 'contain', padding: '8px' }}
                          />
                        </div>
                      ) : (
                        <div className={styles.prodCardPlaceholder}>
                          <i className="fa-solid fa-wrench" />
                        </div>
                      )}

                      {/* Cuerpo */}
                      <div className={styles.prodCardBody}>
                        {p.marca && (
                          <span className={styles.prodCardMarca}>{p.marca}</span>
                        )}
                        <p className={styles.prodCardNombre}>{p.nombre}</p>
                        {p.unidad && (
                          <p className={styles.prodCardUnidad}>{p.unidad}</p>
                        )}
                        {Number(p.precio) > 0 && (
                          <p className={styles.prodCardPrecio}>
                            ${Number(p.precio).toFixed(2)}
                          </p>
                        )}
                      </div>

                      <span className={styles.prodCardBtn}>
                        Ver detalle <i className="fa-solid fa-arrow-right" />
                      </span>
                    </Link>
                  );
                })}
              </div>

              {/* Paginador */}
              <Paginador
                page={paginada.page}
                pages={paginada.pages}
                total={paginada.total}
                limit={paginada.limit}
                baseHref={baseHref}
              />
            </>
          )}
        </main>
      </div>
    </>
  );
}
