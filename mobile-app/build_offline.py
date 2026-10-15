"""Generate a content-based offline release identifier. No third-party dependencies."""
import hashlib, json
from pathlib import Path
root = Path(__file__).resolve().parent
files = ['index.html', 'app.css', 'app.js', 'location.js', 'data.js', 'install.js', 'manifest.webmanifest', 'icon.svg', 'icons/apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png']
digest = hashlib.sha256()
for name in files + ['sw.js']:
    digest.update(name.encode())
    digest.update((root/name).read_bytes())
config = {'version': digest.hexdigest()[:16], 'files': ['./'+name for name in files]}
(root/'offline-assets.js').write_text('self.OFFLINE = '+json.dumps(config)+';\n')
print('Offline release:', config['version'])
