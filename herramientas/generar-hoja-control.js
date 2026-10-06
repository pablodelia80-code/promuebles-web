// Genera la "hoja de control" de los 24 modelos para que Pedro marque lo que está bien y lo que hay que corregir.
// Uso: node herramientas/generar-hoja-control.js   (salida: ..\Hoja de control para Pedro\Hoja-de-control-24-modelos.pdf, fuera de la web)
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const raiz = path.resolve(__dirname, '..');
const PM = require(path.join(raiz, 'js/modelos.js'));
const D = new Function(fs.readFileSync(path.join(raiz, 'js/productos-data.js'), 'utf8') + ';return {PRODUCTS};')();
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find(fs.existsSync);
if (!CHROME) { console.log('No encuentro Chrome'); process.exit(1); }
const f = d => PM.fmt(d);

function lateral(m, cant, nombre) {
  if (!cant) return null;
  const L = m.laterales, k = m.latNiveles;
  if (L.patron) {
    return nombre + ': ' + cant + ' cajones = ' + L.patron.map(p => p === 'G' ? '1 grande de ' + f([L.dim[0], L.dim[1], 30]) : '2 apilados de ' + f(L.dim)).join(' + ') + ' (de la cabecera al pie)';
  }
  if (k === 1) return nombre + ': ' + cant + ' cajones en fila, de ' + f(L.dim);
  return nombre + ': ' + cant + ' cajones = ' + Math.round(cant / k) + ' columnas de ' + k + ' apilados, cada uno de ' + f(L.dim);
}

function filas(m) {
  const r = [];
  if (m.laterales.der === 0) {
    r.push(['Costados', lateral(m, m.laterales.izq, 'Un solo lateral (todos los cajones del mismo lado)')]);
  } else {
    r.push(['Costado izquierdo', lateral(m, m.laterales.izq, 'Lado izquierdo').replace('Lado izquierdo: ', '')]);
    r.push(['Costado derecho', lateral(m, m.laterales.der, 'Lado derecho').replace('Lado derecho: ', '')]);
  }
  if (m.frontales.length) {
    r.push(['Pie: cajones', m.frontales.map(x => x.n + ' de ' + f(x.dim) + (x.niveles > 1 ? ' (en columnas de ' + x.niveles + ' apilados)' : '')).join(' + ')]);
  } else if (m.zapateros.length) {
    r.push(['Pie: zapateros', PM.textoZapateros(m) + ' · alto y profundidad: pendientes de confirmar']);
  } else if (m.estantes) {
    r.push(['Pie: estantes', m.estantes.n + ' estantes (' + m.estantes.n / 2 + ' por columna), de ' + m.estantes.dim[0] + ' cm de ancho × ' + m.estantes.dim[2] + ' de alto × ' + m.estantes.dim[1] + ' de profundidad']);
  }
  r.push(['Bauleras', PM.textoBauleras(m).join(' · ') || 'No tiene']);
  r.push(['Totales', m.cajones + ' cajones · altura de la cama ' + m.alto + ' cm · medida total ' + m.largoTotal + ' × ' + m.anchoTotal + ' cm']);
  return r;
}

function sinConfirmar(m) {
  const a = [];
  if (m.confirmarFrontales) a.push('medida de los cajones del pie');
  if (m.estantes && m.estantes.calc) a.push('medidas de los estantes (calculadas)');
  if (m.bauleras.central.some(c => !c.dim) || m.bauleras.cabecera.some(c => !c)) a.push('medidas de las bauleras');
  if (m.zapateros.length) a.push('alto y profundidad de los zapateros');
  return a;
}

function bloque(m, i) {
  const sc = sinConfirmar(m);
  return `<section class="m">
  <div class="cab"><span class="n">${i + 1}</span><div><h2>${esc(m.titulo.replace(/ \(.*\)$/, ''))}</h2><p>${esc(m.lineaNombre)} · colchón ${esc(m.colchon)}</p></div></div>
  <div class="cuerpo">
    <div class="plano"><svg id="p${i}" viewBox="0 0 360 470"></svg></div>
    <div class="datos">
      <table>${filas(m).map(([a, b]) => `<tr><th>${esc(a)}</th><td>${esc(b)}</td></tr>`).join('')}</table>
      ${sc.length ? `<p class="sc">Sin confirmar con Pedro: ${esc(sc.join(', '))}.</p>` : ''}
      <div class="marca"><span>☐ Todo correcto</span><span>☐ Hay que corregir:</span></div>
      <div class="linea"></div><div class="linea"></div>
    </div>
  </div>
</section>`;
}

