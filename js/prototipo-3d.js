// Prototipo 3D: panel de elección (tamaño, modelo, costados, pie) sobre el motor js/cama3d.js
import { crearCama3D } from './cama3d.js';

const PM = window.PM;
const stage = document.getElementById('stage');
let api = null;
const LINEAS = ['1-plaza', '1-plaza-y-media', '2-plazas', 'queen', 'king-180', 'king-200'];
const nombreCorto = m => m.corto.replace(/ (Queen|King 180|King 200|Plaza y Media)$/, '');

function etiquetas() {
  if (!api) return;
  document.getElementById('abrir').textContent = api.hayCerrados() ? 'Abrir todos los cajones' : 'Cerrar todos los cajones';
  document.getElementById('bau').textContent = api.hayBauleraCerrada() ? 'Abrir las bauleras' : 'Cerrar las bauleras';
}
api = crearCama3D(stage, PM, {
  alInteractuar: () => { document.getElementById('ayuda').style.opacity = 0; },
  onCambio: etiquetas
});

function fila(nombre, hijos) { const f = document.createElement('div'); f.className = 'fila'; const t = document.createElement('span'); t.textContent = nombre; f.appendChild(t); hijos.forEach(h => f.appendChild(h)); return f; }
function opciones(lista, actual, alElegir, clase) {
  const g = document.createElement('div'); g.className = 'par' + (clase ? ' ' + clase : '');
  lista.forEach(([val, txt, sub]) => { const b = document.createElement('button'); b.type = 'button'; b.innerHTML = sub ? '<b>' + txt + '</b><small>' + sub + '</small>' : txt; b.className = actual === val ? 'on' : ''; b.addEventListener('click', () => alElegir(val)); g.appendChild(b); });
  return g;
}

function elegirModelo(m, conUrl) {
  api.elegirModelo(m);
  paneles(); etiquetas();
  document.getElementById('titulo').textContent = 'Cama ' + m.corto + ' en 3D';
  try { if (conUrl) history.replaceState(null, '', '?m=' + m.slug); } catch (e) { }
}

function paneles() {
  const modelo = api.modelo, estado = api.estado, PIE_CFG = api.PIE_CFG;
  const sel = document.getElementById('selector'); sel.innerHTML = '';
  const titulo = (n, txt) => { const t = document.createElement('p'); t.className = 'paso-t'; t.innerHTML = '<i>' + n + '</i><span>' + txt + '</span>'; return t; };
  sel.appendChild(titulo(1, 'Elegí el tamaño de tu cama'));
  sel.appendChild(opciones(LINEAS.map(l => [l, PM.LINEAS[l].nombre, PM.LINEAS[l].colchon]), modelo.linea, l => elegirModelo(PM.porPrecio(PM.MODELOS.filter(x => x.linea === l))[0], true), 'medidas'));
  sel.appendChild(titulo(2, 'Elegí el modelo de ' + PM.LINEAS[modelo.linea].nombre + ' (cambia la cantidad de cajones)'));
  sel.appendChild(opciones(PM.porPrecio(PM.MODELOS.filter(x => x.linea === modelo.linea)).map(x => [x.slug, nombreCorto(x), x.cajones + ' cajones']), modelo.slug, s => elegirModelo(PM.MODELOS.find(x => x.slug === s), true), 'modelos'));
  const cont = document.getElementById('lugares'); cont.innerHTML = '';
  const GN = [['G', '1 grande'], ['N', '2 normales']];
  const editable = modelo.laterales.patron || modelo.latNiveles <= 2;
  const nombres = modelo.laterales.der === 0 ? [['izq', 'Costado con cajones']] : [['izq', 'Costado izquierdo'], ['der', 'Costado derecho']];
  if (editable) nombres.forEach(([k, nombre]) => cont.appendChild(fila(nombre, estado[k].map((tipo, i) => opciones(GN, tipo, v => { estado[k][i] = v; api.armar(); paneles(); })))));
  if (api.puedeCambiarPie(modelo)) {
    const tipos = [['cajones', 'Cajones'], ['zapateros', 'Zapateros']].concat(PIE_CFG[modelo.linea].estantes ? [['estantes', 'Estantes']] : []);
    cont.appendChild(fila('Pie de la cama', [opciones(tipos, estado.pie.tipo === 'frontales' ? 'cajones' : estado.pie.tipo, v => {
      estado.pie.tipo = v;
      if (v === 'estantes' && !modelo.estantes) api.reemplazarModelo(Object.assign({}, modelo, { estantes: { n: 4, dim: [modelo.linea === 'queen' ? 80 : 70, 45, 19] } }));
      else api.armar();
      paneles();
    })]));
    if (estado.pie.tipo === 'cajones') cont.appendChild(fila(PIE_CFG[modelo.linea].cols === 1 ? 'Cajón del pie' : 'Cajones del pie', estado.pie.lados.map((tipo, i) => opciones(GN, tipo, v => { estado.pie.lados[i] = v; api.armar(); paneles(); }))));
  }
  document.getElementById('fijo').textContent = estado.pie.tipo === 'frontales' ? 'El pie de este modelo es fijo: ' + PM.frontalesTotal(modelo) + ' cajones al pie.' : '';
}
document.getElementById('abrir').addEventListener('click', () => api.abrirTodos(api.hayCerrados()));
document.getElementById('bau').addEventListener('click', () => api.abrirBauleras(api.hayBauleraCerrada()));

elegirModelo(PM.MODELOS.find(x => x.slug === new URLSearchParams(location.search).get('m')) || PM.MODELOS.find(x => x.slug === '6-vip-2-plazas'), false);
window.__proto = api;
