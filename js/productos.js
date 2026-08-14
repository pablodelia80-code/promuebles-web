// Productos page logic: category filtering, King subcategories, product modal, color comparison slider

let currentCat = null;
let currentKingSub = null;

const catNav = document.getElementById('cat-nav');
const kingSubnav = document.getElementById('king-subnav');
const kingSubnavButtons = document.getElementById('king-subnav-buttons');
const prodLanding = document.getElementById('prod-landing');
const prodGrid = document.getElementById('prod-grid');
const personalizacionWrap = document.getElementById('personalizacion-wrap');

function fmt(n) { return '$ ' + n.toLocaleString('es-AR'); }

function renderCatNav() {
  catNav.innerHTML = '';
  CATEGORIES.forEach(c => {
    const btn = document.createElement('button');
    btn.textContent = c.nombre;
    btn.className = currentCat === c.id ? 'active' : '';
    btn.onclick = () => selectCat(c.id);
    catNav.appendChild(btn);
  });
}

function selectCat(catId) {
  currentCat = catId;
  currentKingSub = null;
  renderCatNav();

  if (!catId) {
    showLanding();
    return;
  }

  if (catId === 'king') {
    prodLanding.style.display = 'none';
    prodGrid.style.display = 'none';
    personalizacionWrap.style.display = 'none';
    kingSubnav.style.display = 'block';
    renderKingSubnav();
    return;
  }

  kingSubnav.style.display = 'none';

  if (catId === 'personalizacion') {
    prodLanding.style.display = 'none';
    prodGrid.style.display = 'none';
    personalizacionWrap.style.display = 'block';
    return;
  }

  personalizacionWrap.style.display = 'none';
  prodLanding.style.display = 'none';
  renderGrid(PRODUCTS.filter(p => p.cat === catId));
}

function showLanding() {
  kingSubnav.style.display = 'none';
  prodGrid.style.display = 'none';
  personalizacionWrap.style.display = 'none';
  prodLanding.style.display = 'block';
}

function renderKingSubnav() {
  kingSubnavButtons.innerHTML = '';
  const subs = [{ id: 'king-180', nombre: 'King 180 × 200' }, { id: 'king-200', nombre: 'King 200 × 200' }];
  subs.forEach(s => {
    const btn = document.createElement('button');
    btn.textContent = s.nombre;
    btn.className = currentKingSub === s.id ? 'active' : '';
    btn.onclick = () => {
      currentKingSub = s.id;
      renderKingSubnav();
      renderGrid(PRODUCTS.filter(p => p.subcat === s.id));
    };
    kingSubnavButtons.appendChild(btn);
  });
}

function renderGrid(items) {
  prodGrid.innerHTML = '';
  prodGrid.style.display = 'grid';
  items.sort((a, b) => (b.oferta ? 1 : 0) - (a.oferta ? 1 : 0) || a.price - b.price);
  items.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'prod-card';
    card.onclick = () => openModal(p);
    card.innerHTML = `
      <div class="prod-media">
        ${p.oferta ? '<span class="badge-oferta">Oferta</span>' : ''}
        <img src="${p.img}" alt="${p.n}" loading="lazy">
      </div>
      <div class="prod-body">
        <h3>${p.n}</h3>
        <p class="medida">${p.medida}</p>
        <div class="prod-price">
          ${p.oferta ? `<span class="old">${fmt(p.priceOld)}</span>` : ''}
          <span class="now">${fmt(p.price)}</span>
        </div>
      </div>`;
    prodGrid.appendChild(card);
  });
}

// ===== MODAL =====
const modalOverlay = document.getElementById('modal-overlay');
function openModal(p) {
  document.getElementById('modal-nombre').textContent = p.n;
  document.getElementById('modal-medida').textContent = p.medida;
  document.getElementById('modal-precio').textContent = fmt(p.price);
  const oldEl = document.getElementById('modal-anterior');
  if (p.oferta) { oldEl.style.display = 'inline'; oldEl.textContent = fmt(p.priceOld); }
  else { oldEl.style.display = 'none'; }
  document.getElementById('modal-badge').style.display = p.oferta ? 'inline-block' : 'none';
  document.getElementById('modal-main-img').src = p.img;
  document.getElementById('modal-resumen').textContent = p.resumen || '';
  const specsEl = document.getElementById('modal-specs');
  specsEl.innerHTML = '';
  (p.specs || []).forEach(s => {
    const row = document.createElement('div');
    row.className = 'item';
    row.innerHTML = `<span class="dot">&middot;</span><span>${s}</span>`;
    specsEl.appendChild(row);
  });
  document.getElementById('modal-wa').href = waLink('Hola! Me interesa el modelo ' + p.n + ' (' + p.medida + '). ¿Me pasás más información?');

  const thumbs = document.getElementById('modal-thumbs');
  thumbs.innerHTML = '';
  const allPhotos = [p.img, ...(p.clientPhotos || [])];
  galleryPhotos = allPhotos;
  galleryIndex = 0;
  const mainImgEl = document.getElementById('modal-main-img');
  const setActive = (i) => {
    galleryIndex = i;
    mainImgEl.src = allPhotos[i];
    thumbs.querySelectorAll('img').forEach((t, ti) => t.classList.toggle('active', ti === i));
  };
  allPhotos.forEach((src, i) => {
    const t = document.createElement('img');
    t.src = src;
    if (i === 0) t.classList.add('active');
    t.onclick = () => setActive(i);
    thumbs.appendChild(t);
  });

  document.getElementById('modal-client-label').style.display = (p.clientPhotos && p.clientPhotos.length) ? 'block' : 'none';

  document.getElementById('modal-zoom-trigger').onclick = () => openLightbox(galleryPhotos, galleryIndex);

  modalOverlay.classList.add('open');
}
function closeModal(e) { if (e) e.stopPropagation(); modalOverlay.classList.remove('open'); }

