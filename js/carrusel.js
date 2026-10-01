// Carrusel de reseñas: botones anterior/siguiente sobre una pista con scroll-snap (sin librerías).
(function () {
  document.querySelectorAll('.rs-wrap').forEach(function (w) {
    var pista = w.querySelector('.rs-track');
    function paso() { var c = pista.querySelector('.rs-card'); return c ? c.getBoundingClientRect().width + 16 : 300; }
    w.querySelector('.rs-prev').addEventListener('click', function () { pista.scrollBy({ left: -paso(), behavior: 'smooth' }); });
    w.querySelector('.rs-next').addEventListener('click', function () { pista.scrollBy({ left: paso(), behavior: 'smooth' }); });
  });
})();
