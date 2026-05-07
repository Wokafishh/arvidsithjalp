// Loads nav.html into any element with id="nav-placeholder"
// and marks the current page's link as active.
fetch('nav.html')
  .then(r => r.text())
  .then(html => {
    document.getElementById('nav-placeholder').innerHTML = html;

    // Highlight the active link based on current filename
    const page = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('#nav-placeholder .nav-links a').forEach(a => {
      if (a.getAttribute('href') === page) a.classList.add('active');
    });
  });