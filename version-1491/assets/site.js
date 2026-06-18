(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        initMenu();
        initHero();
        initSearch();
        initPlayers();
    });

    function initMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
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

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }

        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initSearch() {
        var input = document.querySelector("[data-search-input]");
        var list = document.querySelector("[data-search-list]");
        if (!input || !list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
        input.addEventListener("input", function () {
            var query = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = (card.getAttribute("data-search-text") || "").toLowerCase();
                card.classList.toggle("is-hidden", query && text.indexOf(query) === -1);
            });
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(initPlayer);
    }

    function initPlayer(player) {
        var video = player.querySelector("video");
        var cover = player.querySelector(".player-cover");
        var playButton = player.querySelector(".player-play");
        var muteButton = player.querySelector(".player-mute");
        var fullButton = player.querySelector(".player-fullscreen");
        var stream = player.getAttribute("data-stream");
        var loaded = false;
        var hls = null;

        if (!video || !stream) {
            return;
        }

        function loadStream() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
        }

        function updatePlayState() {
            var playing = !video.paused && !video.ended;
            player.classList.toggle("is-playing", playing);
            if (playButton) {
                playButton.textContent = playing ? "Ⅱ" : "▶";
            }
        }

        function playVideo() {
            loadStream();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            video.controls = true;
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {
                    if (cover) {
                        cover.classList.remove("is-hidden");
                    }
                    updatePlayState();
                });
            }
        }

        function togglePlay() {
            if (video.paused || video.ended) {
                playVideo();
            } else {
                video.pause();
            }
        }

        if (cover) {
            cover.addEventListener("click", playVideo);
        }

        video.addEventListener("click", togglePlay);
        video.addEventListener("play", updatePlayState);
        video.addEventListener("pause", updatePlayState);
        video.addEventListener("ended", updatePlayState);

        if (playButton) {
            playButton.addEventListener("click", togglePlay);
        }

        if (muteButton) {
            muteButton.addEventListener("click", function () {
                video.muted = !video.muted;
                muteButton.textContent = video.muted ? "静音" : "声音";
            });
        }

        if (fullButton) {
            fullButton.addEventListener("click", function () {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (player.requestFullscreen) {
                    player.requestFullscreen();
                }
            });
        }

        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    }
})();
