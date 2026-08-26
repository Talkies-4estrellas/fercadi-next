'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import ImageUploader from '@/components/admin/ImageUploader';
import styles from '@/styles/admin.module.css';
import sh from '@/styles/adminHome.module.css';

interface HomeCard {
  id: number;
  posicion: number;
  titulo: string;
  descripcion: string;
  btn_texto: string;
  btn_href: string;
}

interface CarouselSlide {
  id: number;
  orden: number;
  imagen_url: string;
  alt: string;
  titulo: string;
  descripcion: string;
  slogan: string;
  activo: number;
}

const SLIDE_VACIO: Omit<CarouselSlide, 'id'> = {
  orden: 99, imagen_url: '', alt: '', titulo: '', descripcion: '', slogan: '', activo: 1,
};

export default function AdminHomePage() {
  const { user } = useAuth();

  // ── Tarjetas ─────────────────────────────────────────────
  const [cards, setCards]       = useState<HomeCard[]>([]);
  const [cardsSaving, setCardsSaving] = useState(false);
  const [cardsMsg, setCardsMsg] = useState('');

  // ── Carrusel ─────────────────────────────────────────────
  const [slides, setSlides]         = useState<CarouselSlide[]>([]);
  const [editSlide, setEditSlide]   = useState<CarouselSlide | null>(null);
  const [nuevoSlide, setNuevoSlide] = useState<Omit<CarouselSlide,'id'>>(SLIDE_VACIO);
  const [slideMsg, setSlideMsg]     = useState('');
  const [slideSaving, setSlideSaving] = useState(false);
  const [showForm, setShowForm]     = useState(false);

  const uid = user?.id;

  // ── Carga inicial ─────────────────────────────────────────
  useEffect(() => {
    if (!uid) return;
    fetch('/api/admin/home/cards', { headers: { 'x-usuario-id': String(uid) } })
      .then(r => r.json()).then(d => { if (d.ok) setCards(d.cards); });
    fetchSlides();
  }, [uid]);

  function fetchSlides() {
    if (!uid) return;
    fetch('/api/admin/home/carousel', { headers: { 'x-usuario-id': String(uid) } })
      .then(r => r.json()).then(d => { if (d.ok) setSlides(d.slides); });
  }

  // ── Guardar tarjetas ──────────────────────────────────────
  async function guardarCards() {
    setCardsSaving(true); setCardsMsg('');
    const res = await fetch('/api/admin/home/cards', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-usuario-id': String(uid) },
      body: JSON.stringify({ cards }),
    });
    const d = await res.json();
    setCardsMsg(d.ok ? '✅ Tarjetas guardadas' : `❌ ${d.message}`);
    setCardsSaving(false);
    setTimeout(() => setCardsMsg(''), 3000);
  }

  function updateCard(posicion: number, field: keyof HomeCard, val: string) {
    setCards(prev => prev.map(c => c.posicion === posicion ? { ...c, [field]: val } : c));
  }

  // ── Guardar / actualizar slide ────────────────────────────
  async function guardarSlide() {
    setSlideSaving(true); setSlideMsg('');
    const isEdit = !!editSlide;
    const url  = isEdit ? `/api/admin/home/carousel/${editSlide!.id}` : '/api/admin/home/carousel';
    const body = isEdit ? editSlide : nuevoSlide;

    const res = await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json', 'x-usuario-id': String(uid) },
      body: JSON.stringify(body),
    });
    const d = await res.json();
    if (d.ok) {
      setSlideMsg('✅ Guardado');
      fetchSlides();
      setEditSlide(null);
      setNuevoSlide(SLIDE_VACIO);
      setShowForm(false);
    } else {
      setSlideMsg(`❌ ${d.message}`);
    }
    setSlideSaving(false);
    setTimeout(() => setSlideMsg(''), 3000);
  }

  async function eliminarSlide(id: number) {
    if (!confirm('¿Eliminar este slide del carrusel?')) return;
    await fetch(`/api/admin/home/carousel/${id}`, {
      method: 'DELETE',
      headers: { 'x-usuario-id': String(uid) },
    });
    fetchSlides();
  }

  async function toggleSlide(slide: CarouselSlide) {
    await fetch(`/api/admin/home/carousel/${slide.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-usuario-id': String(uid) },
      body: JSON.stringify({ ...slide, activo: slide.activo === 1 ? 0 : 1 }),
    });
    fetchSlides();
  }

  const currentSlide = editSlide ?? nuevoSlide;
  const setCurrentSlide = editSlide
    ? (val: Partial<CarouselSlide>) => setEditSlide(prev => ({ ...prev!, ...val }))
    : (val: Partial<Omit<CarouselSlide,'id'>>) => setNuevoSlide(prev => ({ ...prev, ...val }));

  return (
    <div className={styles.adminContent}>
      <h1 className={styles.adminTitle}>Gestión del Inicio</h1>

      {/* ── TARJETAS ── */}
      <section className={sh.section}>
        <div className={sh.sectionHeader}>
          <h2 className={sh.sectionTitle}>
            <i className="fa-solid fa-rectangle-list" /> Tarjetas del inicio
          </h2>
          <span className={sh.sectionBadge}>4 fijas</span>
        </div>
        <p className={sh.sectionDesc}>
          Estas 4 tarjetas aparecen flanqueando el carrusel en la página principal.
          Las posiciones 1–2 van a la izquierda y 3–4 a la derecha.
        </p>

        <div className={sh.cardsGrid}>
          {cards.map(card => (
            <div key={card.posicion} className={sh.cardEditor}>
              <div className={sh.cardPos}>Posición {card.posicion}</div>

              <label className={sh.label}>Título</label>
              <input
                className={sh.input}
                value={card.titulo}
                onChange={e => updateCard(card.posicion, 'titulo', e.target.value)}
              />

              <label className={sh.label}>Descripción</label>
              <textarea
                className={sh.textarea}
                rows={3}
                value={card.descripcion}
                onChange={e => updateCard(card.posicion, 'descripcion', e.target.value)}
              />

              <div className={sh.btnRow}>
                <div className={sh.btnField}>
                  <label className={sh.label}>Texto del botón</label>
                  <input
                    className={sh.input}
                    value={card.btn_texto}
                    onChange={e => updateCard(card.posicion, 'btn_texto', e.target.value)}
                  />
                </div>
                <div className={sh.btnField}>
                  <label className={sh.label}>Enlace (href)</label>
                  <input
                    className={sh.input}
                    value={card.btn_href}
                    onChange={e => updateCard(card.posicion, 'btn_href', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={sh.saveRow}>
          {cardsMsg && <span className={sh.msg}>{cardsMsg}</span>}
          <button className={sh.btnGuardar} onClick={guardarCards} disabled={cardsSaving}>
            {cardsSaving ? 'Guardando...' : 'Guardar tarjetas'}
          </button>
        </div>
      </section>

      {/* ── CARRUSEL ── */}
      <section className={sh.section}>
        <div className={sh.sectionHeader}>
          <h2 className={sh.sectionTitle}>
            <i className="fa-solid fa-images" /> Carrusel
          </h2>
          <button
            className={sh.btnNuevo}
            onClick={() => { setEditSlide(null); setNuevoSlide(SLIDE_VACIO); setShowForm(v => !v); }}
          >
            <i className="fa-solid fa-plus" /> Nuevo slide
          </button>
        </div>
        <p className={sh.sectionDesc}>
          Las imágenes deben estar en <code>/public/images/</code> o ser URLs externas.
          El número de orden determina la secuencia de aparición.
        </p>

        {/* Formulario nuevo / editar */}
        {(showForm || editSlide) && (
          <div className={sh.slideForm}>
            <h3 className={sh.slideFormTitle}>
              {editSlide ? `Editando slide #${editSlide.id}` : 'Nuevo slide'}
            </h3>

            <div className={sh.slideFormGrid}>
              <div className={sh.slideFormLeft}>
                <label className={sh.label}>Ruta de imagen *</label>
                <ImageUploader
                  carpeta="home"
                  onUrl={(url) => setCurrentSlide({ imagen_url: url })}
                />
                <input
                  className={sh.input}
                  style={{ marginTop: 8 }}
                  placeholder="URL de imagen o pega una externa"
                  value={currentSlide.imagen_url}
                  onChange={e => setCurrentSlide({ imagen_url: e.target.value })}
                />
                {currentSlide.imagen_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentSlide.imagen_url}
                    alt="Preview"
                    className={sh.imgPreview}
                    onError={e => (e.currentTarget.style.display = 'none')}
                    onLoad={e  => (e.currentTarget.style.display = 'block')}
                  />
                )}
              </div>

              <div className={sh.slideFormRight}>
                <label className={sh.label}>Alt (descripción accesible)</label>
                <input
                  className={sh.input}
                  value={currentSlide.alt}
                  onChange={e => setCurrentSlide({ alt: e.target.value })}
                />

                <label className={sh.label}>Título (opcional)</label>
                <input
                  className={sh.input}
                  value={currentSlide.titulo}
                  onChange={e => setCurrentSlide({ titulo: e.target.value })}
                />

                <label className={sh.label}>Descripción (opcional)</label>
                <textarea
                  className={sh.textarea}
                  rows={3}
                  value={currentSlide.descripcion}
                  onChange={e => setCurrentSlide({ descripcion: e.target.value })}
                />

                <label className={sh.label}>Slogan (opcional)</label>
                <input
                  className={sh.input}
                  placeholder='Aparece como "SLOGAN"'
                  value={currentSlide.slogan}
                  onChange={e => setCurrentSlide({ slogan: e.target.value })}
                />

                <label className={sh.label}>Orden</label>
                <input
                  className={sh.input}
                  type="number"
                  min={1}
                  value={currentSlide.orden}
                  onChange={e => setCurrentSlide({ orden: Number(e.target.value) })}
                />

                <label className={sh.toggleRow}>
                  <input
                    type="checkbox"
                    checked={currentSlide.activo === 1}
                    onChange={e => setCurrentSlide({ activo: e.target.checked ? 1 : 0 })}
                  />
                  <span>Visible en el sitio</span>
                </label>
              </div>
            </div>

            <div className={sh.saveRow}>
              {slideMsg && <span className={sh.msg}>{slideMsg}</span>}
              <button className={sh.btnCancelar} onClick={() => { setEditSlide(null); setShowForm(false); }}>
                Cancelar
              </button>
              <button className={sh.btnGuardar} onClick={guardarSlide} disabled={slideSaving}>
                {slideSaving ? 'Guardando...' : editSlide ? 'Actualizar slide' : 'Agregar slide'}
              </button>
            </div>
          </div>
        )}

        {/* Lista de slides */}
        <div className={sh.slidesList}>
          {slides.length === 0 && (
            <p className={sh.empty}>No hay slides. Agrega uno con el botón de arriba.</p>
          )}
          {slides.map(slide => (
            <div key={slide.id} className={`${sh.slideRow} ${slide.activo === 0 ? sh.slideInactivo : ''}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={slide.imagen_url} alt={slide.alt || ''} className={sh.slideThumb}
                onError={e => (e.currentTarget.src = '/images/placeholder.png')} />
              <div className={sh.slideInfo}>
                <span className={sh.slideOrden}>#{slide.orden}</span>
                <strong>{slide.titulo || slide.alt || slide.imagen_url}</strong>
                {slide.slogan && <em className={sh.slideSlogan}>"{slide.slogan}"</em>}
                {slide.activo === 0 && <span className={styles.estadoInactivo}>Oculto</span>}
              </div>
              <div className={sh.slideActions}>
                <button
                  className={sh.btnEdit}
                  onClick={() => { setEditSlide(slide); setShowForm(false); }}
                  title="Editar"
                >
                  <i className="fa-solid fa-pencil" />
                </button>
                <button
                  className={slide.activo === 1 ? sh.btnToggleOff : sh.btnToggleOn}
                  onClick={() => toggleSlide(slide)}
                  title={slide.activo === 1 ? 'Ocultar' : 'Mostrar'}
                >
                  <i className={`fa-solid ${slide.activo === 1 ? 'fa-eye-slash' : 'fa-eye'}`} />
                </button>
                <button
                  className={sh.btnDelete}
                  onClick={() => eliminarSlide(slide.id)}
                  title="Eliminar"
                >
                  <i className="fa-solid fa-trash" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
