'use client';

import { useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from '@/styles/admin.module.css';

interface Props {
  /** Carpeta dentro del bucket donde se guardará, ej. "productos", "tips", "home" */
  carpeta: string;
  /** Callback con la URL pública una vez subida */
  onUrl: (url: string) => void;
}

export default function ImageUploader({ carpeta, onUrl }: Props) {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setSubiendo(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('path', `${carpeta}/${file.name.toLowerCase().replace(/\s+/g, '-')}`);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'x-usuario-id': String(user.id) },
        body: fd,
      });
      const data = await res.json();
      if (data.ok) {
        onUrl(data.url);
      } else {
        setError(data.error ?? 'Error al subir imagen');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubiendo(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <span>
      <label
        className={styles.btnSecondary}
        style={{ cursor: subiendo ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
      >
        {subiendo
          ? <><i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Subiendo…</>
          : <><i className="fa-solid fa-cloud-arrow-up" aria-hidden="true" /> Subir imagen</>
        }
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
          style={{ display: 'none' }}
          onChange={handleChange}
          disabled={subiendo}
        />
      </label>
      {error && (
        <span style={{ color: '#c00', fontSize: '0.78rem', marginLeft: 8 }}>
          <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" /> {error}
        </span>
      )}
    </span>
  );
}
