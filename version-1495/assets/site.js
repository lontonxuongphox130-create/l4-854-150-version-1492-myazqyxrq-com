(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                var open = panel.hasAttribute("hidden");
                if (open) {
                    panel.removeAttribute("hidden");
                } else {
                    panel.setAttribute("hidden", "");
                }
                toggle.setAttribute("aria-expanded", String(open));
            });
        }

        document.querySelectorAll(".site-search-form").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (input && !input.value.trim()) {
                    event.preventDefault();
                    input.focus();
                }
            });
        });

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var index = 0;
            var show = function (next) {
                index = (next + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === index);
                });
            };
            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
                });
            });
            if (slides.length > 1) {
                window.setInterval(function () {
                    show(index + 1);
                }, 5200);
            }
        }

        document.querySelectorAll("[data-rail]").forEach(function (rail) {
            var section = rail.closest("section");
            var prev = section ? section.querySelector("[data-rail-prev]") : null;
            var next = section ? section.querySelector("[data-rail-next]") : null;
            if (prev) {
                prev.addEventListener("click", function () {
                    rail.scrollBy({ left: -420, behavior: "smooth" });
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    rail.scrollBy({ left: 420, behavior: "smooth" });
                });
            }
        });

        document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
            var input = panel.querySelector("[data-filter-input]");
            var year = panel.querySelector("[data-filter-year]");
            var area = panel.parentElement;
            var cards = area ? Array.prototype.slice.call(area.querySelectorAll(".movie-card")) : [];
            var empty = area ? area.querySelector("[data-empty-state]") : null;
            var apply = function () {
                var q = input ? input.value.trim().toLowerCase() : "";
                var y = year ? year.value : "";
                var shown = 0;
                cards.forEach(function (card) {
                    var text = card.getAttribute("data-search") || "";
                    var cardYear = card.getAttribute("data-year") || "";
                    var match = (!q || text.indexOf(q) !== -1) && (!y || cardYear === y);
                    card.hidden = !match;
                    if (match) {
                        shown += 1;
                    }
                });
                if (empty) {
                    empty.hidden = shown !== 0;
                }
            };
            if (input) {
                input.addEventListener("input", apply);
            }
            if (year) {
                year.addEventListener("change", apply);
            }
        });
    });
})();
