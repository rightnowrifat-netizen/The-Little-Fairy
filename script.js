(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Scroll reveal ---------- */
  var rv = $$('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    rv.forEach(function (el, i) { el.style.transitionDelay = (i % 3) * 0.12 + 's'; io.observe(el); });
  } else { rv.forEach(function (el) { el.classList.add('in'); }); }

  /* ---------- Navigation ---------- */
  var burger = $('#burger'), links = $('#links');
  function closeMenu() { links.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
  burger.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var t = $(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      closeMenu();
    });
  });
  var navLinks = $$('.links a');
  if ('IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          navLinks.forEach(function (l) { l.classList.toggle('act', l.getAttribute('href') === '#' + e.target.id); });
        }
      });
    }, { threshold: 0.4 });
    ['home', 'about', 'dream', 'favorites', 'music', 'words', 'love'].forEach(function (id) { var s = document.getElementById(id); if (s) so.observe(s); });
  }

  /* ---------- Custom cursor (desktop only) ---------- */
  var cur = $('#cursor');
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.body.classList.add('has-cursor');
    document.addEventListener('mousemove', function (e) {
      cur.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
      cur.classList.add('on');
    });
    document.addEventListener('mouseleave', function () { cur.classList.remove('on'); });
    document.addEventListener('mouseover', function (e) {
      cur.classList.toggle('big', !!e.target.closest('a,button,.glass'));
    });
  }

  /* ---------- Particles ---------- */
  var cv = $('#fx'), ctx = cv.getContext('2d'), W, H, dpr, P = [], bursts = [];
  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function mk(heart) {
    return {
      x: Math.random() * W, y: Math.random() * H,
      r: heart ? 7 + Math.random() * 6 : 0.6 + Math.random() * 1.6,
      vy: -(0.08 + Math.random() * 0.25), vx: (Math.random() - 0.5) * 0.15,
      a: 0.15 + Math.random() * 0.5, ph: Math.random() * 6.28,
      heart: heart, gold: Math.random() < 0.3
    };
  }
  function seed() {
    P = [];
    var n = W < 700 ? 30 : 55;
    for (var i = 0; i < n; i++) P.push(mk(i % 14 === 0));
  }
  function draw(p, t) {
    var tw = p.a * (0.6 + 0.4 * Math.sin(t / 900 + p.ph));
    ctx.globalAlpha = tw;
    ctx.fillStyle = p.gold ? '#c9a45c' : '#f2c9d0';
    if (p.heart) {
      ctx.font = p.r + 'px serif'; ctx.textAlign = 'center';
      ctx.shadowColor = '#c9788a'; ctx.shadowBlur = 10;
      ctx.fillText('\u2665', p.x, p.y); ctx.shadowBlur = 0;
    } else {
      ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill(); ctx.shadowBlur = 0;
    }
  }
  function tick(t) {
    ctx.clearRect(0, 0, W, H);
    P.forEach(function (p) {
      p.x += p.vx + Math.sin(t / 2000 + p.ph) * 0.1; p.y += p.vy;
      if (p.y < -20) { p.y = H + 20; p.x = Math.random() * W; }
      draw(p, t);
    });
    bursts = bursts.filter(function (b) { return b.life > 0; });
    bursts.forEach(function (b) {
      b.x += b.vx; b.y += b.vy; b.vy -= 0.004; b.life -= 0.006;
      b.a = Math.max(b.life, 0) * 0.9; draw(b, t);
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(tick);
  }
  function burst(n) {
    for (var i = 0; i < n; i++) {
      var h = i % 3 === 0, ang = Math.random() * 6.283, sp = 0.6 + Math.random() * 2.2;
      bursts.push({ x: W / 2, y: H * 0.55, r: h ? 12 + Math.random() * 10 : 1.5 + Math.random() * 2,
        vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 0.8, a: 0.9, ph: 0, heart: h, gold: i % 4 === 0, life: 1 });
    }
  }
  size(); seed();
  window.addEventListener('resize', function () { size(); seed(); });
  if (!reduce) requestAnimationFrame(tick);

  /* ---------- Music (optional local file) ---------- */
  var mBtn = $('#musicBtn'), audio = null, playing = false, missing = false;
  mBtn.addEventListener('click', function () {
    if (missing) return;
    try {
      if (!audio) {
        audio = new Audio('audio/favorite-song.mp3');
        audio.loop = true; audio.preload = 'none';
        audio.addEventListener('error', function () {
          missing = true; playing = false;
          mBtn.textContent = '\uD83C\uDFB5'; mBtn.classList.remove('playing');
          mBtn.title = 'No audio file added yet'; mBtn.style.opacity = '.45';
        });
      }
      if (playing) {
        audio.pause(); playing = false;
        mBtn.textContent = '\uD83C\uDFB5'; mBtn.classList.remove('playing');
      } else {
        var pr = audio.play();
        playing = true; mBtn.textContent = '\uD83D\uDD0A'; mBtn.classList.add('playing');
        if (pr && pr.catch) pr.catch(function () {
          playing = false; mBtn.textContent = '\uD83C\uDFB5'; mBtn.classList.remove('playing');
        });
      }
    } catch (err) { missing = true; }
  });

  /* ---------- Love score ---------- */
  var loveBtn = $('#loveBtn'), score = $('#score'), inf = $('#inf'), busy = false;
  loveBtn.addEventListener('click', function () {
    if (busy) return; busy = true;
    score.classList.remove('show');
    loveBtn.classList.add('hide');
    var n = 0, steps = 0;
    inf.textContent = '0';
    score.classList.add('show');
    $('#infWord').style.visibility = 'hidden'; $('#infLine').style.visibility = 'hidden';
    var iv = setInterval(function () {
      steps++; n += Math.floor(Math.random() * 97) + 3;
      inf.textContent = n.toLocaleString();
      if (steps > 22) {
        clearInterval(iv);
        inf.textContent = '\u221E';
        $('#infWord').style.visibility = 'visible'; $('#infLine').style.visibility = 'visible';
        burst(46);
        loveBtn.textContent = 'Check Again \uD83D\uDC96'; loveBtn.classList.remove('hide'); busy = false;
      }
    }, 70);
    score.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
  });

  /* ---------- Final surprise ---------- */
  var ov = $('#overlay'), typeEl = $('#type'), endEl = $('#end'), timer = null;
  var msg = 'Minha,\n\nYou may never fully realize how deeply you are loved.\n\nBut if this little universe could say one thing for me, it would simply be this:\n\nYou are one of the most beautiful chapters my heart has ever written.\n\nAnd if life is a book, I hope your name stays somewhere in my favorite pages.\n\n\u2014 Redwan Rifat \u2764\uFE0F';
  function openFinal() {
    ov.classList.add('open'); ov.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    typeEl.textContent = ''; typeEl.classList.remove('done'); endEl.classList.remove('show');
    var i = 0, chars = Array.from(msg);
    clearTimeout(timer);
    (function next() {
      if (i >= chars.length) {
        typeEl.classList.add('done');
        timer = setTimeout(function () { endEl.classList.add('show'); burst(30); }, 1400);
        return;
      }
      var c = chars[i++]; typeEl.textContent += c;
      var d = reduce ? 4 : (c === '\n' ? 420 : /[,.:]/.test(c) ? 260 : 48);
      timer = setTimeout(next, d);
    })();
  }
  function closeFinal() {
    clearTimeout(timer); ov.classList.remove('open'); ov.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  $('#finalBtn').addEventListener('click', openFinal);
  $('#close').addEventListener('click', closeFinal);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeFinal(); });
})();
