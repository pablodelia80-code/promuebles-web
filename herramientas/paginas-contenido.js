// Preguntas frecuentes, artículos y componente de reseñas. Textos aprobados por Pablo; datos confirmados con Pedro (01/10/2026).
const resenas = require('./resenas.js');
const TIENDA = 'https://www.mercadolibre.com.ar/pagina/promuebles1';

const FAQ = [
  ['¿Cuál es la diferencia entre la cama de 8, 12 y 18 cajones?', 'La estructura es la misma. Cambia la cantidad de cajones y cómo se reparten. La 8 Vip tiene 8 cajones (4 de cada lado) y 2 zapateros al pie. La 12 Vip tiene 12 (8 en los costados y 4 al pie). La 18 Vip tiene 18 (12 en los costados y 6 al pie) y es 10 cm más alta. Las tres tienen 3 bauleras y soportan hasta 1000 kg.'],
  ['¿Cuánto peso soporta cada cama?', 'La de 1 plaza soporta hasta 600 kg, la de plaza y media hasta 800 kg, y las de 2 plazas, Queen y King hasta 1000 kg. La carga se midió de verdad: se fue sumando peso hasta que la estructura cedió.'],
  ['¿Qué correderas usan y se consiguen repuestos?', 'Telescópicas reforzadas Eurohard. El cajón sale 40 cm. Hay repuestos y, si una se rompe, está cubierta por la garantía. Se pueden pedir también con cierre suave.'],
  ['¿Qué es el cierre suave y cuánto sale?', 'Es una opción en las correderas: el cajón se frena solo y cierra sin golpe. Tiene un adicional que se suma al precio total. En la ficha de cada cama activás la opción y ves el precio final.'],
  ['¿De qué material están hechas?', 'De melamina Egger de primera calidad, de 15 mm, blanca por dentro y por fuera, con cantos ABS termofusionados. Las piezas se unen con tornillos y cola, más grampas y clavos. La base del colchón lleva un refuerzo central interno y no tiene patas.'],
  ['¿Cómo es el armado y la entrega? ¿Cuánto tarda?', 'Fabricamos en Boulogne y la entrega demora entre 5 y 10 días. Trabajamos con stock y a pedido. Llevamos la cama, la subimos y la armamos.'],
  ['¿Hasta dónde llegan y cuánto cuesta el envío?', 'CABA es sin cargo. En zona sur y zona oeste es sin cargo hasta 10 km del límite de CABA, y en zona norte hasta 25 km de General Paz. Más lejos hay un valor según la distancia. Siempre incluye envío, subida y armado. Si estás más lejos de lo que entregamos, podés retirar la cama por la puerta de la fábrica. Escribí tu localidad en la <a href="/envios/">página de envíos</a> y ves el valor.'],
  ['¿Qué pasa si se rompe algo? ¿Cómo es la garantía?', 'La garantía es de 10 años, por escrito. El primer año incluye servicio a domicilio. Del segundo al décimo se repara en la fábrica. Cubre cajones, correderas, rieles y herrajes.'],
  ['¿Cuánto espacio necesito libre para abrir los cajones?', 'Los cajones salen 40 cm, así que conviene dejar al menos esa distancia junto a cada lado con cajones y al pie de la cama. En la herramienta <a href="/calculadora-espacio.html">¿Entra en tu cuarto?</a> cargás las medidas de tu habitación y lo comprobás.'],
  ['¿Qué colchón necesito?', 'Sirve cualquier tipo de colchón. Lo que tenés que elegir es la medida: 80 × 190, 100 × 190, 140 × 190, 160 × 200, 180 × 200 o 200 × 200 cm, según el modelo.'],
  ['¿Se puede pedir en otro color o con cambios?', 'Todas se fabrican en blanco. En otro color hay un adicional, y hay 8 colores a elegir. También se puede diseñar la cama a medida, por ejemplo cambiando los cajones de los costados, en el <a href="/configurar.html">configurador</a>. Mandás la solicitud por WhatsApp y confirmamos que se pueda fabricar, el precio y el plazo.'],
  ['¿Qué formas de pago aceptan?', 'Efectivo, transferencia y tarjeta.'],
  ['¿En qué se diferencia una cama box de una cama tradicional?', 'En una cama tradicional el espacio de abajo queda vacío o con un solo cajón. En la cama box ese espacio se aprovecha completo: tiene cajones, bauleras y zapateros dentro de la misma estructura, así que podés guardar la ropa y reducir el placard.']
];
const sinTags = s => s.replace(/<[^>]+>/g, '');

