(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var toggle = document.querySelector(".nav-toggle");
    var mobileNav = document.querySelector(".mobile-nav");
    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function startHeroTimer() {
      if (timer) {
        clearInterval(timer);
      }
      if (slides.length > 1) {
        timer = setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        showSlide(i);
        startHeroTimer();
      });
    });

    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        startHeroTimer();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        startHeroTimer();
      });
    }
    showSlide(0);
    startHeroTimer();

    var filterAreas = Array.prototype.slice.call(document.querySelectorAll("[data-filter-area]"));
    filterAreas.forEach(function (area) {
      var search = area.querySelector("[data-filter-search]");
      var region = area.querySelector("[data-filter-region]");
      var year = area.querySelector("[data-filter-year]");
      var type = area.querySelector("[data-filter-type]");
      var reset = area.querySelector("[data-filter-reset]");
      var cards = Array.prototype.slice.call(area.querySelectorAll(".movie-card"));
      var empty = area.querySelector(".empty-state");

      function textOf(value) {
        return (value || "").toString().toLowerCase();
      }

      function applyFilter() {
        var q = textOf(search && search.value);
        var reg = region ? region.value : "";
        var yr = year ? year.value : "";
        var tp = type ? type.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = textOf(card.getAttribute("data-title") + " " + card.getAttribute("data-genre") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-type"));
          var ok = true;
          if (q && haystack.indexOf(q) === -1) {
            ok = false;
          }
          if (reg && card.getAttribute("data-region").indexOf(reg) === -1) {
            ok = false;
          }
          if (yr && card.getAttribute("data-year") !== yr) {
            ok = false;
          }
          if (tp && card.getAttribute("data-type").indexOf(tp) === -1) {
            ok = false;
          }
          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [search, region, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilter);
          control.addEventListener("change", applyFilter);
        }
      });

      if (reset) {
        reset.addEventListener("click", function () {
          if (search) search.value = "";
          if (region) region.value = "";
          if (year) year.value = "";
          if (type) type.value = "";
          applyFilter();
        });
      }

      var initialQuery = new URLSearchParams(window.location.search).get("q");
      if (initialQuery && search) {
        search.value = initialQuery;
        applyFilter();
      }
    });

    var player = document.querySelector("[data-player]");
    if (player) {
      var video = player.querySelector("video");
      var cover = player.querySelector(".player-cover");
      var url = player.getAttribute("data-video");
      var started = false;
      var hlsInstance = null;

      function beginPlay() {
        if (!video || !url) {
          return;
        }
        if (!started) {
          started = true;
          if (cover) {
            cover.classList.add("is-hidden");
          }
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
          } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              maxBufferLength: 36,
              backBufferLength: 24
            });
            hlsInstance.loadSource(url);
            hlsInstance.attachMedia(video);
          } else {
            video.src = url;
          }
        }
        var playResult = video.play();
        if (playResult && typeof playResult.catch === "function") {
          playResult.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener("click", beginPlay);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (!started) {
            beginPlay();
          }
        });
      }
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  });
})();
