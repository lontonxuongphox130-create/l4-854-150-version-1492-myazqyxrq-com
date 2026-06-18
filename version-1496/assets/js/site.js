(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var menuButton = qs('.mobile-menu-button');
    var mobilePanel = qs('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    qsa('form[action="search.html"]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = qs('input[name="q"]', form);
            if (input && input.value.trim() === '') {
                event.preventDefault();
                window.location.href = 'search.html';
            }
        });
    });

    var backTop = qs('.back-top');
    if (backTop) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 360) {
                backTop.classList.add('is-visible');
            } else {
                backTop.classList.remove('is-visible');
            }
        });
        backTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    var slides = qsa('.hero-slide');
    if (slides.length > 1) {
        var current = 0;
        var nextButton = qs('[data-hero-next]');
        var prevButton = qs('[data-hero-prev]');

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', function () {
                showSlide(current + 1);
            });
        }

        if (prevButton) {
            prevButton.addEventListener('click', function () {
                showSlide(current - 1);
            });
        }

        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var filterInput = qs('[data-filter-input]');
    var typeSelect = qs('[data-filter-type]');
    var yearSelect = qs('[data-filter-year]');
    var cards = qsa('[data-title]');
    var empty = qs('[data-empty]');

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function filterCards() {
        if (!cards.length) {
            return;
        }

        var query = normalize(filterInput ? filterInput.value : '');
        var type = normalize(typeSelect ? typeSelect.value : '');
        var year = normalize(yearSelect ? yearSelect.value : '');
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year'),
                card.getAttribute('data-tags')
            ].join(' '));
            var matchesQuery = query === '' || haystack.indexOf(query) !== -1;
            var matchesType = type === '' || normalize(card.getAttribute('data-type')).indexOf(type) !== -1;
            var matchesYear = year === '' || normalize(card.getAttribute('data-year')).indexOf(year) !== -1;
            var show = matchesQuery && matchesType && matchesYear;

            card.style.display = show ? '' : 'none';
            if (show) {
                visible += 1;
            }
        });

        if (empty) {
            empty.classList.toggle('is-visible', visible === 0);
        }
    }

    if (filterInput || typeSelect || yearSelect) {
        if (filterInput) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q) {
                filterInput.value = q;
            }
            filterInput.addEventListener('input', filterCards);
        }
        if (typeSelect) {
            typeSelect.addEventListener('change', filterCards);
        }
        if (yearSelect) {
            yearSelect.addEventListener('change', filterCards);
        }
        filterCards();
    }
})();
