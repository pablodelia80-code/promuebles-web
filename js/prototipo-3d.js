// Prototipo 3D de la cama 6 Vip en estilo showroom (Three.js, alojado en la propia web).
// Medidas en cm. Ejes: x = ancho de la cama, y = alto, z = largo (la cabecera está contra la pared, en -z).
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const W = 143, L = 193, H = 42, PROF = 40;
const stage = document.getElementById('stage');

// ---------- escena, cámara y luz ----------
const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.78;
renderer.outputColorSpace = THREE.SRGBColorSpace;
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9c978f);
scene.fog = new THREE.Fog(0x9c978f, 800, 1700);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.22;

const camera = new THREE.PerspectiveCamera(26, 1, 10, 3000);
camera.position.set(238, 108, 372);

const sol = new THREE.DirectionalLight(0xfff0dc, 2.1);
sol.position.set(-220, 360, 260);
sol.castShadow = true;
const lado = window.matchMedia('(max-width: 900px)').matches ? 2048 : 4096; sol.shadow.mapSize.set(lado, lado); sol.shadow.blurSamples = 20;
sol.shadow.camera.left = -330; sol.shadow.camera.right = 330; sol.shadow.camera.top = 330; sol.shadow.camera.bottom = -330;
sol.shadow.camera.near = 50; sol.shadow.camera.far = 1000;
sol.shadow.bias = -0.0003; sol.shadow.normalBias = 0.5; sol.shadow.radius = 7;
scene.add(sol);
scene.add(new THREE.HemisphereLight(0xffffff, 0xb0a79b, 0.3));
const foco = new THREE.SpotLight(0xffe2b8, 4200, 1200, 0.5, 1, 1.6);
foco.position.set(-330, 330, 140); foco.target.position.set(-150, 190, -150); scene.add(foco, foco.target);
const relleno = new THREE.DirectionalLight(0xdfe8ff, 0.5); relleno.position.set(300, 120, 260); scene.add(relleno);

const sinMobil = !window.matchMedia('(max-width: 900px)').matches;
const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: 4 }));
composer.addPass(new RenderPass(scene, camera));
const ao = new GTAOPass(scene, camera, 4, 4);
ao.output = GTAOPass.OUTPUT.Default;
ao.updateGtaoMaterial({ radius: 24, distanceExponent: 1.4, thickness: 12, scale: 1.15, samples: sinMobil ? 16 : 8, distanceFallOff: 1 });
ao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 12 });
ao.blendIntensity = 1;
composer.addPass(ao);
composer.addPass(new OutputPass());

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 20, 5);
controls.enableDamping = true; controls.dampingFactor = 0.08;
controls.enablePan = false;
controls.minDistance = 300; controls.maxDistance = 760;
controls.maxPolarAngle = Math.PI * 0.485; controls.minPolarAngle = 0.25;
controls.rotateSpeed = 0.7;