function faq({ cabecera, pie, esc }) {
  const jsonld = [{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: sinTags(a) } })) }];
  return cabecera('Preguntas frecuentes sobre camas box | ProMuebles', 'Respuestas claras sobre las camas box de ProMuebles: cajones, carga, correderas, cierre suave, materiales, envío, armado, garantía y pagos.', '/preguntas-frecuentes/', { jsonld }) + `
<main class="modelo" id="contenido">
  <div class="wrap" style="max-width:860px">
    <nav class="crumbs"><a href="/productos.html">Productos</a><span>›</span><b>Preguntas frecuentes</b></nav>
    <span class="eyebrow">Ayuda</span>
    <h1>Preguntas frecuentes</h1>
    <p class="m-lead">Todo lo que nos preguntan antes de elegir una cama.</p>
    <div class="m-specs" style="margin-top:22px">
      ${FAQ.map(([q, a], i) => `<details class="m-acc"${i === 0 ? ' open' : ''}><summary><span>${esc(q)}</span><i></i></summary><div class="m-acc-body"><p>${a}</p></div></details>`).join('\n      ')}
    </div>
    <section class="m-end"><h2>¿Te quedó alguna duda?</h2><p>Escribinos y te respondemos en el día.</p><a class="btn-whatsapp" href="https://wa.me/5491168767075" target="_blank" rel="noopener">Consultar por WhatsApp</a></section>
  </div>
</main>
` + pie();
}

function resenasHTML(esc) {
  const est = '<span class="rs-stars" role="img" aria-label="5 de 5 estrellas">★★★★★</span>';
  return `<section class="m-resenas" aria-labelledby="rs-t">
    <div class="rs-head">
      <span class="rs-sello">Opiniones reales de compradores</span>
      <h2 id="rs-t">Lo que dicen quienes ya tienen su cama</h2>
      <p>Son opiniones de compras reales, escritas por los propios compradores en Mercado Libre. Las copiamos tal cual, sin cambiarles una palabra. <b>Podés comprobarlas vos mismo:</b> cada una lleva el enlace a la publicación donde fue escrita, y todas están en nuestra tienda de Mercado Libre.</p>
    </div>
    <div class="rs-wrap">
      <button class="rs-btn rs-prev" type="button" aria-label="Opiniones anteriores">‹</button>
      <div class="rs-track" tabindex="0">
        ${resenas.map(r => `<figure class="rs-card">${est}<blockquote>“${esc(r.x)}”</blockquote><figcaption><b>Comprador en Mercado Libre</b><span>${r.mes} · <a href="${r.pub.u}" target="_blank" rel="noopener">${esc(r.pub.n)}</a></span></figcaption></figure>`).join('\n        ')}
      </div>
      <button class="rs-btn rs-next" type="button" aria-label="Más opiniones">›</button>
    </div>
    <p class="rs-ver"><a class="rs-ver-btn" href="${TIENDA}" target="_blank" rel="noopener">Ver todas las reseñas en Mercado Libre →</a></p>
  </section>`;
}

