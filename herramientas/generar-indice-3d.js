// Genera prototipo-3d-modelos.html: lista de los 24 modelos con su foto real y el enlace al prototipo 3D (para revisar todo de una vez).
// Uso: node herramientas/generar-indice-3d.js
const fs = require('fs');
const path = require('path');
const raiz = path.resolve(__dirname, '..');
const PM = require(path.join(raiz, 'js/modelos.js'));
const D = new Function(fs.readFileSync(path.join(raiz, 'js/productos-data.js'), 'utf8') + ';return {PRODUCTS};')();
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const LINEAS = ['1-plaza', '1-plaza-y-media', '2-plazas', 'queen', 'king-180', 'king-200'];
const V = '20261039';

const grupos = LINEAS.map(l => {
  const lista = PM.porPrecio(PM.MODELOS.filter(m => m.linea === l));
  return `<section class="gr"><h2>${esc(PM.LINEAS[l].nombre)} <small>colchón ${esc(PM.LINEAS[l].colchon)}</small></h2><div class="grid">${lista.map(m => {
    const p = D.PRODUCTS[m.idx];
    const rel = p.img.replace(/^assets\//, '').replace(/\.[a-z]+$/i, '').replace(/[^a-z0-9/_-]/gi, '-');
    const nb = PM.totalBauleras(m);
    const pie = m.estantes ? 'estantes' : (m.zapateros.length ? (m.zapateros.length + (m.zapateros.length === 1 ? ' zapatero' : ' zapateros')) : (PM.frontalesTotal(m) + ' cajones al pie'));
    return `<a class="card" href="prototipo-3d.html?m=${m.slug}&v=${V}">
      <img src="assets/web/${rel}-m.webp" alt="${esc(m.titulo)}" loading="lazy" width="240" height="320">
      <b>${esc(m.corto)}</b>
      <span>${m.cajones} cajones · ${nb} bauleras · ${esc(pie)}</span>
      <em>Ver en 3D →</em>
    </a>`;
  }).join('')}</div></section>`;
}).join('\n');

const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>Los 24 modelos en 3D | ProMuebles</title>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
:root{--espresso:#2A1D14;--nogal:#4A3222;--madera:#8B6544;--gold:#C9A227;--line:#E6DACC}
*{box-sizing:border-box}
body{margin:0;font-family:'Manrope',sans-serif;color:var(--espresso);background:#fff}
header{background:var(--espresso);color:#fff;padding:14px 20px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
header b{font:800 22px 'Poppins',sans-serif}header b i{font-style:normal;color:var(--gold)}header span{font-size:13px;opacity:.8}
main{max-width:1200px;margin:0 auto;padding:18px 16px 50px}
h1{font:800 clamp(24px,3.2vw,34px) 'Poppins',sans-serif;color:var(--nogal);margin:6px 0 6px;letter-spacing:-.02em}
p.lead{margin:0 0 20px;color:var(--madera);font-weight:600;max-width:75ch;line-height:1.5}
.gr{margin-top:28px}.gr h2{font:700 22px 'Poppins',sans-serif;color:var(--nogal);margin:0 0 12px;border-bottom:2px solid var(--gold);padding-bottom:6px}.gr h2 small{font:600 14px 'Manrope',sans-serif;color:var(--madera);margin-left:8px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:16px}
.card{display:flex;flex-direction:column;gap:5px;padding:12px;border:1.5px solid var(--line);border-radius:16px;background:#fff;text-decoration:none;color:inherit;transition:transform .25s,box-shadow .25s,border-color .25s}
.card img{width:100%;height:auto;aspect-ratio:3/4;object-fit:cover;border-radius:10px;background:#EDE4DA}
.card b{font:700 17px 'Poppins',sans-serif;color:var(--nogal);margin-top:4px}
.card span{font-size:13px;color:var(--madera);font-weight:600;line-height:1.35}
.card em{font-style:normal;font-weight:800;font-size:14px;color:var(--nogal);margin-top:2px}
@media (hover:hover){.card:hover{transform:translateY(-4px);border-color:var(--gold);box-shadow:0 14px 28px rgba(74,50,34,.16)}}
</style>
</head>
<body>
<header><b><i>Pro</i>Muebles</b><span>Página interna de revisión · no está enlazada en la web</span></header>
<main>
  <h1>Los 24 modelos en 3D</h1>
  <p class="lead">Cada tarjeta muestra la foto real de la cama y, al tocarla, abre su versión en 3D para comparar. Dentro del 3D se cambia el pie y los costados, se abren los cajones, zapateros y bauleras.</p>
${grupos}
</main>
</body>
</html>
`;
fs.writeFileSync(path.join(raiz, 'prototipo-3d-modelos.html'), html);
console.log('Listo: prototipo-3d-modelos.html con', PM.MODELOS.length, 'modelos');
