/* YQI Intelligence — 3D Article Studio. Self-contained, no libraries. window.STU.mount(el, {rows}) */
(function(){
var CSS = [
".stu{display:flex;flex-direction:column;height:100%;min-height:0;color:#1d2a16;font:14px/1.35 Manrope,system-ui,sans-serif;background:#f3f6ef}",
".stu *{box-sizing:border-box}",
".stu-top{display:flex;gap:6px;align-items:center;padding:8px 10px;background:#fff;border-bottom:1px solid #dfe7d6;flex-wrap:wrap}",
".stu-top b{font-size:15px;margin-right:6px}.stu-top b em{color:#5BA32A;font-style:normal}",
".stu-chip{border:1px solid #cfdcc2;background:#fff;border-radius:999px;padding:5px 11px;font:600 12px Manrope,system-ui;cursor:pointer;color:#2F5A1A}",
".stu-chip.on{background:#3F7D1F;color:#fff;border-color:#3F7D1F}",
".stu-main{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:0}",
".stu-view{position:relative;min-height:340px;background:radial-gradient(ellipse at 50% 38%,#ffffff 0%,#f1f2ef 52%,#d8dcd6 100%);overflow:hidden;touch-action:none}",
".stu-view canvas{position:absolute;inset:0;width:100%;height:100%;display:block}",
".stu-hud{position:absolute;left:8px;top:8px;display:flex;gap:6px;flex-wrap:wrap;z-index:2}",
".stu-hud button,.stu-hud label{border:1px solid #cfdcc2;background:rgba(255,255,255,.92);border-radius:8px;padding:5px 9px;font:600 12px Manrope,system-ui;color:#2F5A1A;cursor:pointer}",
".stu-hud button.on{background:#3F7D1F;color:#fff}",
".stu-cap{position:absolute;left:8px;right:8px;bottom:8px;background:rgba(255,255,255,.95);border:1px solid #cfdcc2;border-left:5px solid #E8892B;border-radius:10px;padding:8px 11px;z-index:2;font-size:13px}",
".stu-fx.on{outline:2px solid #E8892B;background:#fff4e6}.stu-cap{max-height:34%;overflow:auto}.stu-cap.min .stu-ex{display:none}.stu-cap>b{cursor:pointer}.stu-cap>b:after{content:\" ▾\";color:#B4531A}.stu-cap.min>b:after{content:\" ▸ details\"}.stu-ex b{display:inline}.stu-ex h5{margin:8px 0 2px;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#B4531A}.stu-ex p,.stu-ex ol,.stu-ex ul{margin:2px 0;font-size:12.5px;line-height:1.4}.stu-ex ol,.stu-ex ul{padding-left:18px}.stu-exp .stu-ex{margin-top:6px;border-top:1px dashed #E8892B}.stu-fx:hover{outline:2px solid #E8892B}.stu-cap b{display:block;font-size:14px}.stu-cap small{color:#5b6b50}",
".stu-side{overflow:auto;background:#fff;border-left:1px solid #dfe7d6;padding:10px;display:flex;flex-direction:column;gap:10px}",
".stu-card{border:1px solid #e1e9d8;border-radius:12px;padding:10px;background:#fbfdf8}",
".stu-card h4{margin:0 0 7px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#4b7a2a}",
".stu-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px}",
".stu-grid label{display:flex;flex-direction:column;font-size:11px;color:#5b6b50;gap:2px}",
".stu-grid input,.stu-grid select,.stu-side textarea,.stu-side select{border:1px solid #cfdcc2;border-radius:8px;padding:6px 7px;font:13px Manrope,system-ui;background:#fff;color:#1d2a16;width:100%}",
".stu-grid .w2{grid-column:1/3}",
".stu-steps{display:flex;flex-direction:column;gap:5px}",
".stu-step{display:flex;gap:8px;align-items:flex-start;border:1px solid #dfe7d6;border-radius:10px;padding:7px 9px;cursor:pointer;background:#fff}",
".stu-step i{flex:none;width:22px;height:22px;border-radius:50%;background:#e4eed9;color:#2F5A1A;font:700 12px/22px Manrope,system-ui;text-align:center;font-style:normal}",
".stu-step.on{border-color:#E8892B;background:#fff6ec}.stu-step.on i{background:#E8892B;color:#fff}",
".stu-step b{font-size:13px;display:block}.stu-step small{color:#5b6b50;font-size:11.5px}",
".stu-flag{font-size:12.5px;padding:6px 8px;border-radius:8px;margin-bottom:5px}",
".stu-flag.w{background:#fff4dc;border:1px solid #f0d89a}.stu-flag.i{background:#eaf4e0;border:1px solid #cfe3bb}.stu-flag.r{background:#fde8e6;border:1px solid #f0b9b3}",
".stu-btn{border:0;background:#3F7D1F;color:#fff;border-radius:9px;padding:8px 12px;font:700 13px Manrope,system-ui;cursor:pointer}",
".stu-btn.g{background:#e4eed9;color:#2F5A1A}",
".stu-sub{font-size:11.5px;color:#5d6b52;margin:2px 0 6px;line-height:1.35}.stu-card.up{border:2px solid #E8892B;background:#fff9ef}.stu-card.up h4{color:#B4531A}.stu textarea,.stu input[type=file]{width:100%;box-sizing:border-box;font:12.5px Manrope,system-ui}",
".stu-co{font-size:11px;margin-top:4px}.stu-co ul{margin:4px 0 0 16px;padding:0}.stu-co li{margin:2px 0}",
".stu-row{display:flex;gap:6px;flex-wrap:wrap;align-items:center}",
".stu-range{width:100%}",
"@media(max-width:860px){.stu-main{grid-template-columns:1fr;grid-template-rows:56vh auto}.stu-side{border-left:0;border-top:1px solid #dfe7d6}.stu-view{min-height:0}}"
].join("");

// ---------- tiny helpers ----------
var PI = Math.PI;
function clamp(v, a, b){ return v < a ? a : v > b ? b : v; }
function hex(h){ h = String(h || "#cccccc").replace("#", ""); if(h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]; return [parseInt(h.slice(0, 2), 16) || 0, parseInt(h.slice(2, 4), 16) || 0, parseInt(h.slice(4, 6), 16) || 0]; }
function mix(a, b, t){ return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
function rnd(i, j){ var s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return s - Math.floor(s); }
function sm(t){ t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
function css(c, k){ k = k == null ? 1 : k; return "rgb(" + (clamp(c[0] * k, 0, 255) | 0) + "," + (clamp(c[1] * k, 0, 255) | 0) + "," + (clamp(c[2] * k, 0, 255) | 0) + ")"; }
function toCm(v, unit){ return unit === "inch" ? v * 2.54 : v; }

var NAMED = {white:"#f4f2ec", "pure white":"#f7f6f1", ivory:"#efe8d4", cream:"#eee3c8", beige:"#d9c7a4", tan:"#c8a97c", khaki:"#b9a77a", doeskin:"#cbb08a", hazel:"#a98a62", tapioca:"#d6b98f", grey:"#9a9ea3", gray:"#9a9ea3", "dark grey":"#5d6166", charcoal:"#4a4d52", black:"#26282b", navy:"#25375a", blue:"#4d78b8", "light blue":"#a9c6e8", "sky blue":"#9ec4e6", "heather soft blue":"#9db4cf", teal:"#2f8f8b", green:"#5b8f4f", sage:"#a0b394", "bronze green":"#6b7a48", olive:"#7a7f45", pink:"#e2a6b4", rose:"#d68c9f", "adobe rose":"#c98a85", blush:"#e8c4c0", red:"#b8383a", burgundy:"#6e2736", orange:"#d9803a", rust:"#a8543a", yellow:"#e4c657", mustard:"#c9a23a", purple:"#6e4f94", lavender:"#b9a7d6", brown:"#6f5440", chocolate:"#4e3b2e", silver:"#c3c6c9", gold:"#c8a45a"};
function colorOf(name){
  var n = String(name || "").toLowerCase().trim(); if(!n) return "#d9d3c4";
  if(/^#[0-9a-f]{3,6}$/.test(n)) return n;
  if(NAMED[n]) return NAMED[n];
  var parts = n.split(/[\/,&]/); if(parts.length > 1 && NAMED[parts[0].trim()]) return NAMED[parts[0].trim()];
  var keys = Object.keys(NAMED).sort(function(a, b){ return b.length - a.length; });
  for(var i = 0; i < keys.length; i++) if(n.indexOf(keys[i]) >= 0) return NAMED[keys[i]];
  var h = 0; for(var k = 0; k < n.length; k++) h = (h * 31 + n.charCodeAt(k)) | 0;
  return "#" + [0, 1, 2].map(function(q){ return (170 + Math.abs((h >> (q * 5)) % 60)).toString(16); }).join("");
}

// ---------- fabric looks ----------
function fabricFn(base, kind, c2, scale){
  var B = hex(base), C = hex(c2 || "#ffffff"), s = scale || 1;
  return function(x, z, u, v){
    var k = 1, c = B;
    var n = rnd(Math.floor(x * 1.7), Math.floor(z * 1.7)); if(HQ) n = .5 + (n - .5) * .25;
    if(kind === "washed"){ k = 0.94 + n * 0.1 + 0.03 * Math.sin(x * .35 + z * .21); }
    else if(kind === "napped"){ k = 0.96 + n * 0.07; }
    else if(kind === "waffle"){ var gx = Math.abs(((x / (1.1 * s)) % 1 + 1) % 1 - .5), gz = Math.abs(((z / (1.1 * s)) % 1 + 1) % 1 - .5); k = 0.86 + 0.2 * Math.min(1, (gx + gz) * 1.6); }
    else if(kind === "stripe"){ var t = ((x / (2.2 * s)) % 1 + 1) % 1; if(t < 0.5) c = C; k = 0.98 + n * .03; }
    else if(kind === "check"){ var a = ((x / (4 * s)) % 1 + 1) % 1 < .5, b = ((z / (4 * s)) % 1 + 1) % 1 < .5; if(a !== b) c = C; k = 0.98 + n * .03; }
    else if(kind === "print"){ var cx = Math.floor(x / (5 * s)), cz = Math.floor(z / (5 * s)); var d = Math.hypot(((x / (5 * s)) % 1 + 1) % 1 - .5 - (rnd(cx, cz) - .5) * .4, ((z / (5 * s)) % 1 + 1) % 1 - .5 - (rnd(cz, cx) - .5) * .4); if(d < .17 + rnd(cx, cz + 3) * .08) c = C; k = 0.98 + n * .03; }
    else { k = 0.985 + n * 0.015; }
    return [c[0] * k, c[1] * k, c[2] * k];
  };
}

// ---------- mesh builders ----------
function gridMesh(nx, nz, W, L, yFn, colFn, flip){
  var P = [], i, j, polys = [];
  for(j = 0; j <= nz; j++){ P[j] = []; for(i = 0; i <= nx; i++){ var u = i / nx, v = j / nz, x = (u - .5) * L, z = (v - .5) * W; P[j][i] = [x, yFn(x, z, u, v), z]; } }
  for(j = 0; j < nz; j++) for(i = 0; i < nx; i++){
    var a = P[j][i], b = P[j][i + 1], c = P[j + 1][i + 1], d = P[j + 1][i], cx = (a[0] + c[0]) / 2, cz = (a[2] + c[2]) / 2;
    polys.push({p: flip ? [d, c, b, a] : [a, b, c, d], c: colFn(cx, cz, (i + .5) / nx, (j + .5) / nz)});
  }
  return polys;
}
function seamRect(L, W, inset, yFn){ var pts = [], n = 28, k, x0 = -L / 2 + inset, x1 = L / 2 - inset, z0 = -W / 2 + inset, z1 = W / 2 - inset;
  function pt(x, z){ return [x, yFn(x, z), z]; }
  for(k = 0; k <= n; k++) pts.push(pt(x0 + (x1 - x0) * k / n, z0));
  for(k = 1; k <= n; k++) pts.push(pt(x1, z0 + (z1 - z0) * k / n));
  for(k = 1; k <= n; k++) pts.push(pt(x1 - (x1 - x0) * k / n, z1));
  for(k = 1; k < n; k++) pts.push(pt(x0, z1 - (z1 - z0) * k / n));
  pts.push(pt(x0, z0)); return pts;
}
function polyline(pts, yFn){ return pts.map(function(p){ return [p[0], yFn(p[0], p[1]), p[1]]; }); }

// shared pillow / duvet / cushion panel pair
function panelPair(o){
  var L = o.L, W = o.W, F = o.F || 0, h = o.h, ramp = o.ramp, hm = o.hm != null ? o.hm : h / 2 + 0.4;
  function bump(x, z){
    var dx = L / 2 - Math.abs(x) - F, dz = W / 2 - Math.abs(z) - F;
    if(dx <= 0 || dz <= 0) return 0;
    var tx = clamp(dx / ramp, 0, 1), tz = clamp(dz / ramp, 0, 1);
    return Math.sqrt(1 - (1 - tx) * (1 - tx)) * Math.sqrt(1 - (1 - tz) * (1 - tz));
  }
  var yTop = function(x, z){ return hm + (h / 2) * bump(x, z) + (o.wave ? o.wave(x, z) : 0); };
  var yBot = function(x, z){ return hm - (h / 2) * bump(x, z) - (o.wave ? o.wave(x, z) * .4 : 0); };
  var nx = o.nx || (HQ ? 80 : 30), nz = o.nz || (HQ ? 58 : 22);
  var front = {id: "front", name: o.frontName || "Front panel", polys: gridMesh(nx, nz, W, L, yTop, (function(fc){ return function(x, z, u, v){ var c = fc(x, z, u, v), b = bump(x, z), k = HQ ? .95 + .05 * b : .86 + .2 * b; return [c[0] * k, c[1] * k, c[2] * k]; }; })(fabricFn(o.fc, o.fk, o.fc2, o.pscale))), lines: [], ex: [0, o.exLift || 50, 0]};
  var back = {id: "back", name: o.backName || "Back panel", polys: gridMesh(nx, nz, W, L, yBot, fabricFn(o.bc, o.bk, o.bc2, o.pscale), true), lines: [], ex: [0, -(o.exLift || 50), 0]};
  var seams = [];
  var inset = o.sa != null ? o.sa : 1.2;
  seams.push({id: "side", name: "Side seams (" + (o.saTxt || "1 cm") + ")", pts: seamRect(L, W, inset, function(x, z){ return hm; }), w: 2});
  if(F > 0) seams.push({id: "flange", name: "Flange topstitch", pts: seamRect(L, W, F, function(x, z){ return hm; }), w: 2});
  if(o.piping) seams.push({id: "piping", name: "Piping", pts: seamRect(L, W, 0.3, function(x, z){ return hm; }), w: 4, col: hex(o.pipeCol || "#2b2b2b")});
  return {front: front, back: back, seams: seams, hm: hm, bump: bump, yTop: yTop, yBot: yBot};
}
function mkParts(pp){ return [pp.front, pp.back]; }

function endLine(L, W, hm, from, to, id, name, col, dash){
  var n = 12, pts = [], k; for(k = 0; k <= n; k++){ var z = from + (to - from) * k / n; pts.push([L / 2, hm, z]); pts[pts.length - 1][2] = z; }
  return {id: id, name: name, pts: pts, w: 3, col: col || [232, 137, 43], dash: dash};
}

// ---------- ARTICLES ----------
var STEP_DEFAULT = {sa: "1 cm (3/8\")", spi: "10–12 SPI", hem: "2.5 cm double fold"};
function F(sp, k, d){ var v = sp[k]; return v === "" || v == null || isNaN(+v) ? d : +v; }

function buildPillow(sp){
  var L = toCm(F(sp, "L", 75), sp.unit), W = toCm(F(sp, "W", 50), sp.unit), fl = toCm(F(sp, "flange", 0), sp.unit);
  var h = Math.min(L, W) * 0.34, st = sp.closure || "envelope";
  var pp = panelPair({L: L, W: W, F: fl, h: h, ramp: Math.min(L, W) * .42, nx: 44, nz: 32, fc: sp.color, bc: sp.color2 || sp.color, fk: sp.fabric, bk: sp.fabric2 || sp.fabric, fc2: sp.color2p, bc2: sp.color2p, pscale: Math.max(.7, W / 50), sa: 1.2, saTxt: STEP_DEFAULT.sa, frontName: "Front panel", backName: sp.pcSeparate === "1" ? "Back panel + flap (separate piece)" : "Back panel", piping: sp.piping === "1", pipeCol: sp.pipeColor, exLift: W * .8});
  var seams = pp.seams.slice(), hm = pp.hm;
  var opening = {id: "open", name: st === "zip" ? "Zip opening" : st === "oxford" ? "Envelope opening" : "Envelope opening (flap " + F(sp, "flap", 12) + " cm)", pts: [], w: 3, col: [232, 137, 43], dash: st === "zip" ? 0 : 1};
  var ox = L / 2 - 0.5, z0 = -W / 2 + 3 + fl, z1 = W / 2 - 3 - fl; for(var k = 0; k <= 12; k++) opening.pts.push([ox, hm, z0 + (z1 - z0) * k / 12]);
  seams.push(opening);
  var hemS = {id: "hem", name: "Hem at opening (" + (sp.hem || STEP_DEFAULT.hem) + ")", pts: [], w: 2}; var hx = L / 2 - Math.max(3, F(sp, "hemDepth", 2.5) + 0.5) - fl; for(var q = 0; q <= 12; q++){ var zz = -W / 2 + 1.5 + fl + (W - 3 - 2 * fl) * q / 12; hemS.pts.push([hx, pp.yTop(hx, zz) + 0.05, zz]); }
  seams.push(hemS);
  var dims = [{a: [-L / 2, 0, -W / 2 - 5], b: [L / 2, 0, -W / 2 - 5], t: Math.round(L) + " cm (finished length)"}, {a: [L / 2 + 5, 0, -W / 2], b: [L / 2 + 5, 0, W / 2], t: Math.round(W) + " cm (width)"}];
  if(fl > 0) dims.push({a: [-L / 2, h + 3, W / 2], b: [-L / 2 + fl, h + 3, W / 2], t: "flange " + fl + " cm"});
  var T = [
    ["Cutting", "Auto cutter / manual table", "Cut front panel, back panel" + (st === "envelope" || st === "oxford" ? " and flap/overlap" : "") + " from marker. Check shade within the pillowcase, print direction and shrinkage allowance.", ["front", "back"], [], 1],
    ["Hemming opening", "Single needle lockstitch + hemmer", "Double-fold hem on the opening edge, " + (sp.hem || STEP_DEFAULT.hem) + ", " + (sp.spi || STEP_DEFAULT.spi) + ".", ["front", "back"], ["hem"], 1],
    [st === "zip" ? "Zip attach" : "Flap / envelope overlap", st === "zip" ? "Zipper foot machine" : "Single needle", st === "zip" ? "Attach concealed zip at the opening; zip pull must stay inside, check zip lifting." : "Place the flap inside so overlap is " + F(sp, "flap", 12) + " cm; flap stays closed, no gap at pillow insert.", ["front", "back"], ["open"], .6],
    ["Join panels (3 sides)", "Overlock 4-thread / lockstitch", "Right sides together, sew 3 sides, seam allowance " + STEP_DEFAULT.sa + ", backtack at both ends, corners square.", ["front", "back"], ["side"], .25],
    fl > 0 ? ["Flange topstitch", "Single needle, guide", "Topstitch " + fl + " cm from edge all round, even width, no puckering at corners.", ["front", "back"], ["flange"], 0] : ["Turn & shape", "Manual", "Turn right side out, push corners fully, check even edge.", ["front", "back"], [], 0],
    ["Trim, press, final check", "Thread trimmer / press", "Trim threads, press flat, measure finished size " + Math.round(L) + " x " + Math.round(W) + " cm (tolerance as per spec), inspect stains and loose threads.", ["front", "back"], [], 0],
    ["Fold & pack", "Packing table", "Fold as per packing spec, insert in polybag/header card, apply barcode label.", ["front", "back"], [], 0]
  ];
  return {sy: function(x, z, p){ return p === "back" ? pp.yBot(x, z) : pp.yTop(x, z); }, hm: hm, parts: mkParts(pp), seams: seams, dims: dims, steps: toSteps(T), R: Math.max(L, W) * .9 + 20, ty: h / 2, flags: pillowFlags(sp, st)};
}
function pillowFlags(sp, st){
  var f = [];
  if(!sp.flap && st !== "zip") f.push(["w", "Flap / overlap length not in spec — default 12 cm used."]);
  if(sp.pcSeparate !== "1" && st !== "zip") f.push(["i", "Check: pillowcase flap is usually a separate fabric piece — confirm in spec."]);
  return f;
}

function buildDuvet(sp){
  var W = toCm(F(sp, "W", 104), sp.unit), L = toCm(F(sp, "L", 90), sp.unit), st = sp.closure || "zip", fl = toCm(F(sp, "flange", 0), sp.unit);
  var two = sp.pcSeparate === "1" || sp.fabric2 && sp.fabric2 !== sp.fabric || (sp.color2 && sp.color2 !== sp.color);
  var pp = panelPair({L: L, W: W, F: fl, h: Math.min(L, W) * .16, ramp: Math.min(L, W) * .3, fc: sp.color, bc: sp.color2 || sp.color, fk: sp.fabric, bk: sp.fabric2 || sp.fabric, fc2: sp.color2p, bc2: sp.color2p, pscale: Math.max(1, W / 120), sa: 1.5, saTxt: STEP_DEFAULT.sa, frontName: "Front panel" + (two ? " (fabric 1)" : ""), backName: "Back panel" + (two ? " (fabric 2 / reverse)" : ""), piping: sp.piping === "1", pipeCol: sp.pipeColor, nx: 40, nz: 40, exLift: Math.max(L, W) * .35, wave: function(x, z){ return 0.5 * Math.sin(x * .09) * Math.cos(z * .11); }});
  var hm = pp.hm, seams = pp.seams.slice();
  var zl = W * 0.42, zip = {id: "zip", name: st === "button" ? "Button placket" : st === "tie" ? "Opening (envelope)" : "Zip opening " + Math.round(zl * 2) + " cm", pts: [], w: 3, col: [232, 137, 43]};
  for(var k = 0; k <= 16; k++) zip.pts.push([L / 2 - 0.4, hm, -zl + 2 * zl * k / 16]);
  seams.push(zip);
  var ties = sp.ties === "1";
  if(ties) [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function(c, i){ seams.push({id: "tie" + i, name: "Corner tie", pts: [[c[0] * (L / 2 - 3), hm + 1, c[1] * (W / 2 - 3)], [c[0] * (L / 2 - 14), hm + 4, c[1] * (W / 2 - 14)]], w: 3, col: [200, 60, 60]}); });
  var dims = [{a: [-L / 2, 0, -W / 2 - 8], b: [L / 2, 0, -W / 2 - 8], t: cmTxt(L) + " length"}, {a: [L / 2 + 8, 0, -W / 2], b: [L / 2 + 8, 0, W / 2], t: cmTxt(W) + " width"}];
  var T = [
    ["Cutting", "Auto cutter / table", "Cut front and back" + (two ? " (two different fabrics / colours)" : "") + ", size " + Math.round(W) + " x " + Math.round(L) + " cm + shrinkage, closure tape/zip length " + Math.round(zl * 2) + " cm. Check shade band and print direction.", ["front", "back"], [], 1],
    [st === "button" ? "Placket & buttons" : "Hem foot opening", "Single needle + hemmer", "Hem both panels along the foot opening, " + (sp.hem || STEP_DEFAULT.hem) + ", " + (sp.spi || STEP_DEFAULT.spi) + ".", ["front", "back"], [], 1],
    [st === "button" ? "Buttonholes" : "Attach zip", st === "button" ? "Buttonhole machine" : "Zipper foot machine", st === "button" ? "Make buttonholes evenly spaced, attach buttons with tension check." : "Attach zip to opening, zip pull inside, no waviness; test open/close 3 times.", ["front", "back"], ["zip"], .7],
    ["Corner ties", "Single needle", ties ? "Make 4 ties and stitch inside corners with bartack; strength check." : "No corner ties in spec (add if required).", ["front", "back"], ties ? ["tie0", "tie1", "tie2", "tie3"] : [], .5],
    ["Join panels", "Overlock 4-thread / French seam", "Right sides together, join 4 sides (open zip only), seam allowance " + STEP_DEFAULT.sa + ", corners square, backtack at opening ends.", ["front", "back"], ["side"], .25],
    ["Turn, press, inspect", "Press / table", "Turn, press flat, measure " + Math.round(W) + " x " + Math.round(L) + " cm, check seam strength, stains, skipped stitches, zip function.", ["front", "back"], [], 0],
    ["Fold & pack", "Packing", "Fold per packing spec, set with pillowcases if set, polybag, label.", ["front", "back"], [], 0]
  ];
  var flags = [];
  if(two) flags.push(["r", "Two fabrics/colours on one product — cutting must keep front and reverse pieces separate (cannot be mixed)."]);
  if(!sp.closure) flags.push(["w", "Closure not in spec — zip assumed."]);
  return {sy: function(x, z, p){ return p === "back" ? pp.yBot(x, z) : pp.yTop(x, z); }, hm: hm, parts: mkParts(pp), seams: seams, dims: dims, steps: toSteps(T), R: Math.max(L, W) * .85 + 30, ty: 8, flags: flags};
}

function buildComforter(sp){
  var W = toCm(F(sp, "W", 104), sp.unit), L = toCm(F(sp, "L", 90), sp.unit), cell = toCm(F(sp, "cell", 20), sp.unit), pat = sp.quilt || "box";
  var h = Math.min(Math.min(L, W) * .06, cell * .3), hm = h + 0.6;
  function bump(x, z){
    var u = (x + L / 2) / L, v = (z + W / 2) / W, ex = Math.min(x + L / 2, L / 2 - x), ez = Math.min(z + W / 2, W / 2 - z), edge = sm(Math.min(ex, ez) / 3);
    var b;
    if(pat === "channel"){ var t = (((z + W / 2) / cell) % 1 + 1) % 1; b = sm(Math.sin(PI * t) * 1.5); }
    else if(pat === "diamond"){ var a = ((((x + z) / cell) % 1 + 1) % 1), c = ((((x - z) / cell) % 1 + 1) % 1); b = sm(Math.sin(PI * a) * 1.5) * sm(Math.sin(PI * c) * 1.5); }
    else if(pat === "none"){ b = 0.9; }
    else { var tx = (((x + L / 2) / cell) % 1 + 1) % 1, tz = (((z + W / 2) / cell) % 1 + 1) % 1; b = sm(Math.sin(PI * tx) * 1.5) * sm(Math.sin(PI * tz) * 1.5); }
    return b * edge;
  }
  var yTop = function(x, z){ return hm + h * bump(x, z); }, yBot = function(x, z){ return hm - h * bump(x, z); };
  var nx = clamp(Math.round(L / cell * 7), 54, 110), nz = clamp(Math.round(W / cell * 7), 54, 110);
  var fcTop = fabricFn(sp.color, sp.fabric, sp.color2p, Math.max(1, W / 120)); var shade = function(x, z, u, v){ var c = fcTop(x, z, u, v), b = bump(x, z), k = .72 + .36 * b + .05 * Math.sin(x * .21 + z * .17); return [c[0] * k, c[1] * k, c[2] * k]; };
  var front = {id: "front", name: "Top shell", polys: gridMesh(nx, nz, W, L, function(x, z){ return yTop(x, z) + .9 * Math.sin(x * .07 + 1) * Math.cos(z * .09) + .5 * Math.sin(x * .19 + z * .23); }, shade), ex: [0, Math.max(L, W) * .45, 0]};
  var batt = {id: "fill", name: "Fill / batting " + (sp.fill ? sp.fill + " gsm" : ""), polys: gridMesh(8, 8, W - 3, L - 3, function(){ return hm - h * .55; }, function(){ return [246, 244, 236]; }), ex: [0, 0, 0], ghost: true};
  var back = {id: "back", name: "Bottom shell", polys: gridMesh(nx, nz, W, L, yBot, fabricFn(sp.color2 || sp.color, sp.fabric2 || sp.fabric, sp.color2p, Math.max(1, W / 120)), true), ex: [0, -Math.max(L, W) * .45, 0]};
  var seams = [], k, n = 40;
  function lineZ(xc){ var p = []; for(k = 0; k <= n; k++){ var z = -W / 2 + 2 + (W - 4) * k / n; p.push([xc, hm, z]); } return p; }
  function lineX(zc){ var p = []; for(k = 0; k <= n; k++){ var x = -L / 2 + 2 + (L - 4) * k / n; p.push([x, hm, zc]); } return p; }
  var qlines = [];
  if(pat === "box"){ for(var xx = cell; xx < L - 1; xx += cell) qlines.push(lineZ(-L / 2 + xx)); for(var zz = cell; zz < W - 1; zz += cell) qlines.push(lineX(-W / 2 + zz)); }
  else if(pat === "channel"){ for(var z2 = cell; z2 < W - 1; z2 += cell) qlines.push(lineX(-W / 2 + z2)); }
  else if(pat === "diamond"){ for(var d = -Math.ceil(W / cell) * cell; d < L + W; d += cell){ var p1 = [], p2 = []; for(k = 0; k <= 20; k++){ var s = -W / 2 + W * k / 20; var x1 = -L / 2 + d + (s + W / 2), x2 = -L / 2 + d - (s + W / 2); if(x1 > -L / 2 + 1 && x1 < L / 2 - 1) p1.push([x1, hm, s]); if(x2 > -L / 2 + 1 && x2 < L / 2 - 1) p2.push([x2, hm, s]); } if(p1.length > 1) qlines.push(p1); if(p2.length > 1) qlines.push(p2); } }
  qlines.forEach(function(p, i){ seams.push({id: "quilt" + i, name: "Quilting line", pts: p, w: 1.4, group: "quilt"}); });
  seams.push({id: "bind", name: "Binding / edge stitch", pts: seamRect(L, W, 1.6, function(){ return hm; }), w: 3, col: hex(sp.pipeColor || "#3a3a3a")});
  var dims = [{a: [-L / 2, 0, -W / 2 - 8], b: [L / 2, 0, -W / 2 - 8], t: cmTxt(L) + " length"}, {a: [L / 2 + 8, 0, -W / 2], b: [L / 2 + 8, 0, W / 2], t: cmTxt(W) + " width"}, {a: [-L / 2 - 6, 0, W / 2], b: [-L / 2 - 6, 2 * h, W / 2], t: "loft"}];
  var qn = pat === "box" ? "box quilt " + Math.round(cell) + " cm" : pat === "channel" ? "channel quilt " + Math.round(cell) + " cm" : pat === "diamond" ? "diamond quilt " + Math.round(cell) + " cm" : "no quilting";
  var T = [
    ["Cutting", "Auto cutter", "Cut top shell, bottom shell and batting. Size " + Math.round(W) + " x " + Math.round(L) + " cm + quilting take-up (shrink ~2–4%).", ["front", "back", "fill"], [], 1],
    ["Layer up", "Table", "Top shell, " + (sp.fill ? sp.fill + " gsm " : "") + "batting, bottom shell; smooth, no folds in fill.", ["front", "fill", "back"], [], .7],
    ["Quilting", "Multi-needle / computer quilter", pat === "none" ? "Perimeter tack only." : "Quilt " + qn + ", stitch length " + (sp.spi || STEP_DEFAULT.spi) + ". Check pattern alignment, fill spread, no empty cells.", ["front", "fill", "back"], qlines.map(function(q, i){ return "quilt" + i; }), .2],
    ["Trim & bind edge", "Binding machine", "Trim to size, bind/seam edge, corners mitred, edge stitch " + STEP_DEFAULT.spi + ".", ["front", "fill", "back"], ["bind"], 0],
    ["Inspect", "Table", "Measure, check weight/fill, stains, skipped stitches, quilting lines straight, edge even.", ["front", "fill", "back"], [], 0],
    ["Fold & pack", "Packing", "Compress/fold as per packing spec, polybag/carton, labels.", ["front", "fill", "back"], [], 0]
  ];
  var flags = [];
  if(!sp.fill) flags.push(["w", "Fill weight (gsm) not in spec."]);
  return {sy: function(x, z, p){ return p === "back" ? yBot(x, z) : yTop(x, z); }, hm: hm, parts: [front, batt, back], seams: seams, dims: dims, steps: toSteps(T), R: Math.max(L, W) * .85 + 30, ty: hm, flags: flags};
}

function buildSheet(sp){
  var W = toCm(F(sp, "W", 152), sp.unit), L = toCm(F(sp, "L", 203), sp.unit), pocket = toCm(F(sp, "pocket", 35), sp.unit);
  var parts = [], seams = [], k;
  var matH = Math.max(18, pocket - 6);
  var mat = {id: "mattress", name: "Mattress (reference)", polys: [], ex: [0, 0, 0], ghost: true};
  function box(x0, x1, y0, y1, z0, z1, col, out){
    var v = [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]];
    [[0, 1, 2, 3], [4, 7, 6, 5], [0, 4, 5, 1], [1, 5, 6, 2], [2, 6, 7, 3], [3, 7, 4, 0]].forEach(function(f){ out.push({p: f.map(function(i){ return v[i]; }), c: col}); });
  }
  box(-L / 2, L / 2, 0, matH, -W / 2, W / 2, [196, 200, 204], mat.polys);
  parts.push(mat);
  var fit = {id: "fitted", name: "Fitted sheet", polys: [], ex: [0, 0, 0]}, fc = fabricFn(sp.color, sp.fabric, sp.color2p, Math.max(1, W / 120));
  var top = gridMesh(36, 28, W + 0.4, L + 0.4, function(x, z){ return matH + 0.5 + 0.35 * Math.sin(x * .13) * Math.cos(z * .17); }, fc);
  fit.polys = fit.polys.concat(top);
  var sk = [], pr = pocket + 2;
  function skirt(a, b, nrm){ for(var i = 0; i < 12; i++){ var t0 = i / 12, t1 = (i + 1) / 12, A = [a[0] + (b[0] - a[0]) * t0, matH + .5, a[2] + (b[2] - a[2]) * t0], Bp = [a[0] + (b[0] - a[0]) * t1, matH + .5, a[2] + (b[2] - a[2]) * t1]; var dn = pr + .5; sk.push({p: [A, Bp, [Bp[0] + nrm[0] * 1.5, matH - dn + 2, Bp[2] + nrm[2] * 1.5], [A[0] + nrm[0] * 1.5, matH - dn + 2, A[2] + nrm[2] * 1.5]], c: fc(A[0], A[2], 0, 0)}); } }
  skirt([-L / 2, 0, -W / 2], [L / 2, 0, -W / 2], [0, 0, -1]); skirt([-L / 2, 0, W / 2], [L / 2, 0, W / 2], [0, 0, 1]);
  skirt([-L / 2, 0, -W / 2], [-L / 2, 0, W / 2], [-1, 0, 0]); skirt([L / 2, 0, -W / 2], [L / 2, 0, W / 2], [1, 0, 0]);
  fit.polys = fit.polys.concat(sk);
  parts.push(fit);
  // elastic lines on skirt bottom
  var yb = matH - pocket + 2.2, ew = Math.min(L, W) * 0.22;
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function(c, i){ seams.push({id: "el" + i, name: "Corner elastic", pts: [[c[0] * (L / 2 - 1), yb, c[1] * (W / 2 - ew)], [c[0] * (L / 2 - 1), yb, c[1] * (W / 2 - 1)], [c[0] * (L / 2 - ew), yb, c[1] * (W / 2 - 1)]], w: 3, col: [200, 60, 60]}); });
  seams.push({id: "pocket", name: "Pocket depth " + Math.round(pocket) + " cm", pts: [[-L / 2 - 1, matH, W / 2 + 2], [-L / 2 - 1, matH - pocket + 2, W / 2 + 2]], w: 3, col: [232, 137, 43]});
  // flat sheet
  var fw = W + 2 * 30, fl = L + 20, flat = {id: "flat", name: "Flat sheet", polys: [], ex: [0, 90, 0]};
  var fy = function(x, z, u, v){ var drape = Math.max(0, Math.abs(z) - W / 2) * 1.1; return matH + 4 + 0.6 * Math.sin(x * .1 + z * .13) - drape; };
  flat.polys = gridMesh(34, 30, fw, fl * .66, function(x, z){ return fy(x, z) + 0.1; }, fabricFn(sp.color, sp.fabric, sp.color2p, Math.max(1, W / 120))).map(function(q){ q.p = q.p.map(function(p){ return [p[0] + L * .17 + 8, p[1] + 3, p[2]]; }); return q; });
  parts.push(flat);
  var fx0 = L * .17 + 8 - fl * .33; seams.push({id: "tophem", name: "Top hem 10 cm (flat sheet)", pts: [[fx0 + 2, matH + 7.2, -W / 2], [fx0 + 2, matH + 7.2, W / 2]], w: 3, col: [232, 137, 43]});
  seams.push({id: "flathem", name: "Side hems 1 cm", pts: [[fx0 + 2, matH + 7, -W / 2 - 25], [fx0 + fl * .66 - 2, matH + 7, -W / 2 - 25]], w: 2});
  // pillowcases
  var pL = 75, pW = 50, pcols = fabricFn(sp.color, sp.fabric, sp.color2p, 1), pp1 = panelPair({L: pL, W: pW, h: 13, ramp: 9, hm: 7, fc: sp.color, bc: sp.color, fk: sp.fabric, bk: sp.fabric, fc2: sp.color2p, bc2: sp.color2p, sa: 1, saTxt: "1 cm"});
  var offs = [[-L / 2 + 40, matH + .5 + 0, -W * .24], [-L / 2 + 40, matH + .5, W * .24]];
  [0, 1].forEach(function(i){ var pc = {id: "pc" + i, name: "Pillowcase " + (i + 1), polys: [], ex: [0, 40 + i * 20, i ? 60 : -60]};
    pp1.front.polys.concat(pp1.back.polys).forEach(function(q){ pc.polys.push({p: q.p.map(function(p){ var x = p[2] * 0.55 + offs[i][0] * 0 - L / 2 + 40, z = p[0] * 0.55 * 0 + 0; return [p[2] * .85 + offs[i][0], p[1] * .85 + offs[i][1], p[0] * .85 * .6 + offs[i][2]]; }), c: q.c}); });
    parts.push(pc); });
  var dims = [{a: [-L / 2, 0, -W / 2 - 8], b: [L / 2, 0, -W / 2 - 8], t: cmTxt(L) + " length"}, {a: [L / 2 + 8, 0, -W / 2], b: [L / 2 + 8, 0, W / 2], t: cmTxt(W) + " width"}];
  var all = ["mattress", "fitted", "flat", "pc0", "pc1"];
  var T = [
    ["Cutting", "Auto cutter", "Cut fitted sheet top + 4 skirts (pocket " + Math.round(pocket) + " cm), flat sheet " + Math.round(fw) + " x " + Math.round(fl) + " cm, 2 pillowcases. Check shade between pieces of one set.", ["fitted", "flat", "pc0", "pc1"], [], 1],
    ["Flat sheet hems", "Hemmer", "Top hem 10 cm, bottom/side hems 1 cm double fold, " + (sp.spi || STEP_DEFAULT.spi) + ".", ["flat"], ["tophem", "flathem"], .6],
    ["Fitted: corners", "Single needle / overlock", "Join skirt corners (mitre), check corners are square and pocket depth is even.", ["mattress", "fitted"], ["pocket"], .1],
    ["Fitted: elastic", "Elastic attach machine", "Attach elastic: corner elastic or all-round, stretch ratio per spec, check recovery.", ["mattress", "fitted"], ["el0", "el1", "el2", "el3"], 0],
    ["Pillowcases", "Single needle", "Hem opening, join sides, turn and press; size " + pL + " x " + pW + " cm.", ["pc0", "pc1"], [], .6],
    ["Inspect & fit test", "Test mattress", "Fit on a test mattress, check corners, elastic, measure sizes, stains, loose threads.", all, [], 0],
    ["Fold & pack", "Packing", "Fold set per packing spec, label per piece and per set.", all, [], 0]
  ];
  var flags = [];
  if(!sp.pocket) flags.push(["w", "Pocket depth not in spec — 35 cm used."]);
  flags.push(["i", "Pillowcase size assumed 75 x 50 cm; give real size if different."]);
  return {parts: parts, seams: seams, dims: dims, steps: toSteps(T), R: Math.max(L, W) * .95 + 40, ty: matH, flags: flags};
}

function buildBolster(sp){
  var L = toCm(F(sp, "L", 90), sp.unit), D = toCm(F(sp, "W", 18), sp.unit), r = D / 2;
  var body = {id: "front", name: "Body", polys: [], ex: [0, 0, 0]}, endA = {id: "endA", name: "End cap A", polys: [], ex: [-30, 0, 0]}, endB = {id: "endB", name: "End cap B", polys: [], ex: [30, 0, 0]};
  var nA = 28, nL = 14, fc = fabricFn(sp.color, sp.fabric, sp.color2p, 1), i, j;
  for(j = 0; j < nL; j++) for(i = 0; i < nA; i++){
    var a0 = i / nA * 2 * PI, a1 = (i + 1) / nA * 2 * PI, x0 = -L / 2 + L * j / nL, x1 = -L / 2 + L * (j + 1) / nL;
    var P = function(a, x){ return [x, r + r * Math.sin(a), r * Math.cos(a)]; };
    body.polys.push({p: [P(a0, x0), P(a0, x1), P(a1, x1), P(a1, x0)], c: fc(x0, a0 * r, 0, 0)});
  }
  [[-L / 2, endA, -1], [L / 2, endB, 1]].forEach(function(e){ for(i = 0; i < nA; i++){ var a0 = i / nA * 2 * PI, a1 = (i + 1) / nA * 2 * PI; e[1].polys.push({p: [[e[0], r, 0], [e[0], r + r * Math.sin(a0), r * Math.cos(a0)], [e[0], r + r * Math.sin(a1), r * Math.cos(a1)]], c: fc(i, i, 0, 0)}); } });
  var seams = [], ring = function(x){ var p = []; for(var q = 0; q <= nA; q++){ var a = q / nA * 2 * PI; p.push([x, r + r * Math.sin(a), r * Math.cos(a)]); } return p; };
  seams.push({id: "endseams", name: "End cap seams", pts: ring(-L / 2), w: 2}); seams.push({id: "endseamB", name: "End cap seam", pts: ring(L / 2), w: 2});
  var side = []; for(var t = 0; t <= 20; t++) side.push([-L / 2 + L * t / 20, 0.2, 0]);
  seams.push({id: "long", name: "Long seam", pts: side, w: 2});
  var dims = [{a: [-L / 2, 0, -r - 6], b: [L / 2, 0, -r - 6], t: cmTxt(L) + " length"}, {a: [L / 2 + 6, 0, -r], b: [L / 2 + 6, 0, r], t: "Ø " + Math.round(D) + " cm"}];
  var T = [
    ["Cutting", "Cutter", "Cut body (" + Math.round(L) + " x " + Math.round(Math.PI * D + 2) + " cm incl. seam) and 2 end discs.", ["front", "endA", "endB"], [], 1],
    ["Long seam", "Lockstitch", "Join body into tube along length, seam allowance " + STEP_DEFAULT.sa + ".", ["front"], ["long"], .6],
    ["Attach end caps", "Single needle / overlock", "Sew end discs, even circle, no pleats.", ["front", "endA", "endB"], ["endseams", "endseamB"], .3],
    ["Fill & close / Inspect", "Manual", "Fill to spec weight, close, check shape, stains, loose threads.", ["front", "endA", "endB"], [], 0],
    ["Pack", "Packing", "Pack per spec, label.", ["front", "endA", "endB"], [], 0]
  ];
  return {parts: [body, endA, endB], seams: seams, dims: dims, steps: toSteps(T), R: L * .85 + 20, ty: r, flags: []};
}

function toSteps(T){ return T.map(function(t){ return {n: t[0], m: t[1], d: t[2], show: t[3], hi: t[4], ex: t[5]}; }); }

// ---------- flat sheet & fitted sheet ----------
function buildFlat(sp){
  var W = toCm(F(sp, "W", 180), sp.unit), L = toCm(F(sp, "L", 260), sp.unit), fcol = fabricFn(sp.color, sp.fabric, sp.color2p, Math.max(1, W / 120));
  var wv = function(x, z){ return .9 * Math.sin(x * .045 + 1) * Math.cos(z * .06) + .5 * Math.sin(x * .11 + z * .09) + .3 * Math.sin(z * .2 - x * .05); };
  var yT = function(x, z){ return 1.3 + wv(x, z); }, yB = function(x, z){ return .4 + wv(x, z); };
  var front = {id: "front", name: "Flat sheet (right side)", polys: gridMesh(70, 56, W, L, yT, function(x, z, u, v){ var c = fcol(x, z, u, v), k = HQ ? 1 : .93 + .12 * Math.sin(x * .045 + 1) * Math.cos(z * .06) + .04 * Math.sin(x * .11 + z * .09); return [c[0] * k, c[1] * k, c[2] * k]; }), ex: [0, 40, 0]};
  var back = {id: "back", name: "Reverse", polys: gridMesh(30, 24, W, L, yB, fabricFn(sp.color2 || sp.color, sp.fabric2 || sp.fabric, sp.color2p, 1), true), ex: [0, -40, 0]};
  var seams = [{id: "side", name: "Edge stitch", pts: seamRect(L, W, 1.2, function(x, z){ return yT(x, z) + .3; }), w: 1.6}];
  var dims = [{a: [-L / 2, 0, -W / 2 - 8], b: [L / 2, 0, -W / 2 - 8], t: cmTxt(L) + " length"}, {a: [L / 2 + 8, 0, -W / 2], b: [L / 2 + 8, 0, W / 2], t: cmTxt(W) + " width"}];
  var T = [
    ["Cutting", "Auto cutter / table", "Cut one piece " + Math.round(W) + " x " + Math.round(L) + " cm + hem allowance + shrinkage. Keep shade band together.", ["front", "back"], [], 1],
    ["Side hems", "Single needle + hemmer", "Hem both long sides (see spec), " + (sp.spi || STEP_DEFAULT.spi) + ".", ["front", "back"], [], 0],
    ["Head & foot hems", "Single needle + hemmer", "Hem head and foot as per spec (head hem is normally wider).", ["front", "back"], [], 0],
    ["Inspect", "Table", "Measure, check hems straight and even, stains, skipped stitches.", ["front", "back"], [], 0],
    ["Fold & pack", "Packing", "Fold per packing spec, band / polybag, label.", ["front", "back"], [], 0]
  ];
  var sy = function(x, z, p){ return p === "back" ? yB(x, z) : yT(x, z); };
  return {hm: 1, sy: sy, parts: [front, back], seams: seams, dims: dims, steps: toSteps(T), R: Math.max(L, W) * .8 + 20, ty: 2, flags: []};
}
function buildFitted(sp){
  var W = toCm(F(sp, "W", 152), sp.unit), L = toCm(F(sp, "L", 203), sp.unit), P = toCm(F(sp, "pocket", 35), sp.unit), fcol = fabricFn(sp.color, sp.fabric, sp.color2p, Math.max(1, W / 120));
  var top = {id: "front", name: "Top panel", polys: gridMesh(50, 40, W, L, function(x, z){ return P + .8 * Math.sin(x * .05) * Math.cos(z * .07); }, fcol), ex: [0, 20, 0]};
  var wall = {id: "back", name: "Skirt (4 sides)", polys: [], ex: [0, -10, 0]}, n = 36, rows = 6, i, j;
  function wp(side, t, y){ var s = t * 2 - 1; return side === 0 ? [-L / 2 + t * L, y, -W / 2] : side === 1 ? [L / 2, y, -W / 2 + t * W] : side === 2 ? [L / 2 - t * L, y, W / 2] : [-L / 2, y, W / 2 - t * W]; }
  for(var sd = 0; sd < 4; sd++) for(i = 0; i < n; i++) for(j = 0; j < rows; j++){
    var t0 = i / n, t1 = (i + 1) / n, y0 = P - P * j / rows, y1 = P - P * (j + 1) / rows, g = function(t, y){ var p = wp(sd, t, y), ga = .8 * Math.sin(t * 60) * (1 - y / P) ; var d = sd % 2 === 0 ? [0, 0, sd === 0 ? -1 : 1] : [sd === 1 ? 1 : -1, 0, 0]; return [p[0] + d[0] * ga, p[1], p[2] + d[2] * ga]; };
    wall.polys.push({p: [g(t0, y0), g(t1, y0), g(t1, y1), g(t0, y1)], c: (function(c){ var k = .78 + .1 * Math.sin((t0 + sd) * 38); return [c[0] * k, c[1] * k, c[2] * k]; })(hex(sp.color))});
  }
  var seams = [{id: "side", name: "Top-to-skirt seam", pts: seamRect(L, W, .3, function(){ return P + .4; }), w: 2}, {id: "elastic", name: "Elastic line", pts: seamRect(L + .2, W + .2, 0, function(){ return 3; }), w: 3, col: [210, 50, 70]}];
  var dims = [{a: [-L / 2, 0, -W / 2 - 8], b: [L / 2, 0, -W / 2 - 8], t: cmTxt(L) + " length"}, {a: [L / 2 + 8, 0, -W / 2], b: [L / 2 + 8, 0, W / 2], t: cmTxt(W) + " width"}, {a: [-L / 2 - 6, 0, W / 2 + 4], b: [-L / 2 - 6, P, W / 2 + 4], t: "pocket " + Math.round(P) + " cm"}];
  var T = [
    ["Cutting", "Auto cutter / table", "Cut top " + Math.round(W) + " x " + Math.round(L) + " cm and 4 skirt strips (pocket " + Math.round(P) + " cm + hem). Corner cut-outs.", ["front", "back"], [], 1],
    ["Join skirt to top", "Overlock", "Join skirt strips, then attach to top panel all around; corners gathered/square per spec.", ["front", "back"], ["side"], 0],
    ["Hem + elastic", "Elastic casing machine", "Hem bottom edge with elastic casing/elastic as per spec.", ["front", "back"], ["elastic"], 0],
    ["Inspect", "Table", "Measure width, length and pocket depth, elastic tension, stains, skipped stitches.", ["front", "back"], [], 0],
    ["Fold & pack", "Packing", "Fold per packing spec.", ["front", "back"], [], 0]
  ];
  var sy = function(x, z, p){ return p === "back" ? P - 1 : P + .8 * Math.sin(x * .05) * Math.cos(z * .07); };
  return {hm: P, sy: sy, parts: [top, wall], seams: seams, dims: dims, steps: toSteps(T), R: Math.max(L, W) * .8 + 20, ty: P / 2, flags: []};
}

// ---------- spec features (from uploaded customer spec) ----------
var FXCOL = {band: [70, 70, 84], zip: [232, 137, 43], opening: [232, 137, 43], loop: [210, 50, 70], tie: [210, 50, 70], button: [40, 100, 200], label: [130, 70, 170], pocket: [20, 130, 120], elastic: [20, 130, 120], hem: [232, 137, 43], piping: [30, 30, 30], binding: [30, 30, 30], flange: [60, 60, 60], other: [90, 90, 90]};
var UNIT = "cm";
function cmTxt(c){ c = +c; if(UNIT === "inch") return (Math.round(c / 2.54 * 10) / 10) + '" (' + (Math.round(c * 10) / 10) + " cm)"; return (Math.round(c * 10) / 10) + " cm"; }
// ---------- explanations ----------
function kindGuide(fi, sp){
  var f = fi.f, k = fi.kind, n = fi.n, nm = f.name || k, spi = sp.spi || "10–12 SPI", w = f.widthCm ? cmTxt(f.widthCm) : "", sz = f.sizeCm ? cmTxt(f.sizeCm) : "";
  var side = /rev|back|inside|under/i.test(String(f.panel || "")) ? "reverse (inside) side" : /both/i.test(String(f.panel || "")) ? "both sides" : "front (outer) side";
  var where = nm + ": " + n + (n > 1 ? " pieces" : " piece") + " on the " + fi.edge + " edge, " + side + (fi.info ? " (" + fi.info + ")" : "") + ".";
  var how, chk;
  if(k === "zip"){ how = ["Mark the START and END points on the edge with chalk or a template — " + (fi.info || "as per spec") + ".", "Fold the opening seam allowance, place the zip tape face-down on the right side with the teeth on the seam line.", "Use a zipper foot and stitch both tape sides close to the teeth at " + spi + ". Move the slider out of the way while stitching.", "Backstitch / bartack at the END point so the zip stopper is held firmly.", "Close the zip, edge-stitch the opening and trim threads."]; chk = ["Zip start and end positions match the spec (±0.5 cm).", "Slider runs smoothly both ways; no waviness or puckering along the zip.", "Zip end is bartacked; tape ends are not frayed.", "Zip type, colour and size are as per spec."]; }
  else if(k === "opening"){ how = ["Cut / fold the opening depth" + (w ? " (" + w + ")" : "") + " on the " + fi.edge + " edge.", "Hem both ends of the opening so the cut edge is enclosed.", "Edge-stitch the opening edge at " + spi + "; keep the overlap even.", "Bartack the stress points at both ends of the opening."]; chk = ["Opening length and depth match the spec" + (fi.info ? " (" + fi.info + ")" : "") + ".", "Overlap is even; pillow/duvet insert does not slip out.", "Corners/ends reinforced."]; }
  else if(k === "hem"){ how = ["Fold the hem width" + (w ? " " + w : "") + (f.fold ? " (" + f.fold + " fold)" : "") + " to the wrong side and press.", "Edge-stitch at the inner fold with " + spi + " using a hemmer; keep stitch distance even.", "Check the hem is straight from corner to corner and trim threads."]; chk = ["Hem width" + (w ? " " + w : "") + " correct along the full length (±3 mm).", "No twisting, pleats or skipped stitches; stitches even.", "Hem corners square and neat."]; }
  else if(k === "loop"){ how = ["Cut the loop tape/fabric" + (sz ? " (" + sz + " long)" : "") + ", fold in half and stitch.", "Mark the loop positions on the " + fi.edge + (fi.info ? " (" + fi.info + ")" : "") + ".", "Place each loop pointing inward on the " + side + " and bartack at the base.", "Cover the seam allowance with the bartack; trim threads."]; chk = ["Count = " + n + "; positions match the spec (±1 cm).", "Pull test: loop and bartack must not tear or slip.", "All loops same length and on the correct side."]; }
  else if(k === "tie"){ how = ["Cut and stitch the tie tape" + (sz ? " (" + sz + ")" : "") + ".", "Mark the position(s)" + (fi.info ? " — " + fi.info : "") + ".", "Place the tie at the corner on the " + side + " and bartack the base.", "Heat-seal / fold-seal the free ends."]; chk = ["Count = " + n + "; position matches the spec.", "Pull test passed; tie ends sealed (no fraying)."]; }
  else if(k === "button"){ how = ["Mark button and buttonhole positions on the " + fi.edge + " edge" + (fi.info ? " (" + fi.info + ")" : "") + ".", "Make the buttonholes, then sew the buttons with a shank.", "Cut loose threads."]; chk = ["Count = " + n + "; spacing even.", "Buttons align with buttonholes; shank firm (pull test).", "Button size/colour as per spec."]; }
  else if(k === "label"){ how = ["Mark the label position — " + (fi.info || fi.edge) + ".", "Place the label on the " + side + " and stitch all four sides (or as per spec).", "Check the printing faces outward and reads correctly."]; chk = ["Right label (content, language, size) as per spec.", "Position correct; stitched flat, no puckering.", "Printing legible; label does not scratch."]; }
  else if(k === "elastic"){ how = ["Cut the elastic to the spec length (relaxed vs stretched).", "Make the casing / pocket edge and insert the elastic.", "Stitch the elastic evenly (zig-zag) while stretching it to the marks."]; chk = ["Elastic length and tension as per spec.", "Fitted pockets even on all four corners.", "No elastic twist or broken stitches."]; }
  else if(k === "piping" || k === "binding" || k === "flange"){ how = ["Prepare the " + nm + (w ? " (" + w + ")" : "") + " strip.", "Stitch it all around the panel edge, keeping the width even.", "Join the ends neatly and trim."]; chk = ["Width " + (w || "per spec") + " even all round.", "Corners square; join not visible."]; }
  else { how = ["Mark the position(s) on the " + fi.edge + " edge" + (fi.info ? " (" + fi.info + ")" : "") + ".", "Attach as per spec and secure with stitches / bartack."]; chk = ["Count and position as per spec.", "Securely attached; no loose threads."]; }
  return {where: where, how: how, chk: chk};
}
function li(a){ return a.map(function(x){ return "<li>" + esc2(x) + "</li>"; }).join(""); }
function esc2(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
function explainOp(st, m, sp){
  var h = '<div class="stu-ex"><h5>What</h5><p>' + esc2(st.d) + '</p><p><b>Machine:</b> ' + esc2(st.m) + "</p>";
  var fs = (st.feats || []).map(function(ix){ return m.fxInfo && m.fxInfo[+ix]; }).filter(Boolean);
  if(fs.length){ fs.forEach(function(fi){ var g = kindGuide(fi, sp), hw = st.how && st.how.length && fs.length === 1 ? st.how : g.how, ck = st.check && st.check.length && fs.length === 1 ? st.check : g.chk; h += "<h5>Where on the article</h5><p>" + esc2(g.where) + "</p><h5>How it is done</h5><ol>" + li(hw) + "</ol><h5>Quality check</h5><ul>" + li(ck) + "</ul>"; }); }
  else if(st.how && st.how.length){ h += "<h5>How it is done</h5><ol>" + li(st.how) + "</ol>" + (st.check && st.check.length ? "<h5>Quality check</h5><ul>" + li(st.check) + "</ul>" : ""); }
  return h + "</div>";
}
function explainFx(k, m, sp){
  var fi = m.fxInfo[k], g = kindGuide(fi, sp), ops = [];
  m.steps.forEach(function(s, i){ if((s.feats || []).some(function(x){ return +x === k; })) ops.push((i + 1) + ". " + s.n); });
  return '<div class="stu-ex"><h5>' + esc2(fi.txt) + '</h5><p>' + esc2(g.where) + (fi.f.specText ? '<br><i>Spec: “' + esc2(String(fi.f.specText).slice(0, 160)) + '”</i>' : '') + '</p><h5>How it is done</h5><ol>' + li(g.how) + '</ol><h5>Quality check</h5><ul>' + li(g.chk) + '</ul>' + (ops.length ? '<p><b>Operation:</b> ' + esc2(ops.join("; ")) + '</p>' : '') + '</div>';
}
function applyX(m, sp, type){
  var X = sp.x; if(!X || !m.sy) return m;
  var L = toCm(F(sp, "L", 90), sp.unit), W = toCm(F(sp, "W", 50), sp.unit), ins = 1.2;
  var baseF = (X.features || []).filter(function(f){ return f && f.kind; }), man = (X.manual || []).filter(function(q){ return q && q.f && q.f.kind; });
  var feats = baseF.concat(man.map(function(q){ return q.f; }));
  var kinds = feats.map(function(f){ return String(f.kind).toLowerCase(); });
  var hasOpen = kinds.some(function(k){ return k === "zip" || k === "opening"; }), hasLoop = kinds.some(function(k){ return k === "loop" || k === "tie"; });
  m.seams = m.seams.filter(function(s){ return !(type === "fitted" && s.id === "elastic" && kinds.indexOf("elastic") >= 0) && !(hasOpen && (s.id === "zip" || s.id === "open" || s.id === "hem")) && !(hasLoop && /^tie\d/.test(s.id)); });
  m.marks = []; m.fxInfo = [];
  var E = {foot: {len: W, at: function(s, i2){ return [L / 2 - (i2 || 0), -W / 2 + s]; }, d: [-1, 0], o: [1, 0]}, head: {len: W, at: function(s, i2){ return [-L / 2 + (i2 || 0), -W / 2 + s]; }, d: [1, 0], o: [-1, 0]},
    left: {len: L, at: function(s, i2){ return [-L / 2 + s, -W / 2 + (i2 || 0)]; }, d: [0, 1], o: [0, -1]}, right: {len: L, at: function(s, i2){ return [-L / 2 + s, W / 2 - (i2 || 0)]; }, d: [0, -1], o: [0, 1]}};
  var cornerList = [[-1, -1], [1, -1], [-1, 1], [1, 1]], sc = [];
  function partOf(pn){ return m.parts.filter(function(p){ return p.id === (pn === "back" ? "back" : "front"); })[0] || m.parts[0]; }
  function mark(p, t, col){ m.marks.push({p: p, t: t, col: col, fi: curI, pn: curPn}); }
  var curI = -1, curPn = "both";
  feats.forEach(function(f, i){
    curI = i;
    var kind = String(f.kind).toLowerCase(), col = FXCOL[kind] || FXCOL.other, n = Math.max(1, Math.round(+f.count || 1)), size = +f.sizeCm || (String(f.kind).toLowerCase() === "label" ? +f.lengthCm || 0 : 0), ids = [], fp = null;
    var edge = String(f.edge || "foot").toLowerCase(); if(edge === "top") edge = "head"; if(edge === "bottom") edge = "foot"; if(/^(all|around|perimeter|four)/.test(edge)) edge = "all";
    var pnTxt = (String(f.panel || "") + " " + String(f.placement || "")).toLowerCase(), both = /both|all/.test(pnTxt) || (!pnTxt && /zip|opening|hem|piping|binding|flange|elastic/.test(kind)), pns = both ? ["front", "back"] : [/rev|back|inside|under|wrong/.test(pnTxt) ? "back" : "front"];
    var name = f.name || kind; curPn = pns.length === 2 ? "both" : pns[0];
    function srf(x, z, pn){ if(type === "fitted" && (kind === "elastic" || kind === "hem")) return 3.5; return m.sy(x, z, pn) + (pn === "back" ? -.45 : .45); }
    function addLine(pts, pn, w, dash, c){ var id = "f" + i + "_" + ids.length; ids.push(id); m.seams.push({id: id, name: name + (n > 1 ? " ×" + n : ""), pts: pts, w: w, col: c || col, dash: dash, group: "fx" + i, noLabel: ids.length > 1, exPart: partOf(pn)}); }
    function addBand(poly, pn, c, a){ var par = partOf(pn); m.parts.push({id: "ov" + i + pn, name: name, polys: poly.map(function(q){ return {p: q, c: c}; }), ex: par.ex, alpha: a || .55, overlay: true, ov: 1}); }
    function dimEdge(e, s0, s1, txt){ if(Math.abs(s1 - s0) < 1.5) return; var a = e.at(s0), b = e.at(s1), off = 7; m.dims.push({a: [a[0] + e.o[0] * off, m.sy(a[0], a[1], "front") + .5, a[1] + e.o[1] * off], b: [b[0] + e.o[0] * off, m.sy(b[0], b[1], "front") + .5, b[1] + e.o[1] * off], t: txt, fi: i}); }
    var e = E[edge], items = [], info = "";
    pns.forEach(function(pn){
      var sg = pn === "back" ? -1 : 1;
      if(/^(band|embroidery|rope|stripe|pintuck|pleat|cord)$/.test(kind)){
        var rowsB = Math.max(1, Math.round(+f.rows || 1)), lwB = +f.widthCm || .5, spB = +f.spacingCm || .6, pitB = lwB + spB;
        var blB = Array.isArray(f.bands) && f.bands.length ? f.bands : (edge === "all" ? ["left", "right", "head", "foot"] : [edge]).map(function(fr){ return {from: fr, offsetCm: +f.offsetCm || 5}; });
        blB.forEach(function(b, bi){
          var fr = String(b.from || "left").toLowerCase(), off = +b.offsetCm || 0, vert = fr === "left" || fr === "right", r, k, pts, x, z;
          if(fr === "top") fr = "head"; if(fr === "bottom") fr = "foot";
          for(r = 0; r < rowsB; r++){ var o = off + (r - (rowsB - 1) / 2) * pitB; pts = [];
            for(k = 0; k <= 24; k++){ var tB = k / 24; if(vert){ x = -L / 2 + L * tB; z = fr === "left" ? -W / 2 + o : W / 2 - o; } else { z = -W / 2 + W * tB; x = fr === "head" ? -L / 2 + o : L / 2 - o; } pts.push([x, srf(x, z, pn), z]); }
            addLine(pts, pn, 2.3, null, col); }
          var mxB = vert ? 0 : (fr === "head" ? -L / 2 + off : L / 2 - off), mzB = vert ? (fr === "left" ? -W / 2 + off : W / 2 - off) : 0;
          if(pn === pns[0]){ mark([mxB, srf(mxB, mzB, pn), mzB], (blB.length > 1 ? (bi + 1) + "/" + blB.length + " " : "") + name + " · " + rowsB + " rows · " + cmTxt(off) + " from " + fr + " edge", "#444"); if(bi === 0) fp = [mxB, mzB];
            var eB = E[fr]; if(eB){ var a_ = vert ? [0, fr === "left" ? -W / 2 : W / 2] : [fr === "head" ? -L / 2 : L / 2, 0]; m.dims.push({a: [a_[0], srf(a_[0], a_[1], pn) + .6, a_[1]], b: [mxB, srf(mxB, mzB, pn) + .6, mzB], t: cmTxt(off), fi: i}); } }
        });
        n = blB.length; info = blB.length + " band(s) · " + rowsB + " rows each · line " + cmTxt(lwB) + " wide, " + cmTxt(spB) + " apart"; return;
      }
      if(kind === "zip" || kind === "opening" || kind === "hem"){
        var rl = e ? e.len : 0; if(!e && edge !== "all") return;
        if(edge === "all"){ // perimeter hem / opening all round
          var wd = clamp(+f.widthCm || 2.5, .5, 15), qd = [], k, ring = [[-L / 2, -W / 2], [L / 2, -W / 2], [L / 2, W / 2], [-L / 2, W / 2]];
          ["foot", "head", "left", "right"].forEach(function(en){ var ee = E[en], nn = 18; for(k = 0; k < nn; k++){ var s0 = ee.len * k / nn, s1 = ee.len * (k + 1) / nn, a0 = ee.at(s0, 0), a1 = ee.at(s1, 0), b0 = ee.at(s0, wd), b1 = ee.at(s1, wd); qd.push([[a0[0], srf(a0[0], a0[1], pn), a0[1]], [a1[0], srf(a1[0], a1[1], pn), a1[1]], [b1[0], srf(b1[0], b1[1], pn), b1[1]], [b0[0], srf(b0[0], b0[1], pn), b0[1]]]); } });
          addBand(qd, pn, col); addLine(seamRect(L, W, wd, function(x, z){ return srf(x, z, pn); }), pn, 2.4); fp = [0, 0]; info = "all round · " + cmTxt(wd);
          if(pn === "front") mark([L / 2 - wd, srf(L / 2 - wd, 0, pn), 0], name + " " + cmTxt(wd) + " all round", "#B4531A");
          return;
        }
        var of_ = +f.offsetCm || 0, wd2 = kind === "hem" ? clamp(+f.widthCm || 2.5, .5, 20) : clamp(+f.widthCm || (kind === "zip" ? 2 : +f.flapCm || 6), .8, 25);
        var zl = clamp(+f.lengthCm || (kind === "hem" ? rl : rl * .8), 3, rl), st0 = f.startCm != null && !isNaN(+f.startCm) ? clamp(+f.startCm, 0, rl - zl) : (f.endCm != null && !isNaN(+f.endCm) ? clamp(+f.endCm - zl, 0, rl - zl) : (rl - zl) / 2), st1 = st0 + zl, nn2 = 24, qd2 = [], p1 = [], p2 = [], k2;
        for(k2 = 0; k2 < nn2; k2++){ var u0 = st0 + zl * k2 / nn2, u1 = st0 + zl * (k2 + 1) / nn2, a0 = e.at(u0, of_), a1 = e.at(u1, of_), b0 = e.at(u0, of_ + wd2), b1 = e.at(u1, of_ + wd2); qd2.push([[a0[0], srf(a0[0], a0[1], pn), a0[1]], [a1[0], srf(a1[0], a1[1], pn), a1[1]], [b1[0], srf(b1[0], b1[1], pn), b1[1]], [b0[0], srf(b0[0], b0[1], pn), b0[1]]]); }
        for(k2 = 0; k2 <= 24; k2++){ var uu = st0 + zl * k2 / 24, q1 = e.at(uu, of_ + wd2), q2 = e.at(uu, of_ + wd2 / 2); p1.push([q1[0], srf(q1[0], q1[1], pn), q1[1]]); p2.push([q2[0], srf(q2[0], q2[1], pn), q2[1]]); }
        addBand(qd2, pn, kind === "zip" ? [70, 70, 78] : col, kind === "opening" ? .38 : .6);
        addLine(p1, pn, 2.4); if(kind === "zip") addLine(p2, pn, 1.2, [3, 3], [230, 230, 230]); if(kind === "hem" && /double/i.test(String(f.fold || ""))) addLine(p2, pn, 1.4, [4, 3], [255, 255, 255]);
        if(pn === pns[0] && zl < rl * .98){
          var sA = e.at(st0, of_), sB = e.at(st1, of_);
          mark([sA[0], srf(sA[0], sA[1], pn), sA[1]], "START · " + cmTxt(st0) + " from corner", "#1a7f37"); mark([sB[0], srf(sB[0], sB[1], pn), sB[1]], "END · " + cmTxt(rl - st1) + " to corner", "#c62828");
          dimEdge(e, 0, st0, cmTxt(st0)); dimEdge(e, st0, st1, (kind === "hem" ? "hem " : kind === "zip" ? "zip " : "opening ") + cmTxt(zl)); dimEdge(e, st1, rl, cmTxt(rl - st1));
        }
        if(pn === pns[0]){
          var mid = e.at((st0 + st1) / 2, of_ + wd2); mark([mid[0], srf(mid[0], mid[1], pn), mid[1]], (kind === "hem" ? (f.name ? name + " · " : "HEM ") + cmTxt(wd2) + (f.fold && !f.name ? " " + f.fold : "") : kind === "zip" ? "ZIP" : (f.name ? name : "OPENING AREA") + " · " + cmTxt(zl) + " × " + cmTxt(wd2)), kind === "hem" ? "#B4531A" : "#2F5A1A");
          fp = [mid[0], mid[1]]; info = edge + " · start " + cmTxt(st0) + " · end " + cmTxt(st1) + (kind === "hem" ? " · width " + cmTxt(wd2) : "");
        }
        return;
      }
      if(kind === "piping" || kind === "binding" || kind === "flange" || kind === "elastic"){
        var ww = kind === "flange" ? clamp(size || +f.widthCm || 5, 1, 12) : .5; addLine(seamRect(L, W, ww, function(x, z){ return srf(x, z, pn); }), pn, kind === "flange" ? 2.2 : 4); fp = [L / 2 - ww, 0];
        if(pn === pns[0]) mark([L / 2 - ww, srf(L / 2 - ww, 0, pn), 0], name + (kind === "flange" ? " " + cmTxt(ww) : ""), "#444"); info = "around · " + (kind === "flange" ? cmTxt(ww) : ""); return;
      }
      // point items
      var its = [];
      var spots = Array.isArray(f.spots) && f.spots.length ? f.spots.map(function(t){ return String(t).toLowerCase().replace(/[_ ]/g, "-"); }) : null;
      if(!spots && (kind === "tie" || kind === "loop") && (edge === "all" || edge === "corners") && n > 4 && !(Array.isArray(f.positionsCm) && f.positionsCm.length)) spots = ["corner-tl", "corner-tr", "corner-bl", "corner-br", "head-mid", "left-mid", "right-mid", "foot-mid"].slice(0, n);
      if(spots){
        var SPOT = {"corner-tl": [-1, -1], "corner-tr": [-1, 1], "corner-bl": [1, -1], "corner-br": [1, 1], "head-left": [-1, -1], "head-right": [-1, 1], "foot-left": [1, -1], "foot-right": [1, 1]}, MID = {"head-mid": [-1, 0], "foot-mid": [1, 0], "left-mid": [0, -1], "right-mid": [0, 1]};
        spots.forEach(function(t){
          if(t === "corners"){ cornerList.forEach(function(c){ its.push({x: c[0] * (L / 2 - ins), z: c[1] * (W / 2 - ins), d: [-c[0] * .7, -c[1] * .7], tag: "corner"}); }); }
          else if(SPOT[t]){ var c = SPOT[t]; its.push({x: c[0] * (L / 2 - ins), z: c[1] * (W / 2 - ins), d: [-c[0] * .7, -c[1] * .7], tag: t}); }
          else if(MID[t]){ var q = MID[t]; its.push({x: q[0] * (L / 2 - ins), z: q[1] * (W / 2 - ins), d: [-q[0], -q[1]], tag: t}); }
        });
      }
      if(spots && its.length){}
      else if(edge === "corners" || edge === "all"){ cornerList.slice(0, Math.min(Math.max(n, 4), 4)).forEach(function(c){ var x = c[0] * (L / 2 - ins), z = c[1] * (W / 2 - ins); its.push({x: x, z: z, d: [-c[0] * .7, -c[1] * .7]}); }); }
      else if(e){
        var pos = Array.isArray(f.positionsCm) && f.positionsCm.length ? f.positionsCm.map(Number) : null;
        if(!pos){ var sp_ = +f.spacingCm || 0, s1 = f.startCm != null && !isNaN(+f.startCm) ? +f.startCm : null; if(n === 1) pos = [s1 != null ? s1 : e.len / 2]; else { if(!sp_) sp_ = (e.len - 2 * (s1 != null ? s1 : 4)) / (n - 1); if(s1 == null) s1 = (e.len - sp_ * (n - 1)) / 2; pos = []; for(var q = 0; q < n; q++) pos.push(s1 + sp_ * q); } }
        pos.forEach(function(s){ s = clamp(s, ins, e.len - ins); var a = e.at(s, f.offsetCm != null && !isNaN(+f.offsetCm) ? +f.offsetCm : ins); its.push({x: a[0], z: a[1], d: e.d, s: s}); });
      }
      var tieQ = [];
      its.forEach(function(it, ix){
        var d = it.d.map(function(v){ return v; }), nn = [-d[1], d[0]], len = size || (kind === "tie" ? 25 : kind === "loop" ? 8 : kind === "button" ? 2 : kind === "label" ? 6 : 5), pts = [], r;
        function Pp(x, z, y){ return [x, srf(x, z, pn) + sg * (y || 0), z]; }
        if(kind === "loop"){ var w_ = 1.4; for(r = 0; r <= 18; r++){ var a_ = r / 18 * Math.PI * 2, u = Math.cos(a_) * w_, v = (1 - Math.cos(a_)) / 2 * len; pts.push(Pp(it.x + nn[0] * u + d[0] * v, it.z + nn[1] * u + d[1] * v, .5)); } addLine(pts, pn, 3.4); }
        else if(kind === "tie"){
          var tw = Math.max(1.8, +f.widthCm || 1), nr = 12, k3;
          for(r = 0; r < nr; r++){ var t0 = len * r / nr, t1 = len * (r + 1) / nr, ax = it.x + d[0] * t0, az = it.z + d[1] * t0, bx = it.x + d[0] * t1, bz = it.z + d[1] * t1, h_ = .55;
            tieQ.push([Pp(ax - nn[0] * tw / 2, az - nn[1] * tw / 2, h_), Pp(bx - nn[0] * tw / 2, bz - nn[1] * tw / 2, h_), Pp(bx + nn[0] * tw / 2, bz + nn[1] * tw / 2, h_), Pp(ax + nn[0] * tw / 2, az + nn[1] * tw / 2, h_)]); }
          var mx = it.x + d[0] * len / 2, mz = it.z + d[1] * len / 2;
          addLine([Pp(it.x - nn[0] * tw / 2, it.z - nn[1] * tw / 2, .6), Pp(it.x + d[0] * len - nn[0] * tw / 2, it.z + d[1] * len - nn[1] * tw / 2, .6), Pp(it.x + d[0] * len + nn[0] * tw / 2, it.z + d[1] * len + nn[1] * tw / 2, .6), Pp(it.x + nn[0] * tw / 2, it.z + nn[1] * tw / 2, .6), Pp(it.x - nn[0] * tw / 2, it.z - nn[1] * tw / 2, .6)], pn, 1.3, null, [150, 120, 90]);
          addLine([Pp(mx - nn[0] * tw / 2, mz - nn[1] * tw / 2, .7), Pp(mx + nn[0] * tw / 2, mz + nn[1] * tw / 2, .7)], pn, 3.2, null, [200, 30, 55]);
        }
        else if(kind === "button"){ for(r = 0; r <= 14; r++){ var a2 = r / 14 * Math.PI * 2; pts.push(Pp(it.x + Math.cos(a2) * len / 2, it.z + Math.sin(a2) * len / 2, .6)); } addLine(pts, pn, 3.2); }
        else { var wl = kind === "label" ? (+f.widthCm || len * .7) : len; if(kind === "label") tieQ.push([Pp(it.x - nn[0] * wl / 2, it.z - nn[1] * wl / 2, .5), Pp(it.x - nn[0] * wl / 2 + d[0] * len, it.z - nn[1] * wl / 2 + d[1] * len, .5), Pp(it.x + nn[0] * wl / 2 + d[0] * len, it.z + nn[1] * wl / 2 + d[1] * len, .5), Pp(it.x + nn[0] * wl / 2, it.z + nn[1] * wl / 2, .5)]); addLine([Pp(it.x - nn[0] * wl / 2, it.z - nn[1] * wl / 2), Pp(it.x - nn[0] * wl / 2 + d[0] * len, it.z - nn[1] * wl / 2 + d[1] * len), Pp(it.x + nn[0] * wl / 2 + d[0] * len, it.z + nn[1] * wl / 2 + d[1] * len), Pp(it.x + nn[0] * wl / 2, it.z + nn[1] * wl / 2), Pp(it.x - nn[0] * wl / 2, it.z - nn[1] * wl / 2)], pn, 2.8); }
        if(pn === pns[0]){
          if(ix === 0) fp = [it.x, it.z];
          if(its.length <= 4 || ix === 0) mark(Pp(it.x, it.z, 1), (its.length > 1 ? (ix + 1) + "/" + its.length + " " : "") + name + (it.s != null ? " · " + cmTxt(it.s) + " from corner" : "") + (kind === "label" ? (e ? " · " + cmTxt(f.offsetCm != null && !isNaN(+f.offsetCm) ? +f.offsetCm : ins) + " in from " + edge + " edge" : "") + " · size " + cmTxt(len) + " × " + cmTxt(+f.widthCm || len * .7) + (f.lengthCm || f.sizeCm ? "" : " (size not in spec)") : ""), "#B4531A"); else mark(Pp(it.x + it.d[0] * len / 2, it.z + it.d[1] * len / 2, 1), String(ix + 1), "#B4531A");
          if(e && ix === 0) dimEdge(e, 0, it.s, cmTxt(it.s)); if(e && ix > 0 && its.length <= 6) dimEdge(e, its[ix - 1].s, it.s, cmTxt(it.s - its[ix - 1].s));
        }
      });
      if(tieQ.length) addBand(tieQ, pn, kind === "label" ? [252, 250, 244] : [240, 235, 218], 1);
      n = its.length; info = (edge === "corners" || edge === "all" ? "corners" : edge) + (its[0] && its[0].s != null ? " · first at " + cmTxt(its[0].s) : "");
    });
    var txt = name + " ×" + n + " · " + edge + (pns.length === 2 ? " · both sides" : pns[0] === "back" ? " · reverse side" : " · front side");
    sc.push(ids); m.fxInfo.push({i: i, kind: kind, n: n, edge: edge, txt: txt, info: info, f: f, at: fp});
  });
  // operations from the spec
  var ops = (X.ops || []).filter(function(o){ return o && o.name; }), keepSteps = !ops.length;
  var MACH = {tie: "Bartack / lockstitch", zip: "Zipper foot lockstitch", label: "Single needle lockstitch", loop: "Bartack", button: "Button attach", hem: "Hemming (double fold)", opening: "Lockstitch", piping: "Piping foot", flange: "Lockstitch", elastic: "Zig-zag / overlock"};
  man.forEach(function(q, j){ var f_ = q.f, kd = String(f_.kind).toLowerCase(); ops.push({name: "Attach " + (f_.name || kd) + (f_.count > 1 ? " ×" + f_.count : ""), machine: MACH[kd] || "Lockstitch", detail: (f_.sizeCm ? f_.sizeCm + " cm " : "") + (f_.placement || "") + " · added manually", features: [baseF.length + j]}); });
  if(ops.length){
    var pids = m.parts.map(function(p){ return p.id; }), qIds = m.seams.filter(function(s){ return s.group === "quilt"; }).map(function(s){ return s.id; });
    function focusIds(fo){
      var have = function(id){ return m.seams.some(function(s){ return s.id === id; }); };
      fo = String(fo || "").toLowerCase();
      if(/side|join|seam/.test(fo)) return have("side") ? ["side"] : [];
      if(/quilt/.test(fo)) return qIds;
      if(/edge|bind|flange|pip/.test(fo)) return ["bind", "flange", "piping"].filter(have);
      if(/open|zip|hem/.test(fo)) return ["zip", "open", "hem"].filter(have);
      return [];
    }
    var mappedSteps = ops.map(function(o){
      var hi = focusIds(o.focus), fp = null; (o.features || []).forEach(function(ix){ (sc[+ix] || []).forEach(function(id){ hi.push(id); }); var fi = m.fxInfo[+ix]; if(!fp && fi && fi.at) fp = [fi.at[0], m.sy(fi.at[0], fi.at[1], "front"), fi.at[1]]; });
      var onback = (o.features || []).some(function(ix){ var f_ = m.fxInfo[+ix]; return f_ && /rev|back|inside|under/.test(String(f_.f.panel || "").toLowerCase()); });
      return {n: o.name, m: o.machine || "—", d: o.detail || "", show: pids, hi: hi, ex: /cut/i.test(o.name) ? 1 : 0, fp: fp, back: onback, feats: (o.features || []).map(Number), how: Array.isArray(o.how) ? o.how : null, check: Array.isArray(o.check) ? o.check : null};
    });
    m.steps = keepSteps ? m.steps.concat(mappedSteps) : mappedSteps;
  }
  (X.missing || []).forEach(function(t){ m.flags.push(["w", "Spec missing / unclear: " + t]); });
  (X.notes || []).forEach(function(t){ m.flags.push(["i", t]); });
  return m;
}
function mkModel(type, sp){ UNIT = sp.unit === "inch" ? "inch" : "cm"; var m = BUILD[type](sp); m.kind = type; try{ if(sp.x) applyX(m, sp, type); }catch(e){ m.flags = (m.flags || []).concat([["r", "Spec features could not be drawn: " + e.message]]); } return m; }

var BUILD = {pillow: buildPillow, duvet: buildDuvet, comforter: buildComforter, flat: buildFlat, fitted: buildFitted, sheet: buildSheet, bolster: buildBolster};
var TYPES = [["pillow", "Pillowcase"], ["duvet", "Duvet cover"], ["flat", "Flat sheet"], ["fitted", "Fitted sheet"], ["sheet", "Sheet set"], ["comforter", "Comforter"], ["bolster", "Bolster"]];
var DEFAULTS = {
  pillow: {unit: "cm", L: 75, W: 50, closure: "envelope", flap: "", flange: 0, hemDepth: 2.5},
  duvet: {unit: "inch", W: 104, L: 90, closure: "zip", ties: "0"},
  sheet: {unit: "cm", W: 152, L: 203, pocket: ""},
  flat: {unit: "cm", W: 180, L: 260},
  fitted: {unit: "cm", W: 152, L: 203, pocket: 35},
  comforter: {unit: "inch", W: 104, L: 90, quilt: "box", cell: 8, fill: ""},
  bolster: {unit: "cm", L: 90, W: 18}
};

// ---------- spec parsing from YQI order rows ----------
function parseSize(z){
  var m = String(z || "").match(/(\d+(?:\.\d+)?)\s*[x×*]\s*(\d+(?:\.\d+)?)/i); if(!m) return null;
  var unit = /inch|in\b|"/i.test(z) ? "inch" : /cm/i.test(z) ? "cm" : (+m[1] > 130 ? "cm" : "inch");
  return {a: +m[1], b: +m[2], unit: unit};
}
function inferType(n){
  n = String(n || "").toLowerCase();
  if(/pillow/.test(n)) return "pillow"; if(/duvet/.test(n)) return "duvet"; if(/comforter|quilt/.test(n)) return "comforter";
  if(/flat sheet|flat/.test(n)) return "flat"; if(/fitted/.test(n)) return "fitted"; if(/sheet/.test(n)) return "sheet"; if(/bolster/.test(n)) return "bolster"; return "duvet";
}
function inferSpec(name, size, colour){
  var n = String(name || "").toLowerCase(), t = inferType(name), sp = Object.assign({}, DEFAULTS[t], {type: t, color: colorOf(colour), colorName: colour || ""});
  var z = parseSize(size);
  if(z){ sp.unit = z.unit; if(t === "pillow"){ sp.L = Math.max(z.a, z.b); sp.W = Math.min(z.a, z.b); } else { sp.W = z.a; sp.L = z.b; } }
  sp.fabric = /waffle/.test(n) ? "waffle" : /washed/.test(n) ? "washed" : /napped|flannel/.test(n) ? "napped" : /fresh leaf|print/.test(n) ? "print" : "plain";
  if(/zip/.test(n)) sp.closure = "zip"; if(/button/.test(n)) sp.closure = "button"; if(/oxford/.test(n)){ sp.closure = "oxford"; sp.flange = 5; }
  if(/waffle/.test(n)){ sp.pcSeparate = "1"; sp.fabric2 = "plain"; }
  if(/fresh leaf/.test(n)) sp.color2p = "#5b8f4f";
  return sp;
}

// ---------- engine ----------
// ---------- WebGL2 renderer: smooth normals, shadow-mapped soft light, progressive accumulation (Blender-like soft GI) ----------
var HQ = (function(){ try{ var c = document.createElement("canvas"); var g = c.getContext("webgl2"); if(g){ var ex = g.getExtension("WEBGL_lose_context"); if(ex) ex.loseContext(); return true; } }catch(e){} return false; })();
function m4(){ return new Float32Array(16); }
function m4mul(a, b){ var o = m4(), i, j, k; for(i = 0; i < 4; i++) for(j = 0; j < 4; j++){ var s = 0; for(k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k]; o[i * 4 + j] = s; } return o; }
function m4look(e, c, up){ var z = [e[0] - c[0], e[1] - c[1], e[2] - c[2]], l = Math.hypot(z[0], z[1], z[2]); z = z.map(function(v){ return v / l; });
  var x = [up[1] * z[2] - up[2] * z[1], up[2] * z[0] - up[0] * z[2], up[0] * z[1] - up[1] * z[0]]; l = Math.hypot(x[0], x[1], x[2]); x = x.map(function(v){ return v / l; });
  var y = [z[1] * x[2] - z[2] * x[1], z[2] * x[0] - z[0] * x[2], z[0] * x[1] - z[1] * x[0]], o = m4();
  o[0] = x[0]; o[4] = x[1]; o[8] = x[2]; o[12] = -(x[0] * e[0] + x[1] * e[1] + x[2] * e[2]); o[1] = y[0]; o[5] = y[1]; o[9] = y[2]; o[13] = -(y[0] * e[0] + y[1] * e[1] + y[2] * e[2]); o[2] = z[0]; o[6] = z[1]; o[10] = z[2]; o[14] = -(z[0] * e[0] + z[1] * e[1] + z[2] * e[2]); o[15] = 1; return o; }
function m4ortho(r, n, f){ var o = m4(); o[0] = 1 / r; o[5] = 1 / r; o[10] = -2 / (f - n); o[14] = -(f + n) / (f - n); o[15] = 1; return o; }
function GLR(cv){
  var gl = cv.getContext("webgl2", {antialias: false, alpha: true, premultipliedAlpha: true, powerPreference: "high-performance"});
  if(!gl) return null;
  var hasF = !!gl.getExtension("EXT_color_buffer_float"), SM = 2048;
  function sh(type, src){ var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
  function prog(vs, fs){ var p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p); if(!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); var u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); for(var i = 0; i < n; i++){ var a = gl.getActiveUniform(p, i); u[a.name] = gl.getUniformLocation(p, a.name); } return {p: p, u: u}; }
  var HEAD = "#version 300 es\nprecision highp float;\nprecision highp sampler2DShadow;\n";
  var COMMON = "uniform mat3 uR; uniform vec3 uT; uniform vec4 uPr; uniform vec2 uZ; uniform vec2 uJ;\nvec4 proj(vec3 c){ float A = (uZ.y + uZ.x) / (uZ.y - uZ.x), B = -2.0 * uZ.y * uZ.x / (uZ.y - uZ.x); return vec4(uPr.x * c.x + uJ.x * c.z, uPr.y * c.y + uPr.z * c.z + uJ.y * c.z, A * c.z + B, c.z); }\n";
  var SHAD = "uniform sampler2DShadow uSh; uniform mat4 uLV; uniform vec3 uL; uniform float uTex; uniform float uOn;\n" +
    "float vis(vec3 wr, vec3 N){ if(uOn < 0.5) return 1.0; vec3 p = wr + N * uTex * 1.6 + uL * uTex * 0.8; vec4 q = uLV * vec4(p, 1.0); vec3 s = q.xyz * 0.5 + 0.5; if(s.x < 0.0 || s.x > 1.0 || s.y < 0.0 || s.y > 1.0 || s.z > 1.0) return 1.0; float t = 1.0 / " + SM + ".0, r = 0.0; s.z -= 0.0006;\n" +
    "  r += texture(uSh, vec3(s.xy, s.z)); r += texture(uSh, vec3(s.xy + vec2(t, 0.4 * t), s.z)); r += texture(uSh, vec3(s.xy + vec2(-t, -0.4 * t), s.z)); r += texture(uSh, vec3(s.xy + vec2(0.4 * t, t), s.z)); r += texture(uSh, vec3(s.xy + vec2(-0.4 * t, -t), s.z)); return r / 5.0; }\n";
  var depthP = prog(HEAD + "uniform mat4 uLV; uniform vec3 uOff; in vec3 aP; void main(){ gl_Position = uLV * vec4(aP + uOff, 1.0); }", HEAD + "out vec4 o; void main(){ o = vec4(0.0); }");
  var meshP = prog(HEAD + COMMON + "uniform vec3 uOff; in vec3 aP; in vec3 aN; in vec3 aC; in float aAO; out vec3 vN; out vec3 vNw; out vec3 vC; out vec3 vV; out vec3 vP; out vec3 vWr; out float vAO;\nvoid main(){ vec3 w = aP + uOff; vec3 c = uR * w + uT; vN = uR * aN; vNw = aN; vC = aC; vV = c; vP = aP; vWr = w; vAO = aAO; gl_Position = proj(c); }",
    HEAD + SHAD + "uniform mat3 uR; uniform float uA; uniform float uFab; uniform vec3 uTint; uniform float uMode; uniform float uLt; uniform vec3 uLc; in vec3 vN; in vec3 vNw; in vec3 vC; in vec3 vV; in vec3 vP; in vec3 vWr; in float vAO; out vec4 o;\n" +
    "float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }\n" +
    "float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }\n" +
    "void main(){\n" +
    "  vec3 V = normalize(-vV); vec3 N = normalize(vN); vec3 Nw = normalize(vNw); if(dot(N, V) < 0.0){ N = -N; Nw = -Nw; }\n" +
    "  float px = length(fwidth(vP)); float lod = 1.0 - smoothstep(0.03, 0.10, px);\n" +
    "  float r1 = vn(vP.xz * 0.55 + vP.y * 0.3), r2 = vn(vP.xz * 0.55 + 17.0 + vP.y * 0.3);\n" +
    "  vec3 pw = vec3(r1 - 0.5, 0.0, r2 - 0.5) * 0.16 * uFab;\n" +
    "  float wv = sin(vP.x * 41.0) * sin(vP.z * 37.0 + vP.y * 5.0); float grain = (vn(vP.xz * 9.0) - 0.5);\n" +
    "  Nw = normalize(Nw + pw + vec3(wv * 0.05, 0.0, wv * 0.05) * lod * uFab);\n" +
    "  vec3 alb = pow(vC, vec3(2.2)) * uTint; alb *= 1.0 + (grain * 0.10 + wv * 0.035) * lod * uFab;\n" +
    "  float ao = mix(1.0, vAO, uMode > 0.5 ? 0.55 : 1.0);\n" +
    "  float nl = uLt < 0.5 ? clamp((dot(Nw, uL) + 0.30) / 1.30, 0.0, 1.0) : max(dot(Nw, uL), 0.0);\n" +
    "  if(uLt < 0.5) nl = nl * nl * (3.0 - 2.0 * nl) * 0.55 + nl * 0.45;\n" +
    "  float v = vis(vWr, normalize(vNw) * (dot(normalize(vN), V) < 0.0 ? -1.0 : 1.0));\n" +
    "  vec3 E = uLc * nl * v;\n" +
    "  if(uMode < 0.5){ float sky = Nw.y * 0.5 + 0.5; E += mix(vec3(0.20, 0.19, 0.17), vec3(0.62, 0.66, 0.72), sky) * ao * 0.95; }\n" +
    "  else { float sky = Nw.y * 0.5 + 0.5; E += mix(vec3(0.20, 0.19, 0.17), vec3(0.62, 0.66, 0.72), sky) * ao * 0.16; }\n" +
    "  vec3 Lr = normalize(vec3(0.1, 0.4, 0.9));\n" +
    "  vec3 lit = alb * E;\n" +
    "  float ndv = clamp(dot(N, V), 0.0, 1.0); float fr = pow(1.0 - ndv, 3.0);\n" +
    "  vec3 Vw = V * uR; vec3 H = normalize(uL + Vw); float spec = uLt < 0.5 ? pow(max(dot(Nw, H), 0.0), 28.0) * 0.045 * uFab * v : 0.0;\n" +
    "  lit += (alb * 0.55 + vec3(0.06)) * fr * 0.28 * uFab * ao * (0.55 + 0.45 * v);\n" +
    "  lit += vec3(spec) * ao;\n" +
    "  lit += alb * pow(max(dot(Nw, Lr), 0.0), 2.0) * 0.05;\n" +
    "  lit = lit * 1.18; lit = lit / (1.0 + lit * 0.55); lit = pow(lit, vec3(1.0 / 2.2));\n" +
    "  o = vec4(lit * uA, uA);\n" +
    "}");
  var grdP = prog(HEAD + COMMON + "uniform vec3 uTg; in vec3 aP; out vec3 vP; void main(){ vP = aP; gl_Position = proj(uR * (aP - uTg) + uT); }",
    HEAD + SHAD + "uniform vec3 uTg; uniform vec4 uBox; uniform float uSoft; uniform float uStr; uniform float uDark; in vec3 vP; out vec4 o;\n" +
    "float sdb(vec2 p, vec2 b){ vec2 d = abs(p) - b; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0); }\n" +
    "void main(){ vec2 q = vP.xz - uBox.xy; float d2 = sdb(q, uBox.zw * 0.99);\n" +
    "  float v = vis(vP - uTg, vec3(0.0, 1.0, 0.0));\n" +
    "  float s = (1.0 - v) * uDark + (1.0 - smoothstep(0.0, uSoft * 0.35, d2)) * 0.16;\n" +
    "  float fade = 1.0 - smoothstep(0.55, 1.0, length(vP.xz - uBox.xy) / (length(uBox.zw) * 3.2)); s *= fade * uStr; o = vec4(vec3(0.05, 0.06, 0.04) * s, s); }");
  var rbP = prog(HEAD + "in vec2 aXY; in float aZ; in vec4 aCol; in float aE; out vec4 vCol; out float vE; void main(){ vCol = aCol; vE = aE; gl_Position = vec4(aXY, aZ, 1.0); }",
    HEAD + "in vec4 vCol; in float vE; out vec4 o; void main(){ float a = vCol.a * (1.0 - smoothstep(0.5, 1.0, abs(vE))); o = vec4(vCol.rgb * a, a); }");
  var cmpP = prog(HEAD + "out vec2 vUV; void main(){ vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2); vUV = p; gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0); }",
    HEAD + "uniform sampler2D uT; in vec2 vUV; out vec4 o; void main(){ o = texture(uT, vUV); }");
  var gbuf = gl.createBuffer(), rbuf = gl.createBuffer(), vao = gl.createVertexArray();
  var G = {gl: gl, ok: true, lost: false, k: 0, mode: 0, jit: [0, 0]};
  cv.addEventListener("webglcontextlost", function(e){ e.preventDefault(); G.lost = true; });
  // render targets
  var W = 0, H = 0, msaa = null, res = null, acc = null, shT = null, shF = null;
  function tex(w, h, f){ var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); var fm = f ? [gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT] : [gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE]; gl.texImage2D(gl.TEXTURE_2D, 0, fm[0], w, h, 0, fm[1], fm[2], null); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); return t; }
  function setup(w, h){
    if(msaa){ gl.deleteFramebuffer(msaa.f); gl.deleteRenderbuffer(msaa.c); gl.deleteRenderbuffer(msaa.d); gl.deleteFramebuffer(res.f); gl.deleteTexture(res.t); gl.deleteFramebuffer(acc.f); gl.deleteTexture(acc.t); }
    var smp = Math.min(4, gl.getParameter(gl.MAX_SAMPLES) || 1);
    msaa = {f: gl.createFramebuffer(), c: gl.createRenderbuffer(), d: gl.createRenderbuffer()};
    gl.bindRenderbuffer(gl.RENDERBUFFER, msaa.c); gl.renderbufferStorageMultisample(gl.RENDERBUFFER, smp, gl.RGBA8, w, h);
    gl.bindRenderbuffer(gl.RENDERBUFFER, msaa.d); gl.renderbufferStorageMultisample(gl.RENDERBUFFER, smp, gl.DEPTH_COMPONENT24, w, h);
    gl.bindFramebuffer(gl.FRAMEBUFFER, msaa.f); gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, msaa.c); gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, msaa.d);
    res = {t: tex(w, h, false), f: gl.createFramebuffer()}; gl.bindFramebuffer(gl.FRAMEBUFFER, res.f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, res.t, 0);
    acc = {t: tex(w, h, hasF), f: gl.createFramebuffer()}; gl.bindFramebuffer(gl.FRAMEBUFFER, acc.f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, acc.t, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); W = w; H = h; G.k = 0;
  }
  if(true){ shT = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, shT); gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, SM, SM, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_FUNC, gl.LEQUAL);
    shF = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, shF); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, shT, 0); gl.drawBuffers([gl.NONE]); gl.readBuffer(gl.NONE); gl.bindFramebuffer(gl.FRAMEBUFFER, null); }
  // frame control
  G.begin = function(w, h, acc_){ if(w !== W || h !== H || cv.width !== w || cv.height !== h){ cv.width = w; cv.height = h; setup(w, h); } if(!acc_) G.k = 0; G.mode = acc_ ? 1 : 0; gl.disable(gl.SCISSOR_TEST); gl.bindFramebuffer(gl.FRAMEBUFFER, acc.f); gl.viewport(0, 0, w, h); if(G.k === 0){ gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); }
    if(G.mode){ var a = Math.random() - .5, b = Math.random() - .5; G.jit = [2 * a / w, 2 * b / h]; } else G.jit = [0, 0]; };
  G.view = function(x, y, w, h){ G.vp = [x, y, w, h]; gl.bindFramebuffer(gl.FRAMEBUFFER, msaa.f); gl.enable(gl.SCISSOR_TEST); gl.scissor(x, y, w, h); gl.viewport(x, y, w, h); gl.clearColor(0, 0, 0, 0); gl.clearDepth(1); gl.depthMask(true); gl.colorMask(true, true, true, true); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); };
  G.end = function(){ var v = G.vp; gl.disable(gl.SCISSOR_TEST); gl.bindFramebuffer(gl.READ_FRAMEBUFFER, msaa.f); gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, res.f); gl.blitFramebuffer(v[0], v[1], v[0] + v[2], v[1] + v[3], v[0], v[1], v[0] + v[2], v[1] + v[3], gl.COLOR_BUFFER_BIT, gl.NEAREST);
    gl.bindFramebuffer(gl.FRAMEBUFFER, acc.f); gl.enable(gl.SCISSOR_TEST); gl.scissor(v[0], v[1], v[2], v[3]); gl.viewport(0, 0, W, H); gl.disable(gl.DEPTH_TEST); gl.enable(gl.BLEND); var wgt = 1 / (G.k + 1); gl.blendColor(0, 0, 0, wgt); gl.blendFuncSeparate(gl.CONSTANT_ALPHA, gl.ONE_MINUS_CONSTANT_ALPHA, gl.CONSTANT_ALPHA, gl.ONE_MINUS_CONSTANT_ALPHA);
    gl.useProgram(cmpP.p); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, res.t); gl.uniform1i(cmpP.u.uT, 0); gl.bindVertexArray(vao); gl.drawArrays(gl.TRIANGLES, 0, 3); gl.disable(gl.BLEND); };
  G.present = function(){ gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.disable(gl.SCISSOR_TEST); gl.disable(gl.BLEND); gl.disable(gl.DEPTH_TEST); gl.viewport(0, 0, W, H); gl.useProgram(cmpP.p); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, acc.t); gl.uniform1i(cmpP.u.uT, 0); gl.bindVertexArray(vao); gl.drawArrays(gl.TRIANGLES, 0, 3); G.k++; };
  // per-part geometry with crease-aware smooth normals
  G.build = function(pt){
    if(pt._g) return pt._g; var P = [], N = [], C = [], AO = [], polys = pt.polys, i, k, key = {};
    var miny = 1e9, maxy = -1e9; polys.forEach(function(q){ q.p.forEach(function(p){ if(p[1] < miny) miny = p[1]; if(p[1] > maxy) maxy = p[1]; }); });
    var dev = maxy - miny, useAO = !pt.ov && !pt._noAO && dev > 1.2;
    function K(p){ return Math.round(p[0] * 400) + "|" + Math.round(p[1] * 400) + "|" + Math.round(p[2] * 400); }
    var fn = polys.map(function(q){ var p = q.p, a = p[0], b = p[1], c = p[2], d = p.length > 3 ? p[3] : null, ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2], nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      if(d){ var wx = d[0] - a[0], wy = d[1] - a[1], wz = d[2] - a[2], mx = vy * wz - vz * wy, my = vz * wx - vx * wz, mz = vx * wy - vy * wx; nx += mx; ny += my; nz += mz; }
      var l = Math.hypot(nx, ny, nz) || 1; return [nx / l, ny / l, nz / l, l]; });
    polys.forEach(function(q, qi){ q.p.forEach(function(p){ var kk = K(p); (key[kk] || (key[kk] = [])).push(qi); }); });
    var CR = pt.ov ? 0.2 : 0.62;
    function vert(q, qi, p){
      var n = fn[qi], list = key[K(p)], sx = 0, sy = 0, sz = 0, cr = 0, cg = 0, cb = 0, cn = 0, j, f2;
      for(j = 0; j < list.length; j++){ f2 = fn[list[j]]; var dt = n[0] * f2[0] + n[1] * f2[1] + n[2] * f2[2]; if(dt > CR){ sx += f2[0] * f2[3]; sy += f2[1] * f2[3]; sz += f2[2] * f2[3]; var cc = polys[list[j]].c; cr += cc[0]; cg += cc[1]; cb += cc[2]; cn++; } }
      var l = Math.hypot(sx, sy, sz) || 1; P.push(p[0], p[1], p[2]); N.push(sx / l, sy / l, sz / l); cn = cn || 1; C.push(cr / cn / 255, cg / cn / 255, cb / cn / 255);
      var ao = 1; if(useAO){ var t = (pt.id === "back" ? maxy - p[1] : p[1] - miny) / (dev * 0.65); t = t < 0 ? 0 : t > 1 ? 1 : t; ao = 0.66 + 0.34 * t * t * (3 - 2 * t); } AO.push(ao);
    }
    polys.forEach(function(q, qi){ var p = q.p; for(k = 1; k < p.length - 1; k++){ vert(q, qi, p[0]); vert(q, qi, p[k]); vert(q, qi, p[k + 1]); } });
    var n = P.length / 3, buf = new Float32Array(n * 10);
    for(i = 0; i < n; i++){ buf[i * 10] = P[i * 3]; buf[i * 10 + 1] = P[i * 3 + 1]; buf[i * 10 + 2] = P[i * 3 + 2]; buf[i * 10 + 3] = N[i * 3]; buf[i * 10 + 4] = N[i * 3 + 1]; buf[i * 10 + 5] = N[i * 3 + 2]; buf[i * 10 + 6] = C[i * 3]; buf[i * 10 + 7] = C[i * 3 + 1]; buf[i * 10 + 8] = C[i * 3 + 2]; buf[i * 10 + 9] = AO[i]; }
    var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, buf, gl.STATIC_DRAW);
    pt._g = {buf: b, n: n, miny: miny, maxy: maxy}; return pt._g;
  };
  G.free = function(m){ if(!m) return; m.parts.forEach(function(p){ if(p._g){ try{ gl.deleteBuffer(p._g.buf); }catch(e){} p._g = null; } }); };
  function setCam(u, cam){ gl.uniformMatrix3fv(u.uR, false, cam.R); gl.uniform3fv(u.uT, cam.T); gl.uniform4fv(u.uPr, cam.Pr); gl.uniform2fv(u.uZ, cam.Z); gl.uniform2fv(u.uJ, G.jit); }
  var KEY = [-0.45, 0.85, -0.40], kl = Math.hypot(KEY[0], KEY[1], KEY[2]); KEY = KEY.map(function(v){ return v / kl; });
  function pickLight(){
    if(G.mode < 0.5) return {L: KEY, t: 0, c: [1.05, 1.0, 0.94]};
    var pK = 0.55;
    if(Math.random() < pK){ var j = [KEY[0] + (Math.random() - .5) * 0.5, KEY[1] + (Math.random() - .5) * 0.35, KEY[2] + (Math.random() - .5) * 0.5], l = Math.hypot(j[0], j[1], j[2]); return {L: [j[0] / l, j[1] / l, j[2] / l], t: 0, c: [1.05 / pK, 1.0 / pK, 0.94 / pK]}; }
    var u = Math.random(), v = Math.random(), y = 0.24 + u * 0.76, r = Math.sqrt(1 - y * y), ph = v * 6.2831853, d = [r * Math.cos(ph), y, r * Math.sin(ph)];
    var s = [0.20 + 0.42 * (y * .5 + .5), 0.19 + 0.47 * (y * .5 + .5), 0.17 + 0.55 * (y * .5 + .5)]; var f = 2 * 0.94 / (1 - pK);
    return {L: d, t: 1, c: [s[0] * f, s[1] * f, s[2] * f]};
  }
  G.scene = function(cam, parts, ground){
    var lg = pickLight(), i; if(G.flip) lg = {L: [lg.L[0], -lg.L[1], lg.L[2]], t: lg.t, c: lg.c};
    // shadow map from this light
    var rs = ground.rs, ce = ground.rc, D = rs * 2.2, ey = [ce[0] + lg.L[0] * D, ce[1] + lg.L[1] * D, ce[2] + lg.L[2] * D], up = Math.abs(lg.L[1]) > 0.97 ? [1, 0, 0] : [0, 1, 0];
    var LV = m4mul(m4ortho(rs, 0.1, D * 2.2), m4look(ey, ce, up)), tex_ = 2 * rs / SM;
    gl.bindFramebuffer(gl.FRAMEBUFFER, shF); gl.disable(gl.SCISSOR_TEST); gl.viewport(0, 0, SM, SM); gl.enable(gl.DEPTH_TEST); gl.depthMask(true); gl.clearDepth(1); gl.clear(gl.DEPTH_BUFFER_BIT); gl.colorMask(false, false, false, false); gl.disable(gl.BLEND);
    gl.useProgram(depthP.p); gl.uniformMatrix4fv(depthP.u.uLV, false, LV); var al = gl.getAttribLocation(depthP.p, "aP"); gl.enableVertexAttribArray(al);
    gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(2, 4);
    parts.forEach(function(it){ if(it.a < 0.999 || it.pt.ov) return; var g = G.build(it.pt); gl.bindBuffer(gl.ARRAY_BUFFER, g.buf); gl.vertexAttribPointer(al, 3, gl.FLOAT, false, 40, 0); gl.uniform3f(depthP.u.uOff, it.off[0], it.off[1], it.off[2]); gl.drawArrays(gl.TRIANGLES, 0, g.n); });
    gl.disable(gl.POLYGON_OFFSET_FILL); gl.disableVertexAttribArray(al); gl.colorMask(true, true, true, true);
    // main target
    var vp = G.vp; gl.bindFramebuffer(gl.FRAMEBUFFER, msaa.f); gl.enable(gl.SCISSOR_TEST); gl.scissor(vp[0], vp[1], vp[2], vp[3]); gl.viewport(vp[0], vp[1], vp[2], vp[3]);
    gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.enable(gl.BLEND); gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.disable(gl.CULL_FACE);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, shT);
    function shU(u){ gl.uniform1i(u.uSh, 1); gl.uniformMatrix4fv(u.uLV, false, LV); gl.uniform3fv(u.uL, lg.L); gl.uniform1f(u.uTex, tex_); gl.uniform1f(u.uOn, G.noSh ? 0 : 1); }
    // ground (shadow catcher)
    gl.useProgram(grdP.p); setCam(grdP.u, cam); shU(grdP.u); gl.uniform4fv(grdP.u.uBox, ground.box); gl.uniform1f(grdP.u.uSoft, ground.soft); gl.uniform1f(grdP.u.uStr, ground.str); gl.uniform1f(grdP.u.uDark, lg.t < 0.5 ? (G.mode ? 0.62 : 0.48) : 0.30);
    var ext = ground.ext, gy = ground.y, cx = ground.box[0], cz = ground.box[1], quad = new Float32Array([cx - ext, gy, cz - ext, cx + ext, gy, cz - ext, cx + ext, gy, cz + ext, cx - ext, gy, cz - ext, cx + ext, gy, cz + ext, cx - ext, gy, cz + ext]);
    gl.uniform3fv(grdP.u.uTg, cam.tgt);
    gl.bindBuffer(gl.ARRAY_BUFFER, gbuf); gl.bufferData(gl.ARRAY_BUFFER, quad, gl.DYNAMIC_DRAW); var la = gl.getAttribLocation(grdP.p, "aP"); gl.enableVertexAttribArray(la); gl.vertexAttribPointer(la, 3, gl.FLOAT, false, 0, 0); gl.depthMask(false); gl.drawArrays(gl.TRIANGLES, 0, 6); gl.disableVertexAttribArray(la);
    // fabric
    gl.useProgram(meshP.p); setCam(meshP.u, cam); shU(meshP.u); gl.uniform1f(meshP.u.uMode, G.mode); gl.uniform1f(meshP.u.uLt, lg.t); gl.uniform3fv(meshP.u.uLc, lg.c);
    var A = {aP: [3, 0], aN: [3, 12], aC: [3, 24], aAO: [1, 36]}, names = Object.keys(A), locs = {};
    names.forEach(function(nm){ locs[nm] = gl.getAttribLocation(meshP.p, nm); gl.enableVertexAttribArray(locs[nm]); });
    function draw(it){
      var g = G.build(it.pt); gl.bindBuffer(gl.ARRAY_BUFFER, g.buf); names.forEach(function(nm){ gl.vertexAttribPointer(locs[nm], A[nm][0], gl.FLOAT, false, 40, A[nm][1]); });
      gl.uniform3f(meshP.u.uOff, it.off[0], it.off[1], it.off[2]); gl.uniform1f(meshP.u.uA, it.a); gl.uniform1f(meshP.u.uFab, it.pt.ov ? 0.35 : 1); gl.uniform3f(meshP.u.uTint, it.tint || 1, it.tint || 1, it.tint || 1);
      if(it.pt.ov){ gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(-2, -2); } else gl.disable(gl.POLYGON_OFFSET_FILL);
      gl.drawArrays(gl.TRIANGLES, 0, g.n);
    }
    gl.depthMask(true); parts.filter(function(it){ return it.a >= 0.999 && !it.pt.ov; }).forEach(draw);
    gl.depthMask(true); parts.filter(function(it){ return it.a >= 0.999 && it.pt.ov; }).forEach(draw);
    gl.depthMask(false); parts.filter(function(it){ return it.a < 0.999; }).sort(function(a, b){ return b.z - a.z; }).forEach(draw);
    gl.disable(gl.POLYGON_OFFSET_FILL); names.forEach(function(nm){ gl.disableVertexAttribArray(locs[nm]); });
  };
  // seam / stitch ribbons: items [{a,b: ndc xy + depth, w px, col [r,g,b,a]}]
  G.ribbons = function(rs, vw, vh){
    if(!rs.length) return; var f = new Float32Array(rs.length * 6 * 8), o = 0;
    rs.forEach(function(r){
      var dx = (r.b[0] - r.a[0]) * vw / 2, dy = (r.b[1] - r.a[1]) * vh / 2, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, hw = r.w / 2, ox = nx * hw * 2 / vw, oy = ny * hw * 2 / vh, ex = dx / l * hw * 0.7 * 2 / vw, ey = dy / l * hw * 0.7 * 2 / vh;
      var A0 = [r.a[0] - ex + ox, r.a[1] - ey + oy, r.a[2], 1], A1 = [r.a[0] - ex - ox, r.a[1] - ey - oy, r.a[2], -1], B0 = [r.b[0] + ex + ox, r.b[1] + ey + oy, r.b[2], 1], B1 = [r.b[0] + ex - ox, r.b[1] + ey - oy, r.b[2], -1], c = r.col;
      [A0, A1, B0, A1, B1, B0].forEach(function(v){ f[o++] = v[0]; f[o++] = v[1]; f[o++] = v[2]; f[o++] = v[3]; f[o++] = c[0]; f[o++] = c[1]; f[o++] = c[2]; f[o++] = c[3]; });
    });
    gl.useProgram(rbP.p); gl.bindBuffer(gl.ARRAY_BUFFER, rbuf); gl.bufferData(gl.ARRAY_BUFFER, f.subarray(0, o), gl.DYNAMIC_DRAW);
    var la = gl.getAttribLocation(rbP.p, "aXY"), lz = gl.getAttribLocation(rbP.p, "aZ"), lc = gl.getAttribLocation(rbP.p, "aCol"), le = gl.getAttribLocation(rbP.p, "aE");
    [la, lz, lc, le].forEach(function(x){ gl.enableVertexAttribArray(x); });
    gl.vertexAttribPointer(la, 2, gl.FLOAT, false, 32, 0); gl.vertexAttribPointer(lz, 1, gl.FLOAT, false, 32, 8); gl.vertexAttribPointer(le, 1, gl.FLOAT, false, 32, 12); gl.vertexAttribPointer(lc, 4, gl.FLOAT, false, 32, 16);
    gl.enable(gl.DEPTH_TEST); gl.depthMask(false); gl.enable(gl.BLEND); gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.drawArrays(gl.TRIANGLES, 0, o / 8); [la, lz, lc, le].forEach(function(x){ gl.disableVertexAttribArray(x); });
  };
  return G;
}

