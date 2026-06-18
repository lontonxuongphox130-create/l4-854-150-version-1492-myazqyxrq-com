(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMobileMenu() {
    var button = qs('.mobile-toggle');
    var panel = qs('.mobile-panel');
    if (!button || !panel) return;
    button.addEventListener('click', function () {
      var open = panel.hasAttribute('hidden');
      if (open) {
        panel.removeAttribute('hidden');
        button.setAttribute('aria-expanded', 'true');
        button.textContent = '×';
      } else {
        panel.setAttribute('hidden', '');
        button.setAttribute('aria-expanded', 'false');
        button.textContent = '☰';
      }
    });
  }

  function initHeaderSearch() {
    qsa('.site-search-form').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = qs('input[name="q"]', form);
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = 'search.html';
        }
      });
    });
  }

  function initHeroCarousel() {
    var hero = qs('[data-hero]');
    if (!hero) return;
    var slides = qsa('.hero-slide', hero);
    var dots = qsa('.hero-dot', hero);
    if (!slides.length) return;
    var index = 0;

    function setSlide(next) {
      slides[index].classList.remove('active');
      if (dots[index]) dots[index].classList.remove('active');
      index = (next + slides.length) % slides.length;
      slides[index].classList.add('active');
      if (dots[index]) dots[index].classList.add('active');
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        setSlide(dotIndex);
      });
    });

    window.setInterval(function () {
      setSlide(index + 1);
    }, 5000);
  }

  function initRails() {
    qsa('[data-rail]').forEach(function (rail) {
      var section = rail.closest('.section') || document;
      var left = qs('[data-rail-left]', section);
      var right = qs('[data-rail-right]', section);
      if (left) {
        left.addEventListener('click', function () {
          rail.scrollBy({ left: -420, behavior: 'smooth' });
        });
      }
      if (right) {
        right.addEventListener('click', function () {
          rail.scrollBy({ left: 420, behavior: 'smooth' });
        });
      }
    });
  }

  function initBackTop() {
    var button = qs('.back-top');
    if (!button) return;
    function toggle() {
      if (window.scrollY > 320) {
        button.classList.add('show');
      } else {
        button.classList.remove('show');
      }
    }
    window.addEventListener('scroll', toggle, { passive: true });
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    toggle();
  }

  function initFilters() {
    var list = qs('[data-filter-list]');
    var input = qs('[data-filter-input]');
    var year = qs('[data-filter-year]');
    if (!list || (!input && !year)) return;
    var cards = qsa('[data-card]', list);

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var selectedYear = year ? year.value : '';
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year')
        ].join(' ').toLowerCase();
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
        card.classList.toggle('is-filter-hidden', !(matchKeyword && matchYear));
      });
    }

    if (input) input.addEventListener('input', apply);
    if (year) year.addEventListener('change', apply);
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderSearchCard(movie) {
    return '' +
      '<a class="movie-card" href="' + escapeHtml(movie.url) + '">' +
      '<div class="poster"><img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" decoding="async"><span class="badge">' + escapeHtml(movie.type) + '</span></div>' +
      '<div class="card-body"><h3>' + escapeHtml(movie.title) + '</h3><p>' + escapeHtml(movie.desc) + '</p>' +
      '<div class="meta-row"><span>👁 ' + escapeHtml(movie.views) + '</span><span>♡ ' + escapeHtml(movie.likes) + '</span><span>' + escapeHtml(movie.year) + '</span></div></div>' +
      '</a>';
  }

  function initSearchPage() {
    var results = qs('#searchResults');
    var input = qs('#searchPageInput');
    var form = qs('#searchPageForm');
    var status = qs('#searchStatus');
    var hot = qs('#searchHotBlock');
    if (!results || !input || !window.SEARCH_MOVIES) return;
    var params = new URLSearchParams(window.location.search);
    input.value = params.get('q') || '';

    function runSearch() {
      var keyword = input.value.trim().toLowerCase();
      if (!keyword) {
        results.innerHTML = '';
        if (status) status.textContent = '';
        if (hot) hot.style.display = '';
        return;
      }
      var matches = window.SEARCH_MOVIES.filter(function (movie) {
        return [movie.title, movie.desc, movie.category, movie.type, movie.region, movie.year, movie.genre, movie.tags]
          .join(' ')
          .toLowerCase()
          .indexOf(keyword) !== -1;
      }).slice(0, 80);
      results.innerHTML = matches.map(renderSearchCard).join('');
      if (status) status.textContent = matches.length ? '搜索结果' : '没有找到相关内容';
      if (hot) hot.style.display = matches.length ? 'none' : '';
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var query = input.value.trim();
        var nextUrl = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
        history.replaceState(null, '', nextUrl);
        runSearch();
      });
    }

    input.addEventListener('input', runSearch);
    runSearch();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHeaderSearch();
    initHeroCarousel();
    initRails();
    initBackTop();
    initFilters();
    initSearchPage();
  });
})();
