import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTipBySlug } from '@/lib/tips';
import styles from '@/styles/tips.module.css';

export const dynamic = 'force-dynamic';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const tip = await getTipBySlug(slug);
  if (!tip) return { title: 'Tip no encontrado — FERCADI' };
  return {
    title: `${tip.titulo} — Tips FERCADI`,
    description: tip.descripcion ?? undefined,
  };
}

/** Renderiza **texto** como <strong> y líneas en blanco como saltos de párrafo. */
function renderContenido(texto: string) {
  return texto.split('\n\n').map((bloque, i) => {
    const lineas = bloque.split('\n').map((linea, j) => {
      // Negrita: **texto**
      const partes = linea.split(/\*\*(.+?)\*\*/g);
      const nodos = partes.map((p, k) => k % 2 === 1 ? <strong key={k}>{p}</strong> : p);
      return <span key={j}>{nodos}{j < bloque.split('\n').length - 1 && <br />}</span>;
    });
    return <p key={i} className={styles.contenidoParrafo}>{lineas}</p>;
  });
}

export default async function TipPage({ params }: { params: Params }) {
  const { slug } = await params;
  const tip = await getTipBySlug(slug);
  if (!tip) notFound();

  return (
    <div className={styles.detallePage}>
      <div className={styles.detalleContainer}>

        <p className={styles.breadcrumb}>
          <Link href="/">Inicio</Link> ›{' '}
          <Link href="/tips">Tips y Tutoriales</Link> ›{' '}
          {tip.titulo}
        </p>

        {tip.imagen && (
          <div className={styles.detalleBanner}>
            <Image
              src={tip.imagen}
              alt={tip.titulo}
              fill
              sizes="(max-width: 860px) 100vw, 860px"
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
        )}

        <h1 className={styles.detalleTitulo}>{tip.titulo}</h1>

        {tip.descripcion && (
          <p className={styles.detalleDesc}>{tip.descripcion}</p>
        )}

        {tip.contenido && (
          <div className={styles.contenido}>
            {renderContenido(tip.contenido)}
          </div>
        )}

        <div className={styles.detalleVolver}>
          <Link href="/tips" className={styles.btnVolver}>
            <i className="fa-solid fa-arrow-left" /> Ver todos los tips
          </Link>
        </div>
      </div>
    </div>
  );
}
