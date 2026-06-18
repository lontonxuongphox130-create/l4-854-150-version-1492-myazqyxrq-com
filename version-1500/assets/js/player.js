
import { H as Hls } from './hls-vendor.js';

export function setupPlayer(source) {
  var video = document.getElementById('movieVideo');
  var cover = document.getElementById('playCover');
  var initialized = false;
  var hls = null;

  function bind() {
    if (initialized || !video || !source) {
      return;
    }
    initialized = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }

    video.src = source;
  }

  function play() {
    bind();
    if (!video) {
      return;
    }
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener('click', function () {
      cover.classList.add('is-hidden');
      play();
    });
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });
    video.addEventListener('loadedmetadata', function () {
      if (cover && !video.paused) {
        cover.classList.add('is-hidden');
      }
    });
  }

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
