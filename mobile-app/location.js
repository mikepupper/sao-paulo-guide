/* Local recommendations: no coordinates are stored or sent to a server. */
(() => {
  const base = {lat: -23.5433, lng: -46.6491};
  const highlights = new Set([
    'a-casa-do-porco', 'holy-burger', 'coda-bar', 'copan-terraza',
    'galeria-do-rock', 'mercado-municipal-mercadao', 'pinacoteca-luz',
    'masp', 'ims-paulista', 'japan-house', 'beco-do-batman',
    'croma-beer-co', 'komah', 'cine-joia', 'feira-da-liberdade',
    'parque-ibirapuera-y-marquise', 'museu-afro-brasil', 'sesc-pompeia'
  ]);
  function valid(point) {
    return point && Number.isFinite(point.lat) && Number.isFinite(point.lng) &&
      Math.abs(point.lat) <= 90 && Math.abs(point.lng) <= 180;
  }
  function distance(place, origin = base) {
    if (!valid(place) || !valid(origin)) return Infinity;
    const rad = v => v * Math.PI / 180;
    const a = Math.sin(rad(place.lat - origin.lat) / 2) ** 2 +
      Math.cos(rad(origin.lat)) * Math.cos(rad(place.lat)) * Math.sin(rad(place.lng - origin.lng) / 2) ** 2;
    return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, Math.max(0, a))));
  }
  function recommend(places, position) {
    const origin = valid(position) ? position : base;
    const pool = places.filter(p => highlights.has(p.slug) && !p.unconfirmed && valid(p));
    const ranked = pool.map(place => ({place, km: distance(place, origin)}))
      .sort((a, b) => a.km - b.km || a.place.slug.localeCompare(b.place.slug));
    if (!ranked.length) return null;
    const closest = ranked[0];
    const outside = Boolean(position) && distance(base, origin) > 30;
    const result = outside ? ranked.find(p => p.place.slug === 'copan-terraza') || closest : closest;
    return {...result, outside, nearby: !outside && result.km <= 3 && !(position?.accuracy > 1500)};
  }
  function createTracker({navigator: nav, secure, onChange, now = Date.now}) {
    let state = {position: null, status: 'idle', updatedAt: 0};
    let lastAttempt = -Infinity;
    let generation = 0;
    let permission;
    const emit = patch => { state = {...state, ...patch}; onChange({...state}); };
    function reset() {
      generation++;
      emit({position: null, status: 'idle', updatedAt: 0});
    }
    function locate() {
      if (state.status === 'loading') return;
      if (!secure || !nav.geolocation) { emit({status: 'unsupported'}); return; }
      lastAttempt = now();
      const attempt = ++generation;
      emit({status: 'loading'});
      nav.geolocation.getCurrentPosition(result => {
        if (generation !== attempt) return;
        const position = {lat: result.coords.latitude, lng: result.coords.longitude, accuracy: result.coords.accuracy};
        if (!valid(position)) { emit({status: 'unavailable'}); return; }
        emit({position, status: 'ready', updatedAt: now()});
      }, error => {
        if (generation !== attempt) return;
        const denied = error.code === 1;
        emit({status: denied ? 'denied' : error.code === 3 ? 'timeout' : 'unavailable',
          ...(denied ? {position: null, updatedAt: 0} : {})});
      }, {enableHighAccuracy: false, timeout: 12000, maximumAge: 60000});
    }
    async function resume() {
      // Request permission on first opening; refresh on return without continuously watching GPS.
      // Do not automatically repeat a declined or failed first request in this session.
      if (!secure || !nav.geolocation || state.status === 'loading' || now() - lastAttempt < 300000) return;
      try {
        if (nav.permissions?.query) {
          permission = await nav.permissions.query({name: 'geolocation'});
          permission.onchange = () => {
            if (permission.state === 'denied') { reset(); emit({status: 'denied'}); }
          };
          if (permission.state === 'granted' || (permission.state === 'prompt' && lastAttempt === -Infinity)) locate();
          else if (permission.state === 'denied') { reset(); emit({status: 'denied'}); }
          return;
        }
      } catch { /* Some browsers expose geolocation without permission querying. */ }
      if (lastAttempt === -Infinity || state.position) locate();
    }
    return {locate, resume, reset, getState: () => ({...state})};
  }
  window.PocketLocation = {base, distance, recommend, createTracker};
})();
