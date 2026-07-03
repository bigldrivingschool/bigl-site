// ── Component loader ──
(function () {
  function loadPartial(id, file, onLoad) {
    var el = document.getElementById(id);
    if (!el) return;
    fetch('/' + file)
      .then(function (r) { return r.text(); })
      .then(function (html) {
        el.outerHTML = html;
        if (onLoad) onLoad();
      })
      .catch(function () {});
  }

  function bindNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('nav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('nav--open');
      toggle.setAttribute('aria-expanded', isOpen);
    });
    nav.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('nav--open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target) && !toggle.contains(e.target)) {
        nav.classList.remove('nav--open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function highlightNav() {
    var path = window.location.pathname.replace(/\/$/, '') || '/';
    document.querySelectorAll('.nav__link').forEach(function (link) {
      var href = link.getAttribute('href');
      if ((href === '/' && path === '/') || (href !== '/' && path.includes(href.replace('.html', '')))) {
        link.classList.add('nav__link--active');
      }
    });
  }

  loadPartial('site-header', '_header.html', function () {
    bindNav();
    highlightNav();
  });

  loadPartial('site-footer', '_footer.html');
  loadPartial('site-pricing', '_pricing.html');
})();
