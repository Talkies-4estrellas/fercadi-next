import Link from 'next/link'
import styles from '@/styles/product.module.css'
import CalculadoraVolumen from '@/components/CalculadoraVolumen'

export const metadata = { title: 'Calculadora de Concreto - FERCADI' }

export default function ConcretosPage() {
  return (
    <>
      <div className={styles.breadcrumb}>
        <Link href="/">Inicio</Link> / Calculadora de Volumen
      </div>
      <CalculadoraVolumen />
    </>
  )
}
