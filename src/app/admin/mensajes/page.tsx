'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from '@/styles/admin.module.css';
import chatStyles from '@/styles/chat.module.css';

interface Conversacion {
  id: number;
  usuario_nombre: string;
  producto_nombre: string | null;
  actualizado_en: string;
  ultimo_mensaje: string | null;
  ultimo_remitente: 'usuario' | 'admin' | null;
  no_leidos: number;
}

interface Mensaje {
  id: number;
  remitente: 'usuario' | 'admin';
  texto: string;
  leido: boolean;
  creado_en: string;
}

function formatFecha(iso: string) {
  try {
    const d = new Date(iso);
    const hoy = new Date();
    if (d.toDateString() === hoy.toDateString()) {
      return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
  } catch { return ''; }
}

function formatHora(iso: string) {
  try { return new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }); }
  catch { return ''; }
}

const POLL_MS = 4000;

export default function AdminMensajesPage() {
  const { user } = useAuth();

  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [activa,         setActiva]         = useState<number | null>(null);
  const [mensajes,       setMensajes]       = useState<Mensaje[]>([]);
  const [texto,          setTexto]          = useState('');
  const [enviando,       setEnviando]       = useState(false);
  const [cargandoConvs,  setCargandoConvs]  = useState(true);
  const [vistaMovil,     setVistaMovil]     = useState<'lista' | 'chat'>('lista');
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollAbajo = () => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

  /* ── Lista de conversaciones ── */
  const cargarConvs = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/admin/mensajes', { headers: { 'x-usuario-id': String(user.id) } });
      const d = await res.json();
      if (d.ok) setConversaciones(d.conversaciones ?? []);
    } finally {
      setCargandoConvs(false);
    }
  }, [user]);

  useEffect(() => { cargarConvs(); }, [cargarConvs]);

  /* ── Mensajes de conversación activa ── */
  const cargarMensajes = useCallback(async (id: number) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/admin/mensajes/${id}`, { headers: { 'x-usuario-id': String(user.id) } });
      const d = await res.json();
      if (d.ok) {
        setMensajes((prev) => {
          const igual = JSON.stringify(prev) === JSON.stringify(d.mensajes);
          if (!igual) scrollAbajo();
          return igual ? prev : d.mensajes;
        });
        // Refrescar lista para actualizar badge no_leidos
        setConversaciones((prev) => prev.map((c) => c.id === id ? { ...c, no_leidos: 0 } : c));
      }
    } catch { /* silencio */ }
  }, [user]);

  /* ── Polling ── */
  useEffect(() => {
    if (activa) {
      cargarMensajes(activa);
      pollRef.current = setInterval(() => cargarMensajes(activa), POLL_MS);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activa, cargarMensajes]);

  const seleccionar = (id: number) => {
    setActiva(id);
    setMensajes([]);
    setTexto('');
  };

  const seleccionarConv = (id: number) => {
    seleccionar(id);
    setVistaMovil('chat');
  };

  /* ── Enviar respuesta ── */
  const enviar = async () => {
    if (!user || !activa || !texto.trim() || enviando) return;
    setEnviando(true);
    try {
      const res = await fetch(`/api/admin/mensajes/${activa}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-usuario-id': String(user.id) },
        body: JSON.stringify({ texto }),
      });
      const d = await res.json();
      if (d.ok) { setTexto(''); await cargarMensajes(activa); cargarConvs(); }
      else alert(d.error ?? 'Error al enviar.');
    } finally {
      setEnviando(false);
    }
  };

  const convActiva = conversaciones.find((c) => c.id === activa);
  const totalNoLeidos = conversaciones.reduce((s, c) => s + Number(c.no_leidos), 0);

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          {activa && vistaMovil === 'chat' ? (
            <button
              onClick={() => setVistaMovil('lista')}
              className={styles.btnLink}
              style={{ fontSize: '1rem', marginRight: 8 }}
            >
              <i className="fa-solid fa-arrow-left" />
            </button>
          ) : null}
          <i className="fa-solid fa-comments" /> Mensajes
          {totalNoLeidos > 0 && (
            <span style={{ marginLeft: 10, background: '#dc2626', color: 'white', borderRadius: 20, fontSize: '0.7rem', padding: '2px 10px', fontWeight: 700, verticalAlign: 'middle' }}>
              {totalNoLeidos} nuevo{totalNoLeidos > 1 ? 's' : ''}
            </span>
          )}
        </h1>
        <button className={styles.btnSecondary} onClick={cargarConvs} style={{ fontSize: '0.85rem' }}>
          <i className="fa-solid fa-rotate-right" /> Actualizar
        </button>
      </div>

      <div className={styles.mensajesGrid}>

        {/* ── Lista de conversaciones ── */}
        <div className={`${styles.tablaWrap} ${vistaMovil === 'chat' ? styles.mensajesListaOculta : ''}`} style={{ overflow: 'hidden' }}>
          {cargandoConvs ? (
            <p className={styles.emptyText}><i className="fa-solid fa-spinner fa-spin" /></p>
          ) : conversaciones.length === 0 ? (
            <p className={styles.emptyText}>Ningún cliente te ha escrito todavía.</p>
          ) : (
            conversaciones.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => seleccionarConv(c.id)}
                style={{
                  width: '100%', display: 'block', textAlign: 'left',
                  padding: '12px 16px', border: 'none', borderBottom: '1px solid #f3f4f6',
                  background: activa === c.id ? '#eff6ff' : 'transparent',
                  cursor: 'pointer', transition: 'background 0.15s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
                    {c.usuario_nombre}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af', flexShrink: 0, marginLeft: 8 }}>
                    {formatFecha(c.actualizado_en)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 3 }}>
                  <span style={{ fontSize: '0.78rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                    {c.producto_nombre ?? 'Sin producto'}
                  </span>
                  {Number(c.no_leidos) > 0 && (
                    <span style={{ background: '#dc2626', color: 'white', borderRadius: 20, fontSize: '0.7rem', padding: '1px 7px', fontWeight: 700, flexShrink: 0, marginLeft: 6 }}>
                      {c.no_leidos}
                    </span>
                  )}
                </div>
                {c.ultimo_mensaje && (
                  <p style={{ margin: '4px 0 0', fontSize: '0.77rem', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.ultimo_remitente === 'admin' ? 'Tú: ' : ''}{c.ultimo_mensaje}
                  </p>
                )}
              </button>
            ))
          )}
        </div>

        {/* ── Chat ── */}
        <div className={vistaMovil === 'lista' ? styles.mensajesChatOculto : ''}>
          {!activa ? (
            <div className={styles.tablaWrap} style={{ padding: 40, textAlign: 'center' }}>
              <i className="fa-regular fa-comment-dots" style={{ fontSize: '2.5rem', opacity: 0.2, display: 'block', marginBottom: 12 }} />
              <p className={styles.emptyText}>Selecciona una conversación.</p>
            </div>
          ) : (
            <div className={chatStyles.panel} style={{ margin: 0 }}>
              {/* Cabecera */}
              <div className={chatStyles.panelHead}>
                <span>
                  <i className="fa-solid fa-user" style={{ marginRight: 8 }} />
                  <strong>{convActiva?.usuario_nombre}</strong>
                  {convActiva?.producto_nombre && (
                    <span style={{ opacity: 0.7, fontWeight: 400 }}> · {convActiva.producto_nombre}</span>
                  )}
                </span>
              </div>

              {/* Mensajes */}
              <div className={chatStyles.mensajes}>
                {mensajes.length === 0 ? (
                  <p className={chatStyles.hint}><i className="fa-solid fa-spinner fa-spin" /> Cargando mensajes…</p>
                ) : (
                  mensajes.map((m) => (
                    <div key={m.id} className={`${chatStyles.burbuja} ${m.remitente === 'admin' ? chatStyles.burbujaUsuario : chatStyles.burbujaAdmin}`}>
                      <p className={chatStyles.burbujaTexto}>{m.texto}</p>
                      <span className={chatStyles.burbujaHora}>{formatHora(m.creado_en)}</span>
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className={chatStyles.inputRow}>
                <textarea
                  className={chatStyles.textarea}
                  placeholder="Escribe tu respuesta… (Enter para enviar)"
                  value={texto}
                  rows={2}
                  maxLength={1000}
                  onChange={(e) => setTexto(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(); } }}
                />
                <button
                  className={chatStyles.btnEnviar}
                  onClick={enviar}
                  disabled={enviando || !texto.trim()}
                  title="Enviar (Enter)"
                >
                  {enviando
                    ? <i className="fa-solid fa-spinner fa-spin" />
                    : <i className="fa-solid fa-paper-plane" />
                  }
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
