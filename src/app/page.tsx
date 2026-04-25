import Link from 'next/link'
import Carousel from '@/components/Carousel'
import styles from '@/styles/home.module.css'

export default function HomePage() {
  return (
    <section className={styles.hero}>
      <div className={styles.sideCards}>
        <div className={styles.card}>
          <h3>CONCRETO</h3>
          <p>
            Empieza tu construcción con el pie derecho. Pregunta por nuestras promociones
            que tenemos al estar con nosotros desde el inicio de tu obra.
          </p>
          <button>
            <Link href="/concretos">Ver</Link>
          </button>
        </div>

        <div className={styles.card}>
          <h3>RENTA DE EQUIPO</h3>
          <p>
            Ahorra costos de mano de obra utilizando los equipos adecuados y garantiza la
            calidad de tu proyecto. Te facilitamos al especialista si lo requieres.
          </p>
          <button>
            <Link href="/concretos/servicios">Ver</Link>
          </button>
        </div>
      </div>

      <div className={styles.carouselWrapper}>
        <Carousel />
      </div>

      <div className={styles.sideCards}>
        <div className={styles.card}>
          <h3>COTIZACIÓN</h3>
          <p>
            Solicita tu presupuesto personalizado sin costo. Cuéntanos qué necesitas y
            te respondemos a la brevedad con la mejor opción para tu proyecto.
          </p>
          <button>
            <Link href="/cotizacion">Solicitar</Link>
          </button>
        </div>

        <div className={styles.card}>
          <h3>TEXTURIZADOS Y ADHESIVOS</h3>
          <p>
            Nuestro compromiso es generar productos de alta calidad y eficiencia en la
            decoración, protección y eficiencia en el desarrollo de obra.
          </p>
          <button>
            <Link href="/textucos">Ver</Link>
          </button>
        </div>
      </div>
    </section>
  )
}
