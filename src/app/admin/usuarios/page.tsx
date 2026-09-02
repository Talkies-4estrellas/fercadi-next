'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from '@/styles/admin.module.css';

interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: 'admin' | 'usuario';
  created_at: string;
  ciudad?: string | null;
  profesion?: string | null;
}

const LIMIT = 25;

export default function UsuariosPage() {
  const { user } = useAuth();

  const [usuarios,  setUsuarios]  = useState<Usuario[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [q,         setQ]         = useState('');
  const [qActivo,   setQActivo]   = useState('');
  const [rolFiltro, setRolFiltro] = useState('');
  const [page,      setPage]      = useState(1);
  const [total,     setTotal]     = useState(0);
  const [pages,     setPages]     = useState(1);
  const cargar = useCallback((p: number, busq: string, rol: string) => {
    if (!user) return;
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), limit: String(LIMIT) });
    if (busq) params.set('q', busq);
    if (rol)  params.set('rol', rol);

    fetch(`/api/admin/usuarios?${params}`, { headers: { 'x-usuario-id': String(user.id) } })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) { setUsuarios(d.usuarios); setTotal(d.total); setPages(d.pages); }
        else { setUsuarios([]); setTotal(0); setPages(1); }
      })
      .catch(() => { setUsuarios([]); setTotal(0); setPages(1); })
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => { cargar(page, qActivo, rolFiltro); }, [cargar, page, qActivo, rolFiltro]);

  const handleBuscar = () => { setQActivo(q); setPage(1); };

  const inicio = total === 0 ? 0 : (page - 1) * LIMIT + 1;
  const fin    = Math.min(page * LIMIT, total);

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>
            <i className="fa-solid fa-users" style={{ marginRight: 10 }} aria-hidden="true" />
            Usuarios
          </h1>
          <p className={styles.pageSubtitle}>Gestiona los roles y accesos de los usuarios registrados.</p>
        </div>
      </div>

      {/* Filtros */}
      <div className={styles.filtros}>
        <select
          value={rolFiltro}
          onChange={(e) => { setRolFiltro(e.target.value); setPage(1); }}
          className={styles.filtroSelect}
        >
          <option value="">Todos los roles</option>
          <option value="admin">Administradores</option>
          <option value="usuario">Usuarios</option>
        </select>

        <div className={styles.filtroBuscar}>
          <input
            type="text"
            placeholder="Buscar por nombre o correo…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleBuscar(); }}
            className={styles.filtroInput}
          />
          <button onClick={handleBuscar} className={styles.btnSecondary}>
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
          </button>
        </div>

        {!loading && total > 0 && (
          <span className={styles.totalChip}>{total.toLocaleString('es-MX')} usuarios</span>
        )}
      </div>

      {/* Tabla */}
      {loading ? (
        <p className={styles.loadingText}>
          <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Cargando…
        </p>
      ) : usuarios.length === 0 ? (
        <p className={styles.emptyText}>
          <i className="fa-solid fa-inbox" aria-hidden="true" /> Sin usuarios con los filtros actuales.
        </p>
      ) : (
        <>
          <div className={styles.tablaWrap}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Ciudad / Profesión</th>
                  <th>Registro</th>
                  <th>Rol</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => {
                  return (
                    <tr key={u.id}>
                      <td style={{ opacity: 0.45, fontSize: '0.8rem' }}>{u.id}</td>
                      <td>
                        <div className={styles.productoNombre}>{u.nombre}</div>
                      </td>
                      <td style={{ fontSize: '0.84rem', color: 'var(--azul-profundo)', opacity: 0.8 }}>
                        {u.correo}
                      </td>
                      <td style={{ fontSize: '0.8rem', opacity: 0.65 }}>
                        {[u.ciudad, u.profesion].filter(Boolean).join(' · ') || '—'}
                      </td>
                      <td style={{ fontSize: '0.8rem', opacity: 0.65 }}>
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('es-MX') : '—'}
                      </td>
                      <td>
                        <span
                          className={`${styles.estadoBadge} ${u.rol === 'admin' ? styles.estadoActivo : ''}`}
                          style={u.rol !== 'admin' ? { background: 'rgba(1,27,79,0.08)', color: 'var(--azul-profundo)' } : {}}
                        >
                          {u.rol === 'admin' ? 'Admin' : 'Usuario'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Paginador */}
          {pages > 1 && (
            <div className={styles.paginador}>
              <span className={styles.paginadorInfo}>
                {inicio}–{fin} de {total.toLocaleString('es-MX')}
              </span>
              <div className={styles.paginadorBtns}>
                <button className={styles.btnSecondary} disabled={page === 1} onClick={() => setPage(1)} title="Primera">
                  <i className="fa-solid fa-angles-left" aria-hidden="true" />
                </button>
                <button className={styles.btnSecondary} disabled={page === 1} onClick={() => setPage((p) => p - 1)} title="Anterior">
                  <i className="fa-solid fa-angle-left" aria-hidden="true" />
                </button>
                <span className={styles.paginadorPagina}>Pág. {page} / {pages}</span>
                <button className={styles.btnSecondary} disabled={page === pages} onClick={() => setPage((p) => p + 1)} title="Siguiente">
                  <i className="fa-solid fa-angle-right" aria-hidden="true" />
                </button>
                <button className={styles.btnSecondary} disabled={page === pages} onClick={() => setPage(pages)} title="Última">
                  <i className="fa-solid fa-angles-right" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

    </>
  );
}
