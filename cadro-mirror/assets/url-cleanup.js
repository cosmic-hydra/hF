(function () {
  var path = window.location.pathname;
  var cleanPath = path;

  cleanPath = cleanPath.replace(/^\/www\.cadro\.com(?=\/|$)/, '');

  if (cleanPath === '' || cleanPath === '/index.html' || cleanPath === '/index') {
    cleanPath = '/';
  } else if (cleanPath.endsWith('/index.html')) {
    cleanPath = cleanPath.slice(0, -11) || '/';
  } else if (cleanPath.endsWith('.html')) {
    cleanPath = cleanPath.slice(0, -5);
  }

  cleanPath = cleanPath.replace(/\/+/g, '/');
  if (!cleanPath.startsWith('/')) {
    cleanPath = '/' + cleanPath;
  }

  if (cleanPath !== path) {
    window.history.replaceState(null, '', cleanPath + window.location.search + window.location.hash);
  }
})();
