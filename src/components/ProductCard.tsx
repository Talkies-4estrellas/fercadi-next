'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { resolverImagenProducto } from '@/lib/imagen';

interface ProductCardProps {
  id: string | number;
  nombre: string;
  precio: number;
  imagen?: string;
  opciones: string[];
}

/**
 * Tarjeta de producto. Permite elegir una "opción" (presentación, tamaño,
 * etc.) y agrega al carrito guardando el nombre del producto y la opción
 * por separado — para que el historial de pedidos pueda mostrarlas en
 * columnas distintas en lugar de un string concatenado.
 */
export default function ProductCard({ id, nombre, precio, imagen, opciones }: ProductCardProps) {
  const { addToCart } = useCart();
  const [seleccion, setSeleccion] = useState(opciones[0]);
  const [agregado, setAgregado] = useState(false);

  const imagenResuelta = resolverImagenProducto(imagen);

  const onAdd = () => {
    addToCart({
      id: `${id}-${seleccion}`,
      nombre,
      opciones: seleccion,
      precio,
      imagen: imagenResuelta,
    });
    setAgregado(true);
    setTimeout(() => setAgregado(false), 1500);
  };

  return (
    <div style={{ backgroundColor: 'var(--azul-secundario)', padding: '15px', borderRadius: '12px', color: 'white' }}>
      {imagenResuelta && (
        <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.04)' }}>
          <Image
            src={imagenResuelta}
            alt={nombre}
            fill
            sizes="(max-width: 768px) 50vw, 280px"
            style={{ objectFit: 'cover' }}
          />
        </div>
      )}
      <h4 style={{ margin: '10px 0 4px', fontSize: '0.95rem' }}>{nombre}</h4>
      <p style={{ color: 'var(--dorado)', fontWeight: 700, marginBottom: '10px' }}>${precio.toFixed(2)}</p>

      <select
        value={seleccion}
        onChange={(e) => setSeleccion(e.target.value)}
        style={{
          width: '100%', padding: '7px 10px', marginBottom: '10px',
          borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)',
          backgroundColor: 'rgba(255,255,255,0.08)', color: 'white',
          fontFamily: 'inherit', fontSize: '0.85rem',
        }}
      >
        {opciones.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>

      <button
        onClick={onAdd}
        style={{
          width: '100%', padding: '10px', border: 'none', cursor: 'pointer',
          borderRadius: '20px', fontWeight: 700, fontSize: '0.85rem',
          backgroundColor: agregado ? '#27ae60' : 'var(--azul-boton)',
          color: 'white', transition: 'background-color 0.25s',
        }}
      >
        <i className={`fa-solid ${agregado ? 'fa-check' : 'fa-cart-plus'}`} style={{ marginRight: 6 }} />
        {agregado ? '¡Agregado!' : 'Agregar al carrito'}
      </button>
    </div>
  );
}
