from pathlib import Path
import shutil
root=Path(__file__).resolve().parent
out=root/'dist'
if out.exists(): shutil.rmtree(out)
out.mkdir()
for name in ('index.html','styles.css','guide.js'):
    shutil.copy2(root/name,out/name)
shutil.copytree(root/'imágenes',out/'imágenes')
print('Static site ready in dist/')
