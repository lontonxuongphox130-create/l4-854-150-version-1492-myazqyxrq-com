
(function () {
  var input = document.getElementById('searchInput');
  var results = document.getElementById('searchResults');
  var summary = document.getElementById('searchSummary');
  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';
  var list = window.SEARCH_INDEX || [];

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function card(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '<a class="card-cover" href="' + item.url + '">',
      '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<span class="card-badge">' + escapeHtml(item.category) + '</span>',
      '</a>',
      '<div class="card-body">',
      '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
      '<p>' + escapeHtml(item.oneLine) + '</p>',
      '<div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.views) + '</span></div>',
      '<div class="card-tags">' + tags + '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function run(q) {
    var value = String(q || '').trim().toLowerCase();
    var matched = list.filter(function (item) {
      var haystack = [item.title, item.year, item.region, item.genre, item.type, item.category, (item.tags || []).join(' ')].join(' ').toLowerCase();
      return !value || haystack.indexOf(value) !== -1;
    }).slice(0, 160);

    if (input) {
      input.value = q || '';
    }
    if (summary) {
      summary.textContent = value ? '搜索结果' : '推荐浏览';
    }
    if (results) {
      results.innerHTML = matched.map(card).join('');
    }
  }

  run(query || '');
})();
