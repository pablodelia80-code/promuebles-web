// Convierte herramientas/zonas-calculadas.json en js/zonas-envio-datos.js (lista compacta de localidades con su distancia por calle).
// Uso: node herramientas/generar-zonas.js
const fs = require('fs');
const path = require('path');
const raiz = path.resolve(__dirname, '..');
const origen = path.join(__dirname, 'zonas-calculadas.json');
if (!fs.existsSync(origen)) { console.log('Falta zonas-calculadas.json: corré antes herramientas/calcular-zonas.py'); process.exit(1); }
const lugares = JSON.parse(fs.readFileSync(origen, 'utf8'));
// Nombres de partidos como se muestran
const nombrePartido = { 'General San Martín': 'San Martín' };
const norm = t => String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const vistos = new Set();
const filas = lugares
  .filter(l => l.km != null && l.km <= 70)
  .sort((a, b) => a.km - b.km)
  .map(l => [l.n.trim(), nombrePartido[l.p] || l.p, l.z, Math.round(l.km * 10) / 10])
  .filter(r => { const k = norm(r[0]) + '|' + r[1]; if (vistos.has(k) || !norm(r[0])) return false; vistos.add(k); return true; });
fs.writeFileSync(path.join(raiz, 'js/zonas-envio-datos.js'), '// Generado por herramientas/generar-zonas.js. [localidad, partido, zona (N/S/O), km por calle desde el límite de CABA]\nwindow.PM = window.PM || {};\nwindow.PM.zonasDatos = ' + JSON.stringify(filas) + ';\n');
const resumen = {};
filas.forEach(r => { const z = r[2]; const t = z === 'N' ? (r[3] <= 25 ? 'sin cargo' : r[3] <= 55 ? 'con costo' : 'no se entrega') : (r[3] <= 10 ? 'sin cargo' : r[3] <= 60 ? 'con costo' : 'no se entrega'); resumen[z + ' ' + t] = (resumen[z + ' ' + t] || 0) + 1; });
console.log('Localidades:', filas.length, '|', JSON.stringify(resumen));
