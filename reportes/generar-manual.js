const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, PageBreak, LevelFormat,
  ExternalHyperlink, TableOfContents,
} = require('docx');
const fs = require('fs');
const path = require('path');

/* ══════════════════════════════════════════════════
   UTILIDADES
   ══════════════════════════════════════════════════ */

const AZUL       = '003366';
const AZUL_CLARO = 'D6E4F0';
const DORADO     = 'C9A227';
const GRIS       = 'F2F2F2';
const BLANCO     = 'FFFFFF';
const NEGRO      = '1A1A1A';

const border = (color = 'CCCCCC') => ({ style: BorderStyle.SINGLE, size: 1, color });
const borders = (color = 'CCCCCC') => ({
  top: border(color), bottom: border(color), left: border(color), right: border(color),
});
const noBorder = () => ({ style: BorderStyle.NONE, size: 0, color: 'FFFFFF' });
const noBorders = () => ({ top: noBorder(), bottom: noBorder(), left: noBorder(), right: noBorder() });

/** Párrafo de espacio vacío */
const spacer = (pts = 120) => new Paragraph({
  children: [new TextRun('')],
  spacing: { before: pts, after: pts },
});

/** Texto normal con opciones */
const txt = (text, opts = {}) => new TextRun({ text, font: 'Arial', size: 22, ...opts });

/** Párrafo normal */
const p = (text, opts = {}) => new Paragraph({
  children: [txt(text, opts)],
  spacing: { after: 160 },
});

/** Párrafo con múltiples runs */
const pr = (runs, paraOpts = {}) => new Paragraph({
  children: runs,
  spacing: { after: 160 },
  ...paraOpts,
});

/** Item de lista con viñeta */
const bullet = (text, bold = false) => new Paragraph({
  numbering: { reference: 'bullets', level: 0 },
  children: [txt(text, { bold })],
  spacing: { after: 80 },
});

/** Item de lista numerada */
const numbered = (text) => new Paragraph({
  numbering: { reference: 'numbers', level: 0 },
  children: [txt(text)],
  spacing: { after: 80 },
});

/** Celda de tabla encabezado */
const thCell = (text, width) => new TableCell({
  width: { size: width, type: WidthType.DXA },
  borders: borders('2E75B6'),
  shading: { fill: AZUL, type: ShadingType.CLEAR },
  margins: { top: 100, bottom: 100, left: 140, right: 140 },
  children: [new Paragraph({
    children: [txt(text, { bold: true, color: BLANCO, size: 20 })],
    alignment: AlignmentType.CENTER,
  })],
});

/** Celda de tabla normal */
const tdCell = (text, width, shade = BLANCO, bold = false) => new TableCell({
  width: { size: width, type: WidthType.DXA },
  borders: borders('CCCCCC'),
  shading: { fill: shade, type: ShadingType.CLEAR },
  margins: { top: 80, bottom: 80, left: 140, right: 140 },
  children: [new Paragraph({
    children: [txt(text, { bold, size: 20 })],
  })],
});

/** Caja de nota / tip */
const noteBox = (titulo, contenido) => new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [9360],
  rows: [
    new TableRow({ children: [new TableCell({
      width: { size: 9360, type: WidthType.DXA },
      borders: { top: border(DORADO), bottom: border(DORADO), left: { style: BorderStyle.SINGLE, size: 12, color: DORADO }, right: border(DORADO) },
      shading: { fill: 'FFFDF0', type: ShadingType.CLEAR },
      margins: { top: 100, bottom: 100, left: 180, right: 180 },
      children: [
        new Paragraph({ children: [txt('💡  ' + titulo, { bold: true, size: 20, color: '7A5C00' })], spacing: { after: 60 } }),
        new Paragraph({ children: [txt(contenido, { size: 20 })], spacing: { after: 0 } }),
      ],
    })]})
  ],
});

/** Separador de sección con color */
const sectionDivider = (titulo, color = AZUL) => [
  spacer(200),
  new Paragraph({
    children: [txt(titulo, { bold: true, size: 28, color: BLANCO })],
    alignment: AlignmentType.CENTER,
    shading: { fill: color, type: ShadingType.CLEAR },
    spacing: { before: 0, after: 0 },
    indent: { left: 0, right: 0 },
    border: {
      top:    { style: BorderStyle.SINGLE, size: 6, color },
      bottom: { style: BorderStyle.SINGLE, size: 6, color },
    },
  }),
  spacer(160),
];

/* ══════════════════════════════════════════════════
   DOCUMENTO
   ══════════════════════════════════════════════════ */

