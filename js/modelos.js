// FUENTE ÚNICA de datos por modelo (páginas, comparador, calculadora, asistente y configurador).
// Medidas en cm: [ancho, profundidad, alto]. Datos de Pablo/Pedro (01/10/2026); lo marcado "calc" es calculado y sin confirmar.
// Los precios salen de productos-data.js (PRODUCTS), no se duplican acá.
(function (root) {
  var CIERRE_SUAVE_POR_CAJON = 10000; // solo cajones; no se muestra el desglose en la web
  var COLOR_ADICIONAL = 110000;

  var LINEAS = {
    '1-plaza':         { nombre: '1 Plaza',        colchon: '80 × 190 cm',  carga: 600,  total: [193, 83],  prefijo: 'Cama box' },
    '1-plaza-y-media': { nombre: '1 Plaza y Media', colchon: '100 × 190 cm', carga: 800,  total: [193, 103], prefijo: 'Cama box' },
    '2-plazas':        { nombre: '2 Plazas',       colchon: '140 × 190 cm', carga: 1000, total: [193, 143], prefijo: 'Cama box' },
    'queen':           { nombre: 'Queen',          colchon: '160 × 200 cm', carga: 1000, total: [203, 163], prefijo: 'Cama box' },
    'king-180':        { nombre: 'King 180',       colchon: '180 × 200 cm', carga: 1000, total: [203, 183], prefijo: 'Cama box' },
    'king-200':        { nombre: 'King 200',       colchon: '200 × 200 cm', carga: 1000, total: [203, 203], prefijo: 'Cama box' }
  };

  // Zapateros: ancho de cada uno (Pedro, WhatsApp 01/10/2026). Alto 15 y profundidad 40 (iguales a los frontales).
  var ZAPATEROS = {
    '1-plaza': [75], '1-plaza-y-media': [45, 45], '2-plazas': [65, 65], 'queen': [75, 75],
    'king-180': [65, 65, 45], 'king-200': [65, 65, 55]
  };
  // Bauleras centrales y de cabecera por línea (regla de Pablo 11/09/2026: iguales dentro de la línea).
  var BAULERAS = {
    '2-plazas': { central: [{ dim: [102, 50, 40], n: 1 }], cabecera: [[68, 38, 40], [68, 38, 40]] },
    'queen':    { central: [{ dim: [102, 70, 40], n: 1 }], cabecera: [[78, 44, 40], [78, 44, 40]] },
    'king-180': { central: [{ dim: [102, 45, 40], n: 2 }], cabecera: [[70, 43, 40], [43, 43, 40], [70, 43, 40]] },
    'king-200': { central: [{ dim: [102, 55, 40], n: 2 }], cabecera: [[70, 43, 40], [63, 43, 40], [70, 43, 40]] }
  };

  function m(o) { return o; }

  var MODELOS = [
    // ---------- 1 PLAZA ----------
    m({ slug: '1-plaza-vip', linea: '1-plaza', cat: '1-plaza', nombre: 'Modelo 1 plaza Vip', corto: '1 Plaza Vip', idx: 0, alto: 42,
        laterales: { izq: 6, der: 0, dim: [40, 40, 15] }, zapateros: ZAPATEROS['1-plaza'],
        bauleras: { central: [{ dim: [145, 35, 40], n: 1 }], cabecera: [] }, cajones: 6 }),
    // ---------- 1 PLAZA Y MEDIA ----------
    m({ slug: 'plaza-y-media-esquinero', linea: '1-plaza-y-media', cat: '1-plaza-y-media', nombre: 'Modelo de Plaza y Media (Esquinero)', corto: 'Plaza y Media Esquinero', idx: 1, alto: 42,
        laterales: { izq: 6, der: 0, dim: [48, 40, 15] }, zapateros: ZAPATEROS['1-plaza-y-media'], zapateroPares: 4,
        bauleras: { central: [{ dim: [145, 58, 40], n: 1 }], cabecera: [] }, cajones: 6,
        nota: 'Los 6 cajones están todos en un mismo lateral y la baulera ocupa el lateral opuesto. Ese lado va contra la pared sin perder acceso a nada.' }),
    m({ slug: '8-vip-plaza-y-media', linea: '1-plaza-y-media', cat: '1-plaza-y-media', nombre: 'Modelo 8 Vip Plaza y Media', corto: '8 Vip Plaza y Media', idx: 2, alto: 42,
        laterales: { izq: 4, der: 4, dim: [48, 40, 15] }, zapateros: ZAPATEROS['1-plaza-y-media'], zapateroPares: 4,
        bauleras: { central: [], cabecera: [[51, 38, 40], [51, 38, 40]] }, cajones: 8 }),
    m({ slug: '12-vip-plaza-y-media', linea: '1-plaza-y-media', cat: '1-plaza-y-media', nombre: 'Modelo 12 Vip Plaza y Media', corto: '12 Vip Plaza y Media', idx: 3, alto: 42,
        laterales: { izq: 4, der: 4, dim: [48, 40, 15] }, frontales: [{ n: 4, dim: [45, 40, 15] }],
        bauleras: { central: [], cabecera: [[51, 38, 40], [51, 38, 40]] }, cajones: 12 }),
    // ---------- 2 PLAZAS ----------
    m({ slug: '8-vip-2-plazas', linea: '2-plazas', cat: '2-plazas', nombre: '8 Vip', corto: '8 Vip', idx: 4, alto: 42,
        laterales: { izq: 4, der: 4, dim: [48, 40, 15] }, zapateros: ZAPATEROS['2-plazas'], bauleras: BAULERAS['2-plazas'], cajones: 8 }),
    m({ slug: '4-vip-2-plazas', sinReparto: true, linea: '2-plazas', cat: '2-plazas', nombre: 'Modelo 4 Vip', corto: '4 Vip', idx: 5, alto: 42,
        laterales: { izq: 2, der: 2, dim: [48, 40, 30] }, zapateros: ZAPATEROS['2-plazas'], bauleras: BAULERAS['2-plazas'], cajones: 4 }),
    m({ slug: '6-vip-2-plazas', sinReparto: true, linea: '2-plazas', cat: '2-plazas', nombre: 'Modelo 6 Vip', corto: '6 Vip', idx: 6, alto: 42,
        laterales: { izq: 2, der: 2, dim: [48, 40, 30] }, frontales: [{ n: 2, dim: [65, 40, 30] }], bauleras: BAULERAS['2-plazas'], cajones: 6 }),
    m({ slug: 'estantes-vip-2-plazas', sinReparto: true, linea: '2-plazas', cat: '2-plazas', nombre: 'Modelo con Estantes Vip', corto: 'Estantes Vip', idx: 7, alto: 42,
        laterales: { izq: 3, der: 3, dim: [48, 40, 30] }, estantes: { n: 4, dim: [70, 45, 19] }, bauleras: BAULERAS['2-plazas'], cajones: 6 }),
    m({ slug: '10-vip-2-plazas', linea: '2-plazas', cat: '2-plazas', nombre: 'Modelo 10 Vip', corto: '10 Vip', idx: 8, alto: 42,
        laterales: { izq: 4, der: 4, dim: [48, 40, 30] }, frontales: [{ n: 2, dim: [65, 40, 30] }], bauleras: BAULERAS['2-plazas'], cajones: 10 }),
    m({ slug: '12-vip-2-plazas', linea: '2-plazas', cat: '2-plazas', nombre: 'Modelo 12 Vip', corto: '12 Vip', idx: 9, alto: 42,
        laterales: { izq: 4, der: 4, dim: [48, 40, 15] }, frontales: [{ n: 4, dim: [48, 40, 15] }], bauleras: BAULERAS['2-plazas'], cajones: 12, confirmarFrontales: true }),
    m({ slug: '18-vip-2-plazas', linea: '2-plazas', cat: '2-plazas', nombre: 'Modelo 18 Vip', corto: '18 Vip', idx: 10, alto: 52,
        laterales: { izq: 6, der: 6, dim: [48, 40, 15] }, frontales: [{ n: 6, dim: [64, 40, 12] }],
        bauleras: { central: [{ dim: null, n: 1 }], cabecera: [null, null] }, cajones: 18 }),
    // ---------- QUEEN ----------
    m({ slug: '4-vip-queen', sinReparto: true, linea: 'queen', cat: 'queen', nombre: 'Modelo 4 Vip Queen', corto: '4 Vip Queen', idx: 11, alto: 42,
        laterales: { izq: 2, der: 2, dim: [48, 40, 30] }, zapateros: ZAPATEROS['queen'], bauleras: BAULERAS['queen'], cajones: 4 }),
    m({ slug: '6-vip-queen', sinReparto: true, linea: 'queen', cat: 'queen', nombre: 'Modelo 6 Vip Queen', corto: '6 Vip Queen', idx: 12, alto: 42,
        laterales: { izq: 2, der: 2, dim: [48, 40, 30] }, frontales: [{ n: 2, dim: [75, 40, 30] }], bauleras: BAULERAS['queen'], cajones: 6 }),
    m({ slug: '8-vip-queen', linea: 'queen', cat: 'queen', nombre: 'Modelo 8 Vip Queen', corto: '8 Vip Queen', idx: 13, alto: 42,
        laterales: { izq: 4, der: 4, dim: [48, 40, 15] }, zapateros: ZAPATEROS['queen'], bauleras: BAULERAS['queen'], cajones: 8 }),
    m({ slug: '10-vip-queen', linea: 'queen', cat: 'queen', nombre: 'Modelo 10 Vip Queen', corto: '10 Vip Queen', idx: 14, alto: 42,
        laterales: { izq: 4, der: 4, dim: [48, 40, 30] }, frontales: [{ n: 2, dim: [75, 40, 30] }], bauleras: BAULERAS['queen'], cajones: 10 }),
    m({ slug: '12-vip-queen', linea: 'queen', cat: 'queen', nombre: 'Modelo 12 Vip Queen', corto: '12 Vip Queen', idx: 15, alto: 42,
        laterales: { izq: 4, der: 4, dim: [48, 40, 15] }, frontales: [{ n: 4, dim: [48, 40, 15] }], bauleras: BAULERAS['queen'], cajones: 12, confirmarFrontales: true }),
    m({ slug: 'estantes-vip-queen', sinReparto: true, linea: 'queen', cat: 'queen', nombre: 'Modelo Estantes Vip Queen', corto: 'Estantes Vip Queen', idx: 16, alto: 42,
        laterales: { izq: 3, der: 3, dim: [48, 40, 30] }, estantes: { n: 4, dim: [80, 45, 19], calc: true }, bauleras: BAULERAS['queen'], cajones: 6 }),
    m({ slug: '18-vip-queen', linea: 'queen', cat: 'queen', nombre: 'Modelo 18 Vip Queen', corto: '18 Vip Queen', idx: 17, alto: 52,
        laterales: { izq: 6, der: 6, dim: [48, 40, 15] }, frontales: [{ n: 6, dim: [74, 40, 12] }],
        bauleras: { central: [{ dim: null, n: 1 }], cabecera: [null, null] }, cajones: 18 }),
    // ---------- KING 180 ----------
    m({ slug: '8-vip-king-180', linea: 'king-180', cat: 'king', nombre: '8 Vip King', corto: '8 Vip King 180', idx: 18, alto: 42,
        laterales: { izq: 4, der: 4, dim: [48, 40, 15] }, zapateros: ZAPATEROS['king-180'], zapateroPares: 6, bauleras: BAULERAS['king-180'], cajones: 8 }),
    m({ slug: '14-vip-king-180', linea: 'king-180', cat: 'king', nombre: '14 Vip King', corto: '14 Vip King 180', idx: 19, alto: 42,
        laterales: { izq: 4, der: 4, dim: [48, 40, 15] }, frontales: [{ n: 4, dim: [65, 40, 15] }, { n: 2, dim: [38, 40, 15] }], bauleras: BAULERAS['king-180'], cajones: 14 }),
    m({ slug: '21-vip-king-180', linea: 'king-180', cat: 'king', nombre: '21 Vip King', corto: '21 Vip King 180', idx: 20, alto: 52,
        laterales: { izq: 6, der: 6, dim: [48, 40, 12] }, frontales: [{ n: 6, dim: [65, 40, 12] }, { n: 3, dim: [38, 40, 12] }],
        bauleras: { central: [{ dim: [102, 45, 50], n: 2 }], cabecera: [[70, 43, 50], [43, 43, 50], [70, 43, 50]] }, cajones: 21 }),
    // ---------- KING 200 ----------
    m({ slug: '8-vip-king-200', linea: 'king-200', cat: 'king', nombre: '8 Vip King', corto: '8 Vip King 200', idx: 21, alto: 42,
        laterales: { izq: 4, der: 4, dim: [48, 40, 15] }, zapateros: ZAPATEROS['king-200'], zapateroPares: 6, bauleras: BAULERAS['king-200'], cajones: 8 }),
    m({ slug: '14-vip-king-200', linea: 'king-200', cat: 'king', nombre: '14 Vip King', corto: '14 Vip King 200', idx: 22, alto: 42,
        laterales: { izq: 4, der: 4, dim: [48, 40, 15] }, frontales: [{ n: 4, dim: [65, 40, 15] }, { n: 2, dim: [58, 40, 15] }], bauleras: BAULERAS['king-200'], cajones: 14 }),
    m({ slug: '21-vip-king-200', linea: 'king-200', cat: 'king', nombre: '21 Vip King', corto: '21 Vip King 200', idx: 23, alto: 52,
        laterales: { izq: 6, der: 6, dim: [48, 40, 12] }, frontales: [{ n: 6, dim: [65, 40, 12] }, { n: 3, dim: [58, 40, 12] }],
        bauleras: { central: [{ dim: [102, 55, 50], n: 2 }], cabecera: [[70, 43, 50], [63, 43, 50], [70, 43, 50]] }, cajones: 21 })
  ];

  // Cajones apilados: en una cama de 42 cm entran 2 cajones de 15 (o 1 de 30); en la de 52, 3 de 15 o 3 de 12.
  function niveles(h, alto) { if (h >= 30) return 1; if (h === 15) return alto >= 52 ? 3 : 2; if (h === 12) return 3; return 1; }

  MODELOS.forEach(function (x) {
    var L = LINEAS[x.linea];
    x.latNiveles = niveles(x.laterales.dim[2], x.alto);
    (x.frontales || []).forEach(function (f) { f.niveles = niveles(f.dim[2], x.alto); });
    x.lineaNombre = L.nombre;
    x.colchon = L.colchon;
    x.carga = L.carga;
    x.largoTotal = L.total[0];
    x.anchoTotal = L.total[1];
    x.titulo = 'Cama box ' + x.corto + (/Plaza|Queen|King/.test(x.corto) ? '' : ' ' + L.nombre) + ' (' + L.colchon + ')';
    x.zapateros = x.zapateros || [];
    x.frontales = x.frontales || [];
    x.pares = x.zapateroPares || null;
  });


  // ---------- Textos de ficha (los usan productos-data.js, las páginas y el comparador) ----------
  function fmt(d) { return d[0] + ' × ' + d[1] + ' × ' + d[2] + ' cm'; }
  function plural(n, uno, varios) { return n + ' ' + (n === 1 ? uno : varios); }
  function agrupar(dims) { // [[a,b,c],...] -> [{dim, n}] conservando el orden
    var out = [];
    dims.forEach(function (d) {
      if (!d) { var nul = out.filter(function (o) { return !o.dim; })[0]; if (nul) nul.n++; else out.push({ dim: null, n: 1 }); return; }
      var k = fmt(d), f = out.filter(function (o) { return o.dim && fmt(o.dim) === k; })[0];
      if (f) f.n++; else out.push({ dim: d, n: 1 });
    });
    return out;
  }
  function frontalesTotal(m) { return m.frontales.reduce(function (a, f) { return a + f.n; }, 0); }
  function lateralesTotal(m) { return m.laterales.izq + m.laterales.der; }
  function listaY(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' y ' + a[a.length - 1]; }

  function textoCajones(m) {
    var lat = lateralesTotal(m), fr = frontalesTotal(m), partes = [];
    if (m.laterales.der === 0) partes.push(lat + ' en un mismo lateral');
    else if (m.sinReparto) partes.push(lat + ' laterales');
    else if (m.laterales.izq === m.laterales.der) partes.push(m.laterales.izq + ' de cada lado');
    else partes.push(lat + ' laterales');
    if (fr) partes.push(fr + ' al pie');
    if (!fr && (m.laterales.der === 0 || m.sinReparto)) return m.cajones + ' cajones laterales' + (m.laterales.der === 0 ? ' (todos en un mismo lateral)' : '');
    return m.cajones + ' cajones: ' + listaY(partes);
  }
  function textoZapateros(m) {
    var z = m.zapateros;
    if (!z.length) return null;
    var g = agrupar(z.map(function (a) { return [a, 0, 0]; }));
    var det = z.length === 1 ? 'de ' + z[0] + ' cm de ancho' :
      (g.length === 1 ? 'de ' + z[0] + ' cm de ancho cada uno' : listaY(g.map(function (x) { return x.n + ' de ' + x.dim[0]; })) + ' cm de ancho');
    return plural(z.length, 'zapatero', 'zapateros') + ' al pie' + (g.length > 1 ? ': ' : ' ') + det + (m.pares ? ' (' + m.pares + ' pares cada uno)' : '');
  }
  function textoBauleras(m) {
    var out = [], c = m.bauleras.central, cab = m.bauleras.cabecera;
    c.forEach(function (x) {
      if (x.dim) out.push(plural(x.n, 'baulera central', 'bauleras centrales') + ' de ' + fmt(x.dim));
      else out.push(plural(x.n, 'baulera central grande', 'bauleras centrales grandes'));
    });
    if (cab.length) {
      var g = agrupar(cab);
      if (g.length === 1 && g[0].dim) out.push(plural(cab.length, 'baulera', 'bauleras') + ' en la cabecera de ' + fmt(g[0].dim));
      else if (g.length === 1) out.push(plural(cab.length, 'baulera', 'bauleras') + ' en la cabecera');
      else out.push(cab.length + ' bauleras en la cabecera: ' + listaY(g.map(function (x) { return x.n + ' de ' + fmt(x.dim); })));
    }
    return out;
  }
  function totalBauleras(m) { return m.bauleras.central.reduce(function (a, x) { return a + x.n; }, 0) + m.bauleras.cabecera.length; }

  function especificaciones(m) {
    var s = [], z = textoZapateros(m);
    s.push(textoCajones(m));
    var b = textoBauleras(m);
    b.forEach(function (x) { s.push(x); });
    if (z) s.push(z);
    if (m.estantes) s.push(m.estantes.n + ' estantes en los pies de ' + m.estantes.dim[0] + ' cm de ancho, ' + m.estantes.dim[2] + ' de alto y ' + m.estantes.dim[1] + ' de profundidad');
    s.push('Medida total: ' + m.largoTotal + ' × ' + m.anchoTotal + ' cm · Altura: ' + m.alto + ' cm');
    var lat = m.laterales, uno = lat.dim;
    if (m.frontales.length) {
      s.push('Cajones laterales de ' + fmt(lat.dim));
      agrupar(m.frontales.reduce(function (a, f) { for (var i = 0; i < f.n; i++) a.push(f.dim); return a; }, [])).forEach(function (g) {
        s.push('Cajones al pie de ' + fmt(g.dim) + (m.frontales.length > 1 || m.frontales[0].n > 1 ? ' (' + g.n + ')' : ''));
      });
    } else s.push('Cajones de ' + fmt(lat.dim));
    s.push('Melamina Egger de 15 mm, blanca por dentro y por fuera, con cantos ABS termofusionados');
    s.push('Soporta hasta ' + m.carga + ' kg');
    s.push('Correderas telescópicas reforzadas Eurohard, el cajón sale 40 cm');
    return s;
  }

  function webp(rel, t) { return '/assets/web/' + rel.replace(/^assets\//, '').replace(/\.[a-z]+$/i, '').replace(/[^a-z0-9/_-]/gi, '-') + '-' + t + '.webp'; }
  function pesos(n) { return '$' + n.toLocaleString('es-AR'); }
  // Datos de venta (precio, foto) desde productos-data.js, que es la fuente de precios.
  function venta(m) { var p = (typeof PRODUCTS !== 'undefined') ? PRODUCTS[m.idx] : null; return p ? { precio: p.price, viejo: p.priceOld || null, img: p.img, oferta: !!p.oferta } : null; }

  // Orden lógico de las camas: por medida y, dentro de cada una, de menor a mayor precio (4, 6, 8, 10, 12, 18...).
  var ORDEN_LINEAS = ['1-plaza', '1-plaza-y-media', '2-plazas', 'queen', 'king-180', 'king-200'];
  function porPrecio(arr) {
    return arr.slice().sort(function (a, b) {
      var va = venta(a), vb = venta(b);
      return ORDEN_LINEAS.indexOf(a.linea) - ORDEN_LINEAS.indexOf(b.linea) || ((va && vb) ? va.precio - vb.precio : 0) || a.cajones - b.cajones || a.idx - b.idx;
    });
  }

  var api = { porPrecio: porPrecio, webp: webp, pesos: pesos, venta: venta, fmt: fmt, especificaciones: especificaciones, textoCajones: textoCajones, textoZapateros: textoZapateros, textoBauleras: textoBauleras, totalBauleras: totalBauleras, lateralesTotal: lateralesTotal, frontalesTotal: frontalesTotal, agrupar: agrupar,  MODELOS: MODELOS, LINEAS: LINEAS, CIERRE_SUAVE_POR_CAJON: CIERRE_SUAVE_POR_CAJON, COLOR_ADICIONAL: COLOR_ADICIONAL };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PM = api;
})(typeof window !== 'undefined' ? window : this);
