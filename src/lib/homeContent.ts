import { unstable_cache } from 'next/cache';
import { db } from './db';

export interface HomeCard {
  id: number;
  posicion: number;
  titulo: string;
  descripcion: string;
  btn_texto: string;
  btn_href: string;
}

export interface CarouselSlide {
  id: number;
  orden: number;
  imagen_url: string;
  alt: string | null;
  titulo: string | null;
  descripcion: string | null;
  slogan: string | null;
  activo: number;
}

export const getHomeCards = unstable_cache(
  async (): Promise<HomeCard[]> => {
    const [rows] = await db.query(
      'SELECT * FROM home_cards ORDER BY posicion ASC'
    );
    return rows as HomeCard[];
  },
  ['getHomeCards'],
  { revalidate: 300 }
);

export const getCarouselSlides = unstable_cache(
  async (): Promise<CarouselSlide[]> => {
    const [rows] = await db.query(
      'SELECT * FROM carousel_slides WHERE activo = 1 ORDER BY orden ASC'
    );
    return rows as CarouselSlide[];
  },
  ['getCarouselSlides'],
  { revalidate: 300 }
);

export async function getAllCarouselSlides(): Promise<CarouselSlide[]> {
  const [rows] = await db.query(
    'SELECT * FROM carousel_slides ORDER BY orden ASC'
  );
  return rows as CarouselSlide[];
}
