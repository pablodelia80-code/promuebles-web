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
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
sol.shadow.mapSize.set(2048, 2048);
sol.shadow.camera.left = -330; sol.shadow.camera.right = 330; sol.shadow.camera.top = 330; sol.shadow.camera.bottom = -330;
sol.shadow.camera.near = 50; sol.shadow.camera.far = 1000;
sol.shadow.bias = -0.0004; sol.shadow.normalBias = 0.6; sol.shadow.radius = 5;
scene.add(sol);
scene.add(new THREE.HemisphereLight(0xffffff, 0xb0a79b, 0.3));
const foco = new THREE.SpotLight(0xffe2b8, 6500, 1200, 0.62, 1, 1.6);
foco.position.set(-330, 330, 140); foco.target.position.set(-120, 150, -150); scene.add(foco, foco.target);
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
const texPiso = lienzo(1024, 1024, (ctx, w, h) => {
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

const texListones = lienzo(512, 512, (ctx, w, h) => {
  for (let x = 0; x < w; x += 32) {
    const g = ctx.createLinearGradient(x, 0, x + 32, 0); const t = 150 + Math.random() * 25;
    g.addColorStop(0, 'rgb(' + t + ',' + (t - 52) + ',' + (t - 105) + ')'); g.addColorStop(1, 'rgb(' + (t - 22) + ',' + (t - 70) + ',' + (t - 118) + ')');
    ctx.fillStyle = g; ctx.fillRect(x, 0, 28, h);
    ctx.fillStyle = '#5d3f26'; ctx.fillRect(x + 28, 0, 4, h);
    ctx.strokeStyle = 'rgba(90,55,25,.18)'; for (let k = 0; k < 18; k++) { ctx.beginPath(); const yy = Math.random() * h; ctx.moveTo(x + 2, yy); ctx.lineTo(x + 26, yy + (Math.random() - .5) * 12); ctx.stroke(); }
  }
});
texListones.wrapS = texListones.wrapT = THREE.RepeatWrapping; texListones.repeat.set(2.6, 1);
const listones = new THREE.Mesh(new THREE.PlaneGeometry(224, 380), new THREE.MeshStandardMaterial({ map: texListones, bumpMap: texListones, bumpScale: 2.2, roughness: 0.55 }));
listones.position.set(-250, 190, PARED_Z + 0.6); listones.receiveShadow = true; scene.add(listones);

function logo() {
  const t = lienzo(1024, 400, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.shadowColor = 'rgba(255,214,150,.75)'; ctx.shadowBlur = 26;
    ctx.fillStyle = '#5a4535'; ctx.textAlign = 'center';
    ctx.font = '800 150px Poppins, Arial, sans-serif'; ctx.fillText('ProMuebles', w / 2, 190);
    ctx.shadowBlur = 14; ctx.font = '800 62px Poppins, Arial, sans-serif'; ctx.fillText('SHOWROOM', w / 2, 270);
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(150, 58.6), new THREE.MeshBasicMaterial({ map: t, transparent: true }));
  m.position.set(30, 100, PARED_Z + 1); return m;
}
const marca = logo(); scene.add(marca);
if (document.fonts && document.fonts.load) document.fonts.load('800 100px Poppins').then(() => { scene.remove(marca); scene.add(Object.assign(logo(), {})); dirty = true; });

// sombra de contacto suave bajo la cama (apoya la cama en el piso)
const texContacto = lienzo(256, 256, (ctx, w, h) => { const g = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2); g.addColorStop(0, 'rgba(30,24,18,.55)'); g.addColorStop(0.6, 'rgba(30,24,18,.22)'); g.addColorStop(1, 'rgba(30,24,18,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); });
const contacto = new THREE.Mesh(new THREE.PlaneGeometry(W + 90, L + 90), new THREE.MeshBasicMaterial({ map: texContacto, transparent: true, depthWrite: false }));
contacto.rotation.x = -Math.PI / 2; contacto.position.y = 0.15; scene.add(contacto);

// ---------- la cama ----------
const matBlanco = new THREE.MeshPhysicalMaterial({ color: 0xf1efea, roughness: 0.42, metalness: 0, clearcoat: 0.18, clearcoatRoughness: 0.35 });
const matInterior = new THREE.MeshStandardMaterial({ color: 0xe6e3dd, roughness: 0.7 });
const matMetal = new THREE.MeshStandardMaterial({ color: 0x9ea3a8, roughness: 0.35, metalness: 0.85 });
const matLinea = new THREE.LineBasicMaterial({ color: 0xb8b5ad });
const cama = new THREE.Group(); scene.add(cama);
let cajones = [];

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

function ponerCajon(g, tipo, base, dir) {
  g.userData.tipo = tipo; g.userData.base = base.clone(); g.userData.dir = dir.clone(); g.userData.abierto = tipo === 'lat' ? 0 : 0; g.userData.valor = 0;
  g.position.copy(base);
  cama.add(g); cajones.push(g);
}

function reparto(total, anchos) { const hueco = (total - anchos.reduce((a, b) => a + b, 0)) / (anchos.length + 1); let x = hueco, out = []; anchos.forEach(w => { out.push({ c: x + w / 2 - total / 2, w }); x += w + hueco; }); return out; }

// estados: lat.izq / lat.der = lista de lugares ('G' = 1 cajón grande, 'N' = 2 cajones normales apilados); pie = ['G'|'N', 'G'|'N']
const estado = { izq: ['G', 'G'], der: ['G', 'G'], pie: ['G', 'G'] };
const recordar = new Map();

function armar() {
  cajones.forEach(c => recordar.set(c.userData.clave, c.userData.valor));
  while (cama.children.length) cama.remove(cama.children[0]);
  cajones = [];
  const cuerpo = new THREE.Group(); cama.add(cuerpo);
  // estructura
  cuerpo.add(caja(W, 1.7, L, matBlanco, 0, H - 0.85, 0, 0.3));         // tapa superior
  cuerpo.add(caja(W - 0.4, 1.7, L - 0.4, matInterior, 0, 0.85, 0));    // base
  cuerpo.add(caja(W, H, 1.7, matBlanco, 0, H / 2, -L / 2 + 0.85, 0.3)); // cabecera
  [-1, 1].forEach(s => cuerpo.add(caja(1.5, H - 3.4, L - PROF - 2, matBlanco, s * (W / 2 - PROF - 0.8), H / 2, -PROF / 2 - 1)));
  cuerpo.add(caja(W - 0.6, H - 3.4, 1.5, matBlanco, 0, H / 2, L / 2 - PROF - 0.8));
  // cierres del pie: paneles de las esquinas y divisiones entre los cajones del pie, para que la cama se vea armada completa
  [-1, 1].forEach(sg => cuerpo.add(caja(1.5, H - 3.4, PROF, matBlanco, sg * (W / 2 - 0.75), H / 2, L / 2 - PROF / 2, 0.2)));
  const posPie = reparto(W, estado.pie.map(t => t === 'G' ? 65 : 48));
  for (let i = 0; i < posPie.length - 1; i++) { const xm = (posPie[i].c + posPie[i].w / 2 + posPie[i + 1].c - posPie[i + 1].w / 2) / 2; cuerpo.add(caja(1.5, H - 3.4, PROF, matBlanco, xm, H / 2, L / 2 - PROF / 2)); }
  // costados de la cabecera cerrados
  [-1, 1].forEach(sg => cuerpo.add(caja(1.5, H - 3.4, 41, matBlanco, sg * (W / 2 - 0.75), H / 2, -L / 2 + 20.5, 0.2)));
  // divisiones entre cajones laterales
  const zIni = -L / 2 + 41, zFin = L / 2 - PROF - 3, largo = (zFin - zIni) / 2;
  [-1, 1].forEach(s => { for (let i = 0; i <= 2; i++) cuerpo.add(caja(PROF, H - 3.4, 1.4, matBlanco, s * (W / 2 - PROF / 2), H / 2, zIni + largo * i)); });
  // líneas de las tapas de las bauleras (cabecera y centro)
  const z0 = -L / 2;
  const marcos = [[-W / 4 + 0, z0 + 19, 68, 38], [W / 4 + 0, z0 + 19, 68, 38], [0, z0 + 41 + 52, 50, 102]];
  marcos.forEach(([x, z, w, d]) => {
    const pts = [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2], [-w / 2, -d / 2]].map(p => new THREE.Vector3(x + p[0], H + 0.06, z + p[1]));
    cuerpo.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), matLinea));
  });
  // agujeritos de las tapas de las bauleras
  [[-W / 4 - 22, z0 + 19], [W / 4 + 22, z0 + 19], [0, z0 + 41 + 52 - 40]].forEach(([x, z]) => { const h = new THREE.Mesh(new THREE.CircleGeometry(1.4, 20), new THREE.MeshBasicMaterial({ color: 0x8a867e })); h.rotation.x = -Math.PI / 2; h.position.set(x, H + 0.05, z); cuerpo.add(h); });
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
  // cajones del pie
  const anchos = estado.pie.map(t => t === 'G' ? 65 : 48), pos = reparto(W, anchos);
  estado.pie.forEach((tipo, i) => {
    const niveles = tipo === 'G' ? [[35, 21]] : [[16.8, 11.9], [16.8, 30.1]];
    niveles.forEach(([alto, y], n) => {
      const c = hacerCajon(anchos[i] - 1.2, alto, PROF);
      c.userData.clave = 'pie' + i + '-' + n;
      ponerCajon(c, 'pie', new THREE.Vector3(pos[i].c, y, L / 2), new THREE.Vector3(0, 0, 1));
    });
  });
  cajones.forEach(c => { const v = recordar.get(c.userData.clave); if (v) { c.userData.valor = v; c.userData.abierto = v > 20 ? 1 : 0; } });
  actualizarPos(); dirty = true;
}

