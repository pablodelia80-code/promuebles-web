// Página de modelo: galería, precio con cierre suave, plano que se toca y consulta de zona de envío.
(function () {
  var PM = window.PM;
  var datos = JSON.parse(document.getElementById('m-data').textContent);
  var m = PM.MODELOS.filter(function (x) { return x.slug === datos.slug; })[0];
  var cierreSuave = false;
  var seleccion = null;

  function pesos(n) { return '$' + n.toLocaleString('es-AR'); }
  function extra() { return cierreSuave ? m.cajones * PM.CIERRE_SUAVE_POR_CAJON : 0; }

  // ---------- Galería ----------
  // Las fotos pasan solas cada 4 segundos. Con el mouse encima se detienen; al tocar una miniatura en el celular quedan quietas.
  var mainImg = document.getElementById('m-main-img');
  var thumbs = document.getElementById('m-thumbs');
  var galeria = document.querySelector('.m-gallery');
  if (thumbs) {
    var n = datos.fotos.length, actual = 0, reloj = null, quieta = false;
    var sinMovimiento = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var mostrar = function (i) {
      actual = i;
      var f = datos.fotos[i];
      mainImg.src = f.l; mainImg.alt = f.alt;
      Array.prototype.forEach.call(thumbs.children, function (c, k) { c.classList.toggle('on', k === i); });
      var b = thumbs.children[i];
      if (b && thumbs.scrollWidth > thumbs.clientWidth) thumbs.scrollTo({ left: b.offsetLeft - (thumbs.clientWidth - b.offsetWidth) / 2, behavior: 'smooth' });
      var sig = datos.fotos[(i + 1) % n]; if (sig) { var pre = new Image(); pre.src = sig.l; }
    };
    var frenar = function () { if (reloj) { clearInterval(reloj); reloj = null; } };
    var arrancar = function () {
      if (reloj || quieta || sinMovimiento || n < 2 || document.hidden) return;
      reloj = setInterval(function () { mostrar((actual + 1) % n); }, 4000);
    };
    thumbs.addEventListener('pointerdown', function (e) { if (e.pointerType === 'touch') { quieta = true; frenar(); } });
    thumbs.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      mostrar(+b.getAttribute('data-i'));
    });
    if (galeria) {
      galeria.addEventListener('mouseenter', frenar);
      galeria.addEventListener('mouseleave', arrancar);
    }
    document.addEventListener('visibilitychange', function () { if (document.hidden) frenar(); else arrancar(); });
    arrancar();
  }

  // ---------- Precio y cierre suave ----------
  var priceEl = document.getElementById('m-price');
  var oldEl = document.getElementById('m-price-old');
  var sw = document.getElementById('m-soft');
  var softOn = document.getElementById('m-soft-on');
  var softNote = document.getElementById('m-card-soft');
  var was = [document.getElementById('m-wa'), document.getElementById('m-wa2')];

  function actualizar(animar) {
    priceEl.textContent = pesos(datos.precio + extra());
    if (oldEl) oldEl.textContent = pesos(datos.precioViejo + extra());
    if (animar) { priceEl.classList.add('bump'); setTimeout(function () { priceEl.classList.remove('bump'); }, 350); }
    sw.setAttribute('aria-checked', cierreSuave ? 'true' : 'false');
    softOn.textContent = cierreSuave ? 'Incluye correderas con cierre suave' : 'Incluye correderas telescópicas reforzadas Eurohard';
    softOn.className = 'm-soft-on' + (cierreSuave ? '' : ' off');
    var msg = 'Hola! Quiero consultar por la ' + m.titulo.replace(/ \(.*\)$/, '') + ' (colchón ' + m.colchon + ')' +
      (cierreSuave ? ' con correderas con cierre suave' : '') + '. Precio: ' + pesos(datos.precio + extra()) + '.';
    was.forEach(function (a) { if (a) a.href = 'https://wa.me/5491168767075?text=' + encodeURIComponent(msg); });
    if (seleccion && seleccion.tipo === 'c') softNote.hidden = !cierreSuave;
    // La ficha cambia con la opción
    Array.prototype.forEach.call(document.querySelectorAll('.m-acc-body p'), function (p) {
      if (p.getAttribute('data-corr') === null && /^Correderas:/.test(p.textContent)) { p.setAttribute('data-corr', p.innerHTML); }
      if (p.getAttribute('data-corr') !== null) {
        p.innerHTML = cierreSuave ? '<b>Correderas:</b> telescópicas reforzadas Eurohard <b>con cierre suave</b> (incluido en esta cama). El cajón sale 40 cm. Hay repuestos.' : p.getAttribute('data-corr');
      }
    });
  }
  sw.addEventListener('click', function () { cierreSuave = !cierreSuave; actualizar(true); });

  // ---------- Plano ----------
  var svg = document.getElementById('m-plan');
  var cardEmpty = document.getElementById('m-card-empty'), cardBody = document.getElementById('m-card-body');
  var res = PM.dibujarPlano(svg, m, function (it) {
    seleccion = it;
    document.getElementById('m-card-kind').textContent = it.kind;
    document.getElementById('m-card-title').textContent = it.titulo;
    var dl = document.getElementById('m-card-dl');
    dl.innerHTML = '';
    it.filas.forEach(function (f) {
      var row = document.createElement('div'), dt = document.createElement('dt'), dd = document.createElement('dd');
      dt.textContent = f[0]; dd.textContent = f[1]; row.appendChild(dt); row.appendChild(dd); dl.appendChild(row);
    });
    softNote.hidden = !(it.tipo === 'c' && cierreSuave);
    cardEmpty.hidden = true; cardBody.hidden = false;
  });
  if (res.hayApilados) document.querySelector('.m-plan-note').textContent = 'Esquema ilustrativo, no está a escala. Los cajones apilados se dibujan juntos: el 1 va arriba del 2.';
  svg.addEventListener('click', function () { if (res.primero) res.primero.classList.remove('pulse'); }, { once: true });

  // ---------- Zona de envío ----------
  PM.zonas.montar({ input: document.getElementById('m-zona'), lista: document.getElementById('m-zona-lista'), resultado: document.getElementById('m-zona-res'), producto: 'la ' + m.titulo.replace(/ \(.*\)$/, '') });

  actualizar(false);
})();
