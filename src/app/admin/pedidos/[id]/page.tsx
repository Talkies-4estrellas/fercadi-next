'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from '@/styles/admin.module.css';

const METODO_PAGO_LABEL: Record<string, string> = {
  efectivo:      '💵 Efectivo contra entrega',
  transferencia: '🏦 Transferencia bancaria',
  tarjeta:       '💳 Tarjeta de crédito / débito',
};

interface OrdenDetalle {
  id: number;
  usuario_id: number;
  usuario_nombre: string;
  usuario_correo: string;
  total: number;
  estado: string;
  notas: string | null;
  direccion_entrega: string | null;
  metodo_pago: string | null;
  created_at: string;
}

interface ItemDetalle {
  id: number;
  producto: string;
  opciones: string | null;
  cantidad: number;
  precio_unitario: number;
  total: number;
  estado: string;
}

const ESTADOS = [
  { value: 'pendiente',      label: 'Pendiente'       },
  { value: 'confirmado',     label: 'Confirmado'      },
  { value: 'en_preparacion', label: 'En preparación'  },
  { value: 'enviado',        label: 'Enviado'         },
  { value: 'entregado',      label: 'Entregado'       },
  { value: 'cancelado',      label: 'Cancelado'       },
];

const BADGE_CLASS: Record<string, string> = {
  pendiente:       styles.estadoPendiente,
  confirmado:      styles.estadoConfirmado,
  en_preparacion:  styles.estadoPreparacion,
  enviado:         styles.estadoEnviado,
  entregado:       styles.estadoActivo,
  cancelado:       styles.estadoInactivo,
};

function formatFecha(f: string) {
  return new Date(f).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatMoneda(v: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v);
}

export default function AdminPedidoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();

  const [orden,      setOrden]      = useState<OrdenDetalle | null>(null);
  const [items,      setItems]      = useState<ItemDetalle[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [guardando,  setGuardando]  = useState(false);
  const [msgOk,      setMsgOk]      = useState('');
  const [msgErr,     setMsgErr]     = useState('');

  useEffect(() => {
    if (!user) return;
    fetch(`/api/admin/pedidos/${id}`, {
      headers: { 'x-usuario-id': String(user.id) },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setOrden(data.orden);
          setItems(data.items ?? []);
          setNuevoEstado(data.orden.estado);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, id]);

  const handleGuardar = async () => {
    if (!user || !orden) return;
    setGuardando(true);
    setMsgOk('');
    setMsgErr('');
    try {
      const res = await fetch(`/api/admin/pedidos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-usuario-id': String(user.id),
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      const data = await res.json();
      if (data.ok) {
        setOrden((prev) => prev ? { ...prev, estado: nuevoEstado } : prev);
        setMsgOk('Estado actualizado correctamente.');
      } else {
        setMsgErr(data.error || 'No se pudo actualizar el estado.');
      }
    } catch {
      setMsgErr('Error de conexión.');
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <p className={styles.loadingText}>
        <i className="fa-solid fa-spinner fa-spin" /> Cargando pedido…
      </p>
    );
  }

  if (!orden) {
    return (
      <div>
        <p className={styles.emptyText}>
          <i className="fa-solid fa-circle-exclamation" /> Orden no encontrada.
        </p>
        <Link href="/admin/pedidos" className={styles.btnSecondary}>
          ← Volver a pedidos
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          Pedido <span style={{ color: 'var(--azul-boton)' }}>#{orden.id}</span>
        </h1>
        <Link href="/admin/pedidos" className={styles.btnSecondary}>
          <i className="fa-solid fa-arrow-left" /> Volver
        </Link>
      </div>

      <div className={styles.pedidoGrid}>

        {/* ── Panel izquierdo: ítems ── */}
        <div>
          {/* Info del cliente */}
          <div className={styles.detalleCard}>
            <p className={styles.detalleCardTitulo}>
              <i className="fa-solid fa-user" /> Cliente
            </p>
            <p className={styles.detalleRow}><strong>Nombre:</strong> {orden.usuario_nombre}</p>
            <p className={styles.detalleRow}><strong>Correo:</strong> {orden.usuario_correo}</p>
            <p className={styles.detalleRow}><strong>Fecha:</strong> {formatFecha(orden.created_at)}</p>
            {orden.direccion_entrega && (
              <p className={styles.detalleRow}><strong>Dirección:</strong> {orden.direccion_entrega}</p>
            )}
            {orden.metodo_pago && (
              <p className={styles.detalleRow}>
                <strong>Forma de pago:</strong> {METODO_PAGO_LABEL[orden.metodo_pago] ?? orden.metodo_pago}
              </p>
            )}
            {orden.notas && (
              <p className={styles.detalleRow}><strong>Notas:</strong> {orden.notas}</p>
            )}
          </div>

          {/* Tabla de ítems */}
          <div className={styles.tablaWrap} style={{ marginTop: '16px' }}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Opciones</th>
                  <th>Cant.</th>
                  <th>Precio unit.</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td><div className={styles.productoNombre}>{item.producto}</div></td>
                    <td>
                      {item.opciones
                        ? <span className={styles.seccionChip}>{item.opciones}</span>
                        : <span style={{ color: 'rgba(0,0,0,0.3)' }}>—</span>
                      }
                    </td>
                    <td>{item.cantidad}</td>
                    <td>{formatMoneda(item.precio_unitario)}</td>
                    <td style={{ fontWeight: 700 }}>{formatMoneda(item.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} style={{ textAlign: 'right', fontWeight: 800, padding: '12px 16px' }}>Total</td>
                  <td style={{ fontWeight: 900, fontSize: '1.05rem', padding: '12px 16px' }}>
                    {formatMoneda(orden.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* ── Panel derecho: cambio de estado ── */}
        <div className={styles.detalleCard}>
          <p className={styles.detalleCardTitulo}>
            <i className="fa-solid fa-truck" /> Estado del pedido
          </p>

          <p style={{ fontSize: '0.8rem', marginBottom: '6px', color: 'var(--azul-medio)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Estado actual
          </p>
          <span className={`${styles.estadoBadge} ${BADGE_CLASS[orden.estado] ?? ''}`} style={{ marginBottom: '20px', display: 'inline-block' }}>
            {orden.estado.replace('_', ' ')}
          </span>

          <p style={{ fontSize: '0.8rem', margin: '16px 0 6px', color: 'var(--azul-medio)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Cambiar a
          </p>
          <select
            value={nuevoEstado}
            onChange={(e) => setNuevoEstado(e.target.value)}
            className={styles.filtroSelect}
            style={{ width: '100%', marginBottom: '16px' }}
          >
            {ESTADOS.map((e) => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>

          {msgOk && (
            <p style={{ color: '#2ecc71', fontSize: '0.85rem', marginBottom: '12px' }}>
              <i className="fa-solid fa-check" /> {msgOk}
            </p>
          )}
          {msgErr && (
            <p style={{ color: '#e74c3c', fontSize: '0.85rem', marginBottom: '12px' }}>
              <i className="fa-solid fa-circle-exclamation" /> {msgErr}
            </p>
          )}

          <button
            className={styles.btnPrimary}
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={handleGuardar}
            disabled={guardando || nuevoEstado === orden.estado}
          >
            {guardando
              ? <><i className="fa-solid fa-spinner fa-spin" /> Guardando…</>
              : <><i className="fa-solid fa-floppy-disk" /> Guardar cambio</>
            }
          </button>
        </div>
      </div>
    </>
  );
}