const ARTICULOS = {
  'como-elegir-una-cama-box': {
    titulo: 'Cómo elegir una cama box: guía para no equivocarte',
    desc: 'Qué mirar al elegir una cama box con cajones: medida del colchón, cuánto guardado necesitás, altura, materiales, correderas, carga y garantía.',
    resumen: 'Medida, guardado, altura, materiales y correderas: lo que conviene mirar antes de decidir.',
    cuerpo: `
<p>Una cama box reemplaza parte del placard: debajo del colchón tiene cajones, bauleras y, en algunos modelos, zapateros. Elegirla bien depende de pocas cosas. Esta guía te las ordena.</p>
<h2>1. Empezá por la medida del colchón</h2>
<p>La cama se hace para tu colchón. Estas son las medidas que fabricamos: 1 plaza (80 × 190 cm), 1 plaza y media (100 × 190), 2 plazas (140 × 190), Queen (160 × 200), King 180 (180 × 200) y King 200 (200 × 200). Si tenés dudas entre dos, usá la herramienta <a href="/calculadora-espacio.html">¿Entra en tu cuarto?</a> con las medidas de tu habitación.</p>
<h2>2. Calculá cuánto necesitás guardar</h2>
<p>Los modelos se diferencian sobre todo por la cantidad de cajones: desde 4 en una 2 plazas hasta 21 en una King. Pensá en lo que hoy tenés desparramado: ropa de cama, ropa de temporada, calzado. Las <b>bauleras</b> (la central y las de la cabecera) sirven para lo que no usás todos los días, y los <b>zapateros</b> al pie, para el calzado. Si querés ver opciones según lo que necesitás, probá el <a href="/elegir-cama.html">asistente de 4 preguntas</a>.</p>
<h2>3. Fijate en la altura</h2>
<p>La altura de la cama es hasta donde empieza el colchón: 42 cm en casi todos los modelos, y 52 cm en la 18 Vip y la 21 Vip, que tienen más cajones apilados. Sumale el espesor de tu colchón para saber a qué altura queda la cama terminada.</p>
<h2>4. Revisá de qué está hecha</h2>
<p>Nuestras camas son de melamina Egger de primera calidad, de 15 mm, blanca por dentro y por fuera, con cantos ABS termofusionados. Las piezas se unen con tornillos con cola, más grampas y clavos, y la base lleva un refuerzo central interno. No tiene patas.</p>
<h2>5. Las correderas importan</h2>
<p>Son lo que más se usa. Las nuestras son telescópicas reforzadas Eurohard, y el cajón sale 40 cm. Podés pedirlas con <b>cierre suave</b>: el cajón se frena solo y cierra sin golpe. Hay repuestos disponibles.</p>
<h2>6. Mirá cuánto soporta</h2>
<p>La 1 plaza soporta hasta 600 kg, la plaza y media hasta 800 kg, y las de 2 plazas, Queen y King hasta 1000 kg. La carga se midió sumando peso hasta que la estructura cedió.</p>
<h2>7. Pedí la garantía por escrito</h2>
<p>Nuestras camas tienen 10 años de garantía: el primer año con servicio a domicilio y del segundo al décimo con reparación en la fábrica, para cajones, correderas, rieles y herrajes.</p>
<h2>8. Confirmá la entrega y el armado</h2>
<p>Fabricamos en Boulogne y entregamos en 5 a 10 días. Llevamos la cama, la subimos y la armamos. Fijate en la <a href="/envios/">página de envíos</a> si llegamos a tu zona.</p>
<p>Cuando tengas dos o tres candidatas, <a href="/comparar.html">compará los modelos lado a lado</a>.</p>`
  },
  'espacio-para-abrir-los-cajones': {
    titulo: 'Cuánto espacio necesito para abrir los cajones de una cama box',
    desc: 'Los cajones de la cama box salen 40 cm. Mirá cuánto espacio libre necesitás junto a la cama, según la medida, para abrirlos completos.',
    resumen: 'Los cajones salen 40 cm: cuánto lugar dejar al costado y al pie según tu medida.',
    cuerpo: `
<p>Una cama box con cajones necesita lugar para abrirlos. Antes de elegir modelo, conviene comprobar que tu habitación lo permite.</p>
<h2>La regla básica</h2>
<p>Con las correderas telescópicas reforzadas Eurohard, <b>cada cajón sale 40 cm</b>. Por eso hace falta dejar al menos 40 cm libres al costado de cada lado que tenga cajones, y 40 cm al pie si la cama tiene cajones o zapateros allí.</p>
<h2>Cuánto ancho necesito</h2>
<p>Si la cama tiene cajones en los dos costados, sumá 80 cm al ancho de la cama (40 por lado):</p>
<ul>
<li><b>Plaza y media</b> (103 cm de ancho): 183 cm. El modelo esquinero tiene los cajones en un solo lateral, así que necesita 143 cm.</li>
<li><b>2 plazas</b> (143 cm): 223 cm.</li>
<li><b>Queen</b> (163 cm): 243 cm.</li>
<li><b>King 180</b> (183 cm): 263 cm.</li>
<li><b>King 200</b> (203 cm): 283 cm.</li>
<li><b>1 plaza</b> (83 cm, con los cajones de un solo lado): 123 cm.</li>
</ul>
<h2>Cuánto largo necesito</h2>
<p>La cama mide 193 cm de largo (203 cm en Queen y King). La cabecera va contra la pared. Si tiene cajones o zapateros al pie, sumá 40 cm: 233 cm en 1 plaza, plaza y media y 2 plazas, y 243 cm en Queen y King.</p>
<h2>Si no te alcanza el lugar</h2>
<ul>
<li>Pegá al muro el lado que no tiene cajones, si el modelo lo permite (el esquinero está pensado para eso).</li>
<li>Elegí un modelo con menos cajones laterales y más bauleras.</li>
<li>Tené en cuenta puertas de placard y otros muebles, que también necesitan lugar.</li>
</ul>
<h2>Comprobalo con tu habitación</h2>
<p>En <a href="/calculadora-espacio.html">¿Entra en tu cuarto?</a> cargás el largo y el ancho de tu cuarto, elegís el modelo y ves en un plano a escala si entra y si los cajones abren completos, a un lado, al otro y al pie.</p>`
  }
};