// ---------- showroom: piso y pared de cemento, listones de madera y logo ----------
function lienzo(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
function ruido(ctx, w, h, base, n, amp) {
  ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < n; i++) { const g = 120 + Math.random() * amp; ctx.fillStyle = 'rgba(' + g + ',' + g + ',' + (g - 4) + ',' + (Math.random() * 0.12) + ')'; const s = 1 + Math.random() * 5; ctx.fillRect(Math.random() * w, Math.random() * h, s, s); }
}
const texPiso = lienzo(2048, 2048, (ctx, w, h) => {
  ruido(ctx, w, h, '#8f8c85', 9000, 80);
  for (let i = 0; i < 40; i++) { const x = Math.random() * w, y = Math.random() * h, r = 80 + Math.random() * 220, g = ctx.createRadialGradient(x, y, 0, x, y, r), t = Math.random() < .5 ? '255,255,250' : '70,66,60'; g.addColorStop(0, 'rgba(' + t + ',.09)'); g.addColorStop(1, 'rgba(' + t + ',0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
  ctx.strokeStyle = 'rgba(70,66,60,.10)'; ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) { ctx.beginPath(); let x = Math.random() * w, y = Math.random() * h; ctx.moveTo(x, y); for (let k = 0; k < 14; k++) { x += (Math.random() - .5) * 90; y += (Math.random() - .3) * 70; ctx.lineTo(x, y); } ctx.stroke(); }
});
texPiso.wrapS = texPiso.wrapT = THREE.RepeatWrapping; texPiso.repeat.set(3, 3);
const piso = new THREE.Mesh(new THREE.PlaneGeometry(2400, 2400), new THREE.MeshStandardMaterial({ map: texPiso, bumpMap: texPiso, bumpScale: 1.0, roughness: 0.78, metalness: 0 }));
piso.rotation.x = -Math.PI / 2; piso.receiveShadow = true; scene.add(piso);

function cemento(w, h, claro) {
  return lienzo(w, h, (ctx) => {
    ruido(ctx, w, h, claro ? '#9a9791' : '#8f8c85', 22000, 90);
    for (let i = 0; i < 60; i++) { const x = Math.random() * w, y = Math.random() * h, r = 60 + Math.random() * 260, g = ctx.createRadialGradient(x, y, 0, x, y, r), t = Math.random() < .5 ? '255,255,250' : '60,56,50'; g.addColorStop(0, 'rgba(' + t + ',.08)'); g.addColorStop(1, 'rgba(' + t + ',0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
    for (let i = 0; i < 900; i++) { ctx.fillStyle = 'rgba(40,38,34,' + (0.15 + Math.random() * 0.3) + ')'; const r = 0.6 + Math.random() * 1.8; ctx.beginPath(); ctx.arc(Math.random() * w, Math.random() * h, r, 0, 7); ctx.fill(); }
  });
}
const texPared = cemento(2048, 1024, true);
{ const c = texPared.image.getContext('2d'), w = 2048, h = 1024;
  c.strokeStyle = 'rgba(50,47,42,.45)'; c.lineWidth = 4;
  for (let x = 0; x <= w; x += 512) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
  c.beginPath(); c.moveTo(0, h / 2); c.lineTo(w, h / 2); c.stroke();
  c.fillStyle = 'rgba(45,42,38,.65)'; for (let x = 256; x < w; x += 512) for (const y of [150, 330, 700, 880]) { c.beginPath(); c.arc(x, y, 7, 0, 7); c.fill(); }
  texPared.needsUpdate = true; }
texPared.wrapS = THREE.RepeatWrapping; texPared.repeat.set(1.6, 1);
const PARED_Z = -150;
const pared = new THREE.Mesh(new THREE.PlaneGeometry(1000, 380), new THREE.MeshStandardMaterial({ map: texPared, bumpMap: texPared, bumpScale: 1.4, roughness: 0.9 }));
pared.position.set(120, 190, PARED_Z); pared.receiveShadow = true; scene.add(pared);

const texListones = lienzo(1024, 1024, (ctx, w, h) => {
  for (let x = 0; x < w; x += 64) {
    const g = ctx.createLinearGradient(x, 0, x + 64, 0); const t = 150 + Math.random() * 25;
    g.addColorStop(0, 'rgb(' + t + ',' + (t - 52) + ',' + (t - 105) + ')'); g.addColorStop(1, 'rgb(' + (t - 22) + ',' + (t - 70) + ',' + (t - 118) + ')');
    ctx.fillStyle = g; ctx.fillRect(x, 0, 56, h);
    ctx.fillStyle = '#4f3320'; ctx.fillRect(x + 56, 0, 8, h);
    for (let k = 0; k < 140; k++) { ctx.strokeStyle = 'rgba(' + (Math.random() < .5 ? '80,48,20' : '210,150,90') + ',' + (0.05 + Math.random() * 0.12) + ')'; ctx.lineWidth = 0.6 + Math.random() * 1.2; const xx = x + 3 + Math.random() * 50; ctx.beginPath(); ctx.moveTo(xx, 0); ctx.bezierCurveTo(xx + (Math.random() - .5) * 8, h * .33, xx + (Math.random() - .5) * 8, h * .66, xx + (Math.random() - .5) * 6, h); ctx.stroke(); }
  }
});
texListones.wrapS = texListones.wrapT = THREE.RepeatWrapping; texListones.repeat.set(2.6, 1);
const listones = new THREE.Mesh(new THREE.PlaneGeometry(224, 380), new THREE.MeshStandardMaterial({ map: texListones, bumpMap: texListones, bumpScale: 2.2, roughness: 0.55 }));
listones.position.set(-250, 190, PARED_Z + 0.6); listones.receiveShadow = true; scene.add(listones);

function logo() {
  const t = lienzo(1024, 400, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.shadowColor = 'rgba(255,196,120,.95)'; ctx.shadowBlur = 46;
    ctx.fillStyle = '#5a4535'; ctx.textAlign = 'center';
    ctx.font = '800 150px Poppins, Arial, sans-serif'; ctx.fillText('ProMuebles', w / 2, 190);
    ctx.shadowBlur = 14; ctx.font = '800 62px Poppins, Arial, sans-serif'; ctx.fillText('SHOWROOM', w / 2, 270);
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(150, 58.6), new THREE.MeshBasicMaterial({ map: t, transparent: true }));
  m.position.set(30, 100, PARED_Z + 1); return m;
}
const marca = logo(); scene.add(marca);
if (document.fonts && document.fonts.load) document.fonts.load('800 100px Poppins').then(() => { scene.remove(marca); scene.add(Object.assign(logo(), {})); dirty = true; });

// Texturas reales recortadas de la foto del showroom (sustituyen a las generadas por código apenas cargan)
const cargador = new THREE.TextureLoader();
function cargar(url, rx, ry, fn) {
  cargador.load(url, t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping; t.repeat.set(rx, ry); fn(t); dirty = true; });
}
cargar('./assets/prototipo/piso.jpg', 9, 13, t => { piso.material.map = t; piso.material.bumpMap = t; piso.material.bumpScale = 1.6; piso.material.color.set(0xe2dfd8); piso.material.needsUpdate = true; });
cargar('./assets/prototipo/pared.jpg', 5, 1.9, t => { pared.material.map = t; pared.material.bumpMap = t; pared.material.bumpScale = 2.2; pared.material.color.set(0xeceae4); pared.material.needsUpdate = true; });
cargar('./assets/prototipo/listones.jpg?v=2', 1.8, 3.6, t => { listones.material.map = t; listones.material.bumpMap = t; listones.material.bumpScale = 3; listones.material.color.set(0xf2dcc4); listones.material.needsUpdate = true; });

// sombra de contacto suave bajo la cama (apoya la cama en el piso)
const texContacto = lienzo(256, 256, (ctx, w, h) => { const g = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2); g.addColorStop(0, 'rgba(30,24,18,.55)'); g.addColorStop(0.6, 'rgba(30,24,18,.22)'); g.addColorStop(1, 'rgba(30,24,18,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); });
const contacto = new THREE.Mesh(new THREE.PlaneGeometry(W + 90, L + 90), new THREE.MeshBasicMaterial({ map: texContacto, transparent: true, depthWrite: false }));
contacto.rotation.x = -Math.PI / 2; contacto.position.y = 0.15; scene.add(contacto);


// ---------- la cama ----------
const texMelamina = lienzo(512, 512, (ctx, w, h) => { ctx.fillStyle = '#9a9a9a'; ctx.fillRect(0, 0, w, h); for (let i = 0; i < 9000; i++) { const g = 120 + Math.random() * 120; ctx.fillStyle = 'rgb(' + g + ',' + g + ',' + g + ')'; ctx.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2); } });
texMelamina.colorSpace = THREE.NoColorSpace; texMelamina.wrapS = texMelamina.wrapT = THREE.RepeatWrapping; texMelamina.repeat.set(3, 3);
const matBlanco = new THREE.MeshPhysicalMaterial({ color: 0xf1efea, roughness: 0.5, roughnessMap: texMelamina, bumpMap: texMelamina, bumpScale: 0.12, metalness: 0, clearcoat: 0.22, clearcoatRoughness: 0.3 });
const matInterior = new THREE.MeshStandardMaterial({ color: 0xe6e3dd, roughness: 0.7 });
const matMetal = new THREE.MeshStandardMaterial({ color: 0x9ea3a8, roughness: 0.35, metalness: 0.85 });
const matAgujero = new THREE.MeshBasicMaterial({ color: 0x8a867e });
const cama = new THREE.Group(); scene.add(cama);
let cajones = [], tapas = [], solapas = [];

function caja(w, h, d, mat, x, y, z, radio) {
  const g = radio ? new RoundedBoxGeometry(w, h, d, 4, radio) : new THREE.BoxGeometry(w, h, d);
  const m = new THREE.Mesh(g, mat || matBlanco); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; return m;
}

// Cajón: el frente mira hacia +z local y la caja se extiende hacia -z. Se desliza hacia +z para abrirse.
function hacerCajon(ancho, alto, prof) {
  const g = new THREE.Group();
  const frente = caja(ancho, alto, 1.7, matBlanco, 0, 0, -0.85, 0.35); g.add(frente);
  const hi = alto - 5, e = 1.2, pi = prof - 1.7, aw = ancho - 4.6;
  g.add(caja(e, hi, pi, matInterior, -(ancho / 2 - 2.9), 0, -1.7 - pi / 2));
  g.add(caja(e, hi, pi, matInterior, (ancho / 2 - 2.9), 0, -1.7 - pi / 2));
  g.add(caja(aw, hi, e, matInterior, 0, 0, -prof + 0.6));
  g.add(caja(aw, e, pi, matInterior, 0, -hi / 2 + e / 2, -1.7 - pi / 2));
  [-1, 1].forEach(s => g.add(caja(0.7, 1.4, pi - 4, matMetal, s * (ancho / 2 - 1.5), -hi / 2 - 1.2, -1.7 - pi / 2 - 1)));
  frente.userData.cajon = g; g.userData.frente = frente;
  return g;
}

// Zapatero: el frente es una solapa que gira sobre su borde inferior; adentro lleva dos zapateros con brazos curvos y tabla inclinada
function hacerSolapa(ancho, alto) {
  const pivote = new THREE.Group();
  const panel = caja(ancho, alto, 1.7, matBlanco, 0, alto / 2, -0.85, 0.35); pivote.add(panel);
  [0.3, 0.68].forEach(f => {
    const y = alto * f;
    const tabla = caja(ancho - 10, 1.0, 11, matBlanco, 0, y, -7.7); tabla.rotation.x = 0.28; pivote.add(tabla);
    [-1, 0, 1].forEach(k => {
      const brazo = new THREE.Mesh(new THREE.TorusGeometry(5, 0.55, 8, 24, Math.PI), matBlanco);
      brazo.rotation.y = Math.PI / 2; brazo.position.set(k * (ancho / 2 - 10), y + 0.8, -7.7); brazo.castShadow = true; brazo.receiveShadow = true; pivote.add(brazo);
    });
  });
  panel.userData.solapa = pivote; pivote.userData.malla = panel; pivote.userData.abierto = 0; pivote.userData.valor = 0;
  return pivote;
}

function ponerCajon(g, tipo, base, dir) {
  g.userData.tipo = tipo; g.userData.base = base.clone(); g.userData.dir = dir.clone(); g.userData.abierto = 0; g.userData.valor = 0;
  g.position.copy(base);
  cama.add(g); cajones.push(g);
}

function reparto(total, anchos) { const hueco = (total - anchos.reduce((a, b) => a + b, 0)) / (anchos.length + 1); let x = hueco, out = []; anchos.forEach(w => { out.push({ c: x + w / 2 - total / 2, w }); x += w + hueco; }); return out; }

// Tapa superior con huecos (donde van las tapas de las bauleras), armada en tramos
function losaConHuecos(huecos) {
  const g = new THREE.Group(), xs = [-W / 2, W / 2], zs = [-L / 2, L / 2];
  huecos.forEach(h => { xs.push(h.x0, h.x1); zs.push(h.z0, h.z1); });
  const ux = [...new Set(xs)].sort((a, b) => a - b), uz = [...new Set(zs)].sort((a, b) => a - b);
  const dentro = (x, z) => huecos.some(h => x > h.x0 && x < h.x1 && z > h.z0 && z < h.z1);
  for (let j = 0; j < uz.length - 1; j++) {
    const za = uz[j], zb = uz[j + 1], zm = (za + zb) / 2; let ini = null;
    for (let i = 0; i < ux.length - 1; i++) {
      const xa = ux[i], xb = ux[i + 1], libre = !dentro((xa + xb) / 2, zm);
      if (libre && ini === null) ini = xa;
      if ((!libre || i === ux.length - 2) && ini !== null) {
        const fin = libre ? xb : xa;
        if (fin - ini > 0.05) g.add(caja(fin - ini + 0.02, 1.7, zb - za + 0.02, matBlanco, (ini + fin) / 2, H - 0.85, zm));
        ini = null;
      }
    }
  }
  return g;
}

// estado: lugares de los costados ('G' = 1 cajón grande, 'N' = 2 normales apilados) y pie (cajones por lado, zapateros o estantes)
const estado = { izq: ['G', 'G'], der: ['G', 'G'], pie: { tipo: 'cajones', lados: ['G', 'G'] } };
const recordar = new Map();

function armar() {
  cajones.forEach(c => recordar.set(c.userData.clave, c.userData.valor));
  tapas.forEach(t => recordar.set(t.userData.clave, t.userData.abierto));
  solapas.forEach(z => recordar.set(z.userData.clave, z.userData.abierto));
  while (cama.children.length) cama.remove(cama.children[0]);
  cajones = []; tapas = []; solapas = [];
  const cuerpo = new THREE.Group(); cama.add(cuerpo);
  const tipoPie = estado.pie.tipo, PP = tipoPie === 'estantes' ? 45 : PROF, paredH = H - 3.4;

  // huecos de las tapas de las bauleras: 2 en la cabecera y 1 central
  const hCab = (x) => ({ x0: x - 33.7, x1: x + 33.7, z0: -94.3, z1: -59.1 });
  const hCen = { x0: -24.5, x1: 24.5, z0: -54.5, z1: 47.5 };
  cuerpo.add(losaConHuecos([hCab(-W / 4), hCab(W / 4), hCen]));
  cuerpo.add(caja(W - 0.4, 1.7, L - 0.4, matInterior, 0, 0.85, 0));            // base
  cuerpo.add(caja(W, H, 1.7, matBlanco, 0, H / 2, -L / 2 + 0.85, 0.3));         // cabecera
  // compartimento de la cabecera (bauleras chicas)
  cuerpo.add(caja(W - 0.6, paredH, 1.5, matBlanco, 0, H / 2, -57.8));
  cuerpo.add(caja(1.5, paredH, 37, matBlanco, 0, H / 2, -76.3));
  [-1, 1].forEach(sg => cuerpo.add(caja(1.5, paredH, 41, matBlanco, sg * (W / 2 - 0.75), H / 2, -L / 2 + 20.5, 0.2)));
  // espina central (paredes de la baulera central)
  const zE0 = -57.05, zE1 = L / 2 - PP - 1.55, cE = (zE0 + zE1) / 2;
  [-1, 1].forEach(s => cuerpo.add(caja(1.5, paredH, zE1 - zE0, matBlanco, s * (W / 2 - PROF - 0.8), H / 2, cE)));
  cuerpo.add(caja(W - 0.6, paredH, 1.5, matBlanco, 0, H / 2, L / 2 - PP - 0.8));  // fondo del pie
  // divisiones entre cajones laterales
  const zIni = -57, zFin = L / 2 - PP - 3, largo = (zFin - zIni) / 2;
  [-1, 1].forEach(s => { for (let i = 0; i <= 2; i++) cuerpo.add(caja(PROF, paredH, 1.4, matBlanco, s * (W / 2 - PROF / 2), H / 2, zIni + largo * i)); });
  // cajones de los costados
  [['izq', -1], ['der', 1]].forEach(([lado, s]) => {
    estado[lado].forEach((tipo, i) => {
      const zc = zIni + largo * (i + 0.5), ancho = largo - 1.6;
      const niveles = tipo === 'G' ? [[35, 21]] : [[16.8, 11.9], [16.8, 30.1]];
      niveles.forEach(([alto, y], n) => {
        const c = hacerCajon(ancho, alto, PROF);
        c.rotation.y = s * Math.PI / 2;
        c.userData.clave = lado + i + '-' + n;
        ponerCajon(c, 'lat', new THREE.Vector3(s * W / 2, y, zc), new THREE.Vector3(s, 0, 0));
      });
    });
  });
  // pie de la cama
  if (tipoPie === 'estantes') {
    [-1, 1].forEach(sg => cuerpo.add(caja(1.5, paredH, PP, matBlanco, sg * (W / 2 - 0.75), H / 2, L / 2 - PP / 2, 0.2)));
    cuerpo.add(caja(1.5, paredH, PP, matBlanco, 0, H / 2, L / 2 - PP / 2));
    [-1, 1].forEach(sg => cuerpo.add(caja((W - 4.5) / 2, 1.5, PP - 1.6, matBlanco, sg * W / 4, H / 2, L / 2 - PP / 2 + 0.8)));
  } else {
    const anchos = tipoPie === 'zapateros' ? [65, 65] : estado.pie.lados.map(t => t === 'G' ? 65 : 48), pos = reparto(W, anchos);
    [-1, 1].forEach(sg => cuerpo.add(caja(1.5, paredH, PP, matBlanco, sg * (W / 2 - 0.75), H / 2, L / 2 - PP / 2, 0.2)));
    for (let i = 0; i < pos.length - 1; i++) { const xm = (pos[i].c + pos[i].w / 2 + pos[i + 1].c - pos[i + 1].w / 2) / 2; cuerpo.add(caja(1.5, paredH, PP, matBlanco, xm, H / 2, L / 2 - PP / 2)); }
    anchos.forEach((ancho, i) => {
      if (tipoPie === 'zapateros') {
        const z = hacerSolapa(ancho - 1.2, 35); z.position.set(pos[i].c, 3.5, L / 2); z.userData.clave = 'zap' + i;
        cuerpo.add(z); solapas.push(z); return;
      }
      const niveles = estado.pie.lados[i] === 'G' ? [[35, 21]] : [[16.8, 11.9], [16.8, 30.1]];
      niveles.forEach(([alto, y], n) => {
        const c = hacerCajon(ancho - 1.2, alto, PROF);
        c.userData.clave = 'pie' + i + '-' + n;
        ponerCajon(c, 'pie', new THREE.Vector3(pos[i].c, y, L / 2), new THREE.Vector3(0, 0, 1));
      });
    });
  }
  // tapas de las bauleras: giran sobre una bisagra y dejan ver el hueco (las de la cabecera por el lado de la pared; la central por un costado)
  [[hCab(-W / 4), 'cab0', 'x', -1], [hCab(W / 4), 'cab1', 'x', -1], [hCen, 'cen', 'z', 1]].forEach(([h, clave, eje, sentido]) => {
    const w = h.x1 - h.x0 - 0.6, d = h.z1 - h.z0 - 0.6, pivote = new THREE.Group();
    let tapa, agujero = new THREE.Mesh(new THREE.CircleGeometry(1.4, 20), matAgujero);
    agujero.rotation.x = -Math.PI / 2;
    if (eje === 'x') {
      pivote.position.set((h.x0 + h.x1) / 2, H, h.z0 + 0.3);
      tapa = caja(w, 1.6, d, matBlanco, 0, -0.85, d / 2, 0.25);
      agujero.position.set(w / 2 - 6, 0.82, d / 2 - 7);
    } else {
      pivote.position.set(h.x1 - 0.3, H, (h.z0 + h.z1) / 2);
      tapa = caja(w, 1.6, d, matBlanco, -w / 2, -0.85, 0, 0.25);
      agujero.position.set(-w / 2 + 7, 0.82, 0);
    }
    tapa.add(agujero); pivote.add(tapa);
    pivote.userData = { clave, eje, sentido, abierto: 0, valor: 0, malla: tapa }; tapa.userData.tapa = pivote;
    cuerpo.add(pivote); tapas.push(pivote);
  });
  cajones.forEach(c => { const v = recordar.get(c.userData.clave); if (v) { c.userData.valor = v; c.userData.abierto = v > 20 ? 1 : 0; } });
  tapas.forEach(t => { const v = recordar.get(t.userData.clave); if (v) { t.userData.abierto = 1; t.userData.valor = 1; } });
  solapas.forEach(z => { const v = recordar.get(z.userData.clave); if (v) { z.userData.abierto = 1; z.userData.valor = 1; } });
  actualizarPos(); dirty = true;
}

function actualizarPos() {
  cajones.forEach(c => { c.position.copy(c.userData.base).addScaledVector(c.userData.dir, c.userData.valor); });
  solapas.forEach(z => { z.rotation.x = THREE.MathUtils.degToRad(93) * z.userData.valor; });
  tapas.forEach(t => { const a = THREE.MathUtils.degToRad(105) * t.userData.valor; if (t.userData.eje === 'x') t.rotation.x = t.userData.sentido * a; else t.rotation.z = -a; });
}

// ---------- interacción ----------
let dirty = true;
const rayo = new THREE.Raycaster(), p2 = new THREE.Vector2();
const tocables = () => cajones.map(c => c.userData.frente).concat(tapas.map(t => t.userData.malla), solapas.map(z => z.userData.malla));
function apuntar(e) { const r = renderer.domElement.getBoundingClientRect(); p2.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); rayo.setFromCamera(p2, camera); return rayo.intersectObjects(tocables(), false)[0]; }
let abajo = null;
renderer.domElement.addEventListener('pointerdown', e => { abajo = { x: e.clientX, y: e.clientY }; });
renderer.domElement.addEventListener('pointerup', e => {
  if (!abajo || Math.hypot(e.clientX - abajo.x, e.clientY - abajo.y) > 6) { abajo = null; return; }
  abajo = null;
  const hit = apuntar(e);
  if (!hit) return;
  document.getElementById('ayuda').style.opacity = 0;
  if (hit.object.userData.cajon) { const c = hit.object.userData.cajon; c.userData.abierto = c.userData.abierto ? 0 : 1; }
  else if (hit.object.userData.solapa) { const z = hit.object.userData.solapa; z.userData.abierto = z.userData.abierto ? 0 : 1; }
  else { const t = hit.object.userData.tapa; t.userData.abierto = t.userData.abierto ? 0 : 1; vistaBauleras(); }
  etiquetas(); dirty = true;
});
// el cursor cambia a "abrir" al pasar sobre un cajón o una tapa
let ultimoMov = 0;
renderer.domElement.addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse' || e.buttons || performance.now() - ultimoMov < 60) return;
  ultimoMov = performance.now();
  stage.classList.toggle('sobre-cajon', !!apuntar(e));
});
controls.addEventListener('change', () => { dirty = true; });
controls.addEventListener('start', () => { tocoCamara = true; camTween = null; document.getElementById('ayuda').style.opacity = 0; });

