'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import styles from '@/styles/chat.module.css';

interface Mensaje {
  id: number;
  remitente: 'usuario' | 'admin';
  texto: string;
  leido: boolean;
  creado_en: string;
}

interface Props {
  productoId: number;
  productoNombre: string;
}

function formatHora(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
}

const POLL_MS = 4000;
const MAX_CHARS = 1000;

export default function ChatProducto({ productoId, productoNombre }: Props) {
  const { user } = useAuth();
  const [abierto, setAbierto] = useState(false);
  const [convId, setConvId] = useState<number | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollAbajo = () => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

  /* ── Obtener/crear conversación ── */
  const iniciarConv = useCallback(async () => {
    if (!user || convId) return;
    setCargando(true);
    try {
      const res = await fetch(`/api/chat?producto_id=${productoId}`, {
        headers: { 'x-usuario-id': String(user.id) },
      });
      const d = await res.json();
      if (d.ok) setConvId(d.conversacion_id);
    } finally {
      setCargando(false);
    }
  }, [user, productoId, convId]);

  /* ── Cargar mensajes ── */
  const cargarMensajes = useCallback(async (id: number) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/chat/${id}`, {
        headers: { 'x-usuario-id': String(user.id) },
      });
      const d = await res.json();
      if (d.ok) {
        setMensajes((prev) => {
          const mismoContenido = JSON.stringify(prev) === JSON.stringify(d.mensajes);
          if (mismoContenido) return prev;
          scrollAbajo();
          return d.mensajes;
        });
      }
    } catch { /* silencio */ }
  }, [user]);

  /* ── Polling mientras el chat está abierto ── */
  useEffect(() => {
    if (abierto && convId) {
      cargarMensajes(convId);
      pollRef.current = setInterval(() => cargarMensajes(convId), POLL_MS);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [abierto, convId, cargarMensajes]);

  /* ── Abrir chat ── */
  const abrir = async () => {
    setAbierto(true);
    await iniciarConv();
  };

  useEffect(() => {
    if (convId && abierto) cargarMensajes(convId);
  }, [convId, abierto, cargarMensajes]);

  /* ── Enviar mensaje ── */
  const enviar = async () => {
    if (!user || !convId || !texto.trim() || enviando) return;
    setError('');
    setEnviando(true);
    try {
      const res = await fetch(`/api/chat/${convId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-usuario-id': String(user.id) },
        body: JSON.stringify({ texto }),
      });
      const d = await res.json();
      if (d.ok) {
        setTexto('');
        await cargarMensajes(convId);
      } else {
        setError(d.error ?? 'No se pudo enviar.');
      }
    } catch {
      setError('Error de conexión.');
    } finally {
      setEnviando(false);
    }
  };

  /* ── Sin usuario ── */
  if (!user) {
    return (
      <div className={styles.loginReq}>
        <i className="fa-regular fa-comment-dots" aria-hidden="true" />
        <span>
          <Link href="/login">Inicia sesión</Link> para enviar un mensaje al administrador sobre este producto.
        </span>
      </div>
    );
  }

  /* ── Botón para abrir ── */
  if (!abierto) {
    return (
      <button className={styles.btnAbrir} onClick={abrir}>
        <i className="fa-solid fa-comment-dots" />
        Enviar mensaje al administrador
      </button>
    );
  }

  /* ── Panel de chat ── */
  return (
    <div className={styles.panel}>
      {/* Cabecera */}
      <div className={styles.panelHead}>
        <span>
          <i className="fa-solid fa-headset" style={{ marginRight: 8 }} />
          Chat sobre <strong>{productoNombre}</strong>
        </span>
        <button className={styles.btnCerrar} onClick={() => setAbierto(false)}>
          <i className="fa-solid fa-xmark" />
        </button>
      </div>

      {/* Mensajes */}
      <div className={styles.mensajes}>
        {cargando ? (
          <p className={styles.hint}><i className="fa-solid fa-spinner fa-spin" /> Iniciando conversación…</p>
        ) : mensajes.length === 0 ? (
          <p className={styles.hint}>Escribe tu pregunta y el equipo de FERCADI te responderá pronto.</p>
        ) : (
          mensajes.map((m) => (
            <div key={m.id} className={`${styles.burbuja} ${m.remitente === 'usuario' ? styles.burbujaUsuario : styles.burbujaAdmin}`}>
              <p className={styles.burbujaTexto}>{m.texto}</p>
              <span className={styles.burbujaHora}>{formatHora(m.creado_en)}</span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className={styles.inputRow}>
        <textarea
          className={styles.textarea}
          placeholder="Escribe tu mensaje…"
          value={texto}
          rows={2}
          maxLength={MAX_CHARS}
          onChange={(e) => { setTexto(e.target.value); setError(''); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(); }
          }}
        />
        <button
          className={styles.btnEnviar}
          onClick={enviar}
          disabled={enviando || !texto.trim() || !convId}
          title="Enviar (Enter)"
        >
          {enviando
            ? <i className="fa-solid fa-spinner fa-spin" />
            : <i className="fa-solid fa-paper-plane" />
          }
        </button>
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <p className={styles.charCount}>{texto.length} / {MAX_CHARS}</p>
    </div>
  );
}
