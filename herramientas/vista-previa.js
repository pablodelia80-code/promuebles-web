// Crea un archivo HTML autónomo (estilos, código y fotos adentro) de una página, para mandarlo por WhatsApp/mail y abrirlo en Chrome sin servidor.
// Uso: node herramientas/vista-previa.js 12-vip-2-plazas
const fs = require('fs');
const path = require('path');
const raiz = path.resolve(__dirname, '..');
const slug = process.argv[2] || '12-vip-2-plazas';
let html = fs.readFileSync(path.join(raiz, 'camas-box', slug, 'index.html'), 'utf8');
const leer = rel => fs.readFileSync(path.join(raiz, rel.split('?')[0].replace(/^\//, '')), 'utf8');

// estilos
html = html.replace(/<link rel="stylesheet" href="(\/css\/[^"]+)">/g, (m, h) => '<style>' + leer(h) + '</style>');
// scripts propios (se quitan analytics y script.js: no hacen falta en la vista previa)
html = html.replace(/<script src="\/js\/(analytics|script)\.js[^"]*"( defer)?><\/script>\n?/g, '');
html = html.replace(/<script src="(\/js\/[^"]+)"><\/script>/g, (m, h) => '<script>' + leer(h).replace(/<\/script/g, '<\\/script') + '</script>');
// fotos
let fotos = 0;
html = html.replace(/(src|href)="(\/assets\/web\/[^"]+\.webp)"/g, (m, a, h) => {
  const f = path.join(raiz, h.replace(/^\//, ''));
  if (!fs.existsSync(f)) return m;
  fotos++;
  return a + '="data:image/webp;base64,' + fs.readFileSync(f).toString('base64') + '"';
});
html = html.replace(/<meta property="og:image"[^>]*>\n?/g, '').replace(/<link rel="canonical"[^>]*>\n?/g, '').replace(/<link rel="icon"[^>]*>\n?/g, '');
// aviso arriba
html = html.replace('<body>', '<body>\n<div style="background:#C9A227;color:#2A1D14;font:700 14px Manrope,system-ui,sans-serif;text-align:center;padding:10px 14px">VISTA PREVIA para revisar — todavía no está publicada. Los enlaces a otras páginas no funcionan en este archivo.</div>');

fs.mkdirSync(path.join(raiz, 'vista-previa'), { recursive: true });
const salida = path.join(raiz, 'vista-previa', 'ProMuebles-vista-previa-' + slug + '.html');
fs.writeFileSync(salida, html);
console.log('Listo:', salida, '|', (html.length / 1048576).toFixed(2), 'MB |', fotos, 'fotos incluidas');
