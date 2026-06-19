const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, PageBreak, LevelFormat, TableOfContents,
} = require('docx');
const fs = require('fs');
const path = require('path');

/* ══════════════════════════════════════════════════
   PALETA DE COLORES
   ══════════════════════════════════════════════════ */
const OSCURO    = '0D2137';   // Azul marino profundo
const TEAL      = '117A65';   // Verde teal (acento técnico)
const TEAL_LIGHT= 'D1F2EB';  // Fondo teal suave
const GRIS_DARK = '2C3E50';  // Gris oscuro
const GRIS      = 'F2F4F4';  // Fondo gris claro
const CODE_BG   = 'EAECEE';  // Fondo para bloques de código
const BLANCO    = 'FFFFFF';
const NEGRO     = '1A1A2E';
const ROJO      = 'C0392B';  // Para advertencias
const AMARILLO  = 'F39C12';  // Para notas

/* ══════════════════════════════════════════════════
   UTILIDADES
   ══════════════════════════════════════════════════ */
const brd  = (color = 'CCCCCC') => ({ style: BorderStyle.SINGLE, size: 1, color });
const brds = (color = 'CCCCCC') => ({ top: brd(color), bottom: brd(color), left: brd(color), right: brd(color) });
const noBrd  = () => ({ style: BorderStyle.NONE, size: 0, color: BLANCO });
const noB    = () => ({ top: noBrd(), bottom: noBrd(), left: noBrd(), right: noBrd() });

const spacer = (pts = 120) => new Paragraph({ children: [new TextRun('')], spacing: { before: pts, after: pts } });

const txt = (text, opts = {}) => new TextRun({ text, font: 'Arial', size: 22, color: NEGRO, ...opts });
const mono = (text, opts = {}) => new TextRun({ text, font: 'Courier New', size: 20, color: OSCURO, ...opts });

const p = (text, opts = {}) => new Paragraph({
  children: [txt(text, opts)],
  spacing: { after: 160 },
});

const h1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  children: [new TextRun({ text, font: 'Arial', size: 36, bold: true, color: OSCURO })],
});
const h2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  children: [new TextRun({ text, font: 'Arial', size: 28, bold: true, color: TEAL })],
});
const h3 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  children: [new TextRun({ text, font: 'Arial', size: 24, bold: true, color: GRIS_DARK })],
});

const bullet = (text, bold = false, mono_ = false) => new Paragraph({
  numbering: { reference: 'bullets', level: 0 },
  children: [mono_ ? mono(text, { bold }) : txt(text, { bold })],
  spacing: { after: 80 },
});

const numbered = (text) => new Paragraph({
  numbering: { reference: 'numbers', level: 0 },
  children: [txt(text)],
  spacing: { after: 80 },
});

/** Bloque de código monoespacio con fondo gris */
const codeBlock = (lines) => new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [9360],
  rows: [new TableRow({ children: [new TableCell({
    width: { size: 9360, type: WidthType.DXA },
    borders: brds('AAAAAA'),
    shading: { fill: CODE_BG, type: ShadingType.CLEAR },
    margins: { top: 120, bottom: 120, left: 200, right: 200 },
    children: lines.map(line => new Paragraph({
      children: [mono(line)],
      spacing: { after: 20 },
    })),
  })]})],
});

/** Celda encabezado de tabla */
const th = (text, width) => new TableCell({
  width: { size: width, type: WidthType.DXA },
  borders: brds(TEAL),
  shading: { fill: OSCURO, type: ShadingType.CLEAR },
  margins: { top: 100, bottom: 100, left: 140, right: 140 },
  children: [new Paragraph({
    children: [txt(text, { bold: true, color: BLANCO, size: 20 })],
    alignment: AlignmentType.CENTER,
  })],
});

/** Celda normal de tabla */
const td = (text, width, shade = BLANCO, bold = false, isMono = false) => new TableCell({
  width: { size: width, type: WidthType.DXA },
  borders: brds('CCCCCC'),
  shading: { fill: shade, type: ShadingType.CLEAR },
  margins: { top: 80, bottom: 80, left: 140, right: 140 },
  children: [new Paragraph({
    children: [isMono ? mono(text, { bold }) : txt(text, { bold, size: 20 })],
  })],
});

/** Caja de advertencia */
const warnBox = (titulo, texto, color = AMARILLO, bgColor = 'FDFAF0') => new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [9360],
  rows: [new TableRow({ children: [new TableCell({
    width: { size: 9360, type: WidthType.DXA },
    borders: { top: brd(color), bottom: brd(color), left: { style: BorderStyle.SINGLE, size: 12, color }, right: brd(color) },
    shading: { fill: bgColor, type: ShadingType.CLEAR },
    margins: { top: 100, bottom: 100, left: 180, right: 180 },
    children: [
      new Paragraph({ children: [txt(titulo, { bold: true, size: 20, color: GRIS_DARK })], spacing: { after: 60 } }),
      new Paragraph({ children: [txt(texto, { size: 20 })], spacing: { after: 0 } }),
    ],
  })]})],
});

/** Divisor de sección */
const secDiv = (titulo) => [
  spacer(200),
  new Paragraph({
    children: [txt(titulo, { bold: true, size: 28, color: BLANCO })],
    alignment: AlignmentType.CENTER,
    shading: { fill: OSCURO, type: ShadingType.CLEAR },
    spacing: { before: 0, after: 0 },
    border: { top: { style: BorderStyle.SINGLE, size: 6, color: TEAL }, bottom: { style: BorderStyle.SINGLE, size: 6, color: TEAL } },
  }),
  spacer(160),
];

/* ══════════════════════════════════════════════════
   DOCUMENTO
   ══════════════════════════════════════════════════ */