// Encuadre automático: la cama entera, con los cajones abiertos, entra en cualquier pantalla
let tocoCamara = false, camTween = null, distInicial = 600;
const dirInicial = new THREE.Vector3(238, 88, 367).normalize();
function encuadrar() {
  const R = 128, vf = THREE.MathUtils.degToRad(camera.fov), hf = 2 * Math.atan(Math.tan(vf / 2) * camera.aspect);
  distInicial = R / Math.sin(Math.min(vf, hf) / 2);
  controls.minDistance = distInicial * 0.55; controls.maxDistance = distInicial * 1.7;
  if (tocoCamara) return;
  camera.position.copy(controls.target).addScaledVector(dirInicial, distInicial);
  controls.update();
}
// Al abrir una baulera la cámara sube para mirar adentro; al cerrar todas vuelve a la vista inicial
function moverCamara(phi) {
  tocoCamara = true;
  const sph = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
  camTween = { t: 0, de: sph.clone(), a: new THREE.Spherical(Math.min(sph.radius, distInicial * 1.05), phi, sph.theta) };
}
function vistaBauleras() {
  if (tapas.some(t => t.userData.abierto)) moverCamara(0.62);
  else moverCamara(new THREE.Spherical().setFromVector3(dirInicial).phi);
}
function tamano() {
  const w = stage.clientWidth, h = stage.clientHeight; renderer.setSize(w, h); composer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); encuadrar(); dirty = true;
}
new ResizeObserver(tamano).observe(stage); tamano();

