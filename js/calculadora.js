// ¿Entra la cama en el cuarto? Plano a escala + chequeo de espacio para abrir los cajones (salen 40 cm).
(function () {
  var PM = window.PM, M = PM.MODELOS, SALE = 40;
  var q = new URLSearchParams(location.search);
  var selM = document.getElementById('k-modelo'), inL = document.getElementById('k-largo'), inA = document.getElementById('k-ancho'), pos = document.getElementById('k-pos');
  var grupos = {};
  PM.porPrecio(M).forEach(function (m) {
    var g = grupos[m.lineaNombre];
    if (!g) { g = grupos[m.lineaNombre] = document.createElement('optgroup'); g.label = m.lineaNombre; selM.appendChild(g); }
    var o = document.createElement('option'); o.value = m.slug; o.textContent = m.corto; g.appendChild(o);
  });
  selM.value = M.filter(function (m) { return m.slug === q.get('m'); })[0] ? q.get('m') : '12-vip-2-plazas';

  function el(tag, a) { var e = document.createElementNS('http://www.w3.org/2000/svg', tag); Object.keys(a).forEach(function (k) { e.setAttribute(k, a[k]); }); return e; }
  function txt(x, y, t, a) { var e = el('text', Object.assign({ x: x, y: y, 'font-size': 11, 'font-family': 'Manrope,sans-serif', fill: '#4A3222', 'text-anchor': 'middle' }, a || {})); e.textContent = t; return e; }
  function li(ok, t) { return '<li class="' + ok + '">' + t + '</li>'; }

  function calcular() {
    var m = M.filter(function (x) { return x.slug === selM.value; })[0];
    var L = +inL.value, A = +inA.value, svg = document.getElementById('k-svg'), ver = document.getElementById('k-ver');
    svg.innerHTML = ''; ver.innerHTML = '';
    if (!(L >= 100 && A >= 100)) { ver.innerHTML = li('no', 'Poné el largo y el ancho de tu cuarto en centímetros.'); return; }

    var bedL = m.largoTotal, bedA = m.anchoTotal;
    var libreIzq, libreDer;
    if (pos.value === 'izq') { libreIzq = 0; libreDer = A - bedA; }
    else if (pos.value === 'der') { libreIzq = A - bedA; libreDer = 0; }
    else { libreIzq = libreDer = (A - bedA) / 2; }
    var libreFondo = L - bedL;
    var entra = bedL <= L && bedA <= A;

    // Plano a escala
    var s = Math.min(360 / A, 340 / L), ox = (400 - A * s) / 2, oy = 24;
    svg.setAttribute('viewBox', '0 0 400 ' + Math.round(L * s + 52));
    svg.appendChild(el('rect', { x: ox, y: oy, width: A * s, height: L * s, fill: '#fff', stroke: '#2A1D14', 'stroke-width': 3 }));
    svg.appendChild(txt(200, 15, 'PARED DE LA CABECERA', { 'font-size': 9, 'letter-spacing': 1.5, fill: '#8B6544' }));
    var bx = ox + (pos.value === 'izq' ? 0 : pos.value === 'der' ? (A - bedA) * s : (A - bedA) / 2 * s);
    if (entra) {
      // zonas de apertura
      function zona(x, y, w, h, ok) { svg.appendChild(el('rect', { x: x, y: y, width: Math.max(w, 0), height: Math.max(h, 0), fill: ok ? 'rgba(37,150,80,.22)' : 'rgba(200,60,40,.25)', stroke: ok ? '#259650' : '#c83c28', 'stroke-dasharray': '4 3' })); }
      if (m.laterales.izq) zona(bx - SALE * s, oy, SALE * s, bedL * s, libreIzq >= SALE);
      if (m.laterales.der) zona(bx + bedA * s, oy, SALE * s, bedL * s, libreDer >= SALE);
      if (m.frontales.length || m.zapateros.length) zona(bx, oy + bedL * s, bedA * s, SALE * s, libreFondo >= SALE);
    }
    svg.appendChild(el('rect', { x: bx, y: oy, width: bedA * s, height: bedL * s, rx: 4, fill: entra ? '#C9AD8F' : '#e7b4a8', stroke: '#4A3222', 'stroke-width': 2 }));
    svg.appendChild(txt(bx + bedA * s / 2, oy + bedL * s / 2 + 4, m.corto, { 'font-weight': 700, 'font-size': 13 }));
    svg.appendChild(txt(200, Math.round(L * s + 44), 'Cuarto de ' + (A / 100).toFixed(2).replace('.', ',') + ' × ' + (L / 100).toFixed(2).replace('.', ',') + ' m', { 'font-size': 11 }));

    // Veredicto
    if (!entra) {
      ver.innerHTML = li('no', '<b>La cama no entra.</b> Mide ' + bedL + ' × ' + bedA + ' cm y el cuarto tiene ' + L + ' × ' + A + ' cm.' +
        (bedA > A ? ' Probá con un modelo más angosto.' : '') + '');
      return;
    }
    ver.innerHTML = li('ok', '<b>La cama entra.</b> Mide ' + bedL + ' × ' + bedA + ' cm.');
    function lado(nombre, cant, libre) {
      if (!cant) return;
      if (libre >= SALE) ver.innerHTML += li('ok', 'Cajones del lado ' + nombre + ': <b>abren completos</b> (sobran ' + Math.round(libre - SALE) + ' cm).');
      else if (libre > 0) ver.innerHTML += li('meh', 'Cajones del lado ' + nombre + ': tenés ' + Math.round(libre) + ' cm libres y los cajones salen ' + SALE + '. <b>Abren solo en parte.</b>');
      else ver.innerHTML += li('no', 'Cajones del lado ' + nombre + ': la cama queda pegada a la pared, <b>no se pueden abrir</b>. Cambiá la posición o el lado.');
    }
    lado('izquierdo', m.laterales.izq, libreIzq);
    lado('derecho', m.laterales.der, libreDer);
    if (m.frontales.length || m.zapateros.length) {
      var nombre = m.zapateros.length ? 'Zapateros y cajones del pie' : 'Cajones del pie';
      if (libreFondo >= SALE) ver.innerHTML += li('ok', nombre + ': <b>abren completos</b> (sobran ' + Math.round(libreFondo - SALE) + ' cm).');
      else if (libreFondo > 0) ver.innerHTML += li('meh', nombre + ': tenés ' + Math.round(libreFondo) + ' cm libres al pie y salen ' + SALE + '. <b>Abren solo en parte.</b>');
      else ver.innerHTML += li('no', nombre + ': el pie de la cama toca la pared, <b>no se pueden abrir</b>.');
    }
    if (m.laterales.der === 0 && m.laterales.izq) ver.innerHTML += li('meh', 'Este modelo tiene todos los cajones en un solo lateral: dejalo del lado libre y el otro lado contra la pared.');
    ver.innerHTML += '<li class="nota"><a class="btn btn-nogal" href="/camas-box/' + m.slug + '/">Ver ficha del modelo</a></li>';
  }
  [selM, inL, inA, pos].forEach(function (e) { e.addEventListener('input', calcular); e.addEventListener('change', calcular); });
  calcular();
})();
