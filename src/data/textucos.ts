export interface Producto {
  slug: string
  nombre: string
  descripcion: string
  imagen: string
  categoria: string
}

export interface Categoria {
  slug: string
  nombre: string
  productos: Producto[]
}

export const textucos: Categoria[] = [
  {
    slug: 'adhesivos',
    nombre: 'Adhesivos',
    productos: [
      {
        slug: 'boquilla',
        nombre: 'Boquilla Sin Arena',
        descripcion:
          'Sellador para emboquillar superficies de cerámica y porcelanato. Fórmula sin arena para juntas finas y acabado limpio.',
        imagen: '/productos/adhesivos/Boquilla Sin Arena copia.png',
        categoria: 'adhesivos',
      },
      {
        slug: 'fija-fachalet',
        nombre: 'Fija Fachalet',
        descripcion:
          'Adhesivo especial para la colocación de fachaleta y piedra artificial en fachadas y muros interiores.',
        imagen: '/productos/adhesivos/fijafachalet.png',
        categoria: 'adhesivos',
      },
      {
        slug: 'junteador',
        nombre: 'Junteador',
        descripcion:
          'Mortero para juntas de cerámica y porcelanato. Disponible en varios colores para complementar el diseño.',
        imagen: '/productos/adhesivos/junteador con arena.png',
        categoria: 'adhesivos',
      },
      {
        slug: 'pegapiso',
        nombre: 'Pegapiso',
        descripcion:
          'Adhesivo cementoso para colocación de pisos y recubrimientos cerámicos en interiores y exteriores.',
        imagen: '/productos/adhesivos/pegapiso.png',
        categoria: 'adhesivos',
      },
      {
        slug: 'piso-sobre-piso',
        nombre: 'Piso Sobre Piso',
        descripcion:
          'Adhesivo de alta adherencia que permite instalar cerámica directamente sobre piso existente sin demoler.',
        imagen: '/productos/adhesivos/pisosobrepiso.png',
        categoria: 'adhesivos',
      },
      {
        slug: 'porcelanato',
        nombre: 'Adhesivo para Porcelanato',
        descripcion:
          'Adhesivo de alto rendimiento para porcelanato y piezas grandes. Formulado para minimizar el deslizamiento.',
        imagen: '/productos/adhesivos/porcelanato.png',
        categoria: 'adhesivos',
      },
      {
        slug: 'renivelador',
        nombre: 'Renivelador',
        descripcion:
          'Mortero autonivelante para corrección de pisos irregulares antes de la instalación de recubrimientos.',
        imagen: '/productos/adhesivos/reanivelador.png',
        categoria: 'adhesivos',
      },
      {
        slug: 'fija-sillar',
        nombre: 'Fija Sillar',
        descripcion:
          'Adhesivo resistente para la colocación de sillar y cantera natural en muros y fachadas.',
        imagen: '/productos/adhesivos/sillar.png',
        categoria: 'adhesivos',
      },
      {
        slug: 'fija-teja',
        nombre: 'Fija Teja',
        descripcion:
          'Adhesivo especializado para la colocación de teja de barro y cantera en techos y muros exteriores.',
        imagen: '/productos/adhesivos/teja.png',
        categoria: 'adhesivos',
      },
      {
        slug: 'veneciano',
        nombre: 'Fija Veneciano',
        descripcion:
          'Adhesivo para colocación de mosaico veneciano y piezas pequeñas en albercas, fuentes y acabados decorativos.',
        imagen: '/productos/adhesivos/venesiano.png',
        categoria: 'adhesivos',
      },
    ],
  },
  {
    slug: 'morteros',
    nombre: 'Morteros y Afinadores',
    productos: [
      {
        slug: 'mortero-integral',
        nombre: 'Mortero Integral',
        descripcion:
          'Mortero multiusos para aplanados, pegas y nivelaciones. Formulado con aditivos para mayor trabajabilidad.',
        imagen: '/productos/mortero_y_afinadores/mortero.png',
        categoria: 'morteros',
      },
      {
        slug: 'mortero-en-pasta',
        nombre: 'Mortero en Pasta Blanca',
        descripcion:
          'Mortero listo para usar en presentación en pasta blanca. Ideal para reparaciones y acabados de pequeñas áreas.',
        imagen: '/productos/mortero_y_afinadores/mortero en pasta blanca.png',
        categoria: 'morteros',
      },
      {
        slug: 'coral',
        nombre: 'Texturizado Coral Fino',
        descripcion:
          'Mortero de acabado decorativo con textura coral fino para fachadas y muros exteriores.',
        imagen: '/productos/mortero_y_afinadores/coral fino.png',
        categoria: 'morteros',
      },
      {
        slug: 'fachalet',
        nombre: 'Fachalet en Polvo',
        descripcion:
          'Mortero decorativo en polvo para fachadas con acabado tipo fachaleta. Simula la textura de piedra natural.',
        imagen: '/productos/mortero_y_afinadores/fachalet.png',
        categoria: 'morteros',
      },
      {
        slug: 'texturizado',
        nombre: 'Texturizado',
        descripcion:
          'Mortero texturizado para aplicación en muros y fachadas. Brinda acabado decorativo y protección contra la intemperie.',
        imagen: '/productos/mortero_y_afinadores/texturizado.png',
        categoria: 'morteros',
      },
      {
        slug: 'tirol-reforzado',
        nombre: 'Tirol Reforzado',
        descripcion:
          'Mortero tirol reforzado para acabados de alta resistencia en fachadas y muros exteriores.',
        imagen: '/productos/mortero_y_afinadores/tirol reforzado.png',
        categoria: 'morteros',
      },
      {
        slug: 'afina-facil',
        nombre: 'Afina Fácil',
        descripcion:
          'Mortero afinador de acabado fino para muros y plafones. Fácil aplicación y excelente terminado.',
        imagen: '/productos/mortero_y_afinadores/afina fasil.png',
        categoria: 'morteros',
      },
      {
        slug: 'aplana-fina',
        nombre: 'Aplana Fina',
        descripcion:
          'Mortero para aplanado fino de paredes interiores y exteriores, preparando la superficie para pintura o recubrimiento.',
        imagen: '/productos/mortero_y_afinadores/aplanafinaa.png',
        categoria: 'morteros',
      },
      {
        slug: 'endurecedor',
        nombre: 'Endurecedor',
        descripcion:
          'Tratamiento endurecedor para pisos de concreto que aumenta la resistencia a la abrasión y facilita la limpieza.',
        imagen: '/productos/mortero_y_afinadores/enduresedor.png',
        categoria: 'morteros',
      },
      {
        slug: 'grano-marmol',
        nombre: 'Grano de Mármol',
        descripcion:
          'Mortero con granito de mármol para acabados decorativos de alta calidad en interiores y exteriores.',
        imagen: '/productos/mortero_y_afinadores/marmol.png',
        categoria: 'morteros',
      },
      {
        slug: 'reflex',
        nombre: 'Reflex',
        descripcion:
          'Mortero de acabado reflex para superficies decorativas con efecto reflectante.',
        imagen: '/productos/mortero_y_afinadores/reflex.png',
        categoria: 'morteros',
      },
      {
        slug: 'sombra',
        nombre: 'Sombra',
        descripcion:
          'Mortero sombra para acabados decorativos con efecto de profundidad en muros y fachadas.',
        imagen: '/productos/mortero_y_afinadores/ssombra.png',
        categoria: 'morteros',
      },
    ],
  },
  {
    slug: 'selladores',
    nombre: 'Selladores',
    productos: [
      {
        slug: '5x1',
        nombre: '5x1',
        descripcion:
          'Sellador multipropósito 5 en 1: sella, impermeabiliza, adhiere, pinta y protege superficies.',
        imagen: '/productos/selladores/5X1.png',
        categoria: 'selladores',
      },
      {
        slug: 'barniz',
        nombre: 'Barniz',
        descripcion:
          'Barniz protector para superficies de madera, concreto y cantera. Brinda acabado brillante y resistencia al clima.',
        imagen: '/productos/selladores/BARNIZ CON.png',
        categoria: 'selladores',
      },
      {
        slug: 'bond',
        nombre: 'Bond',
        descripcion:
          'Promotor de adherencia para mejorar la unión entre capas de mortero, concreto y superficies existentes.',
        imagen: '/productos/selladores/BOND.png',
        categoria: 'selladores',
      },
      {
        slug: 'disgregante',
        nombre: 'Disgregante',
        descripcion:
          'Desmoldante para cimbra que evita la adherencia del concreto y facilita el retiro del encofrado.',
        imagen: '/productos/selladores/DISGREGANTE.png',
        categoria: 'selladores',
      },
      {
        slug: 'fijacril',
        nombre: 'Fijacril',
        descripcion:
          'Sellador acrílico de alta penetración para superficies porosas. Prepara y consolida la base antes de pintar.',
        imagen: '/productos/selladores/FIJACLIL.png',
        categoria: 'selladores',
      },
      {
        slug: 'ipermax',
        nombre: 'Ipermax',
        descripcion:
          'Impermeabilizante elástico de alto rendimiento para losas, azoteas y muros con problemas de filtración.',
        imagen: '/productos/selladores/IPERMAX.png',
        categoria: 'selladores',
      },
      {
        slug: 'pintacril',
        nombre: 'Pintacril',
        descripcion:
          'Pintura acrílica impermeabilizante para fachadas y muros exteriores. Protege y embellece.',
        imagen: '/productos/selladores/PINTACRIL.png',
        categoria: 'selladores',
      },
      {
        slug: 'teflon',
        nombre: 'Teflón',
        descripcion:
          'Sellador con teflón para pisos y recubrimientos cerámicos. Facilita la limpieza y previene manchas.',
        imagen: '/productos/selladores/TEFLON.png',
        categoria: 'selladores',
      },
      {
        slug: 'textumar',
        nombre: 'Textumar',
        descripcion:
          'Sellador texturizado para aplicación en fachadas. Brinda acabado decorativo y protección contra la intemperie.',
        imagen: '/productos/selladores/TEXTUMAR.png',
        categoria: 'selladores',
      },
    ],
  },
  {
    slug: 'pinturas',
    nombre: 'Pinturas',
    productos: [
      {
        slug: 'satinado',
        nombre: 'Satinado',
        descripcion:
          'Pintura con acabado satinado que ofrece un brillo suave y elegante. Fácil limpieza y excelente cubrimiento para interiores y exteriores.',
        imagen: '/productos/pinturas/pinturas satinado  copia.png',
        categoria: 'pinturas',
      },
      {
        slug: 'mate',
        nombre: 'Mate',
        descripcion:
          'Pintura con acabado mate que elimina reflejos y disimula imperfecciones. Ideal para paredes interiores con acabado liso y uniforme.',
        imagen: '/productos/pinturas/mate copia.png',
        categoria: 'pinturas',
      },
      {
        slug: 'brillante',
        nombre: 'Brillante',
        descripcion:
          'Pintura con acabado brillante de alta resistencia. Perfecta para superficies que requieren limpieza frecuente como cocinas, baños y carpintería.',
        imagen: '/productos/pinturas/pinturas copia.png',
        categoria: 'pinturas',
      },
    ],
  },
  {
    slug: 'especializados',
    nombre: 'Especializados',
    productos: [
      {
        slug: 'lanzado-texturizado',
        nombre: 'Lanzado Texturizado',
        descripcion:
          'Servicio de aplicación de texturizado lanzado con equipo neumático para acabados uniformes en grandes superficies.',
        imagen: '/productos/especialisados/TEXTUMAR.png',
        categoria: 'especializados',
      },
      {
        slug: 'colocacion-exturizado',
        nombre: 'Colocación de Exturizado',
        descripcion:
          'Servicio especializado de colocación de materiales texturizados con maquinaria vibratoria para acabados de alta calidad.',
        imagen: '/productos/especialisados/porcelanato.png',
        categoria: 'especializados',
      },
      {
        slug: 'impermeabilizacion',
        nombre: 'Impermeabilización',
        descripcion:
          'Servicio de impermeabilización para losas, azoteas y muros. Aplicación con productos de alto rendimiento.',
        imagen: '/productos/especialisados/IPERMAX.png',
        categoria: 'especializados',
      },
      {
        slug: 'colocacion-teja',
        nombre: 'Colocación de Teja',
        descripcion:
          'Servicio especializado de colocación de teja de barro y cantera en techos y muros exteriores.',
        imagen: '/productos/especialisados/teja.png',
        categoria: 'especializados',
      },
    ],
  },
]

export function getCategoriaBySlug(slug: string): Categoria | undefined {
  return textucos.find((c) => c.slug === slug)
}

export function getProductoBySlug(
  categoriaSlug: string,
  productoSlug: string
): Producto | undefined {
  const categoria = getCategoriaBySlug(categoriaSlug)
  return categoria?.productos.find((p) => p.slug === productoSlug)
}
