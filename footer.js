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
  }
}
customElements.define('site-footer', SiteFooter);