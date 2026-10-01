// Comparador de 2 o 3 modelos.
(function () {
  var PM = window.PM, M = PM.MODELOS;
  var q = new URLSearchParams(location.search);
  var sel = [q.get('a'), q.get('b'), q.get('c')].map(function (s) { return M.filter(function (m) { return m.slug === s; })[0] ? s : ''; });
  if (!sel[0]) sel[0] = '12-vip-2-plazas';
  if (!sel[1]) sel[1] = '8-vip-2-plazas';
  var soft = false;

  var cont = document.getElementById('c-selects');
  var selects = [0, 1, 2].map(function (i) {
    var wrap = document.createElement('label');
    wrap.textContent = i < 2 ? 'Modelo ' + (i + 1) : 'Modelo 3 (opcional)';
    var s = document.createElement('select');
    var vacio = document.createElement('option'); vacio.value = ''; vacio.textContent = i < 2 ? 'Elegí un modelo' : 'Sin tercer modelo'; s.appendChild(vacio);
    var grupos = {};
    M.forEach(function (m) {
      var g = grupos[m.lineaNombre];
      if (!g) { g = grupos[m.lineaNombre] = document.createElement('optgroup'); g.label = m.lineaNombre; s.appendChild(g); }
      var o = document.createElement('option'); o.value = m.slug; o.textContent = m.corto; g.appendChild(o);
    });
    s.value = sel[i] || '';
    s.addEventListener('change', function () { sel[i] = s.value; pintar(); });
    wrap.appendChild(s); cont.appendChild(wrap);
    return s;
  });
  document.getElementById('c-soft').addEventListener('change', function (e) { soft = e.target.checked; pintar(); });

  function precio(m) { var v = PM.venta(m); return v.precio + (soft ? m.cajones * PM.CIERRE_SUAVE_POR_CAJON : 0); }
  function nBau(m) { return PM.totalBauleras(m); }

  var FILAS = [
    ['Colchón', function (m) { return m.colchon; }],
    ['Medida total', function (m) { return m.largoTotal + ' × ' + m.anchoTotal + ' cm'; }],
    ['Altura', function (m) { return m.alto + ' cm'; }],
    ['Cajones', function (m) { return String(m.cajones); }, function (m) { return m.cajones; }, 'max'],
    ['Bauleras', function (m) { return String(nBau(m)); }, nBau, 'max'],
    ['Zapateros', function (m) { return m.zapateros.length ? String(m.zapateros.length) : (m.estantes ? m.estantes.n + ' estantes' : '—'); }],
    ['Carga que soporta', function (m) { return m.carga + ' kg'; }, function (m) { return m.carga; }, 'max'],
    ['Correderas', function () { return 'Telescópicas reforzadas Eurohard' + (soft ? ', con cierre suave' : ''); }],
    ['Garantía', function () { return '10 años'; }],
    ['Precio', function (m) { return PM.pesos(precio(m)); }, precio, 'min']
  ];

  function pintar() {
    var ms = sel.filter(Boolean).map(function (s) { return M.filter(function (m) { return m.slug === s; })[0]; });
    var t = document.getElementById('c-tabla');
    t.innerHTML = '';
    if (ms.length < 2) { t.innerHTML = '<tbody><tr><td style="padding:24px">Elegí al menos 2 modelos para compararlos.</td></tr></tbody>'; return; }
    var head = '<thead><tr><th></th>' + ms.map(function (m) {
      var v = PM.venta(m);
      return '<th><a href="/camas-box/' + m.slug + '/"><img src="' + PM.webp(v.img, 'm') + '" alt="' + m.titulo + '" width="480" height="640"><b>' + m.corto + '</b><span>' + m.lineaNombre + '</span></a></th>';
    }).join('') + '</tr></thead>';
    var body = '<tbody>' + FILAS.map(function (f) {
      var vals = ms.map(function (m) { return f[2] ? f[2](m) : null; });
      var mejor = null;
      if (f[3]) { mejor = f[3] === 'max' ? Math.max.apply(null, vals) : Math.min.apply(null, vals); if (vals.every(function (v) { return v === mejor; })) mejor = null; }
      return '<tr><th scope="row">' + f[0] + '</th>' + ms.map(function (m, i) {
        return '<td' + (mejor !== null && vals[i] === mejor ? ' class="mejor"' : '') + '>' + f[1](m) + '</td>';
      }).join('') + '</tr>';
    }).join('') +
      '<tr><th scope="row"></th>' + ms.map(function (m) { return '<td><a class="btn btn-nogal" href="/camas-box/' + m.slug + '/">Ver ficha</a></td>'; }).join('') + '</tr></tbody>';
    t.innerHTML = head + body;
    history.replaceState(null, '', '?' + ['a', 'b', 'c'].map(function (k, i) { return sel[i] ? k + '=' + sel[i] : ''; }).filter(Boolean).join('&'));
  }
  pintar();
})();
