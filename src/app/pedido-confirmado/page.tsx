'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from '@/styles/pedidoConfirmado.module.css';

function Contenido() {
  const params = useSearchParams();
  const ordenId = params.get('id');

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.iconWrap}>
          <i className="fa-solid fa-circle-check" />
        </div>

        <h1 className={styles.titulo}>¡Pedido recibido!</h1>
        <p className={styles.subtitulo}>
          Tu pedido ha sido registrado correctamente.
          {ordenId && (
            <> El número de tu orden es <strong className={styles.ordenId}>#{ordenId}</strong>.</>
          )}
        </p>
        <p className={styles.info}>
          <i className="fa-solid fa-phone" />
          Nos pondremos en contacto contigo pronto para coordinar la entrega
          y confirmar los detalles de tu compra.
        </p>

        <div className={styles.acciones}>
          <Link href="/perfil" className={styles.btnPrimario}>
            <i className="fa-solid fa-bag-shopping" />
            Ver mis pedidos
          </Link>
          <Link href="/" className={styles.btnSecundario}>
            <i className="fa-solid fa-house" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PedidoConfirmadoPage() {
  return (
    <Suspense fallback={
      <div style={{ textAlign: 'center', padding: '120px 0', color: 'var(--azul-medio)' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem' }} />
      </div>
    }>
      <Contenido />
    </Suspense>
  );
}
