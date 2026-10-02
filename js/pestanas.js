// Pestañas de la ficha técnica: muestra un panel por vez (sin librerías). Sin JavaScript se ven todos los paneles.
(function () {
  document.querySelectorAll('.m-tabs').forEach(function (barra) {
    var tabs = [].slice.call(barra.querySelectorAll('[role="tab"]'));
    function elegir(t, foco) {
      tabs.forEach(function (x) {
        var on = x === t;
        x.setAttribute('aria-selected', on ? 'true' : 'false');
        x.tabIndex = on ? 0 : -1;
        document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
      });
      if (foco) t.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { elegir(t); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { e.preventDefault(); elegir(tabs[(i + 1) % tabs.length], true); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); elegir(tabs[(i - 1 + tabs.length) % tabs.length], true); }
      });
    });
    elegir(tabs[0]);
  });
})();
