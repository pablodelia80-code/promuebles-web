// Páginas de las herramientas del comprador. Las genera generar-sitio.js; la lógica está en js/comparar.js, calculadora.js, elegir.js y configurar.js.
const SCRIPTS = n => `<script src="/js/productos-data.js?v=20261045"></script>\n<script src="/js/modelos.js?v=20261045"></script>\n<script src="/js/${n}.js?v=20261045"></script>`;

module.exports = {
  'comparar.html': ({ cabecera, pie }) => cabecera('Comparar camas box lado a lado | ProMuebles',
    'Compará 2 camas box de ProMuebles: medidas, cajones, bauleras, carga que soportan y precio, lado a lado.', '/comparar.html') + `
<main class="modelo herr" id="contenido">
  <div class="wrap">
    <nav class="crumbs"><a href="/productos.html">Productos</a><span>›</span><b>Comparar</b></nav>
    <span class="eyebrow">Herramienta</span>
    <h1>Compará camas lado a lado</h1>
    <p class="m-lead" style="max-width:60ch">Elegí 2 modelos y mirá en qué se diferencian: cajones, bauleras, carga y precio.</p>
    <label class="h-check"><input type="checkbox" id="c-soft"> Ver precios con correderas de cierre suave</label>
    <div class="h-tabla-wrap"><table class="h-tabla" id="c-tabla"></table></div>
  </div>
</main>
` + pie(SCRIPTS('comparar')),

  'calculadora-espacio.html': ({ cabecera, pie }) => cabecera('¿Entra la cama en tu cuarto? | ProMuebles',
    'Poné las medidas de tu habitación y mirá si la cama box entra y si los cajones se pueden abrir completos.', '/calculadora-espacio.html') + `
<main class="modelo herr" id="contenido">
  <div class="wrap">
    <nav class="crumbs"><a href="/productos.html">Productos</a><span>›</span><b>¿Entra en tu cuarto?</b></nav>
    <span class="eyebrow">Herramienta</span>
    <h1>¿Entra la cama en tu cuarto?</h1>
    <p class="m-lead" style="max-width:60ch">Poné cuánto mide tu habitación y mirá, en un plano a escala, si la cama entra y si los cajones se pueden abrir.</p>
    <div class="h-grid2">
      <div class="k-izq">
        <form class="h-form" id="k-form" onsubmit="return false">
          <label>Modelo de cama<select id="k-modelo"></select></label>
          <div class="h-dos">
            <label>Largo del cuarto (cm)<input id="k-largo" type="number" inputmode="numeric" min="150" max="1000" value="340"></label>
            <label>Ancho del cuarto (cm)<input id="k-ancho" type="number" inputmode="numeric" min="150" max="1000" value="300"></label>
          </div>
          <label>¿Dónde va la cama?
            <select id="k-pos">
              <option value="centro">Centrada en la pared del fondo</option>
              <option value="izq">Pegada a la pared izquierda</option>
              <option value="der">Pegada a la pared derecha</option>
            </select>
          </label>
          <p class="h-nota">La cabecera va contra la pared del fondo (arriba en el plano). No se tienen en cuenta puertas ni otros muebles.</p>
        </form>
        <div id="k-estado" class="k-estado" aria-live="polite"></div>
        <ul class="h-veredicto" id="k-ver"></ul>
      </div>
      <div class="h-out">
        <div class="h-svgwrap"><svg id="k-svg" viewBox="0 0 400 400" role="img" aria-label="Plano a escala del cuarto con la cama"></svg></div>
        <ul class="k-leyenda" aria-label="Referencias del plano">
          <li><i class="k-cama"></i> La cama</li>
          <li><i class="k-ok"></i> Lugar que ocupan los cajones al abrirse (salen 40 cm). En verde: alcanza</li>
          <li><i class="k-no"></i> En rojo: falta lugar para abrirlos completos</li>
        </ul>
      </div>
    </div>
  </div>
</main>
` + pie(SCRIPTS('calculadora')),

  'elegir-cama.html': ({ cabecera, pie }) => cabecera('Elegí tu cama box en 4 preguntas | ProMuebles',
    'Respondé 4 preguntas simples y te recomendamos las camas box de ProMuebles que mejor se ajustan a tu cuarto, tu guardado y tu presupuesto.', '/elegir-cama.html') + `
<main class="modelo herr" id="contenido">
  <div class="wrap" style="max-width:860px">
    <nav class="crumbs"><a href="/productos.html">Productos</a><span>›</span><b>Elegí tu cama</b></nav>
    <span class="eyebrow">Asistente</span>
    <h1>Elegí tu cama en 4 preguntas</h1>
    <div class="e-progreso" id="e-prog" aria-hidden="true"></div>
    <div id="e-paso" aria-live="polite"></div>
  </div>
</main>
` + pie(SCRIPTS('elegir')),

  'configurar.html': ({ cabecera, pie }) => cabecera('Diseñá tu cama box a medida | ProMuebles',
    'Armá tu cama box como la querés: elegí la medida, los cajones, el pie, el color y el cierre suave, girala en 3D y envianos tu solicitud por WhatsApp.', '/configurar.html') + `
<main class="modelo herr" id="contenido">
  <div class="wrap">
    <nav class="crumbs"><a href="/productos.html">Productos</a><span>›</span><b>Diseñá tu cama</b></nav>
    <span class="eyebrow">Configurador</span>
    <h1>Armá tu cama como la querés</h1>
    <p class="m-lead" style="max-width:64ch">Elegí cómo la querés, girala con el dedo o el mouse, tocá cada parte para ver sus medidas y envianos tu solicitud por WhatsApp. Revisamos que se pueda fabricar y te confirmamos precio y plazo.</p>
    <div class="cz">
      <div class="cz-izq">
        <div class="cz-escena" id="cz-escena" aria-label="Cama en 3D. Arrastrá para girarla y tocá una parte para ver su ficha.">
          <div class="cz-mundo" id="cz-mundo"><div class="cz-cama" id="cz-cama"></div></div>
          <div class="cz-muestra" id="cz-muestra" aria-live="polite"></div>
          <div class="cz-ayuda" id="cz-ayuda">↔ Arrastrá para girar · tocá una parte para ver su ficha</div>
        </div>
        <div class="cz-botones">
          <button type="button" id="cz-girar" class="btn btn-ghost">↻ Girar la cama</button>
          <button type="button" id="cz-arriba" class="btn btn-ghost">Ver desde arriba</button>
        </div>
        <div class="cz-partes" id="cz-partes" role="group" aria-label="Partes de la cama"></div>
      </div>
      <div class="cz-der">
        <div class="m-card cz-ficha" id="cz-ficha" aria-live="polite">
          <div id="cz-ficha-vacia" class="m-card-empty"><span class="m-hand" aria-hidden="true">👆</span><b>Tocá una parte de la cama</b><span>Un cajón, una baulera o un zapatero: ves sus medidas acá.</span></div>
          <div id="cz-ficha-cuerpo" hidden>
            <span class="m-card-kind" id="cz-f-tipo"></span><h3 id="cz-f-titulo"></h3><dl id="cz-f-dl"></dl>
            <button type="button" class="btn btn-nogal" id="cz-f-cambiar" hidden></button>
          </div>
        </div>
        <div class="cz-prog" id="cz-prog" role="status" aria-live="polite">
          <span id="cz-prog-txt">Paso 1 de 5</span>
          <div class="cz-prog-barra"><i id="cz-prog-fill"></i></div>
        </div>
        <div class="cfg cz-pasos" id="cz-pasos">
          <section class="cz-paso on" id="paso-1" data-p="1">
            <button type="button" class="cz-paso-btn" aria-expanded="true" aria-controls="paso-1-c"><i>1</i><span class="cz-paso-tit">Elegí la medida de tu cama</span><em class="cz-paso-res" id="res-1"></em><b class="cz-cambiar">Cambiar</b></button>
            <div class="cz-paso-c" id="paso-1-c">
              <div class="f-chips" id="cz-medida"></div>
              <button type="button" class="btn btn-nogal cz-sig" data-sig="2">Continuar →</button>
            </div>
          </section>
          <section class="cz-paso" id="paso-2" data-p="2">
            <button type="button" class="cz-paso-btn" aria-expanded="false" aria-controls="paso-2-c"><i>2</i><span class="cz-paso-tit">Elegí tus cajones</span><em class="cz-paso-res" id="res-2"></em><b class="cz-cambiar">Cambiar</b></button>
            <div class="cz-paso-c" id="paso-2-c" hidden>
              <h3 class="cz-sub">¿Cuántos cajones querés?</h3>
              <p class="h-nota cz-subn">Elegí el modelo con el que querés empezar. Después podés ajustarlo.</p>
              <div class="f-chips" id="cz-modelo"></div>
              <div id="cz-bloque-lat">
                <h3 class="cz-sub">Costados</h3>
                <p class="h-nota cz-subn" id="cz-lat-nota"></p>
                <div id="cz-lat"></div>
              </div>
              <div id="cz-bloque-pie">
                <h3 class="cz-sub">Pie de la cama</h3>
                <div class="cz-pie" id="cz-pie"></div>
              </div>
              <button type="button" class="btn btn-nogal cz-sig" data-sig="3">Continuar →</button>
            </div>
          </section>
          <section class="cz-paso" id="paso-3" data-p="3">
            <button type="button" class="cz-paso-btn" aria-expanded="false" aria-controls="paso-3-c"><i>3</i><span class="cz-paso-tit">Color y cierre suave</span><em class="cz-paso-res" id="res-3"></em><b class="cz-cambiar">Cambiar</b></button>
            <div class="cz-paso-c" id="paso-3-c" hidden>
              <h3 class="cz-sub">Color</h3>
              <p class="h-nota cz-subn">Todas se fabrican en blanco. En otro color hay un adicional.</p>
              <div class="f-colores" id="cz-color"></div>
              <h3 class="cz-sub">Correderas</h3>
              <button class="m-switch" id="cz-soft" role="switch" aria-checked="false" style="animation:none">
                <span class="m-switch-track"><span class="m-switch-knob"></span></span>
                <span class="m-switch-text"><b>Con cierre suave</b><small>El cajón se frena solo y cierra sin golpe</small></span>
              </button>
              <button type="button" class="btn btn-nogal cz-sig" data-sig="4">Continuar →</button>
            </div>
          </section>
          <section class="cz-paso" id="paso-4" data-p="4">
            <button type="button" class="cz-paso-btn" aria-expanded="false" aria-controls="paso-4-c"><i>4</i><span class="cz-paso-tit">¿Algo más?</span><em class="cz-paso-res" id="res-4"></em><b class="cz-cambiar">Cambiar</b></button>
            <div class="cz-paso-c" id="paso-4-c" hidden>
              <textarea id="cz-notas" rows="3" placeholder="Contanos cualquier detalle que quieras pedir (es opcional)"></textarea>
              <button type="button" class="btn btn-nogal cz-sig" data-sig="5">Ver mi resumen →</button>
            </div>
          </section>
          <section class="cz-paso" id="paso-5" data-p="5">
            <button type="button" class="cz-paso-btn" aria-expanded="false" aria-controls="paso-5-c"><i>5</i><span class="cz-paso-tit">Tu resumen y envío</span><em class="cz-paso-res" id="res-5"></em><b class="cz-cambiar">Ver</b></button>
            <div class="cz-paso-c" id="paso-5-c" hidden>
              <aside class="f-resumen" id="cz-resumen" aria-live="polite"></aside>
            </div>
          </section>
        </div>
      </div>
    </div>
    <div class="cz-barra" id="cz-barra">
      <div class="cz-barra-info"><small id="cz-barra-paso">Paso 1 de 5</small><b id="cz-barra-precio"></b></div>
      <button type="button" class="btn btn-nogal" id="cz-barra-sig">Continuar →</button>
    </div>
  </div>
</main>
` + pie('<script src="/js/productos-data.js?v=20261045"></script>\n<script src="/js/modelos.js?v=20261045"></script>\n<script src="/js/configurar.js?v=20261045"></script>')
};