function articulo(slug, { cabecera, pie }) {
  const a = ARTICULOS[slug];
  const jsonld = [{ '@context': 'https://schema.org', '@type': 'Article', headline: a.titulo, description: a.desc, inLanguage: 'es-AR', datePublished: '2026-10-01', dateModified: '2026-10-01', author: { '@type': 'Organization', name: 'ProMuebles' }, publisher: { '@type': 'Organization', name: 'ProMuebles', url: 'https://promuebles.com.ar' }, mainEntityOfPage: 'https://promuebles.com.ar/articulos/' + slug + '/' }];
  return cabecera(a.titulo + ' | ProMuebles', a.desc, '/articulos/' + slug + '/', { jsonld }) + `
<main class="modelo" id="contenido">
  <article class="wrap art">
    <nav class="crumbs"><a href="/articulos/">Artículos</a><span>›</span><b>${a.titulo.length > 40 ? a.titulo.slice(0, 40) + '…' : a.titulo}</b></nav>
    <span class="eyebrow">Guía</span>
    <h1>${a.titulo}</h1>
    ${a.cuerpo}
    <section class="m-end"><h2>¿Querés ver las camas?</h2><p>Mirá todos los modelos con sus medidas y precios.</p><a class="btn-whatsapp" href="/productos.html">Ver las camas box</a></section>
  </article>
</main>
` + pie();
}

function indiceArticulos({ cabecera, pie }) {
  return cabecera('Artículos: guías para elegir tu cama box | ProMuebles', 'Guías de ProMuebles para elegir una cama box con cajones y saber cuánto espacio necesitás.', '/articulos/') + `
<main class="modelo" id="contenido">
  <div class="wrap" style="max-width:860px">
    <nav class="crumbs"><b>Artículos</b></nav>
    <span class="eyebrow">Guías</span>
    <h1>Artículos</h1>
    <div class="m-tools-grid" style="grid-template-columns:minmax(0,1fr)">
      ${Object.keys(ARTICULOS).map(s => `<a href="/articulos/${s}/"><b>${ARTICULOS[s].titulo}</b><span>${ARTICULOS[s].resumen}</span></a>`).join('\n      ')}
    </div>
  </div>
</main>
` + pie();
}


