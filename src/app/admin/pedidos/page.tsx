'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from '@/styles/admin.module.css';

interface Orden {
  id: number;
  usuario_nombre: string;
  usuario_correo: string;
  total: number;
  estado: string;
  num_items: number;
  created_at: string;
}

const ESTADOS = [
  { value: '',               label: 'Todos los estados' },
  { value: 'pendiente',      label: 'Pendiente'         },
  { value: 'confirmado',     label: 'Confirmado'        },
  { value: 'en_preparacion', label: 'En preparación'    },
  { value: 'enviado',        label: 'Enviado'           },
  { value: 'entregado',      label: 'Entregado'         },
  { value: 'cancelado',      label: 'Cancelado'         },
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
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatMoneda(v: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v);
}

const LIMIT = 50;

export default function AdminPedidosPage() {
  const { user } = useAuth();

  const [ordenes,  setOrdenes]  = useState<Orden[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [estado,   setEstado]   = useState('');
  const [qInput,   setQInput]   = useState('');
  const [qActivo,  setQActivo]  = useState('');
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const [pages,    setPages]    = useState(1);
  const abortRef = useRef<AbortController | null>(null);

  const cargar = useCallback((p: number, est: string, busq: string) => {
    if (!user) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);

    const params = new URLSearchParams();
    if (est)  params.set('estado', est);
    if (busq) params.set('q', busq);
    params.set('page',  String(p));
    params.set('limit', String(LIMIT));

    fetch(`/api/admin/pedidos?${params}`, {
      headers: { 'x-usuario-id': String(user.id) },
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setOrdenes(data.ordenes ?? []);
          setTotal(data.total ?? 0);
          setPages(data.pages ?? 1);
        } else {
          setOrdenes([]); setTotal(0); setPages(1);
        }
      })
      .catch((e) => { if (e?.name !== 'AbortError') { setOrdenes([]); setTotal(0); setPages(1); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
  }, [user]);

  useEffect(() => {
    cargar(page, estado, qActivo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, page, estado]);

  const handleEstado = (val: string) => {
    setEstado(val);
    setPage(1);
    setQInput('');
    setQActivo('');
  };

  const handleBuscar = () => {
    setQActivo(qInput);
    setPage(1);
    cargar(1, estado, qInput);
  };

  const inicio = total === 0 ? 0 : (page - 1) * LIMIT + 1;
  const fin    = Math.min(page * LIMIT, total);

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Pedidos</h1>
        {!loading && total > 0 && (
          <span className={styles.totalChip}>{total.toLocaleString('es-MX')} órdenes</span>
        )}
      </div>

      {/* ── Filtros ── */}
      <div className={styles.filtros}>
        <select
          value={estado}
          onChange={(e) => handleEstado(e.target.value)}
          className={styles.filtroSelect}
        >
          {ESTADOS.map((e) => (
            <option key={e.value} value={e.value}>{e.label}</option>
          ))}
        </select>

        <div className={styles.filtroBuscar}>
          <input
            type="text"
            placeholder="Buscar por nombre o correo…"
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleBuscar(); }}
            className={styles.filtroInput}
          />
          <button onClick={handleBuscar} className={styles.btnSecondary}>
            <i className="fa-solid fa-magnifying-glass" />
          </button>
        </div>
      </div>

      {/* ── Contenido ── */}
      {loading ? (
        <p className={styles.loadingText}>
          <i className="fa-solid fa-spinner fa-spin" /> Cargando…
        </p>
      ) : ordenes.length === 0 ? (
        <p className={styles.emptyText}>
          <i className="fa-solid fa-inbox" /> Sin pedidos con los filtros actuales.
        </p>
      ) : (
        <>
          <div className={styles.tablaWrap}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cliente</th>
                  <th>Ítems</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {ordenes.map((o) => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 700 }}>#{o.id}</td>
                    <td>
                      <div className={styles.productoNombre}>{o.usuario_nombre}</div>
                      <div className={styles.productoSlug}>{o.usuario_correo}</div>
                    </td>
                    <td>{o.num_items} {Number(o.num_items) === 1 ? 'ítem' : 'ítems'}</td>
                    <td style={{ fontWeight: 700 }}>{formatMoneda(o.total)}</td>
                    <td>
                      <span className={`${styles.estadoBadge} ${BADGE_CLASS[o.estado] ?? ''}`}>
                        {o.estado.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#777' }}>{formatFecha(o.created_at)}</td>
                    <td className={styles.accionesCol}>
                      <Link href={`/admin/pedidos/${o.id}`} className={styles.btnIcono} title="Ver detalle">
                        <i className="fa-solid fa-eye" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Paginador ── */}
          {pages > 1 && (
            <div className={styles.paginador}>
              <span className={styles.paginadorInfo}>
                {inicio.toLocaleString('es-MX')}–{fin.toLocaleString('es-MX')} de {total.toLocaleString('es-MX')}
              </span>
              <div className={styles.paginadorBtns}>
                <button className={styles.btnSecondary} disabled={page === 1}     onClick={() => setPage(1)}           title="Primera"><i className="fa-solid fa-angles-left" /></button>
                <button className={styles.btnSecondary} disabled={page === 1}     onClick={() => setPage(p => p - 1)} title="Anterior"><i className="fa-solid fa-angle-left" /></button>
                <span className={styles.paginadorPagina}>Pág. {page} / {pages}</span>
                <button className={styles.btnSecondary} disabled={page === pages} onClick={() => setPage(p => p + 1)} title="Siguiente"><i className="fa-solid fa-angle-right" /></button>
                <button className={styles.btnSecondary} disabled={page === pages} onClick={() => setPage(pages)}      title="Última"><i className="fa-solid fa-angles-right" /></button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
