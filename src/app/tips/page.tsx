import Link from 'next/link';
import Image from 'next/image';
import { getTips } from '@/lib/tips';
import styles from '@/styles/tips.module.css';

export const metadata = { title: 'Tips de Construcción — FERCADI' };
export const dynamic = 'force-dynamic';

export default async function TipsPage() {
  const tips = await getTips();

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        <div className={styles.header}>
          <p className={styles.breadcrumb}>
            <Link href="/">Inicio</Link> › Tips y Tutoriales
          </p>
          <h1 className={styles.titulo}>Tips y Tutoriales</h1>
          <p className={styles.subtitulo}>
            Consejos prácticos y guías de construcción del equipo FERCADI.
          </p>
        </div>

        {tips.length === 0 ? (
          <div className={styles.vacio}>
            <i className="fa-solid fa-lightbulb" aria-hidden="true" />
            <p>Próximamente nuevos tutoriales.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {tips.map((tip) => (
              <article key={tip.slug} className={styles.card}>
                <div className={styles.cardImg}>
                  {tip.imagen ? (
                    <Image
                      src={tip.imagen}
                      alt={tip.titulo}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div className={styles.cardImgPlaceholder}>
                      <i className="fa-solid fa-lightbulb" aria-hidden="true" />
                    </div>
                  )}
                </div>
                <div className={styles.cardBody}>
                  <h2 className={styles.cardTitulo}>{tip.titulo}</h2>
                  {tip.descripcion && (
                    <p className={styles.cardDesc}>{tip.descripcion}</p>
                  )}
                  <Link href={`/tips/${tip.slug}`} className={styles.cardBtn}>
                    Leer tutorial <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