function Studio(el, opts){
  var rows = (opts && opts.rows) || [];
  var S = {z: 1, pxo: 0, pyo: 0, empty: true, type: "duvet", sp: Object.assign({}, DEFAULTS.duvet, {type: "duvet", color: "#e8e4d8", fabric: "plain"}), model: null, step: -1, explode: 0, exT: 0, yaw: -.7, pitch: .9, dist: 300, dims: 1, stitch: 1, play: 0, dirty: 1, tgt: [0, 0, 0], vis: null, hi: {}, pulse: 0};
  var st = document.createElement("style"); st.textContent = CSS; el.appendChild(st);
  var root = document.createElement("div"); root.className = "stu"; el.appendChild(root);
  root.innerHTML = '<div class="stu-top">' + (opts && opts.noTitle ? '' : '<b>YQI <em>Intelligence</em> · 3D Studio</b>') + '<span id="stuTypes"></span></div>' +
    '<div class="stu-main"><div class="stu-view" id="stuView"><canvas id="stuGl"></canvas><canvas id="stuCv"></canvas><div class="stu-hud"><button id="b2d" class="on">2D plan</button><button id="bDet" style="display:none">Foot close-up</button><button id="bZi" style="display:none">＋ Zoom</button><button id="bZo" style="display:none">－</button><button id="bDim" class="on">Sizes</button><button id="bStitch" class="on">Stitching</button><button id="bExp">Exploded</button><button id="bDual">Inside + Outside</button><button id="bRev">Reverse side</button><button id="bPlay">▶ Play operations</button><button id="bRes">Reset view</button></div><div class="stu-cap" id="stuCap"></div></div>' +
    '<div class="stu-side" id="stuSide"></div></div>';
  var $ = function(id){ return root.querySelector("#" + id); };
  var cv = $("stuCv"), ctx = cv.getContext("2d"), view = $("stuView"), glc = $("stuGl"), G = null;
  try{ if(HQ) G = GLR(glc); }catch(e){ G = null; if(window.console) console.warn("YQI 3D: WebGL off, using canvas", e); }
  if(!G) glc.style.display = "none";
  window.__glr = G;
  function useGL(){ if(G && G.lost){ G = null; glc.style.display = "none"; } return !!G; }
  var DPR = Math.min(window.devicePixelRatio || 1, 2), CW = 600, CH = 400;

  function resize(){ var r = view.getBoundingClientRect(); CW = Math.max(200, r.width); CH = Math.max(200, r.height); cv.width = CW * DPR; cv.height = CH * DPR; S.dirty = 1; if(S.model) animate(); }
  if(window.ResizeObserver) new ResizeObserver(resize).observe(view); window.addEventListener("resize", resize);

  function rebuild(keepStep){
    if(G && S.model) G.free(S.model);
    var sp = Object.assign({}, S.sp); S.model = mkModel(S.type, sp);
    if(!keepStep) S.step = -1;
    S.dist = S.model.R * 2.7; S.tgt = [0, S.model.ty || 0, 0]; S.dirty = 1; drawSide(); setStep(S.step, true); animate();
  }
  function setStep(i, quiet){
    S.step = i; var m = S.model, st = i >= 0 ? m.steps[i] : null;
    S.vis = st ? st.show : null; S.hi = {}; if(st) st.hi.forEach(function(k){ S.hi[k] = 1; });
    S.exT = st ? st.ex : (S.explodeUser ? 1 : 0);
    if(st && st.back != null && (st.back ? S.pitch > 0 : S.pitch < 0)){ S.pitch = st.back ? -.9 : .9; var rb = $("bRev"); if(rb) rb.classList.toggle("on", !!st.back); }
    if(m && m.R){ S.goal = st && st.fp ? {t: st.fp, d: m.R * 1.25} : {t: [0, m.ty || 0, 0], d: S.model.R * 2.7}; }
    S.focus = st && st.feats ? st.feats : [];
    var cap = $("stuCap");
    if(st) cap.innerHTML = "<b>Step " + (i + 1) + "/" + m.steps.length + " · " + esc(st.n) + "</b>" + esc(st.d) + "<br><small>Machine: " + esc(st.m) + "</small>";
    else cap.innerHTML = "<b>" + esc(typeName()) + "</b><small>Drag to rotate · pinch/scroll to zoom · tap a number or an operation to see its details</small>";
    setDual(!!st);
    root.querySelectorAll(".stu-step").forEach(function(e, k){ e.classList.toggle("on", k === i); var x = e.querySelector(".stu-exp"); if(x) x.innerHTML = ""; });
    S.dirty = 1; if(!quiet) animate();
  }
  function setDual(v){ S.dual = !!v; var b = $("bDual"); if(b) b.classList.toggle("on", S.dual); S.dirty = 1; }
  $("bDual").onclick = function(){ setDual(!S.dual); animate(); };
  function featIds(k){ return S.model.seams.filter(function(q){ return q.group === "fx" + k; }).map(function(q){ return q.id; }); }
  function selectFeature(k){
    var m = S.model, fi = m.fxInfo && m.fxInfo[k]; if(!fi) return;
    if(S.step < 0 && S.focus && S.focus.length === 1 && S.focus[0] === k){ S.z = 1; S.pxo = S.pyo = 0; setStep(-1); root.querySelectorAll(".stu-fx").forEach(function(e){ e.classList.remove("on"); }); return; }
    S.step = -1; S.vis = null; S.hi = {}; featIds(k).forEach(function(id){ S.hi[id] = 1; }); S.focus = [k]; S.exT = S.explodeUser ? 1 : 0;
    var pt_ = String(fi.f.panel || "") + " " + String(fi.f.placement || ""), back = /rev|back|inside|under/i.test(pt_), both = /both/i.test(pt_);
    if(back ? S.pitch > 0 : S.pitch < 0){ S.pitch = back ? -.95 : .95; var rb = $("bRev"); if(rb) rb.classList.toggle("on", back); }
    if(fi.at) S.goal = {t: [fi.at[0], m.sy(fi.at[0], fi.at[1], "front"), fi.at[1]], d: m.R * 1.15};
    if(S.v2d && S.p2 && S.p2[k]){ S.z = 2.6; S.pxo = -(S.p2[k][0] - CW / 2) * S.z; S.pyo = -(S.p2[k][1] - CH / 2) * S.z; }
    var f = fi.f, rowsT = [];
    if(fi.info) rowsT.push(["Position", fi.info]);
    if(f.lengthCm || f.sizeCm) rowsT.push(["Size", cmTxt(f.lengthCm || f.sizeCm) + (f.widthCm ? " × " + cmTxt(f.widthCm) : "")]); else if(f.widthCm) rowsT.push(["Width", cmTxt(f.widthCm)]);
    if(f.startCm != null && !isNaN(+f.startCm)) rowsT.push(["Starts", cmTxt(f.startCm) + " from the left corner"]);
    if(f.offsetCm != null && !isNaN(+f.offsetCm)) rowsT.push(["In from edge", cmTxt(f.offsetCm) + " from the " + fi.edge + " edge"]);
    if(fi.n > 1) rowsT.push(["Quantity", String(fi.n)]);
    if(f.specText) rowsT.push(["Spec says", "“" + String(f.specText).slice(0, 220) + "”"]);
    $("stuCap").classList.remove("min");
    $("stuCap").innerHTML = "<b>Point " + (k + 1) + " · " + esc(f.name || fi.kind) + "</b><div style=\"margin:3px 0\"><span style=\"background:" + (back ? "#2F5A1A" : "#B4531A") + ";color:#fff;font-weight:800;font-size:11px;padding:2px 8px;border-radius:6px\">" + (both ? "FRONT + REVERSE (both sides)" : back ? "REVERSE / BACK view (inside)" : "FRONT view (outside)") + "</span></div>" + rowsT.map(function(r){ return "<div><span style=\"font-weight:800;color:#5b6b50\">" + r[0] + ":</span> " + esc(r[1]) + "</div>"; }).join("") + "<div style=\"margin-top:3px\">" + esc(kindGuide(fi, S.sp).where) + "</div><small>Tap this point again to go back to the full view.</small>";
    setDual(false);
    root.querySelectorAll(".stu-step").forEach(function(e){ e.classList.remove("on"); var x = e.querySelector(".stu-exp"); if(x) x.innerHTML = ""; });
    root.querySelectorAll(".stu-fx").forEach(function(e){ e.classList.toggle("on", +e.dataset.fx === k); });
    S.dirty = 1; animate();
  }
  function previewStep(i){ var m = S.model, st = i >= 0 ? m.steps[i] : null; S.hi = {}; if(st) st.hi.forEach(function(k){ S.hi[k] = 1; }); S.focus = st && st.feats ? st.feats : []; S.dirty = 1; animate(); }
  function restoreHi(){ var m = S.model, st = S.step >= 0 ? m.steps[S.step] : null; S.hi = {}; if(st) st.hi.forEach(function(k){ S.hi[k] = 1; }); S.focus = st && st.feats ? st.feats : []; S.dirty = 1; animate(); }
  $("stuCap").onclick = function(e){ if(e.target.closest(".stu-ex")) return; if(e.target.tagName === "B" || e.target === this) this.classList.toggle("min"); };
  function typeName(){ return (TYPES.filter(function(t){ return t[0] === S.type; })[0] || [0, ""])[1] + (S.sp.colorName ? " · " + S.sp.colorName : ""); }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }

  // ---- projection + draw ----
  function cam(p, ex){
    var x = p[0] - S.tgt[0] + ex[0], y = p[1] - S.tgt[1] + ex[1], z = p[2] - S.tgt[2] + ex[2];
    var cy = Math.cos(S.yaw), sy = Math.sin(S.yaw), x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
    var cp = Math.cos(S.pitch), sp = Math.sin(S.pitch), y2 = y * cp + z1 * sp, z2 = -y * sp + z1 * cp;
    return [x1, y2, z2 + S.dist * (S.dual ? 1.3 : 1)];
  }
  var FOC = function(){ return Math.min(CW, CH * 1.15) * 1.25; };
  function sx(c){ return CW / 2 + FOC() * c[0] / c[2]; } function sy_(c){ return CH * .46 - FOC() * c[1] / c[2]; }
  var OX = 0, OY = 0;
  var ACCN = 72;
  function draw(){ S.accSeq = (S.accSeq || 0) + 1; render(false); accKick(S.accSeq); }
  function accKick(seq){ if(!G || !S.gl) return; requestAnimationFrame(function(){ if(seq !== S.accSeq || !G || G.lost || G.k >= ACCN) return; render(true); accKick(seq); }); }
  function fabTxt(pn){ var sp = S.sp || {}, f = pn === "back" ? (sp.pcSeparate === "1" && sp.fabric2 ? sp.fabric2 : sp.fabric) : sp.fabric; return String(f || "plain"); }
  function badge(){
    var back = S.pitch < 0, tt = back ? "REVERSE side · back panel · " + fabTxt("back") : "FRONT side · outside · " + fabTxt("front");
    ctx.save(); ctx.font = "800 12px Manrope,system-ui,sans-serif"; var tw = ctx.measureText(tt).width + 16, by = CW < 760 ? 112 : 46; ctx.fillStyle = back ? "#2F5A1A" : "#B4531A"; ctx.fillRect(8, by, tw, 22); ctx.fillStyle = "#fff"; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText(tt, 16, by + 11.5); ctx.restore();
  }
  function render(acc){
    var m = S.model; if(!m) return; S.acc = acc; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, CW, CH);
    if(S.empty){ glc.style.display = "none"; ctx.fillStyle = "#f6f7f3"; ctx.fillRect(0, 0, CW, CH); ctx.fillStyle = "#2F5A1A"; ctx.textAlign = "center"; ctx.font = "800 17px Manrope,system-ui,sans-serif"; ctx.fillText("No article yet", CW / 2, CH / 2 - 16); ctx.fillStyle = "#6b7a60"; ctx.font = "600 13px Manrope,system-ui,sans-serif"; ctx.fillText("Upload a customer spec (photo / PDF / Excel / text)", CW / 2, CH / 2 + 8); ctx.fillText("or start a blank article — only your data will show here.", CW / 2, CH / 2 + 28); return; }
    if(S.v2d){ S.gl = false; glc.style.display = "none"; ctx.globalAlpha = 1; ctx.fillStyle = "#f6f7f3"; ctx.fillRect(0, 0, CW, CH); ctx.save(); ctx.translate(CW / 2 + S.pxo, CH / 2 + S.pyo); ctx.scale(S.z, S.z); ctx.translate(-CW / 2, -CH / 2); try{ draw2d(); }catch(e){ if(window.console) console.warn("YQI 2D", e); } ctx.restore(); return; }
    if(G) glc.style.display = "";
    S.gl = useGL(); S.fullW = CW; S.fullH = CH; if(S.gl){ G.flip = !S.dual && S.pitch < 0; } if(S.gl) G.begin(Math.round(CW * DPR), Math.round(CH * DPR), acc);
    if(!S.dual){ S.mode = null; OX = OY = 0; S.hits = []; drawOne(); badge(); if(S.gl && G) G.present(); S.glk = G ? G.k : -1; return; }
    var CW0 = CW, CH0 = CH, vert = CW0 < 760, p0 = S.pitch; S.hits = [];
    [false, true].forEach(function(inside, hv){
      CW = vert ? CW0 : CW0 / 2; CH = vert ? CH0 / 2 : CH0; OX = vert ? 0 : hv * CW; OY = vert ? hv * CH : 0;
      ctx.save(); ctx.translate(OX, OY); ctx.beginPath(); ctx.rect(0, 0, CW, CH); ctx.clip(); S.mode = inside; S.pitch = Math.max(.4, Math.abs(p0));
      var keepHits = S.hits; S.hits = []; drawOne(); S.hits.forEach(function(h){ h.x += OX; h.y += OY; h.px += OX; h.py += OY; keepHits.push(h); }); S.hits = keepHits;
      ctx.font = "800 12px Manrope,system-ui,sans-serif"; var tt = inside ? "INSIDE (cut open)" : "OUTSIDE", tw = ctx.measureText(tt).width + 16; ctx.fillStyle = inside ? "#2F5A1A" : "#B4531A"; var cx0 = vert ? CW - tw - 8 : 8, cy0 = vert ? 8 : 44; ctx.fillRect(cx0, cy0, tw, 22); ctx.fillStyle = "#fff"; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText(tt, cx0 + 8, cy0 + 11.5);
      ctx.restore();
    });
    CW = CW0; CH = CH0; S.pitch = p0; S.mode = null; OX = OY = 0;
    ctx.strokeStyle = "#9db08c"; ctx.lineWidth = 1; ctx.beginPath(); if(vert){ ctx.moveTo(0, CH0 / 2); ctx.lineTo(CW0, CH0 / 2); } else { ctx.moveTo(CW0 / 2, 0); ctx.lineTo(CW0 / 2, CH0); } ctx.stroke();
    if(S.gl && G) G.present();
    S.glk = G ? G.k : -1;
  }

  function draw2d(){
    var m = S.model, W0 = CW, H0 = CH, vert = W0 < 760, i;
    var bb = {x0: 1e9, x1: -1e9, z0: 1e9, z1: -1e9}; m.parts.forEach(function(p){ if(p.ov) return; p.polys.forEach(function(q){ q.p.forEach(function(v){ if(v[0] < bb.x0) bb.x0 = v[0]; if(v[0] > bb.x1) bb.x1 = v[0]; if(v[2] < bb.z0) bb.z0 = v[2]; if(v[2] > bb.z1) bb.z1 = v[2]; }); }); });
    var Lc = bb.x1 - bb.x0, Wc = bb.z1 - bb.z0; if(!(Lc > 0) || !(Wc > 0)) return;
    var base = (m.parts[0] && m.parts[0].polys[0] && m.parts[0].polys[0].c) || [235, 232, 222];
    S.hits = []; S.p2 = {}; ctx.fillStyle = "#f6f7f3"; ctx.fillRect(0, 0, W0, H0); if(S.det){ detView(); return; }
    function col(c, a){ if(typeof c === "string") return c; return "rgba(" + Math.round(c[0]) + "," + Math.round(c[1]) + "," + Math.round(c[2]) + "," + (a == null ? 1 : a) + ")"; }
    var foc = S.focus && S.focus.length ? S.focus : null;
    function dim(fi){ return foc && foc.indexOf(fi) < 0; }
    function detView(){
      var horiz = W0 >= 760, D = horiz ? Math.min(32, Lc * .25) : Math.min(26, Lc * .2), isB = function(q){ return /back|inside|rev/.test(String(q.pn || "")); };
      var pn = S.detPn || ((m.marks || []).some(function(q){ return isB(q) && q.p[0] > bb.x1 - D; }) ? "back" : "front");
      var top = horiz ? 74 : 112, mg = horiz ? 46 : 52, s, dpx, ph2, X0, Y0, aw;
      if(horiz){ s = (W0 - 2 * mg) / Wc; dpx = D * s; if(dpx > H0 * .4){ s = H0 * .4 / D; dpx = D * s; } ph2 = Wc * s; X0 = mg + ((W0 - 2 * mg) - ph2) / 2; Y0 = top + 26; }
      else { aw = H0 - top - 14; s = Math.min(aw / Wc, (W0 * .3) / D); dpx = D * s; ph2 = Wc * s; X0 = mg; Y0 = top + 8 + (aw - ph2) / 2; }
      var W1 = horiz ? ph2 : dpx, H1 = horiz ? dpx : ph2;
      function P(v){ var al = (v[2] - bb.z0) * s, ac = (bb.x1 - v[0]) * s; return horiz ? [X0 + al, Y0 + dpx - ac] : [X0 + ac, Y0 + al]; }
      var tt = "FOOT OPENING · close-up · " + (pn === "back" ? "REVERSE / back panel (inside view)" : "FRONT panel") + " · " + fabTxt(pn);
      ctx.font = "800 12px Manrope,system-ui,sans-serif"; ctx.textAlign = "left"; var tw = ctx.measureText(tt).width + 16; ctx.fillStyle = pn === "back" ? "#2F5A1A" : "#B4531A"; ctx.fillRect(8, horiz ? 44 : 80, tw, 22); ctx.fillStyle = "#fff"; ctx.fillText(tt, 16, horiz ? 59 : 95);
      ctx.save(); ctx.beginPath(); ctx.rect(X0, Y0, W1, H1); ctx.clip();
      var bc = pn === "back" && m.parts[1] && m.parts[1].polys[0] ? m.parts[1].polys[0].c : base, g = ctx.createLinearGradient(X0, Y0, X0 + W1, Y0 + H1);
      g.addColorStop(0, col(bc.map(function(v){ return Math.min(255, v + 12); }))); g.addColorStop(1, col(bc.map(function(v){ return Math.max(0, v - 12); }))); ctx.fillStyle = g; ctx.fillRect(X0, Y0, W1, H1);
      m.parts.forEach(function(p){
        if(!p.ov) return; var mm = /^ov(\d+)(front|back)$/.exec(p.id); if(!mm || mm[2] !== pn) return;
        ctx.globalAlpha = dim(+mm[1]) ? .22 : Math.min(1, (p.alpha || .55) + .25);
        p.polys.forEach(function(q){ ctx.fillStyle = col(q.c); ctx.beginPath(); q.p.forEach(function(v, k){ var a = P(v); k ? ctx.lineTo(a[0], a[1]) : ctx.moveTo(a[0], a[1]); }); ctx.closePath(); ctx.fill(); }); ctx.globalAlpha = 1;
      });
      m.seams.forEach(function(sm){
        if(sm.exPart && sm.exPart.id !== pn) return; if(!sm.exPart && /^fx/.test(sm.group || "")) return; var fk = /^fx(\d+)$/.exec(sm.group || "");
        ctx.globalAlpha = fk && dim(+fk[1]) ? .22 : 1; ctx.strokeStyle = col(sm.col || [90, 90, 90]); ctx.lineWidth = Math.max(1.4, Math.min(3.4, (sm.w || 2))); ctx.setLineDash(sm.dash ? [6, 4] : []); ctx.beginPath();
        (sm.pts || []).forEach(function(v, k){ var a = P(v); k ? ctx.lineTo(a[0], a[1]) : ctx.moveTo(a[0], a[1]); }); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
      });
      ctx.restore(); ctx.strokeStyle = "#555"; ctx.lineWidth = 1.6; ctx.strokeRect(X0, Y0, W1, H1);
      // rulers
      ctx.fillStyle = "#555"; ctx.strokeStyle = "#888"; ctx.lineWidth = 1; ctx.font = "700 9.5px Manrope,system-ui,sans-serif";
      for(var dcm = 0; dcm <= D; dcm += 5){ var pp = horiz ? [X0 - 3, Y0 + dpx - dcm * s] : [X0 + dcm * s, Y0 - 3], q2 = horiz ? [X0 - (dcm % 10 === 0 ? 10 : 6), pp[1]] : [pp[0], Y0 - (dcm % 10 === 0 ? 10 : 6)]; ctx.beginPath(); ctx.moveTo(pp[0], pp[1]); ctx.lineTo(q2[0], q2[1]); ctx.stroke(); if(dcm % 10 === 0 && dcm){ if(horiz){ ctx.textAlign = "right"; ctx.fillText(dcm + "", X0 - 12, pp[1] + 3); } else { ctx.textAlign = "center"; ctx.fillText(dcm + "", pp[0], Y0 - 13); } } }
      ctx.fillStyle = "#B4531A"; ctx.font = "800 10px Manrope,system-ui,sans-serif";
      if(horiz){ ctx.textAlign = "left"; ctx.fillText("▼ FOOT EDGE (opening side)   ·   numbers on the left = cm from the foot edge", X0, Y0 + dpx + 13); ctx.fillStyle = "#fff"; ctx.font = "800 9.5px Manrope,system-ui,sans-serif"; ctx.fillText("LEFT CORNER", X0 + 6, Y0 + 12); ctx.textAlign = "right"; ctx.fillText("RIGHT CORNER", X0 + W1 - 6, Y0 + 12); }
      else { ctx.save(); ctx.translate(X0 - 8, Y0 + ph2 / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.fillText("◀ FOOT EDGE (opening side)", 0, 0); ctx.restore(); ctx.fillStyle = "#fff"; ctx.font = "800 9px Manrope,system-ui,sans-serif"; ctx.textAlign = "left"; ctx.fillText("LEFT", X0 + 14, Y0 + 12); ctx.fillText("RIGHT", X0 + 14, Y0 + ph2 - 5); }
      // callouts
      var items = [];
      (m.marks || []).forEach(function(q){ var ok = q.pn === "both" || (isB(q) ? "back" : "front") === pn; if(!ok || q.p[0] < bb.x1 - D - .5) return; if(/^(START|END) ·/.test(String(q.t))) return; var a = P(q.p); if(a[0] < X0 - 2 || a[0] > X0 + W1 + 2 || a[1] < Y0 - 2 || a[1] > Y0 + H1 + 2) return; items.push({q: q, a: a}); });
      items.sort(function(u, v){ return horiz ? u.a[0] - v.a[0] : u.a[1] - v.a[1]; });
      var calls = items.filter(function(it){ return String(it.q.t).length > 2; }), nums = items.filter(function(it){ var fx = m.fxInfo && m.fxInfo[it.q.fi]; return String(it.q.t).length <= 2 && fx && fx.kind === "button"; });
      var bwid = horiz ? 0 : Math.min(W0 - (X0 + dpx + 30) - 8, 330), ncol = horiz ? Math.max(1, Math.min(4, Math.floor((W0 - 2 * mg) / 240))) : 1, hbw = horiz ? (W0 - 2 * mg - (ncol - 1) * 8) / ncol : bwid;
      ctx.font = (horiz ? "700 10.5px" : "700 10px") + " Manrope,system-ui,sans-serif";
      calls.forEach(function(it){
        var q = it.q, tx = String(q.t), cmL = q.p[2] - bb.z0, cut = tx.lastIndexOf(" · "); if(cut > 0 && /cm/.test(tx.slice(cut))) tx = tx.slice(cut + 3) + " — " + tx.slice(0, cut); if(!/from corner|from left/.test(tx)) tx += " · " + cmTxt(cmL) + " from left corner";
        var lines = [], cur = ""; tx.split(" ").forEach(function(wd){ if(ctx.measureText(cur + " " + wd).width > hbw - 12 && cur){ lines.push(cur); cur = wd; } else cur = cur ? cur + " " + wd : wd; }); lines.push(cur); if(!horiz && lines.length > 2){ lines = lines.slice(0, 2); lines[1] = lines[1].replace(/.{0,2}$/, "…"); }
        it.lines = lines; it.bh = 8 + lines.length * 12;
      });
      if(horiz){
        var yb = Y0 + dpx + 28, rowY = yb, k0 = 0;
        for(var r0 = 0; k0 < calls.length; r0++){ var rowh = 0, kk; for(kk = 0; kk < ncol && k0 + kk < calls.length; kk++) rowh = Math.max(rowh, calls[k0 + kk].bh); for(kk = 0; kk < ncol && k0 + kk < calls.length; kk++){ var itx = calls[k0 + kk]; itx.bx = mg + kk * (hbw + 8); itx.by = rowY; itx.bw = hbw; } rowY += rowh + 10; k0 += ncol; }
      } else {
        var prev = top - 4; calls.forEach(function(it){ it.by = Math.max(prev + 5, it.a[1] - it.bh / 2); prev = it.by + it.bh; it.bx = X0 + dpx + 30; it.bw = bwid; });
        var nxt = H0 - 8; for(var ci = calls.length - 1; ci >= 0; ci--){ calls[ci].by = Math.min(calls[ci].by, nxt - calls[ci].bh); nxt = calls[ci].by - 5; }
      }
      calls.forEach(function(it){
        var q = it.q; ctx.globalAlpha = dim(q.fi) ? .3 : 1; ctx.strokeStyle = q.col || "#B4531A"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(it.a[0], it.a[1]); if(horiz) ctx.lineTo(it.bx + it.bw / 2, it.by - 2); else ctx.lineTo(it.bx, it.by + it.bh / 2 - 2); ctx.stroke();
        ctx.fillStyle = q.col || "#B4531A"; ctx.beginPath(); ctx.arc(it.a[0], it.a[1], 3.6, 0, 6.283); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.fillRect(it.bx, it.by - 2, it.bw, it.bh); ctx.strokeStyle = q.col || "#B4531A"; ctx.strokeRect(it.bx, it.by - 2, it.bw, it.bh); ctx.fillStyle = "#3a2a18"; ctx.textAlign = "left"; ctx.font = (horiz ? "700 10.5px" : "700 10px") + " Manrope,system-ui,sans-serif";
        it.lines.forEach(function(ln, k){ ctx.fillText(ln, it.bx + 6, it.by + 10 + k * 12); }); S.hits.push({x: it.bx, y: it.by - 2, w: it.bw, h: it.bh, fi: q.fi, px: it.a[0], py: it.a[1]}); ctx.globalAlpha = 1;
      });
      nums.forEach(function(it){ var q = it.q; ctx.globalAlpha = dim(q.fi) ? .3 : 1; ctx.fillStyle = "#fff"; ctx.strokeStyle = q.col || "#B4531A"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(it.a[0], it.a[1], 8, 0, 6.283); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#3a2a18"; ctx.font = "800 10px Manrope,system-ui,sans-serif"; ctx.textAlign = "center"; ctx.fillText(String(q.t), it.a[0], it.a[1] + 3.5); S.hits.push({x: it.a[0] - 8, y: it.a[1] - 8, w: 16, h: 16, fi: q.fi, px: it.a[0], py: it.a[1]}); ctx.globalAlpha = 1; });
      if(!items.length){ ctx.fillStyle = "#999"; ctx.font = "italic 12px Manrope,system-ui,sans-serif"; ctx.textAlign = "left"; ctx.fillText("Nothing placed near the foot edge on this side.", X0, Y0 + H1 + 24); }
    }
    function panel(ox, oy, w, h, pn){
      var side = vert ? 70 : 150, topH = 46, botH = 22, s = Math.min((w - 2 * side) / Wc, (h - topH - botH - 26) / Lc), pw = Wc * s, ph = Lc * s, cx = ox + w / 2, x0 = cx - pw / 2, y0 = oy + topH + 18 + (h - topH - botH - 26 - ph) / 2;
      function P(v){ return [cx + (v[2] - (bb.z0 + bb.z1) / 2) * s, y0 + (v[0] - bb.x0) * s]; }
      ctx.save(); ctx.beginPath(); ctx.rect(ox, oy, w, h); ctx.clip();
      ctx.fillStyle = pn === "back" ? "#2F5A1A" : "#B4531A"; ctx.font = "800 12px Manrope,system-ui,sans-serif"; ctx.textAlign = "left"; var tt = (pn === "back" ? "INSIDE · reverse / back panel (seen from inside)" : "OUTSIDE · front panel") + " · " + fabTxt(pn), tw = ctx.measureText(tt).width + 16; ctx.fillRect(ox + 8, oy + 8, tw, 22); ctx.fillStyle = "#fff"; ctx.fillText(tt, ox + 16, oy + 23);
      // fabric
      var g = ctx.createLinearGradient(x0, y0, x0 + pw, y0 + ph), bc = pn === "back" && m.parts[1] && m.parts[1].polys[0] ? m.parts[1].polys[0].c : base;
      g.addColorStop(0, col(bc.map(function(v){ return Math.min(255, v + 10); }))); g.addColorStop(1, col(bc.map(function(v){ return Math.max(0, v - 14); })));
      ctx.shadowColor = "rgba(0,0,0,.18)"; ctx.shadowBlur = 14; ctx.shadowOffsetY = 4; ctx.fillStyle = g; ctx.fillRect(x0, y0, pw, ph); ctx.shadowColor = "transparent"; ctx.strokeStyle = "#555"; ctx.lineWidth = 1.4; ctx.strokeRect(x0, y0, pw, ph);
      // head / foot labels
      ctx.fillStyle = "#777"; ctx.font = "700 10px Manrope,system-ui,sans-serif"; ctx.textAlign = "center"; ctx.fillText("HEAD END", cx, y0 - 5); ctx.fillText("FOOT END", cx, y0 + ph + 13);
      // overlay bands (hems, ties, labels…)
      m.parts.forEach(function(p){
        if(!p.ov) return; var mm = /^ov(\d+)(front|back)$/.exec(p.id); if(!mm || mm[2] !== pn) return;
        ctx.globalAlpha = dim(+mm[1]) ? .22 : Math.min(1, (p.alpha || .55) + .25);
        p.polys.forEach(function(q){ ctx.fillStyle = col(q.c); ctx.beginPath(); q.p.forEach(function(v, k){ var a = P(v); k ? ctx.lineTo(a[0], a[1]) : ctx.moveTo(a[0], a[1]); }); ctx.closePath(); ctx.fill(); });
        ctx.globalAlpha = 1;
      });
      // seams
      m.seams.forEach(function(sm){
        if(sm.exPart && sm.exPart.id !== pn) return; if(!sm.exPart && /^fx/.test(sm.group || "")) return; var fk = /^fx(\d+)$/.exec(sm.group || "");
        ctx.globalAlpha = fk && dim(+fk[1]) ? .22 : 1; ctx.strokeStyle = col(sm.col || [90, 90, 90]); ctx.lineWidth = Math.max(1.2, Math.min(3, (sm.w || 2) * .7)); ctx.setLineDash(sm.dash ? [6, 4] : []); ctx.beginPath();
        (sm.pts || []).forEach(function(v, k){ var a = P(v); k ? ctx.lineTo(a[0], a[1]) : ctx.moveTo(a[0], a[1]); }); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
      });
      // callouts in the side margins
      var mk = (m.marks || []).filter(function(q){ return (/back|inside|rev/.test(String(q.pn || "")) ? "back" : "front") === pn; }), left = [], right = [];
      var labels = mk.filter(function(q){ return String(q.t).length > 2; }), nums = mk.filter(function(q){ return String(q.t).length <= 2; });
      var seenP = {}, pins = []; mk.forEach(function(q){ if(q.fi == null || seenP[q.fi] || /^(START|END) ·/.test(String(q.t))) return; seenP[q.fi] = 1; S.p2[q.fi] = P(q.p); pins.push({p: q.p, t: String(q.fi + 1), col: q.col, fi: q.fi}); });
      (m.fxInfo || []).forEach(function(fx){ if(seenP[fx.i] || !fx.at) return; var bk = / reverse side/.test(fx.txt); if((bk ? "back" : "front") !== pn) return; var p3 = [fx.at[0], 0, fx.at[1]]; S.p2[fx.i] = P(p3); pins.push({p: p3, t: String(fx.i + 1), col: "#B4531A", fi: fx.i}); });
      if(!foc){ labels = []; nums = pins; } else { labels = labels.filter(function(q){ return foc.indexOf(q.fi) >= 0; }); nums = nums.filter(function(q){ return foc.indexOf(q.fi) >= 0; }); }
      labels.forEach(function(q){ var a = P(q.p); (a[0] < cx ? left : right).push({q: q, a: a}); });
      [left, right].forEach(function(arr, si){
        arr.sort(function(a, b){ return a.a[1] - b.a[1]; }); var yy = y0 - 4;
        arr.forEach(function(it){
          yy = Math.max(yy + 28, it.a[1] - 10); var bw = Math.min(side - 14, 200), bx = si === 0 ? ox + 8 : ox + w - bw - 8, by = yy;
          ctx.globalAlpha = dim(it.q.fi) ? .3 : 1; ctx.strokeStyle = it.q.col || "#B4531A"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(it.a[0], it.a[1]); ctx.lineTo(si === 0 ? bx + bw : bx, by + 10); ctx.stroke();
          ctx.fillStyle = it.q.col || "#B4531A"; ctx.beginPath(); ctx.arc(it.a[0], it.a[1], 3.5, 0, 6.283); ctx.fill();
          ctx.font = "700 10.5px Manrope,system-ui,sans-serif"; var tx = String(it.q.t), lines = []; (function wrap(){ var words = tx.split(" "), cur = ""; words.forEach(function(wd){ if(ctx.measureText(cur + " " + wd).width > bw - 10 && cur){ lines.push(cur); cur = wd; } else cur = cur ? cur + " " + wd : wd; }); lines.push(cur); })();
          var bh = 8 + lines.length * 12; ctx.fillStyle = "#fff"; ctx.fillRect(bx, by - 2, bw, bh); ctx.strokeStyle = it.q.col || "#B4531A"; ctx.strokeRect(bx, by - 2, bw, bh); ctx.fillStyle = "#3a2a18"; ctx.textAlign = "left";
          lines.forEach(function(ln, k){ ctx.fillText(ln, bx + 5, by + 10 + k * 12); }); yy += bh - 16;
          S.hits.push({x: bx, y: by - 2, w: bw, h: bh, fi: it.q.fi, px: it.a[0], py: it.a[1]}); ctx.globalAlpha = 1;
        });
      });
      nums.forEach(function(q){ var a = P(q.p); ctx.globalAlpha = dim(q.fi) ? .3 : 1; ctx.fillStyle = "#fff"; ctx.strokeStyle = q.col || "#B4531A"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(a[0], a[1], 8, 0, 6.283); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#3a2a18"; ctx.font = "800 10px Manrope,system-ui,sans-serif"; ctx.textAlign = "center"; ctx.fillText(String(q.t), a[0], a[1] + 3.5); S.hits.push({x: a[0] - 8, y: a[1] - 8, w: 16, h: 16, fi: q.fi, px: a[0], py: a[1]}); ctx.globalAlpha = 1; });
      if(!mk.length && !m.seams.some(function(sm){ return sm.exPart && sm.exPart.id === pn; })){ ctx.fillStyle = "#999"; ctx.font = "italic 11px Manrope,system-ui,sans-serif"; ctx.textAlign = "center"; ctx.fillText("nothing special on this side", cx, y0 + ph / 2); }
      // overall dims
      if(S.dims !== false){ ctx.strokeStyle = "#888"; ctx.fillStyle = "#555"; ctx.lineWidth = 1; ctx.font = "700 10.5px Manrope,system-ui,sans-serif"; ctx.textAlign = "center";
        ctx.beginPath(); ctx.moveTo(x0, y0 + ph + 18); ctx.lineTo(x0 + pw, y0 + ph + 18); ctx.stroke(); ctx.fillText(cmTxt(Wc), cx, y0 + ph + 30);
        ctx.save(); ctx.translate(x0 - 12, y0 + ph / 2); ctx.rotate(-Math.PI / 2); ctx.beginPath(); ctx.moveTo(-ph / 2, 0); ctx.lineTo(ph / 2, 0); ctx.stroke(); ctx.fillText(cmTxt(Lc), 0, -4); ctx.restore(); }
      ctx.restore();
    }
    if(vert){ panel(0, 40, W0, (H0 - 40) / 2, "front"); panel(0, 40 + (H0 - 40) / 2, W0, (H0 - 40) / 2, "back"); ctx.strokeStyle = "#cfd8c4"; ctx.beginPath(); ctx.moveTo(0, 40 + (H0 - 40) / 2); ctx.lineTo(W0, 40 + (H0 - 40) / 2); ctx.stroke(); }
    else { panel(0, 40, W0 / 2, H0 - 40, "front"); panel(W0 / 2, 40, W0 / 2, H0 - 40, "back"); ctx.strokeStyle = "#cfd8c4"; ctx.beginPath(); ctx.moveTo(W0 / 2, 44); ctx.lineTo(W0 / 2, H0 - 8); ctx.stroke(); }
  }
  function glFrame(m, glParts, items){
    var d = S.dist * (S.dual ? 1.3 : 1), cy = Math.cos(S.yaw), sy = Math.sin(S.yaw), cp = Math.cos(S.pitch), sp = Math.sin(S.pitch), foc = FOC(), n = 5, f = d * 6 + m.R * 6;
    var Af = (f + n) / (f - n), Bf = -2 * f * n / (f - n);
    var cm = {R: new Float32Array([cy, -sp * sy, -cp * sy, 0, cp, -sp, sy, sp * cy, cp * cy]), T: [0, 0, d], Pr: [2 * foc / CW, 2 * foc / CH, .08, 0], Z: [n, f], tgt: S.tgt};
    if(!m._bb){ var b = {x0: 1e9, x1: -1e9, z0: 1e9, z1: -1e9, y0: 1e9, y1: -1e9}; m.parts.forEach(function(p){ if(p.ov) return; p.polys.forEach(function(q){ q.p.forEach(function(v){ if(v[0] < b.x0) b.x0 = v[0]; if(v[0] > b.x1) b.x1 = v[0]; if(v[2] < b.z0) b.z0 = v[2]; if(v[2] > b.z1) b.z1 = v[2]; if(v[1] < b.y0) b.y0 = v[1]; if(v[1] > b.y1) b.y1 = v[1]; }); }); }); m._bb = b; }
    var bb = m._bb, H = Math.max(bb.y1 - bb.y0, 2) * .8, ground = {y: bb.y0 - .25, box: [(bb.x0 + bb.x1) / 2, (bb.z0 + bb.z1) / 2, (bb.x1 - bb.x0) / 2, (bb.z1 - bb.z0) / 2], soft: Math.max(3, m.R * .07), ls: [H * .53, H * .47], ext: m.R * 7, str: 1};
    var rr = Math.hypot((bb.x1 - bb.x0) / 2, (bb.z1 - bb.z0) / 2, H / 1.6) * 1.12 + 48 * (S.exCur || 0); ground.rs = rr; ground.rc = [(bb.x0 + bb.x1) / 2 - S.tgt[0], (bb.y0 + bb.y1) / 2 - S.tgt[1], (bb.z0 + bb.z1) / 2 - S.tgt[2]];
    var px = Math.round(OX * DPR), py = Math.round((S.fullH - OY - CH) * DPR);
    m.parts.forEach(function(p){ p._noAO = /^(flat|fitted|sheet)$/.test(m.kind); });
    G.view(px, py, Math.round(CW * DPR), Math.round(CH * DPR));
    G.scene(cm, glParts, ground);
    var rs = [], vw = CW, vh = CH;
    function ndc(c){ return [2 * foc * c[0] / (CW * c[2]) + G.jit[0], 2 * foc * c[1] / (CH * c[2]) + .08 + G.jit[1], Af + Bf / c[2]]; }
    var bias = m.R * .022, k = Math.min(1.8, 1);
    items.forEach(function(it){
      if(it.t !== 1) return; if(it.dash && it.si % 3 === 2) return;
      var a = [it.a[0], it.a[1], it.a[2] - bias], b = [it.b[0], it.b[1], it.b[2] - bias]; if(a[2] < n + .5 || b[2] < n + .5) return;
      var wpx = Math.max(1.3, it.w * (it.hl ? 1.05 : .8) * Math.min(1.9, 300 / Math.max(120, it.z) * (m.R / 120))), al = it.al == null ? 1 : it.al, col = it.col;
      var A_ = ndc(a), B_ = ndc(b);
      if(it.hl) rs.push({a: A_, b: B_, w: wpx * 1.9, col: [1, .55, .08, .22 * al]});
      rs.push({a: A_, b: B_, w: wpx, col: [col[0] / 255, col[1] / 255, col[2] / 255, al]});
    });
    G.ribbons(rs, vw, vh);
    G.end();
  }
  function drawOne(){
    var m = S.model; if(!m) return;
    var items = [], ext = S.exCur || 0, glParts = [];
    (function(){ if(S.gl) return; var g = cam([0, 0, 0], [0, 0, 0]); if(g[2] < 5) return; var rr = m.R * .95 * FOC() / g[2], gx = sx(g), gy = sy_(g), gr = ctx.createRadialGradient(gx, gy, 0, gx, gy, rr); gr.addColorStop(0, "rgba(40,50,30,.22)"); gr.addColorStop(1, "rgba(40,50,30,0)"); ctx.save(); ctx.translate(gx, gy); ctx.scale(1, Math.max(.25, Math.sin(S.pitch) * .8)); ctx.translate(-gx, -gy); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(gx, gy, rr, 0, 7); ctx.fill(); ctx.restore(); })();
    m.parts.forEach(function(pt){
      if(S.mode === true && (pt.id === "front" || pt.id === "ov0front" || /^ov\d+front$/.test(pt.id))) return; if(S.mode === false && /^ov\d+back$/.test(pt.id)) return;
      var hidden = !pt.ov && S.vis && S.vis.indexOf(pt.id) < 0; if(pt.id === "fill" && ext < .05 && !(S.vis && S.vis.length === 1)) return;
      var ex = [pt.ex[0] * ext, pt.ex[1] * ext, pt.ex[2] * ext];
      pt._ex = ex;
      var alpha = hidden ? 0.1 : pt.alpha ? pt.alpha : pt.ghost ? 0.55 : 1;
      if(S.gl){ var lift = S.mode === true && /^ov\d+back$/.test(pt.id) ? .9 : 0, c0 = pt.polys.length ? pt.polys[Math.floor(pt.polys.length / 2)].p[0] : [0, 0, 0]; glParts.push({pt: pt, off: [ex[0] - S.tgt[0], ex[1] - S.tgt[1] + lift, ex[2] - S.tgt[2]], a: alpha, z: cam(c0, ex)[2]}); return; }
      pt.polys.forEach(function(q){
        var c = q.p.map(function(p){ return cam(S.mode === true && /^ov\d+back$/.test(pt.id) ? [p[0], p[1] + .9, p[2]] : p, ex); }), z = 0, k; for(k = 0; k < c.length; k++) z += c[k][2]; z /= c.length;
        if(z <= 5) return;
        var ux = c[1][0] - c[0][0], uy = c[1][1] - c[0][1], uz = c[1][2] - c[0][2], vx = c[2][0] - c[0][0], vy = c[2][1] - c[0][1], vz = c[2][2] - c[0][2];
        var nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, nl = Math.hypot(nx, ny, nz) || 1;
        var d = Math.abs((nx * -.35 + ny * .55 + nz * -.76) / nl);
        items.push({t: 0, z: pt.ov ? z - S.model.R * .02 : z, c: c, col: q.c, k: .62 + .42 * d, a: alpha});
      });
    });
    var segs = [];
    function addLine(pts, ex, col, w, dash, hl, fadeA){
      for(var i = 0; i < pts.length - 1; i++){
        var a = cam(pts[i], ex), b = cam(pts[i + 1], ex); if(a[2] < 5 || b[2] < 5) continue;
        items.push({t: 1, z: (a[2] + b[2]) / 2 - S.model.R * .012, a: a, b: b, col: col, w: w, dash: dash, hl: hl, al: fadeA, si: i});
      }
    }
    if(S.stitch) m.seams.forEach(function(sm_){
      var spn = sm_.exPart && sm_.group && /^fx/.test(sm_.group) ? sm_.exPart.id : null; if(S.mode === true && spn === "front") return; if(S.mode === false && spn === "back") return;
      var pt0 = m.parts[0], ex = sm_.exPart ? sm_.exPart._ex : [0, 0, 0];
      var hl = S.hi[sm_.id] ? 1 : 0, active = S.step >= 0;
      var col = hl ? [255, 140, 20] : sm_.col || [48, 56, 40];
      var isQ = sm_.group === "quilt";
      if(isQ && !hl && active && S.step !== 0 && false) return;
      var fxk = /^fx(\d+)$/.exec(sm_.group || ""), fdim = fxk && S.focus && S.focus.length && S.focus.indexOf(+fxk[1]) < 0;
      addLine(S.mode === true && spn === "back" ? sm_.pts.map(function(p){ return [p[0], p[1] + .9, p[2]]; }) : sm_.pts, ex, col, hl ? (sm_.w || 2) + 3 : sm_.w || 2, sm_.dash || !hl && !sm_.col && !isQ && sm_.id === "side" ? [5, 4] : null, hl, fdim ? .2 : active && !hl ? .55 : 1);
    });
    if(S.gl){ try{ glFrame(m, glParts, items); }catch(e){ if(window.console) console.warn("YQI 3D GL fallback", e); G = null; S.gl = false; glc.style.display = "none"; S.dirty = 1; animate(); } }
    items.sort(function(a, b){ return b.z - a.z; });
    items.forEach(function(it){
      if(S.gl) return;
      if(it.t === 0){
        ctx.beginPath(); ctx.moveTo(sx(it.c[0]), sy_(it.c[0])); for(var k = 1; k < it.c.length; k++) ctx.lineTo(sx(it.c[k]), sy_(it.c[k])); ctx.closePath();
        ctx.globalAlpha = it.a; ctx.fillStyle = css(it.col, it.k); ctx.fill(); ctx.strokeStyle = css(it.col, it.k); ctx.lineWidth = .6; ctx.stroke();
      } else {
        ctx.globalAlpha = it.al == null ? 1 : it.al; ctx.beginPath(); ctx.moveTo(sx(it.a), sy_(it.a)); ctx.lineTo(sx(it.b), sy_(it.b));
        ctx.strokeStyle = css(it.col, 1); ctx.lineWidth = Math.max(1, it.w * (it.hl ? 1 : .7)) * Math.min(1.8, 300 / Math.max(120, it.z) * (m.R / 120)); ctx.setLineDash(it.dash || []); ctx.lineCap = "round"; ctx.stroke(); ctx.setLineDash([]);
      }
    });
    ctx.globalAlpha = 1;
    if(S.dims && !S.dual) m.dims.forEach(function(d){
      if(d.fi != null && !(S.focus && S.focus.indexOf(d.fi) >= 0)) return; var a = cam(d.a, [0, 0, 0]), b = cam(d.b, [0, 0, 0]); if(a[2] < 5 || b[2] < 5) return;
      var x1 = sx(a), y1 = sy_(a), x2 = sx(b), y2 = sy_(b);
      ctx.strokeStyle = "#B4531A"; ctx.fillStyle = "#B4531A"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      [[x1, y1], [x2, y2]].forEach(function(p){ ctx.beginPath(); ctx.arc(p[0], p[1], 2.6, 0, 7); ctx.fill(); });
      var tx = (x1 + x2) / 2, ty = (y1 + y2) / 2; ctx.font = "700 11.5px Manrope,system-ui,sans-serif"; var w = ctx.measureText(d.t).width + 10;
      ctx.fillStyle = "rgba(255,255,255,.93)"; ctx.fillRect(tx - w / 2, ty - 10, w, 20); ctx.strokeStyle = "#E8892B"; ctx.strokeRect(tx - w / 2, ty - 10, w, 20);
      ctx.fillStyle = "#7a3a10"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(d.t, tx, ty + .5);
    });
    (function(){
      var narrow = CW < 520, fs = narrow ? 10 : 11.5, vis = [], L2 = [], seenFi = {};
      ctx.font = "700 " + fs + "px Manrope,system-ui,sans-serif";
      (m.marks || []).forEach(function(mk, idx){
        if(S.mode === true && mk.pn === "front" || S.mode === false && mk.pn === "back") return;
        var foc_ = !!(S.focus && S.focus.length); if(foc_ && S.focus.indexOf(mk.fi) < 0) return; if(!foc_){ if(/^(START|END) ·/.test(String(mk.t)) || String(mk.t).length <= 2) return; if(seenFi[mk.fi]) return; seenFi[mk.fi] = 1; var c0_ = cam(mk.p, [0, 0, 0]); if(c0_[2] < 5) return; L2.push({mk: mk, num: mk.fi + 1, x: sx(c0_), y: sy_(c0_), w: 0, h: 0}); return; }
        var c = cam(mk.p, [0, 0, 0]); if(c[2] < 5) return;
        var tx = String(mk.t); 
        var w = ctx.measureText(tx).width + 12, x = sx(c), y = sy_(c);
        L2.push({mk: mk, t: tx, w: w, h: fs + 9, x: x, y: y, bx: x < CW / 2 ? x + 14 : x - 14 - w, by: y - 24 - (idx % 3) * 6});
      });
      if(!(S.focus && S.focus.length)) (m.fxInfo || []).forEach(function(fx){ if(seenFi[fx.i] || !fx.at) return; var bk = / reverse side/.test(fx.txt), pp = [fx.at[0], m.sy(fx.at[0], fx.at[1], bk ? "back" : "front"), fx.at[1]], c1 = cam(pp, [0, 0, 0]); if(c1[2] < 5) return; L2.push({mk: {fi: fx.i, col: "#B4531A"}, num: fx.i + 1, x: sx(c1), y: sy_(c1), w: 0, h: 0}); });
      for(var it = 0; it < 60; it++){
        var moved = 0;
        for(var i = 0; i < L2.length; i++) for(var j = i + 1; j < L2.length; j++){
          var A = L2[i], B = L2[j]; if(A.num || B.num) continue;
          if(A.bx < B.bx + B.w + 3 && B.bx < A.bx + A.w + 3 && A.by < B.by + B.h + 3 && B.by < A.by + A.h + 3){
            var up = A.by <= B.by ? A : B, dn = up === A ? B : A, ov = up.by + up.h + 3 - dn.by; up.by -= ov / 2 + .5; dn.by += ov / 2 + .5; moved = 1;
          }
        }
        L2.forEach(function(q){ if(q.num) return; q.by = clamp(q.by, 4, CH - q.h - 70); q.bx = clamp(q.bx, 2, CW - q.w - 2); });
        if(!moved) break;
      }
      L2.forEach(function(q){
        var mk = q.mk; if(q.num){ ctx.globalAlpha = 1; ctx.fillStyle = "#fff"; ctx.strokeStyle = mk.col; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.arc(q.x, q.y, 10, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#3a2a18"; ctx.font = "800 11px Manrope,system-ui,sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(String(q.num), q.x, q.y + .5); S.hits.push({x: q.x - 11, y: q.y - 11, w: 22, h: 22, fi: mk.fi, px: q.x, py: q.y}); return; }
        ctx.globalAlpha = S.focus && S.focus.length && S.focus.indexOf(mk.fi) < 0 ? .25 : 1;
        var ex = q.bx + q.w / 2 < q.x ? q.bx + q.w : q.bx, ey = q.by + q.h / 2;
        ctx.strokeStyle = mk.col; ctx.fillStyle = mk.col; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(ex, ey); ctx.stroke(); ctx.beginPath(); ctx.arc(q.x, q.y, 3.6, 0, 7); ctx.fill();
        ctx.font = "700 " + fs + "px Manrope,system-ui,sans-serif"; ctx.fillStyle = "#fff"; ctx.fillRect(q.bx, q.by, q.w, q.h); ctx.strokeStyle = mk.col; ctx.strokeRect(q.bx, q.by, q.w, q.h); ctx.fillStyle = mk.col; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText(q.t, q.bx + 6, q.by + q.h / 2 + .5); ctx.globalAlpha = 1;
        S.hits.push({x: q.bx, y: q.by, w: q.w, h: q.h, fi: mk.fi, px: q.x, py: q.y});
      });
    })();
    // highlighted seam names
    if(S.step >= 0) m.seams.forEach(function(s_){ if(!S.hi[s_.id] || s_.group === "quilt" && s_.id !== "quilt0" || s_.noLabel) return; var p = s_.pts[Math.floor(s_.pts.length / 2)], c = cam(p, [0, 0, 0]); if(c[2] < 5) return;
      var x = sx(c), y = sy_(c) - 16, t = s_.group === "quilt" ? "Quilting lines" : s_.name; ctx.font = "700 11px Manrope,system-ui,sans-serif"; var w = ctx.measureText(t).width + 10;
      ctx.fillStyle = "#E8892B"; ctx.fillRect(x - w / 2, y - 9, w, 18); ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(t, x, y + .5); });
  }
  function frame(){
    var tgt = S.exT; if(Math.abs((S.exCur || 0) - tgt) > .002){ S.exCur = (S.exCur || 0) + (tgt - (S.exCur || 0)) * .12; S.dirty = 1; } else if(S.exCur !== tgt){ S.exCur = tgt; S.dirty = 1; }
    if(S.goal){ var g = S.goal, mv = 0; for(var q = 0; q < 3; q++){ var dq = g.t[q] - S.tgt[q]; if(Math.abs(dq) > .05){ S.tgt[q] += dq * .15; mv = 1; } } var dd = g.d - S.dist; if(Math.abs(dd) > .5){ S.dist += dd * .15; mv = 1; } if(mv) S.dirty = 1; else S.goal = null; }
    if(S.auto){ S.yaw += .004; S.dirty = 1; }
    if(S.dirty){ S.dirty = 0; draw(); }
    S.raf = (S.exCur !== S.exT || S.auto || S.play || S.goal) ? requestAnimationFrame(frame) : 0;
  }
  function animate(){ if(!S.raf) S.raf = requestAnimationFrame(frame); }

  // ---- controls ----
  var ptrs = {}, lastD = 0;
  view.addEventListener("pointerdown", function(e){ if(e.target.closest(".stu-hud,.stu-cap")) return; view.setPointerCapture(e.pointerId); ptrs[e.pointerId] = [e.clientX, e.clientY]; S.auto = 0; });
  view.addEventListener("pointermove", function(e){
    var p = ptrs[e.pointerId]; if(!p) return; var ids = Object.keys(ptrs);
    if(S.v2d){ if(ids.length === 1){ S.pxo += e.clientX - p[0]; S.pyo += e.clientY - p[1]; } else if(ids.length === 2){ var o2 = ids.filter(function(k){ return +k !== e.pointerId; })[0], q2 = ptrs[o2], dA = Math.hypot(p[0] - q2[0], p[1] - q2[1]), dB = Math.hypot(e.clientX - q2[0], e.clientY - q2[1]); S.z = clamp(S.z * dB / Math.max(10, dA), 1, 8); } clamp2d(); }
    else if(ids.length === 1){ S.yaw -= (e.clientX - p[0]) * .0095; S.pitch = clamp(S.pitch + (e.clientY - p[1]) * .0095, -1.5, 1.5); }
    else if(ids.length === 2){ var o = ids.filter(function(k){ return +k !== e.pointerId; })[0], q = ptrs[o], d0 = Math.hypot(p[0] - q[0], p[1] - q[1]), d1 = Math.hypot(e.clientX - q[0], e.clientY - q[1]); S.dist = clamp(S.dist * d0 / Math.max(10, d1), S.model.R * .7, S.model.R * 6); }
    ptrs[e.pointerId] = [e.clientX, e.clientY]; S.dirty = 1; animate();
  });
  var downAt = null; view.addEventListener("pointerdown", function(e){ downAt = [e.clientX, e.clientY]; }, true);
  function up(e){ delete ptrs[e.pointerId]; if(downAt && Math.abs(e.clientX - downAt[0]) < 6 && Math.abs(e.clientY - downAt[1]) < 6 && !e.target.closest(".stu-hud,.stu-cap")){ var r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; if(S.v2d){ x = (x - (CW / 2 + S.pxo)) / S.z + CW / 2; y = (y - (CH / 2 + S.pyo)) / S.z + CH / 2; } (S.hits || []).slice().reverse().some(function(h){ if(x >= h.x - 4 && x <= h.x + h.w + 4 && y >= h.y - 4 && y <= h.y + h.h + 4 || Math.hypot(x - h.px, y - h.py) < 9){ selectFeature(h.fi); return true; } }); } downAt = null; } view.addEventListener("pointerup", up); view.addEventListener("pointercancel", up);
  view.addEventListener("wheel", function(e){ e.preventDefault(); if(S.v2d){ S.z = clamp(S.z * (1 - e.deltaY * .0015), 1, 8); clamp2d(); S.dirty = 1; animate(); return; } S.dist = clamp(S.dist * (1 + e.deltaY * .001), S.model.R * .7, S.model.R * 6); S.dirty = 1; animate(); }, {passive: false});
  function clamp2d(){ var mx = (S.z - 1) * CW / 2 + 60, my = (S.z - 1) * CH / 2 + 60; S.pxo = clamp(S.pxo, -mx, mx); S.pyo = clamp(S.pyo, -my, my); if(S.z <= 1.001){ S.pxo = S.pyo = 0; } S.dirty = 1; animate(); }
  function set2d(v){ S.v2d = !!v; $("b2d").classList.toggle("on", S.v2d); $("b2d").textContent = S.v2d ? "2D plan ✓ (tap for 3D)" : "Show 2D plan"; ["bExp", "bDual", "bRev", "bPlay"].forEach(function(id){ var e = $(id); if(e) e.style.display = S.v2d ? "none" : ""; }); var bd = $("bDet"); if(bd) bd.style.display = S.v2d ? "" : "none"; ["bZi", "bZo"].forEach(function(id){ var e = $(id); if(e) e.style.display = S.v2d ? "" : "none"; }); if(!S.v2d){ S.det = false; var cp2 = $("stuCap"); if(cp2) cp2.style.display = ""; if(bd){ bd.classList.remove("on"); bd.textContent = "Foot close-up"; } } S.dirty = 1; animate(); }
  $("bZi").onclick = function(){ S.z = clamp(S.z * 1.4, 1, 8); clamp2d(); }; $("bZo").onclick = function(){ S.z = clamp(S.z / 1.4, 1, 8); clamp2d(); };
  $("bDet").onclick = function(){ S.det = !S.det; var cp_ = $("stuCap"); if(cp_) cp_.style.display = S.det ? "none" : ""; this.classList.toggle("on", !!S.det); this.textContent = S.det ? "Full plan" : "Foot close-up"; S.dirty = 1; animate(); };
  S.set2d = set2d; $("b2d").onclick = function(){ set2d(!S.v2d); }; S.v2d = false; $("b2d").classList.remove("on"); $("b2d").textContent = "Show 2D plan";
  $("bDim").onclick = function(){ S.dims = !S.dims; this.classList.toggle("on", !!S.dims); S.dirty = 1; animate(); };
  $("bStitch").onclick = function(){ S.stitch = !S.stitch; this.classList.toggle("on", !!S.stitch); S.dirty = 1; animate(); };
  $("bExp").onclick = function(){ S.explodeUser = !S.explodeUser; this.classList.toggle("on", !!S.explodeUser); if(S.step < 0) S.exT = S.explodeUser ? 1 : 0; animate(); };
  function setRev(v){ S.pitch = v ? -.9 : .9; $("bRev").classList.toggle("on", !!v); S.dirty = 1; animate(); }
  $("bRev").onclick = function(){ setRev(S.pitch > 0); };
  $("bRes").onclick = function(){ S.z = 1; S.pxo = S.pyo = 0; setRev(0); S.yaw = -.7; S.pitch = .9; S.dist = S.model.R * 2.7; S.step = -1; setStep(-1); };
  $("bPlay").onclick = function(){
    if(S.play){ clearInterval(S.play); S.play = 0; this.textContent = "▶ Play operations"; return; }
    var self = this; self.textContent = "⏸ Stop"; var i = -1; S.auto = 1;
    var go = function(){ i++; if(i >= S.model.steps.length){ clearInterval(S.play); S.play = 0; S.auto = 0; self.textContent = "▶ Play operations"; setStep(-1); return; } setStep(i); }; go(); S.play = setInterval(go, 3600); animate();
  };

  // ---- side panel ----
  // ---------- customer spec upload → Claude reads → 3D ----------
  var SPEC_PROMPT = [
    "You are a home-textile technical expert (duvet covers, pillowcases, sheet sets, comforters, bolsters). Read the customer's spec / tech pack below (text and/or page images) and return ONE JSON object only (no prose, no markdown fence).",
    "READ EVERYTHING, ESPECIALLY THE DRAWINGS: in most specs the real detail (ties, zips, labels, hems, seam allowances, stitch notes, counts like \"8 pcs\") is written ONLY inside the sewing-diagram pictures, in Chinese and English. Read every callout/arrow/dimension in every picture. First fill \"callouts\" with EVERY annotation you can read (verbatim, short) and say where it is drawn (outside front / outside back / inside). Then build features from the callouts so that nothing is dropped.",
    "Do not invent anything: if the spec does not say it, leave the field null and add a short plain-English line to \"missing\". If two statements conflict or are unclear, put it in \"missing\" too.",
    "Schema:",
    '{"customer":str|null,"style":str|null,"callouts":[{"text":str,"where":"outside front|outside back|inside|pillow|table|text"}],"articles":[ONE ENTRY PER ARTICLE in the spec. A sheet set = separate entries for flat sheet, fitted sheet, pillowcase(s); duvet set = duvet cover + pillowcases. Each entry:',
    '{"name":str,"type":"pillow|duvet|comforter|flat|fitted|bolster","unit":"cm|inch","W":num,"L":num,',
    '"fabric":"plain|washed|napped|waffle|stripe|check|print","fabric2":same-or-null (reverse side if different),"colorName":str,"color":"#hex","color2":"#hex reverse or null","color2p":"#hex pattern/second colour or null",',
    '"closure":"envelope|zip|button|tie|oxford|none","flange":num_cm|null,"hem":str|null,"spi":str|null,"quilt":"box|channel|diamond|none"|null,"cell":num|null,"fill":num_gsm|null,"pocket":num_pocket_depth|null,"piping":bool,',
    '"features":[{"kind":"band|hem|zip|opening|loop|tie|button|label|piping|binding|flange|elastic|other","name":str,"count":int,"edge":"foot|head|left|right|corners|all","panel":"front|back|both","placement":"outside|inside","spots":[tokens]|null,"sewn":"middle|end"|null,"lengthCm":num|null,"startCm":num|null,"endCm":num|null,"widthCm":num|null (hem depth / zip tape / flap depth),"fold":"single|double"|null,"spacingCm":num|null,"sizeCm":num|null,"positionsCm":[num]|null,"rows":int|null,"bands":[{"from":"left|right|head|foot","offsetCm":num}]|null,"offsetCm":num|null (distance from the edge to where the band/point STARTS, e.g. flap strip that begins 7cm from the foot edge; labels sit this far in),"specText":"short quote from spec"}],',
    '"ops":[{"name":str,"machine":str,"detail":str,"how":[3-5 short sewing steps for this operation],"check":[2-4 quality checks with the spec numbers],"focus":"none|opening|side seams|edge|quilting","features":[indexes into this entry features]}],',
    '"missing":[str],"notes":[str]}]}',
    "Rules:",
    "- DECORATIVE LINES that run across a panel (buried rope / cord embroidery, pintucks, pleats, satin or stitched stripes) are kind \"band\": rows = how many parallel lines in one band (e.g. 4), widthCm = width of one line, spacingCm = gap between lines, bands = one entry per band with the edge it is measured from and the distance in cm (a vertical band 43cm from the left side = {from:left,offsetCm:43}; a horizontal band 70cm above the foot = {from:foot,offsetCm:70}; a frame 2 inch from every edge = four entries). Use the article's own size when the distance differs by size. Never use kind other for these.",
    "- LABELS: every label in any drawing is its own feature with startCm (along the edge from the left corner), offsetCm (how far in from that edge), lengthCm and widthCm when written; if a value is not written leave it null and add it to missing.",
    "- INSIDE items: anything the spec/diagram shows on the inside / wrong side / \"inside sewing diagram\" (ties, care label, size label, zipper tape inside, blind-stitch seam allowance) gets placement \"inside\" and panel \"back\". Outside items (visible zip, flange, hem) get placement \"outside\".",
    "- TIES / LOOPS: count must equal the spec number (e.g. \"8 pcs woven tapes\" = 8). sizeCm = tape length, widthCm = tape width. spots = where each one sits as tokens from: corner-tl, corner-tr, corner-bl, corner-br, head-mid, foot-mid, left-mid, right-mid (head = end opposite the opening/zip, foot = the opening/zip end, tl/tr = head-left/head-right, bl/br = foot-left/foot-right). Read the positions from the picture; one token per tie. If the picture shows e.g. 4 at the corners and 4 along the edges, list all 8. sewn = \"middle\" if the spec says sewn in the middle.",
    "- Zip tape length, zip colour/size (e.g. no.3 nylon), stitch widths, seam allowance, overlock type, label sizes/positions and stack order go into features (kind zip/label/other) with specText quoting the callout, or into notes if they do not fit.",
    "- Count check before answering: for every number written in the callouts (pcs, cm, inch) make sure the matching feature carries it.",
    "- panel: front = outer/right side, back = reverse/inside. Where the spec says inside / reverse / wrong side use back; if it applies to both use both.",
    "- hem: EVERY hem in the spec is a feature with widthCm (e.g. 4 inch = 10.16) and fold; a flat sheet usually has a head hem, foot hem and two side hems (edge head/foot/left/right).",
    "- zip/opening: give startCm and endCm (or lengthCm) measured from the first corner along that edge, plus widthCm = flap/placket depth.",
    "- W and L are the FINISHED size in the unit used by the spec. For a pillowcase L is the long side. For duvet/comforter W is the width, L the length. Sheet set: W,L of the fitted sheet.",
    "- Every physical component the spec mentions (each zip, opening/envelope flap, loops, ties, buttons, labels, piping, flange, pocket, elastic) must be one entry in features, with the exact count from the spec. All feature distances are in cm (convert inches).",
    "- edge: foot = the opening end of a pillowcase/duvet (bottom end); head = the opposite end; left/right = long sides; corners = at the 4 corners. startCm = distance from the first corner along that edge to where it starts (zip start, first loop...). If the spec gives exact placement, use it (startCm/spacingCm/positionsCm); otherwise leave null.",
    "- ops: the real sequence of sewing/finishing operations FOR THIS SPEC (6–14 steps: cutting, hemming, attaching each feature, quilting, joining, turning, inspection, folding/packing). In detail, state the spec numbers (e.g. \"Attach 4 loops, 8 cm each, at the 4 corners, 2 cm from the edge\"). Use features[] to point at the components that operation sews so they get highlighted. machine = typical machine (single needle, overlock, zipper foot, bartack, quilting machine...).",
    "- Colour: pick a hex that matches the colour name or Pantone given. Be concise."
  ].join("\n");

  function loadScript(src){ return new Promise(function(res, rej){ var s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = function(){ rej(new Error("could not load " + src)); }; document.head.appendChild(s); }); }
  function shrink(blobOrCanvas, max){
    return new Promise(function(res){
      function done(cvs){ cvs.toBlob(function(b){ res(b); }, "image/jpeg", .85); }
      if(blobOrCanvas instanceof HTMLCanvasElement) return done(blobOrCanvas);
      var url = URL.createObjectURL(blobOrCanvas), im = new Image(); im.onload = function(){ var k = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement("canvas"); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(url); done(c); }; im.onerror = function(){ res(blobOrCanvas); }; im.src = url;
    });
  }
  async function zipMedia(buf, mediaRe, textRe){
    if(!window.JSZip) await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js");
    var z = await window.JSZip.loadAsync(buf), media = [], text = [];
    z.forEach(function(p, e){ if(e.dir) return; if(mediaRe.test(p) && /\.(png|jpe?g|gif|bmp)$/i.test(p)) media.push(e); else if(textRe.test(p)) text.push(e); });
    var tx = []; for(var i = 0; i < text.length; i++){ var x = await text[i].async("string"), parts = (x.match(/<(?:a|w):t[^>]*>[^<]*<\/(?:a|w):t>/g) || []).map(function(t){ return t.replace(/<[^>]+>/g, ""); }).join(" ").replace(/\s+/g, " ").trim(); if(parts.length > 8) tx.push(parts); }
    var sized = []; for(i = 0; i < media.length; i++){ var u8 = await media[i].async("uint8array"); sized.push({n: media[i].name, u8: u8}); }
    sized.sort(function(a, b){ return b.u8.length - a.u8.length; });
    var out = []; for(i = 0; i < sized.length && out.length < 8; i++){ if(sized[i].u8.length < 12000) continue; var b = new Blob([sized[i].u8], {type: /png$/i.test(sized[i].n) ? "image/png" : "image/jpeg"}); out.push(await shrink(b, 1800)); }
    return {imgs: out, text: tx.join("\n")};
  }
  async function gather(files){
    var texts = [], imgs = [], i;
    for(i = 0; i < files.length; i++){
      var f = files[i], n = (f.name || "").toLowerCase();
      if(/^image\//.test(f.type)) imgs.push(await shrink(f, 1700));
      else if(/\.pdf$/.test(n)){
        if(!window.pdfjsLib){ await loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"); window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"; }
        var pdf = await window.pdfjsLib.getDocument({data: new Uint8Array(await f.arrayBuffer())}).promise, pn = Math.min(pdf.numPages, 6);
        for(var p = 1; p <= pn; p++){ var pg = await pdf.getPage(p), vp = pg.getViewport({scale: 1.6}), c = document.createElement("canvas"); c.width = vp.width; c.height = vp.height; await pg.render({canvasContext: c.getContext("2d"), viewport: vp}).promise; imgs.push(await shrink(c, 1700)); }
        if(pdf.numPages > pn) texts.push("(PDF has " + pdf.numPages + " pages; only first " + pn + " read)");
      }
      else if(/\.xlsx?$/.test(n)){
        if(!window.XLSX) await loadScript("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js");
        var buf = await f.arrayBuffer();
        var wb = window.XLSX.read(buf, {type: "array", sheetRows: 400}); wb.SheetNames.slice(0, 6).forEach(function(sn){ var csv = window.XLSX.utils.sheet_to_csv(wb.Sheets[sn]); if(csv.replace(/[,\s]/g, "").length > 20) texts.push("[sheet " + sn + "]\n" + csv.slice(0, 9000)); });
        try{ var mi = await zipMedia(buf, /^xl\/media\//, /^xl\/drawings\/drawing\d+\.xml$/); imgs = imgs.concat(mi.imgs); if(mi.text) texts.push("[text boxes inside drawings]\n" + mi.text); }catch(e){ texts.push("(could not open pictures inside the Excel: " + e.message + ")"); }
      }
      else if(/\.(docx|pptx)$/.test(n)){
        try{ var isW = /docx$/.test(n), mi2 = await zipMedia(await f.arrayBuffer(), isW ? /^word\/media\// : /^ppt\/media\//, isW ? /^word\/document\.xml$/ : /^ppt\/slides\/slide\d+\.xml$/); imgs = imgs.concat(mi2.imgs); if(mi2.text) texts.push(mi2.text.slice(0, 15000)); }catch(e){ texts.push("(could not open " + n + ": " + e.message + ")"); }
      }
      else texts.push((await f.text()).slice(0, 20000));
    }
    return {texts: texts, imgs: imgs.slice(0, 10)};
  }

  // Spec read by hand from the Bedsure/Shinebed "Duvet Cover Set-Cotton-Waffle" drawing (Twin 68x90 in)
  function waffleJ(){
    var W = 172.7, B = [], i;
    return {type: "duvet", name: "Duvet cover · Waffle (Bedsure) · Twin 68×90 in", unit: "inch", W: 68, L: 90, color: "#2C3E5F", colorName: "Navy 19-4118TCX", fabric: "waffle", fabric2: "plain", color2: "#2C3E5F", closure: "button", hem: "3 cm double flap", spi: "12-13 stitches / 3 cm, DTM thread",
      features: [
        {kind: "hem", name: "Blind seam 1.2 cm SA + 3-thread overlock, all round", count: 1, edge: "all", panel: "both", placement: "inside", widthCm: 1.2, specText: "四周暗缝缝份1.2cm宽 · 四周三线锁边"},
        {kind: "tie", name: "Woven herringbone tie 1 cm × 30 cm (centre-stitched, 15 cm each side)", count: 8, edge: "all", panel: "back", placement: "inside", spots: ["corner-tl", "corner-tr", "corner-bl", "corner-br", "head-mid", "left-mid", "right-mid", "foot-mid"], sizeCm: 15, widthCm: 1, specText: "8个织带居中订平车来回加固 · 1cm宽织带30cm长 · 单边长15cm"},
        {kind: "opening", name: "Opening zone · split line 7 cm from foot edge", count: 1, edge: "foot", panel: "back", placement: "inside", startCm: 0, lengthCm: W, offsetCm: 0, widthCm: 7, specText: "距底边7cm分割做搭门"},
        {kind: "hem", name: "Overlap flap 3 cm (double flap, buttons hidden from front, edge rolled 1 cm 3-fold)", count: 1, edge: "foot", panel: "back", placement: "inside", startCm: 0, lengthCm: W, offsetCm: 7, widthCm: 3, fold: "double", specText: "叠门3cm宽 · 叠门卷边1cm宽三折光"},
        {kind: "button", name: "Clear button Ø2 cm, 8-strand X, 2-up 2-down, DTM thread", count: 7, edge: "foot", panel: "back", placement: "inside", startCm: 5, spacingCm: (W - 10) / 6, offsetCm: 8.5, sizeCm: 2, specText: "2cm直径透明纽扣 · 8股线X二上二下订纽扣 · 两端空5cm · Twin 7+1 spare"},
        {kind: "label", name: "Care / wash label (洗标)", count: 1, edge: "foot", panel: "back", placement: "inside", startCm: 15, offsetCm: 10, lengthCm: 6, widthCm: 4, specText: "洗标 · labels sewn inside the seam, not visible from front · 15 cm from corner"},
        {kind: "label", name: "Woven brand label (织标)", count: 1, edge: "foot", panel: "back", placement: "inside", startCm: 21, offsetCm: 10, lengthCm: 5, widthCm: 3, specText: "织标 · next to the care label"},
        {kind: "opening", name: "5 cm back-and-forth reinforcement (left end of opening)", count: 1, edge: "foot", panel: "back", placement: "inside", startCm: 0, lengthCm: 5, offsetCm: 0, widthCm: 10, specText: "5cm来回针加固"},
        {kind: "opening", name: "5 cm back-and-forth reinforcement (right end of opening)", count: 1, edge: "foot", panel: "back", placement: "inside", startCm: W - 5, lengthCm: 5, offsetCm: 0, widthCm: 10, specText: "5cm来回针加固"}
      ],
      ops: [
        {name: "Cut front (waffle) + back (plain)", machine: "Cutting", detail: "Cut straight both ways, no bias distortion (waffle). Front 40/2×21 126×58, back 32×32/78×65; both washed, same colour.", features: []},
        {name: "Sew care + woven label into inner seam", machine: "Single needle lockstitch", detail: "Care label then woven label at the foot opening, 15 cm from the left corner, inside the seam; nothing shows on the front.", features: [5, 6]},
        {name: "Make the opening: split 7 cm, flap 3 cm", machine: "Hemming / lockstitch", detail: "Split back panel 7 cm from foot edge; double flap 3 cm wide, flap edge rolled 1 cm and 3-fold.", features: [2, 3]},
        {name: "Reinforce both ends of the opening", machine: "Bartack / back-and-forth", detail: "5 cm back-and-forth stitch at both ends of the opening.", features: [7, 8]},
        {name: "Buttonholes + attach 7 buttons", machine: "Flat-end buttonhole + button sew", detail: "Ø2 cm clear buttons, 8-strand thread X, 2-up 2-down, DTM thread. Keep 5 cm blank at both ends. Twin: 7 + 1 spare.", features: [4]},
        {name: "Join front + back (blind seam)", machine: "3-thread overlock", detail: "1.2 cm seam allowance, 3-thread overlock all round; trim thread ends clean.", features: [0]},
        {name: "Attach 8 woven ties", machine: "Flat bartack", detail: "1 cm herringbone tape, 30 cm, stitched at the centre back-and-forth; ends folded and sealed; 4 corners + 4 mid points.", features: [1]},
        {name: "Turn, press, fold & pack", machine: "—", detail: "Add spare button bag/hangtag, fold per packing sheet, polybag + barcode.", features: []}
      ],
      missing: ["Care + woven label SIZE (cm) is not written in the spec (only logo margins 10/7/7 mm). Drawn as 6×4 and 5×3 cm placeholders — please confirm.", "Label order (care left, woven right) and exact position of the woven label are read from the picture, not written.", "Where the 3 cm flap sits relative to the 7 cm line is read from the drawing (flap strip drawn from 7 to 10 cm above the foot edge)."],
      notes: ["No zip in this spec. Closure = double-flap button opening on the BACK panel at the FOOT end.", "FRONT = waffle (40/2×21, 126×58). REVERSE = plain (32×32/78×65). Same colour, both washed.", "Buttons: Twin 7+1 spare, Full 8+1, Queen 9+1, King 11+1, Cal King 11+1, Oversized Queen 11+1, Oversized King 13+1 (Design sheet).", "Stitch 12–13 per 3 cm, thread same colour as fabric.", "Flange pillowcase 20×26 in: 1.25 in flange, 3 cm herringbone flange binding, 0.1 cm topstitch; envelope flap overlap 10 cm, opening 5 cm at the half; labels inside seam."]};
  }
  function numOr(v, d){ v = +v; return isFinite(v) && v > 0 ? v : d; }
  function oneSpec(j, top){
    var type = BUILD[j.type] ? j.type : inferType(j.name || j.style || ""), D = DEFAULTS[type];
    var sp = Object.assign({}, D, {type: type, title: j.name || "", unit: j.unit === "cm" ? "cm" : j.unit === "inch" ? "inch" : D.unit, color: toHex(j.color), colorName: j.colorName || "", color2: j.color2 ? toHex(j.color2) : "", color2p: j.color2p ? toHex(j.color2p) : "", fabric: j.fabric || "plain", fabric2: j.fabric2 || "", pcSeparate: j.fabric2 && j.fabric2 !== j.fabric || j.color2 && j.color2 !== j.color ? "1" : "0"});
    if(type === "pillow"){ sp.L = numOr(j.L, D.L); sp.W = numOr(j.W, D.W); if(sp.W > sp.L){ var t_ = sp.W; sp.W = sp.L; sp.L = t_; } } else if(type === "bolster"){ sp.L = numOr(j.L, D.L); sp.W = numOr(j.W, D.W); } else { sp.W = numOr(j.W, D.W); sp.L = numOr(j.L, D.L); }
    if(j.closure && j.closure !== "none") sp.closure = j.closure; if(j.flange) sp.flange = +j.flange || 0; if(j.hem) sp.hem = j.hem; if(j.spi) sp.spi = j.spi;
    if(j.quilt) sp.quilt = j.quilt; if(j.cell) sp.cell = +j.cell; if(j.fill) sp.fill = j.fill; if(j.pocket) sp.pocket = j.pocket; if(j.piping) sp.piping = "1";
    sp.ties = "0"; sp.src = [top.customer, top.style].filter(Boolean).join(" · ");
    sp.x = {features: Array.isArray(j.features) ? j.features : [], ops: Array.isArray(j.ops) ? j.ops : [], missing: Array.isArray(j.missing) ? j.missing : [], notes: Array.isArray(j.notes) ? j.notes : []};
    return sp;
  }
  function applyExtract(j){
    S.fromSpec = true; setEmpty(false); var arts = Array.isArray(j.articles) && j.articles.length ? j.articles : [j];
    S.set = arts.map(function(a){ return oneSpec(a, j); }); S.si = 0; S.sp = S.set[0]; S.type = S.sp.type; mkTypes(); rebuild(); if(S.set2d) S.set2d(true);
  }
  async function readSpec(){
    var stat = function(t, bad){ S.upStat = t; S.upBad = !!bad; var e = $("spStat"); if(e){ e.textContent = t; e.style.color = bad ? "#b3261e" : "#2F5A1A"; } };
    var files = S.upFiles || [], txt = (S.upText || "").trim(); if(!files.length && !txt){ stat("Upload a spec file or paste the spec text first.", 1); return; }
    var sample = null; try{ sample = window.claude && await window.claude.use("sample"); }catch(e){}
    if(!sample){ stat("Claude reading is not available in this view. Open YQI from claude.ai and allow it, or edit the spec by hand below.", 1); return; }
    stat("Reading the spec…");
    try{
      var lim = null, cap = 4; try{ lim = await sample.limits(); }catch(e){}
      if(lim && typeof lim.images === "number" && lim.images > 0) cap = Math.min(cap, lim.images);
      var units = files.map(function(f){ return [f]; }); if(!units.length) units = [[]];
      var allArts = [], allCo = [], head = null;
      for(var u = 0; u < units.length; u++){
        if(units.length > 1) stat("Reading file " + (u + 1) + " of " + units.length + "…");
        var g = await gather(units[u]);
        if(g.imgs.length && (!lim || !lim.images)){ stat("Image reading is not enabled in this view — paste the spec as text instead.", 1); return; }
        if(g.imgs.length > cap) g.imgs = g.imgs.slice(0, cap);
        var input = SPEC_PROMPT + "\n\n--- SPEC TEXT ---\n" + (g.texts.concat(txt && u === 0 ? [txt] : []).join("\n\n") || "(see attached page images)");
        var j = await sample.json(input, {images: g.imgs.length ? g.imgs : undefined, cache: false, modelTier: "complex"});
        if(!j || typeof j !== "object") throw new Error("no answer for file " + (u + 1));
        if(!head) head = j;
        (Array.isArray(j.articles) && j.articles.length ? j.articles : [j]).forEach(function(a){ if(units.length > 1 && units[u][0]) a.name = (a.name || "Article") + " · " + String(units[u][0].name).replace(/\.[a-z]+$/i, "").slice(-28); allArts.push(a); });
        (Array.isArray(j.callouts) ? j.callouts : []).forEach(function(c){ if(c && c.text) allCo.push(c); });
      }
      S.callouts = allCo; var AR = allArts; applyExtract({customer: head && head.customer, style: head && head.style, articles: AR});
      stat("Done — " + AR.length + " article(s), " + AR.reduce(function(a, x){ return a + (x.features || []).length; }, 0) + " components, " + AR.reduce(function(a, x){ return a + (x.ops || []).length; }, 0) + " operations read. Check the list below.");
    }catch(e){ stat("Could not read the spec: " + (e && e.message || e.code || e), 1); }
  }

  function drawSide(){
    var sp = S.sp, side = $("stuSide"), m = S.model, t = S.type;
    var h = '<div class="stu-card up"><h4>★ Any customer — upload spec</h4><div class="stu-sub">Photo / PDF / Excel / text of the spec (any customer). Claude reads it and builds the 3D with every zip, loop, opening and its position.</div><input type="file" id="spFile" multiple accept="image/*,.pdf,.xlsx,.xls,.csv,.txt,.md,.docx,.pptx"><div id="spFiles" class="stu-sub"></div><textarea id="spText" rows="3" placeholder="…or paste the spec text here (size, closure, loops, zips, quilting, packing…)"></textarea><div class="stu-row" style="margin-top:6px"><button class="stu-btn" id="spRead">Read spec &amp; build 3D</button><button class="stu-btn g" id="spClr">Clear</button></div><div id="spStat" class="stu-sub"></div><div id="spCo"></div></div>';
    h += '<div class="stu-card"><h4>➕ Add a component myself</h4><div class="stu-sub">Add any part the spec needs (tie, zip, label, loop…). It appears in the 2D plan, the 3D view and the operations by itself.</div><div class="stu-grid">' +
      '<label>Component<select id="mKind">' + ["tie", "zip", "label", "loop", "button", "hem", "opening", "piping", "flange", "elastic", "other"].map(function(k){ return "<option>" + k + "</option>"; }).join("") + '</select></label>' +
      '<label>Name (optional)<input id="mName" placeholder="Woven tape"></label>' +
      '<label>How many<input id="mCount" type="number" min="1" value="1"></label>' +
      '<label>Side<select id="mPlace"><option value="inside">inside (reverse)</option><option value="outside">outside (front)</option></select></label>' +
      '<label class="w2">Where<select id="mWhere"><option value="head">head end</option><option value="foot">foot end (opening side)</option><option value="left">left side</option><option value="right">right side</option><option value="corners">4 corners</option><option value="all">all edges</option><option value="cm8">4 corners + 4 mid points (8)</option></select></label>' +
      '<label>Length (cm)<input id="mSize" type="number" step="any" placeholder="30"></label>' +
      '<label>Width (cm)<input id="mWid" type="number" step="any" placeholder="1"></label>' +
      '<label>Start (cm)<input id="mStart" type="number" step="any" placeholder="from corner"></label>' +
      '<label>End (cm)<input id="mEnd" type="number" step="any" placeholder="from corner"></label></div>' +
      '<div class="stu-row" style="margin-top:6px"><button class="stu-btn" id="mAdd">Add to spec</button></div>' +
      ((sp.x && sp.x.manual && sp.x.manual.length) ? '<div style="margin-top:6px">' + sp.x.manual.map(function(q, i){ return '<div class="stu-flag i">' + esc(q.f.name) + ' ×' + q.f.count + ' · ' + esc(q.f.edge) + ' · ' + esc(q.f.placement) + ' <a href="#" data-mdel="' + i + '" style="float:right;color:#b3261e">remove</a></div>'; }).join("") + '</div>' : '') + '</div>';
    h += '<div class="stu-card"><h4>2 · Spec (edit anything)</h4><div class="stu-grid">' +
      '<label>Article<select data-f="type">' + TYPES.map(function(x){ return '<option value="' + x[0] + '"' + (x[0] === t ? " selected" : "") + '>' + x[1] + '</option>'; }).join("") + '</select></label>' +
      '<label>Unit<select data-f="unit"><option' + (sp.unit === "cm" ? " selected" : "") + '>cm</option><option value="inch"' + (sp.unit === "inch" ? " selected" : "") + '>inch</option></select></label>' +
      '<label>' + (t === "pillow" ? "Length" : t === "bolster" ? "Length" : "Width") + '<input data-f="' + (t === "pillow" || t === "bolster" ? "L" : "W") + '" type="number" step="any" value="' + (t === "pillow" || t === "bolster" ? sp.L : sp.W) + '"></label>' +
      '<label>' + (t === "pillow" ? "Width" : t === "bolster" ? "Diameter" : "Length") + '<input data-f="' + (t === "pillow" ? "W" : t === "bolster" ? "W" : "L") + '" type="number" step="any" value="' + (t === "pillow" ? sp.W : t === "bolster" ? sp.W : sp.L) + '"></label>' +
      '<label>Fabric look<select data-f="fabric">' + ["plain", "washed", "napped", "waffle", "stripe", "check", "print"].map(function(x){ return '<option' + (sp.fabric === x ? " selected" : "") + '>' + x + '</option>'; }).join("") + '</select></label>' +
      '<label>Main colour<input data-f="color" type="color" value="' + toHex(sp.color) + '"></label>' +
      '<label>Colour 2 (pattern)<input data-f="color2p" type="color" value="' + toHex(sp.color2p || "#ffffff") + '"></label>' +
      '<label>Reverse colour<input data-f="color2" type="color" value="' + toHex(sp.color2 || sp.color) + '"></label>';
    if(t === "pillow" || t === "duvet") h += '<label>Closure<select data-f="closure">' + ["envelope", "zip", "button", "tie", "oxford"].map(function(x){ return '<option' + (sp.closure === x ? " selected" : "") + '>' + x + '</option>'; }).join("") + '</select></label><label>Flange (cm)<input data-f="flange" type="number" step="any" value="' + (sp.flange || 0) + '"></label>';
    if(t === "pillow") h += '<label>Flap length (cm)<input data-f="flap" type="number" step="any" value="' + (sp.flap || "") + '" placeholder="12"></label>';
    if(t === "duvet") h += '<label>Corner ties<select data-f="ties"><option value="0"' + (sp.ties !== "1" ? " selected" : "") + '>no</option><option value="1"' + (sp.ties === "1" ? " selected" : "") + '>yes</option></select></label>';
    if(t === "comforter") h += '<label>Quilting<select data-f="quilt">' + ["box", "channel", "diamond", "none"].map(function(x){ return '<option' + (sp.quilt === x ? " selected" : "") + '>' + x + '</option>'; }).join("") + '</select></label><label>Cell size<input data-f="cell" type="number" step="any" value="' + (sp.cell || 8) + '"></label><label>Fill (gsm)<input data-f="fill" type="number" step="any" value="' + (sp.fill || "") + '"></label>';
    if(t === "sheet" || t === "fitted") h += '<label>Pocket depth<input data-f="pocket" type="number" step="any" value="' + (sp.pocket || "") + '" placeholder="35"></label>';
    h += '<label>Two fabrics (front ≠ reverse)<select data-f="pcSeparate"><option value="0"' + (sp.pcSeparate !== "1" ? " selected" : "") + '>no</option><option value="1"' + (sp.pcSeparate === "1" ? " selected" : "") + '>yes</option></select></label><label>Reverse fabric look<select data-f="fabric2"><option value="">same</option>' + ["plain", "washed", "napped", "waffle", "stripe", "check", "print"].map(function(x){ return '<option' + (sp.fabric2 === x ? " selected" : "") + '>' + x + '</option>'; }).join("") + '</select></label>' +
      '<label>Hem / allowance note<input data-f="hem" value="' + esc(sp.hem || "") + '" placeholder="2.5 cm double fold"></label><label>Stitch density<input data-f="spi" value="' + esc(sp.spi || "") + '" placeholder="10-12 SPI"></label>' +
      '</div></div>';
    if(m.fxInfo && m.fxInfo.length) h += '<div class="stu-card" id="stuPts"><h4>Points — tap one to zoom + see its details</h4>' + m.fxInfo.map(function(x){ return '<div class="stu-flag i stu-fx" data-fx="' + x.i + '" style="cursor:pointer"><b>' + (x.i + 1) + '. ' + esc(x.f.name || x.kind) + (x.n > 1 ? ' ×' + x.n : '') + '</b> <small>' + (/both/.test(x.txt) ? 'FRONT + REVERSE' : /reverse/.test(x.txt) ? 'REVERSE' : 'FRONT') + '</small>' + (x.f.specText ? '' : '') + '</div>'; }).join("") + '</div>';
    h += '<div class="stu-card"><h4>Check against spec</h4><div id="stuFlags"></div></div>';
    h += '<div class="stu-card"><h4>Operations (tap one)</h4><div class="stu-steps">' + m.steps.map(function(s, i){ return '<div class="stu-step" data-i="' + i + '"><i>' + (i + 1) + '</i><div><b>' + esc(s.n) + '</b><small>' + esc(s.m) + '</small><div class="stu-exp"></div></div></div>'; }).join("") + '</div><div class="stu-row" style="margin-top:8px"><button class="stu-btn g" id="sPrev">‹ Prev</button><button class="stu-btn" id="sNext">Next ›</button></div></div>';
    h += '<div class="stu-card"><h4>Spec JSON (paste / copy)</h4><textarea id="spJson" rows="4" spellcheck="false"></textarea><div class="stu-row" style="margin-top:6px"><button class="stu-btn g" id="spApply">Apply JSON</button><button class="stu-btn g" id="spPng">Save picture</button></div></div>';
    if(S.empty){
      var cut = h.indexOf('<div id="spCo"></div></div>') + '<div id="spCo"></div></div>'.length;
      h = h.slice(0, cut) + '<div class="stu-card"><h4>Or start a blank article</h4><div class="stu-sub">Nothing is pre-loaded. Pick a product type and add the components yourself.</div><div class="stu-row">' + TYPES.map(function(x){ return '<button class="stu-btn g" data-bl="' + x[0] + '">' + x[1] + '</button>'; }).join("") + '</div></div><div style="display:none">' + h.slice(cut) + '</div>';
    }
    side.innerHTML = h;
    (function(){ var pc = side.querySelector("#stuPts"); if(pc && side.children[1]) side.insertBefore(pc, side.children[1]);
      if(S.fromSpec) side.querySelectorAll(".stu-card").forEach(function(c){ var h4 = c.querySelector("h4"), tx = h4 ? h4.textContent : ""; if(/^2 · Spec|^Spec JSON/.test(tx)) c.style.display = "none"; if(/^➕/.test(tx)){ var kids = [].slice.call(c.children).filter(function(k){ return k !== h4; }); kids.forEach(function(k){ k.style.display = "none"; }); h4.textContent = "➕ Something missing? Add it yourself ▸"; h4.style.cursor = "pointer"; h4.onclick = function(){ var open = kids[0] && kids[0].style.display === "none"; kids.forEach(function(k){ k.style.display = open ? "" : "none"; }); }; } }); })();
    side.querySelectorAll("[data-bl]").forEach(function(b){ b.onclick = function(){ var t_ = b.dataset.bl; S.fromSpec = false; S.type = t_; S.set = null; S.sp = Object.assign({}, DEFAULTS[t_], {type: t_, color: "#d9d3c4", fabric: "plain"}); setEmpty(false); mkTypes(); rebuild(); }; });
    $("spText").value = S.upText || ""; $("spText").oninput = function(){ S.upText = this.value; };
    var fl_ = function(){ $("spFiles").textContent = (S.upFiles || []).map(function(f){ return "📎 " + f.name; }).join("  "); }; fl_();
    $("spFile").onchange = function(){ S.upFiles = (S.upFiles || []).concat([].slice.call(this.files)); this.value = ""; fl_(); };
    $("spClr").onclick = function(){ S.upFiles = []; S.upText = ""; S.upStat = ""; $("spText").value = ""; fl_(); $("spStat").textContent = ""; };
    (function(){ var co = S.callouts || [], e = $("spCo"); if(!co.length || !e) return; e.innerHTML = '<details class="stu-co"><summary>Read from spec: ' + co.length + ' notes (check nothing is missing)</summary><ul>' + co.map(function(c){ return "<li><b>" + esc(c.where || "") + "</b> " + esc(c.text || "") + "</li>"; }).join("") + "</ul></details>"; })();
    (function(){
      var add = $("mAdd"); if(!add) return;
      $("mKind").onchange = function(){ var k = this.value; if(k === "tie"){ $("mCount").value = 8; $("mWhere").value = "cm8"; $("mSize").value = 30; $("mWid").value = 1; $("mPlace").value = "inside"; } else if(k === "zip"){ $("mCount").value = 1; $("mWhere").value = "foot"; $("mPlace").value = "outside"; } else if(k === "label"){ $("mPlace").value = "inside"; $("mWhere").value = "foot"; $("mSize").value = 6; } };
      add.onclick = function(){
        var k = $("mKind").value, wh = $("mWhere").value, cnt = Math.max(1, +$("mCount").value || 1), pl = $("mPlace").value, nz = function(id){ var v = parseFloat($(id).value); return isNaN(v) ? null : v; };
        var f = {kind: k, name: $("mName").value.trim() || ({tie: "Woven tie", zip: "Zipper", label: "Label", loop: "Loop", button: "Button", hem: "Hem", opening: "Opening", piping: "Piping", flange: "Flange", elastic: "Elastic", other: "Component"}[k]), count: cnt, edge: wh === "cm8" ? "all" : wh, placement: pl, panel: pl === "inside" ? "back" : "front", manual: true};
        if(wh === "cm8"){ f.spots = ["corner-tl", "corner-tr", "corner-bl", "corner-br", "head-mid", "left-mid", "right-mid", "foot-mid"].slice(0, Math.min(8, cnt)); if(cnt > 8) f.count = 8; }
        var sz = nz("mSize"), wd = nz("mWid"), st = nz("mStart"), en = nz("mEnd"); if(sz != null){ f.sizeCm = sz; f.lengthCm = sz; } if(wd != null) f.widthCm = wd; if(st != null) f.startCm = st; if(en != null) f.endCm = en;
        f.specText = "Added manually";
        sp.x = sp.x || {features: [], ops: [], missing: [], notes: []}; sp.x.manual = (sp.x.manual || []).concat([{f: f}]);
        rebuild(); if(S.set2d) S.set2d(S.v2d);
      };
      side.querySelectorAll("[data-mdel]").forEach(function(a){ a.onclick = function(e){ e.preventDefault(); sp.x.manual.splice(+a.dataset.mdel, 1); rebuild(); }; });
    })();
    $("spRead").onclick = readSpec; if(S.upStat){ $("spStat").textContent = S.upStat; $("spStat").style.color = S.upBad ? "#b3261e" : "#2F5A1A"; }
    var jb = $("spJson"); jb.value = JSON.stringify(S.sp);
    flags();
    var ap = $("aProg"), asz = $("aSize"), acl = $("aCol");
    function fillOpts(prog, sz, cl){
      var szs = {}, cls = {}; rows.forEach(function(r){ if(r.n === prog){ if(r.z) szs[r.z] = 1; if(r.c) cls[r.c] = 1; } });
      asz.innerHTML = '<option value="">—</option>' + Object.keys(szs).map(function(z){ return '<option>' + esc(z) + '</option>'; }).join("");
      acl.innerHTML = '<option value="">—</option>' + Object.keys(cls).map(function(z){ return '<option>' + esc(z) + '</option>'; }).join("");
      ap.value = prog || ""; asz.value = sz || ""; acl.value = cl || "";
    }
    var au = S.sp.auto; if(au && ap) fillOpts(au.ap, au.sz, au.cl);
    if(ap){ ap.onchange = function(){ if(!ap.value) return; fillOpts(ap.value, "", ""); applyAuto(); }; asz.onchange = acl.onchange = applyAuto; }
    function applyAuto(){ if(!ap.value) return; var keep = {ap: ap.value, sz: asz.value, cl: acl.value}; var spn = inferSpec(keep.ap, keep.sz, keep.cl); S.type = spn.type; S.sp = spn; S.sp.auto = keep; mkTypes(); rebuild(); }
    side.querySelectorAll("[data-f]").forEach(function(inp){ inp.onchange = inp.oninput = function(){
      var f = inp.dataset.f, v = inp.value;
      if(f === "type"){ S.type = v; S.sp = Object.assign({}, DEFAULTS[v], {type: v, color: S.sp.color, color2: S.sp.color2, color2p: S.sp.color2p, fabric: S.sp.fabric, fabric2: S.sp.fabric2, colorName: S.sp.colorName}); rebuild(); return; }
      S.sp[f] = v; if(f === "color") S.sp.colorName = ""; S.model = mkModel(S.type, Object.assign({}, S.sp)); S.dist = Math.max(S.dist, S.model.R * 1.2); S.dirty = 1; flags(); $("spJson").value = JSON.stringify(S.sp); setStep(S.step, true); redrawStepsOnly(); animate();
    }; });
    side.querySelectorAll(".stu-step").forEach(function(e){ e.onclick = function(){ setStep(+e.dataset.i); }; e.onmouseenter = function(){ if(S.step !== +e.dataset.i) previewStep(+e.dataset.i); }; e.onmouseleave = function(){ if(S.step !== +e.dataset.i) restoreHi(); }; });
    side.querySelectorAll(".stu-fx").forEach(function(e){ e.onclick = function(){ selectFeature(+e.dataset.fx); }; });
    if(S.step >= 0 && S.model.steps[S.step]){ var sel_ = side.querySelector('.stu-step[data-i="' + S.step + '"]'); if(sel_){ sel_.classList.add("on"); } }
    $("sPrev").onclick = function(){ setStep(Math.max(-1, S.step - 1)); }; $("sNext").onclick = function(){ setStep(Math.min(S.model.steps.length - 1, S.step + 1)); };
    $("spApply").onclick = function(){ try{ var j = JSON.parse($("spJson").value); if(!BUILD[j.type]) throw 0; setEmpty(false); mkTypes(); S.type = j.type; S.sp = Object.assign({}, DEFAULTS[j.type], j); rebuild(); }catch(e){ yqAsk('',{title:'JSON not valid',alert:1}); } };
    $("spPng").onclick = function(){ draw(); var a = document.createElement("a"); a.href = cv.toDataURL("image/png"); a.download = "YQI_3D_" + S.type + ".png"; a.click(); };
  }
  function redrawStepsOnly(){ var m = S.model; root.querySelectorAll(".stu-step").forEach(function(e, i){ var s = m.steps[i]; if(s){ e.querySelector("b").textContent = s.n; e.querySelector("small").textContent = s.m; } }); }
  function flags(){
    var m = S.model, f = (m.flags || []).slice(), sp = S.sp;
    if(!sp.spi) f.push(["i", "Stitch density (SPI) not in spec — 10–12 SPI shown as default."]);
    if(!sp.hem && S.type !== "comforter" && S.type !== "bolster") f.push(["i", "Hem width not in spec — 2.5 cm double fold used."]);
    f.push(["i", "Seam allowance 1 cm default — change if the spec says otherwise."]);
    if(/fresh leaf/i.test((sp.auto && sp.auto.ap) || "")) f.push(["w", "Fresh Leaf is a printed design: print direction is length-wise, pieces must not be turned."]);
    var fl = $("stuFlags"); if(fl) fl.innerHTML = f.map(function(x){ return '<div class="stu-flag ' + x[0] + '">' + esc(x[1]) + '</div>'; }).join("");
  }
  function toHex(c){ if(/^#[0-9a-f]{6}$/i.test(c)) return c; if(/^#[0-9a-f]{3}$/i.test(c)) return "#" + c[1] + c[1] + c[2] + c[2] + c[3] + c[3]; return "#d9d3c4"; }
  function setEmpty(v){ S.empty = !!v; var h_ = root.querySelector(".stu-hud"); if(h_) h_.style.display = S.empty ? "none" : ""; var c_ = $("stuCap"); if(c_) c_.style.display = S.empty ? "none" : ""; S.dirty = 1; }
  function mkTypes(){ var t = $("stuTypes"); if(S.empty){ t.innerHTML = ""; return; }
    if(S.set && S.set.length){ t.innerHTML = S.set.map(function(x, i){ return '<button class="stu-chip' + (i === S.si ? " on" : "") + '" data-i="' + i + '">' + esc(x.title || (TYPES.filter(function(q){ return q[0] === x.type; })[0] || [0, x.type])[1]) + '</button>'; }).join(" ") + ' <button class="stu-chip" data-i="x">✕ close set</button>';
      t.querySelectorAll("button").forEach(function(b){ b.onclick = function(){ if(b.dataset.i === "x"){ S.set = null; S.sp = Object.assign({}, DEFAULTS[S.type], {type: S.type, color: S.sp.color, fabric: S.sp.fabric}); setEmpty(true); mkTypes(); rebuild(); return; } S.si = +b.dataset.i; S.sp = S.set[S.si]; S.type = S.sp.type; mkTypes(); rebuild(); }; }); return; }
    t.innerHTML = TYPES.map(function(x){ return '<button class="stu-chip' + (x[0] === S.type ? " on" : "") + '" data-t="' + x[0] + '">' + x[1] + '</button>'; }).join(" "); t.querySelectorAll("button").forEach(function(b){ b.onclick = function(){ S.type = b.dataset.t; S.sp = Object.assign({}, DEFAULTS[S.type], {type: S.type, color: S.sp.color, color2: S.sp.color2, color2p: S.sp.color2p, fabric: S.sp.fabric, colorName: S.sp.colorName}); mkTypes(); rebuild(); }; }); }
  setEmpty(true); mkTypes(); resize(); S.auto = 0; rebuild(); frame();
  window.__stu = S; S.rebuild = rebuild; S.setStep = setStep; S.api = {inferSpec: inferSpec, applyExtract: applyExtract, readSpec: readSpec};
  return S;
}
window.STU = {mount: function(el, opts){ if(el.__stu) return el.__stu; el.__stu = Studio(el, opts); return el.__stu; }, build: BUILD, inferSpec: inferSpec};
})();
