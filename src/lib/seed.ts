import { db } from './db';

/**
 * Puebla la BD con todos los productos del catálogo.
 * Los datos están embebidos directamente aquí (los archivos .ts estáticos han sido eliminados).
 * Usa ON DUPLICATE KEY UPDATE para que sea seguro ejecutar varias veces.
 * Llamar desde /api/admin/seed o un script de administración.
 */
export async function seedDatabase() {
  try {
    console.log('🚀 Iniciando seed de productos...');

    // ── CONCRETOS ──────────────────────────────────────────────
    const concretos: Array<[string, string, string, string | null, string, string, string | null]> = [
      // [nombre, slug, descripcion, descripcion2, imagen_url, categoria_slug, categoria_nombre]
      ['Arena','arena','La arena es un material granular natural indispensable en la construcción.',null,'/productos/concretos/agregados/arena.png','agregados','Agregados'],
      ['Grava','grava','La grava es un material pétreo de gran utilidad en obras civiles.',null,'/productos/concretos/agregados/grava.png','agregados','Agregados'],
      ['Aditivos','aditivos','Aditivos químicos para mejorar las propiedades del concreto.',null,'/productos/concretos/agregados/aditivos.png','agregados','Agregados'],
      ['Concreto FC/150 KG/cm²','fc150','El Concreto FC150, con una resistencia de 150 kg/cm², es una mezcla especialmente diseñada para satisfacer las necesidades de obras civiles de baja y mediana exigencia estructural.','Este tipo de concreto es igualmente apropiado para su aplicación en cunetas, canales de arroyo y otras estructuras que requieran resistencia moderada.','/productos/concretos/clase-a/150.png','clase-a','Concretos Clase A'],
      ['Concreto FC/200 KG/cm²','fc200','El Concreto FC200 ofrece una resistencia de 200 kg/cm², ideal para cimentaciones, losas y elementos estructurales.',null,'/productos/concretos/clase-a/200.png','clase-a','Concretos Clase A'],
      ['Concreto FC/350 KG/cm²','fc350','El Concreto FC350, de alta resistencia con 350 kg/cm², está formulado para estructuras que demandan mayor capacidad de carga.',null,'/productos/concretos/clase-a/350.png','clase-a','Concretos Clase A'],
      ['Concreto Modular','modular','El concreto modular está diseñado para proyectos que requieren módulos prefabricados.',null,'/productos/concretos/mr/modular.png','mr','Concretos MR'],
      ['Concreto MR','mr','El concreto de Módulo de Ruptura (MR) es ideal para pavimentos, pisos industriales y carreteras.',null,'/productos/concretos/mr/mr.png','mr','Concretos MR'],
      ['Concreto Antibacterial','antibacterial','Concreto con aditivos especiales que inhiben el crecimiento de bacterias y microorganismos.',null,'/productos/concretos/especializados/antibacterial.png','especializados','Especializados'],
      ['Concreto Autocompactable','autocompactable','Se compacta por su propio peso sin necesidad de vibración.',null,'/productos/concretos/especializados/autocompactable.png','especializados','Especializados'],
      ['Concreto Durable','durable','Formulado para soportar condiciones ambientales agresivas, ataques químicos y ciclos de hielo-deshielo.',null,'/productos/concretos/especializados/durable.png','especializados','Especializados'],
      ['Concreto de Edad Temprana','edad-temprana','Alcanza su resistencia de diseño en menor tiempo, ideal para proyectos que requieren rápida puesta en servicio.',null,'/productos/concretos/especializados/edad-temprana.png','especializados','Especializados'],
      ['Concreto Impermeable','impermeable','Con baja permeabilidad al agua, es perfecto para cisternas, albercas, sótanos y estructuras en contacto permanente con agua.',null,'/productos/concretos/especializados/impermeable.png','especializados','Especializados'],
      ['Concreto Ligero','ligero','Menor densidad que el concreto convencional, reduce la carga muerta en estructuras.',null,'/productos/concretos/especializados/ligero.png','especializados','Especializados'],
      ['Concreto Permeable','permeable','Permite el paso del agua a través de su estructura, favoreciendo la recarga del manto freático.',null,'/productos/concretos/especializados/permeable.png','especializados','Especializados'],
      ['Concreto Pigmentado','pigmentado','Concreto con pigmentos integrales en masa que ofrece acabados decorativos duraderos.',null,'/productos/concretos/especializados/pigmentado.png','especializados','Especializados'],
      ['Barda Pre-Fabricada','barda','Sistema de bardas prefabricadas de concreto para delimitación de propiedades.',null,'/productos/concretos/prefabricados/barda.png','prefabricados','Línea de Prefabricados'],
      ['Barrera','barrera','Barreras de concreto tipo New Jersey para control de tráfico y seguridad vial.',null,'/productos/concretos/prefabricados/barrera.png','prefabricados','Línea de Prefabricados'],
      ['Postes','postes','Postes de concreto prefabricados para cercas, instalaciones eléctricas y señalización.',null,'/productos/concretos/prefabricados/postes.png','prefabricados','Línea de Prefabricados'],
      ['Vibrador de Concreto','vibrador-de-concreto','Renta de vibrador de concreto para consolidar mezclas y eliminar vacíos en el colado.',null,'/productos/concretos/renta-de-equipo/vibrador.png','renta-de-equipo','Renta de Equipo'],
      ['Grúa','grua','Renta de grúa para izaje y manejo de materiales pesados en obra.',null,'/productos/concretos/renta-de-equipo/grua.png','renta-de-equipo','Renta de Equipo'],
      ['Retroescabadora','retroescabadora','Renta de retroescabadora para excavaciones, zanjas y movimiento de tierra.',null,'/productos/concretos/renta-de-equipo/retroescabadora.png','renta-de-equipo','Renta de Equipo'],
      ['Bolteo','bolteo','Renta de camión de volteo para transporte y descarga de materiales a granel.',null,'/productos/concretos/renta-de-equipo/bolteo.png','renta-de-equipo','Renta de Equipo'],
      ['Bomba Telescópica','bomba-telescopica','Servicio de bombeo de concreto con equipo telescópico para zonas de difícil acceso.',null,'/productos/concretos/servicios/bomba-telescopica.png','servicios','Servicios'],
      ['Concreto Estampado','concreto-estampado','Aplicación de patrones y texturas sobre concreto fresco para acabados decorativos.',null,'/productos/concretos/servicios/estampado.png','servicios','Servicios'],
      ['Concreto Móvil','concreto-movil','Producción y entrega de concreto fresco directamente en obra con planta volumétrica móvil.',null,'/productos/concretos/servicios/movil.png','servicios','Servicios'],
      ['Corte de Concreto','corte-concreto','Servicio de corte de concreto con equipos de disco diamantado para juntas de control.',null,'/productos/concretos/servicios/corte.png','servicios','Servicios'],
      ['Floteado y Pulido','floteado-pulido','Acabado superficial de pisos de concreto mediante máquinas floteadoras y pulidoras.',null,'/productos/concretos/servicios/floteado.png','servicios','Servicios'],
    ];

    for (const [nombre, slug, desc, desc2, img, catSlug, catNombre] of concretos) {
      await db.query(
        `INSERT INTO productos (nombre, slug, descripcion, descripcion2, imagen_url, seccion, categoria_slug, categoria_nombre, activo)
         VALUES (?, ?, ?, ?, ?, 'concretos', ?, ?, 1)
         ON CONFLICT (slug, seccion) DO UPDATE SET
           nombre=EXCLUDED.nombre, descripcion=EXCLUDED.descripcion,
           descripcion2=EXCLUDED.descripcion2, imagen_url=EXCLUDED.imagen_url,
           categoria_nombre=EXCLUDED.categoria_nombre`,
        [nombre, slug, desc, desc2, img, catSlug, catNombre]
      );
    }

    // ── ACABADOS (textucos) ────────────────────────────────────
    const textucos: Array<[string, string, string, string | null, string, string]> = [
      // [nombre, slug, descripcion, imagen_url, categoria_slug, categoria_nombre]
      ['Boquilla Sin Arena','boquilla','Sellador para emboquillar superficies de cerámica y porcelanato.','/productos/adhesivos/Boquilla Sin Arena copia.png','adhesivos','Adhesivos'],
      ['Fija Fachalet','fija-fachalet','Adhesivo especial para colocación de fachaleta y piedra artificial.','/productos/adhesivos/fijafachalet.png','adhesivos','Adhesivos'],
      ['Junteador','junteador','Mortero para juntas de cerámica y porcelanato.','/productos/adhesivos/junteador con arena.png','adhesivos','Adhesivos'],
      ['Pegapiso','pegapiso','Adhesivo cementoso para colocación de pisos y recubrimientos cerámicos.','/productos/adhesivos/pegapiso.png','adhesivos','Adhesivos'],
      ['Piso Sobre Piso','piso-sobre-piso','Adhesivo de alta adherencia para instalar cerámica sobre piso existente sin demoler.','/productos/adhesivos/pisosobrepiso.png','adhesivos','Adhesivos'],
      ['Adhesivo para Porcelanato','porcelanato','Adhesivo de alto rendimiento para porcelanato y piezas grandes.','/productos/adhesivos/porcelanato.png','adhesivos','Adhesivos'],
      ['Renivelador','renivelador','Mortero autonivelante para corrección de pisos irregulares.','/productos/adhesivos/reanivelador.png','adhesivos','Adhesivos'],
      ['Fija Sillar','fija-sillar','Adhesivo resistente para colocación de sillar y cantera natural.','/productos/adhesivos/sillar.png','adhesivos','Adhesivos'],
      ['Fija Teja','fija-teja','Adhesivo especializado para colocación de teja de barro y cantera.','/productos/adhesivos/teja.png','adhesivos','Adhesivos'],
      ['Fija Veneciano','veneciano','Adhesivo para colocación de mosaico veneciano y piezas pequeñas.','/productos/adhesivos/venesiano.png','adhesivos','Adhesivos'],
      ['Mortero Integral','mortero-integral','Mortero multiusos para aplanados, pegas y nivelaciones.','/productos/mortero_y_afinadores/mortero.png','morteros','Morteros y Afinadores'],
      ['Mortero en Pasta Blanca','mortero-en-pasta','Mortero listo para usar en presentación en pasta blanca.','/productos/mortero_y_afinadores/mortero en pasta blanca.png','morteros','Morteros y Afinadores'],
      ['Texturizado Coral Fino','coral','Mortero de acabado decorativo con textura coral fino.','/productos/mortero_y_afinadores/coral fino.png','morteros','Morteros y Afinadores'],
      ['Fachalet en Polvo','fachalet','Mortero decorativo en polvo para fachadas tipo fachaleta.','/productos/mortero_y_afinadores/fachalet.png','morteros','Morteros y Afinadores'],
      ['Texturizado','texturizado','Mortero texturizado para muros y fachadas con acabado decorativo.','/productos/mortero_y_afinadores/texturizado.png','morteros','Morteros y Afinadores'],
      ['Tirol Reforzado','tirol-reforzado','Mortero tirol reforzado para acabados de alta resistencia.','/productos/mortero_y_afinadores/tirol reforzado.png','morteros','Morteros y Afinadores'],
      ['Afina Fácil','afina-facil','Mortero afinador de acabado fino para muros y plafones.','/productos/mortero_y_afinadores/afina fasil.png','morteros','Morteros y Afinadores'],
      ['Aplana Fina','aplana-fina','Mortero para aplanado fino de paredes interiores y exteriores.','/productos/mortero_y_afinadores/aplanafinaa.png','morteros','Morteros y Afinadores'],
      ['Endurecedor','endurecedor','Tratamiento endurecedor para pisos de concreto.','/productos/mortero_y_afinadores/enduresedor.png','morteros','Morteros y Afinadores'],
      ['Grano de Mármol','grano-marmol','Mortero con granito de mármol para acabados decorativos.','/productos/mortero_y_afinadores/marmol.png','morteros','Morteros y Afinadores'],
      ['Reflex','reflex','Mortero de acabado reflex para superficies con efecto reflectante.','/productos/mortero_y_afinadores/reflex.png','morteros','Morteros y Afinadores'],
      ['Sombra','sombra','Mortero sombra para acabados con efecto de profundidad.','/productos/mortero_y_afinadores/ssombra.png','morteros','Morteros y Afinadores'],
      ['5x1','5x1','Sellador multipropósito 5 en 1: sella, impermeabiliza, adhiere, pinta y protege.','/productos/selladores/5X1.png','selladores','Selladores'],
      ['Barniz','barniz','Barniz protector para superficies de madera, concreto y cantera.','/productos/selladores/BARNIZ CON.png','selladores','Selladores'],
      ['Bond','bond','Promotor de adherencia para mejorar la unión entre capas de mortero y concreto.','/productos/selladores/BOND.png','selladores','Selladores'],
      ['Disgregante','disgregante','Desmoldante para cimbra que evita la adherencia del concreto.','/productos/selladores/DISGREGANTE.png','selladores','Selladores'],
      ['Fijacril','fijacril','Sellador acrílico de alta penetración para superficies porosas.','/productos/selladores/FIJACLIL.png','selladores','Selladores'],
      ['Ipermax','ipermax','Impermeabilizante elástico de alto rendimiento para losas y azoteas.','/productos/selladores/IPERMAX.png','selladores','Selladores'],
      ['Pintacril','pintacril','Pintura acrílica impermeabilizante para fachadas y muros exteriores.','/productos/selladores/PINTACRIL.png','selladores','Selladores'],
      ['Teflón','teflon','Sellador con teflón para pisos y recubrimientos cerámicos.','/productos/selladores/TEFLON.png','selladores','Selladores'],
      ['Textumar','textumar','Sellador texturizado para fachadas con acabado decorativo.','/productos/selladores/TEXTUMAR.png','selladores','Selladores'],
      ['Satinado','satinado','Pintura con acabado satinado para interiores y exteriores.','/productos/pinturas/pinturas satinado  copia.png','pinturas','Pinturas'],
      ['Mate','mate','Pintura con acabado mate que elimina reflejos y disimula imperfecciones.','/productos/pinturas/mate copia.png','pinturas','Pinturas'],
      ['Brillante','brillante','Pintura con acabado brillante de alta resistencia.','/productos/pinturas/pinturas copia.png','pinturas','Pinturas'],
      ['Lanzado Texturizado','lanzado-texturizado','Aplicación de texturizado lanzado con equipo neumático.','/productos/especialisados/TEXTUMAR.png','especializados','Especializados'],
      ['Colocación de Exturizado','colocacion-exturizado','Colocación de materiales texturizados con maquinaria vibratoria.','/productos/especialisados/porcelanato.png','especializados','Especializados'],
      ['Impermeabilización','impermeabilizacion','Servicio de impermeabilización para losas, azoteas y muros.','/productos/especialisados/IPERMAX.png','especializados','Especializados'],
      ['Colocación de Teja','colocacion-teja','Servicio de colocación de teja de barro y cantera.','/productos/especialisados/teja.png','especializados','Especializados'],
    ];

    for (const [nombre, slug, desc, img, catSlug, catNombre] of textucos) {
      await db.query(
        `INSERT INTO productos (nombre, slug, descripcion, imagen_url, seccion, categoria_slug, categoria_nombre, activo)
         VALUES (?, ?, ?, ?, 'textucos', ?, ?, 1)
         ON CONFLICT (slug, seccion) DO UPDATE SET
           nombre=EXCLUDED.nombre, descripcion=EXCLUDED.descripcion,
           imagen_url=EXCLUDED.imagen_url, categoria_nombre=EXCLUDED.categoria_nombre`,
        [nombre, slug, desc, img, catSlug, catNombre]
      );
    }

    // ── MATERIALES CATEGORÍAS ──────────────────────────────────
    const materiales = [
      {
        slug: 'construccion', nombre: 'Construcción',
        descripcion: 'Herramientas eléctricas y manuales de las mejores marcas para tu obra.',
        marcas: [
          { nombre: 'DeWalt', logo: '/productos/materiales/construccion/dewalt.png' },
          { nombre: 'Makita', logo: '/productos/materiales/construccion/makita.png' },
          { nombre: 'Truper', logo: '/productos/materiales/construccion/truper.png' },
        ],
      },
      {
        slug: 'electrico', nombre: 'Eléctrico',
        descripcion: 'Materiales eléctricos de las marcas más confiables del mercado.',
        marcas: [
          { nombre: 'Condumex', logo: '/productos/materiales/electrico/condumex.png' },
          { nombre: 'IUSA', logo: '/productos/materiales/electrico/iusa.png' },
          { nombre: 'Square D', logo: '/productos/materiales/electrico/squared.png' },
          { nombre: 'Royer', logo: '/productos/materiales/electrico/royer.png' },
        ],
      },
      {
        slug: 'plomeria', nombre: 'Plomería',
        descripcion: 'Sistemas de conducción y almacenamiento de agua para tu construcción.',
        marcas: [{ nombre: 'Rotoplas', logo: '/productos/materiales/plomeria/rotoplas.png' }],
      },
      {
        slug: 'herreria', nombre: 'Herrería',
        descripcion: 'Perfiles y acero estructural de las mejores siderúrgicas.',
        marcas: [
          { nombre: 'Prolamsa', logo: '/productos/materiales/herreria/prolamsa.png' },
          { nombre: 'INFRA', logo: '/productos/materiales/herreria/infra.png' },
        ],
      },
      {
        slug: 'decoracion', nombre: 'Decoración',
        descripcion: 'Materiales y acabados para decoración interior y exterior.',
        marcas: [],
      },
      {
        slug: 'herramienta', nombre: 'Herramienta',
        descripcion: 'Herramientas manuales y accesorios para construcción.',
        marcas: [],
      },
    ];

    for (const cat of materiales) {
      await db.query(
        `INSERT INTO materiales_categorias (slug, nombre, descripcion, marcas, activo)
         VALUES (?, ?, ?, ?, 1)
         ON CONFLICT (slug) DO UPDATE SET
           nombre=EXCLUDED.nombre, descripcion=EXCLUDED.descripcion, marcas=EXCLUDED.marcas`,
        [cat.slug, cat.nombre, cat.descripcion, JSON.stringify(cat.marcas)]
      );
    }

    console.log('✅ Seed completado con éxito.');
    return { ok: true };
  } catch (error) {
    console.error('❌ Error en el seed:', error);
    return { ok: false, error: String(error) };
  }
}
