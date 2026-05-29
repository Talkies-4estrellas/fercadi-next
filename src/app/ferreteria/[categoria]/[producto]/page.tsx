export const dynamic = 'force-dynamic'

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProducto, getFerreteriaCategorias } from '@/lib/productos';
import ProductoDetalle from '@/components/ProductoDetalle';
import BtnAgregarCarrito from '@/components/BtnAgregarCarrito';
import styles from '@/styles/product.module.css';

type Params = Promise<{ categoria: string; producto: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { categoria, producto } = await params;
  const p = await getProducto('ferreteria', categoria, producto);
  if (!p) return { title: 'Producto no encontrado' };
  return {
    title: `${p.nombre} — Ferretería | FERCADI`,
    description: p.descripcion?.slice(0, 160) ?? '',
  };
}

export default async function FerreteriaProductoPage({
  params,
}: {
  params: Params;
}) {
  const { categoria, producto } = await params;

  const [p, todasCats] = await Promise.all([
    getProducto('ferreteria', categoria, producto),
    getFerreteriaCategorias(),
  ]);

  if (!p) notFound();

  const catInfo = todasCats.find((c) => c.slug === categoria);
  const categoriaNombre = catInfo?.nombre ?? categoria.toUpperCase();

  // Campos públicos extra que no muestra ProductoDetalle pero sí son útiles en ferretería
  const extras: { label: string; valor: string }[] = [];
  if (p.marca)   extras.push({ label: 'Marca',  valor: p.marca });
  if (p.unidad)  extras.push({ label: 'Unidad', valor: p.unidad });
  if (Number(p.precio) > 0)
    extras.push({ label: 'Precio', valor: `$${Number(p.precio).toFixed(2)} MXN` });

  const breadcrumb = (
    <>
      <Link href="/">Inicio</Link> /{' '}
      <Link href="/ferreteria">Ferretería</Link> /{' '}
      <Link href={`/ferreteria/${categoria}`}>{categoriaNombre}</Link> /{' '}
      {p.nombre}
    </>
  );

  return (
    <>
      <ProductoDetalle
        nombre={p.nombre}
        descripcion={p.descripcion}
        descripcion2={p.descripcion2 ?? undefined}
        imagen={p.imagen_url ?? undefined}
        categoria={categoriaNombre}
        breadcrumb={breadcrumb}
      />

      {/* Botón agregar al carrito */}
      {Number(p.precio) > 0 && (
        <section className={styles.detalleCarrito}>
          <BtnAgregarCarrito
            id={String(p.id)}
            nombre={p.nombre}
            precio={Number(p.precio)}
            imagen={p.imagen_url ?? undefined}
          />
        </section>
      )}

      {/* Datos adicionales públicos de ferretería */}
      {extras.length > 0 && (
        <section className={styles.detalleExtra}>
          <h3 className={styles.detalleExtraTitulo}>
            <i className="fa-solid fa-circle-info" /> Información del producto
          </h3>
          <div className={styles.detalleExtraGrid}>
            {extras.map((e) => (
              <div key={e.label} className={styles.detalleExtraItem}>
                <span className={styles.detalleExtraLabel}>{e.label}</span>
                <span className={styles.detalleExtraValor}>{e.valor}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
