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
  const [mensaje,   setMensaje]   = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  // Modal de confirmación de cambio de rol
  const [modal, setModal] = useState<{ abierto: boolean; usuario: Usuario | null; nuevoRol: 'admin' | 'usuario' }>({
    abierto: false, usuario: null, nuevoRol: 'usuario',
  });

  const mostrarMensaje = (tipo: 'ok' | 'error', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 3500);
  };

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

  const abrirModal = (u: Usuario) => {
    const nuevoRol = u.rol === 'admin' ? 'usuario' : 'admin';
    setModal({ abierto: true, usuario: u, nuevoRol });
  };

  const confirmarCambioRol = async () => {
    if (!user || !modal.usuario) return;
    setModal((m) => ({ ...m, abierto: false }));

    const res = await fetch(`/api/admin/usuarios/${modal.usuario.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-usuario-id': String(user.id) },
      body: JSON.stringify({ rol: modal.nuevoRol }),
    });
    const d = await res.json();
    if (d.ok) {
      setUsuarios((prev) =>
        prev.map((u) => u.id === d.usuario.id ? { ...u, rol: d.usuario.rol } : u)
      );
      mostrarMensaje('ok', `Rol de "${d.usuario.nombre}" cambiado a ${d.usuario.rol}.`);
    } else {
      mostrarMensaje('error', d.message ?? 'Error al cambiar rol');
    }
  };

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

      {mensaje && (
        <div
          className={mensaje.tipo === 'ok' ? styles.mensajeOk : styles.mensajeError}
          style={{ marginBottom: 20 }}
        >
          <i className={`fa-solid ${mensaje.tipo === 'ok' ? 'fa-circle-check' : 'fa-triangle-exclamation'}`} aria-hidden="true" />
          {' '}{mensaje.texto}
        </div>
      )}

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
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => {
                  const esMismoCuenta = u.id === user?.id;
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
                      <td className={styles.accionesCol}>
                        <button
                          className={styles.btnIcono}
                          onClick={() => abrirModal(u)}
                          disabled={esMismoCuenta}
                          title={esMismoCuenta ? 'No puedes modificar tu propia cuenta' : `Cambiar a ${u.rol === 'admin' ? 'usuario' : 'admin'}`}
                        >
                          <i className={`fa-solid ${u.rol === 'admin' ? 'fa-user-minus' : 'fa-user-shield'}`} aria-hidden="true" />
                        </button>
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

      {/* Modal confirmación cambio de rol */}
      {modal.abierto && modal.usuario && (
        <div className={styles.modalOverlay} onClick={() => setModal((m) => ({ ...m, abierto: false }))}>
          <div className={styles.modal} style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>
                <i className="fa-solid fa-user-shield" style={{ marginRight: 8, color: 'var(--dorado)' }} aria-hidden="true" />
                Cambiar rol
              </h3>
              <button className={styles.modalClose} onClick={() => setModal((m) => ({ ...m, abierto: false }))}>
                <i className="fa-solid fa-xmark" aria-hidden="true" />
              </button>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <p style={{ color: '#334', marginBottom: 12 }}>
                ¿Cambiar el rol de <strong>{modal.usuario.nombre}</strong> de{' '}
                <strong>{modal.usuario.rol}</strong> a <strong>{modal.nuevoRol}</strong>?
              </p>
              {modal.nuevoRol === 'admin' && (
                <p style={{ fontSize: '0.84rem', color: '#b45309', background: '#fef3c7', borderRadius: 8, padding: '8px 12px' }}>
                  <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" style={{ marginRight: 6 }} />
                  Este usuario tendrá acceso completo al panel de administración.
                </p>
              )}
            </div>
            <div style={{ padding: '0 24px 24px', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className={styles.btnSecondary} onClick={() => setModal((m) => ({ ...m, abierto: false }))}>
                Cancelar
              </button>
              <button className={styles.btnPrimary} onClick={confirmarCambioRol}>
                <i className="fa-solid fa-check" aria-hidden="true" /> Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
