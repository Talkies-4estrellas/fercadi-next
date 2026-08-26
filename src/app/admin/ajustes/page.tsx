'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { navItems } from '@/data/navigation';
import styles from '@/styles/admin.module.css';
import ajustesStyles from '@/styles/ajustes.module.css';

type NavConfig = Record<string, boolean>;

export default function AjustesPage() {
  const { user } = useAuth();
  const [config, setConfig] = useState<NavConfig>({});
  const [pendiente, setPendiente] = useState<NavConfig>({});
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  useEffect(() => {
    fetch('/api/nav-config')
      .then((r) => r.json())
      .then((data) => {
        const cfg: NavConfig = {};
        navItems.forEach((item) => {
          cfg[item.href] = data.config?.[item.href] !== false;
        });
        setConfig(cfg);
        setPendiente(cfg);
      })
      .catch(() => {
        const cfg: NavConfig = {};
        navItems.forEach((item) => { cfg[item.href] = true; });
        setConfig(cfg);
        setPendiente(cfg);
      })
      .finally(() => setCargando(false));
  }, []);

  const toggle = (href: string) => {
    setPendiente((prev) => ({ ...prev, [href]: !prev[href] }));
  };

  const hayCambios = JSON.stringify(pendiente) !== JSON.stringify(config);

  const confirmar = async () => {
    if (!user) return;
    setGuardando(true);
    try {
      const res = await fetch('/api/admin/nav-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-usuario-id': String(user.id),
        },
        body: JSON.stringify({ config: pendiente }),
      });
      const data = await res.json();
      if (data.ok) {
        setConfig(pendiente);
        setMensaje({ tipo: 'ok', texto: 'Cambios guardados. El navbar se actualiza en el próximo acceso.' });
      } else {
        setMensaje({ tipo: 'error', texto: data.message ?? 'Error al guardar' });
      }
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error de red' });
    } finally {
      setGuardando(false);
      setModalAbierto(false);
    }
  };

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>
            <i className="fa-solid fa-gear" style={{ marginRight: 10 }} />
            Ajustes
          </h1>
          <p className={styles.pageSubtitle}>Controla qué secciones son visibles en la navegación pública del sitio.</p>
        </div>
      </div>

      {mensaje && (
        <div className={mensaje.tipo === 'ok' ? styles.mensajeOk : styles.mensajeError}
          style={{ marginBottom: 24 }}>
          <i className={`fa-solid ${mensaje.tipo === 'ok' ? 'fa-circle-check' : 'fa-triangle-exclamation'}`} />
          {' '}{mensaje.texto}
        </div>
      )}

      {cargando ? (
        <p className={styles.loadingText}><i className="fa-solid fa-spinner fa-spin" /> Cargando…</p>
      ) : (
        <div className={ajustesStyles.card}>
          <h2 className={ajustesStyles.seccionTitulo}>
            <i className="fa-solid fa-bars" /> Elementos del navbar
          </h2>
          <p className={ajustesStyles.seccionDesc}>
            Los ítems desactivados se ocultan del menú de navegación para todos los visitantes.
          </p>

          <div className={ajustesStyles.lista}>
            {navItems.map((item) => (
              <div key={item.href} className={ajustesStyles.fila}>
                <div className={ajustesStyles.filaInfo}>
                  <span className={ajustesStyles.filaLabel}>{item.label}</span>
                  <span className={ajustesStyles.filaHref}>{item.href}</span>
                </div>
                <button
                  type="button"
                  onClick={() => toggle(item.href)}
                  className={`${ajustesStyles.toggle} ${pendiente[item.href] ? ajustesStyles.toggleOn : ajustesStyles.toggleOff}`}
                  aria-checked={pendiente[item.href]}
                  role="switch"
                  aria-label={`${pendiente[item.href] ? 'Desactivar' : 'Activar'} ${item.label}`}
                >
                  <span className={ajustesStyles.toggleThumb} />
                </button>
              </div>
            ))}
          </div>

          <div className={ajustesStyles.acciones}>
            {hayCambios && (
              <span className={ajustesStyles.cambiosBadge}>
                <i className="fa-solid fa-circle-dot" /> Hay cambios sin guardar
              </span>
            )}
            <button
              type="button"
              className={styles.btnPrimary}
              disabled={!hayCambios}
              onClick={() => setModalAbierto(true)}
            >
              <i className="fa-solid fa-floppy-disk" /> Guardar cambios
            </button>
          </div>
        </div>
      )}

      {modalAbierto && (
        <div className={styles.modalOverlay} onClick={() => !guardando && setModalAbierto(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3><i className="fa-solid fa-triangle-exclamation" style={{ color: 'var(--dorado)', marginRight: 8 }} />Confirmar cambios</h3>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setModalAbierto(false)}
                disabled={guardando}
                aria-label="Cerrar"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div style={{ padding: '16px 20px 4px' }}>
              <p style={{ marginBottom: 16, color: '#334' }}>
                Los siguientes cambios se aplicarán al navbar público del sitio:
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {navItems
                  .filter((item) => pendiente[item.href] !== config[item.href])
                  .map((item) => (
                    <li key={item.href} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem' }}>
                      <i
                        className={`fa-solid ${pendiente[item.href] ? 'fa-eye' : 'fa-eye-slash'}`}
                        style={{ color: pendiente[item.href] ? '#1a8a3f' : '#c0392b', width: 16 }}
                      />
                      <strong>{item.label}</strong>
                      <span style={{ color: '#777' }}>→ {pendiente[item.href] ? 'Visible' : 'Oculto'}</span>
                    </li>
                  ))}
              </ul>
            </div>

            <div className={styles.formActions} style={{ padding: '16px 20px 20px' }}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setModalAbierto(false)}
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={confirmar}
                disabled={guardando}
              >
                {guardando
                  ? <><i className="fa-solid fa-spinner fa-spin" /> Guardando…</>
                  : <><i className="fa-solid fa-check" /> Confirmar</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
