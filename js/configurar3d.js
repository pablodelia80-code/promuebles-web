// Configurador con la cama en 3D (versión de prueba de configurar.html): el cliente elige tamaño, modelo, cajones, color y cierre suave,
// ve la cama armada en el showroom y envía su solicitud por WhatsApp. La cama 3D es el motor js/cama3d.js.
import { crearCama3D } from './cama3d.js?v=20261057';

const PM = window.PM, COL = COLORS;
COL.forEach(c => { if (c.tex) c.tex += '?v=20261057'; if (c.tex3) c.tex3 += '?v=20261057'; });   // las texturas se actualizan aunque el navegador tenga las anteriores
const ORDEN = ['1-plaza', '1-plaza-y-media', '2-plazas', 'queen', 'king-180', 'king-200'];
const el = id => document.getElementById(id);
const st = { color: 0, soft: false };
let api = null;
const nombreCorto = m => m.corto.replace(/ (Queen|King 180|King 200|Plaza y Media)$/, '');

api = crearCama3D(el('cz-escena'), PM, {
  alInteractuar: () => { el('cz-ayuda').style.opacity = 0; },
  onCambio: () => botones(),
  onSelect: info => ficha(info)
});

// ---------- cuentas del pedido ----------
function totalCajones() {
  const m = api.modelo, e = api.estado; let n = 0;
  ['izq', 'der'].forEach(k => e[k].forEach(s => { n += s === 'G' ? 1 : (s === 'N' ? 2 : m.latNiveles); }));
  if (e.pie.tipo === 'cajones') e.pie.lados.forEach(s => { n += s === 'G' ? 1 : 2; });
  else if (e.pie.tipo === 'frontales') n += PM.frontalesTotal(m);
  return n;
}
function firma(m, e) {
  const pie = e.pie.tipo === 'cajones' ? 'C' + e.pie.lados.slice().sort().join('') : (e.pie.tipo === 'zapateros' ? 'Z' : (e.pie.tipo === 'estantes' ? 'E' : 'F' + JSON.stringify(m.frontales.map(f => [f.n, f.dim]))));
  return [m.linea, m.alto, JSON.stringify(m.bauleras), e.izq.slice().sort().join(''), e.der.slice().sort().join(''), pie].join('|');
}
function equivalente() { const f = firma(api.modelo, api.estado); return PM.MODELOS.find(x => firma(x, api.estadoDe(x)) === f) || null; }
function textoLados(lados) {
  const c = api.PIE_CFG[api.modelo.linea], nG = lados.filter(s => s === 'G').length, nN = lados.length - nG, t = [];
  if (nG) t.push((nG === 1 ? '1 cajón grande' : nG + ' cajones grandes') + ' (' + c.g + ' × 40 × 30 cm)');
  if (nN) t.push(nN * 2 + ' cajones normales (' + c.n + ' × 40 × 15 cm)');
  return t.join(' y ');
}
function etiquetaPie() {
  const m = api.modelo, e = api.estado;
  if (e.pie.tipo === 'cajones') return textoLados(e.pie.lados);
  if (e.pie.tipo === 'zapateros') { const w = m.zapateros.length ? m.zapateros : api.PIE_CFG[m.linea].zap; return PM.textoZapateros(Object.assign({}, m, { zapateros: w })); }
  if (e.pie.tipo === 'estantes') return m.estantes.n + ' estantes (' + m.estantes.dim[0] + ' cm de ancho cada uno)';
  const dims = []; m.frontales.forEach(f => { for (let i = 0; i < f.n; i++) dims.push(f.dim); });
  return dims.length + ' cajones al pie (' + PM.agrupar(dims).map(x => x.n + ' de ' + PM.fmt(x.dim)).join(' y ') + ')';
}
function lineaLat(lado) {
  const a = api.estado[lado]; if (!a.length) return null;
  let g = 0, n = 0, f = 0; a.forEach(s => { if (s === 'G') g++; else if (s === 'N') n++; else f++; });
  const t = []; if (g) t.push(g + (g === 1 ? ' cajón grande' : ' cajones grandes')); if (n) t.push(n * 2 + ' cajones normales'); if (f) t.push(f * api.modelo.latNiveles + ' cajones apilados');
  return t.join(' y ');
}

