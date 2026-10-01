// Plano esquemático de la cama vista desde arriba, armado con los datos de js/modelos.js. No está a escala.
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var PM = window.PM;

  function el(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    return e;
  }
  function reparto(total, pesos, hueco) { // anchos proporcionales a los pesos
    var libre = total - hueco * (pesos.length - 1), suma = pesos.reduce(function (a, b) { return a + b; }, 0), x = 0;
    return pesos.map(function (p) { var w = libre * p / suma, r = { x: x, w: w }; x += w + hueco; return r; });
  }
  function filaMedidas(dim) { return ['Medidas', PM.fmt(dim)]; }

  // Un "lugar" con k cajones apilados se dibuja como k tarjetas superpuestas: la 1 (arriba) tapa parte de las de abajo.
  var slotId = 0;
  function apilar(items, slot, k, base, extra) {
    var id = ++slotId, off = k > 1 ? Math.max(4, Math.min(9, slot.h / (k * 3.4), slot.w / (k * 3.4))) : 0;
    for (var i = 0; i < k; i++) {
      var it = Object.assign({ x: slot.x + i * off, y: slot.y + i * off, w: slot.w - (k - 1) * off, h: slot.h - (k - 1) * off, slot: id, nivel: i, k: k }, base(i));
      items.push(it);
    }
  }
  var items;

  function dibujar(svg, m, alElegir) {
    svg.innerHTML = '';
    var lat = m.laterales, centrales = m.bauleras.central, cab = m.bauleras.cabecera;
    var s = Math.min(284 / m.anchoTotal, 388 / m.largoTotal);
    var bw = m.anchoTotal * s, bh = m.largoTotal * s, x0 = (360 - bw) / 2, y0 = 34, pad = 4, gap = 4;
    svg.setAttribute('viewBox', '0 0 360 ' + Math.round(y0 + bh + 36));

    var tag1 = el('text', { 'class': 'plan-tag', x: 180, y: 22, 'text-anchor': 'middle' }); tag1.textContent = 'CABECERA';
    var tag2 = el('text', { 'class': 'plan-tag', x: 180, y: y0 + bh + 24, 'text-anchor': 'middle' }); tag2.textContent = 'PIE DE LA CAMA';
    svg.appendChild(tag1);
    svg.appendChild(el('rect', { 'class': 'plan-bed', x: x0, y: y0, width: bw, height: bh, rx: 8 }));
    svg.appendChild(tag2);

    items = []; slotId = 0; var n = 0;
    var tieneFondo = m.frontales.length || m.zapateros.length || m.estantes;
    var hc = cab.length ? Math.max(46, 38 * s) : 0;
    var hf = tieneFondo ? Math.max(44, 40 * s) : 0;
    var yb = y0 + pad + (hc ? hc + gap : 0);
    var yf = y0 + bh - pad - hf;
    var hb = yf - yb - (hf ? gap : -pad);
    if (!hf) hb = y0 + bh - pad - yb;
    var iw = bw - 2 * pad;

    // Cabecera
    if (cab.length) {
      var pesosC = cab.map(function (d) { return d ? d[0] : 1; });
      reparto(iw, pesosC, gap).forEach(function (r, i) {
        var d = cab[i];
        items.push({ tipo: 'b', etiqueta: 'B' + (i + 1), x: x0 + pad + r.x, y: y0 + pad, w: r.w, h: hc, abre: [0, -14], kind: 'Baulera', titulo: 'Baulera de cabecera ' + (i + 1) + ' de ' + cab.length,
          filas: (d ? [filaMedidas(d)] : []).concat([['Ubicación', 'En la cabecera de la cama']]) });
      });
    }

    // Laterales: cada "lugar" del costado puede llevar varios cajones apilados (el 1 va arriba del 2)
    var NIVELES = ['arriba', 'medio', 'abajo'];
    function nivelTxt(i, k) { return k === 2 ? (i === 0 ? 'Arriba' : 'Abajo') : k === 3 ? ['Arriba', 'En el medio', 'Abajo'][i] : null; }
    var kLat = m.latNiveles || 1;
    var sideW = Math.max(.18, Math.min(.45, lat.dim[0] / m.anchoTotal)) * bw;
    function columna(cant, x, lado, dx) {
      if (!cant) return;
      var lugares = Math.max(1, Math.round(cant / kLat));
      var h = (hb - (lugares - 1) * 4) / lugares;
      for (var l = 0; l < lugares; l++) {
        apilar(items, { x: x, y: yb + l * (h + 4), w: sideW, h: h }, kLat, function (i) {
          n++;
          return { tipo: 'c', etiqueta: String(n), abre: [dx, 0], kind: 'Cajón', titulo: 'Cajón ' + n + ' de ' + m.cajones,
            filas: [filaMedidas(lat.dim), ['Ubicación', lado]].concat(nivelTxt(i, kLat) ? [['Nivel', nivelTxt(i, kLat) + ' (apilado)']] : []).concat([['Al abrirlo', 'Sale 40 cm'], ['Correderas', 'Telescópicas reforzadas Eurohard']]),
            apilado: kLat > 1 };
        });
      }
    }
    var ladoIzq = lat.der === 0 ? 'Un solo lateral de la cama' : 'Lado izquierdo', ladoDer = 'Lado derecho';
    columna(lat.izq, x0 + pad, ladoIzq, -16);
    columna(lat.der, x0 + bw - pad - sideW, ladoDer, 16);

    // Bauleras centrales
    var cx = x0 + pad + (lat.izq ? sideW + gap : 0);
    var cw = (x0 + bw - pad - (lat.der ? sideW + gap : 0)) - cx;
    var cantC = centrales.reduce(function (a, c) { return a + c.n; }, 0);
    if (cantC && cw > 12) {
      var d0 = centrales[0].dim;
      var hbau = d0 ? Math.min(hb, d0[0] * s) : hb * .8;
      reparto(cw, new Array(cantC).fill(1), gap).forEach(function (r, i) {
        items.push({ tipo: 'b', etiqueta: 'B' + (cab.length + i + 1), x: cx + r.x, y: yb, w: r.w, h: hbau, abre: [0, 0], kind: 'Baulera',
          titulo: cantC > 1 ? 'Baulera central ' + (i + 1) + ' de ' + cantC : 'Baulera central',
          filas: (d0 ? [filaMedidas(d0)] : []).concat([['Ubicación', 'Centro de la cama'], ['Tapa', 'Se abre desde arriba']]) });
      });
    }

    // Pie: cajones frontales, zapateros o estantes
    if (hf) {
      var piezas = [];
      m.frontales.forEach(function (f) {
        var k = f.niveles || 1, cols = Math.max(1, Math.round(f.n / k));
        for (var c = 0; c < cols; c++) piezas.push({ t: 'c', peso: f.dim[0], dim: f.dim, k: k });
      });
      m.zapateros.forEach(function (a) { piezas.push({ t: 'z', peso: a, ancho: a }); });
      if (m.estantes) { piezas.push({ t: 'e', peso: 1 }); piezas.push({ t: 'e', peso: 1 }); }
      reparto(iw, piezas.map(function (p) { return p.peso; }), gap).forEach(function (r, i) {
        var q = piezas[i], X = x0 + pad + r.x;
        if (q.t === 'c') {
          apilar(items, { x: X, y: yf, w: r.w, h: hf }, q.k, function (j) {
            n++;
            return { tipo: 'c', etiqueta: String(n), abre: [0, 16], kind: 'Cajón', titulo: 'Cajón ' + n + ' de ' + m.cajones,
              filas: [filaMedidas(q.dim), ['Ubicación', 'Al pie de la cama']].concat(nivelTxt(j, q.k) ? [['Nivel', nivelTxt(j, q.k) + ' (apilado)']] : []).concat([['Al abrirlo', 'Sale 40 cm'], ['Correderas', 'Telescópicas reforzadas Eurohard']]),
              apilado: q.k > 1 };
          });
        } else if (q.t === 'z') {
          var nz = m.zapateros.length, iz = i - piezas.filter(function (p) { return p.t === 'c'; }).length;
          items.push({ tipo: 'z', etiqueta: 'Z', x: X, y: yf, w: r.w, h: hf, abre: [0, 16], kind: 'Zapatero', titulo: 'Zapatero ' + (nz > 1 ? (iz + 1) + ' de ' + nz : 'al pie'),
            filas: [['Ancho', q.ancho + ' cm'], ['Alto', '15 cm'], ['Profundidad', '40 cm']].concat(m.pares ? [['Capacidad', m.pares + ' pares']] : []).concat([['Ubicación', 'Al pie de la cama']]) });
        } else {
          items.push({ tipo: 'e', etiqueta: 'E', x: X, y: yf, w: r.w, h: hf, abre: [0, 0], kind: 'Estantes', titulo: 'Estantes del pie (' + (m.estantes.n / 2) + ' por columna)',
            filas: [['Cantidad', m.estantes.n + ' estantes en total'], ['Ancho de cada uno', m.estantes.dim[0] + ' cm'], ['Alto', m.estantes.dim[2] + ' cm'], ['Profundidad', m.estantes.dim[1] + ' cm'], ['Ubicación', 'En los pies de la cama']] });
        }
      });
    }

    // Dibujo
    var grupo = el('g', {}), primero = null;
    svg.appendChild(grupo);
    var orden = [];
    items.forEach(function (it, idx) { orden.push({ it: it, idx: idx }); });
    orden.sort(function (p, q) { return (p.it.slot && p.it.slot === q.it.slot) ? q.it.nivel - p.it.nivel : p.idx - q.idx; });
    orden.forEach(function (o) {
      var it = o.it, idx = o.idx;
      var g = el('g', { 'class': 'plan-item ' + it.tipo + (idx === 0 ? ' pulse' : ''), tabindex: '0', role: 'button', 'aria-label': it.titulo });
      g.appendChild(el('rect', { x: it.x, y: it.y, width: it.w, height: it.h, rx: 5 }));
      var tx = it.x + it.w / 2, ty = it.y + it.h / 2 + 4.5, tam = it.h < 26 ? 10 : 13;
      if (it.k > 1 && it.nivel > 0) { tx = it.x + it.w - 7; ty = it.y + it.h - 4; tam = 10; } // las de abajo muestran su número en la parte que asoma
      var t = el('text', { x: tx, y: ty, 'text-anchor': 'middle', 'font-size': tam });
      t.textContent = it.etiqueta;
      g.appendChild(t);
      function elegir() {
        Array.prototype.forEach.call(grupo.children, function (c) { c.classList.remove('on', 'pulse'); c.style.transform = ''; });
        g.classList.add('on');
        g.style.transform = 'translate(' + it.abre[0] + 'px,' + it.abre[1] + 'px)';
        alElegir(it);
      }
      g.addEventListener('click', elegir);
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); elegir(); } });
      grupo.appendChild(g);
      if (idx === 0) primero = g;
    });
    return { items: items, primero: primero, hayApilados: items.some(function (i) { return i.apilado; }) };
  }

  PM.dibujarPlano = dibujar;
})();
