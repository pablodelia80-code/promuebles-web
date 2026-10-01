// Asistente de elección: 4 preguntas y recomienda hasta 3 modelos.
(function () {
  var PM = window.PM, M = PM.MODELOS;
  var respuestas = {}, paso = 0;

  var PASOS = [
    { k: 'linea', t: '¿Qué medida de colchón tenés o querés?', ayuda: 'Es la medida del colchón donde dormís.', op: [
      ['1-plaza', '1 plaza', 'Colchón 80 × 190 cm'], ['1-plaza-y-media', '1 plaza y media', 'Colchón 100 × 190 cm'], ['2-plazas', '2 plazas', 'Colchón 140 × 190 cm'],
      ['queen', 'Queen', 'Colchón 160 × 200 cm'], ['king-180', 'King 180', 'Colchón 180 × 200 cm'], ['king-200', 'King 200', 'Colchón 200 × 200 cm']] },
    { k: 'guardado', t: '¿Cuánto querés guardar?', ayuda: 'Pensá en lo que hoy tenés desparramado por el cuarto.', op: [
      ['poco', 'Poco', 'Ropa de cama, toallas y algún extra'], ['medio', 'Bastante', 'Ropa de temporada y calzado'], ['mucho', 'Muchísimo', 'Quiero reemplazar el placard']] },
    { k: 'tope', t: '¿Hasta cuánto querés gastar?', ayuda: 'Es el precio final de la cama.', op: [
      ['500000', 'Hasta $500.000', ''], ['700000', 'Hasta $700.000', ''], ['900000', 'Hasta $900.000', ''], ['0', 'No tengo tope', 'Mostrame lo que mejor se ajuste']] },
    { k: 'soft', t: '¿Querés correderas con cierre suave?', ayuda: 'El cajón se frena solo y cierra sin golpe. Es opcional.', op: [
      ['si', 'Sí, con cierre suave', ''], ['no', 'No, las comunes', 'Correderas telescópicas reforzadas Eurohard'], ['no-se', 'Todavía no sé', 'Lo vemos después']] }
  ];

  var prog = document.getElementById('e-prog'), cont = document.getElementById('e-paso');

  function barra() {
    prog.innerHTML = PASOS.map(function (p, i) { return '<span class="' + (i < paso ? 'hecho' : i === paso ? 'actual' : '') + '"></span>'; }).join('') + (paso >= PASOS.length ? '' : '');
  }

  function preguntar() {
    barra();
    var p = PASOS[paso];
    cont.innerHTML = '<p class="e-n">Pregunta ' + (paso + 1) + ' de ' + PASOS.length + '</p><h2>' + p.t + '</h2><p class="m-sub" style="margin:6px 0 18px">' + p.ayuda + '</p><div class="e-ops" role="radiogroup"></div>' +
      (paso ? '<button type="button" class="e-atras">‹ Volver</button>' : '');
    var ops = cont.querySelector('.e-ops');
    p.op.forEach(function (o) {
      var b = document.createElement('button');
      b.type = 'button'; b.setAttribute('role', 'radio'); b.className = 'e-op';
      b.innerHTML = '<b>' + o[1] + '</b>' + (o[2] ? '<span>' + o[2] + '</span>' : '');
      b.addEventListener('click', function () { respuestas[p.k] = o[0]; paso++; paso < PASOS.length ? preguntar() : resultado(); });
      ops.appendChild(b);
    });
    var at = cont.querySelector('.e-atras');
    if (at) at.addEventListener('click', function () { paso--; preguntar(); });
    var primero = ops.querySelector('button'); if (primero && paso) primero.focus({ preventScroll: true });
  }

  function precioDe(m) { return PM.venta(m).precio + (respuestas.soft === 'si' ? m.cajones * PM.CIERRE_SUAVE_POR_CAJON : 0); }

  function resultado() {
    prog.innerHTML = PASOS.map(function () { return '<span class="hecho"></span>'; }).join('');
    var linea = M.filter(function (m) { return m.linea === respuestas.linea; });
    var porCajones = linea.slice().sort(function (a, b) { return a.cajones - b.cajones; });
    var objetivo = respuestas.guardado === 'poco' ? porCajones[0].cajones : respuestas.guardado === 'mucho' ? porCajones[porCajones.length - 1].cajones : porCajones[Math.floor((porCajones.length - 1) / 2)].cajones;
    var tope = +respuestas.tope, nota = '';
    var dentro = linea.filter(function (m) { return !tope || precioDe(m) <= tope; });
    if (!dentro.length) {
      dentro = linea.slice().sort(function (a, b) { return precioDe(a) - precioDe(b); }).slice(0, 1);
      nota = 'Ningún modelo de esta medida entra en ese presupuesto. Te mostramos el más económico.';
    }
    dentro.sort(function (a, b) { return Math.abs(a.cajones - objetivo) - Math.abs(b.cajones - objetivo) || precioDe(a) - precioDe(b); });
    var top = dentro.slice(0, 3);

    cont.innerHTML = '<h2>Te recomendamos estas camas</h2>' + (nota ? '<p class="e-nota">' + nota + '</p>' : '') + '<div class="e-res"></div>' +
      '<button type="button" class="e-atras" id="e-otra">‹ Empezar de nuevo</button>';
    var res = cont.querySelector('.e-res');
    top.forEach(function (m, i) {
      var v = PM.venta(m), nB = PM.totalBauleras(m);
      var msg = 'Hola! Quiero consultar por la ' + m.titulo.replace(/ \(.*\)$/, '') + ' (colchón ' + m.colchon + ')' + (respuestas.soft === 'si' ? ' con cierre suave' : '') + '. Precio: ' + PM.pesos(precioDe(m)) + '.';
      var a = document.createElement('article');
      a.className = 'e-card' + (i === 0 ? ' mejor' : '');
      a.innerHTML = (i === 0 ? '<span class="e-etq">Nuestra recomendación</span>' : '') +
        '<a href="/camas-box/' + m.slug + '/"><img src="' + PM.webp(v.img, 'm') + '" alt="' + m.titulo + '" width="480" height="640" loading="lazy"></a>' +
        '<div><h3>' + m.corto + ' · ' + m.lineaNombre + '</h3><p>' + m.cajones + ' cajones' + (nB ? ' y ' + nB + (nB === 1 ? ' baulera' : ' bauleras') : '') + (m.zapateros.length ? ', ' + m.zapateros.length + ' zapatero' + (m.zapateros.length > 1 ? 's' : '') : '') + '. Soporta hasta ' + m.carga + ' kg.</p>' +
        '<p class="e-precio">' + PM.pesos(precioDe(m)) + (respuestas.soft === 'si' ? ' <small>con cierre suave</small>' : '') + '</p>' +
        '<div class="e-btns"><a class="btn btn-nogal" href="/camas-box/' + m.slug + '/">Ver esta cama</a> <a class="btn btn-ghost" target="_blank" rel="noopener" href="https://wa.me/5491168767075?text=' + encodeURIComponent(msg) + '">Consultar</a></div></div>';
      res.appendChild(a);
    });
    document.getElementById('e-otra').addEventListener('click', function () { paso = 0; respuestas = {}; preguntar(); });
  }
  preguntar();
})();
