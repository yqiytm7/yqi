//@yqi-piece 0001
// ---------- Data & export: every list in the app, one place, Excel or CSV ----------
var XLSXURL = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js", XLSXP = null;
function needXlsx(){ if(window.XLSX) return Promise.resolve(window.XLSX); if(!XLSXP) XLSXP = loadJs(XLSXURL).then(function(){ return window.XLSX; }, function(e){ XLSXP = null; throw e; }); return XLSXP; }
window.yqNeedXlsx = needXlsx;
// Every Excel file YQI generates carries this same branded cover sheet, so any download — on this device or shared onward — is recognizably a YQI report.
function xlBook(X, sheets, title){
  var wb = X.utils.book_new(), now = new Date(), when = dmy(ymd(now)) + " " + ("0" + now.getHours()).slice(-2) + ":" + ("0" + now.getMinutes()).slice(-2);
  var cover = [["YQI — Yunus Quality Intelligence"], ["Quality Assurance Management System"], [], ["Report", title || "Export"], ["Generated", when], ["Developed by", "Hamza Khan"], [], ["Sheet", "Rows"]]
    .concat(sheets.map(function(sh){ return [sh[0], (sh[1] || []).length]; }));
  var cw = X.utils.aoa_to_sheet(cover);
  cw["!cols"] = [{wch: 30}, {wch: 36}];
  cw["!merges"] = [{s: {r: 0, c: 0}, e: {r: 0, c: 1}}, {s: {r: 1, c: 0}, e: {r: 1, c: 1}}];
  X.utils.book_append_sheet(wb, cw, "YQI");
  sheets.forEach(function(sh){ X.utils.book_append_sheet(wb, X.utils.json_to_sheet(sh[1].length ? sh[1] : [{Note: "No rows"}]), sh[0].slice(0, 31)); });
  return wb;
}
var EXJSURL = "https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js", EXJP = null, YQLOGO64 = null;
function needExcelJs(){ if(window.ExcelJS) return Promise.resolve(window.ExcelJS); if(!EXJP) EXJP = loadJs(EXJSURL).then(function(){ return window.ExcelJS; }, function(e){ EXJP = null; throw e; }); return EXJP; }
function yqLogo64(){ if(YQLOGO64 !== null) return Promise.resolve(YQLOGO64); return fetch("icon-192.png").then(function(r){ if(!r.ok) throw 0; return r.blob(); }).then(function(b){ return new Promise(function(res){ var f = new FileReader(); f.onload = function(){ res(String(f.result)); }; f.onerror = function(){ res(""); }; f.readAsDataURL(b); }); }).then(function(d){ YQLOGO64 = d || ""; return YQLOGO64; }, function(){ YQLOGO64 = ""; return ""; }); }
// Branded YQI Excel: logo header, summary line, green headers, wrapped text, coloured results, frozen header, filter, footer.
function dxThumb(id){ if(!window.YQCHAT || !YQCHAT.fileUrl) return Promise.resolve(null); return YQCHAT.fileUrl(id).then(function(u){ return fetch(u).then(function(r){ return r.blob(); }); }).then(function(b){ if(!b || !/^image\//.test(b.type)) return null; return new Promise(function(res){ var im = new Image(), u = URL.createObjectURL(b); im.onload = function(){ var m = 220, sc = Math.min(1, m / Math.max(im.width, im.height)), c = document.createElement("canvas"); c.width = Math.max(1, Math.round(im.width * sc)); c.height = Math.max(1, Math.round(im.height * sc)); c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(u); res(c.toDataURL("image/jpeg", 0.8)); }; im.onerror = function(){ URL.revokeObjectURL(u); res(null); }; im.src = u; }); }).catch(function(){ return null; }); }
function yqStyledXlsx(sheets, title){ var ids = []; sheets.forEach(function(sh){ (sh[1] || []).forEach(function(r){ Object.keys(r || {}).forEach(function(k){ var v = r[k]; if(v && v.__img) v.__img.slice(0, 3).forEach(function(id){ if(ids.indexOf(id) < 0 && ids.length < 400) ids.push(id); }); }); }); });
  var TH = {}, thP = ids.reduce(function(p, id, i){ return i % 6 === 0 ? p.then(function(){ return Promise.all(ids.slice(i, i + 6).map(function(x){ return dxThumb(x).then(function(d){ TH[x] = d; }); })); }) : p; }, Promise.resolve());
  return Promise.all([needExcelJs(), yqLogo64(), thP]).then(function(a){ var EX = a[0], logo = a[1], wb = new EX.Workbook(), now = new Date(), IMG = {};
  wb.creator = "YQI · Hamza Khan"; wb.created = now;
  var when = dmy(ymd(now)) + " " + ("0" + now.getHours()).slice(-2) + ":" + ("0" + now.getMinutes()).slice(-2), who = ""; try{ who = EMAIL || ""; }catch(e){}
  var lid = logo ? wb.addImage({base64: logo, extension: "png"}) : null, used = {};
  var G = "FF0E240E", G2 = "FF3B6D11", LG = "FFEAF3DE", ZB = "FFF7FBF2", TX = "FF173404", LIME = "FFB6F36A", RD = "FFA32D2D", RDB = "FFFCEBEB", OK = "FF27500A", AM = "FF854F0B", AMB = "FFFAEEDA";
  var fill = function(c){ return {type: "pattern", pattern: "solid", fgColor: {argb: c}}; };
  var cls = function(v){ v = String(v == null ? "" : v); if(!v) return ""; if(/re[\s\-_.]*insp|re-?pass/i.test(v) && !/fail|reject/i.test(v)) return "re"; if(/fail|reject|overdue|abort|await|late/i.test(v)) return "bad"; if(/pass|clean|closed|done|^ok$|approved/i.test(v)) return "ok"; return ""; };
  var sname = function(n){ var b = String(n || "Sheet").replace(/[\\\/\?\*\[\]:]/g, " ").slice(0, 28) || "Sheet", x = b, i = 2; while(used[x.toLowerCase()]) x = b.slice(0, 25) + " " + (i++); used[x.toLowerCase()] = 1; return x; };
  function add(name, rows, sub){ rows = rows || []; var cols = []; rows.forEach(function(r){ Object.keys(r || {}).forEach(function(k){ if(cols.indexOf(k) < 0) cols.push(k); }); });
    cols = cols.filter(function(c){ return rows.some(function(r){ return r[c] !== "" && r[c] != null; }); }); if(!cols.length){ cols = ["Note"]; rows = [{Note: "No rows"}]; }
    var nC = Math.max(cols.length, 6), ws = wb.addWorksheet(sname(name), {views: [{state: "frozen", ySplit: 5, showGridLines: false}], properties: {tabColor: {argb: G2}}, pageSetup: {orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0}});
    var rc = cols.filter(function(c){ return /^(result|status|res)$/i.test(c); })[0] || cols.filter(function(c){ return /result|status/i.test(c); })[0];
    var r1 = ws.getRow(1); r1.height = 36; ws.mergeCells(1, 1, 1, nC); var c1 = ws.getCell(1, 1); c1.value = "YQI  ·  " + name; c1.font = {name: "Calibri", size: 16, bold: true, color: {argb: "FFFFFFFF"}}; c1.alignment = {vertical: "middle", indent: lid != null ? 5 : 1}; c1.fill = fill(G);
    ws.mergeCells(2, 1, 2, nC); var c2 = ws.getCell(2, 1); c2.value = "Yunus Quality Intelligence · Yunus Textile Mills" + (sub ? "  ·  " + sub : "") + "  ·  Downloaded " + when + (who ? " by " + who : ""); c2.font = {size: 10, color: {argb: LIME}}; c2.alignment = {vertical: "middle", indent: lid != null ? 5 : 1}; c2.fill = fill(G); ws.getRow(2).height = 18;
    if(lid != null) ws.addImage(lid, {tl: {col: 0.15, row: 0.2}, ext: {width: 44, height: 44}, editAs: "oneCell"});
    var kp = "Rows  " + rows.length.toLocaleString("en-US"); if(rc){ var po = 0, fa = 0, re = 0; rows.forEach(function(r){ var k = cls(r[rc]); if(k === "ok") po++; else if(k === "bad") fa++; else if(k === "re") re++; }); var dn = po + fa + re; kp += "     ·     Passed  " + po.toLocaleString("en-US") + (re ? "     ·     Re-inspection  " + re : "") + "     ·     Failed  " + fa.toLocaleString("en-US") + (dn ? "     ·     Pass  " + (Math.round(po / dn * 1000) / 10) + "%" : ""); }
    ws.mergeCells(3, 1, 3, nC); var c3 = ws.getCell(3, 1); c3.value = kp; c3.font = {size: 12, bold: true, color: {argb: TX}}; c3.fill = fill(LG); c3.alignment = {vertical: "middle", indent: 1}; ws.getRow(3).height = 24; c3.border = {bottom: {style: "medium", color: {argb: G2}}};
    ws.getRow(4).height = 6;
    var hr = ws.getRow(5); hr.height = 30; cols.forEach(function(c, i){ var h = hr.getCell(i + 1); h.value = c; h.font = {bold: true, color: {argb: "FFFFFFFF"}, size: 11}; h.fill = fill(G2); h.alignment = {vertical: "middle", wrapText: true}; h.border = {right: {style: "thin", color: {argb: "FF639922"}}}; });
    var W = cols.map(function(c){ return Math.max(8, Math.min(18, String(c).length + 2)); });
    rows.forEach(function(r, ri){ var row = ws.getRow(6 + ri), z = ri % 2 === 1; cols.forEach(function(c, i){ var v = r[c], cell = row.getCell(i + 1);
        if(v && v.__img){ var got = 0; v.__img.slice(0, 3).forEach(function(id, j){ var d = TH[id]; if(!d) return; if(IMG[id] == null) IMG[id] = wb.addImage({base64: d, extension: "jpeg"}); ws.addImage(IMG[id], {tl: {col: i + 0.05 + got * 0.33, row: 5 + ri + 0.08}, ext: {width: 64, height: 64}, editAs: "oneCell"}); got++; }); if(got){ row.height = Math.max(row.height || 0, 54); if(W[i] < 30) W[i] = 30; v = v.__img.length > 3 ? "+" + (v.__img.length - 3) + " more" : ""; } else v = v.__n.join(", "); }
        if(v != null && v !== "") cell.value = v; var L = String(v == null ? "" : v).length; if(L + 2 > W[i]) W[i] = Math.min(55, L + 2);
        cell.alignment = {vertical: "top", wrapText: true}; cell.font = {size: 10.5, color: {argb: TX}}; cell.border = {bottom: {style: "thin", color: {argb: LG}}}; if(z) cell.fill = fill(ZB);
        if(c === rc || /result|status/i.test(c)){ var k = cls(v); if(k === "bad"){ cell.fill = fill(RDB); cell.font = {size: 10.5, bold: true, color: {argb: RD}}; } else if(k === "ok"){ cell.fill = fill(LG); cell.font = {size: 10.5, bold: true, color: {argb: OK}}; } else if(k === "re"){ cell.fill = fill(AMB); cell.font = {size: 10.5, bold: true, color: {argb: AM}}; } } }); });
    W.forEach(function(w, i){ ws.getColumn(i + 1).width = w; }); for(var e = cols.length; e < nC; e++) ws.getColumn(e + 1).width = 12;
    ws.autoFilter = {from: {row: 5, column: 1}, to: {row: 5, column: cols.length}};
    var fr = 6 + rows.length + 1; ws.mergeCells(fr, 1, fr, nC); var cf = ws.getCell(fr, 1); cf.value = "YQI · Yunus Quality Intelligence · Developed by Hamza Khan"; cf.font = {italic: true, size: 9, color: {argb: G2}}; cf.fill = fill(ZB);
    return rc; }
  if(sheets.length > 1) add("Contents", sheets.map(function(sh){ return {Sheet: sh[0], Rows: (sh[1] || []).length}; }), title || "");
  sheets.forEach(function(sh){ var rc = add(sh[0], sh[1], title && sheets.length === 1 ? "" : "");
    if(sheets.length === 1 && rc){ var F = (sh[1] || []).filter(function(r){ var k = cls(r[rc]); return k === "bad" || k === "re"; }); if(F.length) add(sh[0] + " · Fails", F, "Only failed / re-inspected rows"); } });
  return wb.xlsx.writeBuffer().then(function(buf){ return new Blob([buf], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}); }); }); }
window.yqStyledXlsx = yqStyledXlsx;
// every list download in YQI: one branded Excel (same look as Data & export); plain CSV only if Excel cannot be built
function yqAoaDl(fname, rows, title){ rows = rows || []; var H = rows[0] || [], body = rows.slice(1).map(function(r){ var o = {}; H.forEach(function(h, i){ var v = r[i]; o[h] = v == null ? "" : v; }); return o; });
  var csv = function(){ var q = function(v){ v = v == null ? "" : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }; saveBlob(fname + ".csv", new Blob(["\ufeff" + rows.map(function(r){ return r.map(q).join(","); }).join("\n")], {type: "text/csv"})); };
  try{ window.yqToast && yqToast("Preparing Excel…"); }catch(e){}
  return yqStyledXlsx([[title || fname, body]], title || fname).then(function(b){ saveBlob(fname + ".xlsx", b); }).catch(function(){ csv(); }); }
window.yqAoaDl = yqAoaDl;
window.yqOlGet = function(){ return olLoad(); }; window.yqCanonC = function(n){ try{ return canonC(n); }catch(e){ return String(n || ""); } }; window.yqOlCanUp = function(){ return olCanUp(); }; window.yqOlUp = function(fn){ olUpload(fn); };
function dxVal(v){ if(v == null) return ""; if(typeof v === "string") return /^data:/.test(v) ? "[image]" : v.length > 30000 ? v.slice(0, 30000) : v; if(typeof v === "number" || typeof v === "boolean") return v; try{ var s = JSON.stringify(v, function(k, x){ return typeof x === "string" && /^data:/.test(x) ? "[image]" : x; }); return s.length > 30000 ? s.slice(0, 30000) : s; }catch(e){ return String(v); } }
// Clean, human columns for every download: readable headings, no internal codes, JSON turned into text, times into dates, photos kept as pictures.
var DXLAB = {date: "Date", idate: "Inspection date", rdate: "Repacking date", customer: "Customer", cust: "Customer", unit: "Unit", bldg: "Building / floor", floor: "Floor", factory: "Factory", ytm: "YTM", po: "PO", article: "Article", product: "Product", productCat: "Product category", design: "Design", type: "Inspection type", dqa: "DQA", qty: "Order qty", oq: "Order qty", ofq: "Offered qty", cartons: "Cartons opened", sample: "Sample size", critical: "Critical", major: "Major", minor: "Minor", oql: "OQL %", result: "Result", res: "Result", st: "Status", status: "Status", dlist: "Defects", defects: "Defects", inspector: "Inspector", remarks: "Remarks", remark: "Remarks", note: "Notes", allowed: "Allowed defects", found: "Defects found", nInsp: "Inspections", n_insp: "Inspections", resp: "Responsible", notes: "Notes", pl: "Packing list photos", upd: "Updated on", updated: "Updated on", updBy: "Updated by", ev: "Repacking photo", all: "All cartons photo", photos: "Photos", photo: "Photo", done: "Completed on", closed: "Closed on", due: "Due date", email: "Submitted by", by: "Entered by", at: "Entered on", what: "What changed", who: "Changed by", act: "Action", col: "Section", doc: "Record", name: "Name", n: "Name", lines: "Lines"};
var DXHIDE = /^(_.*|id|gid|src|file|ts|bsl|count|uid|wid|ws|v|ver|rev|hash|key|k|pk.*|seq|idx|sig|tok|token|draft|tmp|cache|ver\d*)$/i;
var DXORD = ["date", "idate", "rdate", "customer", "cust", "unit", "factory", "bldg", "floor", "type", "dqa", "ytm", "po", "article", "product", "productCat", "design", "qty", "oq", "ofq", "cartons", "sample", "critical", "major", "minor", "oql", "result", "res", "st", "status", "dlist", "defects", "inspector", "remarks", "pl", "ev", "all", "done", "email", "by", "at"];
function dxIsFiles(v){ return Array.isArray(v) && v.length && v.every(function(f){ return f && typeof f === "object" && f.id && (f.name || f.ct || f.type); }); }
function dxWhen(t){ var d = new Date(t); if(isNaN(d)) return String(t); return dmy(ymd(d)) + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2); }
function dxNice(k, v){ if(v == null || v === "") return "";
  if(dxIsFiles(v)) return {__img: v.map(function(f){ return f.id; }), __n: v.map(function(f){ return f.name || "photo"; })};
  if(typeof v === "string"){ if(/^data:image/.test(v)) return "[image]"; if(/^\d{4}-\d\d-\d\dT\d\d:\d\d/.test(v)) return dxWhen(v); return v.length > 30000 ? v.slice(0, 30000) : v; }
  if(typeof v === "number"){ if(v > 1e12 && v < 4e12) return dxWhen(v); if(/^oql$/i.test(k) && v > 0 && v < 1) return Math.round(v * 10000) / 100; return v; }
  if(typeof v === "boolean") return v ? "Yes" : "No";
  if(Array.isArray(v)){ if(!v.length) return ""; return v.map(function(x){ if(x == null) return ""; if(typeof x !== "object") return String(x); var nm = x.n || x.name || x.t || x.title || x.d || x.label || "", q = x.q != null ? x.q : x.qty != null ? x.qty : x.count; if(nm) return nm + (q != null && q !== "" ? " " + q : "") + (x.sev ? " (" + ({cr: "critical", ma: "major", mi: "minor"}[x.sev] || x.sev) + ")" : ""); return Object.keys(x).filter(function(z){ return !DXHIDE.test(z) && x[z] !== "" && x[z] != null && typeof x[z] !== "object"; }).map(function(z){ return (DXLAB[z] || z) + ": " + x[z]; }).join(", "); }).filter(Boolean).join(", "); }
  if(typeof v === "object"){ if(v.toDate) try{ return dxWhen(v.toDate()); }catch(e){} if(v.seconds) return dxWhen(v.seconds * 1000); return Object.keys(v).filter(function(z){ return !DXHIDE.test(z) && v[z] !== "" && v[z] != null; }).map(function(z){ var y = v[z]; return (DXLAB[z] || z) + ": " + (typeof y === "object" ? dxNice(z, y) : y); }).join(", "); }
  return String(v); }
function dxHead(k){ return DXLAB[k] || String(k).replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_\-]+/g, " ").replace(/^./, function(c){ return c.toUpperCase(); }); }
function dxFlat(L, cols){ L = L || []; if(cols) return L.map(function(x){ var o = {}; cols.forEach(function(c){ var v = typeof c[1] === "function" ? c[1](x) : x[c[1]]; o[c[0]] = dxNice(typeof c[1] === "string" ? c[1] : c[0], v); }); return o; });
  var keys = []; L.forEach(function(x){ Object.keys(x || {}).forEach(function(k){ if(!DXHIDE.test(k) && keys.indexOf(k) < 0) keys.push(k); }); });
  keys.sort(function(a, b){ var ia = DXORD.indexOf(a), ib = DXORD.indexOf(b); return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib); });
  if(keys.indexOf("dlist") >= 0 && keys.indexOf("defects") >= 0) keys.splice(keys.indexOf("defects"), 1);
  var hk = {}; keys.forEach(function(k){ var h = dxHead(k), n = h, i = 2; while(hk[n]) n = h + " " + (i++); hk[n] = 1; hk["@" + k] = n; });
  return L.map(function(x){ var o = {}; keys.forEach(function(k){ var v = x[k]; if(k === "dlist" && (!v || !v.length) && x.defects) v = x.defects; o[hk["@" + k]] = dxNice(k, v); }); return o; }); }
