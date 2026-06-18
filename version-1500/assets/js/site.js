
(function () {
  var toggle = document.querySelector('.mobile-toggle');
  var panel = document.querySelector('.mobile-panel');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      var open = panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? '×' : '☰';
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(index);
        start();
      });
    });

    show(0);
    start();
  }

  var filterInput = document.querySelector('.page-filter');
  var yearFilter = document.querySelector('.year-filter');
  var filterCards = Array.prototype.slice.call(document.querySelectorAll('.filter-list .movie-card'));

  function runFilter() {
    if (!filterCards.length) {
      return;
    }
    var q = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var year = yearFilter ? yearFilter.value : '';
    filterCards.forEach(function (card) {
      var haystack = [card.dataset.title, card.dataset.tags, card.dataset.year].join(' ').toLowerCase();
      var matchText = !q || haystack.indexOf(q) !== -1;
      var matchYear = !year || card.dataset.year === year;
      card.classList.toggle('filter-hidden', !(matchText && matchYear));
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', runFilter);
  }
  if (yearFilter) {
    yearFilter.addEventListener('change', runFilter);
  }
})();
