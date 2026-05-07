fetch('/nav.html')
  .then(r => r.text())
  .then(html => {
    document.getElementById('nav-placeholder').innerHTML = html;
    const page = '/' + location.pathname.split('/').filter(Boolean).join('/') + '/';
    document.querySelectorAll('#nav-placeholder .nav-links a').forEach(a => {
      if (a.getAttribute('href') === page) a.classList.add('active');
    });
  });