const SO = [['Hasta 10 km', 'Sin cargo'], ['De 10 a 20 km', '$50.000'], ['De 20 a 30 km', '$60.000'], ['De 30 a 40 km', '$70.000'], ['De 40 a 50 km', '$80.000'], ['De 50 a 60 km', '$95.000']];
const NO = [['Hasta 25 km', 'Sin cargo'], ['De 25 a 30 km', '$50.000'], ['De 30 a 35 km', '$60.000'], ['De 35 a 45 km', '$70.000'], ['De 45 a 55 km', '$80.000']];
const tabla = (filas) => '<div class="h-tabla-wrap"><table class="h-tabla" style="min-width:0"><thead><tr><th>Distancia por calle</th><th>Envío, subida y armado</th></tr></thead><tbody>' + filas.map(f => '<tr><td>' + f[0] + '</td><td><b>' + f[1] + '</b></td></tr>').join('') + '</tbody></table></div>';

function envios({ cabecera, pie }) {
  return cabecera('Envíos y entrega de camas box | ProMuebles', 'Consultá si llegamos a tu zona y cuánto cuesta el envío de tu cama box. Incluye envío, subida y armado. CABA sin cargo y plazo de entrega de 5 a 10 días.', '/envios/') + `
<main class="modelo" id="contenido">
  <div class="wrap" style="max-width:860px">
    <nav class="crumbs"><a href="/productos.html">Productos</a><span>›</span><b>Envíos</b></nav>
    <span class="eyebrow">Entrega</span>
    <h1>Envíos y entrega</h1>
    <p class="m-lead">Fabricamos en Boulogne y entregamos nosotros. El valor incluye siempre el envío, la subida y el armado. El plazo es de 5 a 10 días.</p>

    <div class="m-envio" style="margin-top:26px">
      <label for="m-zona">¿Llegamos a tu zona?</label>
      <input id="m-zona" type="text" placeholder="Escribí tu barrio o localidad" autocomplete="off" role="combobox" aria-autocomplete="list" aria-controls="m-zona-lista">
      <ul id="m-zona-lista" class="m-zona-lista" role="listbox" hidden></ul>
      <p id="m-zona-res" class="m-zona-res" aria-live="polite"></p>
    </div>

    <h2 class="fab-h2" style="margin-top:36px">Cuánto cuesta</h2>
    <p>La Ciudad de Buenos Aires es siempre <b>sin cargo</b>. Para el resto, medimos la distancia <b>por calle</b> desde el límite de CABA (General Paz y el Riachuelo).</p>
    <h3 style="margin:22px 0 10px;font-size:19px;color:var(--nogal)">Zona sur y zona oeste</h3>
    ${tabla(SO)}
    <h3 style="margin:22px 0 10px;font-size:19px;color:var(--nogal)">Zona norte</h3>
    ${tabla(NO)}
    <p style="margin-top:22px"><b>Más lejos de eso:</b> las entregas de ProMuebles las hacemos de forma personal, por eso no llegamos. Si contás con un transportista o comisionista de confianza, podés retirar tu cama por la puerta de la fábrica: Moisés Lebensohn 1068, Boulogne.</p>
    <section class="m-end"><h2>¿Dudas con tu zona?</h2><p>Escribinos y lo vemos.</p><a class="btn-whatsapp" href="https://wa.me/5491168767075" target="_blank" rel="noopener">Consultar por WhatsApp</a></section>
  </div>
</main>
` + pie('<script src="/js/zonas-envio.js?v=20261013"></script>\n<script>PM.zonas.montar({ input: document.getElementById("m-zona"), lista: document.getElementById("m-zona-lista"), resultado: document.getElementById("m-zona-res") });</script>');
}

module.exports = { envios, faq, articulo, indiceArticulos, resenasHTML, ARTICULOS };
