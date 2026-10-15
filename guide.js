(function () {
  const links = [...document.querySelectorAll('.nav-inner a')];
  const sections = [...document.querySelectorAll('main .category')];
  const catIds = sections.map((s) => s.id);
  if (!sections.length) return;

  function activate(id, { moveNav = true } = {}) {
    if (!catIds.includes(id)) id = catIds[0];
    sections.forEach((s) => {
      s.hidden = s.id !== id;
    });
    links.forEach((l) => l.setAttribute('aria-current', String(l.hash === '#' + id)));
    if (history.replaceState) history.replaceState(null, '', '#' + id);
    if (moveNav) {
      const activeLink = links.find((l) => l.hash === '#' + id);
      if (activeLink) activeLink.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    }
  }

  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      activate(link.hash.slice(1));
      document.getElementById('guia').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  const initial = location.hash && catIds.includes(location.hash.slice(1)) ? location.hash.slice(1) : catIds[0];
  activate(initial, { moveNav: false });

  const nav = document.querySelector('.nav-inner');
  function updateFade() {
    if (!nav) return;
    nav.classList.toggle('fade-left', nav.scrollLeft > 4);
    nav.classList.toggle('fade-right', nav.scrollLeft + nav.clientWidth < nav.scrollWidth - 4);
  }
  if (nav) {
    updateFade();
    nav.addEventListener('scroll', updateFade, { passive: true });
    window.addEventListener('resize', updateFade);
  }

  function initCarousel(figure) {
    const track = figure.querySelector('.carousel');
    const dots = [...figure.querySelectorAll('.dot')];
    if (!track || dots.length < 2) return;
    let ticking = false;
    track.addEventListener(
      'scroll',
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const idx = Math.round(track.scrollLeft / track.clientWidth);
          dots.forEach((d, k) => d.classList.toggle('active', k === idx));
          ticking = false;
        });
      },
      { passive: true }
    );
  }
  document.querySelectorAll('.photo').forEach(initCarousel);

  const surpriseBtn = document.getElementById('surprise-btn');
  const surpriseView = document.getElementById('surprise-view');
  const surpriseCard = document.getElementById('surprise-card');
  const surpriseBack = document.getElementById('surprise-back');
  const categoryNav = document.querySelector('.category-nav');
  const introEl = document.querySelector('.intro');
  const mainEl = document.getElementById('guia');

  if (surpriseBtn && surpriseView && surpriseCard && surpriseBack && mainEl) {
    surpriseBtn.addEventListener('click', () => {
      const cards = [...document.querySelectorAll('main .card')];
      if (!cards.length) return;
      const pick = cards[Math.floor(Math.random() * cards.length)].cloneNode(true);
      pick.querySelectorAll('img').forEach((img) => (img.loading = 'eager'));
      surpriseCard.replaceChildren(pick);
      const clonedPhoto = pick.querySelector('.photo');
      if (clonedPhoto) initCarousel(clonedPhoto);
      introEl.hidden = true;
      categoryNav.hidden = true;
      mainEl.hidden = true;
      surpriseView.hidden = false;
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
    surpriseBack.addEventListener('click', () => {
      surpriseView.hidden = true;
      introEl.hidden = false;
      categoryNav.hidden = false;
      mainEl.hidden = false;
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  }

  const locateBtn = document.getElementById('locate-btn');
  if (locateBtn) {
    if (!('geolocation' in navigator)) {
      locateBtn.hidden = true;
    } else {
      const originalLabel = locateBtn.textContent;
      locateBtn.addEventListener('click', () => {
        locateBtn.disabled = true;
        locateBtn.textContent = 'Buscando tu ubicación…';
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            const R = 6371000;
            const toRad = (d) => (d * Math.PI) / 180;
            document.querySelectorAll('.card[data-lat]').forEach((card) => {
              const lat = parseFloat(card.dataset.lat);
              const lng = parseFloat(card.dataset.lng);
              const dLat = toRad(lat - latitude);
              const dLng = toRad(lng - longitude);
              const a =
                Math.sin(dLat / 2) ** 2 +
                Math.cos(toRad(latitude)) * Math.cos(toRad(lat)) * Math.sin(dLng / 2) ** 2;
              const meters = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              const label = meters < 1000 ? `${Math.round(meters / 10) * 10} m` : `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
              const el = card.querySelector('.distance');
              if (el) {
                el.textContent = `A ${label} de ti`;
                el.hidden = false;
              }
            });
            locateBtn.hidden = true;
          },
          () => {
            locateBtn.disabled = false;
            locateBtn.textContent = 'No se pudo acceder a tu ubicación';
            setTimeout(() => {
              locateBtn.textContent = originalLabel;
            }, 3000);
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      });
    }
  }

  const topBtn = document.createElement('button');
  topBtn.type = 'button';
  topBtn.className = 'float-top';
  topBtn.setAttribute('aria-label', 'Volver arriba');
  topBtn.textContent = '↑';
  topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  document.body.appendChild(topBtn);
  window.addEventListener(
    'scroll',
    () => topBtn.classList.toggle('show', window.scrollY > 700),
    { passive: true }
  );
})();