const doc = new Document({
  /* ── Listas ──────────────────────────────────── */
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }],
      },
      {
        reference: 'numbers',
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }],
      },
      {
        reference: 'numbers2',
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }],
      },
      {
        reference: 'numbers3',
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }],
      },
    ],
  },

  /* ── Estilos ─────────────────────────────────── */
  styles: {
    default: { document: { run: { font: 'Arial', size: 22, color: NEGRO } } },
    paragraphStyles: [
      {
        id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 36, bold: true, font: 'Arial', color: AZUL },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0,
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: DORADO, space: 4 } } },
      },
      {
        id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: 'Arial', color: '1F4E79' },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 },
      },
      {
        id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 24, bold: true, font: 'Arial', color: '2E75B6' },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 },
      },
    ],
  },

  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1260, bottom: 1440, left: 1260 },
      },
    },

    /* ── Encabezado ──────────────────────────────── */
    headers: {
      default: new Header({
        children: [
          new Paragraph({
            children: [
              txt('FERCADI / Josman Texturizados', { bold: true, size: 18, color: AZUL }),
              txt('   |   Manual de Usuario', { size: 18, color: '666666' }),
            ],
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: DORADO, space: 2 } },
            spacing: { after: 0 },
          }),
        ],
      }),
    },

    /* ── Pie de página ───────────────────────────── */
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            children: [
              txt('Confidencial — uso interno  ', { size: 18, color: '888888' }),
              txt('Página ', { size: 18, color: '888888' }),
              new TextRun({ children: [PageNumber.CURRENT], size: 18, font: 'Arial', color: '888888' }),
              txt(' de ', { size: 18, color: '888888' }),
              new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, font: 'Arial', color: '888888' }),
            ],
            alignment: AlignmentType.RIGHT,
            border: { top: { style: BorderStyle.SINGLE, size: 4, color: AZUL, space: 2 } },
          }),
        ],
      }),
    },

    children: [

      /* ════════════════════════════════════════════
         PORTADA
         ════════════════════════════════════════════ */
      spacer(800),
      new Paragraph({
        children: [txt('FERCADI', { bold: true, size: 72, color: AZUL })],
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        children: [txt('Josman Texturizados', { size: 32, color: DORADO })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
      }),
      new Paragraph({
        children: [txt('─────────────────────────────────', { size: 22, color: AZUL_CLARO })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
      }),
      new Paragraph({
        children: [txt('MANUAL DE USUARIO', { bold: true, size: 40, color: NEGRO })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
      }),
      new Paragraph({
        children: [txt('Usuario General y Administrador', { size: 28, color: '555555' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
      }),
      spacer(600),
      new Paragraph({
        children: [txt('Versión 1.0  ·  Junio 2026', { size: 22, color: '888888', italics: true })],
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        children: [txt('Plataforma: fercadi-next.vercel.app', { size: 22, color: '888888' })],
        alignment: AlignmentType.CENTER,
      }),

      /* ── Salto de página ── */
      new Paragraph({ children: [new PageBreak()] }),

      /* ════════════════════════════════════════════
         TABLA DE CONTENIDO
         ════════════════════════════════════════════ */
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: 'Contenido', font: 'Arial', size: 36, bold: true, color: AZUL })],
      }),
      new TableOfContents('Tabla de contenido', { hyperlink: true, headingStyleRange: '1-3' }),
      new Paragraph({ children: [new PageBreak()] }),

      /* ════════════════════════════════════════════
         INTRODUCCIÓN
         ════════════════════════════════════════════ */
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: '1. Introducción', font: 'Arial', size: 36, bold: true, color: AZUL })] }),
      p('FERCADI es la tienda en línea de Josman Texturizados, empresa dedicada a la venta de concretos, acabados texturizados, materiales de construcción, adhesivos, selladores, pinturas, productos especializados y ferretería en México.'),
      p('Este manual describe el uso completo de la plataforma web, tanto para clientes como para el personal administrativo encargado del catálogo, tips y gestión de pedidos.'),
      spacer(80),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: '1.1 Requisitos del sistema', font: 'Arial', size: 28, bold: true, color: '1F4E79' })] }),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3120, 6240],
        rows: [
          new TableRow({ children: [thCell('Requisito', 3120), thCell('Detalle', 6240)] }),
          new TableRow({ children: [tdCell('Navegador', 3120, GRIS, true), tdCell('Chrome 100+, Firefox 110+, Edge 100+, Safari 16+', 6240)] }),
          new TableRow({ children: [tdCell('Conexión', 3120, BLANCO, true), tdCell('Internet estable (mínimo 5 Mbps recomendado)', 6240)] }),
          new TableRow({ children: [tdCell('Dispositivos', 3120, GRIS, true), tdCell('PC, laptop, tablet o smartphone con navegador moderno', 6240)] }),
          new TableRow({ children: [tdCell('JavaScript', 3120, BLANCO, true), tdCell('Habilitado (requerido para el carrito y búsqueda)', 6240)] }),
        ],
      }),
      spacer(120),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: '1.2 URL de acceso', font: 'Arial', size: 28, bold: true, color: '1F4E79' })] }),
      p('La plataforma está disponible en:'),
      new Paragraph({
        children: [
          txt('Sitio web:  ', { bold: true }),
          new TextRun({
            text: 'https://fercadi-next.vercel.app',
            font: 'Arial', size: 22, color: '1155CC', underline: {},
          }),
        ],
        spacing: { after: 160 },
      }),
      noteBox('Nota', 'Si accede desde una red interna de la empresa, también puede estar disponible en la dirección IP local configurada por el administrador de TI.'),
      new Paragraph({ children: [new PageBreak()] }),

      /* ════════════════════════════════════════════
         SECCIÓN 1 — USUARIO GENERAL
         ════════════════════════════════════════════ */
      ...sectionDivider('SECCIÓN 1 — MANUAL DEL USUARIO GENERAL'),

      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: '2. Navegación general', font: 'Arial', size: 36, bold: true, color: AZUL })] }),
      p('Al ingresar al sitio el usuario encontrará una barra de navegación fija en la parte superior con acceso a todas las secciones del catálogo.'),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: '2.1 Menú principal', font: 'Arial', size: 28, bold: true, color: '1F4E79' })] }),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2600, 6760],
        rows: [
          new TableRow({ children: [thCell('Sección', 2600), thCell('Descripción', 6760)] }),
          new TableRow({ children: [tdCell('Inicio', 2600, GRIS, true), tdCell('Página principal con categorías destacadas y accesos directos', 6760)] }),
          new TableRow({ children: [tdCell('Concretos', 2600, BLANCO, true), tdCell('Catálogo de mezclas y elementos de concreto (FC150, FC200, etc.)', 6760)] }),
          new TableRow({ children: [tdCell('Acabados (Textucos)', 2600, GRIS, true), tdCell('Adhesivos, morteros, selladores, pinturas y productos especializados', 6760)] }),
          new TableRow({ children: [tdCell('Materiales', 2600, BLANCO, true), tdCell('Materiales de construcción por categoría y marca', 6760)] }),
          new TableRow({ children: [tdCell('Ferretería', 2600, GRIS, true), tdCell('Catálogo de ferretería con filtros por categoría y marca', 6760)] }),
          new TableRow({ children: [tdCell('Tips', 2600, BLANCO, true), tdCell('Tutoriales y artículos técnicos de construcción', 6760)] }),
          new TableRow({ children: [tdCell('Cotización', 2600, GRIS, true), tdCell('Formulario para solicitar una cotización personalizada', 6760)] }),
          new TableRow({ children: [tdCell('Contacto', 2600, BLANCO, true), tdCell('Datos de contacto y formulario de mensaje directo', 6760)] }),
        ],
      }),
      spacer(120),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: '2.2 Menú en dispositivos móviles', font: 'Arial', size: 28, bold: true, color: '1F4E79' })] }),
      p('En pantallas pequeñas el menú se oculta y se accede tocando el ícono de tres líneas (☰) en la esquina superior derecha. Al seleccionar cualquier opción el menú se cierra automáticamente.'),

      /* ── 3. Catálogo ── */
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: '3. Catálogo de productos', font: 'Arial', size: 36, bold: true, color: AZUL })] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: '3.1 Explorar por categoría', font: 'Arial', size: 28, bold: true, color: '1F4E79' })] }),
      p('Cada sección del catálogo muestra sus categorías como tarjetas visuales. Al hacer clic en una categoría se despliega el listado de productos que pertenecen a ella.'),
      bullet('Concretos: Clase A, Clase B, Clase C, prefabricados, etc.'),
      bullet('Textucos: adhesivos, morteros, selladores, pinturas, especializados.'),
      bullet('Materiales: organizados por marca y tipo de material.'),
      bullet('Ferretería: organizada por categoría con filtro de marca.'),
      spacer(80),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: '3.2 Ficha de producto', font: 'Arial', size: 28, bold: true, color: '1F4E79' })] }),
      p('Al seleccionar un producto se muestra su ficha completa que incluye:'),
      bullet('Nombre y categoría.'),
      bullet('Descripción técnica principal.'),
      bullet('Imagen del producto.'),
      bullet('Segunda descripción (modo de uso, especificaciones técnicas) en banda azul.'),
      bullet('Botón "Agregar al carrito" (si el producto tiene precio asignado).'),
      bullet('Botones de acción: Cotizar y Contactar.'),
      bullet('Sección de opiniones y calificaciones de clientes.'),
      spacer(80),

      noteBox('Tip', 'Si el botón "Agregar al carrito" no aparece en la ficha de un producto, significa que ese artículo requiere cotización directa. Use el botón "Cotizar" para solicitarla.'),
      spacer(120),

      /* ── 4. Buscador ── */
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: '4. Buscador global', font: 'Arial', size: 36, bold: true, color: AZUL })] }),
      p('El ícono de lupa en la barra de navegación abre el buscador global. Permite encontrar productos de todas las secciones (concretos, textucos, materiales y ferretería) con una sola búsqueda.'),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: '4.1 Cómo realizar una búsqueda', font: 'Arial', size: 28, bold: true, color: '1F4E79' })] }),
      numbered('Haga clic en el ícono de lupa en la barra superior.'),
      numbered('Escriba el nombre o palabra clave del producto.'),
      numbered('Los resultados aparecerán en tiempo real mientras escribe.'),
      numbered('Haga clic en cualquier resultado para ir a la ficha del producto.'),
      spacer(80),
      noteBox('Nota', 'La búsqueda no distingue mayúsculas ni minúsculas. Por ejemplo, "cemento", "CEMENTO" y "Cemento" devuelven los mismos resultados.'),
      spacer(120),

      /* ── 5. Carrito ── */
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: '5. Carrito de compras', font: 'Arial', size: 36, bold: true, color: AZUL })] }),
      p('El carrito permite reunir múltiples productos antes de solicitar un pedido. El ícono de bolsa en la barra superior muestra la cantidad de artículos en el carrito en tiempo real.'),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: '5.1 Agregar un producto al carrito', font: 'Arial', size: 28, bold: true, color: '1F4E79' })] }),
      numbered('Abra la ficha de un producto.'),
      numbered('Haga clic en el botón azul "Agregar al carrito".'),
      numbered('En el modal que aparece, revise el producto y ajuste la cantidad (1-99 unidades).'),
      numbered('Confirme haciendo clic en "Agregar al carrito" dentro del modal.'),
      numbered('El carrito se abrirá automáticamente mostrando los productos seleccionados.'),
      spacer(80),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: '5.2 Gestionar el carrito', font: 'Arial', size: 28, bold: true, color: '1F4E79' })] }),
      p('Desde el carrito lateral (drawer) puede:'),
      bullet('Cambiar la cantidad de cada producto.'),
      bullet('Eliminar productos individuales.'),
      bullet('Ver el total parcial.'),
      bullet('Proceder al checkout para finalizar el pedido.'),
      spacer(80),
      noteBox('Importante', 'El carrito se guarda automáticamente en su navegador. Si cierra la pestaña o recarga la página, los productos seguirán en el carrito al volver.'),
      spacer(120),

      /* ── 6. Registro e inicio de sesión ── */
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: '6. Registro e inicio de sesión', font: 'Arial', size: 36, bold: true, color: AZUL })] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: '6.1 Crear una cuenta', font: 'Arial', size: 28, bold: true, color: '1F4E79' })] }),
      numbered('Haga clic en "Iniciar sesión" en la barra superior.'),
      numbered('En la página de login, seleccione "Regístrate".'),
      numbered('Complete el formulario con nombre, correo electrónico y contraseña.'),
      numbered('Haga clic en "Crear cuenta".'),
      numbered('Será redirigido automáticamente al inicio de sesión.'),
      spacer(80),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: '6.2 Iniciar sesión', font: 'Arial', size: 28, bold: true, color: '1F4E79' })] }),
      numbered('Haga clic en "Iniciar sesión" en la barra superior.'),
      numbered('Ingrese su correo electrónico y contraseña.'),
      numbered('Haga clic en "Entrar".'),
      numbered('Su nombre aparecerá en la barra de navegación junto al ícono de usuario.'),
      spacer(80),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: '6.3 Cerrar sesión', font: 'Arial', size: 28, bold: true, color: '1F4E79' })] }),
      p('Haga clic en el botón "Salir" junto a su nombre en la barra de navegación. La sesión se cerrará de forma inmediata.'),
      spacer(120),

      /* ── 7. Comentarios ── */
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: '7. Opiniones y calificaciones', font: 'Arial', size: 36, bold: true, color: AZUL })] }),
      p('Los usuarios registrados pueden dejar una opinión y calificación (1 a 5 estrellas) en la ficha de cada producto. Las opiniones ayudan a otros compradores a tomar mejores decisiones.'),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: '7.1 Cómo dejar una opinión', font: 'Arial', size: 28, bold: true, color: '1F4E79' })] }),
      numbered('Inicie sesión en su cuenta.'),
      numbered('Abra la ficha del producto que desea calificar.'),
      numbered('Desplácese hasta la sección "Opiniones de clientes" al final de la página.'),
      numbered('Seleccione una calificación de 1 a 5 estrellas.'),
      numbered('Escriba su comentario (mínimo 10, máximo 500 caracteres).'),
      numbered('Haga clic en "Publicar opinión".'),
      spacer(80),
      noteBox('Nota', 'Solo se permite una opinión por usuario por producto. Una vez publicada, la opinión aparece de inmediato en la lista.'),
      spacer(120),

      /* ── 8. Tips ── */
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: '8. Tips y tutoriales', font: 'Arial', size: 36, bold: true, color: AZUL })] }),
      p('La sección "Tips" contiene artículos técnicos y tutoriales sobre construcción, aplicación de productos y mejores prácticas. Son completamente gratuitos y no requieren iniciar sesión.'),
      bullet('Acceda desde el menú "Tips".'),
      bullet('Explore el listado de artículos disponibles.'),
      bullet('Haga clic en cualquier tarjeta para leer el artículo completo.'),
      spacer(120),

      /* ── 9. Cotización y contacto ── */
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: '9. Cotización y contacto', font: 'Arial', size: 36, bold: true, color: AZUL })] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: '9.1 Solicitar cotización', font: 'Arial', size: 28, bold: true, color: '1F4E79' })] }),
      p('Para productos sin precio público o pedidos de volumen, use el formulario de cotización:'),
      numbered('Haga clic en "Cotización" en el menú o en el botón "Cotizar" de la ficha de un producto.'),
      numbered('Complete el formulario con sus datos y los productos que le interesan.'),
      numbered('Envíe la solicitud. El equipo de FERCADI le contactará a la brevedad.'),
      spacer(80),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: '9.2 Contacto directo', font: 'Arial', size: 28, bold: true, color: '1F4E79' })] }),
      p('Para consultas generales, quejas o información adicional, acceda a la sección "Contacto" desde el menú principal y complete el formulario de mensaje directo.'),

      new Paragraph({ children: [new PageBreak()] }),

      /* ════════════════════════════════════════════
         SECCIÓN 2 — ADMINISTRADOR
         ════════════════════════════════════════════ */
      ...sectionDivider('SECCIÓN 2 — MANUAL DEL USUARIO ADMINISTRADOR', '1A3C5E'),

      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: '10. Acceso al panel de administración', font: 'Arial', size: 36, bold: true, color: AZUL })] }),
      p('El panel de administración es una zona restringida accesible solo para usuarios con rol "admin" asignado en la base de datos.'),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: '10.1 Cómo acceder', font: 'Arial', size: 28, bold: true, color: '1F4E79' })] }),
      numbered('Inicie sesión con sus credenciales de administrador.'),
      numbered('En la barra de navegación aparecerá el botón "Admin" con ícono de llave.'),
      numbered('Haga clic en "Admin" para acceder al panel en /admin.'),
      spacer(80),
      noteBox('Seguridad', 'El panel de administración verifica el rol en cada operación del servidor. Acceder a la URL /admin directamente sin credenciales válidas redirige al inicio de sesión.'),
      spacer(120),

      /* ── 11. Dashboard ── */
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: '11. Dashboard', font: 'Arial', size: 36, bold: true, color: AZUL })] }),
      p('El dashboard (página de inicio del panel admin) muestra un resumen del estado general de la tienda: estadísticas de productos activos, pedidos recientes y accesos rápidos a las funciones más usadas.'),
      p('Desde el menú lateral izquierdo puede navegar entre:'),
      bullet('Dashboard — vista general.'),
      bullet('Inicio — edición del contenido de la página principal.'),
      bullet('Pedidos — gestión de pedidos recibidos.'),
      bullet('Tips — gestión de artículos.'),
      bullet('Productos — catálogo de productos.'),
      bullet('Nuevo producto — formulario de alta.'),
      bullet('Importar CSV — carga masiva de productos.'),
      spacer(120),

      /* ── 12. Gestión de productos ── */
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: '12. Gestión de productos', font: 'Arial', size: 36, bold: true, color: AZUL })] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: '12.1 Listado de productos', font: 'Arial', size: 28, bold: true, color: '1F4E79' })] }),
      p('En Admin > Productos encontrará el listado completo del catálogo con:'),
      bullet('Búsqueda por nombre o descripción (en tiempo real).'),
      bullet('Filtros por sección y estado (activo / inactivo).'),
      bullet('Acciones de editar y eliminar por fila.'),
      spacer(80),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: '12.2 Crear un nuevo producto', font: 'Arial', size: 28, bold: true, color: '1F4E79' })] }),
      numbered('Vaya a Admin > Nuevo producto o haga clic en el ícono + en el menú lateral.'),
      numbered('Complete los campos del formulario:'),
      spacer(40),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3000, 2500, 3860],
        rows: [
          new TableRow({ children: [thCell('Campo', 3000), thCell('Obligatorio', 2500), thCell('Descripción', 3860)] }),
          new TableRow({ children: [tdCell('Nombre', 3000, GRIS, true), tdCell('Sí', 2500), tdCell('Nombre visible del producto', 3860)] }),
          new TableRow({ children: [tdCell('Slug', 3000, BLANCO, true), tdCell('Sí (auto)', 2500), tdCell('URL amigable, se genera del nombre', 3860)] }),
          new TableRow({ children: [tdCell('Sección', 3000, GRIS, true), tdCell('Sí', 2500), tdCell('concretos / textucos / ferreteria', 3860)] }),
          new TableRow({ children: [tdCell('Categoría', 3000, BLANCO, true), tdCell('Sí', 2500), tdCell('Slug de la categoría dentro de la sección', 3860)] }),
          new TableRow({ children: [tdCell('Descripción', 3000, GRIS, true), tdCell('Sí', 2500), tdCell('Descripción principal del producto', 3860)] }),
          new TableRow({ children: [tdCell('Descripción 2', 3000, BLANCO, true), tdCell('No', 2500), tdCell('Texto técnico adicional (banda azul)', 3860)] }),
          new TableRow({ children: [tdCell('Precio', 3000, GRIS, true), tdCell('No', 2500), tdCell('Precio público. Si es 0 no muestra carrito', 3860)] }),
          new TableRow({ children: [tdCell('Imagen', 3000, BLANCO, true), tdCell('No', 2500), tdCell('Ruta /productos/seccion/cat/img.png o URL', 3860)] }),
          new TableRow({ children: [tdCell('Marca / Unidad', 3000, GRIS, true), tdCell('No', 2500), tdCell('Solo para ferretería', 3860)] }),
          new TableRow({ children: [tdCell('Activo', 3000, BLANCO, true), tdCell('Sí', 2500), tdCell('Activar/desactivar visibilidad pública', 3860)] }),
        ],
      }),
      spacer(120),
      numbered('Haga clic en "Guardar producto".'),
      numbered('El producto aparecerá de inmediato en el catálogo público.'),
      spacer(80),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: '12.3 Editar un producto existente', font: 'Arial', size: 28, bold: true, color: '1F4E79' })] }),
      numbered('En el listado de productos, haga clic en el ícono de lápiz (editar) del producto.'),
      numbered('Modifique los campos necesarios.'),
      numbered('Guarde los cambios. Los cambios son inmediatos en el sitio público.'),
      spacer(80),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: '12.4 Importar productos desde CSV', font: 'Arial', size: 28, bold: true, color: '1F4E79' })] }),
      p('Para cargas masivas de productos use Admin > Importar CSV.'),
      bullet('El archivo CSV debe contener las columnas requeridas en el orden correcto.'),
      bullet('Los productos existentes con el mismo slug se actualizarán.'),
      bullet('Los productos nuevos se insertarán automáticamente.'),
      bullet('Al finalizar la importación se muestra un resumen de registros procesados, actualizados e ignorados.'),
      spacer(80),
      noteBox('Importante', 'Respalde el catálogo actual antes de importar un CSV. Una importación masiva con datos incorrectos puede afectar múltiples productos al mismo tiempo.'),
      spacer(120),

      /* ── 13. Gestión de tips ── */
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: '13. Gestión de tips y tutoriales', font: 'Arial', size: 36, bold: true, color: AZUL })] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: '13.1 Listado de tips', font: 'Arial', size: 28, bold: true, color: '1F4E79' })] }),
      p('En Admin > Tips encontrará todos los artículos (activos e inactivos) con opciones para editar, activar/desactivar y eliminar.'),
      spacer(80),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: '13.2 Crear un nuevo tip manualmente', font: 'Arial', size: 28, bold: true, color: '1F4E79' })] }),
      numbered('Vaya a Admin > Tips > Nuevo tip.'),
      numbered('Complete los campos:'),
      bullet('Título — aparece como encabezado en la tarjeta y en la página del artículo.'),
      bullet('Slug — URL del artículo (/tips/el-slug). Se genera automático desde el título.'),
      bullet('Descripción corta — resumen de 1-2 oraciones para la tarjeta.'),
      bullet('Contenido completo — cuerpo del artículo en formato Markdown simplificado.'),
      bullet('Imagen de portada — URL o ruta de imagen para el banner.'),
      bullet('Visible en el sitio — activar para publicar inmediatamente.'),
      numbered('Haga clic en "Publicar tip".'),
      spacer(80),

      new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: '13.2.1 Formato Markdown del contenido', font: 'Arial', size: 24, bold: true, color: '2E75B6' })] }),
      p('El contenido del artículo soporta Markdown simplificado que se renderiza automáticamente:'),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3600, 2760, 3000],
        rows: [
          new TableRow({ children: [thCell('Sintaxis', 3600), thCell('Resultado', 2760), thCell('Ejemplo', 3000)] }),
          new TableRow({ children: [tdCell('### Subtítulo', 3600, GRIS), tdCell('Encabezado h3', 2760), tdCell('### Materiales necesarios', 3000)] }),
          new TableRow({ children: [tdCell('## Sección', 3600, BLANCO), tdCell('Encabezado h2', 2760), tdCell('## Preparación de la superficie', 3000)] }),
          new TableRow({ children: [tdCell('- Elemento', 3600, GRIS), tdCell('Punto de lista', 2760), tdCell('- Cemento 5 kg', 3000)] }),
          new TableRow({ children: [tdCell('**texto**', 3600, BLANCO), tdCell('Negrita', 2760), tdCell('**Importante:** secar 24h', 3000)] }),
          new TableRow({ children: [tdCell('Línea en blanco', 3600, GRIS), tdCell('Separación de párrafos', 2760), tdCell('(presione Enter dos veces)', 3000)] }),
        ],
      }),
      spacer(120),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: '13.3 Asistente de IA para generar tips', font: 'Arial', size: 28, bold: true, color: '1F4E79' })] }),
      p('FERCADI incluye un asistente de inteligencia artificial (Groq Llama 3.3 70B) que genera automáticamente el contenido de un tip a partir de un tema dado.'),

      new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: '13.3.1 Cómo usar el asistente IA', font: 'Arial', size: 24, bold: true, color: '2E75B6' })] }),
      numbered('En la página "Nuevo tip", localice la sección "Asistente de Contenido IA" (caja azul oscura en la parte superior).'),
      numbered('Escriba el tema del artículo en el campo de texto.'),
      numbered('Presione Enter o haga clic en "Rellenar formulario".'),
      numbered('El asistente generará título, descripción y contenido completo con formato Markdown.'),
      numbered('Revise y edite el contenido generado según sea necesario.'),
      numbered('Haga clic en "Publicar tip" para guardar.'),
      spacer(80),
      noteBox('Sobre el límite de uso', 'El asistente de IA usa Groq (capa gratuita) con un límite de 14,400 solicitudes por día. En uso normal esto es más que suficiente para el equipo editorial.'),
      spacer(120),

      /* ── 14. Gestión de pedidos ── */
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: '14. Gestión de pedidos', font: 'Arial', size: 36, bold: true, color: AZUL })] }),
      p('En Admin > Pedidos puede ver y gestionar todos los pedidos recibidos a través del proceso de checkout.'),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: '14.1 Listado de pedidos', font: 'Arial', size: 28, bold: true, color: '1F4E79' })] }),
      bullet('Búsqueda por nombre del cliente o número de pedido.'),
      bullet('Filtro por estado del pedido.'),
      bullet('Vista de todos los pedidos ordenados por fecha descendente (más recientes primero).'),
      spacer(80),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: '14.2 Detalle de pedido', font: 'Arial', size: 28, bold: true, color: '1F4E79' })] }),
      p('Haga clic en cualquier pedido para ver:'),
      bullet('Datos del cliente (nombre, correo, teléfono, dirección).'),
      bullet('Lista de productos solicitados con cantidades y precios.'),
      bullet('Total del pedido.'),
      bullet('Estado actual y opciones para actualizarlo.'),
      spacer(120),

      /* ── 15. Configuración del inicio ── */
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: '15. Edición del contenido de inicio', font: 'Arial', size: 36, bold: true, color: AZUL })] }),
      p('En Admin > Inicio puede personalizar las tarjetas de categorías que aparecen en la página principal del sitio público. Cada tarjeta tiene:'),
      bullet('Título de la categoría.'),
      bullet('Texto del botón de acción.'),
      bullet('Enlace de destino (href).'),
      bullet('Imagen representativa.'),
      spacer(120),

      /* ── 16. Solución de problemas ── */
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: '16. Solución de problemas frecuentes', font: 'Arial', size: 36, bold: true, color: AZUL })] }),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3800, 5560],
        rows: [
          new TableRow({ children: [thCell('Problema', 3800), thCell('Solución', 5560)] }),
          new TableRow({ children: [tdCell('No puedo iniciar sesión', 3800, GRIS, true), tdCell('Verifique que el correo y contraseña sean correctos. Verifique mayúsculas. Contacte al admin si el problema persiste.', 5560)] }),
          new TableRow({ children: [tdCell('El carrito se vació solo', 3800, BLANCO, true), tdCell('El carrito se guarda en el navegador. Si borró el historial/cookies, el carrito se resetea.', 5560)] }),
          new TableRow({ children: [tdCell('No aparece el botón Admin', 3800, GRIS, true), tdCell('Solo aparece si el usuario tiene rol "admin". Contacte al administrador del sistema.', 5560)] }),
          new TableRow({ children: [tdCell('La IA no genera el tip', 3800, BLANCO, true), tdCell('Verifique que la GROQ_API_KEY esté configurada en el servidor. Revise la consola del servidor.', 5560)] }),
          new TableRow({ children: [tdCell('Imagen de producto no se muestra', 3800, GRIS, true), tdCell('Verifique que la ruta sea correcta y el archivo exista en /public/productos/ o que la URL externa sea accesible.', 5560)] }),
          new TableRow({ children: [tdCell('Error al importar CSV', 3800, BLANCO, true), tdCell('Verifique que el formato del CSV sea correcto y que no haya caracteres especiales en los encabezados.', 5560)] }),
          new TableRow({ children: [tdCell('El sitio muestra error 500', 3800, GRIS, true), tdCell('Posible problema de conexión con la base de datos. Verifique que DATABASE_URL esté correctamente configurada en Vercel.', 5560)] }),
        ],
      }),
      spacer(120),

      /* ── 17. Glosario ── */
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: '17. Glosario de términos', font: 'Arial', size: 36, bold: true, color: AZUL })] }),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2800, 6560],
        rows: [
          new TableRow({ children: [thCell('Término', 2800), thCell('Definición', 6560)] }),
          new TableRow({ children: [tdCell('Slug', 2800, GRIS, true), tdCell('Identificador en URL. Ej: "mortero-fino-gris" en /textucos/morteros/mortero-fino-gris', 6560)] }),
          new TableRow({ children: [tdCell('Sección', 2800, BLANCO, true), tdCell('Categoría principal del catálogo: concretos, textucos, materiales o ferreteria', 6560)] }),
          new TableRow({ children: [tdCell('Activo / Inactivo', 2800, GRIS, true), tdCell('Estado de visibilidad. Un producto inactivo no aparece en el sitio público', 6560)] }),
          new TableRow({ children: [tdCell('CSV', 2800, BLANCO, true), tdCell('Formato de archivo de texto separado por comas para importación masiva de productos', 6560)] }),
          new TableRow({ children: [tdCell('Markdown', 2800, GRIS, true), tdCell('Lenguaje de marcado simple para dar formato al contenido de los tips', 6560)] }),
          new TableRow({ children: [tdCell('Groq / IA', 2800, BLANCO, true), tdCell('Servicio de inteligencia artificial que genera el contenido de los tips automáticamente', 6560)] }),
          new TableRow({ children: [tdCell('Carrito', 2800, GRIS, true), tdCell('Lista temporal de productos seleccionados antes de realizar un pedido', 6560)] }),
          new TableRow({ children: [tdCell('Checkout', 2800, BLANCO, true), tdCell('Proceso de finalización del pedido con datos del cliente', 6560)] }),
          new TableRow({ children: [tdCell('Vercel', 2800, GRIS, true), tdCell('Plataforma donde está desplegado el sitio (fercadi-next.vercel.app)', 6560)] }),
          new TableRow({ children: [tdCell('Supabase', 2800, BLANCO, true), tdCell('Base de datos PostgreSQL en la nube donde se almacena toda la información', 6560)] }),
        ],
      }),
      spacer(120),

      /* ── 18. Contacto soporte ── */
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: '18. Soporte técnico', font: 'Arial', size: 36, bold: true, color: AZUL })] }),
      p('Para problemas técnicos con la plataforma, contacte al equipo de desarrollo:'),
      bullet('Reporte el problema describiendo qué acción realizó y qué mensaje de error apareció.'),
      bullet('Incluya capturas de pantalla si es posible.'),
      bullet('Indique el navegador y sistema operativo que utiliza.'),
      spacer(80),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2800, 6560],
        rows: [
          new TableRow({ children: [thCell('Canal', 2800), thCell('Información', 6560)] }),
          new TableRow({ children: [tdCell('Plataforma', 2800, GRIS, true), tdCell('fercadi-next.vercel.app', 6560)] }),
          new TableRow({ children: [tdCell('Base de datos', 2800, BLANCO, true), tdCell('Supabase (PostgreSQL)', 6560)] }),
          new TableRow({ children: [tdCell('Versión del manual', 2800, GRIS, true), tdCell('1.0 — Junio 2026', 6560)] }),
        ],
      }),
      spacer(200),

      /* ── Pie del documento ── */
      new Paragraph({
        children: [txt('FERCADI / Josman Texturizados  ·  Manual de Usuario v1.0  ·  Junio 2026', { size: 18, color: '888888', italics: true })],
        alignment: AlignmentType.CENTER,
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: DORADO, space: 4 } },
        spacing: { before: 200, after: 0 },
      }),

    ], // end children
  }], // end sections
});

/* ── Generar archivo ── */
const outPath = path.join(__dirname, 'Manual_FERCADI.docx');
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outPath, buffer);
  console.log('✅ Manual generado en:', outPath);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
