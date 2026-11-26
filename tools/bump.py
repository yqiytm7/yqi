#!/usr/bin/env python3
"""Versions for YQI.
  python3 tools/bump.py --staging   new version of the staging copy (stg/*.js + staging.html)
  python3 tools/bump.py --release   make staging live: stg/*.js → root, staging.html → index.html, version.json
app.js is edited in stg/app/ (10 parts) and built by tools/appjs.py; bump builds it.
Edit code only in stg/ ; test on /staging ; then --release."""
import re, sys, time, os, shutil, glob, subprocess
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
v = time.strftime("%Y%m%d-%H%M%S", time.gmtime(time.time() + 5 * 3600))
def setv(app):
    app = "stg/app/01-core.js"; subprocess.check_call([sys.executable, "tools/appjs.py", "check"])
    a = open(app, encoding="utf-8", newline="").read(); a = re.sub(r'var V = "\d{8}-\d{6}"', 'var V = "%s"' % v, a, count=1); open(app, "w", encoding="utf-8", newline="").write(a)
    subprocess.check_call([sys.executable, "tools/appjs.py", "build"])
h = open("staging.html", encoding="utf-8").read(); h = re.sub(r'(\.js\?v=)\d{8}-\d{6}', r'\g<1>' + v, h)
if "--release" in sys.argv:
    setv("stg/app.js"); open("staging.html", "w", encoding="utf-8").write(h)
    for f in glob.glob("stg/*.js"): shutil.copy(f, os.path.basename(f))
    open("index.html", "w", encoding="utf-8").write(h.replace('src="stg/', 'src="'))
    open("version.json", "w").write('{"v":"%s"}\n' % v); print("released", v)
else:
    setv("stg/app.js"); open("staging.html", "w", encoding="utf-8").write(h); print("staging", v)
