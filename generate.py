import json,html
from pathlib import Path
from urllib.parse import urlencode
root=Path(__file__).resolve().parent
H=lambda value:html.escape(str(value),quote=True)
categories=[
 ('comer','Dónde comer','Comer','Desde la mesa más famosa del centro hasta cocinas de barrio en Pinheiros y Paraíso.'),
 ('hamburguesas','Hamburguesas','Burgers','Smash, dry aged y clásicas paulistas, de la más cercana a la más lejana.'),
 ('bares','Bares y cerveja artesanal','Bares','Brewpubs, listening bars y botecos de los de siempre.'),
 ('musica','Música y vida nocturna','Música','Salas de shows, bares con bandas y noches de rock, indie y jazz.'),
 ('paseos','Clásicos y paseos','Paseos','Museos, ferias, miradores y calles para caminar.')
]
places=json.loads((root/'places.json').read_text())
tips=json.loads((root/'tips.json').read_text())
TAGS={'clasico':('','✦ Clásico'),'tendencia':('local','↗ Tendencia')}
nav=''.join(f'<a href="#{cid}" aria-current="{str(i==0).lower()}"><span class="nav-number">0{i+1}</span>{short}</a>' for i,(cid,title,short,desc) in enumerate(categories))
nav+=f'<a href="#consejos" aria-current="false"><span class="nav-number">0{len(categories)+1}</span>Consejos</a>'
def map_url(p):
 vague=p.get('approx_location') or 'confirm' in p['address'].lower()
 dest=p['name']+', São Paulo' if vague else p['name']+', '+p['address']+', São Paulo'
 return 'https://www.google.com/maps/dir/?'+urlencode({'api':'1','destination':dest})
def card(p,first):
 imgs=p.get('images',[])
 tagcls,taglabel=TAGS[p['tag']]
 tag=f'<span class="tag {tagcls}">{taglabel}</span>'
 if imgs:
  slides=''.join(f'<img src="{H(im["src"])}" alt="{H(im.get("alt",p["name"]+" en São Paulo"))}" width="720" height="480" loading="{"eager" if first and k==0 else "lazy"}" decoding="async">' for k,im in enumerate(imgs))
  dots=('<div class="dots">'+''.join(f'<span class="dot{" active" if k==0 else ""}"></span>' for k in range(len(imgs)))+'</div>') if len(imgs)>1 else ''
  figure=f'<figure class="photo"><div class="carousel">{slides}</div>{tag}{dots}</figure>'
  credits='<details class="photo-credit"><summary>Crédito de las fotografías</summary>'+''.join(f'<p>{H(im["attribution"])} <a href="{H(im["source"])}" target="_blank" rel="noopener noreferrer">Fuente original ↗</a></p>' for im in imgs)+'</details>'
 else:
  figure=f'<figure class="photo empty"><span class="initial" aria-hidden="true">{H(p["name"][0])}</span>{tag}</figure>'
  credits=''
 flag=f'<span class="flag">{H(p["unconfirmed"])}</span>' if p.get('unconfirmed') else ''
 site=f'<a class="source-link" href="{H(p["website"])}" target="_blank" rel="noopener noreferrer" aria-label="Sitio web: {H(p["name"])}">Sitio ↗</a>' if p.get('website') else ''
 return f'''<article class="card" data-lat="{p['lat']}" data-lng="{p['lng']}">
   {figure}
   <div class="card-body"><p class="card-meta">{H(p['zone'])}{flag}</p><h3>{H(p['name'])}</h3><p class="description">{H(p['why'])}</p><p class="practical"><strong>{H(p['what_label'])}:</strong> {H(p['what'])}</p><dl class="facts"><div><dt>Precio</dt><dd>{H(p['price'])}</dd></div><div><dt>Reserva</dt><dd>{H(p['reserve'])}</dd></div></dl><p class="address">{H(p['address'])}</p><p class="distance" hidden></p></div>
   <div class="card-bottom"><a class="map-link" href="{H(map_url(p))}" target="_blank" rel="noopener noreferrer" aria-label="Cómo llegar a {H(p['name'])}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m21 3-7 18-3-8-8-3 18-7Z"/><path d="m11 13 10-10"/></svg>Cómo llegar</a>{site}</div>
   {credits}
  </article>'''
