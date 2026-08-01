/* ===== LANGUAGE ===== */
function getLang(){
  const q = new URLSearchParams(location.search).get('lang');
  if (q === 'ar' || q === 'en') return q;
  const stored = localStorage.getItem('ah_lang');
  return stored === 'ar' ? 'ar' : 'en';
}

function applyLang(lang, updateUrl){
  const html = document.documentElement;
  html.lang = lang;
  html.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-en]').forEach(el=>{
    el.innerHTML = el.getAttribute(lang === 'ar' ? 'data-ar' : 'data-en');
  });
  const btn = document.getElementById('langBtn');
  if (btn) btn.textContent = lang === 'ar' ? 'EN' : 'عربي';
  const titleEl = document.querySelector('title[data-en]');
  if (titleEl) document.title = titleEl.getAttribute(lang === 'ar' ? 'data-ar' : 'data-en');
  localStorage.setItem('ah_lang', lang);

  if (updateUrl) {
    const url = new URL(location.href);
    url.searchParams.set('lang', lang);
    history.replaceState(null, '', url);
  }
  // keep internal nav links carrying the current language
  document.querySelectorAll('a[href$=".html"], a[href*=".html?"], a[href*=".html#"]').forEach(a=>{
    try{
      const u = new URL(a.getAttribute('href'), location.href);
      u.searchParams.set('lang', lang);
      a.setAttribute('href', u.pathname + u.search + u.hash);
    }catch(e){}
  });
}

function toggleLang(){
  const next = document.documentElement.lang === 'ar' ? 'en' : 'ar';
  applyLang(next, true);
}

document.addEventListener('DOMContentLoaded', ()=>{
  applyLang(getLang(), false);

  /* ===== MOBILE NAV ===== */
  const burger = document.getElementById('navBurger');
  const links = document.getElementById('navLinks');
  if (burger && links) {
    burger.addEventListener('click', ()=> links.classList.toggle('open'));
    links.querySelectorAll('a').forEach(a=> a.addEventListener('click', ()=> links.classList.remove('open')));
  }

  /* ===== ACTIVE NAV LINK ===== */
  const page = document.body.getAttribute('data-page');
  if (page) {
    document.querySelectorAll('.nav-links a[data-page]').forEach(a=>{
      if (a.getAttribute('data-page') === page) a.classList.add('active');
    });
  }

  /* ===== RESULTS CAROUSEL ===== */
  const carousel = document.getElementById('resultsCarousel');
  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('.rc-slide'));
    const dots = Array.from(carousel.querySelectorAll('.rc-dot'));
    let idx = 0;
    let timer = null;

    function show(i){
      slides.forEach((s, n)=>{
        const isActive = n === i;
        s.classList.toggle('active', isActive);
        const media = s.querySelector('img, video');
        if (media) {
          media.style.animation = 'none';
          void media.offsetWidth;
          media.style.animation = '';
        }
        const video = s.querySelector('video');
        if (video) {
          if (isActive) { video.currentTime = 0; video.play().catch(()=>{}); }
          else video.pause();
        }
      });
      dots.forEach((d, n)=> d.classList.toggle('active', n === i));
    }

    function next(){ idx = (idx + 1) % slides.length; show(idx); }
    function startTimer(){ clearInterval(timer); timer = setInterval(next, 4200); }

    show(0);
    const rio = new IntersectionObserver(entries=>{
      entries.forEach(e=>{ if (e.isIntersecting) startTimer(); else clearInterval(timer); });
    }, {threshold:.3});
    rio.observe(carousel);

    dots.forEach((d, n)=> d.addEventListener('click', ()=>{ idx = n; show(idx); startTimer(); }));
  }

  /* ===== REVEAL ON SCROLL ===== */
  const io = new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target);} });
  },{threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

  /* ===== ANIMATED COUNTERS ===== */
  const counters = document.querySelectorAll('[data-count]');
  const cio = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if (!e.isIntersecting) return;
      cio.unobserve(e.target);
      const el = e.target;
      const target = parseFloat(el.getAttribute('data-count'));
      const suffix = el.getAttribute('data-suffix') || '';
      const dur = 1400;
      const start = performance.now();
      function tick(now){
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  },{threshold:.4});
  counters.forEach(el=>cio.observe(el));

  /* ===== TERMINAL TYPING ===== */
  const term = document.querySelector('.terminal-body');
  if (term) {
    const script = JSON.parse(term.getAttribute('data-script'));
    const lineEls = Array.from(term.querySelectorAll('.line'));
    let running = false;

    async function typeLine(el, text){
      el.style.opacity = 1;
      const textNode = document.createTextNode('');
      const cursor = document.createElement('span');
      cursor.className = 'cursor';
      el.appendChild(textNode);
      el.appendChild(cursor);
      for (const ch of text) {
        textNode.textContent += ch;
        await new Promise(r=>setTimeout(r, 26));
      }
      await new Promise(r=>setTimeout(r, 260));
      cursor.remove();
    }

    async function playScript(){
      if (running) return;
      running = true;
      lineEls.forEach(el=>{ el.style.opacity = 0; const t = el.querySelector('.prompt'); el.innerHTML=''; if(t) el.appendChild(t); });
      for (let i = 0; i < lineEls.length && i < script.length; i++) {
        await typeLine(lineEls[i], script[i]);
      }
      running = false;
    }

    const tio = new IntersectionObserver(entries=>{
      entries.forEach(e=>{ if (e.isIntersecting) playScript(); });
    },{threshold:.5});
    tio.observe(term);
  }
});
