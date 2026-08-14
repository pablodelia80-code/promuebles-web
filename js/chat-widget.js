(function () {
  const FOTOS = {
    Vale: 'https://randomuser.me/api/portraits/women/32.jpg',
    Cintia: 'https://randomuser.me/api/portraits/women/44.jpg',
    Lorena: 'https://randomuser.me/api/portraits/women/68.jpg',
    Euge: 'https://randomuser.me/api/portraits/women/21.jpg',
    Romi: 'https://randomuser.me/api/portraits/women/57.jpg',
  };
  const NOMBRES = Object.keys(FOTOS);

  function getNombreSesion() {
    let n = sessionStorage.getItem('pm_bot_nombre');
    if (!n || !NOMBRES.includes(n)) {
      n = NOMBRES[Math.floor(Math.random() * NOMBRES.length)];
      sessionStorage.setItem('pm_bot_nombre', n);
    }
    return n;
  }

  function getHistory() {
    try {
      return JSON.parse(sessionStorage.getItem('pm_bot_historial') || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveHistory(history) {
    sessionStorage.setItem('pm_bot_historial', JSON.stringify(history));
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  const nombre = getNombreSesion();
  const foto = FOTOS[nombre];

  const root = document.createElement('div');
  root.id = 'pm-chat-root';
  root.innerHTML = `
    <button class="pm-chat-toggle" id="pm-chat-toggle" aria-label="Abrir chat">
      <span class="pm-chat-pill">¿Tenés dudas? Preguntame <span class="pm-wave">👋</span></span>
      <span class="pm-bot-stage">
        <span class="pm-peek-bot"><span id="pm-peek-lottie" class="pm-lottie-box"></span></span>
        <span class="pm-chat-bubble-ic">
          <svg viewBox="0 0 24 24" width="26" height="26">
            <path d="M12 3C6.48 3 2 6.6 2 11c0 2.36 1.28 4.48 3.3 5.94-.1.9-.5 2.1-1.4 3.3a.4.4 0 00.44.62c1.85-.53 3.2-1.32 4.02-1.9.83.17 1.7.28 2.64.28 5.52 0 10-3.6 10-8s-4.48-8-10-8z" fill="#fff"/>
          </svg>
        </span>
      </span>
    </button>

    <div class="pm-chat-panel" id="pm-chat-panel" style="display:none">
      <div class="pm-chat-header">
        <img class="pm-chat-avatar" src="${foto}" alt="${nombre}">
        <div>
          <p class="pm-chat-name">${nombre}</p>
          <p class="pm-chat-status">ProMuebles</p>
        </div>
        <button class="pm-chat-close" id="pm-chat-close" aria-label="Cerrar">&#10005;</button>
      </div>
      <div class="pm-chat-messages" id="pm-chat-messages"></div>
      <form class="pm-chat-input-row" id="pm-chat-form">
        <input type="text" id="pm-chat-input" placeholder="Escribí tu pregunta..." autocomplete="off">
        <button type="submit" aria-label="Enviar">
          <svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
        </button>
      </form>
    </div>
  `;
  document.body.appendChild(root);

  function loadLottieLib() {
    return new Promise((resolve, reject) => {
      if (window.lottie) return resolve(window.lottie);
      const script = document.createElement('script');
      script.src = 'js/lottie.min.js';
      script.onload = () => resolve(window.lottie);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  loadLottieLib().then((lottie) => {
    lottie.loadAnimation({
      container: document.getElementById('pm-peek-lottie'),
      path: 'assets/bot/robot-wave.json',
      renderer: 'svg',
      loop: true,
      autoplay: true,
    });
  }).catch(() => {});

  const toggleBtn = document.getElementById('pm-chat-toggle');
  const panel = document.getElementById('pm-chat-panel');
  const closeBtn = document.getElementById('pm-chat-close');
  const messagesEl = document.getElementById('pm-chat-messages');
  const form = document.getElementById('pm-chat-form');
  const input = document.getElementById('pm-chat-input');

  let opened = false;

  function linkify(html) {
    return html.replace(/(https?:\/\/[^\s<]+|(?<![\w./])(?:productos|index|contacto|instalaciones|testimonios|quienes-somos)\.html\?[^\s<]+)/g, (url) => {
      const isAbsolute = /^https?:\/\//.test(url);
      const label = isAbsolute && url.includes('wa.me') ? 'Escribinos por WhatsApp' : 'Ver este modelo';
      return `<a href="${url}" target="_blank" rel="noopener" class="pm-msg-link">${label} &rarr;</a>`;
    });
  }

  function addMessage(role, text) {
    const div = document.createElement('div');
    div.className = 'pm-msg pm-msg-' + (role === 'user' ? 'user' : 'bot');
    div.innerHTML = linkify(escapeHtml(text).replace(/\n/g, '<br>'));
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addTyping() {
    const div = document.createElement('div');
    div.className = 'pm-msg pm-msg-bot pm-typing';
    div.id = 'pm-typing';
    div.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function removeTyping() {
    const el = document.getElementById('pm-typing');
    if (el) el.remove();
  }

  function renderExistingHistory() {
    const history = getHistory();
    if (history.length === 0) {
      addMessage('model', `¡Hola! Soy ${nombre}, de ProMuebles 👋 ¿En qué te puedo ayudar? Preguntame por medidas, precios, colores o envío.`);
      return;
    }
    history.forEach((h) => addMessage(h.role, h.text));
  }

  toggleBtn.addEventListener('click', () => {
    opened = !opened;
    panel.style.display = opened ? 'flex' : 'none';
    if (opened && messagesEl.childElementCount === 0) {
      renderExistingHistory();
    }
  });

  closeBtn.addEventListener('click', () => {
    opened = false;
    panel.style.display = 'none';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const texto = input.value.trim();
    if (!texto) return;
    input.value = '';
    input.disabled = true;

    addMessage('user', texto);
    const history = getHistory();
    history.push({ role: 'user', text: texto });

    addTyping();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: history.slice(0, -1),
          message: texto,
          sessionName: nombre,
        }),
      });
      const data = await res.json();
      removeTyping();

      if (data.error) {
        addMessage('model', 'Uy, tuve un problema para responder. ¿Podés escribirnos por WhatsApp mientras lo resolvemos? https://wa.me/5491168767075');
      } else {
        addMessage('model', data.reply);
        history.push({ role: 'model', text: data.reply });
      }
      saveHistory(history);
    } catch (err) {
      removeTyping();
      addMessage('model', 'Uy, no me pude conectar. Probá de nuevo en un rato.');
    } finally {
      input.disabled = false;
      input.focus();
    }
  });
})();
