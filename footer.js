class SiteFooter extends HTMLElement {
  connectedCallback() {
    // Guard against re-render on reconnect
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';

    this.innerHTML = `
      <span class="footer-copy">© ${new Date().getFullYear()} Arvids IT-hjälp</span>
      <nav class="footer-links">
        <a href="/integritet/">Integritetspolicy</a>
        <a href="/pris/">Priser</a>
        <a href="/kontakt/">Kontakta mig</a>
      </nav>
    `;

    this.updateFooterLayout();
    requestAnimationFrame(() => this.updateFooterLayout());
    window.addEventListener('DOMContentLoaded', () => this.updateFooterLayout());
    window.addEventListener('load', () => this.updateFooterLayout());
    window.addEventListener('resize', () => this.updateFooterLayout());
    window.addEventListener('scroll', () => this.updateFooterLayout(), { passive: true });
  }

  updateFooterLayout() {
    const footerHeight = this.offsetHeight || 0;
    document.documentElement.style.setProperty('--footer-height', `${footerHeight}px`);

    const pageShell = document.querySelector('.page-shell');
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const shellHeight = pageShell ? pageShell.getBoundingClientRect().height : 0;
    const isShortPage = shellHeight <= viewportHeight + 2;

    document.body.classList.toggle('short-page', isShortPage);
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