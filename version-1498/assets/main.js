const MovieSite = (function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function bindMenu() {
    const button = qs("[data-menu-toggle]");
    const panel = qs("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
      button.textContent = panel.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function bindHero() {
    const hero = qs("[data-hero]");
    if (!hero) {
      return;
    }
    const slides = qsa("[data-hero-slide]", hero);
    const dots = qsa("[data-hero-dot]", hero);
    let active = 0;
    let timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(index);
        play();
      });
    });

    show(0);
    play();
  }

  function bindCarousels() {
    qsa("[data-carousel-control]").forEach(function (button) {
      button.addEventListener("click", function () {
        const target = document.getElementById(button.getAttribute("data-carousel-target"));
        if (!target) {
          return;
        }
        const direction = button.getAttribute("data-carousel-control") === "left" ? -1 : 1;
        target.scrollBy({
          left: direction * Math.min(520, target.clientWidth * 0.85),
          behavior: "smooth"
        });
      });
    });
  }

  function bindFilters() {
    qsa("[data-filter-panel]").forEach(function (panel) {
      const input = qs("[data-filter-search]", panel);
      const typeSelect = qs("[data-filter-type]", panel);
      const yearSelect = qs("[data-filter-year]", panel);
      const targetSelector = panel.getAttribute("data-filter-target") || "[data-movie-card]";
      const cards = qsa(targetSelector);
      const params = new URLSearchParams(window.location.search);
      const query = params.get("q");

      if (input && query) {
        input.value = query;
      }

      function apply() {
        const words = normalize(input ? input.value : "");
        const typeValue = normalize(typeSelect ? typeSelect.value : "");
        const yearValue = normalize(yearSelect ? yearSelect.value : "");

        cards.forEach(function (card) {
          const text = normalize(card.getAttribute("data-search") || card.textContent);
          const type = normalize(card.getAttribute("data-type"));
          const year = normalize(card.getAttribute("data-year"));
          const okText = !words || text.indexOf(words) !== -1;
          const okType = !typeValue || type.indexOf(typeValue) !== -1;
          const okYear = !yearValue || year === yearValue;
          card.classList.toggle("is-hidden", !(okText && okType && okYear));
        });
      }

      [input, typeSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      apply();
    });
  }

  function bindBackTop() {
    const button = qs("[data-back-top]");
    if (!button) {
      return;
    }
    function update() {
      button.classList.toggle("is-visible", window.scrollY > 420);
    }
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  function player(source) {
    const video = qs("#movie-player");
    const layer = qs("[data-player-layer]");
    if (!video || !layer || !source) {
      return;
    }
    let started = false;
    let hls = null;

    function reveal() {
      layer.classList.add("is-hidden");
      video.controls = true;
    }

    function attemptPlay() {
      reveal();
      const promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          layer.classList.remove("is-hidden");
        });
      }
    }

    function start() {
      if (started) {
        attemptPlay();
        return;
      }
      started = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", attemptPlay, { once: true });
        video.load();
        attemptPlay();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        attemptPlay();
        hls.on(window.Hls.Events.MANIFEST_PARSED, attemptPlay);
        hls.on(window.Hls.Events.ERROR, function () {
          if (!video.src) {
            video.src = source;
          }
        });
        return;
      }

      video.src = source;
      video.addEventListener("loadedmetadata", attemptPlay, { once: true });
      video.load();
    }

    layer.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (!started) {
        start();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    bindMenu();
    bindHero();
    bindCarousels();
    bindFilters();
    bindBackTop();
  });

  return {
    player: player
  };
})();
