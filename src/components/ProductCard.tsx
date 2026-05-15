'use client';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  id: string | number;
  nombre: string;
  precio: number;
  imagen?: string;
  opciones: string[];
}

export default function ProductCard({ id, nombre, precio, imagen, opciones }: ProductCardProps) {
  const { addToCart } = useCart();
  const [seleccion, setSeleccion] = useState(opciones[0]);
  const [agregado, setAgregado] = useState(false);

  const onAdd = () => {
    addToCart({
      id: `${id}-${seleccion}`,
      nombre: `${nombre} (${seleccion})`,
      precio,
      imagen,
    });
    setAgregado(true);
    setTimeout(() => setAgregado(false), 1500);
  };

  return (
    <div style={{ backgroundColor: 'var(--azul-secundario)', padding: '15px', borderRadius: '12px', color: 'white' }}>
      {imagen && (
        <img src={imagen} alt={nombre} style={{ width: '100%', borderRadius: '8px', height: '160px', objectFit: 'cover' }} />
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
