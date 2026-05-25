// =================== NAV scroll ===================
const nav = document.querySelector('.nav');
const onScroll = () => {
  if (window.scrollY > 8) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// =================== Mobile menu ===================
const burger = document.querySelector('.burger');
const mobileMenu = document.querySelector('.mobile-menu');
if (burger) {
  burger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });
  mobileMenu.querySelectorAll('a, .btn').forEach(el => {
    el.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// =================== FAQ accordion ===================
document.querySelectorAll('.faq-item').forEach(item => {
  const q = item.querySelector('.faq-q');
  q.addEventListener('click', () => {
    const open = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(o => o.classList.remove('open'));
    if (!open) item.classList.add('open');
  });
});

// =================== FAQ categories ===================
document.querySelectorAll('.faq-cat').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.cat;
    document.querySelectorAll('.faq-cat').forEach(b => b.classList.toggle('active', b === btn));
    document.querySelectorAll('.faq-group').forEach(g => g.classList.toggle('active', g.dataset.cat === target));
  });
});

// =================== i18n ===================
// Cache the original RU innerHTML for every translatable element on first run.
// UZ keeps the RU content (no translation requested).
const i18nCache = new WeakMap();
function snapshotRU() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    if (!i18nCache.has(el)) i18nCache.set(el, el.innerHTML);
  });
}

function applyLang(lang) {
  snapshotRU();
  const dict = (lang === 'en') ? (window.TRANSLATIONS_EN || {}) : null;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (lang === 'en' && dict[key] != null) {
      el.innerHTML = dict[key];
    } else {
      // Restore RU (also used for UZ — no UZ translation per spec)
      el.innerHTML = i18nCache.get(el);
    }
  });

  // <html lang> — "uz" stays a valid attribute even though we keep RU text
  document.documentElement.setAttribute('lang', lang);

  // Sync all language button groups
  document.querySelectorAll('.lang, .mobile-lang').forEach(group => {
    group.querySelectorAll('button').forEach(b => {
      b.classList.toggle('active', b.textContent.trim().toLowerCase() === lang);
    });
  });

  // Re-run chat animation in the new language
  CURRENT_LANG = lang;
  runChat();
}

let CURRENT_LANG = 'ru';

// Wire up language buttons
document.querySelectorAll('.lang button, .mobile-lang button').forEach(btn => {
  btn.addEventListener('click', () => {
    const lang = btn.textContent.trim().toLowerCase();
    applyLang(lang);
  });
});

// =================== Animated hero chat ===================
const chatScripts = {
  ru: [
    { who: 'user', text: 'Привет! Хочу снять 2-комнатную квартиру в Ташкенте', delay: 600 },
    { who: 'typing', delay: 700 },
    { who: 'ai', text: 'Привет! Уже ищу по базе — уточним пару деталей?', delay: 800 },
    { who: 'user', text: 'Бюджет до $600, Юнусабадский или МУ', delay: 1000 },
    { who: 'typing', delay: 600 },
    { who: 'ai', text: 'Отлично — нашёл 3 варианта:', delay: 700, withCards: true },
  ],
  en: [
    { who: 'user', text: 'Hi! I want to rent a 2-bedroom apartment in Tashkent', delay: 600 },
    { who: 'typing', delay: 700 },
    { who: 'ai', text: 'Hi! Already searching the database — can we narrow down a few details?', delay: 800 },
    { who: 'user', text: 'Budget up to $600, Yunusabad or M-Ulugbek', delay: 1000 },
    { who: 'typing', delay: 600 },
    { who: 'ai', text: 'Great — found 3 options:', delay: 700, withCards: true },
  ],
};

const cardCopy = {
  ru: {
    t1: '2к · Амира Темура', m1: '9 эт. · Юнусабад · мебель', p1: '$550 / мес',
    t2: '2к · Мирзо-Улугбек', m2: 'ремонт 2023 · мебель', p2: '$580 / мес',
  },
  en: {
    t1: '2BR · Amir Temur', m1: '9th fl. · Yunusabad · furnished', p1: '$550 / mo',
    t2: '2BR · Mirzo-Ulugbek', m2: 'renovated 2023 · furnished', p2: '$580 / mo',
  },
};

let chatTimer = null;
function runChat() {
  const chat = document.querySelector('.tg-chat');
  if (!chat) return;
  if (chatTimer) { clearTimeout(chatTimer); chatTimer = null; }
  chat.innerHTML = '';
  const lang = (CURRENT_LANG === 'en') ? 'en' : 'ru'; // uz uses ru
  const script = chatScripts[lang];
  const cc = cardCopy[lang];
  let i = 0;
  function step() {
    if (i >= script.length) {
      chatTimer = setTimeout(runChat, 4000);
      return;
    }
    const s = script[i];
    if (s.who === 'typing') {
      const el = document.createElement('div');
      el.className = 'msg ai typing-msg';
      el.innerHTML = '<span class="typing"><span></span><span></span><span></span></span>';
      chat.appendChild(el);
      chatTimer = setTimeout(() => {
        el.remove();
        i++;
        step();
      }, s.delay);
    } else {
      const el = document.createElement('div');
      el.className = 'msg ' + s.who;
      el.innerHTML = `${s.text}<span class="time">${formatTime(i)}</span>`;
      chat.appendChild(el);
      if (s.withCards) {
        const card = document.createElement('div');
        card.className = 'msg ai';
        card.innerHTML = `
          <div class="property-card">
            <div class="pic"></div>
            <div class="info">
              <div class="title">${cc.t1}</div>
              <div class="meta">${cc.m1}</div>
              <div class="price">${cc.p1}</div>
            </div>
            <span class="match">98%</span>
          </div>
          <div class="property-card" style="margin-top:6px">
            <div class="pic" style="background:linear-gradient(135deg,oklch(0.86 0.06 65),oklch(0.78 0.09 50))"></div>
            <div class="info">
              <div class="title">${cc.t2}</div>
              <div class="meta">${cc.m2}</div>
              <div class="price">${cc.p2}</div>
            </div>
            <span class="match">91%</span>
          </div>
          <span class="time">${formatTime(i)}</span>
        `;
        setTimeout(() => chat.appendChild(card), 300);
      }
      requestAnimationFrame(() => chat.scrollTop = chat.scrollHeight);
      i++;
      chatTimer = setTimeout(step, s.delay);
    }
  }
  step();
}

function formatTime(i) {
  const s = (20 + i * 7) % 60;
  return `14:${String(s).padStart(2, '0')}`;
}

window.addEventListener('load', () => {
  // Snapshot RU before anything else may touch DOM
  snapshotRU();
  setTimeout(runChat, 600);
});

// =================== Animated metrics ===================
const metrics = document.querySelectorAll('.metric .value[data-target]');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseFloat(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      let cur = 0;
      const dur = 1200;
      const start = performance.now();
      function tick(t) {
        const p = Math.min(1, (t - start) / dur);
        const e = 1 - Math.pow(1 - p, 3);
        cur = target * e;
        const display = Number.isInteger(target) ? Math.round(cur) : cur.toFixed(1);
        el.textContent = prefix + display + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      io.unobserve(el);
    }
  });
}, { threshold: 0.3 });
metrics.forEach(m => io.observe(m));

// =================== Funnel bars ===================
const funnels = document.querySelectorAll('[data-funnel]');
const fio = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const bars = entry.target.querySelectorAll('.fill');
      bars.forEach((bar, i) => {
        const w = bar.dataset.w;
        setTimeout(() => { bar.style.width = w + '%'; }, i * 80);
      });
      fio.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });
funnels.forEach(f => fio.observe(f));
