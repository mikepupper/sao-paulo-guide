(() => {
'use strict';
const {places,tips}=window.GUIDE_DATA;
const $=id=>document.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paths={compass:'<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5Z"/>',pin:'<path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',bookmark:'<path d="M6 4h12v17l-6-4-6 4Z"/>',book:'<path d="M12 5v15M3 4c4-1 6 0 9 1 3-1 5-2 9-1v15c-4-1-6 0-9 1-3-1-5-2-9-1Z"/>',search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',filter:'<path d="M3 7h9m4 0h5M3 17h3m4 0h11"/><circle cx="14" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',spark:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM20 2v4m-2-2h4"/>',food:'<path d="M5 3v7m3-7v7m3-7v7M5 7h6m-3 3v11M19 21V3c-4 2-4 9 0 9"/>',burger:'<path d="M4 9a8 6 0 0 1 16 0ZM3 13h18M4 17h16v2H4Z"/><path d="M9 5h.01M14 6h.01"/>',wine:'<path d="M5 3h14l-7 9Zm7 9v9m-5 0h10M7 7h10"/>',music:'<path d="M9 18V5l11-2v13M9 9l11-2"/><ellipse cx="6" cy="18" rx="3" ry="3"/><ellipse cx="17" cy="16" rx="3" ry="3"/>',walk:'<path d="m5 20 5-7 4 3v5m-8-9 4-5 4 4h4M10 7l1 6"/><circle cx="13" cy="3" r="2"/>',arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>',locate:'<circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>',leaf:'<path d="M20 3C6 1 1 9 6 16s17 3 14-13ZM5 21 16 8"/>'};
const icon=name=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.compass}</svg>`;
const cats=[['','Todo','compass'],['comer','Comer','food'],['hamburguesas','Burgers','burger'],['bares','Bares','wine'],['musica','Música','music'],['paseos','Paseos','walk']];
const catName=id=>cats.find(c=>c[0]===id)?.[1]||id;
let saved=new Set();try{const value=JSON.parse(localStorage.getItem('sp-pocket-saved')||'[]');if(Array.isArray(value))saved=new Set(value.filter(s=>places.some(p=>p.slug===s)));}catch{}
let view='explorar',category='',query='',zone='',style='',position=null,showAll=false,toastTimer;
const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const base=window.PocketLocation.base;
function distance(p){return window.PocketLocation.distance(p,position||base);}
const dist=p=>`${distance(p).toFixed(1).replace('.',',')} km`;
const sorted=items=>[...items].sort((a,b)=>distance(a)-distance(b));
function toast(message){$('toast').textContent=message;$('toast').classList.add('toast-visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('toast-visible'),2800);}
function navigation(){const markup=[['explorar','Explorar','compass'],['cerca','Cerca de mí','pin'],['guardados','Guardados','bookmark'],['guia','La guía','book']].map(([id,label,i])=>`<a href="#${id}" class="nav-item" ${view===id?'aria-current="page"':''}>${icon(i)}<span>${label}</span>${id==='guardados'&&saved.size?`<span class="badge">${saved.size}</span>`:''}</a>`).join('');document.querySelectorAll('.desktop-nav,.bottom-nav').forEach(n=>n.innerHTML=markup);}
function photo(p){return p.images.length?`<img src="${esc(p.images[0].image)}" alt="${esc(p.images[0].alt)}" loading="lazy">`:`<span class="no-photo ${esc(p.category)}" aria-hidden="true">${esc(p.name.charAt(0))}</span>`;}
function saveButton(p){return `<button class="save-button" data-save="${esc(p.slug)}" aria-label="${saved.has(p.slug)?'Quitar de guardados':'Guardar'} ${esc(p.name)}" aria-pressed="${saved.has(p.slug)}">${icon('bookmark')}</button>`;}
function card(p){return `<article class="place-card"><button class="card-open" data-open="${esc(p.slug)}" aria-label="Ver ${esc(p.name)}"><div class="card-image">${photo(p)}<span class="photo-tag">${p.tag==='tendencia'?'↗ Tendencia':'✦ Clásico'}</span></div><div class="card-body"><span class="card-kicker">${esc(catName(p.category))}</span><h3>${esc(p.name)}</h3><p>${esc(p.zone)}</p><div class="card-meta"><span>${esc(p.price.split(' (')[0])}</span><span>${dist(p)} aprox.</span></div></div></button>${saveButton(p)}</article>`;}
function row(p){return `<article class="near-row"><button class="row-open" data-open="${esc(p.slug)}"><span class="thumb">${photo(p)}</span><span><h3>${esc(p.name)}</h3><p>${esc(catName(p.category))} · ${esc(p.price.split(' (')[0])}</p><p>${dist(p)} aprox. · ${p.tag==='tendencia'?'Tendencia':'Clásico'}</p></span></button>${saveButton(p)}</article>`;}
function section(title,sub,action=''){return `<div class="section-title"><div><h2>${title}</h2>${sub?`<p>${sub}</p>`:''}</div>${action}</div>`;}
const empty=(title,text)=>`<div class="empty">${icon(view==='guardados'?'bookmark':'search')}<h2>${title}</h2><p>${text}</p><button class="text-button" data-action="clear">Explorar todos los lugares ${icon('arrow')}</button></div>`;
function render(){navigation();updateLocationUI();$('categories').innerHTML=cats.map(([id,name,i])=>`<button class="category-button" data-category="${id}" aria-pressed="${category===id}">${icon(i)}${name}</button>`).join('');const titles={explorar:['SÃO PAULO / GUÍA DE CALLE','Sal a la calle.','Buen comer. Buen ruido. Cero vueltas.'],cerca:['A TU ALREDEDOR','Tu próxima parada.','Encuentra los lugares más próximos de la guía.'],guardados:['TU PROPIA SELECCIÓN','Tus guardados','Los lugares que quieres conocer, juntos aquí.'],guia:['ANTES DE SALIR','Tu guía local','Pequeñas claves para disfrutar São Paulo.']};const t=titles[view];$('eyebrow').textContent=t[0];$('page-title').textContent=t[1];$('subtitle').textContent=t[2];$('explore-controls').hidden=view==='guia';
if(view==='guia'){renderGuide();return;}
let list=places.filter(p=>(!category||p.category===category)&&(!zone||p.zone===zone)&&(!style||p.tag===style)&&(!query||normalize([p.name,p.zone,p.why,p.what].join(' ')).includes(normalize(query)))&&(view!=='guardados'||saved.has(p.slug)));
if(view==='cerca')list=sorted(list);
const filtered=category||query||zone||style;
if(view==='explorar'&&!filtered&&!showAll){const featuredSlug=window.PocketLocation.recommend(places,position)?.place.slug;const picks=['holy-burger','bar-da-dona-onca','dogma-tap-room','cervejaria-central'].map(s=>places.find(p=>p.slug===s)).filter(p=>p&&p.slug!==featuredSlug).slice(0,3);$('content').innerHTML=`${heroMarkup()}${section('En el radar','Lugares que merecen una parada.',`<button class="text-button" data-action="all">Ver los 93 ${icon('arrow')}</button>`)}<div class="card-grid featured-grid">${picks.map(card).join('')}</div>${section(position?'Lugares más próximos':'Empieza por tu barrio',position?'Desde tu ubicación · Distancias en línea recta':'Cerca de Vila Buarque · Distancias en línea recta',`<a class="text-button" href="#cerca">Ver cerca ${icon('arrow')}</a>`)}<div class="near-list">${sorted(places).slice(0,4).map(row).join('')}</div><a class="note-banner" href="#guia">${icon('book')}<div><strong>Un poco de contexto, un mejor paseo.</strong><p>Reservas, transporte y consejos antes de salir.</p></div>${icon('arrow')}</a>`;
}else{const panel=view==='cerca'?`<div class="location-panel"><p><strong>${position?'Desde tu ubicación':'Desde Vila Buarque'}</strong>Distancias aproximadas en línea recta.<br>${position?'Tu ubicación se usa solo en esta sesión.':'Usa tu ubicación para ordenar los lugares más cercanos.'}</p><button class="primary" data-action="locate" ${tracker.getState().status==='loading'?'disabled':''}>${icon('locate')}${tracker.getState().status==='loading'?'Buscando ubicación…':position?'Actualizar ubicación':'Usar mi ubicación'}</button></div>`:'';$('content').innerHTML=panel+section(`${list.length} ${list.length===1?'lugar':'lugares'}${category?' · '+catName(category):''}`,view==='guardados'?'Guardados en este navegador.':view==='cerca'?'De más cerca a más lejos.':'Encuentra tu próximo buen plan.',filtered?'<button class="text-button" data-action="clear">Limpiar</button>':'')+(list.length?`<div class="card-grid">${list.map(card).join('')}</div>`:empty(view==='guardados'&&!filtered?'Tu lista empieza con un lugar.':'Todavía no hay coincidencias.',view==='guardados'&&!filtered?'Toca el marcador de cualquier lugar para tenerlo a mano cuando salgas.':'Prueba otro nombre, barrio o categoría.'));}}
function renderGuide(){const list=items=>`<ul>${items.map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`;const blocks=[['10 planes para empezar',list(tips.top10)],['Qué reservar con tiempo',list(tips.reservas)],[tips.days.title,list(tips.days.items)],['Seguridad y transporte',`<p>${esc(tips.seguridad.intro)}</p>${list(tips.seguridad.items)}`],['Cómo llegar desde Vila Buarque',tips.how.map(t=>`<h3>${esc(t.zone)}</h3><p>${esc(t.text)}</p>${t.items?list(t.items):''}`).join('')],['Cómo leer esta guía','<p>R$ económico · R$$ medio · R$$$ caro. Precios estimados por persona.</p><p>Clásico: una referencia histórica. Tendencia: una propuesta de moda en la selección original.</p><p>“Sin confirmar 2026” indica que faltaba una fuente reciente al preparar el directorio. Confirma antes de ir.</p><p>Las distancias son en línea recta; algunas coordenadas son aproximadas. La referencia de Vila Buarque representa el barrio, no tu alojamiento.</p>']];$('content').innerHTML='<p class="tip-intro">Contenido del directorio original, revisado el 9 de octubre de 2026. Confirma horarios, precios y disponibilidad antes de ir.</p>'+blocks.map(([title,body],i)=>`<details class="tip-section" ${i===0?'open':''}><summary>${esc(title)}</summary><div class="tip-body">${body}</div></details>`).join('');}
function detailPhotos(p){
  if(!p.images.length)return photo(p);
  const multiple=p.images.length>1;
  return `<section class="detail-carousel" aria-label="Fotos de ${esc(p.name)}" aria-roledescription="carrusel"><div class="photo-track" ${multiple?'tabindex="0" aria-label="Fotos del lugar. Usa las flechas para cambiar de foto."':''}>${p.images.map((im,i)=>`<figure class="photo-slide" role="group" aria-roledescription="diapositiva" aria-label="${i+1} de ${p.images.length}"><img src="${esc(im.image)}" alt="${esc(im.alt)}" loading="${i===0?'eager':'lazy'}" draggable="false"></figure>`).join('')}</div>${multiple?`<button class="photo-arrow photo-prev" aria-label="Foto anterior" disabled>${icon('arrow')}</button><button class="photo-arrow photo-next" aria-label="Foto siguiente">${icon('arrow')}</button><div class="photo-pagination"><div class="photo-dots" aria-label="Elegir foto">${p.images.map((im,i)=>`<button data-slide="${i}" aria-label="Ver foto ${i+1}" ${i===0?'aria-current="true"':''}><span></span></button>`).join('')}</div><span class="photo-counter" aria-live="polite" aria-atomic="true">1 / ${p.images.length}</span></div>`:''}</section>`;
}
let cleanupCarousel=()=>{};
function initDetailCarousel(){
  cleanupCarousel();
  const carousel=$('detail-content').querySelector('.detail-carousel');
  if(!carousel)return;
  const track=carousel.querySelector('.photo-track');
  const dots=[...carousel.querySelectorAll('[data-slide]')];
  if(!dots.length)return;
  const previous=carousel.querySelector('.photo-prev');
  const next=carousel.querySelector('.photo-next');
  const counter=carousel.querySelector('.photo-counter');
  let current=0,frame=0;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  function update(){
    current=Math.max(0,Math.min(dots.length-1,Math.round(track.scrollLeft/Math.max(1,track.clientWidth))));
    dots.forEach((dot,i)=>{if(i===current)dot.setAttribute('aria-current','true');else dot.removeAttribute('aria-current');});
    previous.disabled=current===0;next.disabled=current===dots.length-1;
    const label=`${current+1} / ${dots.length}`;
    if(counter.textContent!==label)counter.textContent=label;
  }
  function go(index){
    track.scrollTo({left:Math.max(0,Math.min(dots.length-1,index))*track.clientWidth,behavior:reduced.matches?'instant':'smooth'});
  }
  function scroll(){cancelAnimationFrame(frame);frame=requestAnimationFrame(update);}
  function key(event){
    const target={ArrowLeft:current-1,ArrowRight:current+1,Home:0,End:dots.length-1}[event.key];
    if(target===undefined)return;
    event.preventDefault();go(target);
  }
  previous.onclick=()=>go(current-1);next.onclick=()=>go(current+1);
  dots.forEach((dot,i)=>dot.onclick=()=>go(i));
  track.addEventListener('scroll',scroll,{passive:true});
  carousel.addEventListener('keydown',key);
  const resize=new ResizeObserver(()=>{track.scrollTo({left:current*track.clientWidth,behavior:'instant'});update();});
  resize.observe(track);
  cleanupCarousel=()=>{cancelAnimationFrame(frame);resize.disconnect();track.removeEventListener('scroll',scroll);carousel.removeEventListener('keydown',key);};
  update();
}
$('detail').addEventListener('close',()=>cleanupCarousel());
function openDetail(slug){const p=places.find(p=>p.slug===slug);if(!p)return;const map='https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(`${p.name}, ${p.address}, São Paulo`);$('detail-content').innerHTML=`<div class="detail-top">${detailPhotos(p)}<button class="icon-button" data-action="close" aria-label="Cerrar ficha">${icon('close')}</button></div><div class="detail-body"><span class="card-kicker">${esc(catName(p.category))} · ${p.tag==='tendencia'?'Tendencia':'Clásico'}</span><h2 id="detail-title">${esc(p.name)}</h2><p class="detail-description">${esc(p.why)}</p>${p.unconfirmed?`<p class="warning">${esc(p.unconfirmed)} · Confirma que sigue abierto antes de ir.</p>`:''}<dl><div class="detail-fact"><dt>${esc(p.what_label)}</dt><dd>${esc(p.what)}</dd></div><div class="detail-fact"><dt>Precio por persona</dt><dd>${esc(p.price)}</dd></div><div class="detail-fact"><dt>Reserva</dt><dd>${esc(p.reserve)}</dd></div><div class="detail-fact"><dt>Dirección</dt><dd>${esc(p.address)}<br>${esc(p.zone)} · ${dist(p)} desde ${position?'tu ubicación':'Vila Buarque'}${p.approx_location?' · Ubicación aproximada':''}</dd></div></dl>${p.website?`<a class="text-button" href="${esc(p.website)}" target="_blank" rel="noopener noreferrer">Sitio oficial ↗</a>`:''}<p class="credits">Distancia en línea recta. Datos de octubre de 2026; confirma horarios y precios.${p.images.map(im=>`<br><a href="${esc(im.source)}" target="_blank" rel="noopener noreferrer">${esc(im.attribution)}</a>`).join('')}</p></div><div class="detail-actions"><button class="detail-save" data-save="${esc(p.slug)}" aria-label="${saved.has(p.slug)?'Quitar de guardados':'Guardar lugar'}" aria-pressed="${saved.has(p.slug)}">${icon('bookmark')}</button><a class="primary" href="${esc(map)}" target="_blank" rel="noopener noreferrer">${icon('pin')}Cómo llegar ${icon('arrow')}</a></div>`;$('detail').showModal();$('detail').scrollTop=0;initDetailCarousel();}
function toggleSave(slug){const p=places.find(p=>p.slug===slug);if(!p)return;saved.has(slug)?saved.delete(slug):saved.add(slug);let persisted=true;try{localStorage.setItem('sp-pocket-saved',JSON.stringify([...saved]));}catch{persisted=false;}document.querySelectorAll('[data-save]').forEach(b=>{if(b.dataset.save===slug){b.setAttribute('aria-pressed',saved.has(slug));b.setAttribute('aria-label',`${saved.has(slug)?'Quitar de guardados':'Guardar'} ${p.name}`);}});navigation();if(view==='guardados')render();toast(persisted?(saved.has(slug)?'Guardado para tu próxima salida':'Lugar eliminado de guardados'):'Guardado solo durante esta sesión');}
function clear(){showAll=false;category=query=zone=style='';$('search').value='';$('zone').value='';$('style').value='';}
function heroMarkup(){
  const choice=window.PocketLocation.recommend(places,position);
  if(!choice)return '';
  const p=choice.place;
  const image=p.slug==='copan-terraza'?(p.images.find(i=>i.image.includes('-2.'))||p.images[0]):p.images[0];
  const label=!position?'UN IMPERDIBLE DESDE TU BASE':choice.outside?'PARA TU VIAJE A SÃO PAULO':choice.nearby?'UN IMPERDIBLE CERCA DE TI':'UN IMPERDIBLE PARA EXPLORAR';
  const source=position?'tu ubicación':'Vila Buarque';
  const description=({'holy-burger':'Hamburguesas de carne dry aged, destacadas en la selección de esta guía.','copan-terraza':'El ícono de Niemeyer y una vista distinta de São Paulo.','coda-bar':'Cócteles y música en vivo en Vila Buarque.','galeria-do-rock':'Un clásico para explorar vinilos y cultura rock.','mercado-municipal-mercadao':'El Mercado Municipal, un clásico del centro paulista.'})[p.slug]||p.why;
  const reason=choice.outside?'Estás fuera de nuestra zona de recomendaciones. Este es un buen punto de partida para cuando llegues.':`El más próximo de nuestra selección de imperdibles · ${dist(p)} desde ${source}, en línea recta.`;
  return `<section class="hero dynamic-hero" aria-label="Lugar recomendado">${image?`<img src="${esc(image.image)}" alt="${esc(image.alt)}" fetchpriority="high">`:`<div class="hero-art" aria-hidden="true">${icon('compass')}</div>`}<div class="hero-copy"><span class="hero-label">${label}</span><p class="hero-zone">${esc(p.zone)}</p><h2>${esc(p.name)}</h2><p>${esc(description)}</p><p class="hero-reason">${esc(reason)}</p><button data-open="${esc(p.slug)}">Descubrir este lugar ${icon('arrow')}</button><p class="hero-availability">Consulta horarios y reserva en la ficha.</p></div></section>`;
}
function updateLocationUI(){
  const state=tracker.getState();
  $('location-prompt').hidden=view!=='explorar'||Boolean(category||query||zone||style||showAll);
  let title='Un imperdible cerca de ti.';
  let message='Comparte tu ubicación para elegir el imperdible más cercano. Se usa solo en esta sesión.';
  if(position){title='Tu ubicación, tu próximo plan.';message='Actualizada a las '+new Date(state.updatedAt).toLocaleTimeString('es',{hour:'2-digit',minute:'2-digit'})+'. Se usa solo en esta sesión.';}
  if(state.status==='loading')message='Buscando tu ubicación… Puedes seguir explorando mientras tanto.';
  if(state.status==='denied')message='Ubicación no permitida. Usamos Vila Buarque; puedes habilitar el permiso en los ajustes del navegador.';
  if(state.status==='timeout'||state.status==='unavailable')message=position?'No pudimos actualizarla. Mostramos tu última ubicación de esta sesión.':'No pudimos obtener tu ubicación. Por ahora usamos Vila Buarque.';
  if(state.status==='unsupported')message='La ubicación requiere HTTPS y un navegador compatible. Por ahora usamos Vila Buarque.';
  if(state.status==='ready'&&position?.accuracy>1500)message+=' La señal es poco precisa; las recomendaciones son orientativas.';
  $('location-title').textContent=title;$('location-message').textContent=message;
  $('location-trigger').disabled=state.status==='loading';
  $('location-trigger').textContent=state.status==='loading'?'Buscando…':position?'Actualizar':state.status==='idle'?'Usar mi ubicación':'Reintentar';
  document.querySelector('.base-label').innerHTML=`<span class="location-dot"></span>${position?'Punto de partida':'Tu punto de partida'} <strong>${position?'Tu ubicación':'Vila Buarque'}</strong>`;
  document.querySelector('.base-label').classList.toggle('has-location',Boolean(position));
}
function locate(){tracker.locate();}
const tracker=window.PocketLocation.createTracker({navigator,secure:window.isSecureContext,onChange:state=>{
  position=state.position;render();
  if(state.status==='ready')toast('Tu recomendación se actualizó según tu ubicación');
  if(['denied','timeout','unavailable','unsupported'].includes(state.status))toast(state.position?'No se pudo actualizar. Conservamos tu última ubicación.':'No se obtuvo ubicación. Usamos Vila Buarque.');
}});
document.addEventListener('click',event=>{const b=event.target.closest('button');if(!b)return;if(b.dataset.open)openDetail(b.dataset.open);if(b.dataset.save)toggleSave(b.dataset.save);if('category'in b.dataset){category=b.dataset.category;render();document.querySelector(`[data-category="${category}"]`).focus({preventScroll:true});}switch(b.dataset.action){case'close':$('detail').close();break;case'clear':clear();if(view==='guardados'){location.hash='explorar';}else render();break;case'all':showAll=true;render();$('search').focus();break;case'locate':locate(b);break;}});
$('search').addEventListener('input',e=>{query=e.target.value.trim();render();});$('zone').addEventListener('change',e=>{zone=e.target.value;render();});$('style').addEventListener('change',e=>{style=e.target.value;render();});$('filter-button').onclick=()=>{const open=$('filters').hidden;$('filters').hidden=!open;$('filter-button').setAttribute('aria-expanded',open);};$('reset').onclick=()=>{clear();render();};$('surprise').innerHTML=icon('spark');$('surprise').onclick=()=>openDetail(places[Math.floor(Math.random()*places.length)].slug);$('search-icon').innerHTML=icon('search');$('filter-button').innerHTML=icon('filter');$('zone').innerHTML+=[...new Set(places.map(p=>p.zone))].map(z=>`<option>${esc(z)}</option>`).join('');$('detail').addEventListener('click',e=>{if(e.target===$('detail')){const r=$('detail').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('detail').close();}});
document.addEventListener('keydown',e=>{if(e.key==='/'&&!$('detail').open&&!['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName)&&view!=='guia'){e.preventDefault();$('search').focus();}});
function route(){const next=location.hash.slice(1);if(next==='main')return;view=['explorar','cerca','guardados','guia'].includes(next)?next:'explorar';clear();$('filters').hidden=true;$('filter-button').setAttribute('aria-expanded','false');render();window.scrollTo({top:0,behavior:'instant'});}window.addEventListener('hashchange',route);route();tracker.resume();
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')tracker.resume();});
window.addEventListener('pageshow',event=>{if(event.persisted)tracker.resume();});
})();
