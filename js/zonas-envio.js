// Envío por localidad. Distancia POR CALLE desde el límite de CABA (OpenStreetMap + OSRM), calculada en herramientas/calcular-zonas.py.
// Zona sur y oeste: hasta 10 km sin cargo; luego por tramos. Zona norte: hasta 25 km sin cargo; luego por tramos. CABA: sin cargo.
// Siempre incluye envío, subida y armado. Más allá del último tramo no se entrega: se puede retirar por la fábrica.
(function () {
  var CABA_BARRIOS = ['Agronomía', 'Almagro', 'Balvanera', 'Barracas', 'Belgrano', 'Boedo', 'Caballito', 'Chacarita', 'Coghlan', 'Colegiales', 'Constitución', 'Flores', 'Floresta', 'La Boca', 'La Paternal', 'Liniers', 'Mataderos', 'Monte Castro', 'Montserrat', 'Nueva Pompeya', 'Núñez', 'Palermo', 'Parque Avellaneda', 'Parque Chacabuco', 'Parque Chas', 'Parque Patricios', 'Puerto Madero', 'Recoleta', 'Retiro', 'Saavedra', 'San Cristóbal', 'San Nicolás', 'San Telmo', 'Vélez Sársfield', 'Versalles', 'Villa Crespo', 'Villa del Parque', 'Villa Devoto', 'Villa General Mitre', 'Villa Lugano', 'Villa Luro', 'Villa Ortúzar', 'Villa Pueyrredón', 'Villa Real', 'Villa Riachuelo', 'Villa Santa Rita', 'Villa Soldati', 'Villa Urquiza'];
  var CABA = ['CABA', 'Capital Federal', 'Ciudad de Buenos Aires'];

  var TRAMOS = {
    SO: [[10, 0], [20, 50000], [30, 60000], [40, 70000], [50, 80000], [60, 95000]],
    N: [[25, 0], [30, 50000], [35, 60000], [45, 70000], [55, 80000]]
  };
  function tarifa(zona, km) {
    if (zona === 'C') return { ok: true, precio: 0 };
    var t = TRAMOS[zona === 'N' ? 'N' : 'SO'];
    for (var i = 0; i < t.length; i++) if (km <= t[i][0]) return { ok: true, precio: t[i][1] };
    return { ok: false };
  }
  function pesos(n) { return '$' + n.toLocaleString('es-AR'); }
  function norm(t) { return String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim(); }

  var base = CABA.map(function (n) { return { n: n, p: 'CABA', z: 'C', km: 0 }; }).concat(CABA_BARRIOS.map(function (n) { return { n: n, p: 'CABA', z: 'C', km: 0 }; }));
  var todos = base.slice(), cargado = false, cargando = false, esperando = [];
  base.forEach(function (x) { x.k = norm(x.n); });

  function cargar(cb) {
    if (cargado) return cb();
    esperando.push(cb);
    if (cargando) return;
    cargando = true;
    var s = document.createElement('script');
    s.src = '/js/zonas-envio-datos.js?v=' + '20261006';
    s.onload = function () {
      (window.PM.zonasDatos || []).forEach(function (r) { todos.push({ n: r[0], p: r[1], z: r[2], km: r[3], k: norm(r[0]) }); });
      cargado = true; esperando.forEach(function (f) { f(); }); esperando = [];
    };
    s.onerror = function () { cargado = true; esperando.forEach(function (f) { f(); }); esperando = []; };
    document.head.appendChild(s);
  }

  function buscar(texto) {
    var q = norm(texto);
    if (q.length < 2) return [];
    var exactas = [], empiezan = [], contienen = [];
    todos.forEach(function (x) {
      if (x.k === q) exactas.push(x); else if (x.k.indexOf(q) === 0) empiezan.push(x); else if (x.k.indexOf(q) !== -1) contienen.push(x);
    });
    return exactas.concat(empiezan, contienen).slice(0, 8);
  }

  function mensaje(x) {
    var t = tarifa(x.z, x.km), lugar = x.n + (x.p && x.p !== 'CABA' && norm(x.p) !== norm(x.n) ? ' (' + x.p + ')' : '');
    if (!t.ok) return { tipo: 'lejos', html: 'Las entregas de ProMuebles se realizan de forma personal, por eso no llegamos a <b>' + lugar + '</b>. Si contás con un transportista o comisionista de confianza, podés retirar tu cama directamente en la puerta de nuestra fábrica, en Boulogne.' };
    if (t.precio === 0) return { tipo: 'ok', html: 'Sí, llegamos a <b>' + lugar + '</b> con envío, subida y armado <b>sin cargo</b>.' };
    return { tipo: 'costo', html: 'Llegamos a <b>' + lugar + '</b>. El envío, la subida y el armado tienen un valor de <b>' + pesos(t.precio) + '</b>.' };
  }

  // Monta el buscador en un input. Opciones: { input, lista, resultado, producto }
  function montar(o) {
    var input = o.input, lista = o.lista, res = o.resultado, sel = -1, actuales = [];
    function wa(texto) { return 'https://wa.me/5491168767075?text=' + encodeURIComponent(texto); }
    function elegir(x) {
      var m = mensaje(x);
      input.value = x.n + (x.p && x.p !== 'CABA' ? ', ' + x.p : '');
      lista.hidden = true; lista.innerHTML = '';
      res.className = 'm-zona-res ' + (m.tipo === 'ok' ? 'ok' : 'consulta'); res.innerHTML = m.html;
      if (o.alElegir) o.alElegir(x, m);
    }
    function sinCoincidencia(t) {
      res.className = 'm-zona-res consulta';
      res.innerHTML = 'Esa localidad no figura en nuestra zona de entrega. Las entregas de ProMuebles se realizan de forma personal, por eso no llegamos a zonas más lejanas. Si contás con un transportista o comisionista de confianza, podés retirar tu cama por la puerta de nuestra fábrica, en Boulogne. Si creés que deberíamos llegar, ';
      var a = document.createElement('a'); a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'escribinos por WhatsApp';
      a.href = wa('Hola! Quiero saber si llegan a ' + t + (o.producto ? ' y cuánto sale el envío de ' + o.producto : '') + '.');
      res.appendChild(a); res.appendChild(document.createTextNode('.'));
    }
    function pintar() {
      var t = input.value.trim();
      lista.innerHTML = ''; sel = -1;
      if (t.length < 2) { lista.hidden = true; res.textContent = ''; res.className = 'm-zona-res'; return; }
      cargar(function () {
        actuales = buscar(t);
        if (!actuales.length) { lista.hidden = true; sinCoincidencia(t); return; }
        res.textContent = ''; res.className = 'm-zona-res';
        actuales.forEach(function (x) {
          var li = document.createElement('li'); li.setAttribute('role', 'option'); li.tabIndex = -1;
          li.innerHTML = '<b>' + x.n.replace(/</g, '&lt;') + '</b>' + (x.p && x.p !== 'CABA' ? (norm(x.p) === norm(x.n) ? '' : '<span>' + x.p + '</span>') : '<span>Ciudad de Buenos Aires</span>');
          li.addEventListener('mousedown', function (e) { e.preventDefault(); elegir(x); });
          li.addEventListener('touchstart', function (e) { e.preventDefault(); elegir(x); }, { passive: false });
          lista.appendChild(li);
        });
        lista.hidden = false;
      });
    }
    input.addEventListener('input', pintar);
    input.addEventListener('focus', function () { cargar(function () { }); if (input.value.trim().length >= 2) pintar(); });
    input.addEventListener('blur', function () { setTimeout(function () { lista.hidden = true; }, 150); });
    input.addEventListener('keydown', function (e) {
      var items = lista.children;
      if (e.key === 'ArrowDown' && items.length) { sel = Math.min(items.length - 1, sel + 1); e.preventDefault(); }
      else if (e.key === 'ArrowUp' && items.length) { sel = Math.max(0, sel - 1); e.preventDefault(); }
      else if (e.key === 'Enter') { e.preventDefault(); if (actuales.length) elegir(actuales[Math.max(0, sel)]); return; }
      else return;
      Array.prototype.forEach.call(items, function (li, i) { li.classList.toggle('on', i === sel); });
    });
  }

  window.PM = window.PM || {};
  window.PM.zonas = { montar: montar, buscar: buscar, tarifa: tarifa, TRAMOS: TRAMOS, mensaje: mensaje, cargar: cargar };
})();