let ultimo = performance.now();
function bucle() {
  requestAnimationFrame(bucle);
  const ahora = performance.now(), dt = Math.min(0.05, (ahora - ultimo) / 1000); ultimo = ahora;
  let mueve = controls.update();
  if (camTween) {
    camTween.t = Math.min(1, camTween.t + dt / 0.9);
    const k = camTween.t < 0.5 ? 2 * camTween.t * camTween.t : 1 - Math.pow(-2 * camTween.t + 2, 2) / 2, s = camTween.de, a = camTween.a;
    camera.position.setFromSpherical(new THREE.Spherical(s.radius + (a.radius - s.radius) * k, s.phi + (a.phi - s.phi) * k, s.theta)).add(controls.target);
    camera.lookAt(controls.target); controls.update(); mueve = true;
    if (camTween.t >= 1) camTween = null;
  }
  cajones.forEach(c => {
    const meta = c.userData.abierto ? 40 : 0, d = meta - c.userData.valor;
    if (Math.abs(d) > 0.05) { c.userData.valor += d * 0.14; mueve = true; } else if (c.userData.valor !== meta) { c.userData.valor = meta; mueve = true; }
  });
  solapas.forEach(z => {
    const meta = z.userData.abierto ? 1 : 0, d = meta - z.userData.valor;
    if (Math.abs(d) > 0.004) { z.userData.valor += d * 0.1; mueve = true; } else if (z.userData.valor !== meta) { z.userData.valor = meta; mueve = true; }
  });
  tapas.forEach(t => {
    const meta = t.userData.abierto ? 1 : 0, d = meta - t.userData.valor;
    if (Math.abs(d) > 0.004) { t.userData.valor += d * 0.12; mueve = true; } else if (t.userData.valor !== meta) { t.userData.valor = meta; mueve = true; }
  });
  if (mueve) { actualizarPos(); dirty = true; }
  if (dirty) { composer.render(); dirty = false; }
}

