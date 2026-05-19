'use client';

import Link from 'next/link';
import ProductoForm from '@/components/admin/ProductoForm';
import styles from '@/styles/admin.module.css';

export default function AdminProductoNuevoPage() {
  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <Link href="/admin/productos" className={styles.btnLink}>
            <i className="fa-solid fa-arrow-left" /> Volver al listado
          </Link>
          <h1 className={styles.pageTitle}>Nuevo producto</h1>
        </div>
      </div>
      <ProductoForm modo="crear" />
    </>
  );
}
