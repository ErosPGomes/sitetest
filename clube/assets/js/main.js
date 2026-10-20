/* =========================================================================
   FAUNA PET — interações do site
   ========================================================================= */
(function () {
  'use strict';

  /* ---------- HEADER: esconde ao rolar, reaparece no topo ---------- */
  var header = document.querySelector('.site-header');
  var ultimoY = window.scrollY;
  var travado = false;

  function aoRolar() {
    var y = window.scrollY;
    if (!header) return;
    header.classList.toggle('rolado', y > 8);
    if (travado) return;
    if (y > ultimoY && y > 260) header.classList.add('oculto');
    else header.classList.remove('oculto');
    ultimoY = y;
  }
  window.addEventListener('scroll', aoRolar, { passive: true });

  /* ---------- MENU MOBILE ---------- */
  var menu = document.querySelector('.menu-mobile');
  var abrir = document.querySelector('.btn-menu');
  var fechar = document.querySelector('.menu-mobile-topo button');

  function alternarMenu(estado) {
    if (!menu) return;
    menu.classList.toggle('aberto', estado);
    document.body.style.overflow = estado ? 'hidden' : '';
    travado = estado;
    if (estado) header && header.classList.remove('oculto');
  }
  abrir && abrir.addEventListener('click', function () { alternarMenu(true); });
  fechar && fechar.addEventListener('click', function () { alternarMenu(false); });
  menu && menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { alternarMenu(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') alternarMenu(false);
  });

  /* ---------- REVEAL AO ROLAR ---------- */
  var alvos = document.querySelectorAll('.reveal, .reveal-stagger');
  if ('IntersectionObserver' in window && alvos.length) {
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        if (e.target.classList.contains('reveal-stagger')) {
          setTimeout(function () { e.target.classList.add('settled'); }, 1100);
        }
        obs.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    alvos.forEach(function (el) { obs.observe(el); });
  } else {
    alvos.forEach(function (el) { el.classList.add('in', 'settled'); });
  }

  /* ---------- CONTADORES ---------- */
  function animarNumero(el) {
    var alvo = parseFloat(el.dataset.num);
    var dec = parseInt(el.dataset.dec || '0', 10);
    var dur = 1400;
    var ini = performance.now();
    function passo(agora) {
      var p = Math.min((agora - ini) / dur, 1);
      var v = alvo * (1 - Math.pow(1 - p, 3));
      el.textContent = v.toFixed(dec).replace('.', ',');
      if (p < 1) requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
    // trava o valor final mesmo se a aba for suspensa
    setTimeout(function () {
      el.textContent = alvo.toFixed(dec).replace('.', ',');
    }, dur + 80);
  }
  var nums = document.querySelectorAll('[data-num]');
  if ('IntersectionObserver' in window && nums.length) {
    var obsN = new IntersectionObserver(function (ent) {
      ent.forEach(function (e) {
        if (!e.isIntersecting) return;
        animarNumero(e.target);
        obsN.unobserve(e.target);
      });
    }, { threshold: 0.4 });
    nums.forEach(function (n) { obsN.observe(n); });
  } else {
    nums.forEach(function (n) {
      n.textContent = parseFloat(n.dataset.num).toFixed(parseInt(n.dataset.dec || '0', 10)).replace('.', ',');
    });
  }

  /* ---------- CONSENTIMENTO (LGPD) ---------- */
  var banner = document.querySelector('.cookie');
  var aceitar = document.querySelector('.cookie .btn');
  try {
    if (banner && !localStorage.getItem('fp_consent')) banner.hidden = false;
  } catch (e) { /* storage bloqueado */ }
  aceitar && aceitar.addEventListener('click', function () {
    try { localStorage.setItem('fp_consent', '1'); } catch (e) {}
    banner.hidden = true;
  });

  /* ---------- ANO NO RODAPÉ ---------- */
  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();
})();

/* =========================================================================
   TAGS DE MARKETING — carregadas fora do caminho crítico
   (primeira interação OU 3s depois do load; o que vier primeiro)
   ========================================================================= */
(function () {
  'use strict';
  var carregado = false;

  function carregarTags() { return; /* cópia de teste: rastreamento desligado */
    if (carregado) return;
    carregado = true;

    // Google Tag Manager
    (function (w, d, s, l, i) {
      w[l] = w[l] || []; w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      var f = d.getElementsByTagName(s)[0], j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : '';
      j.async = true; j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
      f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', 'GTM-MZB38MJG');

    // Google Ads (gtag)
    var g = document.createElement('script');
    g.async = true;
    g.src = 'https://www.googletagmanager.com/gtag/js?id=AW-11363917086';
    document.head.appendChild(g);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', 'AW-11363917086');

    // Meta Pixel
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', '888114607645559');
    window.fbq('track', 'PageView');
  }

  ['scroll', 'mousemove', 'touchstart', 'keydown', 'pointerdown'].forEach(function (ev) {
    window.addEventListener(ev, carregarTags, { once: true, passive: true });
  });
  window.addEventListener('load', function () { setTimeout(carregarTags, 3000); });
})();

/* =========================================================================
   CONVERSAO - clique no WhatsApp (Google Ads + Meta)
   ========================================================================= */
(function () {
  'use strict';
  document.addEventListener('click', function (ev) {
    var t = ev.target;
    var a = t && t.closest ? t.closest('a[href*="wa.me"], a[href*="api.whatsapp.com"]') : null;
    if (!a) return;
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', {
        send_to: 'AW-11363917086/6BU_CNa6pqQaEJ663qoq',
        value: 1.0,
        currency: 'BRL'
      });
    }
    if (typeof window.fbq === 'function') { window.fbq('track', 'Contact'); }
  }, true);
})();
