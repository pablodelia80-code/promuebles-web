// Comparador de 2 modelos: cada desplegable está arriba de su propia columna.
(function () {
  var PM = window.PM, M = PM.MODELOS;
  var q = new URLSearchParams(location.search);
  var valido = function (s) { return M.filter(function (m) { return m.slug === s; })[0] ? s : ''; };
  var sel = [valido(q.get('a')) || '4-vip-2-plazas', valido(q.get('b')) || '8-vip-2-plazas'];
  var soft = false;

  document.getElementById('c-soft').addEventListener('change', function (e) { soft = e.target.checked; pintar(); });

  function precio(m) { var v = PM.venta(m); return v.precio + (soft ? m.cajones * PM.CIERRE_SUAVE_POR_CAJON : 0); }
  function nBau(m) { return PM.totalBauleras(m); }
  function modelo(slug) { return M.filter(function (m) { return m.slug === slug; })[0]; }

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

  function selector(i) {
    var s = document.createElement('select');
    s.setAttribute('aria-label', 'Modelo ' + (i + 1));
    var grupos = {};
    PM.porPrecio(M).forEach(function (m) {
      var g = grupos[m.lineaNombre];
      if (!g) { g = grupos[m.lineaNombre] = document.createElement('optgroup'); g.label = m.lineaNombre; s.appendChild(g); }
      var o = document.createElement('option'); o.value = m.slug; o.textContent = m.corto; g.appendChild(o);
    });
    s.value = sel[i];
    s.addEventListener('change', function () { sel[i] = s.value; pintar(); });
    return s;
  }

  function pintar() {
    var ms = sel.map(modelo), t = document.getElementById('c-tabla');
    t.innerHTML = '';
    var thead = document.createElement('thead'), tr = document.createElement('tr'), vacio = document.createElement('th');
    tr.appendChild(vacio);
    ms.forEach(function (m, i) {
      var th = document.createElement('th'), v = PM.venta(m);
      var et = document.createElement('span'); et.className = 'c-etq'; et.textContent = 'Modelo ' + (i + 1);
      th.appendChild(et); th.appendChild(selector(i));
      var a = document.createElement('a'); a.href = '/camas-box/' + m.slug + '/';
      a.innerHTML = '<img src="' + PM.webp(v.img, 'm') + '" alt="' + m.titulo + '" width="480" height="640"><b>' + m.corto + '</b><span>' + m.lineaNombre + '</span>';
      th.appendChild(a); tr.appendChild(th);
    });
    thead.appendChild(tr); t.appendChild(thead);
    var body = '<tbody>' + FILAS.map(function (f) {
      var vals = ms.map(function (m) { return f[2] ? f[2](m) : null; });
      var mejor = null;
      if (f[3]) { mejor = f[3] === 'max' ? Math.max.apply(null, vals) : Math.min.apply(null, vals); if (vals.every(function (v) { return v === mejor; })) mejor = null; }
      return '<tr><th scope="row">' + f[0] + '</th>' + ms.map(function (m, i) {
        return '<td' + (mejor !== null && vals[i] === mejor ? ' class="mejor"' : '') + '>' + f[1](m) + '</td>';
      }).join('') + '</tr>';
    }).join('') +
      '<tr><th scope="row"></th>' + ms.map(function (m) { return '<td><a class="btn btn-nogal" href="/camas-box/' + m.slug + '/">Ver ficha</a></td>'; }).join('') + '</tr></tbody>';
    t.insertAdjacentHTML('beforeend', body);
    history.replaceState(null, '', '?a=' + sel[0] + '&b=' + sel[1]);
  }
  pintar();
})();
