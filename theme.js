// Applies a saved light or dark choice before the page paints, and runs the
// switcher in the top bar. Without a saved choice, the device's setting decides.
(function () {
  var root = document.documentElement;
  var deviceLight = window.matchMedia('(prefers-color-scheme: light)');

  try {
    var saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') root.setAttribute('data-theme', saved);
  } catch (e) {}
  root.classList.add('js');

  function current() {
    return root.getAttribute('data-theme') || (deviceLight.matches ? 'light' : 'dark');
  }

  function describe(button) {
    var label = current() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
    button.setAttribute('aria-label', label);
    button.title = label;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var button = document.querySelector('.theme');
    if (!button) return;
    describe(button);
    button.addEventListener('click', function () {
      var next = current() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      describe(button);
    });
    deviceLight.addEventListener('change', function () { describe(button); });
  });
})();
