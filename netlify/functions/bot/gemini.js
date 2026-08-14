// Llama a la API de Gemini. Usa un patrón simple de "acción en JSON" (para
// envío y para linkear un producto) en vez de function-calling formal, para
// no depender de features nuevas (thought signatures, etc.) todavía no probadas.

const { loadCatalog, NEGOCIO } = require('./knowledge');
const { calcularEnvio } = require('./shipping');

const MODEL = 'gemini-3.6-flash';

function slugify(str) {
  const combiningMarks = new RegExp('[̀-ͯ]', 'g');
  return str
    .toLowerCase()
    .normalize('NFD').replace(combiningMarks, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function linkProducto(p) {
  const params = new URLSearchParams({ cat: p.cat, producto: slugify(p.n) });
  if (p.subcat) params.set('king', p.subcat);
  return `productos.html?${params.toString()}`;
}

function buildSystemPrompt(nombreBot) {
  const { products } = loadCatalog();

  const catalogoTexto = products
    .map((p) => `- ${p.n} (${p.medida}): $${p.price.toLocaleString('es-AR')}${p.priceOld ? ` (antes $${p.priceOld.toLocaleString('es-AR')}, en oferta)` : ''} — ${p.resumen}`)
    .join('\n');

  return `Sos ${nombreBot}, y atendés el chat de la web de ProMuebles, una fábrica propia de camas box a medida (CABA y alrededores, Argentina). Hablás como una persona real del equipo, no como un bot corporativo: tono informal, cálido, con "vos" (no "tú"), oraciones cortas, sin sonar a folleto de ventas.

REGLAS DURAS (no las rompas):
1. Nunca inventes datos de productos, precios, historia o políticas que no estén acá abajo. Si no sabés algo, decilo con naturalidad y ofrecé pasar a un humano.
2. Nunca inventes ni estimes un costo de envío vos mismo. Para eso existe la ACCIÓN "calcular_envio" de abajo.
3. Si el cliente pide explícitamente hablar con una persona / con Pedro, respondé con calidez y pasale este link de WhatsApp: ${NEGOCIO.whatsapp}
4. No uses markdown (nada de **negrita**, títulos con #, ni listas con guiones). Es un chat de texto plano — si querés destacar algo, hacelo con las palabras, no con símbolos.
5. Cuando le confirmes a un cliente un modelo puntual del catálogo (porque preguntó por él o porque se lo recomendaste), usá la ACCIÓN "ver_producto" para pasarle el link directo a esa ficha, en vez de solo describirlo en texto.

CATÁLOGO (nombre, medida, precio, resumen):
${catalogoTexto}

PERSONALIZACIÓN: ${NEGOCIO.personalizacion}

FORMA DE PAGO: ${NEGOCIO.pago}

TIEMPOS DE ENTREGA: ${NEGOCIO.tiempos}

ENVÍO: ${NEGOCIO.envio.resumen}

ACCIONES DISPONIBLES — cuando necesites una, respondé ÚNICA Y EXCLUSIVAMENTE con el JSON correspondiente (nada de texto antes o después, nada de markdown, nada de explicar que estás usando una acción). Vas a recibir el resultado real y ahí sí le contestás al cliente con naturalidad:
- Costo de envío a una localidad concreta: {"accion":"calcular_envio","localidad":"<la localidad que dijo el cliente>"}
- Link directo a la ficha de un modelo del catálogo: {"accion":"ver_producto","producto":"<nombre EXACTO del catálogo de arriba>"}

CONTACTO SI HACE FALTA: WhatsApp ${NEGOCIO.whatsapp} · ${NEGOCIO.email}`;
}

async function callGemini(contents, systemPrompt, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      systemInstruction: { parts: [{ text: systemPrompt }] },
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API ${res.status}: ${errText}`);
  }
  const data = await res.json();
  const candidate = data.candidates && data.candidates[0];
  const text = candidate?.content?.parts?.map((p) => p.text || '').join('') || '';
  return text;
}

function tryParseAccion(text) {
  const trimmed = text.trim();
  if (!trimmed.startsWith('{')) return null;
  try {
    const obj = JSON.parse(trimmed);
    if (obj.accion === 'calcular_envio' && obj.localidad) return obj;
    if (obj.accion === 'ver_producto' && obj.producto) return obj;
  } catch (e) {
    return null;
  }
  return null;
}

const NOTA_ARMADO = 'Con el envío además contás con la subida de la cama y el armado. ProMuebles se ocupa de todo, te la lleva, la sube y en menos de 10 minutos la deja armada en tu habitación.';

function formatearResultadoEnvio(resultado) {
  if (!resultado.ok) {
    return 'No se pudo identificar esa localidad. Pedile al cliente que la escriba de otra forma (con la ciudad/partido), o dale la opción de coordinar por WhatsApp.';
  }
  if (resultado.gratis && resultado.motivo === 'cerca_fabrica') {
    return `Envío GRATIS: el lugar está a ${resultado.km_fabrica}km de la fábrica (dentro del radio de ${NEGOCIO.envio.radio_gratis_fabrica_km}km sin cargo). ${NOTA_ARMADO}`;
  }
  if (resultado.fuera_de_rango) {
    return `El lugar está a ${resultado.km_caba}km de CABA, fuera de las zonas de envío habituales. Contale al cliente que para esa distancia hay que coordinar directamente con Pedro por WhatsApp para ver si es posible y a qué costo.`;
  }
  if (resultado.gratis) {
    return `Envío GRATIS: está a ${resultado.km_caba}km de CABA, dentro de la zona sin cargo. ${NOTA_ARMADO}`;
  }
  return `Envío: $${resultado.precio.toLocaleString('es-AR')} — el lugar está a ${resultado.km_caba}km de CABA. ${NOTA_ARMADO}`;
}

function formatearResultadoProducto(nombreBuscado) {
  const { products } = loadCatalog();
  const buscado = nombreBuscado.trim().toLowerCase();
  const match = products.find((p) => p.n.toLowerCase() === buscado)
    || products.find((p) => p.n.toLowerCase().includes(buscado) || buscado.includes(p.n.toLowerCase()));

  if (!match) {
    return `No encontré ese modelo exacto en el catálogo ("${nombreBuscado}"). No le pases ningún link — describíselo solo con lo que sabés del catálogo, o preguntale más detalles.`;
  }
  return `Acá tenés el link real a la ficha de "${match.n}": ${linkProducto(match)} — pasáselo al cliente tal cual, integrado naturalmente en la respuesta.`;
}

async function resolverAccion(accion) {
  if (accion.accion === 'calcular_envio') {
    const resultado = await calcularEnvio(accion.localidad);
    return formatearResultadoEnvio(resultado);
  }
  if (accion.accion === 'ver_producto') {
    return formatearResultadoProducto(accion.producto);
  }
  return null;
}

// history: [{role: 'user'|'model', text: string}]
async function chat(history, userMessage, nombreBot, apiKey) {
  const systemPrompt = buildSystemPrompt(nombreBot);

  const contents = history.map((h) => ({ role: h.role, parts: [{ text: h.text }] }));
  contents.push({ role: 'user', parts: [{ text: userMessage }] });

  let text = await callGemini(contents, systemPrompt, apiKey);
  const accion = tryParseAccion(text);

  if (accion) {
    const nota = await resolverAccion(accion);

    contents.push({ role: 'model', parts: [{ text }] });
    contents.push({
      role: 'user',
      parts: [{ text: `[Resultado real — usalo para responder, no muestres JSON ni menciones que hiciste una acción interna]: ${nota}` }],
    });

    text = await callGemini(contents, systemPrompt, apiKey);
  }

  return text;
}

module.exports = { chat };