// ---------- paneles ----------
function etiquetas() {
  document.getElementById('abrir').textContent = cajones.some(c => !c.userData.abierto) || solapas.some(z => !z.userData.abierto) ? 'Abrir todos los cajones' : 'Cerrar todos los cajones';
  document.getElementById('bau').textContent = tapas.some(t => !t.userData.abierto) ? 'Abrir las bauleras' : 'Cerrar las bauleras';
}
function fila(nombre, hijos) { const f = document.createElement('div'); f.className = 'fila'; const t = document.createElement('span'); t.textContent = nombre; f.appendChild(t); hijos.forEach(h => f.appendChild(h)); return f; }
function opciones(lista, actual, alElegir) {
  const g = document.createElement('div'); g.className = 'par';
  lista.forEach(([val, txt]) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = txt; b.className = actual === val ? 'on' : ''; b.addEventListener('click', () => alElegir(val)); g.appendChild(b); });
  return g;
}
function paneles() {
  const cont = document.getElementById('lugares'); cont.innerHTML = '';
  const GN = [['G', '1 grande'], ['N', '2 normales']];
  [['izq', 'Costado izquierdo'], ['der', 'Costado derecho']].forEach(([k, nombre]) => cont.appendChild(fila(nombre, estado[k].map((tipo, i) => opciones(GN, tipo, v => { estado[k][i] = v; armar(); paneles(); etiquetas(); })))));
  cont.appendChild(fila('Pie de la cama', [opciones([['cajones', 'Cajones'], ['zapateros', 'Zapateros'], ['estantes', 'Estantes']], estado.pie.tipo, v => { estado.pie.tipo = v; armar(); paneles(); etiquetas(); })]));
  if (estado.pie.tipo === 'cajones') cont.appendChild(fila('Cajones del pie', estado.pie.lados.map((tipo, i) => opciones(GN, tipo, v => { estado.pie.lados[i] = v; armar(); paneles(); etiquetas(); }))));
}
document.getElementById('abrir').addEventListener('click', () => { const abrir = cajones.some(c => !c.userData.abierto) || solapas.some(z => !z.userData.abierto); cajones.forEach(c => { c.userData.abierto = abrir ? 1 : 0; }); solapas.forEach(z => { z.userData.abierto = abrir ? 1 : 0; }); etiquetas(); dirty = true; });
document.getElementById('bau').addEventListener('click', () => { const abrir = tapas.some(t => !t.userData.abierto); tapas.forEach(t => { t.userData.abierto = abrir ? 1 : 0; }); vistaBauleras(); etiquetas(); dirty = true; });

armar(); paneles(); etiquetas(); bucle();
setTimeout(() => { cajones.forEach(c => { c.userData.abierto = 1; }); solapas.forEach(z => { z.userData.abierto = 1; }); etiquetas(); dirty = true; }, 700);
window.__proto = { estado, armar, cajones: () => cajones.length, solapas: () => solapas.length, tapas: () => tapas.length, camara: camera, renderer, moverCamara, tween: () => camTween, controls };
