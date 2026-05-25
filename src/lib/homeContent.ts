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

export async function getHomeCards(): Promise<HomeCard[]> {
  const [rows] = await db.query(
    'SELECT * FROM home_cards ORDER BY posicion ASC'
  );
  return rows as HomeCard[];
}

export async function getCarouselSlides(): Promise<CarouselSlide[]> {
  const [rows] = await db.query(
    'SELECT * FROM carousel_slides WHERE activo = 1 ORDER BY orden ASC'
  );
  return rows as CarouselSlide[];
}

export async function getAllCarouselSlides(): Promise<CarouselSlide[]> {
  const [rows] = await db.query(
    'SELECT * FROM carousel_slides ORDER BY orden ASC'
  );
  return rows as CarouselSlide[];
}