function dxCsv(rows){ if(!rows.length) return ""; var k = Object.keys(rows[0]); rows.forEach(function(r){ Object.keys(r).forEach(function(c){ if(k.indexOf(c) < 0) k.push(c); }); }); var q = function(v){ if(v && v.__img) v = v.__n.join(" | "); v = v == null ? "" : String(v); return /[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }; return "﻿" + [k.map(q).join(",")].concat(rows.map(function(r){ return k.map(function(c){ return q(r[c]); }).join(","); })).join("\r\n"); }
var DXSETS = [
  {id: "ext", n: "External inspections", d: "Buyer inspections from the WhatsApp import and Excel upload (Inspection Summary)", get: function(){ return Promise.resolve(dxFlat(isRows("is_ext"))); }},
  {id: "int", n: "Internal inspections", d: "Floor / line inspections (Inspection Summary)", get: function(){ return Promise.resolve(dxFlat(isRows("is_int"))); }},
  {id: "wst", n: "Wastage", d: "Wastage % and MTR per day and customer", get: function(){ var R = []; (isRows("is_extday") || []).forEach(function(d){ var c = d.cust || {}; Object.keys(c).forEach(function(k){ var v = c[k] || {}; R.push({Date: d.date || d._id, Customer: k, "Wastage %": v.wpct != null ? Math.round(v.wpct * 10000) / 100 : "", "Wastage MTR": v.wmtr == null ? "" : v.wmtr, Unit: v.unit || "", Remarks: v.remarks || "", YTMs: (v.ytms || []).map(function(y){ return y.ytm; }).join(" ")}); }); }); return Promise.resolve(R); }},
  {id: "ship", n: "Customer shipment results", d: "Every article and lot result in each customer's workspace", get: function(){ return Promise.resolve(dxFlat(HDATA, [["Customer", "cust"], ["Date", "date"], ["Shipping plan", "p"], ["Article", "n"], ["Colour", "c"], ["Size", "z"], ["Lot", "l"], ["Qty", "q"], ["Result", "s"]])); }},
  {id: "qi", n: "Inspections (app)", d: "Every inspection booked or done in the Inspections module", get: function(){ return qiLoad().then(function(L){ return dxFlat(L, [["Number", function(x){ return x.no || ""; }], ["Type", function(x){ return qiName(x.type); }], ["Status", function(x){ return x.st || "done"; }], ["Result", "res"], ["Customer", "cust"], ["YTM", "ytm"], ["PO", "po"], ["Program / design", "design"], ["Factory", "factory"], ["Line", "line"], ["Order qty", "oq"], ["Lot qty", "lot"], ["Date", function(x){ return x.date || x.plan || ""; }], ["Time", "time"], ["Inspector", function(x){ return x.insp || x.asgName || ""; }], ["Booked by", "bookedBy"], ["Assigned to", "asg"], ["Assigned by", "asgBy"], ["AQL major", "aqlMa"], ["AQL minor", "aqlMi"], ["Critical defects", function(x){ return (x.defects || []).filter(function(d){ return d.sev === "cr"; }).reduce(function(s, d){ return s + (+d.q || 0); }, 0); }], ["Major defects", function(x){ return (x.defects || []).filter(function(d){ return d.sev === "ma"; }).reduce(function(s, d){ return s + (+d.q || 0); }, 0); }], ["Minor defects", function(x){ return (x.defects || []).filter(function(d){ return d.sev === "mi"; }).reduce(function(s, d){ return s + (+d.q || 0); }, 0); }], ["Defects", function(x){ return (x.defects || []).filter(function(d){ return d.n; }).map(function(d){ return d.n + " (" + (d.sev || "") + " " + (d.q || 0) + ")"; }).join("; "); }], ["Notes", function(x){ return x.note || x.bnote || ""; }], ["Created by", "email"], ["Created", function(x){ return x.at ? new Date(x.at).toISOString().slice(0, 16).replace("T", " ") : ""; }]]); }); }},
  {id: "ol", n: "One-liner (weekly plan)", d: "Last uploaded one-liner, one row per YTM, design and size", get: function(){ return olLoad(true).then(function(M){ var R = []; Object.keys(M).forEach(function(y){ var o = M[y]; (o.lines && o.lines.length ? o.lines : [{}]).forEach(function(l){ R.push({YTM: y, Customer: o.cust, Program: o.prog, Design: l.d || "", Size: l.s || "", Set: l.set || "", Qty: l.q || "", Cut: l.cut || "", Packed: l.pk || "", Exported: l.ex || "", Unit: o.unit, "PO": (o.po || []).join(", "), "Inspection date": o.insp, "Shipping end": o.ship, "Loading date": o.load, "Packaging acc.": o.pkg, "Stitching acc.": o.sacc, "Stitching type": [o.stype, o.ssub].filter(Boolean).join(" · ")}); }); }); return R; }); }},
  {id: "capa", n: "CAPA", d: "Every CAPA with method, root cause, action, owner and status", lock: 1, get: function(){ return capaLoad().then(function(L){ return dxFlat(L, [["Number", "no"], ["Method", function(x){ return (CPM[x.method] || CPM.basic).n; }], ["Date", "date"], ["Customer", "customer"], ["YTM / PO", "ytm"], ["Source", "source"], ["Ref", "ref"], ["Problem", "issue"], ["Root cause", function(x){ return x.sRoot || cpAuto(x).r || x.root || ""; }], ["Action", function(x){ return x.sAction || cpAuto(x).a || x.action || ""; }], ["Result", function(x){ return x.sResult || cpAuto(x).z || ""; }], ["Owner", "owner"], ["Dept", "dept"], ["Due", "due"], ["Status", function(x){ return cpOver(x) ? "Overdue" : x.status || "Open"; }], ["Closed", "closed"], ["Signed", function(x){ return (x.signers || []).map(function(s, i){ return (s.role || "") + ": " + ((x.sg || {})[String(i)] ? "signed" : "-"); }).join("; "); }]]); }); }},
  {id: "rp", n: "Repacking", d: "Repacking reports after inspection", get: function(){ return rpLoad().then(function(L){ return dxFlat(L); }); }},
  {id: "ppl", n: "People & access", d: "Who has which access level and duty", own: 1, get: function(){ var m = LEVELS.m || {}, du = LEVELS.du || {}, cu = LEVELS.cu || {}, E = []; Object.keys(m).concat(Object.keys(du), Object.keys(cu)).forEach(function(e){ if(E.indexOf(e) < 0) E.push(e); }); return Promise.resolve(E.map(function(e){ return {Email: e, Level: m[e] || "", Duties: (du[e] || []).join(", "), Customer: cu[e] || "", Gold: (LEVELS.mg || []).indexOf(e) >= 0 ? "yes" : ""}; })); }},
  {id: "aud", n: "Activity log", d: "The last 1,000 changes to the data", own: 1, get: function(){ return FS.collection("ws").doc("_all").collection("audit").orderBy("at", "desc").limit(1000).get().then(function(q){ var AR = {is_ext: "External inspections", is_int: "Internal inspections", is_extday: "Wastage", is_settings: "Settings", capa: "CAPA", rp: "Repacking", repack: "Repacking", insp: "Shipment results", pldraft: "Packing list draft", custTheme: "Customer look", qi: "Inspections", ol: "One-liner", members: "People", levels: "People & access", audit: "Activity log"}, OP = {add: "Added", set: "Saved", update: "Changed", "delete": "Deleted"}, R = [];
    q.docs.forEach(function(d){ var x = d.data() || {}; (x.items && x.items.length ? x.items : [{}]).forEach(function(it){ var seg = String(it.p || "").split("/").filter(function(z){ return z && z !== "_all" && z !== "new"; }), area = ""; seg.forEach(function(z){ if(!area && AR[z]) area = AR[z]; }); if(!area && seg.length) area = seg[0].length > 20 ? "Customer workspace" : seg[0].replace(/[_-]+/g, " ");
      R.push({"Date & time": x.at ? dxWhen(x.at) : "", "Changed by": x.by || "", Action: OP[it.op] || it.op || "", Area: area, Customer: it.customer || "", YTM: it.ytm || "", PO: it.po || "", Result: it.result || "", Date: it.date || ""}); }); });
    return R; }); }}];
window.yqDxRows = function(id){ var x = dxSets().filter(function(y){ return y.id === id; })[0]; return x ? x.get() : Promise.resolve([]); };
function dxSets(){ return DXSETS.filter(function(s){ return (!s.own || OWNER) && (!s.lock || lockOk()); }); }
function dataExport(){ if(!lockOk()) return lockMsg("Data & export"); var o = yqSheet("Data & export", '<div id="yqDxB">Loading…</div>', 1);
  if(!$("yqDxCss")){ var st = document.createElement("style"); st.id = "yqDxCss"; st.textContent = "#yqSh .dxR{display:flex;gap:10px;align-items:center;border:1px solid #d8e2d0;background:#fff;border-radius:12px;padding:10px 12px;margin-bottom:8px}#yqSh .dxR>div{flex:1;min-width:0}#yqSh .dxR b{display:block}#yqSh .dxR small{color:#6b7a60;display:block}#yqSh .dxR em{font-style:normal;font-weight:800;color:#2f7a14;margin-right:4px}#yqSh .dxR button{border:1px solid #cfdcc3;background:#fff;border-radius:9px;padding:7px 10px;font:700 12.5px inherit;cursor:pointer;color:#1d2a17;white-space:nowrap}#yqSh .dxAll{width:100%;border:0;background:#2f7a14;color:#fff;border-radius:12px;padding:12px;font:800 14px inherit;cursor:pointer;margin:4px 0 12px}#yqSh.dk .dxR,#yqSh.dk .dxR button{background:#172515;border-color:#2c3f28;color:#e5efdc}@media(max-width:560px){#yqSh .dxR{flex-wrap:wrap}#yqSh .dxR>div{flex-basis:100%}}"; document.head.appendChild(st); }
  var S = dxSets(), b = o.querySelector("#yqDxB"), cache = {};
  b.innerHTML = '<div class="ycpSub" style="margin-bottom:10px">All YQI data is kept online in one database (Google Firebase). Download any list here as Excel to make your own summary, pivot or dashboard. Numbers are live: download again to get the newest.</div><button class="dxAll" id="yqDxAll">⬇ Download everything (one Excel file)</button>' +
    S.map(function(s){ return '<div class="dxR"><div><b>' + esc(s.n) + '</b><small><em data-c="' + s.id + '">…</em>' + esc(s.d) + '</small></div><button data-x="' + s.id + '">Excel</button><button data-v="' + s.id + '">CSV</button></div>'; }).join("");
  var get = function(s){ return cache[s.id] ? Promise.resolve(cache[s.id]) : s.get().then(function(r){ cache[s.id] = r || []; return cache[s.id]; }); };
  S.forEach(function(s){ get(s).then(function(r){ var e = b.querySelector('[data-c="' + s.id + '"]'); if(e) e.textContent = r.length.toLocaleString("en-US") + " rows · "; }).catch(function(){ var e = b.querySelector('[data-c="' + s.id + '"]'); if(e) e.textContent = "not loaded · "; }); });
  var stamp = function(){ return ymd(new Date()); }, xl = function(sheets, name){ return yqStyledXlsx(sheets, name.replace(/\.xlsx$/i, "")).then(function(bl){ saveBlob(name, bl); }, function(e){ try{ console.warn("styled xlsx failed", e); }catch(x){} return needXlsx().then(function(X){ var wb = xlBook(X, sheets, name.replace(/\.xlsx$/i, "")); var a = X.write(wb, {type: "array", bookType: "xlsx"}); saveBlob(name, new Blob([a], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"})); }); }); };
  var err = function(e){ yqAsk(errTxt(e), {title: "Could not download", alert: 1}); };
  b.querySelectorAll("[data-x]").forEach(function(x){ x.onclick = function(){ var s = S.filter(function(y){ return y.id === x.dataset.x; })[0]; x.disabled = true; get(s).then(function(r){ return xl([[s.n, r]], "YQI " + s.n + " " + stamp() + ".xlsx"); }).catch(err).then(function(){ x.disabled = false; }); }; });
  b.querySelectorAll("[data-v]").forEach(function(x){ x.onclick = function(){ var s = S.filter(function(y){ return y.id === x.dataset.v; })[0]; get(s).then(function(r){ saveBlob("YQI " + s.n + " " + stamp() + ".csv", new Blob([dxCsv(r)], {type: "text/csv"})); }).catch(err); }; });
  $("yqDxAll").onclick = function(){ var bt = this; bt.disabled = true; bt.textContent = "Preparing…"; Promise.all(S.map(function(s){ return get(s).then(function(r){ return [s.n, r]; }, function(){ return [s.n, []]; }); })).then(function(sh){ return xl(sh, "YQI all data " + stamp() + ".xlsx"); }).catch(err).then(function(){ bt.disabled = false; bt.textContent = "⬇ Download everything (one Excel file)"; }); }; }

function ssSet(k, v){ try{ sessionStorage.setItem(k, v); }catch(e){} }
function slug(n){ return String(n || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "ws"; }
function loadJs(u){ return new Promise(function(res, rej){ var s = document.createElement("script"); s.src = u; s.onload = res; s.onerror = function(){ rej(new Error("Could not load " + u)); }; document.head.appendChild(s); }); }
// Firestore cannot store arrays inside arrays or undefined values: encode on write, decode on read.
function enc(v, inArr){
  if(Array.isArray(v)){ var a = v.map(function(x){ return enc(x, true); }); return inArr ? {__na: a} : a; }
  if(v && typeof v === "object" && !(v instanceof Date)){ var o = {}; Object.keys(v).forEach(function(k){ if(v[k] !== undefined && typeof v[k] !== "function") o[k] = enc(v[k], false); }); return o; }
  if(typeof v === "number" && !isFinite(v)) return null;
  return v;
}
function dec(v){
  if(Array.isArray(v)) return v.map(dec);
  if(v && typeof v === "object" && !(v instanceof Date)){ var ks = Object.keys(v); if(ks.length === 1 && ks[0] === "__na") return dec(v.__na); var o = {}; ks.forEach(function(k){ o[k] = dec(v[k]); }); return o; }
  return v;
}

//@yqi-piece 0005
// ---------- owner admin ----------
function adminScreen(selId){
  loadEditors().then(function(){ return FS.collection("ws").get(); }).then(function(q){
    var L = q.docs.map(function(d){ return {id: d.id, x: d.data()}; }), cur = L.filter(function(w){ return w.id === selId; })[0] || L[0];
    var h = '<h1>Admin</h1><div class="sub">Customers and programs. People, access and employee-card approvals are in <b>People &amp; access</b>.</div>';
    h += '<label>New customer</label><div class="row" style="flex-wrap:nowrap"><input id="yqNw" placeholder="e.g. Walmart"><button id="yqNb" style="margin-top:0">Add</button></div>';
    if(L.length){
      h += '<label>Customer</label><select id="yqSel">' + L.map(function(w){ return '<option value="' + esc(w.id) + '"' + (cur && w.id === cur.id ? " selected" : "") + '>' + esc(w.x.name || w.id) + '</option>'; }).join("") + '</select>';
      h += '<label>People & access</label><div class="row" style="margin-top:4px"><button id="yqPa">People & access · approvals</button></div><div class="sub" style="margin:4px 0 0"><b>Guest</b>: chat, calls, meetings. <b>QC</b>: orders, specs, approvals. <b>QA</b>: whole app, no changes. <b>Authorised</b>: can change data. Approve employee cards there.</div>';
      h += '<div class="row"><button class="g" id="yqAud">Activity log · who changed what</button></div>';
      h += '<label>Programs of this customer (one per line)</label><textarea id="yqPg" rows="4" placeholder="Solid&#10;Waffle&#10;Pillowcase"></textarea><button class="g" id="yqPs">Save programs</button>';
      h += '<label>Load data into this customer</label><div class="sub" style="margin:0">Use the file from <b>Export all data</b> (home page of the Claude version of YQI).</div><input id="yqIf" type="file" accept=".json,application/json"><div class="row"><button class="g" id="yqEx">Download backup of this customer</button></div>';
      h += '<div class="row"><button id="yqGo">Open ' + esc(cur.x.name || cur.id) + '</button><button class="g" id="yqO">Sign out</button></div>';
    } else h += '<div class="row"><button class="g" id="yqO">Sign out</button></div>';
    h += '<div id="yqMsg" class="msg"></div>';
    showGate(h);
    $("yqO").onclick = function(){ AUTH.signOut(); };
    $("yqNb").onclick = function(){
      var n = $("yqNw").value.trim(); if(!n){ msg("Type a customer name.", 1); return; }
      var id = slug(n); if(L.some(function(w){ return w.id === id; })){ msg("This customer already exists.", 1); return; }
      FS.collection("ws").doc(id).set({name: n, members: {}, created: Date.now(), by: EMAIL}).then(function(){ return FS.collection("ws").doc(id).collection("seed").doc("PROGS").set({v: ["General"]}); }).then(function(){ adminScreen(id); }).catch(function(e){ msg(errTxt(e), 1); });
    };
    if(!cur) return;
    var wref = FS.collection("ws").doc(cur.id);
    $("yqSel").onchange = function(){ adminScreen(this.value); };
    wref.collection("seed").doc("PROGS").get().then(function(d){ var v = d.exists ? dec(d.data().v) : []; $("yqPg").value = (v || []).join("\n"); }).catch(function(){});
    $("yqPs").onclick = function(){ var v = $("yqPg").value.split("\n").map(function(x){ return x.trim(); }).filter(Boolean); if(!v.length) v = ["General"]; wref.collection("seed").doc("PROGS").set({v: v}).then(function(){ msg("Programs saved (" + v.length + ")."); }).catch(function(e){ msg(errTxt(e), 1); }); };
    gate.querySelectorAll("[data-r]").forEach(function(s){ s.onchange = function(){ var u = {}; u["members"] = Object.assign({}, cur.x.members); u.members[s.dataset.r] = s.value; wref.update(u).then(function(){ msg("Saved."); }).catch(function(e){ msg(errTxt(e), 1); }); }; });
    $("yqPa").onclick = peopleAdmin;
    $("yqAud").onclick = auditView;
    $("yqIf").onchange = function(){ var f = this.files && this.files[0]; if(f) importFile(f, cur); };
    $("yqEx").onclick = function(){ backupWs(cur); };
    $("yqGo").onclick = function(){ openWs({id: cur.id, name: cur.x.name || cur.id, role: "owner"}); };
  }).catch(function(e){ showGate('<h1>Admin</h1><div class="sub">' + esc(errTxt(e)) + '</div><button id="yqO">Sign out</button>'); $("yqO").onclick = function(){ AUTH.signOut(); }; });
}
function importFile(f, cur){
  msg("Reading file…");
  f.text().then(function(t){
    var j = JSON.parse(t); if(!j || j.yqi !== "export") throw new Error("This is not a YQI export file.");
    var wref = FS.collection("ws").doc(cur.id), jobs = [];
    Object.keys(j.seed || {}).forEach(function(k){ var v = j.seed[k]; if(v == null) return; if(k === "PROGS" && (!Array.isArray(v) || !v.length)) return; jobs.push([wref.collection("seed").doc(k), {v: v}]); });
    Object.keys(j.data || {}).forEach(function(c){ Object.keys(j.data[c] || {}).forEach(function(id){ jobs.push([wref.collection(c).doc(id), j.data[c][id]]); }); });
    return yqAsk("Load " + jobs.length + " records into " + (cur.x.name || cur.id) + "? Records with the same id are replaced.", {title: "Load records", ok: "Load"}).then(function(y){ if(!y){ msg(""); return; }
    var done = 0, bad = 0, i = 0;
    function next(){
      if(i >= jobs.length){ msg("Done: " + done + " records loaded" + (bad ? ", " + bad + " failed (too big or not allowed)" : "") + "."); return; }
      var part = jobs.slice(i, i + 20); i += 20;
      return Promise.all(part.map(function(x){ return x[0].set(enc(x[1])).then(function(){ done++; }).catch(function(e){ bad++; if(window.console) console.warn("YQI import", x[0].path, e); }); })).then(function(){ msg("Loading… " + done + " / " + jobs.length); return next(); });
    }
    return next(); });
  }).catch(function(e){ msg(errTxt(e), 1); });
}
function readCol(wref, c){ return wref.collection(c).get().then(function(q){ var o = {}; q.docs.forEach(function(d){ o[d.id] = dec(d.data()); }); return o; }).catch(function(){ return {}; }); }
var COLS = ["activities", "amz", "cfg", "cuts", "ext", "insp", "items", "notes", "orders", "shadeov", "shdyn", "slotcfg", "specdata", "uplan", "is_ext", "is_int", "is_hist", "is_extday", "is_actions", "is_imports", "is_settings"];
function backupWs(cur){
  msg("Collecting…"); var wref = FS.collection("ws").doc(cur.id), data = {}, seed = {};
  Promise.all(COLS.map(function(c){ return readCol(wref, c).then(function(o){ data[c] = o; }); }).concat([readCol(wref, "seed").then(function(o){ Object.keys(o).forEach(function(k){ seed[k] = o[k].v; }); })])).then(function(){
    saveBlob("YQI-" + cur.id + "-backup-" + new Date().toISOString().slice(0, 10) + ".json", new Blob([JSON.stringify({yqi: "export", v: 1, app: "YQI - Yunus Quality Intelligence", developedBy: "Hamza Khan", at: new Date().toISOString(), seed: seed, data: data})], {type: "application/json"}));
    msg("Backup downloaded.");
  });
}
function saveBlob(name, data){
  var b = data instanceof Blob ? data : new Blob([data], {type: /\.html?$/i.test(name) ? "text/html" : "application/octet-stream"});
  var u = URL.createObjectURL(b), a = document.createElement("a"); a.href = u; a.download = name; document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(u); a.remove(); }, 4000);
}

//@yqi-piece 0011
// ---------- People & access (owner): approvals, levels, management, customers, inspection groups ----------
var LVN = {guest: "Guest", qc: "QC", qa: "QA", am: "Assistant Manager", head: "Head", auth: "Authorised"};
//@yqi-piece 0028
// ---------- link a computer: QR on the computer, phone approves (like WhatsApp Web) ----------
var PUSHSRV = "https://yqi-push.yqi-ytm7.workers.dev";
function rndSid(){ var a = new Uint8Array(24), c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", o = ""; crypto.getRandomValues(a); for(var i = 0; i < a.length; i++) o += c[a[i] % c.length]; return o + Date.now().toString(36).replace(/[^a-z0-9]/gi, ""); }
var QRT = null;
function qrLoginView(){ clearInterval(QRT); var sid = rndSid(), url = "https://yqi-app.pages.dev/?qrlink=" + sid, t0 = Date.now();
  showGate('<div class="lg"><div class="lgh"><div class="lgo">' + LOGO_Q + '</div><h1>Log in with your phone</h1><div class="sub">1. Open YQI on your phone (app or browser, already logged in)<br>2. Settings → <b>Link a computer (QR)</b><br>3. Point the phone at this code</div></div><div id="yqQrBox" style="display:grid;place-items:center;margin:14px auto;width:232px;height:232px;background:#fff;border-radius:16px;padding:12px;box-sizing:border-box;box-shadow:0 6px 20px rgba(0,0,0,.12)">Loading…</div><div class="sub" id="yqQrSt" style="text-align:center">Waiting for your phone…</div><div class="row"><button class="g" id="yqQrBack">Back to email login</button></div><div id="yqMsg" class="msg"></div></div>');
  $("yqQrBack").onclick = function(){ clearInterval(QRT); loginScreen(); };
  loadJs("https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js").then(function(){ var b = $("yqQrBox"); if(!b) return; b.innerHTML = ""; new QRCode(b, {text: url, width: 208, height: 208, colorDark: "#0e240e", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.M}); }).catch(function(){ var b = $("yqQrBox"); if(b) b.textContent = "Could not load the QR code. Check internet."; });
  QRT = setInterval(function(){ if(!$("yqQrBox")){ clearInterval(QRT); return; } if(Date.now() - t0 > 115000){ clearInterval(QRT); return qrLoginView(); }
    fetch(PUSHSRV, {method: "POST", headers: {"content-type": "application/json"}, body: JSON.stringify({op: "qrpoll", sid: sid})}).then(function(r){ return r.json(); }).then(function(j){ if(j && j.token){ clearInterval(QRT); var st = $("yqQrSt"); if(st) st.textContent = "Phone approved — logging in…"; AUTH.signInWithCustomToken(j.token).catch(function(e){ msg(errTxt(e), 1); }); } else if(j && j.expired){ clearInterval(QRT); qrLoginView(); } }).catch(function(){}); }, 2000); }
function qrApprove(sid){ if(!/^[A-Za-z0-9]{24,64}$/.test(sid || "")) return yqAsk("This is not a YQI login code.", {title: "Wrong QR code", alert: 1});
  return yqAsk("The computer will open YQI as " + EMAIL + ". Only do this on a computer you trust.", {title: "Log in on this computer?", ok: "Log in"}).then(function(y){ if(!y) return;
    return AUTH.currentUser.getIdToken().then(function(idt){ return fetch(PUSHSRV, {method: "POST", headers: {"content-type": "application/json"}, body: JSON.stringify({op: "qrok", sid: sid, idToken: idt})}); }).then(function(r){ return r.json(); }).then(function(j){ yqAsk(j && j.ok ? "YQI is opening on the computer now." : "Could not link. Show a new QR code on the computer and try again.", {title: j && j.ok ? "Computer linked ✓" : "Not linked", alert: 1}); }).catch(function(){ yqAsk("Check internet and try again.", {title: "Not linked", alert: 1}); }); }); }
function qrSid(text){ var m = String(text || "").match(/[?&]qrlink=([A-Za-z0-9]{24,64})/); return m ? m[1] : (/^[A-Za-z0-9]{24,64}$/.test(text) ? text : ""); }
window.yqQrScan = function(){ var o = document.createElement("div"); o.id = "yqScan"; o.style.cssText = "position:fixed;inset:0;z-index:2147483600;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font:600 15px Manrope,system-ui,sans-serif";
  o.innerHTML = '<video playsinline muted autoplay disablepictureinpicture poster="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style="background:#000;width:100%;height:100%;object-fit:cover;position:absolute;inset:0"></video><div style="position:relative;width:240px;height:240px;border:3px solid #a6dd5e;border-radius:22px;box-shadow:0 0 0 2000px rgba(0,0,0,.45)"></div><div style="position:relative;margin-top:22px;text-align:center;padding:0 24px">Point at the QR code on the computer screen<br><small style="opacity:.75;font-weight:500">yqi-app.pages.dev → Log in with your phone</small></div><button style="position:absolute;top:max(18px,env(safe-area-inset-top));right:16px;border:0;background:rgba(255,255,255,.16);color:#fff;width:42px;height:42px;border-radius:50%;font-size:22px">×</button>';
  document.body.appendChild(o); var v = o.querySelector("video"), stream = null, done = false, cv = document.createElement("canvas"), cx = cv.getContext("2d", {willReadFrequently: true}), det = null;
  var stop = function(){ done = true; try{ stream && stream.getTracks().forEach(function(t){ t.stop(); }); }catch(e){} o.remove(); };
  o.querySelector("button").onclick = stop;
  var found = function(txt){ var sid = qrSid(txt); if(!sid) return false; stop(); qrApprove(sid); return true; };
  try{ if(window.BarcodeDetector) det = new BarcodeDetector({formats: ["qr_code"]}); }catch(e){ det = null; }
  var jsqr = det ? Promise.resolve() : loadJs("https://cdnjs.cloudflare.com/ajax/libs/jsQR/1.4.0/jsQR.min.js");
  navigator.mediaDevices.getUserMedia({video: {facingMode: "environment", width: {ideal: 1280}}, audio: false}).then(function(s){ stream = s; v.srcObject = s; return v.play(); }).then(function(){ return jsqr; }).then(function(){
    var tick = function(){ if(done) return; if(v.videoWidth){
        if(det){ det.detect(v).then(function(r){ if(!(r && r[0] && found(r[0].rawValue))) setTimeout(tick, 250); }).catch(function(){ setTimeout(tick, 400); }); return; }
        var w = 480, h = Math.round(v.videoHeight * w / v.videoWidth); cv.width = w; cv.height = h; cx.drawImage(v, 0, 0, w, h); var img = cx.getImageData(0, 0, w, h), r = window.jsQR && jsQR(img.data, w, h, {inversionAttempts: "dontInvert"}); if(r && found(r.data)) return; }
      setTimeout(tick, 250); }; tick(); }).catch(function(){ stop(); yqAsk("Allow the camera for YQI and try again.", {title: "Camera not available", alert: 1}); }); };

function bindHome(){
  var h = $("yqHome"); if(!h) return; tipInit();
  h.querySelectorAll("[data-per]").forEach(function(b){ b.onclick = function(){ var pp = HPER; if(b.dataset.per !== pp) try{ YQBACK.push(function(){ if(HOMEON){ HPER = pp; lsSet("yqi_hper4", HPER); renderHome(); } }, "hp"); }catch(e){} HPER = b.dataset.per; if(HPER === "day") HDAY = ""; lsSet("yqi_hper4", HPER); HPLAN = ""; renderHome(); }; });
  if($("yqDay")) $("yqDay").onchange = function(){ if(!this.value) return; HDAY = this.value; HPER = "day"; renderHome(); };
  var rng = function(){ HFROM = $("yqFr").value; HTO = $("yqTo").value; ssSet("yqi_hf", HFROM); ssSet("yqi_ht", HTO); if(HFROM || HTO){ HPER = "rng"; renderHome(); } };
  if($("yqFr")) $("yqFr").onchange = rng; if($("yqTo")) $("yqTo").onchange = rng;
  h.querySelectorAll("tr.cl").forEach(function(r){ r.onclick = function(){ var c = r.dataset.c, p = r.dataset.p;
    if(c && !p){ setHC(c); return; }
    if(c && p && !HCUST && HFILT !== "all" && !HFILT){ HCUST = c; ssSet("yqi_hcust", c); }
    if(p){ HPLAN = HPLAN === p ? "" : p; renderHome(); var pd = $("yqPD"); if(pd) pd.scrollIntoView({behavior: "smooth", block: "start"}); } }; });
  h.querySelectorAll("[data-filt],[data-go]").forEach(function(el){ var f = el.dataset.filt || el.dataset.go; if(!f) return; el.onclick = function(){ HFILT = f; HPLAN = ""; renderHome(); toList(); }; });
  h.querySelectorAll("g[data-day]").forEach(function(g){ g.onclick = function(){ if(g.dataset.wk === "1"){ var a = new Date(g.dataset.day + "T00:00:00"), b = new Date(a); b.setDate(b.getDate() + 6); HFROM = g.dataset.day; HTO = ymd(b); HPER = "rng"; } else { HDAY = g.dataset.day; HPER = "day"; } HFILT = "all"; HPLAN = ""; renderHome(); toList(); }; });
  if($("yqClrF")) $("yqClrF").onclick = function(){ HFILT = ""; renderHome(); };
  var cs = $("yqCs"); if(cs) cs.onchange = function(){ setHC(cs.value); };
  var ctr = document.querySelectorAll("#yqHome .ctab tr.cl"); if(ctr.length > 12 && !HALLC){ for(var ci = 12; ci < ctr.length; ci++) ctr[ci].style.display = "none"; var mb = document.createElement("button"); mb.className = "morec"; mb.textContent = "Show all " + ctr.length + " customers ▾"; mb.onclick = function(){ HALLC = true; renderHome(); }; $("yqList").appendChild(mb); }
  else if(ctr.length > 12){ var lb = document.createElement("button"); lb.className = "morec"; lb.textContent = "Show top 12 ▴"; lb.onclick = function(){ HALLC = false; renderHome(); }; $("yqList").appendChild(lb); }
  document.querySelectorAll("[data-mrep]").forEach(function(b){ b.onclick = function(e){ e.stopPropagation(); if(!lockOk()) return lockMsg("Monthly CEO report"); monthReport(b.dataset.mrep, b.dataset.dl === "1"); }; });
  if($("yqShr")) $("yqShr").onclick = function(){ buyerShare(HCUST); };
  var ck2 = $("yqCpk"); if(ck2) ck2.onclick = function(e){ e.stopPropagation(); custPick(ck2); };
  if($("yqFull")) $("yqFull").onclick = function(){ if(canonC(HCUST) === "Target" && typeof tgView === "function" && !modOff("tgt")){ tgView(); return; } if(cdUse(HCUST)){ cdView(HCUST); return; } openCustName(HCUST); };
  var ti = $("yqTi"); if(ti) ti.onclick = function(){ openIS(); }; if($("yqFh")) $("yqFh").onclick = function(){ frShow(true); };
  if($("yqRp")) $("yqRp").onclick = function(){ repackView(); }; if($("yqQi")) $("yqQi").onclick = function(){ qiView(); }; if($("yqPa2")) $("yqPa2").onclick = peopleAdmin; if($("yqPp2")) $("yqPp2").onclick = function(){ if(window.YQCHAT) YQCHAT.openStaff(); };
  if($("yqCa")) $("yqCa").onclick = capaView; if($("yqDr")) $("yqDr").onclick = shareDaily;
  if($("yqEd")) $("yqEd").onclick = function(){ editOn(); };
  if($("yqDash")) $("yqDash").onclick = function(){ dashCustomize(); };
  if($("yqIns")) $("yqIns").onclick = function(){ var p = INSTP; if(!p) return; p.prompt(); (p.userChoice || Promise.resolve()).then(function(){ INSTP = null; renderHome(); }); };
  if($("yqAm2")) $("yqAm2").onclick = function(){ lsSet(LSK, ""); lsSet("yqi_lc", ""); lsSet("yqi_admin", "1"); location.reload(); };
  if($("yqBio")) $("yqBio").onclick = function(){ var on = lsGet("yqi_bio") !== "1", b = this; if(!on){ lsSet("yqi_bio", ""); b.textContent = "Fingerprint lock"; return; }
    window.YQNATIVE.bio().then(function(){ lsSet("yqi_bio", "1"); b.textContent = "✓ Fingerprint lock"; yqAsk("YQI will ask for your fingerprint (or phone lock) when it opens, and after 1 minute in the background.", {title: "Fingerprint lock is on", alert: 1}); }).catch(function(e){ if(/none/.test(String(e && e.message || e))) yqAsk("Set a fingerprint or screen lock in your phone settings first.", {title: "No fingerprint on this phone", alert: 1}); }); };
  if($("yqOff")) $("yqOff").onclick = function(){ var on = lsGet("yqi_off") === "0"; yqAsk(on ? "YQI will keep the data you open on this device, so you can still see it without internet. It refreshes when you are online." : "YQI will stop keeping data on this device.", {title: on ? "Turn on offline copy?" : "Turn off offline copy?", ok: on ? "Turn on" : "Turn off"}).then(function(y){ if(!y) return; lsSet("yqi_off", on ? "1" : "0"); location.reload(); }); };
  if($("yqSet")) $("yqSet").onclick = function(e){ e.stopPropagation(); var m = $("yqSm"); m.classList.toggle("on"); if(m.classList.contains("on")){ var r = this.getBoundingClientRect(); m.style.top = (r.bottom + 8) + "px"; m.style.right = Math.max(8, innerWidth - r.right) + "px"; var off = function(ev){ if(!m.contains(ev.target)){ m.classList.remove("on"); document.removeEventListener("click", off, true); } }; setTimeout(function(){ document.addEventListener("click", off, true); }, 0); } };
  if($("yqPickD")) $("yqPickD").onclick = function(){ var c = $("yqCdt"); c.classList.toggle("open"); this.classList.toggle("on", c.classList.contains("open")); };
  if($("yqQrL")) $("yqQrL").onclick = function(){ if(window.yqQrScan) window.yqQrScan(); };
  if($("yqLg")) $("yqLg").onclick = function(){ var m = $("yqSm"); if(m && m.__close) m.__close(); else if(m) m.classList.remove("on"); langPick(); };
  if($("yqDk")) $("yqDk").onclick = function(){ var n = {auto: "light", light: "dark", dark: "auto"}[yqTheme()]; lsSet("yqa_theme", n === "auto" ? "" : n); h.classList.add("dkt"); yqThemeApply(); this.lastChild.textContent = "Theme: " + yqThemeName(); setTimeout(function(){ h.classList.remove("dkt"); }, 600); };
  if($("yqSo2")) $("yqSo2").onclick = function(){ lsSet(LSK, ""); ssSet("yqi_cur", ""); lsSet("yqi_lc", ""); var go = function(){ location.reload(); }; if(AUTH) AUTH.signOut().then(go, go); else go(); };
  if($("yqUpB")) $("yqUpB").onclick = function(){ if(!(OWNER || ISED)){ HMSG = '<span class="hbad">View only: ask the owner for edit access to upload.</span>'; renderHome(); return; } $("yqUpF").click(); };
  if($("yqWpE")) $("yqWpE").onclick = function(){ custWipe("ext"); }; if($("yqWpI")) $("yqWpI").onclick = function(){ custWipe("int"); };
  if($("yqUpF")) $("yqUpF").onchange = function(){ var f = this.files[0]; this.value = ""; if(f) uploadInsp(f); };
  if($("yqTpl")) $("yqTpl").onclick = function(){ var c = "Customer,Shipping plan,Date,Program,Article,Colour,Size,Lot,Qty,Result,Reason,Remarks\n" + (HCUST || "Bedsure") + ",202611PKEU009," + ymd(new Date()) + ",Washed Zip,Duvet Cover Set-Washed Cotton-Zip,Simply Taupe,200x200CM,A65094,48,Passed - 1st Go,,\n"; saveBlob("YQI-inspections-template.csv", new Blob([c], {type: "text/csv"})); };
}
// ----- one customer's data: remove all external or all internal records (a backup file is saved first) -----
async function custWipe(kind){ var X = HCUST; if(!X) return; if(!(OWNER || ISED)) return yqAsk("Only people with edit access can remove data.", {title: "View only", alert: 1});
  var K = canonC(X), w = CLIST.filter(function(c){ return canonC(c.name) === K; })[0], plan = [], back = {customer: X, kind: kind, at: new Date().toISOString(), by: EMAIL, data: {}};
  var isCol = function(c){ return ISROOT ? ISROOT.collection(c) : null; };
  HMSG = 'Counting ' + esc(X) + ' data…'; renderHome();
  try{
    if(kind === "ext"){ var E = (isRows("is_ext") || []).filter(function(x){ return canonC(x.customer) === K; }); if(E.length && isCol("is_ext")) plan.push({lbl: "external inspection records (Inspection Summary)", n: E.length, ids: E.map(function(x){ return x._id; }), col: isCol("is_ext"), rows: E});
      if(w){ var wr = FS.collection("ws").doc(w.id); for(var c of ["insp", "ext"]){ var q = await wr.collection(c).get(); if(q.size) plan.push({lbl: c === "insp" ? "uploaded inspection files on the customer page" : "external records on the customer page", n: q.size, ids: q.docs.map(function(d){ return d.id; }), col: wr.collection(c), rows: q.docs.map(function(d){ return Object.assign({_id: d.id}, d.data()); })}); }
        var sd = await wr.collection("seed").doc("ROWS").get(), sv = sd.exists ? (dec(sd.data().v) || []) : []; if(sv.length) plan.push({lbl: "rows in the starting article list", n: sv.length, seed: wr.collection("seed").doc("ROWS"), rows: sd.data()}); } }
    else { var I = (isRows("is_int") || []).filter(function(x){ return canonC(x.customer) === K; }); if(I.length && isCol("is_int")) plan.push({lbl: "internal (floor) inspection records", n: I.length, ids: I.map(function(x){ return x._id; }), col: isCol("is_int"), rows: I});
      if(isCol("is_extday")){ var qd = await isCol("is_extday").get(), days = []; qd.docs.forEach(function(d){ var v = d.data() || {}, cu = v.cust || {}, ks = Object.keys(cu).filter(function(k){ return canonC(k) === K; }); if(ks.length) days.push({ref: d.ref, raw: v, ks: ks}); }); if(days.length) plan.push({lbl: "days of wastage entries", n: days.length, days: days, rows: days.map(function(x){ var o = {}; x.ks.forEach(function(k){ o[k] = x.raw.cust[k]; }); return {day: x.ref.id, cust: o}; })}); } }
  }catch(e){ HMSG = ""; renderHome(); return yqAsk(errTxt(e), {title: "Could not count the data", alert: 1}); }
  HMSG = ""; renderHome(); var nm = kind === "ext" ? "external" : "internal";
  if(!plan.length) return yqAsk("There is no " + nm + " data for " + X + ".", {title: "Nothing to remove", alert: 1});
  var v = await yqAsk("This removes for " + X + ":\n" + plan.map(function(p){ return "• " + p.n.toLocaleString() + " " + p.lbl; }).join("\n") + "\n\nA backup file is saved on this device first. Then upload the correct file again.\n\nType the customer name to confirm:", {title: "Remove all " + nm + " data of " + X + "?", input: "", placeholder: X, ok: "Remove", danger: 1});
  if(v == null) return; if(String(v).trim().toLowerCase() !== X.toLowerCase()) return yqAsk("The name did not match, nothing was removed.", {title: "Not removed", alert: 1});
  plan.forEach(function(p, i){ back.data[i + ":" + p.lbl] = p.rows; });
  try{ saveBlob("YQI-" + X.replace(/[^A-Za-z0-9]+/g, "-") + "-" + nm + "-backup-" + ymd(new Date()) + ".json", new Blob([JSON.stringify(back)], {type: "application/json"})); }catch(e){}
  window.__yqBusy = 1; window.__yqMine = Date.now(); var done = 0, all = plan.reduce(function(s, p){ return s + p.n; }, 0), tick = function(){ window.__yqMine = Date.now(); HMSG = 'Removing ' + esc(X) + ' ' + nm + ' data… ' + done.toLocaleString() + ' / ' + all.toLocaleString(); renderHome(); };
  try{ for(var p of plan){ if(p.ids){ for(var i = 0; i < p.ids.length; i += 400){ var part = p.ids.slice(i, i + 400); if(FS.batch){ var bt = FS.batch(); part.forEach(function(id){ bt.delete(p.col.doc(id)); }); await bt.commit(); } else await Promise.all(part.map(function(id){ return p.col.doc(id).delete(); })); done += part.length; tick(); } }
      else if(p.seed){ await p.seed.set({v: []}); done += p.n; tick(); }
      else if(p.days){ for(var d of p.days){ var raw = JSON.parse(JSON.stringify(d.raw)); d.ks.forEach(function(k){ delete raw.cust[k]; }); await d.ref.set(raw); done++; } tick(); } }
    window.__yqBusy = 0; HMSG = '<span class="hok">✓ Removed ' + all.toLocaleString() + ' ' + nm + ' records of ' + esc(X) + '. Backup saved. Upload the correct file now.</span>'; HDATA = null; loadHomeTry(0); renderHome(); try{ if(window.yqDataPing) yqDataPing(kind === "ext" ? "is_ext" : "is_int", X + " " + nm + " data removed", ""); }catch(e){} }
  catch(e){ window.__yqBusy = 0; HMSG = ""; renderHome(); yqAsk(errTxt(e) + "\n" + done + " of " + all + " were removed. The backup file has everything.", {title: "Stopped", alert: 1}); } }


// Jarvis reads the data already loaded in this browser (no extra Firebase reads)
window.YQJDATA = function(){ var g = function(c){ try{ return isRows(c) || []; }catch(e){ return []; } }, D = {ext: g("is_ext"), int: g("is_int"), wst: window.YQWST || null, capa: CAPA || []}; if(CAPA || !FS) return Promise.resolve(D); return Promise.race([capaLoad().then(function(L){ D.capa = L || []; return D; }), new Promise(function(r){ setTimeout(function(){ r(D); }, 2500); })]).catch(function(){ return D; }); };
