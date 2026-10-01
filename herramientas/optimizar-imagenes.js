// Genera versiones WebP livianas de las fotos de los modelos en assets/web/ (las originales no se tocan).
// Uso: node herramientas/optimizar-imagenes.js
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const raiz = path.resolve(__dirname, '..');
const P = new Function(fs.readFileSync(path.join(raiz, 'js/productos-data.js'), 'utf8') + ';return {PRODUCTS, COLORS};')();

const fotos = new Set();
P.PRODUCTS.forEach(p => { fotos.add(p.img); (p.clientPhotos || []).forEach(f => fotos.add(f)); });
P.COLORS.forEach(c => { if (c.compare) fotos.add(c.compare); });

const TAMANOS = { l: 1000, m: 480, s: 200 };
let hechas = 0, omitidas = 0, antes = 0, despues = 0;

fotos.forEach(rel => {
  const origen = path.join(raiz, rel);
  if (!fs.existsSync(origen)) { console.log('FALTA', rel); return; }
  antes += fs.statSync(origen).size;
  const base = rel.replace(/^assets\//, '').replace(/\.[a-z]+$/i, '').replace(/[^a-z0-9/_-]/gi, '-');
  Object.keys(TAMANOS).forEach(t => {
    const destino = path.join(raiz, 'assets/web', base + '-' + t + '.webp');
    if (t === 'l') { if (fs.existsSync(destino)) despues += fs.statSync(destino).size; }
    if (fs.existsSync(destino)) { omitidas++; return; }
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', origen, '-vf', "scale='min(" + TAMANOS[t] + ",iw)':-2", '-quality', t === 'l' ? '78' : '72', destino]);
    hechas++;
    if (t === 'l') despues += fs.statSync(destino).size;
  });
});
console.log('fotos:', fotos.size, '| archivos nuevos:', hechas, '| ya existentes:', omitidas);
console.log('peso originales:', (antes / 1048576).toFixed(1), 'MB | peso versiones grandes WebP:', (despues / 1048576).toFixed(1), 'MB');