// ---------- ficha de la parte tocada ----------
function ficha(info) {
  const m = api.modelo, e = api.estado, lat = m.laterales, cfg = api.PIE_CFG[m.linea], soft = st.soft ? ' con cierre suave' : '';
  let tipo = '', titulo = '', filas = [], cambiar = null;
  const niveles = (k, n) => k === 2 ? (n === 0 ? 'Abajo' : 'Arriba') : (k === 3 ? ['Abajo', 'En el medio', 'Arriba'][n] : null);
  const filaNivel = (k, n) => niveles(k, n) ? [['Nivel', niveles(k, n) + ' (apilado)']] : [];
  const corr = [['Al abrirlo', 'Sale 40 cm'], ['Correderas', 'Telescópicas reforzadas Eurohard' + soft]];
  if (info.tipo === 'cajon' && info.zona === 'lat') {
    const alto = info.tipoSlot === 'G' ? 30 : (info.tipoSlot === 'N' ? 15 : lat.dim[2]);
    tipo = 'Cajón'; titulo = 'Cajón del costado';
    filas = [['Medidas', PM.fmt([lat.dim[0], lat.dim[1], alto])], ['Ubicación', lat.der === 0 ? 'Un solo lateral de la cama' : (info.lado === 'izq' ? 'Lado izquierdo' : 'Lado derecho')]].concat(filaNivel(info.k, info.nivel), corr);
    if (info.tipoSlot === 'G' || info.tipoSlot === 'N') cambiar = { txt: info.tipoSlot === 'G' ? 'Cambiar este lugar por 2 cajones normales' : 'Cambiar este lugar por 1 cajón grande', fn: () => { e[info.lado][info.slot] = info.tipoSlot === 'G' ? 'N' : 'G'; api.armar(); todo(); } };
  } else if (info.tipo === 'cajon') {
    let dim;
    if (e.pie.tipo === 'cajones') dim = e.pie.lados[info.col] === 'G' ? [cfg.g, 40, 30] : [cfg.n, 40, 15];
    else { const cols = []; m.frontales.forEach(f => { for (let i = 0; i < Math.max(1, Math.round(f.n / (f.niveles || 1))); i++) cols.push(f.dim); }); dim = cols[info.col] || m.frontales[0].dim; }
    tipo = 'Cajón'; titulo = 'Cajón del pie';
    filas = [['Medidas', PM.fmt(dim)], ['Ubicación', 'Al pie de la cama']].concat(filaNivel(info.k, info.nivel), corr);
    if (e.pie.tipo === 'cajones') cambiar = { txt: e.pie.lados[info.col] === 'G' ? 'Cambiar este lugar por 2 cajones normales' : 'Cambiar este lugar por 1 cajón grande', fn: () => { e.pie.lados[info.col] = e.pie.lados[info.col] === 'G' ? 'N' : 'G'; api.armar(); todo(); } };
  } else if (info.tipo === 'zapatero') {
    tipo = 'Zapatero'; titulo = 'Zapatero al pie';
    filas = [['Ancho', Math.round(info.ancho + 1.2) + ' cm'], ['Alto', '39 cm'], ['Profundidad', '40 cm']].concat(m.pares ? [['Capacidad', m.pares + ' pares']] : [], [['Ubicación', 'Al pie de la cama'], ['Cómo se abre', 'La puerta se abate hacia afuera']]);
  } else {
    tipo = 'Baulera';
    const cab = info.clave.indexOf('cab') === 0, d = cab ? m.bauleras.cabecera[+info.clave.slice(3)] : (m.bauleras.central[0] || {}).dim;
    titulo = cab ? 'Baulera de la cabecera' : 'Baulera central';
    filas = (d ? [['Medidas', PM.fmt(d)]] : []).concat([['Ubicación', cab ? 'En la cabecera de la cama' : (lat.der === 0 ? 'Del lado opuesto a los cajones' : 'Centro de la cama')], ['Tapa', 'Se abre desde arriba']]);
  }
  el('cz-ficha-vacia').hidden = true; el('cz-ficha-cuerpo').hidden = false;
  el('cz-f-tipo').textContent = tipo; el('cz-f-titulo').textContent = titulo;
  const dl = el('cz-f-dl'); dl.innerHTML = '';
  filas.forEach(f => { const r = document.createElement('div'), a = document.createElement('dt'), b = document.createElement('dd'); a.textContent = f[0]; b.textContent = f[1]; r.appendChild(a); r.appendChild(b); dl.appendChild(r); });
  const bt = el('cz-f-cambiar');
  if (cambiar) { bt.hidden = false; bt.textContent = cambiar.txt; bt.onclick = cambiar.fn; } else bt.hidden = true;
  if (window.innerWidth <= 900) setTimeout(() => window.scrollTo({ top: Math.max(0, el('cz-ficha').getBoundingClientRect().top + window.scrollY - alturaFija() - 8), behavior: 'smooth' }), 60);
}
function cerrarFicha() { el('cz-ficha-vacia').hidden = false; el('cz-ficha-cuerpo').hidden = true; }

