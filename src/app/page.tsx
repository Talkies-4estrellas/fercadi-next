import Link from 'next/link'
import Carousel from '@/components/Carousel'
import styles from '@/styles/home.module.css'
import { getHomeCards, getCarouselSlides } from '@/lib/homeContent'

export const revalidate = 300;

export default async function HomePage() {
  const [cards, slides] = await Promise.all([
    getHomeCards(),
    getCarouselSlides(),
  ]);

  const leftCards  = cards.filter(c => c.posicion <= 2);
  const rightCards = cards.filter(c => c.posicion >= 3);

  return (
    <section className={styles.hero}>
      <div className={styles.sideCards}>
        {leftCards.map(card => (
          <div key={card.id} className={styles.card}>
            <h3>{card.titulo}</h3>
            <p>{card.descripcion}</p>
            <Link href={card.btn_href} className={styles.cardBtn}>{card.btn_texto}</Link>
          </div>
        ))}
      </div>

      <div className={styles.carouselWrapper}>
        <Carousel slides={slides} />
      </div>

      <div className={styles.sideCards}>
        {rightCards.map(card => (
          <div key={card.id} className={styles.card}>
            <h3>{card.titulo}</h3>
            <p>{card.descripcion}</p>
            <Link href={card.btn_href} className={styles.cardBtn}>{card.btn_texto}</Link>
          </div>
        ))}
      </div>
    </section>
  )
}
