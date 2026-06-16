(function () {
  var path = window.location.pathname;
  var cleanPath = path;

  if (cleanPath === '/index.html' || cleanPath === '/index') {
    cleanPath = '/';
  } else if (cleanPath.endsWith('/index.html')) {
    cleanPath = cleanPath.slice(0, -11);
  } else if (cleanPath.endsWith('.html')) {
    cleanPath = cleanPath.slice(0, -5);
  }

  if (cleanPath !== path) {
    window.history.replaceState(null, '', cleanPath + window.location.search + window.location.hash);
  }

  function removeLogoHyperlinks() {
    var subtitles = document.querySelectorAll('.network-logo-title .section-subtitle');

    subtitles.forEach(function (subtitle) {
      var text = subtitle.textContent.trim().toLowerCase();
      if (text !== 'as featured in' && text !== 'awards and recognitions') {
        return;
      }

      var titleWrap = subtitle.closest('.network-logo-title');
      if (!titleWrap) {
        return;
      }

      var suffix = titleWrap.classList.contains('_2') ? '_2' : titleWrap.classList.contains('_3') ? '_3' : '';
      if (!suffix) {
        return;
      }

      var contentWrap = titleWrap.closest('.content-wrap');
      if (!contentWrap) {
        return;
      }

      var logosWrap = contentWrap.querySelector('.network-logos-wrap.' + suffix);
      if (!logosWrap) {
        return;
      }

      logosWrap.querySelectorAll('a.network-logo_wrap').forEach(function (link) {
        link.removeAttribute('href');
        link.removeAttribute('target');
        link.removeAttribute('rel');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeLogoHyperlinks);
  } else {
    removeLogoHyperlinks();
  }
})();
