export interface Producto {
  slug: string
  nombre: string
  descripcion: string
  descripcion2?: string
  imagen: string
  categoria: string
}

export interface Categoria {
  slug: string
  nombre: string
  productos: Producto[]
}

export const concretos: Categoria[] = [
  {
    slug: 'agregados',
    nombre: 'Agregados',
    productos: [
      {
        slug: 'arena',
        nombre: 'Arena',
        descripcion:
          'La arena es un material granular natural indispensable en la construcción. Se utiliza como agregado fino en mezclas de concreto y mortero, garantizando una mezcla homogénea y resistente.',
        imagen: '/productos/concretos/agregados/arena.png',
        categoria: 'agregados',
      },
      {
        slug: 'grava',
        nombre: 'Grava',
        descripcion:
          'La grava es un material pétreo de gran utilidad en obras civiles. Se emplea como agregado grueso en la fabricación de concreto, aportando resistencia y durabilidad a las estructuras.',
        imagen: '/productos/concretos/agregados/grava.png',
        categoria: 'agregados',
      },
      {
        slug: 'aditivos',
        nombre: 'Aditivos',
        descripcion:
          'Aditivos químicos para mejorar las propiedades del concreto: aceleradores de fraguado, plastificantes, retardadores y mejoradores de trabajabilidad.',
        imagen: '/productos/concretos/agregados/aditivos.png',
        categoria: 'agregados',
      },
    ],
  },
  {
    slug: 'clase-a',
    nombre: 'Concretos Clase A',
    productos: [
      {
        slug: 'fc150',
        nombre: 'Concreto FC/150 KG/cm²',
        descripcion:
          'El Concreto FC150, con una resistencia de 150 kg/cm², es una mezcla especialmente diseñada para satisfacer las necesidades de obras civiles de baja y mediana exigencia estructural.',
        descripcion2:
          'Este tipo de concreto es igualmente apropiado para su aplicación en cunetas, canales de arroyo y otras estructuras que requieran resistencia moderada.',
        imagen: '/productos/concretos/clase-a/150.png',
        categoria: 'clase-a',
      },
      {
        slug: 'fc200',
        nombre: 'Concreto FC/200 KG/cm²',
        descripcion:
          'El Concreto FC200 ofrece una resistencia de 200 kg/cm², ideal para cimentaciones, losas y elementos estructurales de construcciones habitacionales y comerciales.',
        imagen: '/productos/concretos/clase-a/200.png',
        categoria: 'clase-a',
      },
      {
        slug: 'fc350',
        nombre: 'Concreto FC/350 KG/cm²',
        descripcion:
          'El Concreto FC350, de alta resistencia con 350 kg/cm², está formulado para estructuras que demandan mayor capacidad de carga, como edificios, puentes y obras de infraestructura.',
        imagen: '/productos/concretos/clase-a/350.png',
        categoria: 'clase-a',
      },
    ],
  },
  {
    slug: 'mr',
    nombre: 'Concretos MR',
    productos: [
      {
        slug: 'modular',
        nombre: 'Concreto Modular',
        descripcion:
          'El concreto modular está diseñado para proyectos que requieren módulos prefabricados y elementos estandarizados, ofreciendo versatilidad y economía en la construcción.',
        imagen: '/productos/concretos/mr/modular.png',
        categoria: 'mr',
      },
      {
        slug: 'mr',
        nombre: 'Concreto MR',
        descripcion:
          'El concreto de Módulo de Ruptura (MR) es ideal para pavimentos, pisos industriales y carreteras donde la flexión es el factor de diseño determinante.',
        imagen: '/productos/concretos/mr/mr.png',
        categoria: 'mr',
      },
    ],
  },
  {
    slug: 'especializados',
    nombre: 'Especializados',
    productos: [
      {
        slug: 'antibacterial',
        nombre: 'Concreto Antibacterial',
        descripcion:
          'Concreto con aditivos especiales que inhiben el crecimiento de bacterias y microorganismos. Ideal para hospitales, laboratorios y plantas de alimentos.',
        imagen: '/productos/concretos/especializados/antibacterial.png',
        categoria: 'especializados',
      },
      {
        slug: 'autocompactable',
        nombre: 'Concreto Autocompactable',
        descripcion:
          'Se compacta por su propio peso sin necesidad de vibración. Perfecto para estructuras con geometría compleja o alta densidad de armado.',
        imagen: '/productos/concretos/especializados/autocompactable.png',
        categoria: 'especializados',
      },
      {
        slug: 'durable',
        nombre: 'Concreto Durable',
        descripcion:
          'Formulado para soportar condiciones ambientales agresivas, ataques químicos y ciclos de hielo-deshielo, prolongando la vida útil de la estructura.',
        imagen: '/productos/concretos/especializados/durable.png',
        categoria: 'especializados',
      },
      {
        slug: 'edad-temprana',
        nombre: 'Concreto de Edad Temprana',
        descripcion:
          'Alcanza su resistencia de diseño en menor tiempo, ideal para proyectos que requieren rápida puesta en servicio.',
        imagen: '/productos/concretos/especializados/edad-temprana.png',
        categoria: 'especializados',
      },
      {
        slug: 'impermeable',
        nombre: 'Concreto Impermeable',
        descripcion:
          'Con baja permeabilidad al agua, es perfecto para cisternas, albercas, sótanos y estructuras en contacto permanente con agua.',
        imagen: '/productos/concretos/especializados/impermeable.png',
        categoria: 'especializados',
      },
      {
        slug: 'ligero',
        nombre: 'Concreto Ligero',
        descripcion:
          'Menor densidad que el concreto convencional, reduce la carga muerta en estructuras. Ideal para losas de entrepiso y cubiertas.',
        imagen: '/productos/concretos/especializados/ligero.png',
        categoria: 'especializados',
      },
      {
        slug: 'permeable',
        nombre: 'Concreto Permeable',
        descripcion:
          'Permite el paso del agua a través de su estructura, favoreciendo la recarga del manto freático. Ideal para estacionamientos y banquetas.',
        imagen: '/productos/concretos/especializados/permeable.png',
        categoria: 'especializados',
      },
      {
        slug: 'pigmentado',
        nombre: 'Concreto Pigmentado',
        descripcion:
          'Concreto con pigmentos integrales en masa que ofrece acabados decorativos duraderos para pisos, plazas y elementos arquitectónicos.',
        imagen: '/productos/concretos/especializados/pigmentado.png',
        categoria: 'especializados',
      },
    ],
  },
  {
    slug: 'prefabricados',
    nombre: 'Línea de Prefabricados',
    productos: [
      {
        slug: 'barda',
        nombre: 'Barda Pre-Fabricada',
        descripcion:
          'Sistema de bardas prefabricadas de concreto que ofrecen seguridad, rapidez de instalación y acabado estético para delimitación de propiedades.',
        imagen: '/productos/concretos/prefabricados/barda.png',
        categoria: 'prefabricados',
      },
      {
        slug: 'barrera',
        nombre: 'Barrera',
        descripcion:
          'Barreras de concreto tipo New Jersey para control de tráfico, seguridad vial y delimitación de zonas de trabajo.',
        imagen: '/productos/concretos/prefabricados/barrera.png',
        categoria: 'prefabricados',
      },
      {
        slug: 'postes',
        nombre: 'Postes',
        descripcion:
          'Postes de concreto prefabricados para cercas, instalaciones eléctricas y señalización, con alta resistencia y durabilidad.',
        imagen: '/productos/concretos/prefabricados/postes.png',
        categoria: 'prefabricados',
      },
    ],
  },
  {
    slug: 'renta-de-equipo',
    nombre: 'Renta de Equipo',
    productos: [
      {
        slug: 'vibrador-de-concreto',
        nombre: 'Vibrador de Concreto',
        descripcion:
          'Renta de vibrador de concreto para consolidar mezclas y eliminar vacíos en el colado, garantizando estructuras más resistentes.',
        imagen: '/productos/concretos/renta-de-equipo/vibrador.png',
        categoria: 'renta-de-equipo',
      },
      {
        slug: 'grua',
        nombre: 'Grúa',
        descripcion:
          'Renta de grúa para izaje y manejo de materiales pesados en obra. Diferentes capacidades de carga disponibles.',
        imagen: '/productos/concretos/renta-de-equipo/grua.png',
        categoria: 'renta-de-equipo',
      },
      {
        slug: 'retroescabadora',
        nombre: 'Retroescabadora',
        descripcion:
          'Renta de retroescabadora para excavaciones, zanjas y movimiento de tierra en proyectos de construcción.',
        imagen: '/productos/concretos/renta-de-equipo/retroescabadora.png',
        categoria: 'renta-de-equipo',
      },
      {
        slug: 'bolteo',
        nombre: 'Bolteo',
        descripcion:
          'Renta de camión de volteo para transporte y descarga de materiales a granel en obra.',
        imagen: '/productos/concretos/renta-de-equipo/bolteo.png',
        categoria: 'renta-de-equipo',
      },
    ],
  },
  {
    slug: 'servicios',
    nombre: 'Servicios',
    productos: [
      {
        slug: 'bomba-telescopica',
        nombre: 'Bomba Telescópica',
        descripcion:
          'Servicio de bombeo de concreto con equipo telescópico para alcanzar zonas de difícil acceso en altura.',
        imagen: '/productos/concretos/servicios/bomba-telescopica.png',
        categoria: 'servicios',
      },
      {
        slug: 'concreto-estampado',
        nombre: 'Concreto Estampado',
        descripcion:
          'Aplicación de patrones y texturas sobre concreto fresco para crear acabados decorativos imitando materiales naturales.',
        imagen: '/productos/concretos/servicios/estampado.png',
        categoria: 'servicios',
      },
      {
        slug: 'concreto-movil',
        nombre: 'Concreto Móvil',
        descripcion:
          'Producción y entrega de concreto fresco directamente en obra con planta volumétrica móvil.',
        imagen: '/productos/concretos/servicios/movil.png',
        categoria: 'servicios',
      },
      {
        slug: 'corte-concreto',
        nombre: 'Corte de Concreto',
        descripcion:
          'Servicio de corte de concreto con equipos de disco diamantado para juntas de control y demolición selectiva.',
        imagen: '/productos/concretos/servicios/corte.png',
        categoria: 'servicios',
      },
      {
        slug: 'floteado-pulido',
        nombre: 'Floteado y Pulido',
        descripcion:
          'Acabado superficial de pisos de concreto mediante máquinas floteadoras y pulidoras para obtener superficies lisas y brillantes.',
        imagen: '/productos/concretos/servicios/floteado.png',
        categoria: 'servicios',
      },
      {
        slug: 'vibrador',
        nombre: 'Vibrador',
        descripcion:
          'Equipo vibrador de concreto para eliminar vacíos y asegurar la correcta consolidación del concreto en el molde.',
        imagen: '/productos/concretos/servicios/vibrador.png',
        categoria: 'servicios',
      },
    ],
  },
]

export function getCategoriaBySlug(slug: string): Categoria | undefined {
  return concretos.find((c) => c.slug === slug)
}

export function getProductoBySlug(
  categoriaSlug: string,
  productoSlug: string
): Producto | undefined {
  const categoria = getCategoriaBySlug(categoriaSlug)
  return categoria?.productos.find((p) => p.slug === productoSlug)
}