sections=[]
for i,(cid,title,short,desc) in enumerate(categories):
 group=[p for p in places if p['category']==cid]
 if not group:continue
 cards=''.join(card(p,i==0 and j==0) for j,p in enumerate(group))
 sections.append(f'<section class="category" id="{cid}" aria-labelledby="title-{cid}"><header class="section-heading"><div><span class="section-number">Capítulo 0{i+1}</span><h2 id="title-{cid}">{title}</h2><p>{desc}</p></div><span class="count">{len(group)} lugares · {sum(p["tag"]=="tendencia" for p in group)} de tendencia</span></header><div class="cards">{cards}</div></section>')
ul=lambda items:'<ul>'+''.join(f'<li>{H(x)}</li>' for x in items)+'</ul>'
how=''.join(f'<h4>{H(h["zone"])}</h4><p>{H(h["text"])}</p>{ul(h["items"]) if h.get("items") else ""}' for h in tips['how'])
info=f'''<section class="category info" id="consejos" aria-labelledby="title-consejos"><header class="section-heading"><div><span class="section-number">Capítulo 0{len(categories)+1}</span><h2 id="title-consejos">Antes de salir</h2><p>Cómo moverse, qué reservar con tiempo y cómo cuidarse de noche.</p></div></header>
<div class="tips"><div class="tip"><h3>Top 10 imperdibles</h3>{ul(tips['top10'])}</div>
<div class="tip"><h3>Reservas urgentes</h3>{ul(tips['reservas'])}</div>
<div class="tip"><h3>{H(tips['days']['title'])}</h3>{ul(tips['days']['items'])}</div>
<div class="tip"><h3>Seguridad y transporte de noche</h3><p>{H(tips['seguridad']['intro'])}</p>{ul(tips['seguridad']['items'])}</div>
<div class="tip"><h3>Cómo llegar desde Vila Buarque</h3>{how}</div></div></section>'''
sections.append(info)
legend=''.join(f'<p>{H(x)}</p>' for x in tips['legend'])
total=len(places)
page=f'''<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#264f43"><meta name="robots" content="noindex"><meta name="description" content="Guía de bolsillo de São Paulo: {total} lugares para comer, beber, escuchar música y pasear, ordenados desde Vila Buarque."><title>São Paulo · Guía de bolsillo</title><link rel="stylesheet" href="styles.css"><script src="guide.js" defer></script></head>
<body id="arriba"><a class="skip" href="#guia">Saltar a los lugares</a><header class="masthead"><a class="wordmark" href="#arriba">São Paulo<span>GUÍA DE BOLSILLO</span></a><button type="button" class="surprise-btn" id="surprise-btn">Sorpréndeme</button></header>
<div class="intro"><p class="intro-lead">Un directorio para elegir según el plan de hoy: comida, bares, música y paseos, de más cerca a más lejos de Vila Buarque.</p><div class="stats"><span><strong>{total}</strong> lugares</span><span><strong>{len(categories)}</strong> categorías</span><span><strong>{sum(p['tag']=='tendencia' for p in places)}</strong> de tendencia</span></div><button type="button" class="locate-btn" id="locate-btn">Activar distancias a tu ubicación</button></div>
<nav class="category-nav" aria-label="Categorías de lugares"><div class="nav-inner">{nav}</div></nav>
<section id="surprise-view" class="surprise-view" hidden aria-label="Lugar sorpresa"><button type="button" class="back-btn" id="surprise-back">← Volver</button><div id="surprise-card"></div></section>
<main class="guide" id="guia">{''.join(sections)}
<aside class="guide-note"><h2>Cómo leer<br>este directorio.</h2><div>{legend}<p>Datos revisados el 9 de octubre de 2026. Horarios, precios y aperturas cambian: confirmen en el sitio o el Instagram del lugar antes de ir. Las distancias se calculan en línea recta desde tu ubicación y algunas coordenadas son aproximadas.</p></div></aside><a class="back-top" href="#arriba">↑ Volver al principio</a></main>
<footer class="footer"><span>São Paulo · Guía de bolsillo · Octubre 2026</span><span>De más cerca a más lejos de Vila Buarque.</span></footer></body></html>'''
(root/'index.html').write_text(page)
print(f'Generated {total} places')
