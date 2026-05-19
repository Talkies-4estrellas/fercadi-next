'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from '@/styles/perfil.module.css';

type Tab = 'resumen' | 'compras' | 'servicios' | 'suscripciones';

interface Compra {
  id: number;
  producto: string;
  opciones?: string | null;
  cantidad: number;
  precio_unitario?: number | null;
  total: number;
  estado: string;
  fecha: string;
}

interface Servicio {
  id: number;
  tipo: string;
  descripcion: string;
  estado: string;
  fecha: string;
}

interface Suscripcion {
  id: number;
  plan: string;
  estado: string;
  fecha_inicio: string;
  fecha_fin: string;
}

interface PerfilData {
  compras: Compra[];
  servicios: Servicio[];
  suscripciones: Suscripcion[];
}

function BadgeEstado({ estado }: { estado: string }) {
  const map: Record<string, string> = {
    pendiente:   styles.badgePendiente,
    procesando:  styles.badgeProcesando,
    completado:  styles.badgeCompletado,
    cancelado:   styles.badgeCancelado,
    activo:      styles.badgeActivo,
    activa:      styles.badgeActivo,
    vencido:     styles.badgeVencido,
    vencida:     styles.badgeVencido,
  };
  return (
    <span className={`${styles.badge} ${map[estado] ?? styles.badgePendiente}`}>
      {estado.charAt(0).toUpperCase() + estado.slice(1)}
    </span>
  );
}

function EmptyState({ icon, texto }: { icon: string; texto: string }) {
  return (
    <div className={styles.empty}>
      <span className={styles.emptyIcon}><i className={icon} /></span>
      <span className={styles.emptyText}>{texto}</span>
    </div>
  );
}

function formatFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function formatMoneda(valor: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(valor);
}

