// Configurador: cama box en 3D (CSS, sin librerías ni fotos) armada con los datos de js/modelos.js.
// El cliente elige medida, modelo de partida, cajones de los costados, pie, color y cierre suave, y envía la solicitud por WhatsApp.
(function () {
  var PM = window.PM, M = PM.MODELOS, COL = COLORS;
  var ORDEN = ['1-plaza', '1-plaza-y-media', '2-plazas', 'queen', 'king-180', 'king-200'];
  var q = new URLSearchParams(location.search);
  var inicial = M.filter(function (m) { return m.slug === q.get('m'); })[0] || M.filter(function (m) { return m.slug === '6-vip-2-plazas'; })[0];
  var st = { linea: inicial.linea, slug: inicial.slug, lat: null, pie: null, color: 0, soft: false, sel: null };
  var vista = { rx: -24, ry: -38 }, S = 1.5, piezas = [], contador = 0;
  var el = function (id) { return document.getElementById(id); };
  var escena = el('cz-escena'), cama = el('cz-cama');

  // ---------- datos derivados ----------
  function modelo() { return M.filter(function (m) { return m.slug === st.slug; })[0]; }
  function slotsDe(m) {
    var k = m.latNiveles, est = k === 1 ? 'G' : (k === 2 ? 'N' : 'F');
    function arr(c) { if (!c) return []; var n = k === 1 ? c : Math.round(c / k); return new Array(n).fill(est); }
    return { izq: arr(m.laterales.izq), der: arr(m.laterales.der), editable: k === 1 || k === 2 };
  }
  function alturas(estados, m) { // alturas de los cajones de un costado, de a un cajón
    var out = [];
    estados.forEach(function (s) {
      if (s === 'G') out.push(30); else if (s === 'N') out.push(15, 15); else for (var i = 0; i < m.latNiveles; i++) out.push(m.laterales.dim[2]);
    });
    return out;
  }
  function etiquetaPie(m) {
    if (m.estantes) return m.estantes.n + ' estantes (' + m.estantes.dim[0] + ' cm de ancho cada uno)';
    if (m.zapateros.length) return PM.textoZapateros(m);
    var dims = []; m.frontales.forEach(function (f) { for (var i = 0; i < f.n; i++) dims.push(f.dim); });
    var g = PM.agrupar(dims);
    return dims.length + ' cajones al pie (' + g.map(function (x) { return x.n + ' de ' + PM.fmt(x.dim); }).join(' y ') + ')';
  }
  function pieOpciones(linea) {
    var out = [], vistos = {};
    M.filter(function (m) { return m.linea === linea && m.alto === 42; }).forEach(function (m) {
      var sig = JSON.stringify([m.frontales.map(function (f) { return [f.n, f.dim]; }), m.zapateros, m.estantes ? [m.estantes.n, m.estantes.dim] : null]);
      if (vistos[sig]) return; vistos[sig] = 1;
      out.push({ sig: sig, frontales: m.frontales, zapateros: m.zapateros, pares: m.pares, estantes: m.estantes, label: etiquetaPie(m) });
    });
    return out;
  }
  function pieDeModelo(m) {
    var sig = JSON.stringify([m.frontales.map(function (f) { return [f.n, f.dim]; }), m.zapateros, m.estantes ? [m.estantes.n, m.estantes.dim] : null]);
    var op = pieOpciones(m.linea).filter(function (o) { return o.sig === sig; })[0];
    return op || { sig: sig, frontales: m.frontales, zapateros: m.zapateros, pares: m.pares, estantes: m.estantes, label: etiquetaPie(m) };
  }
  function reiniciar(slug) {
    var m = M.filter(function (x) { return x.slug === slug; })[0];
    st.slug = slug; st.linea = m.linea; st.lat = slotsDe(m); st.pie = pieDeModelo(m); st.sel = null;
  }
  function totalCajones() {
    var m = modelo(), n = alturas(st.lat.izq, m).length + alturas(st.lat.der, m).length;
    st.pie.frontales.forEach(function (f) { n += f.n; });
    return n;
  }
  function equivalente() {
    var base = modelo(), sp = st.pie.sig;
    var h = function (a, m) { return alturas(a, m).slice().sort().join(','); };
    return M.filter(function (x) {
      if (x.linea !== base.linea || x.alto !== base.alto || JSON.stringify(x.bauleras) !== JSON.stringify(base.bauleras)) return false;
      var xs = slotsDe(x);
      return h(xs.izq, x) === h(st.lat.izq, base) && h(xs.der, x) === h(st.lat.der, base) && pieDeModelo(x).sig === sp;
    })[0] || null;
  }

  // ---------- geometría 3D ----------
  function c(n) { return n * S; }
  function cuboide(w, h, d, abierto) { // w, h, d en cm; frente = +z
    var g = document.createElement('div'); g.className = 'cb';
    var W = c(w), H = c(h), D = c(d);
    function cara(cl, fw, fh, tf) { var f = document.createElement('div'); f.className = 'f ' + cl; f.style.cssText = 'width:' + fw + 'px;height:' + fh + 'px;left:' + (-fw / 2) + 'px;top:' + (-fh / 2) + 'px;transform:' + tf; g.appendChild(f); return f; }
    var fr = cara('fr', W, H, 'translateZ(' + D / 2 + 'px)');
    cara('bk', W, H, 'rotateY(180deg) translateZ(' + D / 2 + 'px)');
    cara('sd', D, H, 'rotateY(90deg) translateZ(' + W / 2 + 'px)');
    cara('sd', D, H, 'rotateY(-90deg) translateZ(' + W / 2 + 'px)');
    if (!abierto) cara('tp', W, D, 'rotateX(90deg) translateZ(' + H / 2 + 'px)');
    cara('bt', W, D, 'rotateX(-90deg) translateZ(' + H / 2 + 'px)');
    g._frente = fr;
    return g;
  }
  function poner(g, x, y, z, rot, H) { g.style.transform = 'translate3d(' + c(x) + 'px,' + (-c(y - H / 2)) + 'px,' + c(z) + 'px)' + (rot ? ' rotateY(' + rot + 'deg)' : '') + ' translateZ(var(--op,0px))'; }

  function registrar(g, key, info) {
    g.classList.add('pz'); g.setAttribute('data-k', key);
    var p = { g: g, key: key, info: info };
    piezas.push(p); return p;
  }
  function cajonPieza(key, info, ancho, alto, prof, x, y, z, rot, H) {
    var g = document.createElement('div'); g.className = 'cajon';
    var cb = cuboide(ancho - 0.8, alto - 0.8, prof, true);
    cb.style.transform = 'translateZ(' + c(-prof / 2 + 0.3) + 'px)';
    var t = document.createElement('i'); t.className = 'tir'; cb._frente.appendChild(t);
    g.appendChild(cb); poner(g, x, y, z, rot, H);
    cama.appendChild(g); return registrar(g, key, info);
  }
  function reparto(total, pesos, hueco) { var libre = total - hueco * (pesos.length + 1), suma = pesos.reduce(function (a, b) { return a + b; }, 0), x = hueco, out = []; pesos.forEach(function (p) { var w = libre * p / suma; out.push({ c: x + w / 2, w: w }); x += w + hueco; }); return out; }

  function construir() {
    var m = modelo(), W = m.anchoTotal, L = m.largoTotal, H = m.alto, col = COL[st.color];
    var maxd = Math.max(W, L) + 95;
    S = Math.max(0.7, Math.min(1.75, (escena.clientWidth - 30) / maxd));
    cama.innerHTML = ''; piezas = []; contador = 0;
    cama.style.setProperty('--c', col.tex ? 'url(' + col.tex + ') center/cover' : col.sw);
    var pie = st.pie, hayEst = !!pie.estantes, hayFondo = hayEst || pie.zapateros.length || pie.frontales.length;
    var cab = m.bauleras.cabecera, hc = cab.length ? (cab[0] ? cab[0][1] : 38) : 0;
    var Lb = hayEst ? L - 45 : L, zc = -(L - Lb) / 2;

    var suelo = document.createElement('div'); suelo.className = 'suelo';
    suelo.style.cssText = 'width:' + c(W + 70) + 'px;height:' + c(L + 70) + 'px;left:' + (-c(W + 70) / 2) + 'px;top:' + (-c(L + 70) / 2) + 'px;transform:translate3d(0,' + c(H / 2 + 0.3) + 'px,0) rotateX(90deg)';
    cama.appendChild(suelo);
    var cuerpo = cuboide(W, H, Lb); cuerpo.classList.add('cuerpo'); poner(cuerpo, 0, H / 2, zc, 0, H); cama.appendChild(cuerpo);

    // lugares y alturas de los cajones
    var zIni = -L / 2 + hc + 3, zFin = L / 2 - (hayEst ? 45 : (pie.zapateros.length || pie.frontales.length ? 40 : 0)) - 3;
    function nivelTxt(i, k) { return k === 2 ? (i === 0 ? 'Arriba' : 'Abajo') : k === 3 ? ['Arriba', 'En el medio', 'Abajo'][i] : null; }
    function pilaY(k, alto, i) { var util = H - 6, base = 3 + (util - k * alto) / 2; return base + (k - 1 - i) * alto + alto / 2; }
    var dimL = m.laterales.dim;
    ['izq', 'der'].forEach(function (lado) {
      var est = st.lat[lado]; if (!est.length) return;
      var x = lado === 'izq' ? -W / 2 : W / 2, rot = lado === 'izq' ? -90 : 90, nombre = m.laterales.der === 0 ? 'Un solo lateral de la cama' : (lado === 'izq' ? 'Lado izquierdo' : 'Lado derecho');
      var largoSlot = (zFin - zIni) / est.length;
      est.forEach(function (s, si) {
        var k = s === 'G' ? 1 : (s === 'N' ? 2 : m.latNiveles), alto = s === 'G' ? 30 : (s === 'N' ? 15 : dimL[2]);
        var zc2 = zIni + largoSlot * (si + 0.5);
        for (var i = 0; i < k; i++) {
          contador++;
          var info = { tipo: 'Cajón', titulo: 'Cajón ' + contador, filas: [['Medidas', PM.fmt([dimL[0], dimL[1], alto])], ['Ubicación', nombre]].concat(nivelTxt(i, k) ? [['Nivel', nivelTxt(i, k) + ' (apilado)']] : []).concat([['Al abrirlo', 'Sale 40 cm'], ['Correderas', 'Telescópicas reforzadas Eurohard' + (st.soft ? ' con cierre suave' : '')]]), lado: lado, slot: si, estado: s, pared: x < 0 ? 'izq' : 'der' };
          cajonPieza('L-' + lado + '-' + si + '-' + i, info, largoSlot - 1.2, alto, 40, x + (x < 0 ? -0.2 : 0.2) * 0, pilaY(k, alto, i), zc2, rot, H);
        }
      });
    });
    // pie
    if (hayFondo && !hayEst) {
      var cols = [];
      pie.frontales.forEach(function (f) { var k = f.niveles || 1, n = Math.max(1, Math.round(f.n / k)); for (var i = 0; i < n; i++) cols.push({ t: 'c', dim: f.dim, k: k, w: f.dim[0] }); });
      pie.zapateros.forEach(function (a, i) { cols.push({ t: 'z', w: a, i: i }); });
      var sum = cols.reduce(function (a, b) { return a + b.w; }, 0), esc = sum > W - 6 ? (W - 6) / sum : 1;
      var rr = reparto(W, cols.map(function (cc) { return cc.w * esc; }), Math.max(1, (W - sum * esc) / (cols.length + 1)));
      cols.forEach(function (cc, ci) {
        var xx = -W / 2 + rr[ci].c;
        if (cc.t === 'c') {
          for (var i = 0; i < cc.k; i++) {
            contador++;
            cajonPieza('P-' + ci + '-' + i, { tipo: 'Cajón', titulo: 'Cajón ' + contador, filas: [['Medidas', PM.fmt(cc.dim)], ['Ubicación', 'Al pie de la cama']].concat(nivelTxt(i, cc.k) ? [['Nivel', nivelTxt(i, cc.k) + ' (apilado)']] : []).concat([['Al abrirlo', 'Sale 40 cm'], ['Correderas', 'Telescópicas reforzadas Eurohard' + (st.soft ? ' con cierre suave' : '')]]), pared: 'pie' },
              rr[ci].w - 0.8, cc.dim[2], 40, xx, pilaY(cc.k, cc.dim[2], i), L / 2, 0, H);
          }
        } else {
          var nz = pie.zapateros.length;
          cajonPieza('Z-' + cc.i, { tipo: 'Zapatero', titulo: 'Zapatero ' + (nz > 1 ? (cc.i + 1) + ' de ' + nz : 'al pie'), filas: [['Ancho', cc.w + ' cm'], ['Alto', '39 cm'], ['Profundidad', '40 cm']].concat(pie.pares ? [['Capacidad', pie.pares + ' pares']] : []).concat([['Ubicación', 'Al pie de la cama']]), pared: 'pie' },
            rr[ci].w - 0.8, 39, 40, xx, 3 + 36 / 2, L / 2, 0, H);
        }
      });
    }
    if (hayEst) estantes(m, W, H, L, Lb);
    bauleras(m, W, H, L, hc);
    cama.classList.toggle('sin-pie', !hayFondo);
    pintarPartes();
    if (st.sel) { var p = piezas.filter(function (z) { return z.key === st.sel; })[0]; if (p) marcar(p, false); else st.sel = null; }
    transformar(false);
  }

  function estantes(m, W, H, L, Lb) {
    var e = st.pie.estantes, prof = 45, zc = L / 2 - prof / 2, g = document.createElement('div'); g.className = 'est';
    function tabla(w, h, d, x, y, z) { var b = cuboide(w, h, d); poner(b, x, y, z, 0, H); g.appendChild(b); }
    tabla(W, 1.5, prof, 0, 0.75, zc); tabla(W, 1.5, prof, 0, H - 0.75, zc);
    tabla(1.5, H, prof, -W / 2 + 0.75, H / 2, zc); tabla(1.5, H, prof, W / 2 - 0.75, H / 2, zc); tabla(1.5, H, prof, 0, H / 2, zc);
    tabla(W, H, 1.5, 0, H / 2, L / 2 - prof + 0.75);
    var cols = [-W / 4, W / 4], paso = (H - 3) / 3;
    cols.forEach(function (cx) { [1, 2].forEach(function (i) { tabla((W - 4.5) / 2, 1.2, prof - 2, cx, 1.5 + paso * i, zc + 1); }); });
    cama.appendChild(g);
    registrar(g, 'E', { tipo: 'Estantes', titulo: 'Estantes del pie', filas: [['Cantidad', e.n + ' estantes en total'], ['Ancho de cada uno', e.dim[0] + ' cm'], ['Alto', e.dim[2] + ' cm'], ['Profundidad', e.dim[1] + ' cm'], ['Ubicación', 'En los pies de la cama']], pared: 'pie' });
  }

  function bauleras(m, W, H, L, hc) {
    var cab = m.bauleras.cabecera, cen = m.bauleras.central, zIni = -L / 2;
    function tapa(w, d, x, z, key, info) {
      var g = document.createElement('div'); g.className = 'baul';
      var cb = cuboide(w - 1, 1.4, d - 1); cb.classList.add('tapa'); g.appendChild(cb); poner(g, x, H + 0.7, z, 0, H);
      cama.appendChild(g); registrar(g, key, info);
    }
    if (cab.length) {
      var pesos = cab.map(function (d) { return d ? d[0] : 1; }), suma = pesos.reduce(function (a, b) { return a + b; }, 0), hueco = 1.5;
      var rr = reparto(W, pesos.map(function (p) { return p * (W - hueco * (cab.length + 1)) / suma; }), hueco);
      cab.forEach(function (d, i) {
        tapa(rr[i].w, hc, -W / 2 + rr[i].c, zIni + hc / 2, 'B-h-' + i, { tipo: 'Baulera', titulo: 'Baulera de cabecera ' + (i + 1) + ' de ' + cab.length, filas: (d ? [['Medidas', PM.fmt(d)]] : []).concat([['Ubicación', 'En la cabecera de la cama'], ['Tapa', 'Se abre desde arriba']]), pared: 'cab' });
      });
    }
    var n = cen.reduce(function (a, x) { return a + x.n; }, 0);
    if (n) {
      var d0 = cen[0].dim, lar = d0 ? d0[0] : 102, anc = d0 ? d0[1] : 50, solo = m.laterales.der === 0;
      for (var i = 0; i < n; i++) {
        var x = solo ? W / 2 - anc / 2 - 2 : (n === 1 ? 0 : (i === 0 ? -1 : 1) * (anc / 2 + 1));
        tapa(anc, Math.min(lar, L - hc - 50), x, zIni + hc + 2 + Math.min(lar, L - hc - 50) / 2, 'B-c-' + i, { tipo: 'Baulera', titulo: n > 1 ? 'Baulera central ' + (i + 1) + ' de ' + n : 'Baulera central', filas: (d0 ? [['Medidas', PM.fmt(d0)]] : []).concat([['Ubicación', solo ? 'Del lado opuesto a los cajones' : 'Centro de la cama'], ['Tapa', 'Se abre desde arriba']]), pared: 'arriba' });
      }
    }
  }

  // ---------- cámara y selección ----------
  function transformar(anim) {
    el('cz-mundo').classList.toggle('anim', !!anim);
    cama.style.transform = 'rotateX(' + vista.rx + 'deg) rotateY(' + vista.ry + 'deg)';
  }
  function marcar(p, girar) {
    piezas.forEach(function (z) { z.g.classList.remove('sel'); z.g.style.setProperty('--op', '0px'); z.g.style.setProperty('--ly', '0px'); });
    p.g.classList.add('sel'); st.sel = p.key;
    if (p.g.classList.contains('cajon')) p.g.style.setProperty('--op', c(32) + 'px');
    if (p.g.classList.contains('baul')) p.g.style.setProperty('--ly', -c(14) + 'px');
    if (girar) {
      var pared = p.info.pared;
      if (pared === 'izq') vista.ry = 52; else if (pared === 'der') vista.ry = -52; else if (pared === 'pie') vista.ry = -14; else if (pared === 'cab') vista.ry = 160;
      vista.rx = pared === 'arriba' || pared === 'cab' ? -48 : -26;
      transformar(true);
    }
    ficha(p); pintarPartes();
  }
  function ficha(p) {
    el('cz-ficha-vacia').hidden = true; el('cz-ficha-cuerpo').hidden = false;
    el('cz-f-tipo').textContent = p.info.tipo; el('cz-f-titulo').textContent = p.info.titulo;
    var dl = el('cz-f-dl'); dl.innerHTML = '';
    p.info.filas.forEach(function (f) { var r = document.createElement('div'), a = document.createElement('dt'), b = document.createElement('dd'); a.textContent = f[0]; b.textContent = f[1]; r.appendChild(a); r.appendChild(b); dl.appendChild(r); });
    var bt = el('cz-f-cambiar');
    if (p.info.lado && st.lat.editable && (p.info.estado === 'G' || p.info.estado === 'N')) {
      bt.hidden = false; bt.textContent = p.info.estado === 'G' ? 'Cambiar este lugar por 2 cajones normales' : 'Cambiar este lugar por 1 cajón grande';
      bt.onclick = function () { alternar(p.info.lado, p.info.slot); };
    } else bt.hidden = true;
  }
  function alternar(lado, slot) {
    st.lat[lado][slot] = st.lat[lado][slot] === 'G' ? 'N' : 'G';
    st.sel = 'L-' + lado + '-' + slot + '-0'; todo();
  }

  var arr = null;
  escena.addEventListener('pointerdown', function (e) {
    arr = { x: e.clientX, y: e.clientY, ry: vista.ry, rx: vista.rx, mov: false, pz: e.target.closest ? e.target.closest('.pz') : null };
    try { escena.setPointerCapture(e.pointerId); } catch (x) { }
  });
  escena.addEventListener('pointermove', function (e) {
    if (!arr) return;
    var dx = e.clientX - arr.x, dy = e.clientY - arr.y;
    if (Math.abs(dx) + Math.abs(dy) > 6) arr.mov = true;
    if (arr.mov) { vista.ry = arr.ry + dx * 0.5; vista.rx = Math.max(-80, Math.min(-6, arr.rx - dy * 0.3)); transformar(false); el('cz-ayuda').style.opacity = 0; }
  });
  function soltar() { if (arr && !arr.mov && arr.pz) { var k = arr.pz.getAttribute('data-k'); var p = piezas.filter(function (z) { return z.key === k; })[0]; if (p) marcar(p, false); } arr = null; }
  escena.addEventListener('pointerup', soltar); escena.addEventListener('pointercancel', function () { arr = null; });
  el('cz-girar').addEventListener('click', function () { vista.ry += 90; transformar(true); });
  el('cz-arriba').addEventListener('click', function () { vista.rx = -82; vista.ry = 0; transformar(true); });
  window.addEventListener('resize', function () { construir(); });

  // ---------- paneles ----------
  function pintarPartes() {
    var cont = el('cz-partes'); cont.innerHTML = '';
    piezas.forEach(function (p) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'cz-parte' + (st.sel === p.key ? ' on' : '');
      b.textContent = p.info.tipo === 'Cajón' ? p.info.titulo.replace('Cajón ', '') : (p.info.tipo === 'Baulera' ? 'B' : (p.info.tipo === 'Zapatero' ? 'Z' : 'E'));
      b.title = p.info.titulo; b.setAttribute('aria-label', p.info.titulo);
      b.addEventListener('click', function () { marcar(p, true); });
      cont.appendChild(b);
    });
  }
  function paneles() {
    var chips = el('cz-medida'); chips.innerHTML = '';
    ORDEN.forEach(function (k) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'f-chip' + (k === st.linea ? ' on' : '');
      b.innerHTML = '<b>' + PM.LINEAS[k].nombre + '</b><span>' + PM.LINEAS[k].colchon + '</span>';
      b.addEventListener('click', function () { reiniciar(PM.porPrecio(M.filter(function (m) { return m.linea === k; }))[0].slug); todo(); });
      chips.appendChild(b);
    });
    var lista = el('cz-modelo'); lista.innerHTML = '';
    PM.porPrecio(M.filter(function (m) { return m.linea === st.linea; })).forEach(function (m) {
      var v = PM.venta(m), nB = PM.totalBauleras(m), b = document.createElement('button'); b.type = 'button'; b.className = 'f-modelo' + (m.slug === st.slug ? ' on' : '');
      b.innerHTML = '<img src="' + PM.webp(v.img, 's') + '" alt="" width="200" height="267" loading="lazy"><span><b>' + m.corto + '</b><small>' + m.cajones + ' cajones' + (nB ? ' · ' + nB + (nB === 1 ? ' baulera' : ' bauleras') : '') + '</small></span><em>' + PM.pesos(v.precio) + '</em>';
      b.addEventListener('click', function () { reiniciar(m.slug); todo(); });
      lista.appendChild(b);
    });
    // costados
    var lat = el('cz-lat'); lat.innerHTML = '';
    el('cz-lat-nota').textContent = st.lat.editable ? 'Tocá cada lugar para cambiarlo: 1 cajón grande o 2 cajones normales.' : 'En este modelo los cajones de los costados no se modifican.';
    ['izq', 'der'].forEach(function (lado) {
      if (!st.lat[lado].length) return;
      var f = document.createElement('div'); f.className = 'cz-fila';
      var r = document.createElement('span'); r.textContent = modelo().laterales.der === 0 ? 'Lateral' : (lado === 'izq' ? 'Lado izquierdo' : 'Lado derecho'); f.appendChild(r);
      st.lat[lado].forEach(function (s, i) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'cz-slot'; b.disabled = !st.lat.editable;
        b.textContent = s === 'G' ? '1 grande' : (s === 'N' ? '2 normales' : modelo().latNiveles + ' apilados');
        b.addEventListener('click', function () { alternar(lado, i); });
        f.appendChild(b);
      });
      lat.appendChild(f);
    });
    // pie
    var pie = el('cz-pie'); pie.innerHTML = '';
    pieOpciones(st.linea).forEach(function (o) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'cz-op' + (o.sig === st.pie.sig ? ' on' : ''); b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', o.sig === st.pie.sig ? 'true' : 'false');
      b.textContent = o.label;
      b.addEventListener('click', function () { st.pie = o; st.sel = null; todo(); });
      pie.appendChild(b);
    });
    // color
    var cols = el('cz-color'); cols.innerHTML = '';
    COL.forEach(function (cc, i) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'f-sw' + (i === st.color ? ' on' : ''); b.setAttribute('aria-label', cc.n); b.title = cc.n;
      b.style.background = cc.tex ? 'url(' + cc.tex + ') center/cover' : cc.sw;
      b.addEventListener('click', function () { st.color = i; todo(); });
      cols.appendChild(b);
    });
    el('cz-soft').setAttribute('aria-checked', st.soft ? 'true' : 'false');
  }
  el('cz-soft').addEventListener('click', function () { st.soft = !st.soft; todo(); });
  el('cz-notas').addEventListener('input', resumen);

  function lineaLat(lado) {
    var a = st.lat[lado]; if (!a.length) return null;
    var g = 0, n = 0, f = 0; a.forEach(function (s) { if (s === 'G') g++; else if (s === 'N') n++; else f++; });
    var t = []; if (g) t.push(g + (g === 1 ? ' cajón grande' : ' cajones grandes')); if (n) t.push(n * 2 + ' cajones normales'); if (f) t.push(f * modelo().latNiveles + ' cajones apilados');
    return t.join(' y ');
  }
  function resumen() {
    var m = modelo(), col = COL[st.color], eq = equivalente(), tot = totalCajones();
    var izq = lineaLat('izq'), der = lineaLat('der'), solo = m.laterales.der === 0;
    var precio = null;
    if (eq) precio = PM.venta(eq).precio + (st.color ? PM.COLOR_ADICIONAL : 0) + (st.soft ? tot * PM.CIERRE_SUAVE_POR_CAJON : 0);
    var notas = el('cz-notas').value.trim();
    var msg = 'Hola! Quiero pedir una cama a medida.\n' +
      'Medida: ' + m.lineaNombre + ' (colchón ' + m.colchon + ')\n' +
      'Modelo de partida: ' + m.corto + '\n' +
      (solo ? 'Cajones del lateral: ' + izq : 'Cajones del lado izquierdo: ' + izq + '\nCajones del lado derecho: ' + der) + '\n' +
      'Al pie: ' + st.pie.label + '\n' +
      'Total de cajones: ' + tot + '\n' +
      'Color: ' + col.n + '\n' +
      'Cierre suave: ' + (st.soft ? 'sí' : 'no') + '\n' +
      (notas ? 'Pedido especial: ' + notas + '\n' : '') +
      (precio ? 'Es igual al modelo ' + eq.corto + '. Precio: ' + PM.pesos(precio) + '.' : 'Quedo a la espera de que me confirmen si se puede fabricar, el precio y el plazo.');
    var h = '<h2>Tu cama</h2><ul class="f-lista">' +
      '<li><span>Medida</span><b>' + m.lineaNombre + ' · ' + m.colchon + '</b></li>' +
      (solo ? '<li><span>Lateral</span><b>' + izq + '</b></li>' : '<li><span>Izquierdo</span><b>' + izq + '</b></li><li><span>Derecho</span><b>' + der + '</b></li>') +
      '<li><span>Al pie</span><b>' + st.pie.label + '</b></li>' +
      '<li><span>Total de cajones</span><b>' + tot + '</b></li>' +
      '<li><span>Color</span><b>' + col.n + '</b></li>' +
      '<li><span>Correderas</span><b>' + (st.soft ? 'Con cierre suave' : 'Telescópicas reforzadas') + '</b></li></ul>';
    if (precio) h += '<p class="f-total"><span>Precio final</span><b>' + PM.pesos(precio) + '</b></p><p class="h-nota">Es igual al modelo ' + eq.corto + ': ' + (st.color ? 'incluye el adicional por color. ' : '') + 'El precio incluye envío, subida y armado según tu zona.</p>';
    else h += '<p class="cz-cotizar"><b>Precio a confirmar</b><span>Es una cama a medida: la revisamos y te confirmamos el precio y el plazo.</span></p>';
    h += '<a class="btn-whatsapp m-cta" target="_blank" rel="noopener" href="https://wa.me/5491168767075?text=' + encodeURIComponent(msg) + '">Enviar mi diseño por WhatsApp</a>' +
      '<p class="h-nota" style="margin:0">Esto es una solicitud, no una compra. Revisamos que se pueda fabricar y te respondemos con el precio y el plazo.</p>';
    el('cz-resumen').innerHTML = h;
  }

  function todo() { paneles(); construir(); resumen(); }
  window.__cfg = { probar: function (slug) { reiniciar(slug); todo(); return { cajones: piezas.filter(function (p) { return p.info.tipo === 'Cajón'; }).length, esperado: totalCajones(), baul: piezas.filter(function (p) { return p.info.tipo === 'Baulera'; }).length, otras: piezas.filter(function (p) { return p.info.tipo === 'Zapatero' || p.info.tipo === 'Estantes'; }).length }; } };
  reiniciar(inicial.slug); todo();
  if (window.ResizeObserver) { var t; new ResizeObserver(function () { clearTimeout(t); t = setTimeout(construir, 150); }).observe(escena); }
})();
