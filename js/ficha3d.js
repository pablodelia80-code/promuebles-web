// Cama 3D de la ficha de cada modelo: reemplaza el esquema dibujado. Se carga recién cuando la persona llega a la sección
// (en el celular, al tocar el botón) para que la ficha siga abriendo rápido. Usa el mismo motor que el configurador (js/cama3d.js).
const PM = window.PM;
const datos = JSON.parse(document.getElementById('m-data').textContent);
const m = PM.MODELOS.find(x => x.slug === datos.slug);
const el = id => document.getElementById(id);
const stage = el('cz-escena');
const V = '20261065';

function ficha(info, api) {
  const e = api.estado, lat = m.laterales, cfg = api.PIE_CFG[m.linea];
  const soft = el('m-soft') && el('m-soft').getAttribute('aria-checked') === 'true';
  let tipo = '', titulo = '', filas = [], esCajon = false;
  const niveles = (k, n) => k === 2 ? (n === 0 ? 'Abajo' : 'Arriba') : (k === 3 ? ['Abajo', 'En el medio', 'Arriba'][n] : null);
  const filaNivel = (k, n) => niveles(k, n) ? [['Nivel', niveles(k, n) + ' (apilado)']] : [];
  const corr = [['Al abrirlo', 'Sale 40 cm'], ['Correderas', 'Telescópicas reforzadas Eurohard' + (soft ? ' con cierre suave' : '')]];
  if (info.tipo === 'cajon' && info.zona === 'lat') {
    const alto = info.tipoSlot === 'G' ? 30 : (info.tipoSlot === 'N' ? 15 : lat.dim[2]);
    tipo = 'Cajón'; titulo = 'Cajón del costado'; esCajon = true;
    filas = [['Medidas', PM.fmt([lat.dim[0], lat.dim[1], alto])], ['Ubicación', lat.der === 0 ? 'Un solo lateral de la cama' : (info.lado === 'izq' ? 'Lado izquierdo' : 'Lado derecho')]].concat(filaNivel(info.k, info.nivel), corr);
  } else if (info.tipo === 'cajon') {
    let dim;
    if (e.pie.tipo === 'cajones') dim = e.pie.lados[info.col] === 'G' ? [cfg.g, 40, 30] : [cfg.n, 40, 15];
    else { const cols = []; m.frontales.forEach(f => { for (let i = 0; i < Math.max(1, Math.round(f.n / (f.niveles || 1))); i++) cols.push(f.dim); }); dim = cols[info.col] || m.frontales[0].dim; }
    tipo = 'Cajón'; titulo = 'Cajón del pie'; esCajon = true;
    filas = [['Medidas', PM.fmt(dim)], ['Ubicación', 'Al pie de la cama']].concat(filaNivel(info.k, info.nivel), corr);
  } else if (info.tipo === 'zapatero') {
    tipo = 'Zapatero'; titulo = 'Zapatero al pie';
    filas = [['Ancho', Math.round(info.ancho + 1.2) + ' cm'], ['Alto', '39 cm'], ['Profundidad', '40 cm']].concat(m.pares ? [['Capacidad', m.pares + ' pares']] : [], [['Ubicación', 'Al pie de la cama'], ['Cómo se abre', 'La puerta se abate hacia afuera']]);
  } else {
    tipo = 'Baulera';
    const cab = info.clave.indexOf('cab') === 0, d = cab ? m.bauleras.cabecera[+info.clave.slice(3)] : (m.bauleras.central[0] || {}).dim;
    titulo = cab ? 'Baulera de la cabecera' : 'Baulera central';
    filas = (d ? [['Medidas', PM.fmt(d)]] : []).concat([['Ubicación', cab ? 'En la cabecera de la cama' : (lat.der === 0 ? 'Del lado opuesto a los cajones' : 'Centro de la cama')], ['Tapa', 'Se abre desde arriba']]);
  }
  el('m-card-kind').textContent = tipo; el('m-card-title').textContent = titulo;
  const dl = el('m-card-dl'); dl.innerHTML = '';
  filas.forEach(f => { const r = document.createElement('div'), a = document.createElement('dt'), b = document.createElement('dd'); a.textContent = f[0]; b.textContent = f[1]; r.appendChild(a); r.appendChild(b); dl.appendChild(r); });
  el('m-card-soft').hidden = !(esCajon && soft);
  el('m-card-empty').hidden = true; el('m-card-body').hidden = false;
}

let cargado = false, api = null;
async function cargar() {
  if (cargado) return; cargado = true;
  stage.classList.add('cargando');
  try {
    const { crearCama3D } = await import('./cama3d.js?v=' + V);
    api = crearCama3D(stage, PM, {
      alInteractuar: () => { const a = el('m-3d-ayuda'); if (a) a.style.opacity = 0; },
      onCambio: () => { if (api) botones(api); },
      onSelect: info => { if (api) ficha(info, api); }
    });
    api.elegirModelo(m);
    botones(api);
    stage.querySelector('canvas').style.touchAction = 'pan-y';   // en el celular el dedo vertical sigue moviendo la página
    const p = el('m-3d-poster'); if (p) setTimeout(() => p.remove(), 400);
    window.__ficha3d = { api: api, ficha: function (i) { ficha(i, api); } };
    el('m-3d-botones').hidden = false;
    el('m-3d-abrir').addEventListener('click', () => api.abrirTodos(api.hayCerrados()));
    const bau = el('m-3d-bau');
    if (PM.totalBauleras(m)) bau.addEventListener('click', () => api.abrirBauleras(api.hayBauleraCerrada())); else bau.hidden = true;
    stage.classList.remove('cargando'); stage.classList.add('listo');
  } catch (err) {
    console.error('ficha3d', err); cargado = false; stage.classList.remove('cargando');
    const b = el('m-3d-start'); if (b) { b.hidden = false; b.textContent = 'No se pudo cargar. Tocá para reintentar'; }
  }
}
function botones(api) {
  el('m-3d-abrir').textContent = api.hayCerrados() ? 'Abrir todos los cajones' : 'Cerrar todos los cajones';
  el('m-3d-bau').textContent = api.hayBauleraCerrada() ? 'Abrir las bauleras' : 'Cerrar las bauleras';
}

const movil = window.matchMedia('(max-width: 900px)').matches;
const start = el('m-3d-start');
start.addEventListener('click', () => { start.hidden = true; cargar(); });
if (movil) { start.hidden = false; }                           // en el celular, el 3D arranca recién al tocar
else if ('IntersectionObserver' in window) {                     // en la computadora, al llegar a la sección
  const io = new IntersectionObserver(es => { if (es.some(x => x.isIntersecting)) { io.disconnect(); cargar(); } }, { rootMargin: '250px' });
  io.observe(stage);
} else { cargar(); }