export default function PerfilPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('resumen');
  const [data, setData] = useState<PerfilData>({ compras: [], servicios: [], suscripciones: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetch(`/api/perfil?userId=${user.id}`)
      .then((r) => r.json())
      .then((d) => {
        // Aceptamos tanto la respuesta nueva { ok, compras, ... } como la antigua { compras, ... }
        setData({
          compras: Array.isArray(d?.compras) ? d.compras : [],
          servicios: Array.isArray(d?.servicios) ? d.servicios : [],
          suscripciones: Array.isArray(d?.suscripciones) ? d.suscripciones : [],
        });
      })
      .catch((err) => console.error('Error cargando perfil:', err))
      .finally(() => setLoading(false));
  }, [user, router]);

  if (!user) {
    return <div className={styles.redirect}>Redirigiendo...</div>;
  }

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'resumen',       label: 'Resumen',        icon: 'fa-solid fa-chart-pie' },
    { key: 'compras',       label: 'Compras',         icon: 'fa-solid fa-bag-shopping' },
    { key: 'servicios',     label: 'Servicios',       icon: 'fa-solid fa-helmet-safety' },
    { key: 'suscripciones', label: 'Suscripciones',   icon: 'fa-solid fa-star' },
  ];

  return (
    <>
      {/* ── Hero ── */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.avatar}>
            <i className="fa-solid fa-circle-user" />
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{user.nombre}</div>
            <div className={styles.userEmail}>{user.correo}</div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className={styles.tabs}>
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`}
              onClick={() => setTab(t.key)}
            >
              <i className={`${t.icon}`} style={{ marginRight: '6px' }} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className={styles.body}>
        <div className={styles.content}>
          {loading ? (
            <EmptyState icon="fa-solid fa-spinner fa-spin" texto="Cargando información..." />
          ) : (
            <>
              {/* RESUMEN */}
              {tab === 'resumen' && (
                <>
                  <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                      <span className={styles.statNum}>{data.compras.length}</span>
                      <span className={styles.statLabel}>Compras realizadas</span>
                    </div>
                    <div className={styles.statCard}>
                      <span className={styles.statNum}>{data.servicios.filter(s => s.estado === 'activo').length}</span>
                      <span className={styles.statLabel}>Servicios activos</span>
                    </div>
                    <div className={styles.statCard}>
                      <span className={styles.statNum}>
                        {data.suscripciones.find(s => s.estado === 'activa') ? '✓' : '—'}
                      </span>
                      <span className={styles.statLabel}>Suscripción vigente</span>
                    </div>
                  </div>

                  <p className={styles.sectionTitle}>Actividad reciente</p>
                  <div className={styles.tableWrap}>
                    {data.compras.length === 0 && data.servicios.length === 0 ? (
                      <EmptyState icon="fa-solid fa-inbox" texto="Aún no tienes actividad registrada" />
                    ) : (
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>Tipo</th>
                            <th>Descripción</th>
                            <th>Estado</th>
                            <th>Fecha</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.compras.slice(0, 3).map((c) => (
                            <tr key={`c-${c.id}`}>
                              <td data-label="Tipo"><i className="fa-solid fa-bag-shopping" style={{ color: 'var(--azul-boton)', marginRight: 6 }} />Compra</td>
                              <td data-label="Descripción">
                                {c.producto}
                                {c.opciones && (
                                  <span className={styles.chipOpcion} style={{ marginLeft: 8 }}>
                                    {c.opciones}
                                  </span>
                                )}
                              </td>
                              <td data-label="Estado"><BadgeEstado estado={c.estado} /></td>
                              <td data-label="Fecha">{formatFecha(c.fecha)}</td>
                            </tr>
                          ))}
                          {data.servicios.slice(0, 3).map((s) => (
                            <tr key={`s-${s.id}`}>
                              <td data-label="Tipo"><i className="fa-solid fa-helmet-safety" style={{ color: 'var(--dorado)', marginRight: 6 }} />Servicio</td>
                              <td data-label="Descripción">{s.tipo}</td>
                              <td data-label="Estado"><BadgeEstado estado={s.estado} /></td>
                              <td data-label="Fecha">{formatFecha(s.fecha)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </>
              )}

              {/* COMPRAS */}
              {tab === 'compras' && (
                <>
                  <p className={styles.sectionTitle}>Mis compras</p>
                  <div className={styles.tableWrap}>
                    {data.compras.length === 0 ? (
                      <EmptyState icon="fa-solid fa-bag-shopping" texto="Aún no tienes compras registradas" />
                    ) : (
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Producto</th>
                            <th>Opciones</th>
                            <th>Cantidad</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th>Fecha</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.compras.map((c) => (
                            <tr key={c.id}>
                              <td data-label="#">{c.id}</td>
                              <td data-label="Producto">{c.producto}</td>
                              <td data-label="Opciones">
                                {c.opciones ? (
                                  <span className={styles.chipOpcion}>{c.opciones}</span>
                                ) : (
                                  <span style={{ color: 'rgba(0,0,0,0.35)' }}>—</span>
                                )}
                              </td>
                              <td data-label="Cantidad">{c.cantidad}</td>
                              <td data-label="Total">{formatMoneda(c.total)}</td>
                              <td data-label="Estado"><BadgeEstado estado={c.estado} /></td>
                              <td data-label="Fecha">{formatFecha(c.fecha)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </>
              )}

              {/* SERVICIOS */}
              {tab === 'servicios' && (
                <>
                  <p className={styles.sectionTitle}>Mis servicios</p>
                  <div className={styles.tableWrap}>
                    {data.servicios.length === 0 ? (
                      <EmptyState icon="fa-solid fa-helmet-safety" texto="Aún no tienes servicios contratados" />
                    ) : (
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Tipo</th>
                            <th>Descripción</th>
                            <th>Estado</th>
                            <th>Fecha</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.servicios.map((s) => (
                            <tr key={s.id}>
                              <td data-label="#">{s.id}</td>
                              <td data-label="Tipo">{s.tipo}</td>
                              <td data-label="Descripción">{s.descripcion}</td>
                              <td data-label="Estado"><BadgeEstado estado={s.estado} /></td>
                              <td data-label="Fecha">{formatFecha(s.fecha)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </>
              )}

              {/* SUSCRIPCIONES */}
              {tab === 'suscripciones' && (
                <>
                  <p className={styles.sectionTitle}>Mis suscripciones</p>
                  <div className={styles.tableWrap}>
                    {data.suscripciones.length === 0 ? (
                      <EmptyState icon="fa-solid fa-star" texto="Aún no tienes suscripciones activas" />
                    ) : (
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Plan</th>
                            <th>Estado</th>
                            <th>Inicio</th>
                            <th>Vencimiento</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.suscripciones.map((s) => (
                            <tr key={s.id}>
                              <td data-label="#">{s.id}</td>
                              <td data-label="Plan">{s.plan}</td>
                              <td data-label="Estado"><BadgeEstado estado={s.estado} /></td>
                              <td data-label="Inicio">{formatFecha(s.fecha_inicio)}</td>
                              <td data-label="Vencimiento">{formatFecha(s.fecha_fin)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
