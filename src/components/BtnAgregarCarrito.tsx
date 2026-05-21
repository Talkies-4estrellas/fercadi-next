'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import styles from '@/styles/btnAgregarCarrito.module.css';

interface Props {
  id: string;
  nombre: string;
  precio: number;
  imagen?: string;
  opciones?: string;
}

export default function BtnAgregarCarrito({ id, nombre, precio, imagen, opciones }: Props) {
  const { addToCart } = useCart();
  const [agregado, setAgregado] = useState(false);

  const handleAgregar = () => {
    addToCart({ id, nombre, precio, imagen, opciones });
    setAgregado(true);
    setTimeout(() => setAgregado(false), 1800);
  };

  return (
    <button
      className={`${styles.btn} ${agregado ? styles.btnOk : ''}`}
      onClick={handleAgregar}
      aria-label={`Agregar ${nombre} al carrito`}
    >
      {agregado ? (
        <><i className="fa-solid fa-check" /> Agregado</>
      ) : (
        <><i className="fa-solid fa-bag-shopping" /> Agregar al carrito</>
      )}
    </button>
  );
}
