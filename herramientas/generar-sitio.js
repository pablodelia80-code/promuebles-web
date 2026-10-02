// Genera las páginas estáticas del sitio a partir de js/modelos.js y js/productos-data.js.
// Uso: node herramientas/generar-sitio.js
// Salida: camas-box/<modelo>/index.html (24), camas-box/index.html, herramientas del comprador, sitemap.xml, robots.txt, datos/modelos.json, llms.txt
const fs = require('fs');
const path = require('path');

const raiz = path.resolve(__dirname, '..');
const SITIO = 'https://promuebles.com.ar';
const PM = require(path.join(raiz, 'js/modelos.js'));
const contenido = require('./paginas-contenido.js');
const D = new Function(fs.readFileSync(path.join(raiz, 'js/productos-data.js'), 'utf8') + ';return {PRODUCTS, COLORS, CATEGORIES};')();
const HOY = new Date().toISOString().slice(0, 10);

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pesos = n => '$' + n.toLocaleString('es-AR');
const webp = (rel, t) => '/assets/web/' + rel.replace(/^assets\//, '').replace(/\.[a-z]+$/i, '').replace(/[^a-z0-9/_-]/gi, '-') + '-' + t + '.webp';
const escribir = (rel, txt) => { const f = path.join(raiz, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, txt); };

// ---------- piezas comunes ----------
const WA_SVG = '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 00-8.6 15L2 22l5.2-1.4A10 10 0 1012 2zm5.6 14.1c-.2.6-1.2 1.2-1.7 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1-1.4-1-2.7s.6-1.9.9-2.1c.2-.2.5-.3.7-.3h.5c.2 0 .4-.1.7.5l.9 2.1c.1.2.1.4 0 .5l-.4.6-.3.3c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.2.4-.2.6-.1l2 1c.3.1.5.2.5.3.1.2.1.7-.1 1.3z"/></svg>';

function cabecera(titulo, descripcion, canonical, extra) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(descripcion)}">
<link rel="canonical" href="${SITIO}${canonical}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(descripcion)}">
<meta property="og:url" content="${SITIO}${canonical}">
<meta property="og:locale" content="es_AR">
${extra && extra.og ? `<meta property="og:image" content="${SITIO}${extra.og}">` : ''}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="stylesheet" href="/css/style.css?v=20261013">
<link rel="stylesheet" href="/css/modelo.css?v=20261013">
<link rel="stylesheet" href="/css/herramientas.css?v=20261013">
${extra && extra.jsonld ? extra.jsonld.map(j => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n') : ''}
<script src="/js/analytics.js" defer></script>
</head>
<body>
<a class="saltar" href="#contenido">Saltar al contenido</a>
<header class="site">
  <nav class="nav">
    <a class="logo" href="/index.html"><span class="pro">Pro</span><span class="muebles">Muebles</span></a>
    <ul class="nav-links">
      <li><a href="/productos.html">Productos</a></li>
      <li><a href="/configurar.html" class="nav-destacado">Armá tu cama</a></li>
      <li><a href="/instalaciones.html">Instalaciones</a></li>
      <li><a href="/testimonios.html">Testimonios</a></li>
      <li><a href="/quienes-somos.html">Quiénes Somos</a></li>
      <li><a href="/contacto.html">Contactanos</a></li>
    </ul>
    <div class="nav-contact"><a href="tel:+541168767075">11 6876-7075</a></div>
    <button class="burger" aria-label="Menú">&#9776;</button>
  </nav>
</header>
`;
}

function pie(scripts) {
  return `
<footer class="site">
  <div class="wrap foot-grid">
    <div>
      <div class="foot-logo"><span style="color:var(--gold)">Pro</span><span style="color:#fff">Muebles</span></div>
      <p style="margin-top:14px;opacity:.75;max-width:34ch">Fábrica propia de camas box a medida, en CABA y alrededores.</p>
    </div>
    <div>
      <h5>Navegación</h5>
      <a href="/productos.html">Productos</a>
      <a href="/elegir-cama.html">Elegí tu cama</a>
      <a href="/comparar.html">Comparar modelos</a>
      <a href="/calculadora-espacio.html">¿Entra en tu cuarto?</a>
      <a href="/preguntas-frecuentes/">Preguntas frecuentes</a>
      <a href="/articulos/">Artículos</a>
      <a href="/envios/">Envíos</a>
      <a href="/quienes-somos.html">Quiénes somos</a>
      <a href="/instalaciones.html">Nuestra fábrica</a>
    </div>
    <div>
      <h5>Contacto</h5>
      <a href="tel:+541168767075">11 6876-7075</a>
      <a href="mailto:promuebles1983@gmail.com">promuebles1983@gmail.com</a>
      <span>Moisés Lebensohn 1068, Boulogne</span>
    </div>
    <div>
      <h5>Redes</h5>
      <a href="https://instagram.com/promuebles_" target="_blank" rel="noopener">Instagram</a>
      <a href="https://www.mercadolibre.com.ar/pagina/promuebles1" target="_blank" rel="noopener">Mercado Libre</a>
      <a href="https://wa.me/5491168767075" target="_blank" rel="noopener">WhatsApp</a>
    </div>
  </div>
  <div class="wrap foot-bottom">&copy; 2026 ProMuebles</div>
</footer>
<a class="wa-float" href="https://wa.me/5491168767075" target="_blank" rel="noopener" aria-label="WhatsApp">${WA_SVG}</a>
<script src="/js/script.js?v=20261013"></script>
${scripts || ''}
</body>
</html>
`;
}

const ORG = {
  '@type': 'Organization', name: 'ProMuebles', url: SITIO, telephone: '+54 11 6876-7075', email: 'promuebles1983@gmail.com',
  address: { '@type': 'PostalAddress', streetAddress: 'Moisés Lebensohn 1068', addressLocality: 'Boulogne', addressRegion: 'Buenos Aires', postalCode: 'B1609BKT', addressCountry: 'AR' }
};

// ---------- páginas de modelo ----------
const CAT_NOMBRE = { '1-plaza': '1 Plaza', '1-plaza-y-media': '1 Plaza y Media', '2-plazas': '2 Plazas', queen: 'Queen', king: 'King' };
const ORDEN_LIN = ['1-plaza', '1-plaza-y-media', '2-plazas', 'queen', 'king-180', 'king-200'];
const ORDEN_CAT = ['1-plaza', '1-plaza-y-media', '2-plazas', 'queen', 'king'];
// Dirección de Productos con la categoría ya elegida (para el botón "Volver" de cada ficha)
const volverUrl = m => '/productos.html?cat=' + m.cat + (m.cat === 'king' ? '&king=' + m.linea : '');

function pagina(m) {
  const p = D.PRODUCTS[m.idx];
  const url = '/camas-box/' + m.slug + '/';
  const fotos = [{ rel: p.img, alt: m.titulo + ' en el showroom de ProMuebles' }]
    .concat((p.clientPhotos || []).map((f, i) => ({ rel: f, alt: m.titulo + ' armada en el hogar de un cliente, foto ' + (i + 1) })));
  const specs = PM.especificaciones(m);
  const nBau = PM.totalBauleras(m);
  const mismos = PM.MODELOS.filter(x => x.linea === m.linea && x.slug !== m.slug).sort((a, b) => D.PRODUCTS[a.idx].price - D.PRODUCTS[b.idx].price || a.cajones - b.cajones);
  const descripcion = `${m.titulo}: ${PM.textoCajones(m)}${nBau ? ' y ' + nBau + (nBau === 1 ? ' baulera' : ' bauleras') : ''}. Melamina Egger 15 mm, correderas Eurohard, soporta hasta ${m.carga} kg y 10 años de garantía. ${pesos(p.price)}.`;

  const jsonld = [
    {
      '@context': 'https://schema.org', '@type': 'Product', name: m.titulo, sku: m.slug, url: SITIO + url,
      description: descripcion, image: fotos.map(f => SITIO + webp(f.rel, 'l')),
      brand: { '@type': 'Brand', name: 'ProMuebles' }, manufacturer: ORG, material: 'Melamina Egger 15 mm',
      category: 'Camas box con cajones',
      additionalProperty: [
        { '@type': 'PropertyValue', name: 'Cantidad de cajones', value: m.cajones },
        { '@type': 'PropertyValue', name: 'Cantidad de bauleras', value: nBau },
        { '@type': 'PropertyValue', name: 'Carga máxima soportada', value: m.carga, unitCode: 'KGM' },
        { '@type': 'PropertyValue', name: 'Altura hasta el colchón', value: m.alto, unitCode: 'CMT' },
        { '@type': 'PropertyValue', name: 'Medida total', value: m.largoTotal + ' × ' + m.anchoTotal + ' cm' },
        { '@type': 'PropertyValue', name: 'Medida del colchón', value: m.colchon },
        { '@type': 'PropertyValue', name: 'Correderas', value: 'Telescópicas reforzadas Eurohard' }
      ],
      offers: { '@type': 'Offer', priceCurrency: 'ARS', price: String(p.price), url: SITIO + url, itemCondition: 'https://schema.org/NewCondition', seller: { '@type': 'Organization', name: 'ProMuebles' } }
    },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Productos', item: SITIO + '/productos.html' },
        { '@type': 'ListItem', position: 2, name: m.lineaNombre, item: SITIO + volverUrl(m) },
        { '@type': 'ListItem', position: 3, name: m.corto, item: SITIO + url }
      ]
    }
  ];

  const datos = { slug: m.slug, precio: p.price, precioViejo: p.priceOld || null, fotos: fotos.map(f => ({ l: webp(f.rel, 'l'), alt: f.alt })) };

  const h = cabecera(m.titulo + ' | ProMuebles', descripcion, url, { og: webp(p.img, 'l'), jsonld });
  const lista = a => a.map(x => `<li>${esc(x)}</li>`).join('');
  const guardado = [PM.textoCajones(m)].concat(
    m.frontales.length ? ['Cajones laterales: ' + PM.fmt(m.laterales.dim)].concat(PM.agrupar(m.frontales.reduce((a, f) => { for (let i = 0; i < f.n; i++) a.push(f.dim); return a; }, [])).map(g => 'Cajones al pie: ' + PM.fmt(g.dim) + (g.n > 1 ? ' (' + g.n + ')' : ''))) : ['Cada cajón mide ' + PM.fmt(m.laterales.dim)],
    PM.textoBauleras(m),
    PM.textoZapateros(m) ? [PM.textoZapateros(m) + '. Alto 15 cm y profundidad 40 cm'] : [],
    m.estantes ? [m.estantes.n + ' estantes en los pies: ' + m.estantes.dim[0] + ' cm de ancho, ' + m.estantes.dim[2] + ' de alto y ' + m.estantes.dim[1] + ' de profundidad'] : []
  );

  return h + `
<main class="modelo" id="contenido">
  <div class="wrap">
    <a class="m-volver" href="${volverUrl(m)}">← Volver a ${esc(m.lineaNombre)}</a>
    <nav class="crumbs" aria-label="Ubicación">
      <a href="/productos.html">Productos</a><span>›</span><a href="${volverUrl(m)}">${esc(m.lineaNombre)}</a><span>›</span><b>${esc(m.corto)}</b>
    </nav>

    <section class="m-hero">
      <div class="m-gallery">
        <div class="m-main"><img id="m-main-img" src="${webp(p.img, 'l')}" alt="${esc(fotos[0].alt)}" width="1000" height="1333" fetchpriority="high"></div>
        ${fotos.length > 1 ? `<div class="m-thumbs" id="m-thumbs" role="group" aria-label="Más fotos">${fotos.map((f, i) => `<button type="button" class="${i === 0 ? 'on' : ''}" data-i="${i}" aria-label="Ver foto ${i + 1}"><img src="${webp(f.rel, 's')}" alt="" width="74" height="74" loading="lazy"></button>`).join('')}</div>
        <p class="m-thumbs-label">Las fotos de abajo son de clientes reales</p>` : ''}
      </div>

      <div class="m-buy">
        <span class="eyebrow">${esc(m.lineaNombre)} · colchón ${esc(m.colchon)}</span>
        <h1>${esc(m.titulo.replace(/ \(.*\)$/, ''))}</h1>
        <p class="m-lead">${esc(p.resumen.replace(/^Modelo pensado.*$/, m.nota || ''))}${m.nota && m.idx !== 1 ? '' : ''}</p>

        <div class="m-price">
          ${p.priceOld ? '<span class="m-price-old" id="m-price-old">' + pesos(p.priceOld) + '</span>' : ''}
          <span class="m-price-now" id="m-price">${pesos(p.price)}</span>
          <span class="m-price-note">Precio final en pesos${p.oferta ? ' · oferta' : ''}</span>
        </div>

        <div class="m-option">
          <button class="m-switch" id="m-soft" role="switch" aria-checked="false" aria-describedby="m-soft-help">
            <span class="m-switch-track"><span class="m-switch-knob"></span></span>
            <span class="m-switch-text"><b>Correderas con cierre suave <em class="m-tag">Opcional</em></b><small id="m-soft-help">El cajón se frena solo y cierra sin golpe</small></span>
          </button>
          <p class="m-soft-on off" id="m-soft-on">Incluye correderas telescópicas reforzadas Eurohard</p>
        </div>

        <ul class="m-incluye">
          <li>Envío y armado sin cargo en CABA y alrededores</li>
          <li>Fabricación propia en Boulogne, entre 5 y 10 días</li>
          <li>Se fabrica en blanco. En otro color, adicional de ${pesos(PM.COLOR_ADICIONAL)}</li>
        </ul>

        <div class="m-envio">
          <label for="m-zona">¿Llegamos a tu zona?</label>
          <input id="m-zona" type="text" placeholder="Escribí tu barrio o localidad" autocomplete="off" role="combobox" aria-autocomplete="list" aria-controls="m-zona-lista">
          <ul id="m-zona-lista" class="m-zona-lista" role="listbox" hidden></ul>
          <p id="m-zona-res" class="m-zona-res" aria-live="polite"></p>
        </div>

        <a class="btn-whatsapp m-cta" id="m-wa" href="https://wa.me/5491168767075" target="_blank" rel="noopener">${WA_SVG} Consultar esta cama por WhatsApp</a>
        <a class="m-pdf" href="/fichas/${m.slug}.pdf" download>Descargar ficha técnica (PDF)</a>
      </div>
    </section>

    <section class="m-facts" aria-label="Datos clave">
      <div><b>${m.cajones}</b><span>cajones</span></div>
      <div><b>${nBau || m.estantes ? (nBau || m.estantes.n) : 0}</b><span>${nBau ? (nBau === 1 ? 'baulera' : 'bauleras') : 'estantes'}</span></div>
      <div><b>${m.carga} kg</b><span>de carga soportada</span></div>
      <div><b>10 años</b><span>de garantía</span></div>
    </section>

    ${contenido.resenasHTML(esc)}

    <section class="m-explore">
      <span class="eyebrow">Explorá la cama</span>
      <h2>Tocá la cama y mirá cómo es por dentro</h2>
      <p class="m-sub">Tocá cualquier cajón, zapatero o baulera. Se abre y te cuenta sus medidas.</p>
      <div class="m-explore-grid">
        <div class="m-plan-wrap">
          <svg id="m-plan" viewBox="0 0 360 470" role="group" aria-label="Plano de la cama vista desde arriba. Tocá un cajón o una baulera."></svg>
          <p class="m-plan-note">Esquema ilustrativo, no está a escala.</p>
        </div>
        <div class="m-card" id="m-card" aria-live="polite">
          <div class="m-card-empty" id="m-card-empty">
            <span class="m-hand" aria-hidden="true">👆</span>
            <b>Elegí una parte de la cama</b>
            <span>Por ejemplo, un cajón del costado o la baulera del centro.</span>
          </div>
          <div class="m-card-body" id="m-card-body" hidden>
            <span class="m-card-kind" id="m-card-kind"></span>
            <h3 id="m-card-title"></h3>
            <dl id="m-card-dl"></dl>
            <p class="m-card-soft" id="m-card-soft" hidden>Con cierre suave: el cajón se frena solo y cierra sin golpe.</p>
          </div>
          <div class="m-legend">
            <span><i class="lg lg-c"></i> Cajón</span>
            <span><i class="lg lg-b"></i> Baulera</span>
            ${m.zapateros.length ? '<span><i class="lg lg-z"></i> Zapatero</span>' : ''}
            ${m.estantes ? '<span><i class="lg lg-e"></i> Estantes</span>' : ''}
          </div>
        </div>
      </div>
    </section>

    <section class="m-specs">
      <span class="eyebrow">Ficha técnica</span>
      <h2>Todo lo que tenés que saber</h2>
      <div class="m-tabs" role="tablist" aria-label="Ficha técnica">
        <button type="button" class="m-tab" role="tab" id="tb-guardado" aria-controls="pn-guardado" aria-selected="true">Cuánto guarda</button>
        <button type="button" class="m-tab" role="tab" id="tb-materiales" aria-controls="pn-materiales" aria-selected="false">Materiales</button>
        <button type="button" class="m-tab" role="tab" id="tb-medidas" aria-controls="pn-medidas" aria-selected="false">Medidas</button>
        <button type="button" class="m-tab" role="tab" id="tb-entrega" aria-controls="pn-entrega" aria-selected="false">Entrega y garantía</button>
      </div>
      <div class="m-panels">
        <div class="m-panel" role="tabpanel" id="pn-guardado" aria-labelledby="tb-guardado"><ul>${lista(guardado)}</ul></div>
        <div class="m-panel" role="tabpanel" id="pn-materiales" aria-labelledby="tb-materiales">
          <p><b>Tableros:</b> melamina Egger de primera calidad, 15 mm, blanca por dentro y por fuera.</p>
          <p><b>Cantos:</b> ABS termofusionados.</p>
          <p><b>Uniones:</b> tornillos con cola, más grampas y clavos, con refuerzos.</p>
          <p><b>Base del colchón:</b> melamina Egger, con refuerzo central interno. Sin patas.</p>
          <p><b>Correderas:</b> telescópicas reforzadas Eurohard. El cajón sale 40 cm. Hay repuestos. También se pueden pedir con cierre suave.</p>
          <p><b>Colchón:</b> sirve cualquier tipo.</p>
          <p><b>Carga:</b> soporta hasta ${m.carga} kg. Se midió sumando peso hasta que cedió.</p>
        </div>
        <div class="m-panel" role="tabpanel" id="pn-medidas" aria-labelledby="tb-medidas">
          <p><b>Medida total:</b> ${m.largoTotal} × ${m.anchoTotal} cm.</p>
          <p><b>Altura:</b> ${m.alto} cm.</p>
          <p><b>Para colchón de:</b> ${esc(m.colchon)}.</p>
        </div>
        <div class="m-panel" role="tabpanel" id="pn-entrega" aria-labelledby="tb-entrega">
          <p><b>Plazo:</b> entre 5 y 10 días, según la situación. Trabajamos con stock y a pedido.</p>
          <p><b>Entrega:</b> CABA y alrededores sin cargo. Para otras zonas, consultanos.</p>
          <p><b>Pagos:</b> efectivo, transferencia y tarjeta.</p>
          <p><b>Cambios:</b> si algo no está bien, avisás y pasamos a cambiarla.</p>
          <p><b>Garantía de 10 años,</b> por escrito: el primer año con servicio a domicilio y del segundo al décimo con reparación en fábrica.</p>
        </div>
      </div>
    </section>

    <section class="m-tools">
      <h2>Antes de decidir</h2>
      <div class="m-tools-grid">
        <a href="/calculadora-espacio.html?m=${m.slug}"><b>¿Entra en tu cuarto?</b><span>Poné el largo y ancho de tu cuarto y mirá si la cama y sus cajones entran.</span></a>
        <a href="/comparar.html?a=${m.slug}"><b>Compará con otro modelo</b><span>Cajones, bauleras, carga y precio lado a lado.</span></a>
        <a href="/configurar.html?m=${m.slug}"><b>Armala a tu gusto</b><span>Elegí color y cierre suave y mirá el precio final.</span></a>
      </div>
    </section>

    ${mismos.length ? `<section class="m-otros"><h2>Otros modelos ${esc(m.lineaNombre)}</h2><div class="m-otros-grid">${mismos.map(x => {
      const q = D.PRODUCTS[x.idx];
      return `<a class="m-otro" href="/camas-box/${x.slug}/"><img src="${webp(q.img, 'm')}" alt="${esc(x.titulo)}" width="480" height="640" loading="lazy"><b>${esc(x.corto)}</b><span>${x.cajones} cajones · ${pesos(q.price)}</span></a>`;
    }).join('')}</div></section>` : ''}

    <section class="m-end">
      <h2>¿Te quedó alguna duda?</h2>
      <p>Escribinos y te respondemos en el día.</p>
      <a class="btn-whatsapp" id="m-wa2" href="https://wa.me/5491168767075" target="_blank" rel="noopener">Consultar por WhatsApp</a>
    </section>
  </div>
</main>
<script type="application/json" id="m-data">${JSON.stringify(datos)}</script>
` + pie('<script src="/js/modelos.js?v=20261013"></script>\n<script src="/js/zonas-envio.js?v=20261013"></script>\n<script src="/js/plano.js?v=20261013"></script>\n<script src="/js/modelo.js?v=20261013"></script>\n<script src="/js/carrusel.js?v=20261013"></script>\n<script src="/js/pestanas.js?v=20261013"></script>');
}

// ---------- catálogo ----------
function resumenCorto(m) {
  const partes = [m.cajones + ' cajones'];
  if (m.zapateros.length) partes.push(m.zapateros.length + (m.zapateros.length === 1 ? ' zapatero' : ' zapateros'));
  if (m.estantes) partes.push(m.estantes.n + ' estantes en los pies');
  const nb = PM.totalBauleras(m); if (nb) partes.push(nb + (nb === 1 ? ' baulera' : ' bauleras'));
  return (partes.length > 1 ? partes.slice(0, -1).join(', ') + ' y ' + partes[partes.length - 1] : partes[0]) + '.';
}

function catalogo() { // el catálogo aparte se eliminó: Productos es la única entrada
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Camas box | ProMuebles</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="${SITIO}/productos.html">
<meta http-equiv="refresh" content="0; url=/productos.html">
<script>var h = location.hash.replace(/^#/, ''); location.replace('/productos.html' + (/^(1-plaza|1-plaza-y-media|2-plazas|queen|king)$/.test(h) ? '?cat=' + h : ''));</script>
</head>
<body><p>Esta página se mudó a <a href="/productos.html">Productos</a>.</p></body>
</html>
`;
}

// ---------- ejecutar ----------
PM.MODELOS.forEach(m => escribir('camas-box/' + m.slug + '/index.html', pagina(m)));
escribir('camas-box/index.html', catalogo());

// Contenido: preguntas frecuentes y artículos
const ayuda = { cabecera, pie, esc };
escribir('preguntas-frecuentes/index.html', contenido.faq(ayuda));
escribir('envios/index.html', contenido.envios(ayuda));
escribir('articulos/index.html', contenido.indiceArticulos(ayuda));
Object.keys(contenido.ARTICULOS).forEach(sl => escribir('articulos/' + sl + '/index.html', contenido.articulo(sl, ayuda)));

// Herramientas del comprador (páginas con su propio script)
const hp = require('./paginas-herramientas.js');
Object.keys(hp).forEach(k => escribir(k, hp[k]({ cabecera, pie, esc, pesos, webp, WA_SVG, SITIO })));

// Reseñas reales dentro de páginas escritas a mano (entre los marcadores <!--RESENAS--> y <!--/RESENAS-->)
function inyectarResenas(archivo) {
  const f = path.join(raiz, archivo);
  let t = fs.readFileSync(f, 'utf8');
  const a = t.indexOf('<!--RESENAS-->'), b = t.indexOf('<!--/RESENAS-->');
  if (a < 0 || b < 0) throw new Error('Faltan los marcadores de reseñas en ' + archivo);
  t = t.slice(0, a) + '<!--RESENAS-->\n  <section class="section"><div class="wrap">' + contenido.resenasHTML(esc) + '</div></section>\n  ' + t.slice(b);
  fs.writeFileSync(f, t);
}
['productos.html', 'quienes-somos.html'].forEach(inyectarResenas);

// sitemap, robots, datos abiertos
const urls = ['/', '/productos.html', '/elegir-cama.html', '/comparar.html', '/calculadora-espacio.html', '/configurar.html', '/preguntas-frecuentes/', '/articulos/', '/articulos/como-elegir-una-cama-box/', '/articulos/espacio-para-abrir-los-cajones/', '/envios/',
  '/quienes-somos.html', '/instalaciones.html', '/testimonios.html', '/contacto.html']
  .concat(PM.MODELOS.map(m => '/camas-box/' + m.slug + '/'));
escribir('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map(u => `  <url><loc>${SITIO}${u === '/' ? '/' : u}</loc><lastmod>${HOY}</lastmod></url>`).join('\n') + '\n</urlset>\n');
escribir('robots.txt', `# ProMuebles — todo el sitio es público. Buscadores y asistentes de IA pueden leerlo.
User-agent: *
Allow: /

Sitemap: ${SITIO}/sitemap.xml
`);

const abierto = PM.MODELOS.map(m => {
  const p = D.PRODUCTS[m.idx];
  return {
    id: m.slug, nombre: m.titulo, url: SITIO + '/camas-box/' + m.slug + '/', linea: m.lineaNombre, colchon: m.colchon,
    precio_ars: p.price, precio_anterior_ars: p.priceOld || null,
    medida_total_cm: { largo: m.largoTotal, ancho: m.anchoTotal, alto: m.alto },
    cajones: m.cajones, cajones_laterales: PM.lateralesTotal(m), cajones_al_pie: PM.frontalesTotal(m), medida_cajon_lateral_cm: m.laterales.dim,
    zapateros_ancho_cm: m.zapateros, estantes: m.estantes ? { cantidad: m.estantes.n, ancho_cm: m.estantes.dim[0], alto_cm: m.estantes.dim[2], profundidad_cm: m.estantes.dim[1] } : null,
    bauleras: { centrales: m.bauleras.central, cabecera_cm: m.bauleras.cabecera },
    carga_maxima_kg: m.carga, material: 'Melamina Egger 15 mm, cantos ABS termofusionados', correderas: 'Telescópicas reforzadas Eurohard, extensión 40 cm',
    cierre_suave: { disponible: true, adicional_por_cajon_ars: PM.CIERRE_SUAVE_POR_CAJON, cajones_con_cierre_suave: m.cajones },
    garantia_anios: 10, plazo_dias: '5 a 10', fabricante: 'ProMuebles, Moisés Lebensohn 1068, Boulogne, Buenos Aires, Argentina'
  };
});
escribir('datos/modelos.json', JSON.stringify({ actualizado: HOY, moneda: 'ARS', modelos: abierto }, null, 1));
escribir('llms.txt', `# ProMuebles
> Fábrica de camas box con cajones y bauleras en Boulogne, Buenos Aires, Argentina. Fabricación propia, melamina Egger de 15 mm, correderas Eurohard, 10 años de garantía.

- [Productos: catálogo de camas box](${SITIO}/productos.html): los 24 modelos, de 1 plaza a King
- [Datos técnicos de todos los modelos (JSON)](${SITIO}/datos/modelos.json): medidas, cajones, bauleras, carga y precios
- [Comparar modelos](${SITIO}/comparar.html)
- [Contacto](${SITIO}/contacto.html): WhatsApp +54 9 11 6876-7075
`);

console.log('Páginas de modelo:', PM.MODELOS.length, '| sitemap con', urls.length, 'URLs');