function actualizarPos() { cajones.forEach(c => { c.position.copy(c.userData.base).addScaledVector(c.userData.dir, c.userData.valor); }); }

// ---------- interacción ----------
let dirty = true;
const rayo = new THREE.Raycaster(), p2 = new THREE.Vector2();
let abajo = null;
renderer.domElement.addEventListener('pointerdown', e => { abajo = { x: e.clientX, y: e.clientY }; });
renderer.domElement.addEventListener('pointerup', e => {
  if (!abajo || Math.hypot(e.clientX - abajo.x, e.clientY - abajo.y) > 6) { abajo = null; return; }
  abajo = null;
  const r = renderer.domElement.getBoundingClientRect();
  p2.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  rayo.setFromCamera(p2, camera);
  const frentes = cajones.map(c => c.userData.frente);
  const hit = rayo.intersectObjects(frentes, false)[0];
  if (hit) { const c = hit.object.userData.cajon; c.userData.abierto = c.userData.abierto ? 0 : 1; dirty = true; document.getElementById('ayuda').style.opacity = 0; }
});
// el cursor cambia a "abrir" al pasar sobre un cajón
let ultimoMov = 0;
renderer.domElement.addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse' || e.buttons || performance.now() - ultimoMov < 60) return;
  ultimoMov = performance.now();
  const r = renderer.domElement.getBoundingClientRect();
  p2.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  rayo.setFromCamera(p2, camera);
  stage.classList.toggle('sobre-cajon', rayo.intersectObjects(cajones.map(c => c.userData.frente), false).length > 0);
});
controls.addEventListener('change', () => { dirty = true; });
controls.addEventListener('start', () => { tocoCamara = true; document.getElementById('ayuda').style.opacity = 0; });

