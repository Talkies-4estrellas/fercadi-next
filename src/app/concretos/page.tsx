import styles from '@/styles/product.module.css'
import CalculadoraVolumen from '@/components/CalculadoraVolumen'
import SectionHero from '@/components/SectionHero'

export const metadata = { title: 'Calculadora de Concreto - FERCADI' }

export default function ConcretosPage() {
  return (
    <>
      <SectionHero
        icono="fa-solid fa-calculator"
        etiqueta="Concretos"
        titulo="Calculadora de Volumen"
        subtitulo="Calcula el concreto que necesitas para tu obra de forma rápida y precisa."
      />
      <CalculadoraVolumen />
    </>
  )
}
