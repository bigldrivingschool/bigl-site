// ── Mobile nav toggle ──
(function () {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', function () {
    const isOpen = nav.classList.toggle('nav--open');
    toggle.setAttribute('aria-expanded', isOpen);
  });

  // Close nav when clicking a link
  nav.querySelectorAll('.nav__link').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('nav--open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close nav when clicking outside
  document.addEventListener('click', function (e) {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) {
      nav.classList.remove('nav--open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
})();

// ── Highlight active nav link based on current page ──
(function () {
  var path = window.location.pathname.replace(/\/$/, '') || '/';
  var links = document.querySelectorAll('.nav__link');
  links.forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === '/' && path === '/') {
      link.classList.add('nav__link--active');
    } else if (href !== '/' && path.includes(href.replace('.html', ''))) {
      link.classList.add('nav__link--active');
    }
  });
})();

// ── Component loader ──
(function () {
  function insertHTML(id, html) {
    var el = document.getElementById(id);
    if (el) el.outerHTML = html;
  }

  // Load header
  var headerEl = document.getElementById('site-header');
  if (headerEl) {
    fetch('/_header.html')
      .then(function (r) { return r.text(); })
      .then(function (html) { insertHTML('site-header', html); })
      .then(function () {
        // Re-bind nav toggle after header is injected
        var toggle = document.querySelector('.nav-toggle');
        var nav = document.getElementById('nav');
        if (toggle && nav) {
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
        // Re-highlight active link
        var path = window.location.pathname.replace(/\/$/, '') || '/';
        var links = document.querySelectorAll('.nav__link');
        links.forEach(function (link) {
          var href = link.getAttribute('href');
          if (href === '/' && path === '/') {
            link.classList.add('nav__link--active');
          } else if (href !== '/' && path.includes(href.replace('.html', ''))) {
            link.classList.add('nav__link--active');
          }
        });
      })
      .catch(function () { /* header partial not found — continue without */ });
  }

  // Load footer
  var footerEl = document.getElementById('site-footer');
  if (footerEl) {
    fetch('/_footer.html')
      .then(function (r) { return r.text(); })
      .then(function (html) { insertHTML('site-footer', html); })
      .catch(function () { /* footer partial not found — continue without */ });
  }
})();