// ---------- paneles ----------
function botones() {
  if (!api) return;
  el('cz-abrir').textContent = api.hayCerrados() ? 'Abrir todos los cajones' : 'Cerrar todos los cajones';
  el('cz-bau').textContent = api.hayBauleraCerrada() ? 'Abrir las bauleras' : 'Cerrar las bauleras';
}
function paneles() {
  const m = api.modelo, e = api.estado, PIE = api.PIE_CFG;
  const chips = el('cz-medida'); chips.innerHTML = '';
  ORDEN.forEach(k => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'f-chip' + (k === m.linea ? ' on' : '');
    b.innerHTML = '<b>' + PM.LINEAS[k].nombre + '</b><span>' + PM.LINEAS[k].colchon + '</span>';
    b.addEventListener('click', () => { cambiarModelo(PM.porPrecio(PM.MODELOS.filter(x => x.linea === k))[0]); irPaso(2, true); });
    chips.appendChild(b);
  });
  const lista = el('cz-modelo'); lista.innerHTML = '';
  PM.porPrecio(PM.MODELOS.filter(x => x.linea === m.linea)).forEach(x => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'f-chip' + (x.slug === m.slug ? ' on' : ''); b.setAttribute('aria-pressed', x.slug === m.slug ? 'true' : 'false');
    b.innerHTML = '<b>' + nombreCorto(x) + '</b><span>' + x.cajones + ' cajones</span>';
    b.addEventListener('click', () => cambiarModelo(x));
    lista.appendChild(b);
  });
  // costados
  const lat = el('cz-lat'); lat.innerHTML = '';
  const editable = !!(m.laterales.patron || m.latNiveles <= 2);
  el('cz-bloque-lat').hidden = !editable;
  const GN = [['G', '1 grande'], ['N', '2 normales']];
  const grupo = (actual, alElegir) => { const g = document.createElement('div'); g.className = 'cz-par'; GN.forEach(([v, t]) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'cz-slot' + (actual === v ? ' on' : ''); b.textContent = t; b.setAttribute('aria-pressed', actual === v ? 'true' : 'false'); b.addEventListener('click', () => { if (actual !== v) alElegir(v); }); g.appendChild(b); }); return g; };
  if (editable) (m.laterales.der === 0 ? [['izq', 'Lateral']] : [['izq', 'Lado izquierdo'], ['der', 'Lado derecho']]).forEach(([k, nombre]) => {
    e[k].forEach((tipo, i) => { const f = document.createElement('div'); f.className = 'cz-fila'; const r = document.createElement('span'); r.textContent = e[k].length > 1 ? nombre + ' · lugar ' + (i + 1) : nombre; f.appendChild(r); f.appendChild(grupo(tipo, v => { e[k][i] = v; api.armar(); cerrarFicha(); todo(); })); lat.appendChild(f); });
  });
  // pie
  const pie = el('cz-pie'); pie.innerHTML = '';
  if (api.puedeCambiarPie(m)) {
    const tipos = [['cajones', 'Cajones al pie'], ['zapateros', 'Zapateros']].concat(PIE[m.linea].estantes ? [['estantes', 'Estantes']] : []);
    tipos.forEach(([v, t]) => {
      const on = (e.pie.tipo === 'frontales' ? 'cajones' : e.pie.tipo) === v;
      const b = document.createElement('button'); b.type = 'button'; b.className = 'cz-op' + (on ? ' on' : ''); b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', on ? 'true' : 'false'); b.textContent = t;
      b.addEventListener('click', () => {
        e.pie.tipo = v;
        if (v === 'estantes' && !m.estantes) api.reemplazarModelo(Object.assign({}, m, { estantes: { n: 4, dim: [m.linea === 'queen' ? 80 : 70, 45, 19] } })); else api.armar();
        cerrarFicha(); todo();
      });
      pie.appendChild(b);
      if (v === 'cajones' && on && e.pie.tipo === 'cajones') {
        const caja = document.createElement('div'); caja.className = 'cz-pie-lados';
        e.pie.lados.forEach((tipo, i) => { const f = document.createElement('div'); f.className = 'cz-fila'; const r = document.createElement('span'); r.textContent = PIE[m.linea].cols === 1 ? 'Cajón del pie' : (i === 0 ? 'Lado izquierdo' : 'Lado derecho'); f.appendChild(r); f.appendChild(grupo(tipo, val => { e.pie.lados[i] = val; api.armar(); cerrarFicha(); todo(); })); caja.appendChild(f); });
        pie.appendChild(caja);
      }
    });
  } else {
    const p = document.createElement('p'); p.className = 'h-nota'; p.style.margin = '0'; p.textContent = 'El pie de este modelo es fijo: ' + etiquetaPie() + '.'; pie.appendChild(p);
  }
  // color
  const cols = el('cz-color'); cols.innerHTML = '';
  COL.forEach((cc, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'cz-col' + (i === st.color ? ' on' : ''); b.setAttribute('aria-pressed', i === st.color ? 'true' : 'false');
    b.innerHTML = '<i style="background:' + (cc.tex ? 'url(' + cc.tex + ') center/cover' : cc.sw) + '"></i><b>' + cc.n + '</b><small>' + (i ? '+ ' + PM.pesos(PM.COLOR_ADICIONAL) : 'Sin adicional') + '</small>';
    b.addEventListener('click', () => { st.color = i; api.setColor(i ? cc : null); todo(); });
    cols.appendChild(b);
  });
  el('cz-soft').setAttribute('aria-checked', st.soft ? 'true' : 'false');
}
function cambiarModelo(m) {
  api.elegirModelo(m); cerrarFicha(); todo();
  try { history.replaceState(null, '', '?m=' + m.slug); } catch (x) { }
}

