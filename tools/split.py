#!/usr/bin/env python3
"""One-time split of the single-file YQI app into a small shell + cached script files.

  python3 tools/split.py index.html staging.html VERSION

Writes app.js, chat.js, wash.js, ws1.js … ws7.js next to the shell, and the shell itself.
The shell keeps the HTML/CSS and the two tiny boot scripts; big scripts load from files
(parser-blocking, same order), the customer-workspace scripts load only when needed.
"""
import re, sys, os

src, out, ver = sys.argv[1], sys.argv[2], sys.argv[3]
root = os.path.dirname(os.path.abspath(out))
s = open(src, encoding="utf-8").read()
blocks = list(re.finditer(r'<script([^>]*)>([\s\S]*?)</script>', s))
assert len(blocks) == 12, len(blocks)

def code(i): return blocks[i].group(2)
names = {2: "app", 3: "chat", 4: "wash"}
assert "YQI company edition" in code(2)[:200] and "YQI Chat v2" in code(3)[:200] and "Wash QC" in code(4)[:200]
for i in range(5, 12): assert "text/yqi" in blocks[i].group(1)

app = code(2)
# version marker inside the app
app = re.sub(r'var V = "\d{8}-\d{6}"', 'var V = "%s"' % ver, app, count=1)
# customer-workspace scripts: load the files in order, only when the workspace opens
old = '''  list.forEach(function(s){ var n = document.createElement("script"); n.text = s.text; s.parentNode.replaceChild(n, s); });
  try{ window.dispatchEvent(new Event("resize")); }catch(e){}'''
new = '''  var li = 0; (function next(){ if(li >= list.length){ try{ window.dispatchEvent(new Event("resize")); }catch(e){} return; }
    var s = list[li++], n = document.createElement("script"), u = s.getAttribute("data-src");
    if(u){ n.src = u; n.async = false; n.onload = next; n.onerror = function(){ showGate('<h1>No internet?</h1><div class="sub">Part of YQI could not load.</div><button onclick="location.reload()">Try again</button>'); }; s.parentNode.replaceChild(n, s); }
    else { n.text = s.text; s.parentNode.replaceChild(n, s); next(); } })();'''
assert app.count(old) == 1; app = app.replace(old, new)
# warm the cache for the customer workspace while the user looks at Home
app += '''
;(function(){ try{ var go = function(){ [].slice.call(document.querySelectorAll('script[type="text/yqi"][data-src]')).forEach(function(s){ try{ fetch(s.getAttribute("data-src")).catch(function(){}); }catch(e){} }); };
  var t = function(){ if(window.requestIdleCallback) requestIdleCallback(go, {timeout: 4000}); else go(); }; if(document.readyState === "complete") setTimeout(t, 3500); else addEventListener("load", function(){ setTimeout(t, 3500); }); }catch(e){} })();
'''
files = {"app.js": app, "chat.js": code(3), "wash.js": code(4)}
for k, i in enumerate(range(5, 12), 1): files["ws%d.js" % k] = code(i)
for f, c in files.items():
    open(os.path.join(root, f), "w", encoding="utf-8").write(c)

# shell
parts, last = [], 0
for i, m in enumerate(blocks):
    parts.append(s[last:m.start()])
    if i in names: parts.append('<script src="%s.js?v=%s"></script>' % (names[i], ver))
    elif i >= 5: parts.append('<script type="text/yqi" data-src="ws%d.js?v=%s"></script>' % (i - 4, ver))
    else: parts.append(m.group(0))
    last = m.end()
parts.append(s[last:])
shell = "".join(parts)
open(out, "w", encoding="utf-8").write(shell)
print("shell", len(shell), {f: len(c) for f, c in files.items()})
