#!/usr/bin/env python3
"""New version: python3 tools/bump.py [--staging]
Sets a fresh version in app.js and in the script links of the shell
(staging.html with --staging, index.html + version.json otherwise)."""
import re, sys, time, os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
v = time.strftime("%Y%m%d-%H%M%S", time.gmtime(time.time() + 5 * 3600))
shell = "staging.html" if "--staging" in sys.argv else "index.html"
a = open("app.js", encoding="utf-8").read()
a = re.sub(r'var V = "\d{8}-\d{6}"', 'var V = "%s"' % v, a, count=1)
open("app.js", "w", encoding="utf-8").write(a)
h = open(shell, encoding="utf-8").read()
h = re.sub(r'(\.js\?v=)\d{8}-\d{6}', r'\g<1>' + v, h)
open(shell, "w", encoding="utf-8").write(h)
if shell == "index.html": open("version.json", "w").write('{"v":"%s"}\n' % v)
print(shell, v)
