import json,hashlib
from pathlib import Path
from collections import Counter
from html.parser import HTMLParser
from PIL import Image
from urllib.parse import urlparse,parse_qs,unquote
root=Path(__file__).resolve().parent
places=json.loads((root/'places.json').read_text())
N=len(places)
CATS={'comer','hamburguesas','bares','musica','paseos'}
assert len({p['name'] for p in places})==N,'duplicate names'
assert len({p['slug'] for p in places})==N,'duplicate slugs'
cats=Counter(p['category'] for p in places)
assert set(cats)==CATS,cats
total_images=0
coverage=Counter()
for p in places:
 assert all(p.get(k) for k in ['name','why','what','price','reserve','address','zone']),p['name']
 assert p['tag'] in ('clasico','tendencia'),p['name']
 assert -23.80<=p['lat']<=-23.35 and -46.85<=p['lng']<=-46.35,(p['name'],'coordinates outside São Paulo')
 imgs=p.get('images',[])
 assert len(imgs)<=3,(p['name'],'more than 3 images')
 hashes=set()
 for im in imgs:
  assert all(im.get(k) for k in ['src','source','attribution','alt']),(p['name'],im)
  assert im['src'].startswith('imágenes/')
  path=root/im['src']
  with Image.open(path) as pic:pic.verify()
  h=hashlib.md5(path.read_bytes()).hexdigest()
  assert h not in hashes,(p['name'],'duplicate photo',im['src'])
  hashes.add(h)
 total_images+=len(imgs)
 coverage[len(imgs)]+=1
class Check(HTMLParser):
 def __init__(self):super().__init__();self.images=[];self.maps=[];self.ids=set();self.anchors=[];self.cards=[];self.dots=[]
 def handle_starttag(self,tag,attrs):
  d=dict(attrs)
  if 'id' in d:assert d['id'] not in self.ids;self.ids.add(d['id'])
  if tag=='img':self.images.append(d);assert d.get('alt')
  if tag=='article' and 'card' in d.get('class',''):self.cards.append(d)
  if tag=='span' and d.get('class','').startswith('dot'):self.dots.append(d)
  if tag=='a':
   href=d.get('href','')
   if href.startswith('#'):self.anchors.append(href[1:])
   if 'google.com/maps/dir/' in href:self.maps.append(href)
check=Check();check.feed((root/'index.html').read_text())
assert len(check.images)==total_images,(len(check.images),total_images)
assert len(check.maps)==N
assert len(check.cards)==N
multi=sum(len(p['images']) for p in places if len(p.get('images',[]))>1)
assert len(check.dots)==multi,(len(check.dots),multi)
for c in check.cards:assert c.get('data-lat') and c.get('data-lng'),c
for img in check.images:assert (root/unquote(img['src'])).is_file()
for target in check.anchors:assert target in check.ids,target
for url in check.maps:
 q=parse_qs(urlparse(url).query)
 assert q['api']==['1'] and q['destination'][0]
print(f'Verified: {N} distinct places in {len(cats)} categories, {total_images} valid photos, {N} map links, all internal links.')
print('Categories:',dict(cats))
print('Photos per place:',{k:coverage[k] for k in sorted(coverage)})
