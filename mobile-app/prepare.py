"""Refresh this independent version from the original guide's content."""
from pathlib import Path
import json, shutil
root=Path(__file__).resolve().parent
source=root.parent
places=json.loads((source/'places.json').read_text())
photos={}
for path in sorted(source.glob('photos_*.json')):
    photos.update(json.loads(path.read_text()))
for place in places:
    if place['slug'] in photos:
        place.update({k:v for k,v in photos[place['slug']].items() if k in ('images','website')})
    place['images']=[im for im in place['images'] if (source/im['image']).is_file()]
    for im in place['images']:
        target=root/im['image'];target.parent.mkdir(exist_ok=True)
        shutil.copy2(source/im['image'],target)
data={'places':places,'tips':json.loads((source/'tips.json').read_text())}
(root/'data.js').write_text('window.GUIDE_DATA = '+json.dumps(data,ensure_ascii=False)+';\n')
print(f'Ready: {len(places)} places')

# Keep the offline release in sync with content changes.
import runpy
runpy.run_path(str(root / "build_offline.py"))
