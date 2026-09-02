'use client';

import { useRef, useState } from 'react';
import styles from '@/styles/admin.module.css';

interface Props {
  onFile: (file: File) => void;
}

const ACCEPT = ['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/gif'];

export default function ImageUploader({ onFile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arrastrando, setArrastrando] = useState(false);

  const procesar = (file: File | undefined) => {
    if (!file || !ACCEPT.includes(file.type)) return;
    onFile(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    procesar(e.target.files?.[0]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setArrastrando(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setArrastrando(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setArrastrando(false);
    procesar(e.dataTransfer.files?.[0]);
  };

  return (
    <label
      className={`${styles.dropZone} ${arrastrando ? styles.dropZoneActivo : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <i
        className={`fa-solid ${arrastrando ? 'fa-circle-arrow-down' : 'fa-cloud-arrow-up'} ${styles.dropZoneIcon}`}
        aria-hidden="true"
      />
      <p className={styles.dropZoneTexto}>
        <strong>Arrastra una imagen aquí</strong><br />
        o haz clic para seleccionar<br />
        <span style={{ fontSize: '0.72rem', opacity: 0.7 }}>PNG · JPG · WebP · AVIF · GIF → se convierte a WebP</span>
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT.join(',')}
        style={{ display: 'none' }}
        onChange={handleChange}
      />
    </label>
  );
}
