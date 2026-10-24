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
        <a href="tel:0760284310" class="btn">Ring 076-028 43 10</a>
        <a href="/kontakt/" class="btn btn-secondary">Boka tid</a>
      `;
      document.body.appendChild(bar);
    }
  }
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