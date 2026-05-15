export interface MarcaItem {
  nombre: string
  logo: string
  href?: string
}

export interface CategoriaMaterial {
  slug: string
  nombre: string
  descripcion: string
  marcas: MarcaItem[]
}

export const materiales: CategoriaMaterial[] = [
  {
    slug: 'construccion',
    nombre: 'Construcción',
    descripcion: 'Herramientas eléctricas y manuales de las mejores marcas para tu obra.',
    marcas: [
      { nombre: 'DeWalt', logo: '/productos/materiales/construccion/dewalt.png' },
      { nombre: 'Makita', logo: '/productos/materiales/construccion/makita.png' },
      { nombre: 'Truper', logo: '/productos/materiales/construccion/truper.png' },
    ],
  },
  {
    slug: 'electrico',
    nombre: 'Eléctrico',
    descripcion: 'Materiales eléctricos de las marcas más confiables del mercado.',
    marcas: [
      { nombre: 'Condumex', logo: '/productos/materiales/electrico/condumex.png' },
      { nombre: 'IUSA', logo: '/productos/materiales/electrico/iusa.png' },
      { nombre: 'Square D', logo: '/productos/materiales/electrico/squared.png' },
      { nombre: 'Royer', logo: '/productos/materiales/electrico/royer.png' },
    ],
  },
  {
    slug: 'plomeria',
    nombre: 'Plomería',
    descripcion: 'Sistemas de conducción y almacenamiento de agua para tu construcción.',
    marcas: [
      { nombre: 'Rotoplas', logo: '/productos/materiales/plomeria/rotoplas.png' },
    ],
  },
  {
    slug: 'herreria',
    nombre: 'Herrería',
    descripcion: 'Perfiles y acero estructural de las mejores siderúrgicas.',
    marcas: [
      { nombre: 'Prolamsa', logo: '/productos/materiales/herreria/prolamsa.png' },
      { nombre: 'INFRA', logo: '/productos/materiales/herreria/infra.png' },
    ],
  },
  {
    slug: 'decoracion',
    nombre: 'Decoración',
    descripcion: 'Materiales y acabados para decoración interior y exterior.',
    marcas: [],
  },
  {
    slug: 'herramienta',
    nombre: 'Herramienta',
    descripcion: 'Herramientas manuales y eléctricas para todo tipo de trabajo.',
    marcas: [
      { nombre: 'Makita', logo: '/productos/materiales/herramienta/makita.png' },
      { nombre: 'DeWalt', logo: '/productos/materiales/herramienta/dewalt.png' },
      { nombre: 'Truper', logo: '/productos/materiales/herramienta/truper.png' },
    ],
  },
]

export function getCategoriaBySlug(slug: string): CategoriaMaterial | undefined {
  return materiales.find((m) => m.slug === slug)
}
