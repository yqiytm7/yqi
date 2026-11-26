#!/usr/bin/env python3
"""YQI app.js in 10 parts.

  python3 tools/appjs.py build    stg/app/*.js  ->  stg/app.js   (the file the app loads)
  python3 tools/appjs.py check    exit 1 if stg/app.js is not exactly what the parts build
  python3 tools/appjs.py split    one time: stg/app.js -> stg/app/*.js

app.js is one closure ("use strict" IIFE): every part shares its variables, so the parts are
joined back into the same single file. Edit the parts in stg/app/, then build (bump.py builds too).
Each part holds one or more pieces; a piece starts with a line  //@yqi-piece NNNN  and the
pieces are joined in NNNN order (marker lines removed), so the output is byte-for-byte the same.
"""
import os, re, sys, glob

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
OUT = os.path.join(ROOT, "stg", "app.js")
DIR = os.path.join(ROOT, "stg", "app")
MARK = re.compile(r"^//@yqi-piece (\d{4})\n", re.M)

PARTS = {
    "core": "01-core.js",
    "home": "02-home.js",
    "summary": "03-inspection-summary.js",
    "desk": "04-customer-desk.js",
    "target": "05-target.js",
    "bedsure": "06-bedsure.js",
    "capa": "07-capa-repacking.js",
    "orders": "08-orders-oneliner.js",
    "wastage": "09-wastage.js",
    "settings": "10-settings-export.js",
}
# first line of each piece (in stg/app.js before the split) -> part
PIECES = [
    (1, "core"),        # Android app, web push, languages, updates, offline banner, dialogs, back button, Firebase config, helpers, theme
    (142, "settings"),  # Data & export: Excel / CSV for every list
    (268, "core"),      # styles + screens, opening intro, activity camera
    (377, "bedsure"),   # Bedsure desk gate, internal vs external, Amazon catalog
    (406, "core"),      # create account, workspaces, access levels
    (605, "settings"),  # owner admin
    (671, "core"),      # claude.* replacement, customer names
    (723, "summary"),   # Inspection Summary store + customer picker
    (775, "home"),      # Home overview, front screen, PIN lock, edit page, buyer link
    (1586, "core"),     # activity log, full-screen sheet
    (1615, "capa"),     # CAPA tracker + CAPA v2
    (1888, "settings"), # People & access
    (1890, "desk"),     # customers (purple) see their own results
    (1975, "capa"),     # Repacking reports
    (2031, "summary"),  # Inspections engine v1 + v2
    (2250, "orders"),   # booking -> inspector, one-liner fill, label scan
    (2388, "summary"),  # guided FRI + buyer questionnaires
    (2684, "wastage"),  # Wastage data, premium view, review tabs
    (3059, "orders"),   # One-liner screen
    (3142, "desk"),     # Customer Desk
    (3201, "orders"),   # YTM card + program card
    (3252, "desk"),     # workload, desk drill-down, edit record, Specs
    (3670, "summary"),  # customer inspection log -> Inspection Summary
    (3696, "target"),   # Target Desk + YQI x Target look
    (4148, "wastage"),  # Wastage PPT + slice detail
    (4400, "capa"),     # Repacking report (preview, PDF)
    (4460, "home"),     # today's report -> WhatsApp
    (4476, "summary"),  # inspection fail alert, group hook
    (4487, "settings"), # link a computer, remove one customer's data
    (4581, "core"),     # offline saving, app errors
    (4615, "summary"),  # Inspection Summary on demand, upload, add-ons
    (4854, "core"),     # file storage, images, open workspace, boot, version alert
]


def read(p):
    with open(p, encoding="utf-8", newline="") as f:
        return f.read()


def write(p, s):
    with open(p, "w", encoding="utf-8", newline="") as f:
        f.write(s)


def build_text():
    got = {}
    for p in sorted(glob.glob(os.path.join(DIR, "*.js"))):
        s = read(p)
        ms = list(MARK.finditer(s))
        if not ms or ms[0].start() != 0:
            sys.exit("%s must start with a //@yqi-piece line" % p)
        for i, m in enumerate(ms):
            n = int(m.group(1))
            if n in got:
                sys.exit("piece %04d is in two files" % n)
            got[n] = s[m.end(): ms[i + 1].start() if i + 1 < len(ms) else len(s)]
    if sorted(got) != list(range(len(got))):
        sys.exit("pieces missing: expected 0000..%04d" % (len(got) - 1))
    return "".join(got[n] for n in sorted(got))


def split():
    s = read(OUT)
    if MARK.search(s):
        sys.exit("stg/app.js already contains a piece marker")
    lines = s.splitlines(keepends=True)
    starts = [a for a, _ in PIECES]
    assert starts == sorted(starts) and starts[0] == 1 and starts[-1] <= len(lines)
    os.makedirs(DIR, exist_ok=True)
    files = {k: [] for k in PARTS}
    for i, (a, k) in enumerate(PIECES):
        b = PIECES[i + 1][0] if i + 1 < len(PIECES) else len(lines) + 1
        files[k].append("//@yqi-piece %04d\n" % i + "".join(lines[a - 1: b - 1]))
    for k, fn in PARTS.items():
        write(os.path.join(DIR, fn), "".join(files[k]))
    if build_text() != s:
        sys.exit("split does not rebuild the same app.js")
    print("split into", len(PARTS), "parts,", len(PIECES), "pieces")


def build():
    write(OUT, build_text())
    print("built stg/app.js")


def check():
    if build_text() != read(OUT):
        sys.exit("stg/app.js differs from stg/app/* (run: python3 tools/appjs.py build)")
    print("stg/app.js matches its parts")


if __name__ == "__main__":
    {"split": split, "build": build, "check": check}.get((sys.argv[1:] or [""])[0], lambda: sys.exit(__doc__))()
