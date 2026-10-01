/* ProMuebles — Medición
   Microsoft Clarity (grabaciones y mapas de calor) + Google Analytics 4.

   Los dos códigos viven acá, en un archivo del propio sitio, y no sueltos
   dentro del HTML de cada página: se toca un solo lugar y vale para todo
   el sitio. Mismo esquema que la web de iGNUX. */

(function () {
  'use strict';

  var GA_ID = 'G-2RMQ18VXR3';
  var CLARITY_ID = 'yf4qra8v58';

  /* No medir las pruebas propias: servidor local o archivo abierto a mano. */
  var host = location.hostname;
  if (location.protocol === 'file:' || host === 'localhost' || host === '127.0.0.1') return;

  /* --- Google Analytics 4 --- */
  if (GA_ID.indexOf('PENDIENTE') !== 0) {
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID);

    var ga = document.createElement('script');
    ga.async = true;
    ga.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(ga);
  }

  /* --- Microsoft Clarity --- */
  if (CLARITY_ID.indexOf('PENDIENTE') !== 0) {
    window.clarity = window.clarity || function () {
      (window.clarity.q = window.clarity.q || []).push(arguments);
    };
    var cl = document.createElement('script');
    cl.async = true;
    cl.src = 'https://www.clarity.ms/tag/' + CLARITY_ID;
    document.head.appendChild(cl);
  }
})();
