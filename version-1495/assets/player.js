(function () {
    function initPlayer(wrap) {
        var video = wrap.querySelector(".video-player");
        var button = wrap.querySelector(".video-start");
        var src = wrap.getAttribute("data-video");
        var loaded = false;

        function load() {
            if (loaded || !video || !src) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(src);
                hls.attachMedia(video);
                wrap._hls = hls;
            } else {
                video.src = src;
            }
            loaded = true;
        }

        function play() {
            load();
            wrap.classList.add("is-playing");
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {
                    wrap.classList.remove("is-playing");
                });
            }
        }

        if (button) {
            button.addEventListener("click", play);
        }
        if (video) {
            video.addEventListener("play", function () {
                wrap.classList.add("is-playing");
            });
            video.addEventListener("pause", function () {
                if (!video.currentTime) {
                    wrap.classList.remove("is-playing");
                }
            });
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function () {
            document.querySelectorAll(".video-wrap").forEach(initPlayer);
        });
    } else {
        document.querySelectorAll(".video-wrap").forEach(initPlayer);
    }
})();
