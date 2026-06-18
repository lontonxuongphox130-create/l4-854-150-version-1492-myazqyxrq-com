(function () {
    function setupMoviePlayer(source, videoId) {
        var video = document.getElementById(videoId);
        if (!video || !source) {
            return;
        }

        var overlay = document.querySelector('[data-player="' + videoId + '"]');
        var ready = false;
        var hlsInstance = null;

        function tryPlay() {
            var playResult = video.play();
            if (playResult && typeof playResult.catch === 'function') {
                playResult.catch(function () {});
            }
        }

        function bindSource() {
            if (ready) {
                return;
            }
            ready = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                tryPlay();
                return;
            }

            if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MEDIA_ATTACHED, function () {
                    hlsInstance.loadSource(source);
                    tryPlay();
                });
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    tryPlay();
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal && hlsInstance) {
                        hlsInstance.destroy();
                        hlsInstance = null;
                        video.src = source;
                    }
                });
                return;
            }

            video.src = source;
            tryPlay();
        }

        function start() {
            bindSource();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            tryPlay();
        }

        if (overlay) {
            overlay.addEventListener('click', start);
        }

        video.addEventListener('click', function () {
            if (!ready || video.paused) {
                start();
            }
        });

        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });
    }

    window.setupMoviePlayer = setupMoviePlayer;
})();
