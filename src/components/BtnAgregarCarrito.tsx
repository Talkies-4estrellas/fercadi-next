'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { resolverImagenProducto } from '@/lib/imagen';
import styles from '@/styles/btnAgregarCarrito.module.css';

interface Props {
  id: string;
  nombre: string;
  precio: number;
  imagen?: string;
  opciones?: string;
}

export default function BtnAgregarCarrito({ id, nombre, precio, imagen, opciones }: Props) {
  const { addToCart, openCart } = useCart();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [cantidad,     setCantidad]     = useState(1);
  const [confirmado,   setConfirmado]   = useState(false);

  const imgSrc = resolverImagenProducto(imagen);

  const abrir  = () => { setCantidad(1); setConfirmado(false); setModalAbierto(true); };
  const cerrar = () => setModalAbierto(false);

  const sumar   = () => setCantidad((n) => Math.min(99, n + 1));
  const restar  = () => setCantidad((n) => Math.max(1,  n - 1));
  const cambiar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value, 10);
    if (!isNaN(v)) setCantidad(Math.min(99, Math.max(1, v)));
  };

  const confirmar = () => {
    addToCart({ id, nombre, precio, imagen, opciones }, cantidad);
    setConfirmado(true);
    setTimeout(() => {
      cerrar();
      openCart();
    }, 900);
  };

  return (
    <>
      {/* ── Botón trigger ── */}
      <button className={styles.btn} onClick={abrir}>
        <i className="fa-solid fa-bag-shopping" />
        Agregar al carrito
      </button>

      {/* ── Modal overlay ── */}
      {modalAbierto && (
        <div className={styles.overlay} onClick={cerrar}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

            {/* Cabecera */}
            <div className={styles.modalHeader}>
              <span className={styles.modalTitulo}>Confirmar producto</span>
              <button className={styles.modalCerrar} onClick={cerrar} aria-label="Cerrar">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Producto */}
            <div className={styles.modalProducto}>
              {imgSrc ? (
                <div className={styles.modalImg}>
                  <Image src={imgSrc} alt={nombre} fill sizes="80px" style={{ objectFit: 'cover' }} />
                </div>
              ) : (
                <div className={styles.modalImgPlaceholder}>
                  <i className="fa-regular fa-image" />
                </div>
              )}
              <div className={styles.modalInfo}>
                <p className={styles.modalNombre}>{nombre}</p>
                {opciones && <p className={styles.modalOpciones}>{opciones}</p>}
                <p className={styles.modalPrecioUnit}>
                  Precio unitario: <strong>${precio.toFixed(2)}</strong>
                </p>
              </div>
            </div>

            {/* Selector de cantidad */}
            <div className={styles.cantidadWrap}>
              <span className={styles.cantidadLabel}>Cantidad</span>
              <div className={styles.cantidadCtrl}>
                <button
                  className={styles.cantidadBtn}
                  onClick={restar}
                  disabled={cantidad <= 1}
                  aria-label="Reducir"
                >−</button>
                <input
                  type="number"
                  className={styles.cantidadInput}
                  value={cantidad}
                  onChange={cambiar}
                  min={1}
                  max={99}
                />
                <button
                  className={styles.cantidadBtn}
                  onClick={sumar}
                  disabled={cantidad >= 99}
                  aria-label="Aumentar"
                >+</button>
              </div>
            </div>

            {/* Total parcial */}
            <div className={styles.subtotalRow}>
              <span>Subtotal</span>
              <span className={styles.subtotalMonto}>${(precio * cantidad).toFixed(2)}</span>
            </div>

            {/* Aviso */}
            <p className={styles.aviso}>
              <i className="fa-solid fa-circle-info" />
              Revisa que el producto y la cantidad sean correctos antes de continuar.
            </p>

            {/* Acciones */}
            <div className={styles.modalAcciones}>
              <button className={styles.btnCancelar} onClick={cerrar}>
                Cancelar
              </button>
              <button
                className={`${styles.btnConfirmar} ${confirmado ? styles.btnConfirmadoOk : ''}`}
                onClick={confirmar}
                disabled={confirmado}
              >
                {confirmado ? (
                  <><i className="fa-solid fa-check" /> ¡Agregado!</>
                ) : (
                  <><i className="fa-solid fa-bag-shopping" /> Agregar al carrito</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
