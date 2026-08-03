import Link from 'next/link'
import Image from 'next/image'
import styles from '@/styles/footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>

        <div className={styles.col}>
          <h3>Empresa</h3>
          <nav className={styles.linkList}>
            <Link href="/pie-de-pagina/mision">Misión</Link>
            <Link href="/pie-de-pagina/valores">Valores</Link>
            <Link href="/pie-de-pagina/clientes">Nuestros Clientes</Link>
            <Link href="/pie-de-pagina/etica">Ética y Normatividad</Link>
            <Link href="/pie-de-pagina/buzon">Buzón y Comentarios</Link>
            <Link href="/pie-de-pagina/laboratorio">Laboratorio y Servicio Técnico</Link>
            <Link href="/cotizacion" className={styles.linkCotizacion}>
              ★ Solicitar Cotización
            </Link>
          </nav>
        </div>

        <div className={`${styles.col} ${styles.colCenter}`}>
          <h3>Compromiso</h3>
          <p>
            Nuestro compromiso es proporcionarte la más alta calidad en concreto y
            brindarte un excelente servicio al cliente. Siempre estaremos aquí para
            apoyarte y garantizar que tus proyectos de construcción sean seguros,
            resistentes y duraderos.
          </p>
          <div className={styles.firma}>
            <Link href="/">
              <Image src="/icons/logotipo1.svg" alt="FERCADI" width={150} height={42} />
            </Link>
            <span>Diseñado, Desarrollado y Producido</span>
          </div>
        </div>

        <div className={styles.col}>
          <h3>Contacto</h3>
          <div className={styles.social}>
            <a
              href="https://www.facebook.com/JosmanConstruccion"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className={styles.socialLink}
            >
              <i className="fa-brands fa-facebook" aria-hidden="true" />
            </a>
            <a
              href="https://api.whatsapp.com/send?phone=528003372234&text=Hola,%20me%20interesa%20saber%20más%20sobre%20sus%20productos"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className={styles.socialLink}
            >
              <i className="fa-brands fa-whatsapp" aria-hidden="true" />
            </a>
            <a
              href="tel:8003372234"
              aria-label="Teléfono"
              className={styles.socialLink}
            >
              <i className="fa-solid fa-phone" aria-hidden="true" />
            </a>
          </div>
          <p className={styles.telefono}>
            <i className="fa-solid fa-phone" aria-hidden="true" /> 800 337 2234
          </p>
        </div>

      </div>

      <div className={styles.copy}>
        <small>&copy; 2026 <b>Fercadi</b> — Todos los Derechos Reservados.</small>
      </div>
    </footer>
  )
}
