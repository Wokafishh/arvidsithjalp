class SiteFooter extends HTMLElement {
  connectedCallback() {
    // Guard against re-render on reconnect
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';

    this.innerHTML = `
      <span class="footer-copy">© ${new Date().getFullYear()} Arvids IT-hjälp</span>
      <nav class="footer-links" aria-label="Sidfot">
        <a href="/integritet/">Integritetspolicy</a>
        <a href="/pris/">Priser</a>
        <a href="/kontakt/">Kontakta mig</a>
      </nav>
    `;

    // Sticky call/book bar on phones (hidden by CSS on desktop and on the contact page)
    if (!location.pathname.startsWith('/kontakt')) {
      const bar = document.createElement('div');
      bar.className = 'call-bar';
      bar.innerHTML = `
        <a href="tel:0760284310" class="btn">Ring nu <span class="btn-number">076-028 43 10</span></a>
        <a href="/kontakt/" class="btn btn-secondary">Boka tid</a>
      `;
      document.body.appendChild(bar);
      watchPageCtas(bar);
    }
  }
}

// Hide the call bar while the page's own call/book buttons are visible, so they never double up
function watchPageCtas(bar) {
  const ctas = [...document.querySelectorAll('.btn[href^="tel:"], .btn[href="/kontakt/"]')]
    .filter((el) => !bar.contains(el));
  if (!ctas.length || !('IntersectionObserver' in window)) return;

  const visible = new Set();
  const setHidden = (hidden) => {
    bar.classList.toggle('is-hidden', hidden);
    bar.inert = hidden;
  };
  setHidden(true);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    });
    setHidden(visible.size > 0);
  });
  ctas.forEach((el) => observer.observe(el));
}

function revealImages() {
  document.querySelectorAll('img').forEach((img) => {
    if (img.dataset.imageReady === 'true') return;

    const markReady = () => {
      if (img.dataset.imageReady === 'true') return;
      img.classList.add('is-loaded');
      img.dataset.imageReady = 'true';
    };

    if (img.complete && img.naturalWidth > 0) {
      markReady();
      return;
    }

    const handleError = () => {
      markReady();
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };

    const handleLoad = () => {
      markReady();
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };

    img.addEventListener('load', handleLoad, { once: true });
    img.addEventListener('error', handleError, { once: true });

    if (typeof img.decode === 'function') {
      img.decode().then(markReady).catch(handleError);
    }
  });
}

window.addEventListener('DOMContentLoaded', revealImages);
window.addEventListener('load', revealImages);
customElements.define('site-footer', SiteFooter);
// Mobile menu: hamburger toggles it; tapping outside or Esc closes it
function setupNavMenu() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  const setOpen = (open) => {
    toggle.classList.toggle('open', open);
    links.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };

  toggle.addEventListener('click', () => setOpen(!links.classList.contains('open')));
  document.addEventListener('click', (event) => {
    if (links.classList.contains('open') && !event.target.closest('.nav-links, .nav-toggle')) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && links.classList.contains('open')) {
      setOpen(false);
      toggle.focus();
    }
  });

  links.querySelectorAll('a.active').forEach((a) => a.setAttribute('aria-current', 'page'));
}

// Desktop: the active-page bar starts sliding the moment a link is clicked, and the next page
// continues the same slide. Position is a function of time since the click, so both pages agree.
function setupNavIndicator() {
  const links = document.querySelector('.nav-links');
  const active = links && links.querySelector('a.active');
  if (!links) return;
  const storageKey = 'arvids-nav-indicator';
  const duration = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 300;
  const ease = (p) => 1 - Math.pow(1 - p, 3);

  const indicator = document.createElement('span');
  indicator.className = 'nav-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  links.appendChild(indicator);

  const measure = (a) => {
    const box = links.getBoundingClientRect();
    const r = a.getBoundingClientRect();
    // Rects include the page zoom (1.1 on desktop) but CSS lengths get zoomed again, so divide it out
    const zoom = box.width / links.offsetWidth || 1;
    return { x: (r.left - box.left) / zoom + 14, w: r.width / zoom - 28 };
  };
  const place = (pos) => {
    indicator.style.left = `${pos.x}px`;
    indicator.style.width = `${pos.w}px`;
  };

  // Slide from `from` towards `toLink`, timed from `start` (ms since epoch). The target is
  // re-measured every frame, so it also follows the links shifting when the web font loads.
  let frame = 0;
  let sliding = false;
  const slide = (from, toLink, start) => {
    cancelAnimationFrame(frame);
    sliding = true;
    const step = () => {
      const to = measure(toLink);
      const p = duration ? Math.min(1, (Date.now() - start) / duration) : 1;
      const k = ease(p);
      place({ x: from.x + (to.x - from.x) * k, w: from.w + (to.w - from.w) * k });
      if (p < 1) frame = requestAnimationFrame(step);
      else sliding = false;
    };
    step();
  };

  const rest = () => {
    cancelAnimationFrame(frame);
    sliding = false;
    if (active) place(measure(active));
    indicator.style.opacity = active ? '' : '0';
  };

  let incoming = null;
  try {
    incoming = JSON.parse(sessionStorage.getItem(storageKey));
    sessionStorage.removeItem(storageKey);
  } catch (error) {}

  if (active && incoming && incoming.vw === window.innerWidth && Date.now() - incoming.start < 3000) {
    slide(incoming.from, active, incoming.start);
  } else {
    rest();
  }

  window.addEventListener('resize', rest);
  // Link widths change when the web font arrives; re-align unless a slide is already tracking it
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(() => {
      if (!sliding) rest();
    });
    observer.observe(links);
    links.querySelectorAll('a').forEach((a) => observer.observe(a));
  }
  // Back/forward cache restores this page as it was mid-slide, so put the bar back
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) rest();
  });

  links.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', (event) => {
      if (!active || a === active) return;
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const from = measure(active);
      const start = Date.now();
      try {
        sessionStorage.setItem(storageKey, JSON.stringify({ from, start, vw: window.innerWidth }));
      } catch (error) {}
      slide(from, a, start);
    });
  });
}

// Nav border/shadow only when the page isn't scrolled all the way up
function setupNavScrollState() {
  const nav = document.querySelector('.page-shell > nav');
  if (!nav) return;
  const update = () => nav.classList.toggle('is-scrolled', window.scrollY > 0);
  update();
  window.addEventListener('scroll', update, { passive: true });
}

setupNavMenu();
setupNavIndicator();
setupNavScrollState();
