(function () {
  function initPlayer(wrap) {
    var video = wrap.querySelector('video');
    var button = wrap.querySelector('.play-overlay');
    var src = wrap.getAttribute('data-stream');
    var hls = null;

    function attach() {
      if (!video || !src || wrap.dataset.ready === '1') return;
      wrap.dataset.ready = '1';
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else {
        video.src = src;
      }
    }

    function play() {
      attach();
      if (!video) return;
      if (button) button.classList.add('is-hidden');
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          if (button) button.classList.remove('is-hidden');
        });
      }
    }

    attach();

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        play();
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', function () {
        if (button) button.classList.add('is-hidden');
      });
      video.addEventListener('pause', function () {
        if (button && video.currentTime === 0) button.classList.remove('is-hidden');
      });
    }

    window.addEventListener('pagehide', function () {
      if (hls) hls.destroy();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('.player-wrap')).forEach(initPlayer);
  });
})();