// Encuadre automático: la cama entera, con los cajones abiertos, entra en cualquier pantalla
let tocoCamara = false;
function encuadrar() {
  if (tocoCamara) return;
  const R = 128, vf = THREE.MathUtils.degToRad(camera.fov), hf = 2 * Math.atan(Math.tan(vf / 2) * camera.aspect);
  const dist = R / Math.sin(Math.min(vf, hf) / 2);
  const dir = new THREE.Vector3(238, 88, 367).normalize();
  camera.position.copy(controls.target).addScaledVector(dir, dist);
  controls.minDistance = dist * 0.55; controls.maxDistance = dist * 1.7;
  controls.update();
}
function tamano() {
  const w = stage.clientWidth, h = stage.clientHeight; renderer.setSize(w, h); composer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); encuadrar(); dirty = true;
}
new ResizeObserver(tamano).observe(stage); tamano();

function bucle() {
  requestAnimationFrame(bucle);
  let mueve = controls.update();
  cajones.forEach(c => {
    const meta = c.userData.abierto ? 40 : 0, d = meta - c.userData.valor;
    if (Math.abs(d) > 0.05) { c.userData.valor += d * 0.14; mueve = true; } else if (c.userData.valor !== meta) { c.userData.valor = meta; mueve = true; }
  });
  if (mueve) { actualizarPos(); dirty = true; }
  if (dirty) { composer.render(); dirty = false; }
}

// ---------- botones: 1 cajón grande o 2 normales ----------
function paneles() {
  const cont = document.getElementById('lugares'); cont.innerHTML = '';
  [['izq', 'Lado izquierdo'], ['der', 'Lado derecho'], ['pie', 'Pie de la cama']].forEach(([k, nombre]) => {
    const fila = document.createElement('div'); fila.className = 'fila';
    const t = document.createElement('span'); t.textContent = nombre; fila.appendChild(t);
    estado[k].forEach((tipo, i) => {
      const grupo = document.createElement('div'); grupo.className = 'par';
      [['G', '1 grande'], ['N', '2 normales']].forEach(([val, txt]) => {
        const b = document.createElement('button'); b.type = 'button'; b.textContent = txt; b.className = tipo === val ? 'on' : '';
        b.addEventListener('click', () => { estado[k][i] = val; armar(); paneles(); });
        grupo.appendChild(b);
      });
      fila.appendChild(grupo);
    });
    cont.appendChild(fila);
  });
}
document.getElementById('abrir').addEventListener('click', () => { const abrir = cajones.some(c => !c.userData.abierto); cajones.forEach(c => { c.userData.abierto = abrir ? 1 : 0; }); document.getElementById('abrir').textContent = abrir ? 'Cerrar todos los cajones' : 'Abrir todos los cajones'; dirty = true; });

armar(); paneles(); bucle();
setTimeout(() => { cajones.forEach(c => { c.userData.abierto = 1; }); document.getElementById('abrir').textContent = 'Cerrar todos los cajones'; dirty = true; }, 700);
window.__proto = { estado, armar, cajones: () => cajones.length, camara: camera, renderer };
