// Shared behavior across all pages: mobile nav toggle + scroll reveal animations

document.addEventListener('DOMContentLoaded', () => {
  const burger = document.querySelector('.burger');
  const navLinks = document.querySelector('.nav-links');
  if (burger && navLinks) {
    burger.addEventListener('click', () => navLinks.classList.toggle('open'));
  }

  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  }

  initSongPlayer();

  // Altura del encabezado fijo, para que el botón "Volver" quede justo debajo
  const medirEncabezado = () => {
    const h = document.querySelector('header.site');
    if (h) document.documentElement.style.setProperty('--hdr', h.offsetHeight + 'px');
  };
  medirEncabezado();
  window.addEventListener('resize', medirEncabezado);
});

function waLink(msg) {
  return 'https://wa.me/5491168767075?text=' + encodeURIComponent(msg);
}

// Floating song button (bottom-left, opposite WhatsApp). Remembers the second it was at
// so the song picks up where it left off on the next page.
function initSongPlayer() {
  const KEY = 'pmSong';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const save = (v) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} };

  const wrap = document.createElement('div');
  wrap.className = 'pm-song';
  wrap.innerHTML =
    '<button class="pm-song-btn" type="button" aria-label="Escuchar el tema de ProMuebles" aria-pressed="false">' +
      '<svg class="pm-song-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>' +
      '<span class="pm-song-bars" aria-hidden="true"><span></span><span></span><span></span><span></span></span>' +
    '</button>' +
    '<span class="pm-song-label" aria-hidden="true"></span>';
  document.body.appendChild(wrap);

  const btn = wrap.querySelector('.pm-song-btn');
  const label = wrap.querySelector('.pm-song-label');
  const audio = new Audio();
  audio.preload = 'none';
  audio.src = 'assets/audio/hecha-a-tu-medida.mp3';

  const saved = load();
  let resumeAt = saved.t || 0;
  let leaving = false;
  let labelTimer, lastSave = 0;

  // Without ms the label stays on (like the bot's "¿Tenés dudas?" pill)
  function showLabel(html, ms) {
    label.innerHTML = html;
    wrap.classList.add('label-on');
    clearTimeout(labelTimer);
    if (ms) labelTimer = setTimeout(() => wrap.classList.remove('label-on'), ms);
  }
  function showIdle() {
    const text = window.innerWidth < 600 ? 'Escuchá nuestro tema' : 'Escuchá el tema oficial de ProMuebles';
    showLabel(text + ' <span class="pm-wave">🎵</span>');
  }
  function play() {
    if (resumeAt > 0 && audio.currentTime < 1) {
      try { audio.currentTime = resumeAt; } catch (e) {}
      audio.addEventListener('loadedmetadata', () => { if (audio.currentTime < 1) audio.currentTime = resumeAt; }, { once: true });
    }
    return audio.play();
  }

  btn.addEventListener('click', () => { if (audio.paused) play().catch(() => {}); else audio.pause(); });
  label.addEventListener('click', () => btn.click());

  // Only one tab plays at a time: if the song starts in another tab, pause it here
  const channel = 'BroadcastChannel' in window ? new BroadcastChannel('pmSong') : null;
  if (channel) channel.onmessage = () => { if (!audio.paused) audio.pause(); };

  audio.addEventListener('play', () => {
    if (channel) channel.postMessage('play');
    wrap.classList.add('playing');
    btn.setAttribute('aria-pressed', 'true');
    btn.setAttribute('aria-label', 'Pausar el tema');
    showLabel('Sonando · tocá para pausar', 4000);
  });
  audio.addEventListener('pause', () => {
    if (leaving) return;
    wrap.classList.remove('playing');
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('aria-label', 'Escuchar el tema de ProMuebles');
    if (!audio.ended) save({ t: audio.currentTime, playing: false });
    showIdle();
  });
  audio.addEventListener('timeupdate', () => {
    if (audio.currentTime > 0) resumeAt = audio.currentTime;
    const now = Date.now();
    if (now - lastSave > 1000) { lastSave = now; save({ t: resumeAt, playing: !audio.paused }); }
  });
  audio.addEventListener('ended', () => { resumeAt = 0; save({}); showIdle(); });

  window.addEventListener('pagehide', () => { leaving = true; save({ t: resumeAt, playing: !audio.paused }); });
  window.addEventListener('pageshow', () => { leaving = false; });

  // If a video with sound starts (hero, testimonials), pause the song so they don't overlap
  document.addEventListener('play', (e) => { if (e.target !== audio && !audio.paused) audio.pause(); }, true);

  // Was playing on the previous page: try to continue; browsers usually require a tap, so fall back to the label
  if (saved.playing && resumeAt > 0) {
    play().catch(showIdle);
  } else {
    setTimeout(() => { if (audio.paused) showIdle(); }, 1500);
  }
}