const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Hoja de control - ProMuebles</title>
<style>
@page{size:A4;margin:10mm 11mm}
*{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;color:#2A1D14;font-size:10.5px}
.portada{height:270mm;display:flex;flex-direction:column;justify-content:center;page-break-after:always}
.portada h1{font-size:30px;margin:0 0 6px;color:#4A3222}.portada p{font-size:14px;line-height:1.5;max-width:150mm;margin:6px 0}
.logo{font-weight:800;font-size:28px;margin-bottom:24px}.logo b{color:#C9A227}
.reglas{background:#EDE4DA;border-radius:10px;padding:14px 18px;margin-top:16px;max-width:150mm;font-size:13px;line-height:1.6}
.pag{height:277mm;display:flex;flex-direction:column;gap:6mm;page-break-after:always}
.m{flex:1;border:1.5px solid #C9AD8F;border-radius:10px;padding:8px 10px;display:flex;flex-direction:column}
.cab{display:flex;gap:10px;align-items:center;border-bottom:2px solid #C9A227;padding-bottom:5px}
.n{width:26px;height:26px;border-radius:50%;background:#C9A227;display:grid;place-items:center;font-weight:800;font-size:13px}
.cab h2{margin:0;font-size:16px;color:#4A3222}.cab p{margin:1px 0 0;font-size:10.5px;color:#8B6544}
.cuerpo{display:grid;grid-template-columns:50mm 1fr;gap:8mm;margin-top:6px;flex:1}
.plano{background:#EDE4DA;border-radius:8px;padding:4px;align-self:start}.plano svg{width:100%;height:auto}
table{border-collapse:collapse;width:100%}th{text-align:left;width:26mm;vertical-align:top;color:#8B6544;font-size:10px;padding:3px 6px 3px 0;border-bottom:1px solid #E6DACC}
td{padding:3px 0;border-bottom:1px solid #E6DACC;font-size:10.5px;line-height:1.35}
.sc{margin:6px 0 0;padding:4px 8px;background:#FFF3CD;border-radius:6px;font-size:10px}
.marca{display:flex;gap:22px;margin-top:9px;font-size:12px;font-weight:700}
.linea{border-bottom:1px solid #8B6544;height:15px}
.plan-bed{fill:#fff;stroke:#4A3222;stroke-width:2}.plan-tag{font:700 10px Arial;fill:#8B6544;letter-spacing:2px}
.plan-item rect{stroke:#4A3222;stroke-width:1.5}.plan-item.c rect{fill:#C9AD8F}.plan-item.b rect{fill:#e9d9bf}.plan-item.z rect{fill:#d9c3a3}.plan-item.e rect{fill:#efe3cf}.plan-item text{font:700 12px Arial;fill:#2A1D14}
</style></head><body>
<div class="portada">
  <div class="logo"><b>Pro</b>Muebles</div>
  <h1>Hoja de control de los 24 modelos</h1>
  <p>Pedro: cada hoja muestra cómo está cargada hoy la cama en la web de promuebles.com.ar: el plano visto desde arriba y las medidas de cada cajón, baulera, zapatero y estante.</p>
  <div class="reglas"><b>Qué hay que hacer:</b><br>1. En cada modelo mirá si el plano y las medidas coinciden con la cama real.<br>2. Si está bien, marcá "Todo correcto".<br>3. Si hay algo mal, marcá "Hay que corregir" y escribí qué.<br>4. Fijate especialmente en cuáles cajones van <b>apilados</b> (uno arriba del otro) y cuáles van <b>en fila</b>, y en los cartelitos amarillos de "Sin confirmar".</div>
  <p style="font-size:11px;color:#8B6544;margin-top:20px">Los planos son esquemas: no están a escala. Los cajones apilados se dibujan juntos, uno al lado del otro con una pequeña sombra.</p>
</div>
${PM.MODELOS.reduce((pag, m, i) => { if (i % 3 === 0) pag.push([]); pag[pag.length - 1].push(bloque(m, i)); return pag; }, []).map(g => `<div class="pag">${g.join('')}</div>`).join('')}
<script>${fs.readFileSync(path.join(raiz, 'js/modelos.js'), 'utf8')}</script>
<script>${fs.readFileSync(path.join(raiz, 'js/plano.js'), 'utf8')}</script>
<script>PM.MODELOS.forEach(function(m,i){PM.dibujarPlano(document.getElementById('p'+i), m, function(){});});document.querySelectorAll('.plan-item').forEach(function(g){g.classList.remove('pulse')});</script>
</body></html>`;

const carpeta = path.resolve(raiz, '..', 'Hoja de control para Pedro');
fs.mkdirSync(carpeta, { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'control-'));
const fh = path.join(tmp, 'hoja.html');
fs.writeFileSync(fh, html);
const salida = path.join(carpeta, 'Hoja-de-control-24-modelos.pdf');
execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--no-sandbox', '--user-data-dir=' + path.join(tmp, 'perfil'), '--no-pdf-header-footer', '--virtual-time-budget=6000', '--print-to-pdf=' + salida, 'file:///' + fh.replace(/\\/g, '/')], { stdio: 'ignore', timeout: 120000 });
console.log('Listo:', salida, (fs.statSync(salida).size / 1024).toFixed(0) + ' KB');
