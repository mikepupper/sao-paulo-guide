(() => {
  const help = document.getElementById('install-help');
  const status = document.getElementById('connection-status');
  const standalone = window.matchMedia('(display-mode: standalone)');
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  let dismissed = false;
  try { dismissed = localStorage.getItem('sp-install-dismissed') === 'yes'; } catch {}
  function updateHelp() {
    help.hidden = !ios || standalone.matches || navigator.standalone === true || dismissed;
  }
  document.getElementById('dismiss-install').addEventListener('click', () => {
    dismissed = true;
    try { localStorage.setItem('sp-install-dismissed', 'yes'); } catch {}
    updateHelp();
  });
  standalone.addEventListener('change', updateHelp);
  updateHelp();
  function connection() {
    status.hidden = navigator.onLine;
    status.textContent = 'Sin conexión · Puedes consultar la guía y tus guardados. Los mapas y las fotos no descargadas necesitan internet.';
  }
  window.addEventListener('online', connection);
  window.addEventListener('offline', connection);
  connection();
  if ('serviceWorker' in navigator && window.isSecureContext && location.protocol !== 'file:') {
    window.addEventListener('load', async () => {
      try {
        await navigator.serviceWorker.register('./sw.js', { scope: './', updateViaCache: 'none' });
      } catch (error) {
        status.hidden = false;
        status.textContent = 'La guía está disponible online. No se pudo preparar el acceso sin conexión; vuelve a abrirla con internet.';
        console.warn('Offline setup failed:', error);
      }
    });
  }
})();
