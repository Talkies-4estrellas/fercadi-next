'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { resolverImagenProducto } from '@/lib/imagen';
import styles from '@/styles/checkout.module.css';

export default function CheckoutPage() {
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [notas, setNotas]         = useState('');
  const [direccion, setDireccion] = useState('');
  const [enviando, setEnviando]   = useState(false);
  const [error, setError]         = useState('');
  const [listo, setListo]         = useState(false);

  // Esperar hidratación del localStorage antes de verificar
  useEffect(() => {
    setListo(true);
  }, []);

  useEffect(() => {
    if (!listo) return;
    if (!user) {
      router.replace('/login?next=/checkout');
    } else if (cart.length === 0) {
      router.replace('/');
    }
  }, [listo, user, cart.length, router]);

  if (!listo || !user || cart.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <p style={{ textAlign: 'center', padding: '80px 0', color: 'var(--azul-medio)' }}>
            <i className="fa-solid fa-spinner fa-spin" /> Cargando…
          </p>
        </div>
      </div>
    );
  }

  const handleConfirmar = async () => {
    setError('');
    setEnviando(true);
    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: user.id,
          items: cart,
          notas: notas.trim() || undefined,
          direccion: direccion.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        clearCart();
        router.push(`/pedido-confirmado?id=${data.orden_id}`);
      } else {
        setError(data.error || 'No se pudo procesar el pedido. Intenta de nuevo.');
      }
    } catch {
      setError('Error de conexión. Verifica tu internet e intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* ── Encabezado ── */}
        <div className={styles.header}>
          <p className={styles.breadcrumb}>
            <Link href="/">Inicio</Link>
            {' › '}
            Confirmar pedido
          </p>
          <h1 className={styles.titulo}>Confirmar pedido</h1>
        </div>

        {/* ── Layout dos columnas ── */}
        <div className={styles.layout}>

          {/* ── Panel izquierdo: ítems ── */}
          <div className={styles.panelItems}>
            <p className={styles.panelTitulo}>
              <i className="fa-solid fa-bag-shopping" />
              {cart.length} {cart.length === 1 ? 'producto' : 'productos'}
            </p>
            <ul className={styles.itemLista}>
              {cart.map((item) => {
                const img = resolverImagenProducto(item.imagen);
                return (
                  <li key={item.id} className={styles.item}>
                    {img ? (
                      <div className={styles.itemImg}>
                        <Image src={img} alt={item.nombre} fill sizes="56px" style={{ objectFit: 'cover' }} />
                      </div>
                    ) : (
                      <div className={styles.itemImgPlaceholder}>
                        <i className="fa-regular fa-image" />
                      </div>
                    )}
                    <div className={styles.itemInfo}>
                      <span className={styles.itemNombre}>{item.nombre}</span>
                      {item.opciones && (
                        <span className={styles.itemOpciones}>{item.opciones}</span>
                      )}
                      <span className={styles.itemCantidad}>Cantidad: {item.cantidad}</span>
                    </div>
                    <span className={styles.itemPrecio}>
                      ${(item.precio * item.cantidad).toFixed(2)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* ── Panel derecho: resumen + notas + confirmar ── */}
          <div className={styles.panelResumen}>
            <p className={styles.resumenTitulo}>Resumen del pedido</p>

            {/* Desglose */}
            {cart.map((item) => (
              <div key={item.id} className={styles.resumenFila}>
                <span>{item.nombre}{item.cantidad > 1 ? ` ×${item.cantidad}` : ''}</span>
                <span>${(item.precio * item.cantidad).toFixed(2)}</span>
              </div>
            ))}

            <div className={styles.resumenFilaTotal}>
              <span>Total</span>
              <span className={styles.resumenMonto}>${total.toFixed(2)}</span>
            </div>

            {/* Dirección de entrega */}
            <div>
              <label className={styles.campoLabel} htmlFor="checkout-dir">
                Dirección de entrega
              </label>
              <input
                id="checkout-dir"
                type="text"
                className={styles.inputField}
                placeholder="Calle, colonia, ciudad…"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
              />
            </div>

            {/* Notas adicionales */}
            <div>
              <label className={styles.campoLabel} htmlFor="checkout-notas">
                Notas adicionales
              </label>
              <textarea
                id="checkout-notas"
                className={styles.textarea}
                placeholder="Instrucciones especiales, horario de entrega…"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
              />
            </div>

            {/* Error */}
            {error && (
              <div className={styles.error} role="alert">
                <i className="fa-solid fa-circle-exclamation" />
                {error}
              </div>
            )}

            {/* Botón confirmar */}
            <button
              className={styles.btnConfirmar}
              onClick={handleConfirmar}
              disabled={enviando}
            >
              {enviando ? (
                <><i className="fa-solid fa-spinner fa-spin" /> Procesando…</>
              ) : (
                <><i className="fa-solid fa-check" /> Confirmar pedido</>
              )}
            </button>

            {/* Volver */}
            <Link href="/" className={styles.btnVolver}>
              <i className="fa-solid fa-arrow-left" />
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
