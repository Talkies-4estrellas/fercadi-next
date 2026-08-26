'use client';

import { useRef } from 'react';
import styles from '@/styles/admin.module.css';

interface Props {
  /** Callback con el archivo seleccionado — el upload ocurre al guardar */
  onFile: (file: File) => void;
}

export default function ImageUploader({ onFile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onFile(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <label
      className={styles.btnSecondary}
      style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
    >
      <i className="fa-solid fa-cloud-arrow-up" aria-hidden="true" /> Subir imagen
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
        style={{ display: 'none' }}
        onChange={handleChange}
      />
    </label>
  );
}
