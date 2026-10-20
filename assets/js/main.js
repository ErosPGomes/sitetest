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


  /* ---------- CARROSSEL (espécies) ---------- */
  document.querySelectorAll('.carrossel').forEach(function (car) {
    var pista = car.querySelector('.carrossel-pista');
    var ant = car.querySelector('.carrossel-nav--ant');
    var prox = car.querySelector('.carrossel-nav--prox');
    if (!pista) return;

    var intervalo = parseInt(car.dataset.auto || '0', 10);
    var timer = null, pausado = false;
    var reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function larguraItem() {
      var item = pista.firstElementChild;
      if (!item) return pista.clientWidth;
      var gap = parseFloat(getComputedStyle(pista).columnGap) || 16;
      return item.getBoundingClientRect().width + gap;
    }
    function passo() {
      var l = larguraItem();
      var cabem = Math.max(1, Math.floor(pista.clientWidth / l) - 1);
      return l * cabem;
    }
    function fim() { return pista.scrollWidth - pista.clientWidth - 2; }
    function atualizar() {
      if (ant) ant.disabled = pista.scrollLeft <= 2;
      if (prox) prox.disabled = pista.scrollLeft >= fim();
    }
    function mover(dir) {
      pista.scrollBy({ left: dir * passo(), behavior: 'smooth' });
    }

    ant && ant.addEventListener('click', function () { parar(); mover(-1); });
    prox && prox.addEventListener('click', function () { parar(); mover(1); });
    pista.addEventListener('scroll', atualizar, { passive: true });
    window.addEventListener('resize', atualizar, { passive: true });

    /* avanço automático: anda um item por vez e volta ao início no fim */
    function tique() {
      if (pausado || document.hidden) return;
      if (pista.scrollLeft >= fim()) pista.scrollTo({ left: 0, behavior: 'smooth' });
      else pista.scrollBy({ left: larguraItem(), behavior: 'smooth' });
    }
    function comecar() {
      if (!intervalo || reduzido || timer) return;
      timer = setInterval(tique, intervalo);
    }
    function parar() { if (timer) { clearInterval(timer); timer = null; } }

    ['mouseenter', 'focusin', 'touchstart', 'pointerdown'].forEach(function (ev) {
      car.addEventListener(ev, function () { pausado = true; }, { passive: true });
    });
    ['mouseleave', 'focusout'].forEach(function (ev) {
      car.addEventListener(ev, function () { pausado = false; }, { passive: true });
    });

    /* só roda enquanto o carrossel está visível na tela */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (ents) {
        ents.forEach(function (e) { e.isIntersecting ? comecar() : parar(); });
      }, { threshold: 0.25 }).observe(car);
    } else { comecar(); }

    atualizar();
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

/* =========================================================================
   VÍDEO DA ESTRUTURA — toca mudo ao entrar na tela, pausa ao sair;
   o fundo desfocado acompanha o vídeo principal.
   ========================================================================= */
(function () {
  'use strict';
  var faixa = document.querySelector('.filme');
  if (!faixa) return;
  var video = faixa.querySelector('.filme-video');
  var fundo = faixa.querySelector('.filme-ambiente');
  var btnPlay = faixa.querySelector('.filme-play');
  var btnSom = faixa.querySelector('.filme-som');
  var barra = faixa.querySelector('.filme-barra i');
  var reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pausadoPeloUsuario = reduzido;
  var visivel = false;

  video.removeAttribute('controls'); // sem JS, ficam os controles nativos

  function tocar() {
    var p = video.play();
    if (p && p.catch) p.catch(function () {});
  }
  function sincronizarFundo() {
    if (!fundo || !fundo.duration) return;
    var alvo = video.currentTime % fundo.duration;
    if (Math.abs(fundo.currentTime - alvo) > 0.35) fundo.currentTime = alvo;
  }
  function icone(btn, id) { btn.querySelector('use').setAttribute('href', id); }

  video.addEventListener('play', function () {
    faixa.classList.add('ativo');
    icone(btnPlay, '#ic-pause');
    btnPlay.setAttribute('aria-label', 'Pausar vídeo');
    if (fundo) { sincronizarFundo(); var p = fundo.play(); if (p && p.catch) p.catch(function () {}); }
  });
  video.addEventListener('pause', function () {
    faixa.classList.remove('ativo');
    icone(btnPlay, '#ic-play');
    btnPlay.setAttribute('aria-label', 'Reproduzir vídeo');
    if (fundo) fundo.pause();
  });
  video.addEventListener('seeked', sincronizarFundo);
  video.addEventListener('timeupdate', function () {
    if (video.duration) barra.style.transform = 'scaleX(' + (video.currentTime / video.duration) + ')';
    sincronizarFundo();
  });

  function alternarPlay() {
    if (video.paused) { pausadoPeloUsuario = false; tocar(); }
    else { pausadoPeloUsuario = true; video.pause(); }
  }
  btnPlay.addEventListener('click', alternarPlay);
  video.addEventListener('click', alternarPlay);

  btnSom.addEventListener('click', function () {
    video.muted = !video.muted;
    var ligado = !video.muted;
    btnSom.classList.toggle('on', ligado);
    btnSom.setAttribute('aria-pressed', ligado ? 'true' : 'false');
    btnSom.setAttribute('aria-label', ligado ? 'Desativar som' : 'Ativar som');
    icone(btnSom, ligado ? '#ic-som' : '#ic-mudo');
    if (ligado && video.paused) { pausadoPeloUsuario = false; tocar(); }
  });

  if (reduzido) { icone(btnPlay, '#ic-play'); btnPlay.setAttribute('aria-label', 'Reproduzir vídeo'); }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (ent) {
      ent.forEach(function (e) {
        visivel = e.isIntersecting && e.intersectionRatio >= 0.4;
        if (visivel && !pausadoPeloUsuario) tocar();
        else if (!visivel && !video.paused) video.pause();
      });
    }, { threshold: [0, 0.4] }).observe(video);
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) video.pause();
    else if (visivel && !pausadoPeloUsuario) tocar();
  });
})();
