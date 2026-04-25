import Link from 'next/link'
import { notFound } from 'next/navigation'
import styles from '@/styles/product.module.css'

const paginas: Record<string, { titulo: string; contenido: string }> = {
  mision: {
    titulo: 'Misión',
    contenido:
      'Proporcionar materiales de construcción de la más alta calidad, respaldados por un servicio al cliente excepcional, contribuyendo al desarrollo de proyectos seguros, resistentes y duraderos.',
  },
  valores: {
    titulo: 'Valores',
    contenido:
      'Calidad, integridad, compromiso con el cliente, innovación y responsabilidad social son los pilares que guían cada una de nuestras acciones.',
  },
  clientes: {
    titulo: 'Nuestros Clientes',
    contenido:
      'Servimos a constructores, arquitectos, ingenieros y particulares que buscan materiales de primera calidad para sus proyectos de construcción en toda la región.',
  },
  etica: {
    titulo: 'Ética y Normatividad',
    contenido:
      'Operamos bajo los más estrictos estándares de calidad y cumplimiento normativo, garantizando que todos nuestros productos cumplen con las normas mexicanas de construcción.',
  },
  buzon: {
    titulo: 'Buzón y Comentarios',
    contenido:
      'Tu opinión es muy importante para nosotros. Envíanos tus comentarios, sugerencias o quejas a través de nuestro formulario de contacto.',
  },
  laboratorio: {
    titulo: 'Laboratorio y Servicio Técnico',
    contenido:
      'Contamos con laboratorio propio para garantizar la calidad de nuestros concretos. Ofrecemos servicio técnico especializado para asesorar a nuestros clientes en sus proyectos.',
  },
}

export function generateStaticParams() {
  return Object.keys(paginas).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const pagina = paginas[slug]
  return { title: `${pagina?.titulo ?? 'Información'} - FERCADI` }
}

export default async function PieDePaginaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const pagina = paginas[slug]
  if (!pagina) notFound()

  return (
    <>
      <div className={styles.breadcrumb}>
        <Link href="/">Inicio</Link> / {pagina.titulo}
      </div>
      <div style={{ maxWidth: '700px', margin: '60px auto', padding: '0 20px' }}>
        <h1 style={{ color: 'var(--azul-oscuro)', fontSize: '2.5rem', fontWeight: 900, marginBottom: '30px' }}>
          {pagina.titulo}
        </h1>
        <p style={{ color: 'var(--azul-secundario)', lineHeight: 1.8, fontSize: '1.1rem' }}>
          {pagina.contenido}
        </p>
      </div>
    </>
  )
}