// ===== LIGHTBOX =====
const lightbox = document.getElementById('lightbox');
let galleryPhotos = [];
let galleryIndex = 0;
function openLightbox(photos, index) {
  if (Array.isArray(photos)) { galleryPhotos = photos; galleryIndex = index || 0; }
  else { galleryPhotos = [photos]; galleryIndex = 0; }
  renderLightbox();
  lightbox.classList.add('open');
}
function renderLightbox() {
  document.getElementById('lightbox-img').src = galleryPhotos[galleryIndex];
  const multi = galleryPhotos.length > 1;
  document.querySelector('.lightbox-prev').style.display = multi ? 'flex' : 'none';
  document.querySelector('.lightbox-next').style.display = multi ? 'flex' : 'none';
}
function lightboxPrev() { galleryIndex = (galleryIndex - 1 + galleryPhotos.length) % galleryPhotos.length; renderLightbox(); }
function lightboxNext() { galleryIndex = (galleryIndex + 1) % galleryPhotos.length; renderLightbox(); }
function closeLightbox() { lightbox.classList.remove('open'); }

// ===== PERSONALIZACION =====
function renderColors() {
  const grid = document.getElementById('color-grid');
  grid.innerHTML = '';
  COLORS.forEach((c, i) => {
    const card = document.createElement('div');
    card.className = 'color-card' + (i === 0 ? ' active' : '');
    const swatchStyle = c.tex ? `background-image:url('${c.tex}');background-size:cover;background-position:center` : `background:${c.sw}`;
    card.innerHTML = `
      <div class="color-swatch" style="${swatchStyle}"></div>
      <div class="color-card-body">
        <p>${c.n}</p>
        <a href="${waLink('Hola! Quiero mi cama en color ' + c.n)}" target="_blank" rel="noopener">Pedir en este color &rarr;</a>
      </div>`;
    card.querySelector('.color-swatch').onclick = () => {
      document.querySelectorAll('.color-card').forEach(el => el.classList.remove('active'));
      card.classList.add('active');
      setCompareSide(c);
    };
    grid.appendChild(card);
  });
}
renderColors();

const compareRange = document.getElementById('compare-range');
const compareFrame = document.getElementById('compare-frame');
compareRange.addEventListener('input', () => {
  const v = compareRange.value + '%';
  compareFrame.style.setProperty('--split', v);
});

// Alternating left/right side updater for the color comparison slider
let compareNextSide = 'left';
function setCompareSide(c) {
  const imgEl = document.getElementById(compareNextSide === 'left' ? 'compare-a' : 'compare-b');
  imgEl.src = c.compare;
  imgEl.alt = 'Cama en color ' + c.n;
  compareNextSide = compareNextSide === 'left' ? 'right' : 'left';
}

function slugify(str) {
  return str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ===== INIT =====
renderCatNav();
showLanding();

// Lee ?cat=, ?king= y ?producto= de la URL (links desde home o desde el chat bot)
const urlParams = new URLSearchParams(window.location.search);
const initialCat = urlParams.get('cat');
const initialKing = urlParams.get('king');
const initialProducto = urlParams.get('producto');

if (initialCat === 'king' && initialKing) {
  currentCat = 'king';
  currentKingSub = initialKing;
  renderCatNav();
  prodLanding.style.display = 'none';
  personalizacionWrap.style.display = 'none';
  kingSubnav.style.display = 'block';
  renderKingSubnav();
  renderGrid(PRODUCTS.filter((p) => p.subcat === initialKing));
} else if (initialCat) {
  selectCat(initialCat);
}

if (initialProducto) {
  const match = PRODUCTS.find((p) =>
    (!initialCat || p.cat === initialCat) &&
    (!initialKing || p.subcat === initialKing) &&
    slugify(p.n) === initialProducto
  );
  if (match) setTimeout(() => openModal(match), 250);
}
