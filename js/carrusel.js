// Carruseles de reseñas y de videos: botones anterior/siguiente y rotación automática (sin librerías).
// Pasan solos cada 3,5 s y vuelven al principio al llegar al final. Con el mouse encima se frenan.
// En el celular se frenan al tocarlos y retoman a los 8 s. Solo giran mientras están a la vista.
(function () {
  var PASO_MS = 3500, RETOMA_MS = 8000;
  var sinMovimiento = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function iniciar() {
    // A los carruseles de videos les agrego la misma envoltura con botones que tienen las reseñas
    document.querySelectorAll('.video-track').forEach(function (v) {
      if (v.parentElement.classList.contains('rs-wrap')) return;
      var w = document.createElement('div'); w.className = 'rs-wrap rs-wrap-video';
      v.parentNode.insertBefore(w, v); w.appendChild(v);
      var a = document.createElement('button'); a.type = 'button'; a.className = 'rs-btn rs-prev'; a.setAttribute('aria-label', 'Videos anteriores'); a.textContent = '‹';
      var s = document.createElement('button'); s.type = 'button'; s.className = 'rs-btn rs-next'; s.setAttribute('aria-label', 'Más videos'); s.textContent = '›';
      w.insertBefore(a, v); w.appendChild(s);
    });

    document.querySelectorAll('.rs-wrap').forEach(function (w) {
      var pista = w.querySelector('.rs-track, .video-track');
      if (!pista) return;
      function paso() {
        var c = pista.firstElementChild; if (!c) return pista.clientWidth * 0.8;
        var cs = getComputedStyle(pista), hueco = parseFloat(cs.columnGap || cs.gap) || 16;
        return c.getBoundingClientRect().width + hueco;
      }
      function siguiente() {
        var max = pista.scrollWidth - pista.clientWidth;
        if (max <= 4) return;
        if (pista.scrollLeft >= max - 4) pista.scrollTo({ left: 0, behavior: 'smooth' });
        else pista.scrollBy({ left: paso(), behavior: 'smooth' });
      }
      var prev = w.querySelector('.rs-prev'), next = w.querySelector('.rs-next');
      if (prev) prev.addEventListener('click', function () { pista.scrollBy({ left: -paso(), behavior: 'smooth' }); });
      if (next) next.addEventListener('click', function () { siguiente(); });

      // ---- rotación automática ----
      var reloj = null, encima = false, tocado = false, visible = false, retoma = null;
      function frenar() { if (reloj) { clearInterval(reloj); reloj = null; } }
      function arrancar() {
        if (reloj || sinMovimiento || encima || tocado || !visible || document.hidden) return;
        reloj = setInterval(function () { siguiente(); }, PASO_MS);
      }
      w.addEventListener('mouseenter', function () { encima = true; frenar(); });
      w.addEventListener('mouseleave', function () { encima = false; arrancar(); });
      w.addEventListener('pointerdown', function (e) {
        if (e.pointerType !== 'touch') return;
        tocado = true; frenar(); clearTimeout(retoma);
        retoma = setTimeout(function () { tocado = false; arrancar(); }, RETOMA_MS);
      });
      w.addEventListener('focusin', function () { encima = true; frenar(); });
      w.addEventListener('focusout', function () { encima = false; arrancar(); });
      document.addEventListener('visibilitychange', function () { if (document.hidden) frenar(); else arrancar(); });
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) arrancar(); else frenar(); }, { threshold: 0.25 }).observe(w);
      } else { visible = true; arrancar(); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
