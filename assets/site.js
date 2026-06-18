(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var button = document.querySelector('[data-menu-button]');
        if (!button) {
            return;
        }

        button.addEventListener('click', function () {
            document.body.classList.toggle('menu-open');
        });

        selectAll('.nav-links a').forEach(function (link) {
            link.addEventListener('click', function () {
                document.body.classList.remove('menu-open');
            });
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }

        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                restart();
            });
        });

        show(0);
        restart();
    }

    function normalize(value) {
        return (value || '').toString().toLowerCase().replace(/\s+/g, '');
    }

    function initFilters() {
        selectAll('[data-filter-scope]').forEach(function (scope) {
            var input = scope.querySelector('[data-search-input]');
            var cards = selectAll('[data-movie-card]', scope);
            var chips = selectAll('[data-filter-chip]', scope);
            var activeField = 'all';
            var activeValue = '';

            function apply() {
                var query = normalize(input ? input.value : '');

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-tags')
                    ].join(' '));

                    var matchQuery = !query || haystack.indexOf(query) !== -1;
                    var matchChip = true;

                    if (activeField !== 'all') {
                        matchChip = normalize(card.getAttribute('data-' + activeField)).indexOf(normalize(activeValue)) !== -1;
                    }

                    card.classList.toggle('hidden-by-filter', !(matchQuery && matchChip));
                });
            }

            if (input) {
                input.addEventListener('input', apply);
            }

            chips.forEach(function (chip) {
                chip.addEventListener('click', function () {
                    chips.forEach(function (item) {
                        item.classList.remove('is-active');
                    });

                    chip.classList.add('is-active');
                    activeField = chip.getAttribute('data-filter-field') || 'all';
                    activeValue = chip.getAttribute('data-filter-value') || '';
                    apply();
                });
            });
        });
    }

    function initPlayers() {
        selectAll('[data-player]').forEach(function (box) {
            var video = box.querySelector('video');
            var layer = box.querySelector('[data-play-layer]');
            var button = box.querySelector('[data-play-button]');
            var error = box.querySelector('[data-play-error]');
            var url = box.getAttribute('data-video');
            var loaded = false;
            var hls = null;

            function setError() {
                if (error) {
                    error.textContent = '播放暂时不可用，请稍后重试';
                }
                box.classList.add('is-error');
            }

            function hideLayer() {
                if (layer) {
                    layer.classList.add('is-hidden');
                }
            }

            function start() {
                if (!video || !url) {
                    setError();
                    return;
                }

                box.classList.remove('is-error');
                video.controls = true;
                hideLayer();

                if (!loaded) {
                    if (window.Hls && window.Hls.isSupported()) {
                        hls = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });

                        hls.loadSource(url);
                        hls.attachMedia(video);
                        video.play().catch(function () {});
                        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            video.play().catch(function () {});
                        });
                        hls.on(window.Hls.Events.ERROR, function (event, data) {
                            if (data && data.fatal) {
                                setError();
                            }
                        });
                    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = url;
                        video.play().catch(function () {});
                    } else {
                        setError();
                        return;
                    }

                    loaded = true;
                } else {
                    video.play().catch(function () {});
                }
            }

            if (button) {
                button.addEventListener('click', function (event) {
                    event.stopPropagation();
                    start();
                });
            }

            if (layer) {
                layer.addEventListener('click', start);
            }

            if (video) {
                video.addEventListener('play', hideLayer);
                video.addEventListener('error', setError);
            }

            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
})();
