import { H as Hls } from './hls-vendor-dru42stk.js';

const ready = (callback) => {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
        return;
    }
    callback();
};

const formatTime = (seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0) {
        return '0:00';
    }
    const minutes = Math.floor(seconds / 60);
    const rest = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${rest}`;
};

const bindMenu = () => {
    const toggle = document.querySelector('[data-menu-toggle]');
    const panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
        return;
    }
    toggle.addEventListener('click', () => {
        panel.classList.toggle('is-open');
    });
};

const bindSearchForms = () => {
    document.querySelectorAll('[data-search-form]').forEach((form) => {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const root = form.getAttribute('data-search-root') || './';
            const input = form.querySelector('input[name="q"]');
            const value = input ? input.value.trim() : '';
            const target = `${root}search.html${value ? `?q=${encodeURIComponent(value)}` : ''}`;
            window.location.href = target;
        });
    });
};

const bindHero = () => {
    const hero = document.querySelector('[data-hero]');
    if (!hero) {
        return;
    }
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
        return;
    }
    let current = 0;
    const show = (index) => {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    };
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => show(index));
    });
    window.setInterval(() => show(current + 1), 5000);
};

const bindScrollRows = () => {
    document.querySelectorAll('[data-scroll-row]').forEach((row) => {
        const section = row.closest('section');
        const prev = section ? section.querySelector('[data-row-prev]') : null;
        const next = section ? section.querySelector('[data-row-next]') : null;
        if (prev) {
            prev.addEventListener('click', () => row.scrollBy({ left: -420, behavior: 'smooth' }));
        }
        if (next) {
            next.addEventListener('click', () => row.scrollBy({ left: 420, behavior: 'smooth' }));
        }
    });
};

const bindFilters = () => {
    const grid = document.querySelector('[data-filter-grid]');
    if (!grid) {
        return;
    }
    const cards = Array.from(grid.querySelectorAll('[data-filter-card]'));
    const input = document.getElementById('siteSearchInput');
    const year = document.getElementById('yearFilter');
    const type = document.getElementById('typeFilter');
    const region = document.getElementById('regionFilter');
    const empty = document.getElementById('filterEmpty');
    const params = new URLSearchParams(window.location.search);
    const initial = params.get('q') || '';
    if (input && initial) {
        input.value = initial;
    }
    const apply = () => {
        const keyword = input ? input.value.trim().toLowerCase() : '';
        const yearValue = year ? year.value : '';
        const typeValue = type ? type.value : '';
        const regionValue = region ? region.value : '';
        let visible = 0;
        cards.forEach((card) => {
            const text = (card.getAttribute('data-search') || '').toLowerCase();
            const matched = (!keyword || text.includes(keyword))
                && (!yearValue || card.getAttribute('data-year') === yearValue)
                && (!typeValue || card.getAttribute('data-type') === typeValue)
                && (!regionValue || card.getAttribute('data-region') === regionValue);
            card.classList.toggle('is-hidden', !matched);
            if (matched) {
                visible += 1;
            }
        });
        if (empty) {
            empty.classList.toggle('is-visible', visible === 0);
        }
    };
    [input, year, type, region].forEach((control) => {
        if (control) {
            control.addEventListener('input', apply);
            control.addEventListener('change', apply);
        }
    });
    apply();
};

const bindPlayer = () => {
    const player = document.querySelector('[data-player]');
    const video = document.querySelector('[data-player-video]');
    if (!player || !video) {
        return;
    }
    const stream = video.getAttribute('data-stream');
    const toggles = Array.from(document.querySelectorAll('[data-player-toggle]'));
    const muted = document.querySelector('[data-player-muted]');
    const fullscreen = document.querySelector('[data-player-fullscreen]');
    const range = document.querySelector('[data-player-range]');
    const time = document.querySelector('[data-player-time]');
    let hls = null;

    if (stream) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
        } else if (Hls.isSupported()) {
            hls = new Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(stream);
            hls.attachMedia(video);
        } else {
            video.src = stream;
        }
    }

    const updateTime = () => {
        if (range) {
            range.max = Number.isFinite(video.duration) ? video.duration : 0;
            range.value = Number.isFinite(video.currentTime) ? video.currentTime : 0;
        }
        if (time) {
            time.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
        }
    };

    const updateState = () => {
        player.classList.toggle('is-playing', !video.paused);
        toggles.forEach((button) => {
            button.textContent = video.paused ? '播放' : '暂停';
        });
        if (muted) {
            muted.textContent = video.muted ? '取消静音' : '静音';
        }
    };

    const togglePlay = () => {
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    };

    toggles.forEach((button) => {
        button.addEventListener('click', togglePlay);
    });
    video.addEventListener('click', togglePlay);
    video.addEventListener('play', updateState);
    video.addEventListener('pause', updateState);
    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('durationchange', updateTime);
    if (range) {
        range.addEventListener('input', () => {
            video.currentTime = Number(range.value || 0);
        });
    }
    if (muted) {
        muted.addEventListener('click', () => {
            video.muted = !video.muted;
            updateState();
        });
    }
    if (fullscreen) {
        fullscreen.addEventListener('click', () => {
            if (document.fullscreenElement) {
                document.exitFullscreen();
                return;
            }
            player.requestFullscreen();
        });
    }
    window.addEventListener('beforeunload', () => {
        if (hls) {
            hls.destroy();
        }
    });
    updateTime();
    updateState();
};

ready(() => {
    bindMenu();
    bindSearchForms();
    bindHero();
    bindScrollRows();
    bindFilters();
    bindPlayer();
});
