// YQI Excel reader — opens an .xlsx the way Excel shows it: column widths, row heights, merged cells,
// fonts, fills, borders, alignment, and every picture placed on its own cells (not piled on top).
// Standalone script (loaded on demand by app.js and bsd.js). Exposes window.YQXL.open(host, buf, XLSX).
(function(){
"use strict";
var IDX = ["000000","FFFFFF","FF0000","00FF00","0000FF","FFFF00","FF00FF","00FFFF","000000","FFFFFF","FF0000","00FF00","0000FF","FFFF00","FF00FF","00FFFF","800000","008000","000080","808000","800080","008080","C0C0C0","808080","9999FF","993366","FFFFCC","CCFFFF","660066","FF8080","0066CC","CCCCFF","000080","FF00FF","FFFF00","00FFFF","800080","800000","008080","0000FF","00CCFF","CCFFFF","CCFFCC","FFFF99","99CCFF","FF99CC","CC99FF","FFCC99","3366FF","33CCCC","99CC00","FFCC00","FF9900","FF6600","666699","969696","003366","339966","003300","333300","993300","993366","333399","333333"];
function esc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
// ---- zip ----
function zList(buf){ var dv = new DataView(buf), u8 = new Uint8Array(buf), e = u8.length - 22, out = {}; while(e > 0 && dv.getUint32(e, true) !== 0x06054b50) e--; if(e <= 0) throw new Error("Not an .xlsx file");
  var n = dv.getUint16(e + 10, true), p = dv.getUint32(e + 16, true), td = new TextDecoder();
  for(var i = 0; i < n; i++){ var fl = dv.getUint16(p + 28, true), xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true); out[td.decode(u8.subarray(p + 46, p + 46 + fl))] = {meth: dv.getUint16(p + 10, true), cs: dv.getUint32(p + 20, true), lo: dv.getUint32(p + 42, true)}; p += 46 + fl + xl + cl; } return out; }
function zStream(buf, e){ var dv = new DataView(buf), st = e.lo + 30 + dv.getUint16(e.lo + 26, true) + dv.getUint16(e.lo + 28, true), b = new Blob([new Uint8Array(buf, st, e.cs)]); return e.meth === 0 ? b.stream() : b.stream().pipeThrough(new DecompressionStream("deflate-raw")); }
function kids(el, name){ var o = []; if(!el) return o; for(var c = el.firstElementChild; c; c = c.nextElementSibling) if(c.localName === name) o.push(c); return o; }
function kid(el, name){ return kids(el, name)[0] || null; }
function all(el, name){ return el ? Array.prototype.slice.call(el.getElementsByTagNameNS("*", name)) : []; }
function rAttr(el, name){ if(!el) return null; for(var i = 0; i < el.attributes.length; i++){ var a = el.attributes[i]; if(a.localName === name && a.prefix) return a.value; } return el.getAttribute(name); }
function dirOf(p){ return p.replace(/[^\/]*$/, ""); }
function norm(p){ var o = []; p.split("/").forEach(function(s){ if(s === "..") o.pop(); else if(s && s !== ".") o.push(s); }); return o.join("/"); }
async function parse(buf){
  var E = zList(buf), P = new DOMParser(), cache = {};
  var txt = async function(n){ var e = E[n]; if(!e) return null; return new Response(zStream(buf, e)).text(); };
  var xml = async function(n){ if(n in cache) return cache[n]; var t = await txt(n); return (cache[n] = t ? P.parseFromString(t, "application/xml") : null); };
  var rels = async function(part){ var d = await xml(dirOf(part) + "_rels/" + part.split("/").pop() + ".rels"), m = {}; all(d, "Relationship").forEach(function(r){ var t = r.getAttribute("Target") || ""; m[r.getAttribute("Id")] = {type: r.getAttribute("Type") || "", path: r.getAttribute("TargetMode") === "External" ? "" : (t.charAt(0) === "/" ? t.slice(1) : norm(dirOf(part) + t))}; }); return m; };
  // theme colours (Excel order: lt1, dk1, lt2, dk2, accent1..6, hlink, folHlink)
  var TH = ["FFFFFF", "000000", "E7E6E6", "44546A", "4472C4", "ED7D31", "A5A5A5", "FFC000", "5B9BD5", "70AD47", "0563C1", "954F72"];
  var wr = await rels("xl/workbook.xml"), thp = Object.keys(wr).map(function(k){ return wr[k]; }).filter(function(r){ return /theme$/.test(r.type); })[0];
  if(thp){ var td = await xml(thp.path), cs = all(td, "clrScheme")[0]; if(cs){ var g = function(n){ var el = kid(cs, n); if(!el) return null; var c = el.firstElementChild; return c ? (c.getAttribute("lastClr") || c.getAttribute("val")) : null; }; var ord = ["lt1", "dk1", "lt2", "dk2", "accent1", "accent2", "accent3", "accent4", "accent5", "accent6", "hlink", "folHlink"]; ord.forEach(function(n, i){ var v = g(n); if(v && /^[0-9A-F]{6}$/i.test(v)) TH[i] = v.toUpperCase(); }); } }
  var tint = function(hex, t){ if(!t) return hex; var n = parseInt(hex, 16), rgb = [n >> 16 & 255, n >> 8 & 255, n & 255].map(function(c){ return Math.round(t < 0 ? c * (1 + t) : c + (255 - c) * t); }); return rgb.map(function(c){ return ("0" + Math.max(0, Math.min(255, c)).toString(16)).slice(-2); }).join(""); };
  var col = function(el){ if(!el) return null; if(el.getAttribute("auto") === "1") return null; var t = parseFloat(el.getAttribute("tint") || 0), v;
    if(el.hasAttribute("rgb")){ v = el.getAttribute("rgb"); v = v.length === 8 ? v.slice(2) : v; } else if(el.hasAttribute("theme")) v = TH[+el.getAttribute("theme")] || null; else if(el.hasAttribute("indexed")){ var ix = +el.getAttribute("indexed"); v = ix === 64 ? null : IDX[ix] || null; }
    return v ? "#" + tint(v.toUpperCase(), t) : null; };
  // styles
  var st = await xml("xl/styles.xml"), S = {xf: []};
  if(st){ var fonts = kids(kid(st.documentElement, "fonts"), "font").map(function(f){ var o = {}; if(kid(f, "b") && kid(f, "b").getAttribute("val") !== "0") o.b = 1; if(kid(f, "i") && kid(f, "i").getAttribute("val") !== "0") o.i = 1; if(kid(f, "u") && kid(f, "u").getAttribute("val") !== "none") o.u = 1; if(kid(f, "strike") && kid(f, "strike").getAttribute("val") !== "0") o.s = 1; var sz = kid(f, "sz"); if(sz) o.sz = parseFloat(sz.getAttribute("val")); var c = col(kid(f, "color")); if(c) o.c = c; var nm = kid(f, "name"); if(nm) o.f = nm.getAttribute("val"); return o; });
    var fills = kids(kid(st.documentElement, "fills"), "fill").map(function(f){ var p = kid(f, "patternFill"); if(p && p.getAttribute("patternType") && p.getAttribute("patternType") !== "none") return col(kid(p, "fgColor")) || col(kid(p, "bgColor")) || null; var gr = kid(f, "gradientFill"); if(gr){ var s0 = all(gr, "color")[0]; return col(s0); } return null; });
    var BW = {thin: 1, hair: 1, dotted: 1, dashed: 1, dashDot: 1, dashDotDot: 1, medium: 2, mediumDashed: 2, mediumDashDot: 2, mediumDashDotDot: 2, slantDashDot: 2, thick: 3, double: 3};
    var borders = kids(kid(st.documentElement, "borders"), "border").map(function(b){ var o = {}; ["left", "right", "top", "bottom"].forEach(function(s){ var e = kid(b, s), t = e && e.getAttribute("style"); if(t && t !== "none") o[s] = (BW[t] || 1) + "px " + (t === "double" ? "double" : /dot/i.test(t) ? "dotted" : /dash/i.test(t) ? "dashed" : "solid") + " " + (col(kid(e, "color")) || "#000"); }); return o; });
    S.xf = kids(kid(st.documentElement, "cellXfs"), "xf").map(function(x){ var al = kid(x, "alignment") || {getAttribute: function(){ return null; }}; return {font: fonts[+x.getAttribute("fontId") || 0] || {}, fill: fills[+x.getAttribute("fillId") || 0] || null, bd: borders[+x.getAttribute("borderId") || 0] || {}, h: al.getAttribute("horizontal"), v: al.getAttribute("vertical"), wrap: al.getAttribute("wrapText") === "1" || al.getAttribute("wrapText") === "true", rot: +al.getAttribute("textRotation") || 0, ind: +al.getAttribute("indent") || 0}; });
    S.def = fonts[0] || {}; }
  // sheets
  var wbd = await xml("xl/workbook.xml"), out = {styles: S, sheets: {}};
  var sheets = all(wbd, "sheet");
  for(var i = 0; i < sheets.length; i++){ var sh = sheets[i], nm = sh.getAttribute("name"), rr = wr[rAttr(sh, "id")]; if(!rr || !rr.path) continue;
    var sd = await xml(rr.path), M = {xf: {}, pics: [], dcw: null, drh: null, grid: true}; out.sheets[nm] = M; if(!sd) continue;
    var sv = all(sd, "sheetView")[0]; if(sv && sv.getAttribute("showGridLines") === "0") M.grid = false;
    var fp = all(sd, "sheetFormatPr")[0]; if(fp){ if(fp.getAttribute("defaultRowHeight")) M.drh = parseFloat(fp.getAttribute("defaultRowHeight")); if(fp.getAttribute("defaultColWidth")) M.dcw = parseFloat(fp.getAttribute("defaultColWidth")); else if(fp.getAttribute("baseColWidth")) M.dcw = parseFloat(fp.getAttribute("baseColWidth")) + 0.71; }
    all(sd, "row").forEach(function(r){ if(r.getAttribute("s") && r.getAttribute("customFormat") === "1") M.xf["row" + (+r.getAttribute("r") - 1)] = +r.getAttribute("s"); });
    all(sd, "c").forEach(function(c){ var s = c.getAttribute("s"); if(s && s !== "0") M.xf[c.getAttribute("r")] = +s; });
    M.colxf = []; all(sd, "col").forEach(function(c){ var s = c.getAttribute("style"); if(!s || s === "0") return; for(var k = +c.getAttribute("min"); k <= +c.getAttribute("max") && k < 400; k++) M.colxf[k - 1] = +s; });
    var sr = await rels(rr.path), drs = Object.keys(sr).map(function(k){ return sr[k]; }).filter(function(r){ return /\/drawing$/.test(r.type); });
    for(var di = 0; di < drs.length; di++){ var dd = await xml(drs[di].path); if(!dd) continue; var dr = await rels(drs[di].path), root = dd.documentElement;
      for(var a = root.firstElementChild; a; a = a.nextElementSibling){ if(!/Anchor$/.test(a.localName)) continue; var blip = all(a, "blip")[0]; if(!blip) continue; var emb = rAttr(blip, "embed"), m = emb && dr[emb]; if(!m || !m.path || !E[m.path]) continue;
        var pt = function(el){ return el ? {c: +(kid(el, "col") || {}).textContent || 0, co: +(kid(el, "colOff") || {}).textContent / 9525 || 0, r: +(kid(el, "row") || {}).textContent || 0, ro: +(kid(el, "rowOff") || {}).textContent / 9525 || 0} : null; };
        var ext = kid(a, "ext"), pos = kid(a, "pos"), xf = all(a, "xfrm")[0], xe = xf && kid(xf, "ext");
        var p = {path: m.path, kind: a.localName, from: pt(kid(a, "from")), to: pt(kid(a, "to"))};
        if(ext) p.w = +ext.getAttribute("cx") / 9525, p.h = +ext.getAttribute("cy") / 9525; else if(xe) p.w = +xe.getAttribute("cx") / 9525, p.h = +xe.getAttribute("cy") / 9525;
        if(pos) p.x = +pos.getAttribute("x") / 9525, p.y = +pos.getAttribute("y") / 9525;
        M.pics.push(p); if(M.pics.length > 300) break; } } }
  // picture data → object URLs (shared across sheets)
  var urls = {}, mime = function(n){ var x = (n.split(".").pop() || "").toLowerCase(); return x === "png" ? "image/png" : x === "gif" ? "image/gif" : x === "bmp" ? "image/bmp" : /jpe?g/.test(x) ? "image/jpeg" : x === "svg" ? "image/svg+xml" : x === "webp" ? "image/webp" : x === "emf" || x === "wmf" ? "" : "application/octet-stream"; };
  for(var sn in out.sheets){ var pl = out.sheets[sn].pics; for(var q = 0; q < pl.length; q++){ var pp = pl[q].path; if(!(pp in urls)){ var mt = mime(pp); urls[pp] = mt ? URL.createObjectURL(new Blob([await new Response(zStream(buf, E[pp])).arrayBuffer()], {type: mt})) : ""; } pl[q].url = urls[pp]; } }
  out.urls = urls; return out; }
// ---- render ----
var CSS = '.yqxl{position:relative;display:inline-block;background:#fff;color:#000;font-family:Calibri,Carlito,Arial,sans-serif;font-size:14.6px;transform-origin:0 0}.yqxl table{table-layout:fixed;border-collapse:collapse;background:#fff}.yqxl td,.yqxl th{padding:0;overflow:hidden;vertical-align:bottom;box-sizing:border-box}.yqxl th{background:#f3f3f3;color:#555;font:11px Arial,sans-serif;font-weight:400;text-align:center;vertical-align:middle;border:1px solid #d4d4d4;position:sticky}.yqxl thead th{top:0;z-index:3}.yqxl tbody th{left:0;z-index:2}.yqxl td>div{overflow:hidden;padding:0 3px;line-height:1.2;box-sizing:border-box;display:flex;flex-direction:column}.yqxl img.xp{position:absolute;z-index:1;pointer-events:auto;cursor:zoom-in}.yqxlbar{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:8px}.yqxlbar button{border:1px solid rgba(128,128,128,.4);background:rgba(128,128,128,.12);color:inherit;border-radius:8px;padding:5px 10px;font:inherit;font-size:13px;cursor:pointer}.yqxlbar button.on{background:#2f7d4a;color:#fff;border-color:#2f7d4a}.yqxlsc{overflow:auto;max-height:72vh;border:1px solid rgba(128,128,128,.3);border-radius:8px;background:#fff;-webkit-overflow-scrolling:touch}.yqxlz{position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:99999;display:flex;align-items:center;justify-content:center;cursor:zoom-out}.yqxlz img{max-width:96vw;max-height:94vh;background:#fff}';
function colName(c){ var s = ""; c++; while(c > 0){ var m = (c - 1) % 26; s = String.fromCharCode(65 + m) + s; c = Math.floor((c - 1) / 26); } return s; }
function cellCss(x, def, isNum){ if(!x) return {td: "", dv: isNum ? "align-items:flex-end;justify-content:flex-end;" : "justify-content:flex-end;", nowrap: true};
  var f = x.font || {}, td = "", dv = "", h = x.h, v = x.v || "bottom";
  if(x.fill) td += "background:" + x.fill + ";";
  ["left", "right", "top", "bottom"].forEach(function(s){ if(x.bd[s]) td += "border-" + s + ":" + x.bd[s] + ";"; });
  if(f.b) dv += "font-weight:700;"; if(f.i) dv += "font-style:italic;"; if(f.u || f.s) dv += "text-decoration:" + (f.u ? "underline " : "") + (f.s ? "line-through" : "") + ";";
  if(f.sz && f.sz !== def.sz) dv += "font-size:" + (f.sz * 4 / 3).toFixed(1) + "px;"; else if(f.sz) dv += "font-size:" + (f.sz * 4 / 3).toFixed(1) + "px;";
  if(f.c) dv += "color:" + f.c + ";"; if(f.f && f.f !== def.f) dv += "font-family:'" + f.f.replace(/'/g, "") + "',Calibri,Arial,sans-serif;";
  if(!h || h === "general") h = isNum ? "right" : "left";
  dv += "align-items:" + (h === "center" || h === "centerContinuous" ? "center" : h === "right" ? "flex-end" : "flex-start") + ";text-align:" + (h === "centerContinuous" ? "center" : h === "justify" || h === "distributed" ? "justify" : h === "fill" ? "left" : h) + ";";
  dv += "justify-content:" + (v === "top" ? "flex-start" : v === "center" ? "center" : "flex-end") + ";";
  if(x.ind) dv += "padding-" + (h === "right" ? "right" : "left") + ":" + (3 + x.ind * 9) + "px;";
  if(x.rot === 90 || x.rot === 180 || x.rot === 255) dv += "writing-mode:vertical-rl;" + (x.rot === 90 ? "transform:rotate(180deg);" : "");
  return {td: td, dv: dv, nowrap: !x.wrap}; }
function draw(host, X, ws, M, S){
  var ref = ws && ws["!ref"] ? X.utils.decode_range(ws["!ref"]) : {s: {r: 0, c: 0}, e: {r: 0, c: 0}}, R1 = ref.e.r, C1 = ref.e.c;
  (M.pics || []).forEach(function(p){ var t = p.to || p.from; if(t){ R1 = Math.max(R1, t.r + 1); C1 = Math.max(C1, t.c + 1); } });
  (ws["!merges"] || []).forEach(function(m){ R1 = Math.max(R1, m.e.r); C1 = Math.max(C1, m.e.c); });
  var R0 = 0, C0 = 0, RMAX = Math.min(R1, 2999), CMAX = Math.min(C1, 199), cut = R1 > RMAX || C1 > CMAX;
  var dcw = M.dcw || 8.43, cols = ws["!cols"] || [], rows = ws["!rows"] || [], CW = [], RH = [];
  for(var c = 0; c <= CMAX; c++){ var cc = cols[c]; CW[c] = cc && cc.hidden ? 0 : Math.round(cc && cc.wpx ? cc.wpx : cc && cc.wch ? cc.wch * 7 + 5 : cc && cc.width ? cc.width * 7 : dcw * 7 + 5); }
  var drh = (M.drh || 15) * 4 / 3;
  for(var r = 0; r <= RMAX; r++){ var rr = rows[r]; RH[r] = rr && rr.hidden ? 0 : Math.round(rr && rr.hpx ? rr.hpx : rr && rr.hpt ? rr.hpt * 4 / 3 : drh); }
  var MG = {}, COV = {}; (ws["!merges"] || []).forEach(function(m){ MG[m.s.r + "," + m.s.c] = m; for(var r2 = m.s.r; r2 <= m.e.r; r2++) for(var c2 = m.s.c; c2 <= m.e.c; c2++) if(r2 !== m.s.r || c2 !== m.s.c) COV[r2 + "," + c2] = 1; });
  var def = S.def || {}, HW = 38, HH = 20, h = [], tw = HW;
  for(c = 0; c <= CMAX; c++) tw += CW[c];
  h.push('<div class="yqxl"><table style="width:' + tw + 'px"><colgroup><col style="width:' + HW + 'px">');
  for(c = 0; c <= CMAX; c++) h.push('<col style="width:' + CW[c] + 'px">');
  h.push('</colgroup><thead><tr style="height:' + HH + 'px"><th></th>');
  for(c = 0; c <= CMAX; c++) h.push('<th>' + (CW[c] ? colName(c) : "") + '</th>');
  h.push('</tr></thead><tbody>');
  var grid = M.grid ? "1px solid #e2e2e2" : "1px solid transparent";
  for(r = 0; r <= RMAX; r++){ h.push('<tr style="height:' + RH[r] + 'px' + (RH[r] ? "" : ";display:none") + '"><th>' + (r + 1) + '</th>');
    for(c = 0; c <= CMAX; c++){ var k = r + "," + c; if(COV[k]) continue; var addr = X.utils.encode_cell({r: r, c: c}), cell = ws[addr], m = MG[k], sp = "", ht = RH[r], wd = CW[c];
      if(m){ var re = Math.min(m.e.r, RMAX), ce = Math.min(m.e.c, CMAX); sp = (re > r ? ' rowspan="' + (re - r + 1) + '"' : "") + (ce > c ? ' colspan="' + (ce - c + 1) + '"' : ""); ht = 0; for(var q = r; q <= re; q++) ht += RH[q]; wd = 0; for(q = c; q <= ce; q++) wd += CW[q]; }
      var xi = M.xf[addr]; if(xi == null) xi = M.xf["row" + r]; if(xi == null) xi = (M.colxf || [])[c];
      var isNum = cell && (cell.t === "n" || cell.t === "d"), cs = cellCss(xi != null ? S.xf[xi] : null, def, isNum), txt = "";
      if(cell){ try{ txt = X.utils.format_cell(cell); }catch(e){ txt = cell.w || cell.v || ""; } if(cell.t === "e") txt = cell.w || "#ERR"; }
      var long = !cs.nowrap ? "" : "white-space:nowrap;";
      h.push('<td' + sp + ' style="border:' + grid + ';' + cs.td + '"><div style="height:' + Math.max(0, ht - 1) + 'px;max-width:' + wd + 'px;' + long + (cs.nowrap ? "" : "white-space:pre-wrap;word-break:break-word;") + cs.dv + '">' + (txt === "" ? "" : '<span>' + esc(txt) + '</span>') + '</div></td>'); }
    h.push('</tr>'); }
  h.push('</tbody></table></div>');
  host.innerHTML = (cut ? '<div style="font:12px Arial;color:#a55;padding:4px 6px">Very large sheet — first ' + (RMAX + 1) + ' rows × ' + (CMAX + 1) + ' columns shown. Download for the full file.</div>' : "") + h.join("");
  var wrap = host.querySelector(".yqxl"), tb = wrap.querySelector("table"), trs = tb.tBodies[0].rows, ths = tb.tHead.rows[0].cells;
  var rowTop = function(r){ var tr = trs[Math.min(r, trs.length - 1)]; if(r > RMAX){ var y = tr.offsetTop + tr.offsetHeight; for(var q = RMAX + 1; q < r; q++) y += drh; return y; } return tr.offsetTop; };
  var colLeft = function(c){ if(c > CMAX){ var t = ths[ths.length - 1]; return t.offsetLeft + t.offsetWidth + (c - CMAX - 1) * (dcw * 7 + 5); } return ths[c + 1].offsetLeft; };
  var frag = document.createDocumentFragment();
  (M.pics || []).forEach(function(p){ if(!p.url) return; var x, y, w, hh;
    if(p.kind === "absoluteAnchor"){ x = HW + (p.x || 0); y = HH + (p.y || 0); w = p.w; hh = p.h; }
    else { x = colLeft(p.from.c) + p.from.co; y = rowTop(p.from.r) + p.from.ro;
      if(p.kind === "twoCellAnchor" && p.to){ w = colLeft(p.to.c) + p.to.co - x; hh = rowTop(p.to.r) + p.to.ro - y; if(!(w > 2) || !(hh > 2)){ w = p.w; hh = p.h; } } else { w = p.w; hh = p.h; } }
    if(!(w > 0) || !(hh > 0)) return;
    var im = document.createElement("img"); im.className = "xp"; im.src = p.url; im.alt = ""; im.style.cssText = "left:" + x + "px;top:" + y + "px;width:" + w + "px;height:" + hh + "px"; frag.appendChild(im); });
  wrap.appendChild(frag);
  wrap.addEventListener("click", function(e){ var t = e.target; if(t.className !== "xp") return; var z = document.createElement("div"); z.className = "yqxlz"; z.innerHTML = '<img src="' + t.src + '">'; z.onclick = function(){ z.remove(); }; document.body.appendChild(z); });
  return wrap; }
function css(){ if(document.getElementById("yqxlcss")) return; var s = document.createElement("style"); s.id = "yqxlcss"; s.textContent = CSS; document.head.appendChild(s); }
// open(host, ArrayBuffer, XLSX) → renders sheet tabs + the sheet exactly as laid out in Excel
async function open(host, buf, X, o){ o = o || {}; css();
  var wb = X.read(buf, {type: "array", cellDates: true, cellStyles: true}), meta = {styles: {xf: []}, sheets: {}};
  try{ meta = await parse(buf); }catch(e){}
  var names = wb.SheetNames.filter(function(n){ var ws = wb.Sheets[n]; return !(wb.Workbook && wb.Workbook.Sheets && (wb.Workbook.Sheets.filter(function(s){ return s.name === n; })[0] || {}).Hidden); });
  if(!names.length) names = wb.SheetNames.slice();
  var z = +(o.zoom || (window.innerWidth < 700 ? 0.7 : 1));
  host.innerHTML = '<div class="yqxlbar">' + (names.length > 1 ? names.map(function(n){ return '<button data-xs="' + esc(n) + '">' + esc(n) + '</button>'; }).join("") : "") + '<span style="flex:1"></span><button data-xz="-">&minus;</button><span class="xzv" style="font-size:12px;min-width:38px;text-align:center"></span><button data-xz="+">+</button><button data-xz="f">Fit</button></div><div class="yqxlsc"><div class="xin"></div></div>';
  var sc = host.querySelector(".yqxlsc"), inn = host.querySelector(".xin"), cur = names[0], wrap = null;
  var setZ = function(v){ z = Math.max(0.25, Math.min(3, v)); if(wrap) wrap.style.zoom = z; host.querySelector(".xzv").textContent = Math.round(z * 100) + "%"; };
  var show = function(n){ cur = n; var ws = wb.Sheets[n]; if(!ws){ inn.innerHTML = '<div style="padding:20px;color:#666">Empty sheet</div>'; return; }
    if(ws["!type"] === "chart" || !ws["!ref"] && !(meta.sheets[n] && meta.sheets[n].pics.length)){ inn.innerHTML = '<div style="padding:20px;color:#666">Empty sheet</div>'; }
    else wrap = draw(inn, X, ws, meta.sheets[n] || {xf: {}, pics: []}, meta.styles || {xf: []});
    setZ(z); sc.scrollTop = 0; sc.scrollLeft = 0;
    host.querySelectorAll("[data-xs]").forEach(function(b){ b.classList.toggle("on", b.getAttribute("data-xs") === n); }); };
  host.querySelectorAll("[data-xs]").forEach(function(b){ b.onclick = function(){ show(b.getAttribute("data-xs")); }; });
  host.querySelectorAll("[data-xz]").forEach(function(b){ b.onclick = function(){ var a = b.getAttribute("data-xz"); if(a === "+") setZ(z + 0.15); else if(a === "-") setZ(z - 0.15); else if(wrap){ wrap.style.zoom = 1; setZ(Math.min(1.5, (sc.clientWidth - 4) / (wrap.getBoundingClientRect().width || 1))); } }; });
  show(cur);
  return {wb: wb, show: show, destroy: function(){ Object.keys(meta.urls || {}).forEach(function(k){ try{ URL.revokeObjectURL(meta.urls[k]); }catch(e){} }); }}; }
window.YQXL = {open: open, parse: parse};
})();