// ---------- resumen ----------
function resumen() {
  const m = api.modelo, col = COL[st.color], eq = equivalente(), tot = totalCajones();
  const izq = lineaLat('izq'), der = lineaLat('der'), solo = m.laterales.der === 0, pieTxt = etiquetaPie();
  let precio = null;
  if (eq) precio = PM.venta(eq).precio + (st.color ? PM.COLOR_ADICIONAL : 0) + (st.soft ? tot * PM.CIERRE_SUAVE_POR_CAJON : 0);
  const notas = el('cz-notas').value.trim();
  const msg = 'Hola! Quiero pedir una cama a medida.\n' +
    'Medida: ' + m.lineaNombre + ' (colchón ' + m.colchon + ')\n' +
    'Modelo de partida: ' + m.corto + '\n' +
    (solo ? 'Cajones del lateral: ' + izq : 'Cajones del lado izquierdo: ' + izq + '\nCajones del lado derecho: ' + der) + '\n' +
    'Al pie: ' + pieTxt + '\n' +
    'Total de cajones: ' + tot + '\n' +
    'Color: ' + col.n + '\n' +
    'Cierre suave: ' + (st.soft ? 'sí' : 'no') + '\n' +
    (notas ? 'Pedido especial: ' + notas + '\n' : '') +
    (precio ? 'Es igual al modelo ' + eq.corto + '. Precio: ' + PM.pesos(precio) + '.' : 'Quedo a la espera de que me confirmen si se puede fabricar, el precio y el plazo.');
  let h = '<h2>Tu cama</h2><ul class="f-lista">' +
    '<li><span>Medida</span><b>' + m.lineaNombre + ' · ' + m.colchon + '</b></li>' +
    (solo ? '<li><span>Lateral</span><b>' + izq + '</b></li>' : '<li><span>Izquierdo</span><b>' + izq + '</b></li><li><span>Derecho</span><b>' + der + '</b></li>') +
    '<li><span>Al pie</span><b>' + pieTxt + '</b></li>' +
    '<li><span>Total de cajones</span><b>' + tot + '</b></li>' +
    '<li><span>Color</span><b>' + col.n + '</b></li>' +
    '<li><span>Correderas</span><b>' + (st.soft ? 'Con cierre suave' : 'Telescópicas reforzadas') + '</b></li></ul>';
  if (precio) h += '<p class="f-total"><span>Precio final</span><b>' + PM.pesos(precio) + '</b></p><p class="h-nota">Es igual al modelo ' + eq.corto + ': ' + (st.color ? 'incluye el adicional por color. ' : '') + 'El precio incluye envío, subida y armado según tu zona.</p>';
  else h += '<p class="cz-cotizar"><b>Precio a confirmar</b><span>Es una cama a medida: la revisamos y te confirmamos el precio y el plazo.</span></p>';
  h += '<a class="btn-whatsapp m-cta" target="_blank" rel="noopener" href="https://wa.me/5491168767075?text=' + encodeURIComponent(msg) + '">Enviar mi diseño por WhatsApp</a>' +
    '<p class="h-nota" style="margin:0">Esto es una solicitud, no una compra. Revisamos que se pueda fabricar y te respondemos con el precio y el plazo.</p>';
  el('cz-resumen').innerHTML = h;
  st.precioTxt = precio ? PM.pesos(precio) : 'Precio a confirmar';
  st.waHref = 'https://wa.me/5491168767075?text=' + encodeURIComponent(msg);
}
function resumenesPasos() {
  const m = api.modelo, col = COL[st.color], notas = el('cz-notas').value.trim();
  el('res-1').textContent = m.lineaNombre + ' · ' + m.colchon;
  el('res-2').textContent = nombreCorto(m) + ' · ' + totalCajones() + ' cajones';
  el('res-3').textContent = col.n + (st.color ? ' (+' + PM.pesos(PM.COLOR_ADICIONAL) + ')' : '') + ' · ' + (st.soft ? 'con cierre suave' : 'sin cierre suave');
  el('res-4').textContent = notas ? (notas.length > 28 ? notas.slice(0, 28) + '…' : notas) : 'Sin notas';
  el('res-5').textContent = st.precioTxt;
  el('cz-barra-precio').textContent = st.precioTxt;
}

