import styles from '@/styles/sectionHero.module.css';

interface Props {
  icono: string;
  etiqueta: string;
  titulo: string;
  subtitulo: string;
}

export default function SectionHero({ icono, etiqueta, titulo, subtitulo }: Props) {
  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        <div className={styles.etiqueta}>
          <i className={icono} /> {etiqueta}
        </div>
        <h1 className={styles.titulo}>{titulo}</h1>
        <p className={styles.sub}>{subtitulo}</p>
      </div>
    </section>
  );
}
