(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function activate(target) {
      if (!slides.length) {
        return;
      }

      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('active', current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('active', current === index);
      });
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        activate(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        activate(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        activate(index + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, current) {
      dot.addEventListener('click', function () {
        activate(current);
        startTimer();
      });
    });

    activate(0);
    startTimer();
  }

  document.querySelectorAll('[data-filter-group]').forEach(function (group) {
    var input = group.querySelector('[data-filter-input]');
    var selects = Array.prototype.slice.call(group.querySelectorAll('[data-filter-select]'));
    var scope = group.parentElement || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card-item'));
    var empty = group.querySelector('[data-empty-state]');

    function valueOf(card, name) {
      return (card.getAttribute('data-' + name) || '').toLowerCase();
    }

    function applyFilters() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = [
          valueOf(card, 'title'),
          valueOf(card, 'region'),
          valueOf(card, 'type'),
          valueOf(card, 'year'),
          valueOf(card, 'genre'),
          valueOf(card, 'tags'),
          valueOf(card, 'category')
        ].join(' ');
        var ok = !keyword || text.indexOf(keyword) !== -1;

        selects.forEach(function (select) {
          var field = select.getAttribute('data-filter-select');
          var selected = select.value.trim().toLowerCase();
          if (selected && valueOf(card, field).indexOf(selected) === -1) {
            ok = false;
          }
        });

        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilters);
    }

    selects.forEach(function (select) {
      select.addEventListener('change', applyFilters);
    });

    applyFilters();
  });
})();

function initPlayer(streamUrl) {
  var video = document.getElementById('playerVideo');
  var overlay = document.getElementById('playerOverlay');
  var prepared = false;

  if (!video || !overlay || !streamUrl) {
    return;
  }

  function prepare() {
    if (prepared) {
      return;
    }

    prepared = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function play() {
    prepare();
    overlay.classList.add('hidden');
    video.controls = true;
    var action = video.play();

    if (action && typeof action.catch === 'function') {
      action.catch(function () {});
    }
  }

  overlay.addEventListener('click', play);
  video.addEventListener('click', function () {
    if (!prepared || video.paused) {
      play();
    }
  });
}
