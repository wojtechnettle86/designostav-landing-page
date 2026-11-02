/* Scroll-driven video frames with an eased playhead and a pinned header.
   Motion timing adapted from django-contimex. */
(() => {
  'use strict';
  const root = document.querySelector('.motion');
  // Keep navigation inside the sticky stage so it releases with the hero.
  root.querySelector('.stage').prepend(document.querySelector('.header'));
  const canvas = root.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const frames = new Map(), pending = new Set();
  let wanted = 0;
  const frameCount = 96;
  function loadFrame(index) {
    if (index < 0 || index >= frameCount || frames.has(index) || pending.has(index) || pending.size >= 4) return;
    pending.add(index);
    const image = new Image();
    image.onload = () => {
      pending.delete(index);
      frames.set(index, image);
      // Keep decoded memory bounded, retaining frames nearest the playhead.
      while (frames.size > 18) {
        const farthest = [...frames.keys()].sort((a,b) => Math.abs(b-wanted)-Math.abs(a-wanted))[0];
        frames.delete(farthest);
      }
      schedule();
    };
    image.onerror = () => { pending.delete(index); };
    image.src = `assets/motion-frames/frame-${String(index+1).padStart(3,'0')}.jpg?v=apartment-1`;
  }
  function drawFrame() {
    // Give the exterior approach more scroll space before entering the apartment.
    const filmProgress = progress < .32 ? progress / .32 * .25 : .25 + (progress - .32) / .68 * .75;
    wanted = Math.round(filmProgress * (frameCount-1));
    loadFrame(wanted);
    for (let offset=1; offset<=3; offset++) { loadFrame(wanted+offset); loadFrame(wanted-offset); }
    const nearest = [...frames.keys()].sort((a,b) => Math.abs(a-wanted)-Math.abs(b-wanted))[0];
    const image = frames.get(nearest);
    if (!image) return;
    const bounds = canvas.getBoundingClientRect();
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    const width = Math.round(bounds.width * ratio), height = Math.round(bounds.height * ratio);
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    const scale = Math.max(width/image.naturalWidth, height/image.naturalHeight);
    ctx.drawImage(image,(width-image.naturalWidth*scale)/2,(height-image.naturalHeight*scale)/2,image.naturalWidth*scale,image.naturalHeight*scale);
    canvas.dataset.frame = String(nearest);
    canvas.classList.add('ready');
  }
  const scenes = [...root.querySelectorAll('.scene')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const servicePhoto = document.querySelector('.service-photo');
  const projectPanels = [...document.querySelectorAll('.portfolio-panel')];
  const floatingInquiry = document.querySelector('.floating-inquiry');
  const contactSection = document.getElementById('poptavka');
  const revealTargets = document.querySelectorAll('.intro-grid h2, .intro-copy, .principles > div, .section-heading, .portfolio-intro h2, .portfolio-intro > p, .portfolio-title, .portfolio-footer, .service-content > *, .process-grid article, .process-note, .contact-grid > div, .contact form');
  if ('IntersectionObserver' in window && !reduced.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.replace('is-pending', 'is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {threshold: .08, rootMargin: '0px 0px -30px 0px'});
    revealTargets.forEach(node => {
      node.classList.add('reveal', 'is-pending');
      if (node.matches('.principles > div, .process-grid article')) {
        node.style.setProperty('--reveal-delay', `${[...node.parentElement.children].indexOf(node)*100}ms`);
      }
      observer.observe(node);
    });
    document.addEventListener('focusin', event => {
      const hidden = event.target.closest('.is-pending');
      if (hidden) { hidden.classList.replace('is-pending','is-visible'); observer.unobserve(hidden); }
    });
    reduced.addEventListener('change', () => {
      if (reduced.matches) { observer.disconnect(); revealTargets.forEach(node => node.classList.remove('is-pending')); }
    });
  }
  let progress = 0, scheduled = false, previous = null;
  const clamp = n => Math.max(0, Math.min(1, n));
  const smooth = n => { n = clamp(n); return n*n*n*(n*(n*6-15)+10); };
  function schedule() { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } }
  function update(time) {
    scheduled = false;
    const rect = root.getBoundingClientRect();
    if (floatingInquiry) {
      floatingInquiry.hidden = rect.bottom > 120 || contactSection.getBoundingClientRect().top < innerHeight * .85;
    }
    const stageHeight = root.querySelector('.stage').offsetHeight;
    const target = reduced.matches ? 0 : clamp(-rect.top / Math.max(1, root.offsetHeight - stageHeight));
    const elapsed = previous === null ? 16 : Math.min(64, time - previous);
    previous = time;
    if (!reduced.matches) {
      projectPanels.forEach(panel => {
        const bounds = panel.getBoundingClientRect();
        if (bounds.bottom > 0 && bounds.top < innerHeight) {
          const pan = Math.max(-35, Math.min(35, (innerHeight/2-bounds.top-bounds.height/2)*.065));
          panel.style.setProperty('--project-pan', `${pan}px`);
        }
      });
    }
    if (servicePhoto && !reduced.matches) {
      const photoRect = servicePhoto.getBoundingClientRect();
      if (photoRect.bottom > 0 && photoRect.top < innerHeight) {
        const amount = Math.max(-1, Math.min(1, (innerHeight/2-photoRect.top-photoRect.height/2)/innerHeight));
        servicePhoto.querySelector('img').style.transform = `translateY(${amount*24}px)`;
      }
    }
    progress += (target - progress) * (1 - Math.exp(-elapsed / 115));
    if (Math.abs(target - progress) < .0005) progress = target;
    else schedule();
    if (!reduced.matches) drawFrame();
    // Keep the final scene visible until the pinned stage is released.
    scenes.forEach((node, i) => {
      const local = progress * 2.65 - i;
      const fadeIn = i === 0 ? 1 : smooth((local + .25) / .45);
      const fadeOut = i === scenes.length - 1 ? 1 : 1 - smooth((local - .55) / .45);
      const opacity = fadeIn * fadeOut;
      node.style.opacity = opacity;
      node.style.transform = `translateY(${(1-fadeIn)*24-(1-fadeOut)*24}px)`;
      node.classList.toggle('active', opacity > .01);
      node.setAttribute('aria-hidden', String(opacity <= .01));
    });
    document.getElementById('scene-number').textContent = String(Math.min(3, Math.floor(progress * 2.65) + 1)).padStart(2, '0');
    root.querySelector('.progress').style.transform = `scaleX(${progress})`;
  }
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule);
  reduced.addEventListener('change', schedule);
  schedule();
  const form = document.getElementById('inquiry');
  let downloadURL;
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const fields = {typ:'Typ projektu',rozpocet:'Rozpočet',lokalita:'Lokalita',faze:'Fáze projektu',jmeno:'Jméno',email:'E-mail',telefon:'Telefon',termin:'Plánovaný začátek',zprava:'Záměr'};
    const body = 'Dobrý den, rád/a bych s vámi probral/a tento záměr.\n\n' + Object.entries(fields).map(([key,label]) => `${label}: ${data.get(key) || 'Neuvedeno'}`).join('\n');
    const subject = `Poptávka — ${data.get('typ')} — ${data.get('lokalita')}`;
    if (downloadURL) URL.revokeObjectURL(downloadURL);
    downloadURL = URL.createObjectURL(new Blob([body], {type:'text/plain;charset=utf-8'}));
    const download = document.getElementById('download-inquiry');
    download.href = downloadURL; download.download = 'poptavka-designostav.txt'; download.hidden = false;
    document.getElementById('form-status').textContent = 'Poptávka je připravená. Dokončete odeslání v poštovním programu. Pokud se neotevřel, stáhněte text a pošlete jej na info@designostav.cz.';
    location.href = `mailto:info@designostav.cz?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
})();
