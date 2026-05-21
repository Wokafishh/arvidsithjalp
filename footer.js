class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <style>
        site-footer {
          display: block;
          border-top: 1.5px solid #d4eded;
          padding: 28px 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem;
          color: #445566;
        }

        site-footer a {
          color: #023154;
          text-decoration: none;
          font-weight: 500;
        }

        site-footer a:hover {
          text-decoration: underline;
        }

        site-footer .footer-links {
          display: flex;
          gap: 20px;
        }

        @media (max-width: 768px) {
          site-footer {
            padding: 24px 20px;
            flex-direction: column;
            align-items: flex-start;
          }
        }
      </style>

      <span>© ${new Date().getFullYear()} Arvids IT-hjälp</span>
      <nav class="footer-links">
        <a href="/integritet/">Integritetspolicy</a>
        <a href="/pris/">Priser</a>
        <a href="/kontakt/">Kontakta mig</a>
      </nav>
    `;
  }
}

customElements.define('site-footer', SiteFooter);