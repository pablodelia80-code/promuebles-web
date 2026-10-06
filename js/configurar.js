// Configurador: cama box en 3D (CSS, sin librerías ni fotos) armada con los datos de js/modelos.js.
// El cliente elige medida, modelo de partida, cajones de los costados, pie, color y cierre suave, y envía la solicitud por WhatsApp.
(function () {
  var PM = window.PM, M = PM.MODELOS, COL = COLORS;
  var ORDEN = ['1-plaza', '1-plaza-y-media', '2-plazas', 'queen', 'king-180', 'king-200'];
  var q = new URLSearchParams(location.search);
  var inicial = M.filter(function (m) { return m.slug === q.get('m'); })[0] || M.filter(function (m) { return m.slug === '6-vip-2-plazas'; })[0];
  var st = { linea: inicial.linea, slug: inicial.slug, lat: null, pie: null, color: 0, soft: false, sel: null };
  var vista = { rx: -24, ry: -38 }, S = 1.5, piezas = [], contador = 0, modoArriba = false, animarCam = false;
  var el = function (id) { return document.getElementById(id); };
  var escena = el('cz-escena'), cama = el('cz-cama');

  // ---------- datos derivados ----------
  function nombreCorto(m) { return m.corto.replace(/ (Queen|King 180|King 200|Plaza y Media)$/, ''); }
  function modelo() { return M.filter(function (m) { return m.slug === st.slug; })[0]; }
  function slotsDe(m) {
    if (m.laterales.patron) return { izq: m.laterales.patron.slice(), der: m.laterales.patron.slice(), editable: true };
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
  // Cajones al pie elegibles por lado en 2 Plazas y Queen: 'G' = 1 cajón grande (el de la 6 y la 10 Vip), 'N' = 2 cajones normales apilados (los de la 12 Vip).
  var PIE_GRANDE = { '2-plazas': 65, 'queen': 75 };
  function ladosDeModelo(m) {
    if (!PIE_GRANDE[m.linea] || m.alto !== 42 || m.frontales.length !== 1) return null;
    var f = m.frontales[0];
    if (f.n === 2 && f.dim[2] === 30) return ['G', 'G'];
    if (f.n === 4 && f.dim[2] === 15 && f.dim[0] === 48) return ['N', 'N'];
    return null;
  }
  function etiquetaLados(lados, linea) {
    var g = PIE_GRANDE[linea], nG = lados.filter(function (s) { return s === 'G'; }).length, nN = lados.length - nG, t = [];
    if (nG) t.push((nG === 1 ? '1 cajón grande' : nG + ' cajones grandes') + ' (' + g + ' × 40 × 30 cm)');
    if (nN) t.push(nN * 2 + ' cajones normales (48 × 40 × 15 cm)');
    return t.join(' y ');
  }
  function pieCajones(linea, lados) {
    var fr = lados.map(function (s) { return s === 'G' ? { n: 1, dim: [PIE_GRANDE[linea], 40, 30], niveles: 1 } : { n: 2, dim: [48, 40, 15], niveles: 2 }; });
    return { sig: 'C:' + lados.join(''), lados: lados.slice(), frontales: fr, zapateros: [], pares: null, estantes: null, label: etiquetaLados(lados, linea) };
  }
  function pieOpciones(linea) {
    var out = [], vistos = {}, conLados = false;
    M.filter(function (m) { return m.linea === linea && m.alto === 42; }).forEach(function (m) {
      if (ladosDeModelo(m)) { conLados = true; return; }
      var sig = JSON.stringify([m.frontales.map(function (f) { return [f.n, f.dim]; }), m.zapateros, m.estantes ? [m.estantes.n, m.estantes.dim] : null]);
      if (vistos[sig]) return; vistos[sig] = 1;
      out.push({ sig: sig, frontales: m.frontales, zapateros: m.zapateros, pares: m.pares, estantes: m.estantes, label: etiquetaPie(m) });
    });
    if (conLados) out.splice(Math.min(1, out.length), 0, { cajones: true, sig: 'C', label: 'Cajones al pie (elegís cada lado)' });
    return out;
  }
  function pieDeModelo(m) {
    var lm = ladosDeModelo(m); if (lm) return pieCajones(m.linea, lm);
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
    cama.style.setProperty('--c', COL[0].sw); pintarMuestra();
    var pie = st.pie, hayEst = !!pie.estantes, hayFondo = hayEst || pie.zapateros.length || pie.frontales.length;
    var cab = m.bauleras.cabecera, hc = cab.length ? (cab[0] ? cab[0][1] : 38) : 0;
    var Lb = hayEst ? L - 45 : L, zc = -(L - Lb) / 2;

    var gb = geomBauleras(m, W, H, L, hc), hoyo = gb.filter(function (b) { return b.key === st.sel; })[0] || null;
    var suelo = document.createElement('div'); suelo.className = 'suelo';
    suelo.style.cssText = 'width:' + c(W + 70) + 'px;height:' + c(L + 70) + 'px;left:' + (-c(W + 70) / 2) + 'px;top:' + (-c(L + 70) / 2) + 'px;transform:translate3d(0,' + c(H / 2 + 0.3) + 'px,0) rotateX(90deg)';
    cama.appendChild(suelo);
    var cuerpo = cuboide(W, H, Lb, !!hoyo); cuerpo.classList.add('cuerpo'); poner(cuerpo, 0, H / 2, zc, 0, H); cama.appendChild(cuerpo);
    if (hoyo) tapaConHueco(W, H, Lb, zc, hoyo);

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
            cajonPieza('P-' + ci + '-' + i, { tipo: 'Cajón', titulo: 'Cajón ' + contador, filas: [['Medidas', PM.fmt(cc.dim)], ['Ubicación', 'Al pie de la cama']].concat(nivelTxt(i, cc.k) ? [['Nivel', nivelTxt(i, cc.k) + ' (apilado)']] : []).concat([['Al abrirlo', 'Sale 40 cm'], ['Correderas', 'Telescópicas reforzadas Eurohard' + (st.soft ? ' con cierre suave' : '')]]), pared: 'pie', pieLado: pie.lados ? ci : undefined, estado: cc.k > 1 ? 'N' : 'G' },
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
    if (st.sel) { var p = piezas.filter(function (z) { return z.key === st.sel; })[0]; if (p) aplicarSel(p); else st.sel = null; }
    transformar(animarCam); animarCam = false;
  }

  function estantes(m, W, H, L, Lb) {
    var e = st.pie.estantes, prof = 45, zc = L / 2 - prof / 2, g = document.createElement('div'); g.className = 'est';
    function tabla(w, h, d, x, y, z) { var b = cuboide(w, h, d); poner(b, x, y, z, 0, H); g.appendChild(b); }
    tabla(W, 1.5, prof, 0, 0.75, zc); tabla(W, 1.5, prof, 0, H - 0.75, zc);
    tabla(1.5, H, prof, -W / 2 + 0.75, H / 2, zc); tabla(1.5, H, prof, W / 2 - 0.75, H / 2, zc); tabla(1.5, H, prof, 0, H / 2, zc);
    tabla(W, H, 1.5, 0, H / 2, L / 2 - prof + 0.75);
    var cols = [-W / 4, W / 4], niv = Math.max(1, Math.round(e.n / 2)), paso = (H - 3) / niv;
    cols.forEach(function (cx) { for (var i = 1; i < niv; i++) tabla((W - 4.5) / 2, 1.2, prof - 2, cx, 1.5 + paso * i, zc + 1); });
    cama.appendChild(g);
    registrar(g, 'E', { tipo: 'Estantes', titulo: 'Estantes del pie', filas: [['Cantidad', e.n + ' estantes en total'], ['Ancho de cada uno', e.dim[0] + ' cm'], ['Alto', e.dim[2] + ' cm'], ['Profundidad', e.dim[1] + ' cm'], ['Ubicación', 'En los pies de la cama']], pared: 'pie' });
  }

  function geomBauleras(m, W, H, L, hc) {
    var cab = m.bauleras.cabecera, cen = m.bauleras.central, zIni = -L / 2, out = [];
    if (cab.length) {
      var pesos = cab.map(function (d) { return d ? d[0] : 1; }), suma = pesos.reduce(function (a, b) { return a + b; }, 0), hueco = 1.5;
      var rr = reparto(W, pesos.map(function (p) { return p * (W - hueco * (cab.length + 1)) / suma; }), hueco);
      cab.forEach(function (d, i) {
        out.push({ w: rr[i].w, d: hc, x: -W / 2 + rr[i].c, z: zIni + hc / 2, hh: d ? d[2] : H - 2, key: 'B-h-' + i,
          info: { tipo: 'Baulera', titulo: 'Baulera de cabecera ' + (i + 1) + ' de ' + cab.length, filas: (d ? [['Medidas', PM.fmt(d)]] : []).concat([['Ubicación', 'En la cabecera de la cama'], ['Tapa', 'Se abre desde arriba']]), pared: 'cab' } });
      });
    }
    var n = cen.reduce(function (a, x) { return a + x.n; }, 0);
    if (n) {
      var d0 = cen[0].dim, lar = d0 ? d0[0] : 102, anc = d0 ? d0[1] : 50, solo = m.laterales.der === 0, dd = Math.min(lar, L - hc - 50);
      for (var i = 0; i < n; i++) {
        var x = solo ? W / 2 - anc / 2 - 2 : (n === 1 ? 0 : (i === 0 ? -1 : 1) * (anc / 2 + 1));
        out.push({ w: anc, d: dd, x: x, z: zIni + hc + 2 + dd / 2, hh: d0 ? d0[2] : H - 2, key: 'B-c-' + i,
          info: { tipo: 'Baulera', titulo: n > 1 ? 'Baulera central ' + (i + 1) + ' de ' + n : 'Baulera central', filas: (d0 ? [['Medidas', PM.fmt(d0)]] : []).concat([['Ubicación', solo ? 'Del lado opuesto a los cajones' : 'Centro de la cama'], ['Tapa', 'Se abre desde arriba']]), pared: 'arriba' } });
      }
    }
    return out;
  }

  // Cuando hay una baulera elegida, la tapa del cuerpo se arma en 4 tramos alrededor del hueco para que se vea el interior.
  function tapaConHueco(W, H, Lb, zc, b) {
    var x0 = -W / 2, x1 = W / 2, z0 = zc - Lb / 2, z1 = zc + Lb / 2;
    var hx0 = b.x - (b.w - 1) / 2, hx1 = b.x + (b.w - 1) / 2, hz0 = b.z - (b.d - 1) / 2, hz1 = b.z + (b.d - 1) / 2;
    function tramo(a0, a1, c0, c1) {
      if (a1 - a0 < 0.05 || c1 - c0 < 0.05) return;
      var g = document.createElement('div'); g.className = 'cb cuerpo';
      var f = document.createElement('div'); f.className = 'f tp tpp';
      f.style.cssText = 'width:' + c(a1 - a0) + 'px;height:' + c(c1 - c0) + 'px;left:' + (-c(a1 - a0) / 2) + 'px;top:' + (-c(c1 - c0) / 2) + 'px;transform:rotateX(90deg)';
      g.appendChild(f); g.style.transform = 'translate3d(' + c((a0 + a1) / 2) + 'px,' + (-c(H / 2)) + 'px,' + c((c0 + c1) / 2) + 'px)';
      cama.appendChild(g);
    }
    tramo(x0, hx0, z0, z1); tramo(hx1, x1, z0, z1); tramo(hx0, hx1, z0, hz0); tramo(hx0, hx1, hz1, z1);
    var g = document.createElement('div'); g.className = 'hueco';
    var cb = cuboide(b.w - 1, b.hh, b.d - 1, true); g.appendChild(cb);
    g.style.transform = 'translate3d(' + c(b.x) + 'px,' + (-c((H - b.hh / 2) - H / 2)) + 'px,' + c(b.z) + 'px)';
    cama.appendChild(g);
  }

  function bauleras(m, W, H, L, hc) {
    geomBauleras(m, W, H, L, hc).forEach(function (b) {
      var g = document.createElement('div'); g.className = 'baul';
      var zb = b.z - (b.d - 1) / 2; // la bisagra está del lado de la cabecera
      g.style.transform = 'translate3d(' + c(b.x) + 'px,' + (-c(H / 2)) + 'px,' + c(zb) + 'px) rotateX(var(--abre,0deg))';
      var cb = cuboide(b.w - 1, 1.4, b.d - 1); cb.classList.add('tapa');
      cb.style.transform = 'translate3d(0,' + (-c(0.7)) + 'px,' + c((b.d - 1) / 2) + 'px)';
      g.appendChild(cb); cama.appendChild(g); registrar(g, b.key, b.info);
    });
  }

  // ---------- cámara y selección ----------
  function transformar(anim) {
    el('cz-mundo').classList.toggle('anim', !!anim);
    cama.style.transform = 'rotateX(' + vista.rx + 'deg) rotateY(' + vista.ry + 'deg)';
    el('cz-arriba').textContent = modoArriba ? 'Vista normal' : 'Ver desde arriba';
  }
  function aplicarSel(p) { // marca la pieza elegida y muestra su ficha, sin reconstruir la cama
    piezas.forEach(function (z) { z.g.classList.remove('sel'); z.g.style.setProperty('--op', '0px'); });
    p.g.classList.add('sel'); st.sel = p.key;
    if (p.g.classList.contains('cajon')) p.g.style.setProperty('--op', c(32) + 'px');
    if (p.g.classList.contains('baul')) requestAnimationFrame(function () { requestAnimationFrame(function () { p.g.style.setProperty('--abre', '104deg'); }); });
    ficha(p); pintarPartes();
  }
  function marcar(p, girar) {
    var antes = st.sel, esB = p.g.classList.contains('baul'), eraB = !!antes && /^B-/.test(antes);
    if (esB && antes === p.key) { desmarcar(); return; } // tocar de nuevo la baulera abierta la cierra
    var cam = girar || esB;
    if (cam) {
      var pared = p.info.pared;
      if (esB) { vista.rx = -62; vista.ry = -20; modoArriba = true; }
      else {
        if (pared === 'izq') vista.ry = 52; else if (pared === 'der') vista.ry = -52; else if (pared === 'pie') vista.ry = -14; else if (pared === 'cab') vista.ry = 160;
        vista.rx = pared === 'arriba' || pared === 'cab' ? -48 : -26; modoArriba = false;
      }
    }
    st.sel = p.key;
    if (esB || eraB) { animarCam = cam; construir(); } // la tapa de la baulera se abre y deja ver el hueco
    else { aplicarSel(p); if (cam) transformar(true); }
  }
  function desmarcar() {
    var b = piezas.filter(function (z) { return z.key === st.sel; })[0];
    st.sel = null;
    el('cz-ficha-vacia').hidden = false; el('cz-ficha-cuerpo').hidden = true;
    if (b && b.g.classList.contains('baul')) {
      b.g.style.setProperty('--abre', '0deg');
      vista.rx = -24; vista.ry = -38; modoArriba = false; transformar(true);
      setTimeout(function () { if (!st.sel) construir(); }, 450);
    } else { piezas.forEach(function (z) { z.g.classList.remove('sel'); z.g.style.setProperty('--op', '0px'); }); }
    pintarPartes();
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
    } else if (p.info.pieLado !== undefined && st.pie.lados) {
      bt.hidden = false; bt.textContent = p.info.estado === 'G' ? 'Cambiar este lugar por 2 cajones normales' : 'Cambiar este lugar por 1 cajón grande';
      bt.onclick = function () { cambiarPie(p.info.pieLado); };
    } else bt.hidden = true;
  }
  function cambiarPie(i) {
    var l = st.pie.lados.slice(); l[i] = l[i] === 'G' ? 'N' : 'G';
    st.ultimoLados = l; st.pie = pieCajones(st.linea, l); st.sel = 'P-' + i + '-0'; todo();
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
    if (arr.mov) { vista.ry = arr.ry + dx * 0.5; vista.rx = Math.max(-80, Math.min(-6, arr.rx - dy * 0.3)); modoArriba = false; transformar(false); el('cz-ayuda').style.opacity = 0; }
  });
  function soltar() { if (arr && !arr.mov && arr.pz) { var k = arr.pz.getAttribute('data-k'); var p = piezas.filter(function (z) { return z.key === k; })[0]; if (p) marcar(p, false); } arr = null; }
  escena.addEventListener('pointerup', soltar); escena.addEventListener('pointercancel', function () { arr = null; });
  el('cz-girar').addEventListener('click', function () { vista.ry += 90; modoArriba = false; transformar(true); });
  el('cz-arriba').addEventListener('click', function () { modoArriba = !modoArriba; if (modoArriba) { vista.rx = -82; vista.ry = 0; } else { vista.rx = -24; vista.ry = -38; } transformar(true); });
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
      b.addEventListener('click', function () { reiniciar(PM.porPrecio(M.filter(function (m) { return m.linea === k; }))[0].slug); todo(); irPaso(2, true); }); // al elegir la medida se abre solo el paso siguiente
      chips.appendChild(b);
    });
    var lista = el('cz-modelo'); lista.innerHTML = '';
    PM.porPrecio(M.filter(function (m) { return m.linea === st.linea; })).forEach(function (m) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'f-chip' + (m.slug === st.slug ? ' on' : ''); b.setAttribute('aria-pressed', m.slug === st.slug ? 'true' : 'false');
      b.innerHTML = '<b>' + nombreCorto(m) + '</b><span>' + m.cajones + ' cajones</span>';
      b.addEventListener('click', function () { reiniciar(m.slug); todo(); });
      lista.appendChild(b);
    });
    // costados
    var lat = el('cz-lat'); lat.innerHTML = '';
    el('cz-lat-nota').textContent = 'Tocá cada lugar para cambiarlo: 1 cajón grande o 2 cajones normales.';
    el('cz-bloque-lat').hidden = !st.lat.editable;
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
      var on = o.cajones ? !!st.pie.lados : o.sig === st.pie.sig;
      var b = document.createElement('button'); b.type = 'button'; b.className = 'cz-op' + (on ? ' on' : ''); b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', on ? 'true' : 'false');
      b.textContent = o.label;
      b.addEventListener('click', function () { st.pie = o.cajones ? pieCajones(st.linea, st.ultimoLados || ['G', 'G']) : o; st.sel = null; todo(); });
      pie.appendChild(b);
      if (o.cajones && on) {
        var caja = document.createElement('div'); caja.className = 'cz-pie-lados';
        ['Lado izquierdo', 'Lado derecho'].forEach(function (nom, i) {
          var f = document.createElement('div'); f.className = 'cz-fila';
          var r = document.createElement('span'); r.textContent = nom; f.appendChild(r);
          [['G', '1 grande'], ['N', '2 normales']].forEach(function (op) {
            var bb = document.createElement('button'); bb.type = 'button'; bb.className = 'cz-slot' + (st.pie.lados[i] === op[0] ? ' on' : ''); bb.textContent = op[1];
            bb.setAttribute('aria-pressed', st.pie.lados[i] === op[0] ? 'true' : 'false');
            bb.addEventListener('click', function () { if (st.pie.lados[i] === op[0]) return; cambiarPie(i); });
            f.appendChild(bb);
          });
          caja.appendChild(f);
        });
        pie.appendChild(caja);
      }
    });
    el('cz-bloque-pie').hidden = !pieOpciones(st.linea).some(function (o) { return o.cajones ? !!st.pie.lados : o.sig === st.pie.sig; });
    // color
    var cols = el('cz-color'); cols.innerHTML = '';
    COL.forEach(function (cc, i) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'cz-col' + (i === st.color ? ' on' : ''); b.setAttribute('aria-pressed', i === st.color ? 'true' : 'false');
      b.innerHTML = '<i style="background:' + (cc.tex ? 'url(' + cc.tex + ') center/cover' : cc.sw) + '"></i><b>' + cc.n + '</b><small>' + (i ? '+ ' + PM.pesos(PM.COLOR_ADICIONAL) : 'Sin adicional') + '</small>';
      b.addEventListener('click', function () { st.color = i; todo(); });
      cols.appendChild(b);
    });
    el('cz-soft').setAttribute('aria-checked', st.soft ? 'true' : 'false');
  }
  el('cz-soft').addEventListener('click', function () { st.soft = !st.soft; todo(); });
  el('cz-notas').addEventListener('input', function () { resumen(); resumenesPasos(); });

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
    st.precioTxt = precio ? PM.pesos(precio) : 'Precio a confirmar';
    st.waHref = 'https://wa.me/5491168767075?text=' + encodeURIComponent(msg);
  }

  function pintarMuestra() {
    var cc = COL[st.color], mu = el('cz-muestra'); if (!mu) return;
    mu.innerHTML = '<i style="background:' + (cc.tex ? 'url(' + cc.tex + ') center/cover' : cc.sw) + '"></i><span><small>Color elegido</small><b>' + cc.n + '</b></span>' +
      '<em>' + (st.color ? 'El dibujo es de referencia: se ve siempre en blanco. Tu cama se fabrica en este color.' : 'El dibujo es de referencia.') + '</em>';
  }
  // ---------- pasos guiados ----------
  var paso = 1, TOT = 5, secs = [].slice.call(document.querySelectorAll('.cz-paso'));
  function irPaso(n, desplazar) {
    paso = Math.max(1, Math.min(TOT, n));
    secs.forEach(function (sec) {
      var p = +sec.getAttribute('data-p'), on = p === paso;
      sec.classList.toggle('on', on); sec.classList.toggle('hecho', p < paso);
      sec.querySelector('.cz-paso-c').hidden = !on;
      sec.querySelector('.cz-paso-btn').setAttribute('aria-expanded', on ? 'true' : 'false');
    });
    el('cz-prog-txt').textContent = 'Paso ' + paso + ' de ' + TOT;
    el('cz-prog-fill').style.width = (paso / TOT * 100) + '%';
    el('cz-barra-paso').textContent = 'Paso ' + paso + ' de ' + TOT;
    el('cz-barra-sig').textContent = paso < TOT ? 'Continuar →' : 'Enviar por WhatsApp';
    if (desplazar) {
      var h = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--hdr'), 10) || 70;
      window.scrollTo({ top: Math.max(0, secs[paso - 1].getBoundingClientRect().top + window.scrollY - h - 14), behavior: 'smooth' });
    }
  }
  function resumenesPasos() {
    var m = modelo(), col = COL[st.color], notas = el('cz-notas').value.trim();
    el('res-1').textContent = m.lineaNombre + ' · ' + m.colchon;
    el('res-2').textContent = nombreCorto(m) + ' · ' + totalCajones() + ' cajones';
    el('res-3').textContent = col.n + (st.color ? ' (+' + PM.pesos(PM.COLOR_ADICIONAL) + ')' : '') + ' · ' + (st.soft ? 'con cierre suave' : 'sin cierre suave');
    el('res-4').textContent = notas ? (notas.length > 28 ? notas.slice(0, 28) + '…' : notas) : 'Sin notas';
    el('res-5').textContent = st.precioTxt;
    el('cz-barra-precio').textContent = st.precioTxt;
  }
  secs.forEach(function (sec) { sec.querySelector('.cz-paso-btn').addEventListener('click', function () { irPaso(+sec.getAttribute('data-p'), true); }); });
  [].slice.call(document.querySelectorAll('.cz-sig')).forEach(function (b) { b.addEventListener('click', function () { irPaso(+b.getAttribute('data-sig'), true); }); });
  el('cz-barra-sig').addEventListener('click', function () { if (paso < TOT) irPaso(paso + 1, true); else window.open(st.waHref, '_blank', 'noopener'); });
  document.body.classList.add('cfg-page');

  function todo() { paneles(); construir(); resumen(); resumenesPasos(); }
  window.__cfg = { probar: function (slug) { reiniciar(slug); todo(); return { cajones: piezas.filter(function (p) { return p.info.tipo === 'Cajón'; }).length, esperado: totalCajones(), baul: piezas.filter(function (p) { return p.info.tipo === 'Baulera'; }).length, otras: piezas.filter(function (p) { return p.info.tipo === 'Zapatero' || p.info.tipo === 'Estantes'; }).length }; } };
  reiniciar(inicial.slug); todo(); irPaso(1, false);
  if (window.ResizeObserver) { var t; new ResizeObserver(function () { clearTimeout(t); t = setTimeout(construir, 150); }).observe(escena); }
})();