const doc = new Document({
  numbering: {
    config: [
      { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '-', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: 'numbers', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: 'numbers2', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: 'numbers3', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ],
  },
  styles: {
    default: { document: { run: { font: 'Arial', size: 22, color: NEGRO } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 36, bold: true, font: 'Arial', color: OSCURO },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0,
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: TEAL, space: 4 } } } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: 'Arial', color: TEAL },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 24, bold: true, font: 'Arial', color: GRIS_DARK },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
    ],
  },

  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1260, bottom: 1440, left: 1260 },
      },
    },
    headers: {
      default: new Header({ children: [new Paragraph({
        children: [
          txt('FERCADI — Manual Tecnico del Sistema', { bold: true, size: 18, color: OSCURO }),
          txt('   |   Confidencial', { size: 18, color: '888888' }),
        ],
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: TEAL, space: 2 } },
        spacing: { after: 0 },
      })] }),
    },
    footers: {
      default: new Footer({ children: [new Paragraph({
        children: [
          txt('v1.0  Junio 2026  ', { size: 18, color: '888888' }),
          txt('Pagina ', { size: 18, color: '888888' }),
          new TextRun({ children: [PageNumber.CURRENT], size: 18, font: 'Arial', color: '888888' }),
          txt(' de ', { size: 18, color: '888888' }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, font: 'Arial', color: '888888' }),
        ],
        alignment: AlignmentType.RIGHT,
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: TEAL, space: 2 } },
      })] }),
    },

    children: [

      /* ════════════════════════════════════════════
         PORTADA
         ════════════════════════════════════════════ */
      spacer(600),
      new Paragraph({ children: [txt('FERCADI', { bold: true, size: 80, color: OSCURO })], alignment: AlignmentType.CENTER }),
      new Paragraph({ children: [txt('fercadi-next', { size: 32, color: TEAL, font: 'Courier New' })], alignment: AlignmentType.CENTER, spacing: { after: 60 } }),
      new Paragraph({ children: [txt('────────────────────────────────', { size: 22, color: TEAL })], alignment: AlignmentType.CENTER, spacing: { after: 80 } }),
      new Paragraph({ children: [txt('MANUAL TECNICO DEL SISTEMA', { bold: true, size: 40, color: NEGRO })], alignment: AlignmentType.CENTER, spacing: { after: 80 } }),
      new Paragraph({ children: [txt('Arquitectura, API, Base de datos y Despliegue', { size: 26, color: '555555' })], alignment: AlignmentType.CENTER, spacing: { after: 80 } }),
      spacer(500),
      new Paragraph({ children: [txt('Version 1.0  |  Junio 2026', { size: 22, color: '888888', italics: true })], alignment: AlignmentType.CENTER }),
      new Paragraph({ children: [txt('Next.js  +  PostgreSQL (Supabase)  +  Vercel  +  Groq AI', { size: 20, color: '888888', font: 'Courier New' })], alignment: AlignmentType.CENTER }),

      new Paragraph({ children: [new PageBreak()] }),

      /* ════════════════════════════════════════════
         TABLA DE CONTENIDO
         ════════════════════════════════════════════ */
      h1('Contenido'),
      new TableOfContents('Tabla de contenido', { hyperlink: true, headingStyleRange: '1-3' }),
      new Paragraph({ children: [new PageBreak()] }),

      /* ════════════════════════════════════════════
         1. VISION GENERAL
         ════════════════════════════════════════════ */
      h1('1. Vision general del sistema'),
      p('fercadi-next es una aplicacion web full-stack construida sobre Next.js App Router. Combina renderizado en el servidor (SSR) para el catalogo publico con componentes cliente para interactividad (carrito, autenticacion, comentarios). La base de datos es PostgreSQL alojada en Supabase y el despliegue se realiza en Vercel.'),
      spacer(80),

      h2('1.1 Diagrama de arquitectura (capas)'),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2200, 7160],
        rows: [
          new TableRow({ children: [th('Capa', 2200), th('Tecnologia / Descripcion', 7160)] }),
          new TableRow({ children: [td('Presentacion', 2200, GRIS, true), td('Next.js App Router + React 19. Componentes .tsx con CSS Modules. Sin Tailwind.', 7160)] }),
          new TableRow({ children: [td('Estado global', 2200, BLANCO, true), td('React Context: AuthContext (usuario) + CartContext (carrito). Persistencia en localStorage.', 7160)] }),
          new TableRow({ children: [td('API', 2200, GRIS, true), td('Next.js Route Handlers en /src/app/api/**. Formato JSON. Validacion manual de inputs.', 7160)] }),
          new TableRow({ children: [td('Negocio / Lib', 2200, BLANCO, true), td('src/lib/: db.ts, productos.ts, tips.ts, admin.ts, imagen.ts, searchIndex.ts', 7160)] }),
          new TableRow({ children: [td('Base de datos', 2200, GRIS, true), td('PostgreSQL 15 en Supabase (pool de 10 conexiones). Adaptador propio en lib/db.ts.', 7160)] }),
          new TableRow({ children: [td('IA externa', 2200, BLANCO, true), td('Groq API (Llama 3.3 70B) via fetch. Solo para generacion de tips en el panel admin.', 7160)] }),
          new TableRow({ children: [td('Despliegue', 2200, GRIS, true), td('Vercel (serverless). CDN global. Variables de entorno configuradas en el dashboard.', 7160)] }),
        ],
      }),
      spacer(120),

      h2('1.2 Patron de renderizado'),
      p('Las paginas del catalogo publico usan export const dynamic = "force-dynamic" para forzar SSR en cada peticion y evitar que Vercel intente pre-renderizarlas en build time (lo que causaria errores de conexion a la BD).'),
      p('Los componentes interactivos (carrito, comentarios, buscador, header) son Client Components marcados con "use client" y se hidratan en el navegador.'),
      new Paragraph({ children: [new PageBreak()] }),

      /* ════════════════════════════════════════════
         2. STACK TECNOLOGICO
         ════════════════════════════════════════════ */
      ...secDiv('STACK TECNOLOGICO Y DEPENDENCIAS'),
      h1('2. Stack tecnologico'),

      h2('2.1 Dependencias principales'),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2800, 1800, 4760],
        rows: [
          new TableRow({ children: [th('Paquete', 2800), th('Version', 1800), th('Proposito', 4760)] }),
          new TableRow({ children: [td('next', 2800, GRIS, false, true), td('^16.2.4', 1800, GRIS), td('Framework principal. App Router, SSR, Image optimization.', 4760)] }),
          new TableRow({ children: [td('react / react-dom', 2800, BLANCO, false, true), td('^19.0.0', 1800), td('UI reactivo. Versión 19 — sin JSX global namespace.', 4760)] }),
          new TableRow({ children: [td('pg', 2800, GRIS, false, true), td('^8.x', 1800, GRIS), td('Driver PostgreSQL para Node.js. Pool de conexiones.', 4760)] }),
          new TableRow({ children: [td('typescript', 2800, BLANCO, false, true), td('^5.x', 1800), td('Tipado estatico. tsconfig con strict mode.', 4760)] }),
          new TableRow({ children: [td('docx', 2800, GRIS, false, true), td('^9.7.1', 1800, GRIS), td('Generacion de documentos Word (reportes).', 4760)] }),
        ],
      }),
      spacer(120),

      h2('2.2 Servicios externos'),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2200, 2600, 4560],
        rows: [
          new TableRow({ children: [th('Servicio', 2200), th('Plan', 2600), th('Uso en el proyecto', 4560)] }),
          new TableRow({ children: [td('Supabase', 2200, GRIS, true), td('Free / Pro', 2600, GRIS), td('Hosting de PostgreSQL. Conexion via DATABASE_URL con SSL.', 4560)] }),
          new TableRow({ children: [td('Vercel', 2200, BLANCO, true), td('Hobby / Pro', 2600), td('Despliegue serverless, CDN, env vars, dominio.', 4560)] }),
          new TableRow({ children: [td('Groq', 2200, GRIS, true), td('Free tier', 2600, GRIS), td('Generacion de contenido con Llama 3.3 70B. 14,400 req/dia.', 4560)] }),
          new TableRow({ children: [td('Font Awesome', 2200, BLANCO, true), td('Free CDN', 2600), td('Iconografia. Cargado via <link> en layout.tsx.', 4560)] }),
        ],
      }),
      spacer(120),
      new Paragraph({ children: [new PageBreak()] }),

      /* ════════════════════════════════════════════
         3. ESTRUCTURA DE DIRECTORIOS
         ════════════════════════════════════════════ */
      ...secDiv('ESTRUCTURA DEL PROYECTO'),
      h1('3. Estructura de directorios'),
      p('El proyecto sigue la convencion de directorios de Next.js App Router:'),
      codeBlock([
        'fercadi-next/',
        '  src/',
        '    app/                      <- Rutas de Next.js (pages + API routes)',
        '      (public pages)          <- concretos/, textucos/, materiales/, ferreteria/',
        '      admin/                  <- Panel backoffice (guard: solo rol=admin)',
        '      api/                    <- Route Handlers (REST)',
        '        comentarios/          <- GET + POST comentarios de productos',
        '        admin/                <- productos, tips, pedidos, importar',
        '        search/               <- Busqueda global',
        '        auth/                 <- Login, registro',
        '      tips/                   <- Articulos publicos',
        '      layout.tsx              <- Root layout (providers, fuentes, head)',
        '      page.tsx                <- Home',
        '    components/               <- Componentes reutilizables',
        '    context/                  <- AuthContext, CartContext',
        '    data/                     <- navigation.ts (items del menu)',
        '    lib/                      <- Logica de negocio y acceso a BD',
        '    styles/                   <- CSS Modules por componente/pagina',
        '  public/                     <- Assets estaticos (imagenes, icons)',
        '    productos/                <- Imagenes del catalogo',
        '  reportes/                   <- Documentos generados (Word)',
        '  next.config.ts              <- Config Next.js (remotePatterns, origins)',
        '  .env.local                  <- Variables de entorno locales (no se commitea)',
        '  CLAUDE.md                   <- Documentacion interna para el asistente IA',
      ]),
      spacer(120),
      new Paragraph({ children: [new PageBreak()] }),

      /* ════════════════════════════════════════════
         4. BASE DE DATOS
         ════════════════════════════════════════════ */
      ...secDiv('BASE DE DATOS'),
      h1('4. Esquema de base de datos'),
      p('Motor: PostgreSQL 15 en Supabase. Todas las tablas estan en el schema public. El adaptador lib/db.ts convierte los placeholders ? a $1, $2... de PostgreSQL y agrega RETURNING * automaticamente a los INSERT.'),
      spacer(80),

      h2('4.1 Tabla: productos'),
      p('Tabla principal del catalogo. Todas las secciones (concretos, textucos, ferreteria) comparten esta tabla, diferenciadas por la columna seccion.'),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2400, 2000, 1400, 3560],
        rows: [
          new TableRow({ children: [th('Columna', 2400), th('Tipo', 2000), th('Nulo', 1400), th('Descripcion', 3560)] }),
          new TableRow({ children: [td('id', 2400, GRIS, true, true), td('SERIAL', 2000, GRIS, false, true), td('NO', 1400, GRIS), td('PK autoincremental', 3560)] }),
          new TableRow({ children: [td('nombre', 2400, BLANCO, false, true), td('VARCHAR(255)', 2000, BLANCO, false, true), td('NO', 1400), td('Nombre visible del producto', 3560)] }),
          new TableRow({ children: [td('slug', 2400, GRIS, false, true), td('VARCHAR(255)', 2000, GRIS, false, true), td('NO', 1400, GRIS), td('URL amigable. Unico dentro de seccion+categoria.', 3560)] }),
          new TableRow({ children: [td('seccion', 2400, BLANCO, false, true), td('VARCHAR(50)', 2000, BLANCO, false, true), td('NO', 1400), td('concretos | textucos | ferreteria', 3560)] }),
          new TableRow({ children: [td('categoria_slug', 2400, GRIS, false, true), td('VARCHAR(100)', 2000, GRIS, false, true), td('NO', 1400, GRIS), td('Slug de la categoria a la que pertenece', 3560)] }),
          new TableRow({ children: [td('categoria_nombre', 2400, BLANCO, false, true), td('VARCHAR(100)', 2000, BLANCO, false, true), td('NO', 1400), td('Nombre legible de la categoria', 3560)] }),
          new TableRow({ children: [td('descripcion', 2400, GRIS, false, true), td('TEXT', 2000, GRIS, false, true), td('NO', 1400, GRIS), td('Descripcion principal del producto', 3560)] }),
          new TableRow({ children: [td('descripcion2', 2400, BLANCO, false, true), td('TEXT', 2000, BLANCO, false, true), td('SI', 1400), td('Texto tecnico adicional (banda azul)', 3560)] }),
          new TableRow({ children: [td('precio', 2400, GRIS, false, true), td('NUMERIC(10,2)', 2000, GRIS, false, true), td('NO', 1400, GRIS), td('Precio publico. 0 = requiere cotizacion.', 3560)] }),
          new TableRow({ children: [td('imagen_url', 2400, BLANCO, false, true), td('VARCHAR(500)', 2000, BLANCO, false, true), td('SI', 1400), td('Ruta relativa /productos/... o URL externa', 3560)] }),
          new TableRow({ children: [td('marca', 2400, GRIS, false, true), td('VARCHAR(100)', 2000, GRIS, false, true), td('SI', 1400, GRIS), td('Solo ferreteria. Para filtros.', 3560)] }),
          new TableRow({ children: [td('unidad', 2400, BLANCO, false, true), td('VARCHAR(50)', 2000, BLANCO, false, true), td('SI', 1400), td('Unidad de medida (pieza, kg, m2, etc.)', 3560)] }),
          new TableRow({ children: [td('activo', 2400, GRIS, false, true), td('SMALLINT', 2000, GRIS, false, true), td('NO', 1400, GRIS), td('1 = visible, 0 = oculto al publico', 3560)] }),
        ],
      }),
      spacer(120),

      h2('4.2 Tabla: usuarios'),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2400, 2000, 1400, 3560],
        rows: [
          new TableRow({ children: [th('Columna', 2400), th('Tipo', 2000), th('Nulo', 1400), th('Descripcion', 3560)] }),
          new TableRow({ children: [td('id', 2400, GRIS, true, true), td('SERIAL', 2000, GRIS, false, true), td('NO', 1400, GRIS), td('PK autoincremental', 3560)] }),
          new TableRow({ children: [td('nombre', 2400, BLANCO, false, true), td('VARCHAR(100)', 2000, BLANCO, false, true), td('NO', 1400), td('Nombre completo del usuario', 3560)] }),
          new TableRow({ children: [td('correo', 2400, GRIS, false, true), td('VARCHAR(200)', 2000, GRIS, false, true), td('NO', 1400, GRIS), td('Email unico (UNIQUE constraint)', 3560)] }),
          new TableRow({ children: [td('password_hash', 2400, BLANCO, false, true), td('TEXT', 2000, BLANCO, false, true), td('NO', 1400), td('Hash bcrypt de la contrasena', 3560)] }),
          new TableRow({ children: [td('rol', 2400, GRIS, false, true), td("VARCHAR(20)", 2000, GRIS, false, true), td('NO', 1400, GRIS), td("'usuario' | 'admin'. Determina acceso al panel.", 3560)] }),
          new TableRow({ children: [td('created_at', 2400, BLANCO, false, true), td('TIMESTAMPTZ', 2000, BLANCO, false, true), td('NO', 1400), td('Fecha de registro. DEFAULT NOW().', 3560)] }),
        ],
      }),
      spacer(120),

      h2('4.3 Tabla: tips'),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2400, 2000, 1400, 3560],
        rows: [
          new TableRow({ children: [th('Columna', 2400), th('Tipo', 2000), th('Nulo', 1400), th('Descripcion', 3560)] }),
          new TableRow({ children: [td('id', 2400, GRIS, true, true), td('SERIAL', 2000, GRIS, false, true), td('NO', 1400, GRIS), td('PK autoincremental', 3560)] }),
          new TableRow({ children: [td('slug', 2400, BLANCO, false, true), td('VARCHAR(255)', 2000, BLANCO, false, true), td('NO', 1400), td('UNIQUE. URL publica: /tips/{slug}', 3560)] }),
          new TableRow({ children: [td('titulo', 2400, GRIS, false, true), td('VARCHAR(300)', 2000, GRIS, false, true), td('NO', 1400, GRIS), td('Titulo del articulo', 3560)] }),
          new TableRow({ children: [td('descripcion', 2400, BLANCO, false, true), td('TEXT', 2000, BLANCO, false, true), td('SI', 1400), td('Resumen corto para la tarjeta del listado', 3560)] }),
          new TableRow({ children: [td('imagen', 2400, GRIS, false, true), td('VARCHAR(500)', 2000, GRIS, false, true), td('SI', 1400, GRIS), td('URL o ruta de imagen de portada', 3560)] }),
          new TableRow({ children: [td('contenido', 2400, BLANCO, false, true), td('TEXT', 2000, BLANCO, false, true), td('SI', 1400), td('Cuerpo completo en Markdown simplificado', 3560)] }),
          new TableRow({ children: [td('activo', 2400, GRIS, false, true), td('SMALLINT', 2000, GRIS, false, true), td('NO', 1400, GRIS), td('1 = publicado, 0 = borrador', 3560)] }),
          new TableRow({ children: [td('created_at', 2400, BLANCO, false, true), td('TIMESTAMPTZ', 2000, BLANCO, false, true), td('NO', 1400), td('DEFAULT NOW()', 3560)] }),
          new TableRow({ children: [td('updated_at', 2400, GRIS, false, true), td('TIMESTAMPTZ', 2000, GRIS, false, true), td('NO', 1400, GRIS), td('DEFAULT NOW()', 3560)] }),
        ],
      }),
      spacer(120),

      h2('4.4 Tabla: materiales_categorias'),
      warnBox('Atencion — PK no numerica', 'Esta tabla usa slug (texto) como PRIMARY KEY en lugar de un id serial. Cualquier query que use ORDER BY debe referenciar nombre u otra columna — NO id (no existe).'),
      spacer(80),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2400, 2000, 1400, 3560],
        rows: [
          new TableRow({ children: [th('Columna', 2400), th('Tipo', 2000), th('Nulo', 1400), th('Descripcion', 3560)] }),
          new TableRow({ children: [td('slug', 2400, GRIS, true, true), td('VARCHAR(100)', 2000, GRIS, false, true), td('NO', 1400, GRIS), td('PRIMARY KEY textual', 3560)] }),
          new TableRow({ children: [td('nombre', 2400, BLANCO, false, true), td('VARCHAR(150)', 2000, BLANCO, false, true), td('NO', 1400), td('Nombre de la categoria de material', 3560)] }),
          new TableRow({ children: [td('descripcion', 2400, GRIS, false, true), td('TEXT', 2000, GRIS, false, true), td('SI', 1400, GRIS), td('Descripcion de la categoria', 3560)] }),
          new TableRow({ children: [td('marcas', 2400, BLANCO, false, true), td('JSONB', 2000, BLANCO, false, true), td('SI', 1400), td('Array JSON: [{nombre, logo}]. Deserializado en lib/productos.ts.', 3560)] }),
          new TableRow({ children: [td('activo', 2400, GRIS, false, true), td('SMALLINT', 2000, GRIS, false, true), td('NO', 1400, GRIS), td('1 = visible', 3560)] }),
        ],
      }),
      spacer(120),

      h2('4.5 Tabla: comentarios_productos'),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2400, 2000, 1400, 3560],
        rows: [
          new TableRow({ children: [th('Columna', 2400), th('Tipo', 2000), th('Nulo', 1400), th('Descripcion', 3560)] }),
          new TableRow({ children: [td('id', 2400, GRIS, true, true), td('SERIAL', 2000, GRIS, false, true), td('NO', 1400, GRIS), td('PK autoincremental', 3560)] }),
          new TableRow({ children: [td('producto_id', 2400, BLANCO, false, true), td('INTEGER', 2000, BLANCO, false, true), td('NO', 1400), td('FK a productos.id (logica, sin constraint formal)', 3560)] }),
          new TableRow({ children: [td('usuario_id', 2400, GRIS, false, true), td('INTEGER', 2000, GRIS, false, true), td('NO', 1400, GRIS), td('FK a usuarios.id', 3560)] }),
          new TableRow({ children: [td('nombre', 2400, BLANCO, false, true), td('VARCHAR(100)', 2000, BLANCO, false, true), td('NO', 1400), td('Desnormalizado desde usuarios.nombre al insertar', 3560)] }),
          new TableRow({ children: [td('comentario', 2400, GRIS, false, true), td('TEXT', 2000, GRIS, false, true), td('NO', 1400, GRIS), td('Texto de la opinion (10 a 500 chars, validado en API)', 3560)] }),
          new TableRow({ children: [td('calificacion', 2400, BLANCO, false, true), td('SMALLINT', 2000, BLANCO, false, true), td('NO', 1400), td('CHECK (calificacion BETWEEN 1 AND 5)', 3560)] }),
          new TableRow({ children: [td('creado_en', 2400, GRIS, false, true), td('TIMESTAMPTZ', 2000, GRIS, false, true), td('NO', 1400, GRIS), td('DEFAULT NOW()', 3560)] }),
        ],
      }),
      spacer(80),
      codeBlock([
        '-- Indice para acelerar consultas por producto:',
        'CREATE INDEX idx_comentarios_producto',
        '  ON comentarios_productos (producto_id);',
      ]),
      spacer(120),
      new Paragraph({ children: [new PageBreak()] }),

      /* ════════════════════════════════════════════
         5. VARIABLES DE ENTORNO
         ════════════════════════════════════════════ */
      ...secDiv('VARIABLES DE ENTORNO Y CONFIGURACION'),
      h1('5. Variables de entorno'),
      p('Las variables se definen en .env.local para desarrollo local y en el dashboard de Vercel para produccion. El archivo .env.local esta excluido de git via .gitignore (patron *.env*).'),
      spacer(80),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2800, 1600, 4960],
        rows: [
          new TableRow({ children: [th('Variable', 2800), th('Requerida', 1600), th('Descripcion', 4960)] }),
          new TableRow({ children: [td('DATABASE_URL', 2800, GRIS, false, true), td('SI', 1600, GRIS), td('Connection string PostgreSQL de Supabase. Formato: postgresql://postgres.[ref]:[pass]@host:6543/postgres', 4960)] }),
          new TableRow({ children: [td('GROQ_API_KEY', 2800, BLANCO, false, true), td('SI*', 1600), td('Clave de API de Groq para la generacion de tips con IA. (*Solo requerida para la funcion de IA)', 4960)] }),
        ],
      }),
      spacer(80),
      warnBox('Seguridad critica', 'Nunca incluir credenciales reales en CLAUDE.md, README.md o cualquier archivo trackeado por git. El Secret Scanning de GitHub bloquea los push que contengan claves de API reales.'),
      spacer(120),

      h2('5.1 next.config.ts — configuracion relevante'),
      codeBlock([
        'const nextConfig: NextConfig = {',
        '  // IPs locales permitidas para desarrollo en LAN',
        '  allowedDevOrigins: ["192.168.1.23"],',
        '',
        '  images: {',
        '    // Acepta imagenes de CUALQUIER dominio externo',
        '    remotePatterns: [',
        '      { protocol: "https", hostname: "**" },',
        '      { protocol: "http",  hostname: "**" },',
        '    ],',
        '    formats: ["image/avif", "image/webp"],',
        '  },',
        '};',
      ]),
      spacer(120),
      new Paragraph({ children: [new PageBreak()] }),

      /* ════════════════════════════════════════════
         6. API ROUTES
         ════════════════════════════════════════════ */
      ...secDiv('DOCUMENTACION DE LA API'),
      h1('6. Endpoints de la API'),
      p('Todos los endpoints son Next.js Route Handlers en src/app/api/. Retornan JSON. La autenticacion usa el header x-usuario-id que se verifica contra la tabla usuarios en la BD.'),
      spacer(80),

      h2('6.1 Autenticacion (publica)'),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [900, 2200, 2060, 4200],
        rows: [
          new TableRow({ children: [th('Metodo', 900), th('Ruta', 2200), th('Auth', 2060), th('Descripcion', 4200)] }),
          new TableRow({ children: [td('POST', 900, GRIS), td('/api/auth/login', 2200, GRIS, false, true), td('Ninguna', 2060, GRIS), td('Login. Body: {correo, password}. Retorna objeto usuario con rol.', 4200)] }),
          new TableRow({ children: [td('POST', 900, BLANCO), td('/api/auth/registro', 2200, BLANCO, false, true), td('Ninguna', 2060), td('Registro. Body: {nombre, correo, password}. Hashea password con bcrypt.', 4200)] }),
        ],
      }),
      spacer(120),

      h2('6.2 Productos (admin)'),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [900, 2500, 2060, 3900],
        rows: [
          new TableRow({ children: [th('Metodo', 900), th('Ruta', 2500), th('Auth', 2060), th('Descripcion', 3900)] }),
          new TableRow({ children: [td('GET', 900, GRIS), td('/api/admin/productos', 2500, GRIS, false, true), td('admin', 2060, GRIS), td('Lista paginada con busqueda ILIKE. Params: q, page, limit, seccion.', 3900)] }),
          new TableRow({ children: [td('POST', 900, BLANCO), td('/api/admin/productos', 2500, BLANCO, false, true), td('admin', 2060), td('Crear producto. Body: todos los campos del producto.', 3900)] }),
          new TableRow({ children: [td('PUT', 900, GRIS), td('/api/admin/productos/[id]', 2500, GRIS, false, true), td('admin', 2060, GRIS), td('Actualizar producto por id.', 3900)] }),
          new TableRow({ children: [td('DELETE', 900, BLANCO), td('/api/admin/productos/[id]', 2500, BLANCO, false, true), td('admin', 2060), td('Desactivar producto (activo=0, no elimina fisicamente).', 3900)] }),
          new TableRow({ children: [td('POST', 900, GRIS), td('/api/admin/importar', 2500, GRIS, false, true), td('admin', 2060, GRIS), td('Importacion masiva desde CSV. Procesa en lotes, retorna estadisticas.', 3900)] }),
        ],
      }),
      spacer(120),

      h2('6.3 Tips (admin)'),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [900, 2500, 2060, 3900],
        rows: [
          new TableRow({ children: [th('Metodo', 900), th('Ruta', 2500), th('Auth', 2060), th('Descripcion', 3900)] }),
          new TableRow({ children: [td('GET', 900, GRIS), td('/api/admin/tips', 2500, GRIS, false, true), td('admin', 2060, GRIS), td('Lista paginada de todos los tips (activos e inactivos).', 3900)] }),
          new TableRow({ children: [td('POST', 900, BLANCO), td('/api/admin/tips', 2500, BLANCO, false, true), td('admin', 2060), td('Crear tip. Valida slug unico. Body: {slug, titulo, descripcion, imagen, contenido, activo}.', 3900)] }),
          new TableRow({ children: [td('PUT', 900, GRIS), td('/api/admin/tips/[id]', 2500, GRIS, false, true), td('admin', 2060, GRIS), td('Editar tip existente.', 3900)] }),
          new TableRow({ children: [td('DELETE', 900, BLANCO), td('/api/admin/tips/[id]', 2500, BLANCO, false, true), td('admin', 2060), td('Eliminar o desactivar tip.', 3900)] }),
          new TableRow({ children: [td('POST', 900, GRIS), td('/api/admin/tips/ia', 2500, GRIS, false, true), td('admin', 2060, GRIS), td('Genera tip con IA (Groq). Body: {tema}. Retorna {titulo, descripcion, contenido}.', 3900)] }),
        ],
      }),
      spacer(120),

      h2('6.4 Pedidos (admin)'),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [900, 2500, 2060, 3900],
        rows: [
          new TableRow({ children: [th('Metodo', 900), th('Ruta', 2500), th('Auth', 2060), th('Descripcion', 3900)] }),
          new TableRow({ children: [td('GET', 900, GRIS), td('/api/admin/pedidos', 2500, GRIS, false, true), td('admin', 2060, GRIS), td('Lista paginada de pedidos con busqueda ILIKE.', 3900)] }),
          new TableRow({ children: [td('GET', 900, BLANCO), td('/api/admin/pedidos/[id]', 2500, BLANCO, false, true), td('admin', 2060), td('Detalle completo de un pedido con sus lineas.', 3900)] }),
          new TableRow({ children: [td('PATCH', 900, GRIS), td('/api/admin/pedidos/[id]', 2500, GRIS, false, true), td('admin', 2060, GRIS), td('Actualizar estado del pedido.', 3900)] }),
        ],
      }),
      spacer(120),

      h2('6.5 Comentarios (publico/usuario)'),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [900, 2500, 2060, 3900],
        rows: [
          new TableRow({ children: [th('Metodo', 900), th('Ruta', 2500), th('Auth', 2060), th('Descripcion', 3900)] }),
          new TableRow({ children: [td('GET', 900, GRIS), td('/api/comentarios', 2500, GRIS, false, true), td('Ninguna', 2060, GRIS), td('Comentarios de un producto. Param: ?producto_id=X', 3900)] }),
          new TableRow({ children: [td('POST', 900, BLANCO), td('/api/comentarios', 2500, BLANCO, false, true), td('usuario', 2060), td('Crear comentario. Header x-usuario-id. Body: {producto_id, comentario, calificacion}. Un comentario por usuario por producto.', 3900)] }),
        ],
      }),
      spacer(120),

      h2('6.6 Busqueda global'),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [900, 2500, 2060, 3900],
        rows: [
          new TableRow({ children: [th('Metodo', 900), th('Ruta', 2500), th('Auth', 2060), th('Descripcion', 3900)] }),
          new TableRow({ children: [td('GET', 900, GRIS), td('/api/search', 2500, GRIS, false, true), td('Ninguna', 2060, GRIS), td('Busqueda full-text en nombre y descripcion de productos. Param: ?q=texto. Usa ILIKE (case-insensitive).', 3900)] }),
        ],
      }),
      spacer(120),
      new Paragraph({ children: [new PageBreak()] }),

      /* ════════════════════════════════════════════
         7. COMPONENTES
         ════════════════════════════════════════════ */
      ...secDiv('COMPONENTES Y ESTADO GLOBAL'),
      h1('7. Componentes principales'),
      spacer(60),

      h2('7.1 Mapa de componentes'),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2800, 1400, 5160],
        rows: [
          new TableRow({ children: [th('Componente', 2800), th('Tipo', 1400), th('Responsabilidad', 5160)] }),
          new TableRow({ children: [td('Header', 2800, GRIS, true), td('Client', 1400, GRIS), td('Navbar con menu, buscador, carrito badge, login/logout, link admin.', 5160)] }),
          new TableRow({ children: [td('Footer', 2800, BLANCO, true), td('Server', 1400), td('Pie de pagina estatico con enlaces y datos de contacto.', 5160)] }),
          new TableRow({ children: [td('ProductoDetalle', 2800, GRIS, true), td('Server', 1400, GRIS), td('Layout 2 columnas: info (titulo, desc, botones) + imagen. Acepta breadcrumb como prop.', 5160)] }),
          new TableRow({ children: [td('BtnAgregarCarrito', 2800, BLANCO, true), td('Client', 1400), td('Boton trigger + modal de confirmacion con selector de cantidad. Llama a CartContext.addToCart.', 5160)] }),
          new TableRow({ children: [td('Cart', 2800, GRIS, true), td('Client', 1400, GRIS), td('Drawer lateral del carrito. Lista items, subtotales, boton de checkout.', 5160)] }),
          new TableRow({ children: [td('ComentariosProducto', 2800, BLANCO, true), td('Client', 1400), td('Lista comentarios (GET /api/comentarios) + formulario con estrellas. Detecta si el usuario ya comento.', 5160)] }),
          new TableRow({ children: [td('Buscador', 2800, GRIS, true), td('Client', 1400, GRIS), td('Input de busqueda con debounce. Llama a /api/search y muestra resultados en dropdown.', 5160)] }),
          new TableRow({ children: [td('CalculadoraVolumen', 2800, BLANCO, true), td('Client', 1400), td('Calculadora interactiva para concretos. Formas: cubo, cilindro, losa, viga.', 5160)] }),
          new TableRow({ children: [td('Carousel', 2800, GRIS, true), td('Client', 1400, GRIS), td('Carrusel de imagenes para la pagina principal.', 5160)] }),
          new TableRow({ children: [td('ColorPicker', 2800, BLANCO, true), td('Client', 1400), td('Selector de colores para productos de pintura.', 5160)] }),
          new TableRow({ children: [td('Paginador', 2800, GRIS, true), td('Client', 1400, GRIS), td('Navegacion de paginas para el catalogo de ferreteria.', 5160)] }),
          new TableRow({ children: [td('ProductCard', 2800, BLANCO, true), td('Server', 1400), td('Tarjeta de producto en listados de categorias.', 5160)] }),
          new TableRow({ children: [td('ContactForm', 2800, GRIS, true), td('Client', 1400, GRIS), td('Formulario de contacto con validacion y envio.', 5160)] }),
          new TableRow({ children: [td('admin/ProductoForm', 2800, BLANCO, true), td('Client', 1400), td('Formulario completo de alta/edicion de productos en el admin.', 5160)] }),
        ],
      }),
      spacer(120),

      h2('7.2 AuthContext — flujo de autenticacion'),
      p('El contexto de autenticacion se implementa en src/context/AuthContext.tsx y se provee en el root layout. No usa sesiones en el servidor ni JWT; utiliza localStorage para persistencia entre recargas.'),
      codeBlock([
        'Flujo de login:',
        '  1. Usuario envia credenciales -> POST /api/auth/login',
        '  2. Servidor verifica password_hash con bcrypt',
        '  3. Si ok, retorna objeto {id, nombre, correo, rol}',
        '  4. AuthContext.login() guarda en state + localStorage (key: fercadi_user)',
        '  5. isAdmin = user.rol === "admin"',
        '',
        'Flujo de rehidratacion:',
        '  1. AuthProvider monta -> useEffect lee localStorage',
        '  2. Si hay datos, setUser() los restaura',
        '  3. El Header ya muestra el nombre del usuario sin peticion adicional',
        '',
        'Flujo de logout:',
        '  1. AuthContext.logout() -> setUser(null) + localStorage.removeItem',
        '  2. El guard de /admin detecta !user y redirige a /login',
      ]),
      spacer(120),

      h2('7.3 CartContext — gestion del carrito'),
      p('Persistencia en localStorage bajo la clave fercadi_cart. El array de CartItem[] se serializa en cada cambio via useEffect.'),
      codeBlock([
        'CartItem {',
        '  id: string        // String del id numerico del producto',
        '  nombre: string',
        '  opciones?: string // Variante seleccionada',
        '  precio: number',
        '  cantidad: number  // Minimo 1, maximo 99',
        '  imagen?: string',
        '}',
        '',
        'addToCart(producto, cantidad):',
        '  - Si el id ya existe en el carrito: incrementa cantidad',
        '  - Si no existe: agrega nueva linea',
        '  - Siempre llama setIsOpen(true) para abrir el drawer',
      ]),
      spacer(120),
      new Paragraph({ children: [new PageBreak()] }),

      /* ════════════════════════════════════════════
         8. LIB — CAPA DE NEGOCIO
         ════════════════════════════════════════════ */
      ...secDiv('CAPA DE NEGOCIO (LIB)'),
      h1('8. Modulos de la capa lib/'),
      spacer(60),

      h2('8.1 lib/db.ts — adaptador PostgreSQL'),
      p('Crea un Pool de pg con max 10 conexiones. Expone db.query() y db.getConnection() con la misma interfaz que mysql2/promise para facilitar la migracion historica del proyecto.'),
      codeBlock([
        'Conversiones automaticas:',
        '  ?  ->  $1, $2, $3...   (placeholders PostgreSQL)',
        '  INSERT ... -> agrega RETURNING * al final',
        '  result.rows[0].id -> result.insertId (compatibilidad)',
        '',
        'db.query(sql, params)     -> Promise<[rows[], fields[]]>',
        'db.getConnection()        -> { query, beginTransaction,',
        '                              commit, rollback, release }',
      ]),
      spacer(80),
      warnBox('SSL requerido', 'La conexion a Supabase requiere SSL. El pool usa { rejectUnauthorized: false } porque Supabase usa certificados de pooler que no siempre pasan la validacion estricta.'),
      spacer(120),

      h2('8.2 lib/admin.ts — guard de autorizacion'),
      p('La funcion requerirAdmin(request) verifica que el header x-usuario-id corresponda a un usuario con rol="admin" en la BD. Se usa al inicio de cada route handler del admin.'),
      codeBlock([
        'Orden de busqueda del usuario_id:',
        '  1. Header x-usuario-id  (preferido)',
        '  2. Query string ?usuarioId=X',
        '',
        'Retorna:',
        '  { ok: true, usuario: {id, nombre, correo, rol} }',
        '  { ok: false, response: NextResponse (401 o 403) }',
        '',
        'Uso en un route handler:',
        '  const auth = await requerirAdmin(req);',
        '  if (!auth.ok) return auth.response;',
        '  // ... auth.usuario disponible aqui',
      ]),
      spacer(120),

      h2('8.3 lib/imagen.ts — resolucion de imagenes'),
      p('Centraliza la logica de resolucion de rutas de imagen para next/Image, manejando 3 casos:'),
      bullet('URLs externas (https://...): se pasan tal cual.'),
      bullet('Rutas absolutas (/productos/...): se pasan tal cual.'),
      bullet('Rutas relativas (productos/...): se prefija / automaticamente.'),
      bullet('Valores vacios o nulos: retorna undefined (el componente decide el placeholder).'),
      spacer(120),

      h2('8.4 Generacion de tips con IA (Groq)'),
      p('El endpoint POST /api/admin/tips/ia llama a Groq con el modelo llama-3.3-70b-versatile. El prompt fuerza respuesta en JSON con reglas estrictas de formato Markdown para el contenido.'),
      codeBlock([
        'Flujo completo:',
        '  1. Validar admin (requerirAdmin)',
        '  2. Leer { tema } del body',
        '  3. POST https://api.groq.com/openai/v1/chat/completions',
        '     model: llama-3.3-70b-versatile',
        '     max_tokens: 2048, temperature: 0.7',
        '  4. Extraer textoRaw = choices[0].message.content',
        '  5. Limpiar bloques ```json si existen',
        '  6. Sanitizar caracteres de control en strings JSON:',
        '     regex /"(?:[^"\\\\]|\\\\.)*"/g -> escapar \\n \\r \\t',
        '  7. JSON.parse(jsonLimpio)',
        '  8. Retornar { ok, titulo, descripcion, contenido }',
        '',
        'Nota: el flag "s" (dotAll) NO se usa en el regex porque',
        '      el target de compilacion de Vercel puede ser < ES2018.',
      ]),
      spacer(120),
      new Paragraph({ children: [new PageBreak()] }),

      /* ════════════════════════════════════════════
         9. RENDERIZADO MARKDOWN
         ════════════════════════════════════════════ */
      ...secDiv('RENDERIZADO Y ESTILOS'),
      h1('9. Parser Markdown de tips'),
      p('El contenido de los tips se almacena en texto plano con sintaxis Markdown simplificada. Se renderiza en src/app/tips/[slug]/page.tsx sin librerias externas (implementacion custom).'),
      spacer(80),

      h2('9.1 Sintaxis soportada'),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2600, 2600, 4160],
        rows: [
          new TableRow({ children: [th('Entrada', 2600), th('Salida HTML', 2600), th('Clase CSS', 4160)] }),
          new TableRow({ children: [td('### Texto', 2600, GRIS, false, true), td('<h3>', 2600, GRIS), td('styles.contenidoH3 — subtitulo mediano', 4160)] }),
          new TableRow({ children: [td('## Texto', 2600, BLANCO, false, true), td('<h2>', 2600), td('styles.contenidoH2 — seccion con borde dorado', 4160)] }),
          new TableRow({ children: [td('# Texto', 2600, GRIS, false, true), td('<h2>', 2600, GRIS), td('igual que ## (mismo nivel visual)', 4160)] }),
          new TableRow({ children: [td('- Elemento', 2600, BLANCO, false, true), td('<ul><li>', 2600), td('styles.contenidoLista / contenidoLista li', 4160)] }),
          new TableRow({ children: [td('* Elemento', 2600, GRIS, false, true), td('<ul><li>', 2600, GRIS), td('mismo que - (ambos patrones)', 4160)] }),
          new TableRow({ children: [td('**texto**', 2600, BLANCO, false, true), td('<strong>', 2600), td('color azul profundo, font-weight 800', 4160)] }),
          new TableRow({ children: [td('linea en blanco', 2600, GRIS, false, true), td('flush parrafo/lista', 2600, GRIS), td('flush y reset de acumuladores', 4160)] }),
          new TableRow({ children: [td('texto. - a - b', 2600, BLANCO, false, true), td('normalizacion', 2600), td('replace(" - ", "\\n- ") antes de parsear', 4160)] }),
        ],
      }),
      spacer(120),

      h2('9.2 Estilos (CSS Modules)'),
      p('El proyecto no usa Tailwind. Cada pagina o componente tiene su propio archivo .module.css en src/styles/. Las variables globales de color se definen en el :root del global CSS:'),
      codeBlock([
        '--azul-profundo:   #011B4F',
        '--azul-oscuro:     #003087',
        '--azul-boton:      #1560BD',
        '--azul-medio:      #4A6FA5',
        '--azul-secundario: #6B8CC7',
        '--dorado:          #C9A227',
        '--fondo-claro:     #F5F7FB',
      ]),
      spacer(120),
      new Paragraph({ children: [new PageBreak()] }),

      /* ════════════════════════════════════════════
         10. DESPLIEGUE
         ════════════════════════════════════════════ */
      ...secDiv('DESPLIEGUE Y ENTORNO'),
      h1('10. Despliegue en Vercel'),
      spacer(60),

      h2('10.1 Configuracion del proyecto en Vercel'),
      numbered('Framework Preset: Next.js (detectado automaticamente).'),
      numbered('Build Command: next build (por defecto).'),
      numbered('Output Directory: .next (por defecto).'),
      numbered('Variables de entorno: DATABASE_URL y GROQ_API_KEY configuradas en Settings > Environment Variables para todos los entornos (Production, Preview, Development).'),
      spacer(80),

      h2('10.2 Consideraciones de build'),
      warnBox('force-dynamic obligatorio', 'Todas las paginas que hacen queries a la BD deben tener export const dynamic = "force-dynamic". Sin esto, Vercel intenta pre-renderizar en build time, falla la conexion a la BD y el build se rompe con ENOTFOUND.'),
      spacer(80),
      p('Errores de build conocidos y sus causas:'),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3800, 5560],
        rows: [
          new TableRow({ children: [th('Error', 3800), th('Causa y solucion', 5560)] }),
          new TableRow({ children: [td('Cannot find namespace JSX', 3800, GRIS, false, true), td('React 19 no expone JSX globalmente. Usar React.ReactElement en lugar de JSX.Element. Agregar import React.', 5560)] }),
          new TableRow({ children: [td("regex flag 's' ES2018", 3800, BLANCO, false, true), td('El target de compilacion de Vercel puede ser anterior a ES2018. Evitar el flag s en expresiones regulares.', 5560)] }),
          new TableRow({ children: [td('ENOTFOUND postgres.xxx', 3800, GRIS, false, true), td('Pagina sin force-dynamic intentando conectarse a BD en build time. Agregar export const dynamic.', 5560)] }),
          new TableRow({ children: [td('column "id" does not exist', 3800, BLANCO, false, true), td('materiales_categorias usa slug como PK. Cambiar ORDER BY id por ORDER BY nombre.', 5560)] }),
        ],
      }),
      spacer(120),

      h2('10.3 Desarrollo local'),
      codeBlock([
        '# Requisitos: Node.js 18+, npm',
        '',
        '# 1. Clonar el repositorio',
        'git clone <repo-url>',
        'cd fercadi-next',
        '',
        '# 2. Instalar dependencias',
        'npm install',
        '',
        '# 3. Crear variables de entorno',
        'cp .env.example .env.local',
        '# Editar .env.local con DATABASE_URL y GROQ_API_KEY reales',
        '',
        '# 4. Iniciar servidor de desarrollo',
        'npm run dev',
        '# Disponible en http://localhost:3000',
        '',
        '# 5. Build de produccion (opcional, para verificar errores)',
        'npm run build',
        'npm start',
      ]),
      spacer(120),
      new Paragraph({ children: [new PageBreak()] }),

      /* ════════════════════════════════════════════
         11. SEGURIDAD
         ════════════════════════════════════════════ */
      ...secDiv('SEGURIDAD Y LIMITACIONES'),
      h1('11. Consideraciones de seguridad'),
      spacer(60),

      h2('11.1 Autenticacion — limitaciones conocidas'),
      p('El sistema actual usa una estrategia de autenticacion simple basada en localStorage y el header x-usuario-id. Esto tiene las siguientes implicaciones:'),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3200, 6160],
        rows: [
          new TableRow({ children: [th('Aspecto', 3200), th('Estado actual', 6160)] }),
          new TableRow({ children: [td('Firma de sesion', 3200, GRIS, true), td('NO hay JWT ni firma criptografica. Un atacante con acceso al dispositivo podria forjar el usuario_id.', 6160)] }),
          new TableRow({ children: [td('Validacion real', 3200, BLANCO, true), td('La fuente de verdad es SIEMPRE la BD. requerirAdmin() y las validaciones en /api/comentarios verifican el usuario en cada request.', 6160)] }),
          new TableRow({ children: [td('Contrasenas', 3200, GRIS, true), td('Se almacenan con bcrypt (hash unidireccional). Nunca en texto plano.', 6160)] }),
          new TableRow({ children: [td('HTTPS', 3200, BLANCO, true), td('Vercel fuerza HTTPS en produccion. En desarrollo local se usa HTTP (puerto 3000).', 6160)] }),
          new TableRow({ children: [td('SQL Injection', 3200, GRIS, true), td('Todos los queries usan parametros preparados ($1, $2...). No hay concatenacion directa de strings en SQL.', 6160)] }),
          new TableRow({ children: [td('XSS', 3200, BLANCO, true), td('React escapa automaticamente los valores en JSX. El parser Markdown renderiza nodos React, no innerHTML.', 6160)] }),
        ],
      }),
      spacer(80),
      warnBox('Mejora recomendada', 'Para mayor seguridad en produccion, se recomienda migrar a JWT firmado (jose) o cookies httpOnly con NextAuth.js. Esto eliminaria el riesgo de suplantacion de usuario_id.'),
      spacer(120),

      h2('11.2 Proteccion de credenciales'),
      bullet('.env.local excluido de git por .gitignore (patron *.env*).'),
      bullet('CLAUDE.md y README.md no contienen credenciales reales.'),
      bullet('GitHub Secret Scanning esta activo — bloquea push con claves de API.'),
      bullet('Las variables de produccion solo existen en el dashboard de Vercel.'),
      spacer(120),
      new Paragraph({ children: [new PageBreak()] }),

      /* ════════════════════════════════════════════
         12. CONVENCIONES
         ════════════════════════════════════════════ */
      ...secDiv('CONVENCIONES DE DESARROLLO'),
      h1('12. Convenciones del codigo'),
      spacer(60),

      h2('12.1 Convencion de rutas y archivos'),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3000, 6360],
        rows: [
          new TableRow({ children: [th('Convencion', 3000), th('Descripcion', 6360)] }),
          new TableRow({ children: [td('force-dynamic', 3000, GRIS, true), td('Toda pagina que haga una query a la BD lleva export const dynamic = "force-dynamic" al inicio.', 6360)] }),
          new TableRow({ children: [td('Params async', 3000, BLANCO, true), td('Next.js 16: params es Promise<{...}>. Siempre const { slug } = await params.', 6360)] }),
          new TableRow({ children: [td('PUBLIC_COLS', 3000, GRIS, true), td('Los SELECT publicos nunca usan *. Se lista explicita de columnas para no exponer datos sensibles accidentalmente.', 6360)] }),
          new TableRow({ children: [td('ILIKE (no LIKE)', 3000, BLANCO, true), td('PostgreSQL es case-sensitive con LIKE. Siempre usar ILIKE para busquedas de texto.', 6360)] }),
          new TableRow({ children: [td('descripcion2 ?? undefined', 3000, GRIS, true), td('Las props opcionales de componentes nunca reciben null; siempre se convierte: p.descripcion2 ?? undefined.', 6360)] }),
          new TableRow({ children: [td('aria-hidden en iconos FA', 3000, BLANCO, true), td('Todos los <i className="fa-..."> deben tener aria-hidden="true" para evitar hydration mismatch.', 6360)] }),
          new TableRow({ children: [td('No button > Link', 3000, GRIS, true), td('Invalido en HTML. Usar <Link className={styles.btn}> directamente o <button onClick={() => router.push()}.', 6360)] }),
        ],
      }),
      spacer(120),

      h2('12.2 Convencion de estilos CSS'),
      bullet('Un archivo .module.css por pagina o componente principal.'),
      bullet('Variables de color siempre desde var(--nombre-variable), nunca valores hex directos en los modulos.'),
      bullet('Sin Tailwind ni utilidades globales de clase. Todo encapsulado en CSS Modules.'),
      bullet('Breakpoints: max-width: 900px para layout de dos columnas, max-width: 640px para movil.'),
      spacer(120),

      h2('12.3 Convencion de comentarios en el codigo'),
      bullet('Solo se documenta el POR QUE (restricciones ocultas, invariantes sutiles, workarounds).'),
      bullet('No se documenta el QUE — los nombres de funciones y variables ya lo expresan.'),
      bullet('JSDoc en funciones exportadas de lib/: @param, descripcion de retorno, casos nulos.'),
      bullet('Bloques de seccion con comentarios /* ── Nombre ── */ para separar logica en archivos largos.'),
      spacer(120),

      /* ── Cierre ── */
      new Paragraph({
        children: [txt('FERCADI / Josman Texturizados  |  Manual Tecnico v1.0  |  Junio 2026', { size: 18, color: '888888', italics: true })],
        alignment: AlignmentType.CENTER,
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: TEAL, space: 4 } },
        spacing: { before: 200, after: 0 },
      }),

    ], // end children
  }], // end sections
});

/* ── Generar archivo ── */
const outPath = path.join(__dirname, 'Manual_Tecnico_FERCADI.docx');
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(outPath, buf);
  console.log('Generado:', outPath);
}).catch(err => { console.error(err); process.exit(1); });
