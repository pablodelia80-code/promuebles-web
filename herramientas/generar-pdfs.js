// Genera fichas/<modelo>.pdf (una página A4 por cama) con Chrome en modo headless.
// Uso: node herramientas/generar-pdfs.js [slug]   (sin argumento: los 24 modelos)
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const raiz = path.resolve(__dirname, '..');
const PM = require(path.join(raiz, 'js/modelos.js'));
const D = new Function(fs.readFileSync(path.join(raiz, 'js/productos-data.js'), 'utf8') + ';return {PRODUCTS};')();
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const pesos = n => '$' + n.toLocaleString('es-AR');
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find(fs.existsSync);
if (!CHROME) { console.log('No encuentro Chrome'); process.exit(1); }

function html(m) {
  const p = D.PRODUCTS[m.idx];
  const foto = 'data:image/webp;base64,' + fs.readFileSync(path.join(raiz, PM.webp(p.img, 'm'))).toString('base64');
  const nB = PM.totalBauleras(m);
  const specs = PM.especificaciones(m);
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Ficha técnica ${esc(m.titulo)}</title>
<style>
@page{size:A4;margin:0}
*{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;color:#2A1D14;width:210mm;height:297mm;padding:12mm 13mm;position:relative}
.top{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #C9A227;padding-bottom:7px}
.logo{font-weight:800;font-size:26px;letter-spacing:-.5px}.logo b{color:#C9A227}.url{font-size:11px;color:#8B6544}
h1{font-size:25px;margin:12px 0 2px;color:#4A3222;line-height:1.1}.sub{font-size:12.5px;color:#8B6544;margin:0}
.cols{display:grid;grid-template-columns:58mm 1fr;gap:9mm;margin-top:10px}
.foto{width:58mm;height:77mm;object-fit:cover;border-radius:8px;background:#EDE4DA}
.precio{font-size:28px;font-weight:800;color:#4A3222;margin:2px 0 8px}.precio small{display:block;font-size:10.5px;font-weight:400;color:#8B6544}
.facts{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:10px}
.facts div{background:#EDE4DA;border-radius:8px;padding:7px 4px;text-align:center}.facts b{display:block;font-size:17px;color:#4A3222}.facts span{font-size:9.5px;color:#8B6544}
h2{font-size:12.5px;margin:12px 0 5px;color:#4A3222;text-transform:uppercase;letter-spacing:.8px;border-bottom:1px solid #E6DACC;padding-bottom:3px}
ul{margin:0;padding-left:15px;font-size:11.5px;line-height:1.5}
.plano{background:#EDE4DA;border-radius:8px;padding:6px;width:62mm}.plano svg{width:100%;height:auto}
.dos{display:grid;grid-template-columns:1fr 62mm;gap:8mm;margin-top:2px}
.pie{position:absolute;left:13mm;right:13mm;bottom:11mm;border-top:3px solid #C9A227;padding-top:8px;font-size:11px;display:flex;justify-content:space-between;gap:10px;color:#4A3222}
.nota{font-size:9.5px;color:#8B6544;margin-top:3px}
.plan-bed{fill:#fff;stroke:#4A3222;stroke-width:2}.plan-tag{font:700 10px Arial;fill:#8B6544;letter-spacing:2px}
.plan-item rect{stroke:#4A3222;stroke-width:1.5}.plan-item.c rect{fill:#C9AD8F}.plan-item.b rect{fill:#e9d9bf}.plan-item.z rect{fill:#d9c3a3}.plan-item.e rect{fill:#efe3cf}.plan-item text{font:700 12px Arial;fill:#2A1D14}
</style></head><body>
<div class="top"><div class="logo"><b>Pro</b>Muebles</div><div class="url">promuebles.com.ar · Ficha técnica</div></div>
<h1>${esc(m.titulo.replace(/ \(.*\)$/, ''))}</h1><p class="sub">${esc(m.lineaNombre)} · colchón ${esc(m.colchon)}</p>
<div class="cols">
  <img class="foto" src="${foto}" alt="">
  <div>
    <div class="precio">${pesos(p.price)}<small>Precio final en pesos al 01/10/2026 · Envío, subida y armado incluidos según zona</small></div>
    <div class="facts"><div><b>${m.cajones}</b><span>cajones</span></div><div><b>${nB || (m.estantes ? m.estantes.n : 0)}</b><span>${nB ? 'bauleras' : 'estantes'}</span></div><div><b>${m.carga} kg</b><span>de carga</span></div><div><b>10 años</b><span>de garantía</span></div></div>
    <h2>Medidas</h2>
    <ul><li>Medida total: ${m.largoTotal} × ${m.anchoTotal} cm</li><li>Altura hasta el colchón: ${m.alto} cm</li><li>Para colchón de ${esc(m.colchon)}</li></ul>
  </div>
</div>
<div class="dos">
  <div>
    <h2>Guardado y materiales</h2>
    <ul>${specs.filter(s => !/^Medida total/.test(s)).map(s => '<li>' + esc(s) + '</li>').join('')}<li>Base del colchón con refuerzo central interno, sin patas</li></ul>
    <h2>Entrega y garantía</h2>
    <ul><li>Plazo: entre 5 y 10 días. Trabajamos con stock y a pedido.</li><li>La llevamos, la subimos y la armamos.</li><li>Pagos: efectivo, transferencia y tarjeta.</li><li>Garantía de 10 años por escrito: el primer año con servicio a domicilio y del segundo al décimo con reparación en fábrica.</li></ul>
  </div>
  <div><h2>Plano de la cama (vista desde arriba)</h2><div class="plano"><svg id="plano" viewBox="0 0 360 470"></svg></div><p class="nota">Esquema ilustrativo, no está a escala.</p></div>
</div>
<div class="pie"><div><b>ProMuebles</b> · Fábrica en Moisés Lebensohn 1068, Boulogne</div><div>WhatsApp 11 6876-7075 · promuebles1983@gmail.com</div></div>
<script>${fs.readFileSync(path.join(raiz, 'js/modelos.js'), 'utf8')}</script>
<script>${fs.readFileSync(path.join(raiz, 'js/plano.js'), 'utf8')}</script>
<script>PM.dibujarPlano(document.getElementById('plano'), PM.MODELOS.filter(function(x){return x.slug==='${m.slug}'})[0], function(){});document.querySelectorAll('.plan-item').forEach(function(g){g.classList.remove('pulse')});</script>
</body></html>`;
}

const solo = process.argv[2];
const lista = PM.MODELOS.filter(m => !solo || m.slug === solo);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fichas-'));
fs.mkdirSync(path.join(raiz, 'fichas'), { recursive: true });
let n = 0;
lista.forEach(m => {
  const f = path.join(tmp, m.slug + '.html');
  fs.writeFileSync(f, html(m));
  const salida = path.join(raiz, 'fichas', m.slug + '.pdf');
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--no-sandbox', '--user-data-dir=' + path.join(tmp, 'perfil-' + m.slug), '--no-pdf-header-footer', '--virtual-time-budget=4000', '--print-to-pdf=' + salida, 'file:///' + f.replace(/\\/g, '/')], { stdio: 'ignore', timeout: 60000 });
  n++;
  console.log('PDF', m.slug, (fs.statSync(salida).size / 1024).toFixed(0) + ' KB');
});
console.log('PDF generados:', n);