// Versión de prueba del configurador con la cama en 3D (sin enlazar ni indexar). Parte de la misma página de configurar.html.
module.exports['configurar-3d.html'] = (h) => {
  let s = module.exports['configurar.html'](h);
  const a = s.indexOf('<div class="cz-izq">'), b = s.indexOf('<div class="cz-der">');
  const izq = `<div class="cz-izq">
        <div class="cz-escena" id="cz-escena" aria-label="Cama en 3D. Arrastrá para girarla, tocá un cajón o una tapa para abrirlo.">
          <div class="cz-ayuda" id="cz-ayuda">↔ Arrastrá para girar · tocá un cajón o una tapa para abrirlo</div>
        </div>
        <div class="cz-botones">
          <button type="button" id="cz-abrir" class="btn btn-ghost">Abrir todos los cajones</button>
          <button type="button" id="cz-bau" class="btn btn-ghost">Abrir las bauleras</button>
        </div>
        <p class="h-nota" style="margin:8px 0 0">Imagen 3D de referencia: el color y los detalles reales pueden variar levemente.</p>
      </div>
      `;
  s = s.slice(0, a) + izq + s.slice(b);
  s = s.replace('<meta charset="UTF-8">', '<meta charset="UTF-8">\n<meta name="robots" content="noindex, nofollow">');
  s = s.replace(/<script src="\/js\/productos-data\.js/, '<script type="importmap">{ "imports": { "three": "/js/vendor/three.module.min.js", "three/addons/": "/js/vendor/addons/" } }</script>\n<script src="/js/productos-data.js');
  s = s.replace(/<script src="\/js\/configurar\.js(\?v=\d+)"><\/script>/, '<script type="module" src="/js/configurar3d.js$1"></script>');
  s = s.replace('Diseñá tu cama box a medida | ProMuebles', 'Prueba: configurador 3D | ProMuebles');
  return s;
};
