// Opens the About page's screenshots at full size in a viewer, which steps
// through them with its Prev and Next buttons, the arrow keys, or a swipe.
// Without JavaScript, each card simply links to its screenshot.
(function () {
  var cards = Array.prototype.slice.call(document.querySelectorAll('a.card'));
  var viewer = document.querySelector('.viewer');
  if (!cards.length || !viewer || typeof viewer.showModal !== 'function') return;

  var picture = viewer.querySelector('.viewer-frame img');
  var title = viewer.querySelector('.viewer-title');
  var count = viewer.querySelector('.viewer-count');
  var detail = viewer.querySelector('.viewer-detail');
  var index = 0;

  // The full screenshot's size, from its row: "1320 2868".
  function size(card) {
    return card.closest('.shots').getAttribute('data-size').split(' ').map(Number);
  }

  // Scales the picture to fit the window, leaving room for the bars above and
  // below it, and never past its own size.
  function fit() {
    var full = size(cards[index]);
    var width = Math.min(window.innerWidth - 66, 960);
    var height = Math.min(window.innerHeight * 0.73, window.innerHeight - 170);
    var scale = Math.min(1, width / full[0], height / full[1]);
    picture.style.width = Math.round(full[0] * scale) + 'px';
    picture.style.height = Math.round(full[1] * scale) + 'px';
  }

  function show(next) {
    index = (next + cards.length) % cards.length;
    var card = cards[index];
    var thumbnail = card.querySelector('img');
    title.textContent = card.querySelector('.caption').textContent;
    count.textContent = '(' + (index + 1) + ' of ' + cards.length + ')';
    detail.textContent = card.querySelector('.detail').textContent;
    viewer.setAttribute('aria-label', title.textContent);
    picture.alt = thumbnail.alt;
    fit();

    // Show the thumbnail, already loaded, until the full screenshot arrives.
    picture.src = thumbnail.currentSrc || thumbnail.src;
    var loader = new Image();
    loader.onload = function () {
      if (cards[index] === card) picture.src = card.href;
    };
    loader.src = card.href;

    // Fetch the neighbours so stepping is instant.
    new Image().src = cards[(index + 1) % cards.length].href;
    new Image().src = cards[(index - 1 + cards.length) % cards.length].href;
  }

  cards.forEach(function (card, i) {
    card.addEventListener('click', function (event) {
      // Let a modified click open the screenshot in a new tab or window.
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      show(i);
      viewer.showModal();
      // Focus the viewer itself, so the arrow keys work and Close isn't ringed.
      viewer.focus();
    });
  });

  viewer.querySelector('.close').addEventListener('click', function () { viewer.close(); });
  Array.prototype.forEach.call(viewer.querySelectorAll('.step'), function (button) {
    button.addEventListener('click', function () {
      show(index + Number(button.getAttribute('data-step')));
    });
  });

  // A click outside the panel lands on the dialog itself, behind the panel.
  viewer.addEventListener('click', function (event) {
    if (event.target === viewer) viewer.close();
  });

  viewer.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowRight') { show(index + 1); event.preventDefault(); }
    if (event.key === 'ArrowLeft') { show(index - 1); event.preventDefault(); }
  });

  var touchX = null;
  viewer.addEventListener('touchstart', function (event) {
    touchX = event.touches.length === 1 ? event.touches[0].clientX : null;
  }, { passive: true });
  viewer.addEventListener('touchend', function (event) {
    if (touchX === null) return;
    var moved = event.changedTouches[0].clientX - touchX;
    if (Math.abs(moved) > 40) show(index + (moved < 0 ? 1 : -1));
    touchX = null;
  });

  window.addEventListener('resize', function () { if (viewer.open) fit(); });
})();
