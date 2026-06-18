(function () {
    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function card(movie) {
        return [
            "<article class=\"movie-card\">",
            "<a href=\"" + escapeHtml(movie.url) + "\" class=\"poster-link\">",
            "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
            "<span class=\"card-badge\">" + escapeHtml(movie.type) + "</span>",
            "</a>",
            "<div class=\"card-body\">",
            "<div class=\"card-meta\">" + escapeHtml(movie.year) + " · " + escapeHtml(movie.region) + " · " + escapeHtml(movie.genre) + "</div>",
            "<h2><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h2>",
            "<p>" + escapeHtml(movie.line) + "</p>",
            "<div class=\"tag-row\"><span>" + escapeHtml(movie.category) + "</span></div>",
            "</div>",
            "</article>"
        ].join("");
    }

    function run() {
        var params = new URLSearchParams(window.location.search);
        var q = (params.get("q") || "").trim().toLowerCase();
        var input = document.querySelector(".search-page-form input[name='q']");
        var title = document.querySelector("[data-search-title]");
        var results = document.querySelector("[data-search-results]");
        var empty = document.querySelector("[data-search-empty]");
        var movies = window.SEARCH_MOVIES || [];
        if (input) {
            input.value = params.get("q") || "";
        }
        var list = q ? movies.filter(function (movie) {
            return movie.search.indexOf(q) !== -1;
        }) : movies.slice(0, 36);
        list = list.slice(0, 120);
        if (title) {
            title.textContent = q ? "与“" + (params.get("q") || "") + "”相关的影片" : "热门影片检索";
        }
        if (results) {
            results.innerHTML = list.map(card).join("");
        }
        if (empty) {
            empty.hidden = list.length !== 0;
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", run);
    } else {
        run();
    }
})();
