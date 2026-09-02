export const dynamic = 'force-dynamic';

import Image from 'next/image';
import Link  from 'next/link';
import { getFerreteriaGrupos, getProductosFerreteria, getFerreteriaMarcas } from '@/lib/productos';
import { resolverImagenProducto } from '@/lib/imagen';
import FiltrosFerreteria from '@/components/ferreteria/FiltrosFerreteria';
import Paginador         from '@/components/Paginador';
import styles from '@/styles/ferreteria.module.css';

export const metadata = {
  title: 'Ferretería — FERCADI',
  description: 'Búsqueda de herramientas, materiales y accesorios. Más de 15,000 productos de ferretería.',
};

type SP = Promise<{ q?: string; grupo?: string; cat?: string; marca?: string; page?: string }>;

const LIMIT = 24;

export default async function FerreteriaPrincipalPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;

  const q     = sp.q?.trim()     || null;
  const grupo = sp.grupo?.trim() || null;
  const cat   = sp.cat?.trim()   || null;
  const marca = sp.marca?.trim() || null;
  const page  = Math.max(1, parseInt(sp.page ?? '1', 10));

  // Grupos para el árbol del sidebar (cacheados)
  const grupos = await getFerreteriaGrupos();

  // Slugs de subcategorías del grupo seleccionado (para filtrar por grupo)
  const grupoObj = grupos.find((g) => g.slug === grupo) ?? null;
  const categoriasSlugs = grupoObj ? grupoObj.subcategorias.map((sc) => sc.slug) : [];

  // Slug de categoría efectiva: si hay "cat" la usamos; si hay "grupo" usamos el array
  const catSlug   = cat ?? undefined;
  const grupoSlugs = !cat && categoriasSlugs.length > 0 ? categoriasSlugs : undefined;

  // Secuenciales para no saturar el pool (getProductosFerreteria ya usa 2 conexiones internas)
  const paginada = await getProductosFerreteria({
    categoriaSlug:   catSlug,
    categoriasSlugs: grupoSlugs,
    marca:           marca ?? undefined,
    q:               q ?? undefined,
    page,
    limit: LIMIT,
  });
  const marcas = await getFerreteriaMarcas(catSlug, grupoSlugs);

  // Construir baseHref para el paginador preservando todos los filtros activos
  const filtros = new URLSearchParams();
  if (q)     filtros.set('q',     q);
  if (grupo) filtros.set('grupo', grupo);
  if (cat)   filtros.set('cat',   cat);
  if (marca) filtros.set('marca', marca);
  const filtroStr = filtros.toString();
  const baseHref  = `/ferreteria?${filtroStr ? filtroStr + '&' : ''}page=`;

  // Título del área principal
  let tituloArea = 'Todos los productos';
  if (cat && grupoObj) {
    const sc = grupoObj.subcategorias.find((s) => s.slug === cat);
    tituloArea = sc?.nombre ?? cat;
  } else if (grupoObj) {
    tituloArea = grupoObj.nombre;
  }
  if (q) tituloArea = `Resultados para "${q}"`;

  return (
    <>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroTexto}>
            <div className={styles.heroEtiqueta}>
              <i className="fa-solid fa-wrench" /> Ferretería
            </div>
            <h1 className={styles.heroTitulo}>Catálogo de Ferretería</h1>
            <p className={styles.heroSub}>
              Busca entre miles de herramientas, materiales y accesorios.
            </p>
          </div>
        </div>
      </section>

      {/* Barra de filtros */}
      <FiltrosFerreteria
        grupos={grupos}
        grupoActual={grupo}
        catActual={cat}
        marcas={marcas}
        marcaActual={marca}
        qActual={q}
      />

      {/* Área de productos */}
      <main className={styles.productoArea}>
        <div className={styles.mainHeader}>
          <div>
            <h2 className={styles.mainTitulo}>{tituloArea}</h2>
            <p className={styles.mainSubtitulo}>
              {paginada.total.toLocaleString('es-MX')} producto{paginada.total !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

          {paginada.total === 0 ? (
            <div className={styles.emptyState}>
              <i className="fa-solid fa-box-open" />
              <p>No hay productos con estos filtros.</p>
              <Link href="/ferreteria" style={{ color: 'var(--azul-boton)', fontSize: '0.85rem' }}>
                Ver todos los productos
              </Link>
            </div>
          ) : (
            <>
              <div className={styles.productosGrid}>
                {paginada.productos.map((p) => {
                  const img = resolverImagenProducto(p.imagen_url);
                  return (
                    <Link
                      key={p.id}
                      href={`/ferreteria/${p.categoria_slug}/${p.slug}`}
                      className={styles.prodCard}
                    >
                      {img ? (
                        <div className={styles.prodCardImg}>
                          <Image
                            src={img}
                            alt={p.nombre}
                            fill
                            sizes="(max-width: 600px) 50vw, (max-width: 1024px) 33vw, 200px"
                            style={{ objectFit: 'contain', padding: 8 }}
                          />
                        </div>
                      ) : (
                        <div className={styles.prodCardPlaceholder}>
                          <i className="fa-solid fa-wrench" />
                        </div>
                      )}

                      <div className={styles.prodCardBody}>
                        {p.marca && (
                          <span className={styles.prodCardMarca}>{p.marca}</span>
                        )}
                        <span className={styles.prodCardNombre}>{p.nombre}</span>
                        {p.unidad && (
                          <span className={styles.prodCardUnidad}>{p.unidad}</span>
                        )}
                        <span className={styles.prodCardPrecio}>
                          ${p.precio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <span className={styles.prodCardBtn}>Ver producto</span>
                    </Link>
                  );
                })}
              </div>

              <Paginador
                page={page}
                pages={paginada.pages}
                total={paginada.total}
                limit={LIMIT}
                baseHref={baseHref}
              />
            </>
          )}
      </main>
    </>
  );
}