// ---------- pasos guiados ----------
let paso = 1; const TOT = 5, secs = [].slice.call(document.querySelectorAll('.cz-paso'));
function alturaFija() {
  if (window.innerWidth <= 900) { const iz = document.querySelector('.cz-izq'); return iz ? iz.offsetHeight : 0; }
  return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--hdr'), 10) || 70;
}
function irPaso(n, desplazar) {
  paso = Math.max(1, Math.min(TOT, n));
  secs.forEach(sec => {
    const p = +sec.getAttribute('data-p'), on = p === paso;
    sec.classList.toggle('on', on); sec.classList.toggle('hecho', p < paso);
    sec.querySelector('.cz-paso-c').hidden = !on;
    sec.querySelector('.cz-paso-btn').setAttribute('aria-expanded', on ? 'true' : 'false');
  });
  el('cz-prog-txt').textContent = 'Paso ' + paso + ' de ' + TOT;
  el('cz-prog-fill').style.width = (paso / TOT * 100) + '%';
  el('cz-barra-paso').textContent = 'Paso ' + paso + ' de ' + TOT;
  el('cz-barra-sig').textContent = paso < TOT ? 'Continuar →' : 'Enviar por WhatsApp';
  if (desplazar) window.scrollTo({ top: Math.max(0, secs[paso - 1].getBoundingClientRect().top + window.scrollY - alturaFija() - 14), behavior: 'smooth' });
}
secs.forEach(sec => { sec.querySelector('.cz-paso-btn').addEventListener('click', () => irPaso(+sec.getAttribute('data-p'), true)); });
[].slice.call(document.querySelectorAll('.cz-sig')).forEach(b => { b.addEventListener('click', () => irPaso(+b.getAttribute('data-sig'), true)); });
el('cz-barra-sig').addEventListener('click', () => { if (paso < TOT) irPaso(paso + 1, true); else window.open(st.waHref, '_blank', 'noopener'); });
el('cz-soft').addEventListener('click', () => { st.soft = !st.soft; todo(); });
el('cz-notas').addEventListener('input', () => { resumen(); resumenesPasos(); });
el('cz-abrir').addEventListener('click', () => api.abrirTodos(api.hayCerrados()));
el('cz-bau').addEventListener('click', () => api.abrirBauleras(api.hayBauleraCerrada()));
document.body.classList.add('cfg-page');

// Muestra grande del color elegido, al lado de la cama (mismo redondel que el selector)
function pintarMuestra() {
  const cc = COL[st.color], mu = el('cz-muestra'); if (!mu) return;
  mu.innerHTML = '<i style="background:' + (cc.tex ? 'url(' + cc.tex + ') center/cover' : cc.sw) + '"></i><span><small>Color elegido</small><b>' + cc.n + '</b></span>';
}
function todo() { paneles(); resumen(); resumenesPasos(); botones(); pintarMuestra(); }
const inicial = PM.MODELOS.find(x => x.slug === new URLSearchParams(location.search).get('m')) || PM.MODELOS.find(x => x.slug === '6-vip-2-plazas');
api.elegirModelo(inicial); todo(); irPaso(1, false);
window.__cfg3d = api; window.__ficha = ficha;
