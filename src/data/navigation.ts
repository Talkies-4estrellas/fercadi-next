export interface NavSubItem {
  label: string
  href: string
}

export interface NavItem {
  label: string
  href: string
  submenu?: NavSubItem[]
}

export const navItems: NavItem[] = [
  { label: 'Tutoriales y Tips', href: '/tips' },
  {
    label: 'Materiales',
    href: '/materiales',
    submenu: [
      { label: 'Construcción', href: '/materiales/construccion' },
      { label: 'Eléctrico', href: '/materiales/electrico' },
      { label: 'Plomería', href: '/materiales/plomeria' },
      { label: 'Herrería', href: '/materiales/herreria' },
      { label: 'Decoración', href: '/materiales/decoracion' },
      { label: 'Herramienta', href: '/materiales/herramienta' },
    ],
  },
  {
    label: 'Concretos',
    href: '/concretos',
    submenu: [
      { label: 'Agregados', href: '/concretos/agregados' },
      { label: 'Concretos Clase A', href: '/concretos/clase-a' },
      { label: 'Concretos MR', href: '/concretos/mr' },
      { label: 'Especializados', href: '/concretos/especializados' },
      { label: 'Línea Pre-Fabricadas', href: '/concretos/prefabricados' },
      { label: 'Servicios', href: '/concretos/servicios' },
      { label: 'Renta de Equipo', href: '/concretos/renta-de-equipo' },
    ],
  },
  {
    label: 'Acabados',
    href: '/textucos',
    submenu: [
      { label: 'Morteros y Afinadores', href: '/textucos/morteros' },
      { label: 'Adhesivos', href: '/textucos/adhesivos' },
      { label: 'Selladores', href: '/textucos/selladores' },
      { label: 'Especializados', href: '/textucos/especializados' },
      { label: 'Pinturas', href: '/textucos/pinturas' },
      { label: 'Servicios', href: '/textucos/servicios' },
    ],
  },
  {
    label: 'Ferretería',
    href: '/ferreteria',
  },
  { label: 'Contacto', href: '/contacto' },
]
