
// ===================== Wash QC — Floor ↔ Washing (gate pass, washing QC 5%, return, acknowledge, report) =====================
(function(){
  var GID = "grp_wash", GNAME = "Wash QC · Floor ↔ Washing", GDESC = "Gate pass to washing, washing QC 5%, return to floor and acknowledge";
  var ROWS = [], UN = null, RF = null, ST = {r: "7", f: "", t: "", route: "", q: "", tab: "all"};
  function $(id){ return document.getElementById(id); }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c]; }); }
  function n0(v){ return Math.round(+v || 0).toLocaleString("en-US"); }
  function pad(n){ return (n < 10 ? "0" : "") + n; }
  function hm(t){ var d = new Date(t); return pad(d.getHours()) + ":" + pad(d.getMinutes()); }
  function dt(t){ var d = new Date(t); return pad(d.getDate()) + " " + "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ")[d.getMonth()] + " " + hm(t); }
  function ymd(d){ return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function fs(){ return firebase.firestore(); }
  function uid(){ var u = firebase.auth().currentUser; return u ? u.uid : ""; }
  function who(u){ try{ var p = window.YQCHAT && YQCHAT.people()[u]; if(p && p.name) return p.name; }catch(e){} var c = firebase.auth().currentUser; return u === uid() && c ? (c.displayName || String(c.email || "").split("@")[0]) : "Someone"; }
  function first(u){ return u === uid() ? "You" : who(u).split(" ")[0]; }
  function toast(t){ var d = document.createElement("div"); d.className = "wqToast"; d.textContent = t; document.body.appendChild(d); setTimeout(function(){ d.remove(); }, 2600); }
  function gpNo(){ var d = new Date(); return pad(d.getMonth() + 1) + pad(d.getDate()) + "-" + pad(d.getHours()) + pad(d.getMinutes()) + Math.random().toString(36).slice(2, 4).toUpperCase(); }
  var TY = {gp: {ic: "🚚", lb: "GATE PASS · FLOOR → WASHING", col: "#10260F", fg: "#A6DD5E"}, qc: {ic: "🧪", lb: "WASHING QC 5%", col: "#1F5FAF", fg: "#fff"}, rt: {ic: "📦", lb: "RETURN · WASHING → FLOOR", col: "#B87A12", fg: "#fff"}};
  var CHK = [["hand", "Hand feel"], ["col", "Colour / shade"], ["shr", "Shrinkage / size"], ["stn", "Stains / spots"], ["dmg", "Fabric / stitch damage"], ["odr", "Smell / dampness"]];

  // ---------- data ----------
  function listen(){ if(UN) return; try{ UN = fs().collection("chats").doc(GID).collection("m").where("k", "==", "wash").onSnapshot(function(q){ ROWS = q.docs.map(function(d){ return Object.assign({id: d.id}, d.data()); }).filter(function(m){ return !m.del; }).sort(function(a, b){ return a.at - b.at; }); if(RF) RF(); }, function(e){ ROWS = []; UN = null; if(RF) RF(e); }); }catch(e){} }
  function chains(){ var G = {}, L = [];
    ROWS.forEach(function(m){ if(m.wt === "gp"){ G[m.id] = {gp: m, qc: [], rt: []}; L.push(G[m.id]); } });
    ROWS.forEach(function(m){ var c = m.gp && G[m.gp]; if(!c) return; if(m.wt === "qc") c.qc.push(m); if(m.wt === "rt") c.rt.push(m); });
    L.forEach(calc); return L; }
  function calc(c){ var g = c.gp, sent = +g.qty || 0, wr = g.ack ? +g.ack.q || 0 : null, ret = 0, fr = 0, frAll = true, iss = [];
    c.rt.forEach(function(r){ ret += +r.qty || 0; if(r.ack){ fr += +r.ack.q || 0; if(!r.ack.ok) iss.push({by: "Reported by Floor QC", t: r.ack.note || "Issue on return", m: r}); } else frAll = false; });
    if(g.ack && !g.ack.ok) iss.push({by: "Reported by Washing", t: g.ack.note || "Issue on receiving", m: g});
    var q = c.qc[c.qc.length - 1]; if(q && q.res === "Fail") iss.push({by: "Washing QC – fail", t: "QC failed" + (q.note ? ": " + q.note : ""), m: q});
    c.sent = sent; c.wr = wr; c.ret = ret; c.fr = fr; c.q = q; c.iss = iss;
    c.s1 = wr == null ? 0 : sent - wr;                 // short floor → washing (production / transit)
    c.s2 = wr == null || !c.rt.length ? 0 : Math.max(0, wr - ret - (ret >= wr ? 0 : 0)); // still with washing or lost there
    c.s3 = c.rt.length && frAll ? ret - fr : 0;        // short washing → floor (after washing signed the return)
    var left = wr == null ? sent : wr - ret;
    c.st = wr == null ? "wait" : !c.rt.length ? (q ? "qcd" : "inw") : !frAll ? "rtw" : left > 0 ? "part" : "done";
    if(c.st === "done" && (c.s1 || c.s3 || iss.length)) c.st = "iss";
    c.ackT = g.ack ? g.ack.at - g.at : null; return c; }
  var STL = {wait: ["Waiting washing receive", "#9A6A00", "#FCE7BF"], inw: ["In washing", "#1F5FAF", "#DCE8F7"], qcd: ["QC done · in washing", "#1F5FAF", "#DCE8F7"], rtw: ["Returned · waiting floor", "#9A6A00", "#FCE7BF"], part: ["Part returned", "#9A6A00", "#FCE7BF"], done: ["Closed", "#2a5216", "#DDF1C6"], iss: ["Closed with issue", "#B3261E", "#FDEBEA"]};
  function chip(st){ var s = STL[st] || STL.wait; return '<span class="wqChip" style="color:' + s[1] + ';background:' + s[2] + '">' + s[0] + '</span>'; }

  // ---------- chat card ----------
  function thumbs(ph){ if(!ph || !ph.length) return ""; return '<div class="wqPh n' + Math.min(ph.length, 3) + '">' + ph.slice(0, 3).map(function(p, i){ return '<img src="' + esc(p.th || "") + '" data-wq="img" data-f="' + esc(p.id) + '" alt="">' + (i === 2 && ph.length > 3 ? '<b>+' + (ph.length - 3) + '</b>' : ''); }).join("") + '</div>'; }
  function card(m){ var T = TY[m.wt] || TY.gp, me = uid(), h = '<div class="wqCard">';
    h += '<div class="wqTop" style="background:' + T.col + ';color:' + T.fg + '"><b>' + T.ic + ' ' + T.lb + '</b><span>' + esc(m.no || "") + (m.route ? " · Route " + esc(m.route) : "") + '</span></div>';
    h += thumbs(m.ph);
    h += '<div class="wqBody"><div class="wqY">YTM <b>' + esc(m.ytm || "—") + '</b>' + (m.cust ? ' · ' + esc(m.cust) : '') + '</div>' + (m.prog ? '<div class="wqS">' + esc(m.prog) + (m.art ? " · " + esc(m.art) : "") + '</div>' : '');
    if(m.wt === "gp") h += '<div class="wqN"><b>' + n0(m.qty) + ' pcs</b>' + (m.bun ? ' · ' + n0(m.bun) + ' bundles' : '') + (m.tr ? ' · ' + n0(m.tr) + ' trolley' + (m.tr > 1 ? 's' : '') : '') + '</div>';
    if(m.wt === "qc") h += '<div class="wqN"><b class="' + (m.res === "Fail" ? "bad" : "ok") + '">' + esc(m.res || "") + '</b> · ' + n0(m.n) + ' checked of ' + n0(m.lot) + (m.def ? ' · ' + n0(m.def) + ' defects' : '') + '</div><div class="wqChk">' + CHK.map(function(k){ var v = m.chk && m.chk[k[0]]; return '<span class="' + (v === 0 ? "bad" : "ok") + '">' + (v === 0 ? "✗ " : "✓ ") + k[1] + '</span>'; }).join("") + '</div>';
    if(m.wt === "rt") h += '<div class="wqN"><b>' + n0(m.qty) + ' pcs</b>' + (m.pal ? ' · ' + n0(m.pal) + ' pallet' + (m.pal > 1 ? 's' : '') : '') + (m.wrap ? ' · wrapped' : '') + (m.short ? ' · <span class="bad">' + n0(m.short) + ' short</span>' : '') + '</div>';
    if(m.note) h += '<div class="wqNote">' + esc(m.note) + '</div>';
    h += '<div class="wqBy">' + esc(who(m.by)) + ' · ' + hm(m.at) + '</div></div>';
    if(m.wt !== "qc"){ var whoAck = m.wt === "gp" ? "Washing" : "Floor QC";
      if(m.ack) h += '<div class="wqAck ' + (m.ack.ok ? "ok" : "bad") + '">' + (m.ack.ok ? "✓ Received by " : "⚠ Issue · ") + esc(first(m.ack.by)) + ' · ' + hm(m.ack.at) + ' · ' + n0(m.ack.q) + ' pcs' + (m.ack.q != m.qty ? ' (' + (m.ack.q - m.qty > 0 ? "+" : "") + n0(m.ack.q - m.qty) + ')' : '') + (m.ack.note ? '<small>' + esc(m.ack.note) + '</small>' : '') + (m.ack.ph && m.ack.ph.length ? thumbs(m.ack.ph) : '') + '</div>';
      else h += '<div class="wqWait">Waiting for ' + whoAck + '</div><div class="wqBtns"><button data-wq="ack" data-id="' + m.id + '" data-ok="1">✓ Acknowledge</button><button data-wq="ack" data-id="' + m.id + '" data-ok="0" class="bad">⚠ Issue</button></div>'; }
    else h += '<div class="wqBtns"><button data-wq="rep" class="gh">📊 Open report</button></div>';
    return h + '</div>'; }
  function strip(){ return '<div class="wqStrip"><button data-wq="new" data-t="gp">🚚 Gate pass</button><button data-wq="new" data-t="qc">🧪 Wash QC</button><button data-wq="new" data-t="rt">📦 Return</button><button data-wq="rep">📊 Report</button></div>'; }

  // ---------- overlay ----------
  function ov(html, tag){ var o = document.createElement("div"); o.className = "wqOv"; o.innerHTML = html; document.body.appendChild(o); document.body.style.overflow = "hidden";
    var done = false, close = function(){ if(done) return; done = true; o.remove(); if(!document.querySelector(".wqOv")) document.body.style.overflow = ""; };
    try{ YQBACK.push(function(){ close(); }, tag || "wq"); }catch(e){}
    o.__close = function(){ if(done) return; try{ if(window.YQBACK && YQBACK.back()) { setTimeout(close, 350); return; } }catch(e){} close(); };
    o.querySelectorAll("[data-x]").forEach(function(b){ b.onclick = o.__close; }); return o; }
  function resize(f, max){ return new Promise(function(res){ var u = URL.createObjectURL(f), im = new Image(); im.onload = function(){ var s = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement("canvas"); c.width = Math.round(im.width * s); c.height = Math.round(im.height * s); c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(u); res(c.toDataURL("image/jpeg", .6)); }; im.onerror = function(){ res(""); }; im.src = u; }); }
  function phPicker(o, key){ var P = []; var box = o.querySelector('[data-ph="' + key + '"]'); if(!box) return P;
    var draw = function(){ box.querySelector(".wqPl").innerHTML = P.map(function(p, i){ return '<span><img src="' + p.th + '"><i data-rm="' + i + '">✕</i></span>'; }).join("") ; box.querySelectorAll("[data-rm]").forEach(function(x){ x.onclick = function(){ P.splice(+x.dataset.rm, 1); draw(); }; }); };
    box.querySelectorAll("input[type=file]").forEach(function(inp){ inp.onchange = function(){ var fs0 = [].slice.call(inp.files).filter(function(f){ return /^image\//.test(f.type); }); inp.value = ""; fs0.slice(0, 6 - P.length).forEach(function(f){ resize(f, 260).then(function(th){ P.push({f: f, th: th}); draw(); }); }); }; });
    return P; }
  function phField(key, label){ return '<div class="wqF" data-ph="' + key + '"><label>' + label + '</label><div class="wqPl"></div><div class="wqPb"><label class="wqCam">📷 Camera<input type="file" accept="image/*" capture="environment" hidden></label><label class="wqCam gh">🖼 Gallery<input type="file" accept="image/*" multiple hidden></label></div></div>'; }
  function upPhotos(P, st){ var out = [], i = 0; return P.reduce(function(pr, p){ return pr.then(function(){ i++; st("Uploading photo " + i + " of " + P.length + "…"); return YQCHAT.putFile(p.f, "wash_" + Date.now() + ".jpg").then(function(r){ out.push({id: r.id, th: p.th}); }); }); }, Promise.resolve()).then(function(){ return out; }); }
  function olFind(y){ var O = window.YQOL || {}; y = String(y || "").trim().toUpperCase(); if(!y) return null; if(O[y]) return O[y]; var k = Object.keys(O).filter(function(x){ return x.toUpperCase() === y || String(O[x].ytm || "").toUpperCase() === y; })[0]; return k ? O[k] : null; }

  function post(m, prev){ if(!window.YQCHAT || !YQCHAT.washPost) return Promise.reject(new Error("Chat is not ready yet")); return YQCHAT.washPost(GID, m, prev); }

  // ---------- forms ----------
  function openChains(fn){ return chains().filter(fn).reverse(); }
  function newForm(t){ if(!uid()) return toast("Please sign in first");
    try{ window.yqOlGet && yqOlGet(); }catch(e){}
    var T = TY[t], o, pick = "", route = "A";
    var head = '<div class="wqHd" style="background:' + T.col + ';color:' + T.fg + '"><button data-x>‹</button><div><b>' + T.ic + ' ' + {gp: "New gate pass", qc: "Washing QC – 5% random check", rt: "Return to floor"}[t] + '</b><small>' + {gp: "Floor → Washing · Production QC fills", qc: "Washing QC fills · sample is 5% of the received qty", rt: "Washing fills · Floor QC will acknowledge"}[t] + '</small></div></div>';
    var body = '<div class="wqFm">';
    if(t === "gp"){
      body += '<div class="wqF"><label>Route</label><div class="wqSeg" data-seg="route"><button data-v="A" class="on">A · Precut panels</button><button data-v="B">B · Stitched article</button></div></div>';
      body += '<div class="wqF"><label>YTM</label><input data-k="ytm" list="wqYl" placeholder="e.g. 2395" inputmode="text" autocomplete="off"><datalist id="wqYl"></datalist><div class="wqInfo" data-info></div></div>';
      body += '<div class="wqG2"><div class="wqF"><label>Quantity (pcs)</label><input data-k="qty" type="number" inputmode="numeric" min="1"></div><div class="wqF" data-only="A"><label>Bundles</label><input data-k="bun" type="number" inputmode="numeric" min="0"></div><div class="wqF" data-only="B" style="display:none"><label>Trolleys</label><input data-k="tr" type="number" inputmode="numeric" min="0"></div></div>';
      body += phField("ph", "Photos – trolley / bundles (at least 1)") + '<div class="wqF"><label>Note (optional)</label><textarea data-k="note" rows="2" placeholder="Anything washing should know"></textarea></div>';
    } else {
      var L = t === "qc" ? openChains(function(c){ return c.wr != null && c.st !== "done" && c.st !== "iss"; }) : openChains(function(c){ return c.wr != null && (c.wr - c.ret) > 0; });
      body += '<div class="wqF"><label>Pick the gate pass</label>' + (L.length ? '<div class="wqPick">' + L.map(function(c){ var g = c.gp; return '<button data-gp="' + g.id + '"><b>' + esc(g.no) + ' · YTM ' + esc(g.ytm) + '</b><small>' + esc(g.cust || "") + ' · received ' + n0(c.wr) + (c.ret ? ' · returned ' + n0(c.ret) : '') + ' · ' + dt(g.at) + '</small>' + chip(c.st) + '</button>'; }).join("") + '</div>' : '<div class="wqEmpty">No gate pass is waiting. Washing must first acknowledge a gate pass in the group.</div>') + '</div>';
      body += '<div data-after style="display:none">';
      if(t === "qc"){
        body += '<div class="wqG2"><div class="wqF"><label>Lot received</label><input data-k="lot" type="number" readonly></div><div class="wqF"><label>Checked (5%)</label><input data-k="n" type="number" inputmode="numeric"></div></div>';
        body += '<div class="wqF"><label>Checks – tap to mark Not OK</label><div class="wqChks">' + CHK.map(function(k){ return '<button data-ck="' + k[0] + '" class="ok">✓ ' + k[1] + '</button>'; }).join("") + '</div></div>';
        body += '<div class="wqG2"><div class="wqF"><label>Defective pcs found</label><input data-k="def" type="number" inputmode="numeric" min="0" value="0"></div><div class="wqF"><label>Result</label><div class="wqSeg" data-seg="res"><button data-v="Pass" class="on">Pass</button><button data-v="Fail">Fail</button></div></div></div>';
        body += phField("ph", "Photos (optional)") + '<div class="wqF"><label>Note</label><textarea data-k="note" rows="2" placeholder="Hand feel, shade, any remarks"></textarea></div>';
      } else {
        body += '<div class="wqG2"><div class="wqF"><label>Quantity returned (pcs)</label><input data-k="qty" type="number" inputmode="numeric" min="1"></div><div class="wqF"><label>Pallets</label><input data-k="pal" type="number" inputmode="numeric" min="0" value="1"></div></div>';
        body += '<div class="wqF"><label>Packed</label><div class="wqSeg" data-seg="wrap"><button data-v="1" class="on">Palletized &amp; wrapped</button><button data-v="0">Not wrapped</button></div></div>';
        body += phField("ph", "Photos – wrapped pallet (at least 1)") + '<div class="wqF"><label>Note (e.g. pcs kept for QC sample)</label><textarea data-k="note" rows="2"></textarea></div>';
      }
      body += '</div>';
    }
    body += '<div class="wqSt" data-st></div><button class="wqGo" data-go>' + {gp: "Send to washing group →", qc: "Post QC result →", rt: "Send return to floor →"}[t] + '</button></div>';
    o = ov('<div class="wqPg">' + head + body + '</div>', "wqf");
    var V = function(k){ var e = o.querySelector('[data-k="' + k + '"]'); return e ? e.value.trim() : ""; }, setV = function(k, v){ var e = o.querySelector('[data-k="' + k + '"]'); if(e) e.value = v; };
    var seg = {route: "A", res: "Pass", wrap: "1"};
    o.querySelectorAll("[data-seg]").forEach(function(sg){ sg.querySelectorAll("button").forEach(function(b){ b.onclick = function(){ sg.querySelectorAll("button").forEach(function(x){ x.classList.toggle("on", x === b); }); seg[sg.dataset.seg] = b.dataset.v; if(sg.dataset.seg === "route") o.querySelectorAll("[data-only]").forEach(function(e){ e.style.display = e.dataset.only === b.dataset.v ? "" : "none"; }); }; }); });
    var P = phPicker(o, "ph"), olm = null;
    if(t === "gp"){ var yi = o.querySelector('[data-k="ytm"]'), info = o.querySelector("[data-info]");
      var fill = function(){ var r = olFind(yi.value); olm = r; info.innerHTML = r ? '<b>' + esc(r.cust || "") + '</b> · ' + esc(r.prog || "") + (r.art ? ' · ' + esc(r.art) : '') + (r.qty ? ' · order ' + n0(r.qty) : '') : (yi.value.trim() ? '<span class="dim">Not in one-liner – you can still send</span>' : ''); };
      yi.oninput = function(){ fill(); var q = yi.value.trim().toUpperCase(), O = window.YQOL || {}; if(q.length < 2) return; o.querySelector("#wqYl").innerHTML = Object.keys(O).filter(function(k){ return k.toUpperCase().indexOf(q) === 0; }).slice(0, 12).map(function(k){ return '<option value="' + esc(k) + '">' + esc((O[k].cust || "") + " · " + (O[k].prog || "")) + '</option>'; }).join(""); };
      yi.onchange = fill; setTimeout(function(){ yi.focus(); }, 200); }
    o.querySelectorAll("[data-ck]").forEach(function(b){ b.onclick = function(){ var bad = b.classList.toggle("bad"); b.classList.toggle("ok", !bad); b.textContent = (bad ? "✗ " : "✓ ") + b.textContent.slice(2); var any = o.querySelector("[data-ck].bad"); var sg = o.querySelector('[data-seg="res"]'); sg.querySelectorAll("button").forEach(function(x){ x.classList.toggle("on", x.dataset.v === (any ? "Fail" : "Pass")); }); seg.res = any ? "Fail" : "Pass"; }; });
    o.querySelectorAll("[data-gp]").forEach(function(b){ b.onclick = function(){ o.querySelectorAll("[data-gp]").forEach(function(x){ x.classList.toggle("on", x === b); }); pick = b.dataset.gp; var c = chains().filter(function(x){ return x.gp.id === pick; })[0]; o.querySelector("[data-after]").style.display = "";
      if(t === "qc"){ setV("lot", c.wr); setV("n", Math.max(1, Math.ceil(c.wr * .05))); } else setV("qty", Math.max(0, c.wr - c.ret)); o.querySelector("[data-after]").scrollIntoView({behavior: "smooth", block: "start"}); }; });
    var stE = o.querySelector("[data-st]"), st = function(x){ stE.textContent = x; }, go = o.querySelector("[data-go]");
    go.onclick = function(){ var m = {k: "wash", wt: t}, c = null;
      if(t === "gp"){ m.route = seg.route; m.ytm = V("ytm").toUpperCase(); m.qty = +V("qty"); if(!m.ytm) return st("Enter the YTM"); if(!(m.qty > 0)) return st("Enter the quantity");
        if(seg.route === "A") m.bun = +V("bun") || 0; else m.tr = +V("tr") || 0; if(!P.length) return st("Add at least one photo of the trolley / bundles");
        var r = olm || olFind(m.ytm); if(r){ m.cust = r.cust || ""; m.prog = r.prog || ""; m.art = r.art || ""; } m.no = "GP-" + gpNo(); }
      else { if(!pick) return st("Pick the gate pass first"); c = chains().filter(function(x){ return x.gp.id === pick; })[0]; var g = c.gp; m.gp = g.id; m.ytm = g.ytm; m.cust = g.cust || ""; m.prog = g.prog || ""; m.art = g.art || ""; m.route = g.route;
        if(t === "qc"){ m.lot = c.wr; m.n = +V("n"); m.def = +V("def") || 0; m.res = seg.res; m.chk = {}; o.querySelectorAll("[data-ck]").forEach(function(b){ m.chk[b.dataset.ck] = b.classList.contains("bad") ? 0 : 1; }); if(!(m.n > 0)) return st("Enter how many pcs were checked"); m.no = "QC-" + g.no.slice(3); }
        else { m.qty = +V("qty"); m.pal = +V("pal") || 0; m.wrap = seg.wrap === "1" ? 1 : 0; if(!(m.qty > 0)) return st("Enter the quantity returned"); if(m.qty > c.wr - c.ret) return st("Only " + n0(c.wr - c.ret) + " pcs are left with washing for this gate pass"); if(!P.length) return st("Add at least one photo of the wrapped pallet"); var left = c.wr - c.ret - m.qty; m.short = 0; m.no = "RT-" + g.no.slice(3) + (c.rt.length ? "-" + (c.rt.length + 1) : ""); } }
      m.note = V("note");
      go.disabled = true; go.textContent = "Sending…";
      upPhotos(P, st).then(function(ph){ m.ph = ph; m.t = TY[t].ic + " " + m.no + " · YTM " + m.ytm + (m.qty ? " · " + n0(m.qty) + " pcs" : m.res ? " · " + m.res : "");
        return post(m, m.t); }).then(function(){ toast("Sent to " + GNAME); o.__close(); }).catch(function(e){ go.disabled = false; go.textContent = "Try again"; st("Not sent: " + (e.code || e.message)); });
    };
  }
  function ackForm(id, ok){ var m = ROWS.filter(function(x){ return x.id === id; })[0] || (window.YQCHAT && YQCHAT.msg && YQCHAT.msg(id)); if(!m) return toast("Message not found");
    if(m.ack) return toast("Already acknowledged by " + first(m.ack.by));
    var whoA = m.wt === "gp" ? "Washing" : "Floor QC";
    var o = ov('<div class="wqPg"><div class="wqHd" style="background:' + (ok ? "#10260F" : "#B3261E") + ';color:#fff"><button data-x>‹</button><div><b>' + (ok ? "✓ Acknowledge" : "⚠ Report an issue") + ' · ' + esc(m.no) + '</b><small>' + whoA + ' · YTM ' + esc(m.ytm) + ' · sent ' + n0(m.qty) + ' pcs</small></div></div><div class="wqFm">' +
      '<div class="wqF"><label>Quantity received (pcs)</label><input data-k="q" type="number" inputmode="numeric" value="' + (+m.qty || 0) + '"></div>' +
      '<div class="wqF"><label>Condition</label><div class="wqSeg" data-seg="ok"><button data-v="1"' + (ok ? ' class="on"' : '') + '>OK – all good</button><button data-v="0"' + (ok ? '' : ' class="on"') + '>Issue</button></div></div>' +
      phField("ph", "Photo (needed for an issue)") + '<div class="wqF"><label>Note</label><textarea data-k="note" rows="2" placeholder="' + (ok ? "Optional" : "What is wrong? e.g. 2 bundles wet, 9 pcs short") + '"></textarea></div>' +
      '<div class="wqSt" data-st></div><button class="wqGo" data-go>Save acknowledgement →</button></div></div>', "wqa");
    var okv = ok ? 1 : 0; o.querySelectorAll('[data-seg="ok"] button').forEach(function(b){ b.onclick = function(){ o.querySelectorAll('[data-seg="ok"] button').forEach(function(x){ x.classList.toggle("on", x === b); }); okv = +b.dataset.v; }; });
    var P = phPicker(o, "ph"), st = function(x){ o.querySelector("[data-st]").textContent = x; }, go = o.querySelector("[data-go]");
    go.onclick = function(){ var q = +o.querySelector('[data-k="q"]').value, note = o.querySelector('[data-k="note"]').value.trim();
      if(!(q >= 0) || o.querySelector('[data-k="q"]').value === "") return st("Enter the quantity received");
      if(q !== +m.qty && !note) return st("Quantity is different – write a short note why");
      if(!okv && !P.length) return st("Add a photo of the issue");
      if(!okv && !note) return st("Write what the issue is");
      go.disabled = true; go.textContent = "Saving…";
      upPhotos(P, st).then(function(ph){ var a = {by: uid(), at: Date.now(), q: q, ok: okv, note: note}; if(ph.length) a.ph = ph;
        return fs().collection("chats").doc(GID).collection("m").doc(id).update({ack: a}).then(function(){
          var txt = (okv ? "✓ " : "⚠ ") + (m.wt === "gp" ? "Washing received " : "Floor QC received ") + m.no + " · " + n0(q) + " pcs" + (q !== +m.qty ? " (" + (q - m.qty > 0 ? "+" : "") + n0(q - m.qty) + ")" : "") + (okv ? "" : " · ISSUE") + (note ? " · " + note : "");
          return YQCHAT.washPost(GID, {k: "text", t: txt, rp: {id: m.id, by: m.by, t: m.t || m.no}}, txt); }); })
        .then(function(){ toast("Saved"); o.__close(); }).catch(function(e){ go.disabled = false; go.textContent = "Try again"; st("Not saved: " + (e.code || e.message)); });
    }; }

  // ---------- report ----------
  function inRange(at){ var d = new Date(at), s = ymd(d); if(ST.r === "c"){ return (!ST.f || s >= ST.f) && (!ST.t || s <= ST.t); } if(ST.r === "all") return true; var n = +ST.r, z = new Date(); z.setHours(0, 0, 0, 0); return at >= z.getTime() - (n - 1) * 864e5; }
  function report(){ listen(); try{ window.yqOlGet && yqOlGet(); }catch(e){}
    var o = ov('<div class="wqPg wide"><div class="wqHd big"><button data-x>‹</button><div><b>Wash QC report</b><small>Floor ↔ Washing · gate pass, washing QC, return, acknowledge</small></div><div class="wqHa"><button data-a="chat">💬 Group</button><button data-a="csv">⬇ CSV</button><button data-a="pr">🖨 PDF</button></div></div><div class="wqRp" data-rp><div class="wqEmpty">Loading…</div></div></div>', "wqr");
    var B = o.querySelector("[data-rp]");
    o.querySelector('[data-a="chat"]').onclick = function(){ o.__close(); setTimeout(openGroup, 400); };
    o.querySelector('[data-a="csv"]').onclick = function(){ csv(); };
    o.querySelector('[data-a="pr"]').onclick = function(){ document.body.classList.add("wqPrint"); setTimeout(function(){ window.print(); setTimeout(function(){ document.body.classList.remove("wqPrint"); }, 600); }, 100); };
    RF = function(err){ if(!document.body.contains(o)){ RF = null; return; } var y = B.scrollTop; B.innerHTML = rpHtml(err); wire(); B.scrollTop = y; };
    var wire = function(){
      B.querySelectorAll("[data-r]").forEach(function(b){ b.onclick = function(){ ST.r = b.dataset.r; RF(); }; });
      B.querySelectorAll("[data-route]").forEach(function(b){ b.onclick = function(){ ST.route = b.dataset.route; RF(); }; });
      B.querySelectorAll("[data-tab]").forEach(function(b){ b.onclick = function(){ ST.tab = b.dataset.tab; RF(); }; });
      var f = B.querySelector("[data-f]"), t = B.querySelector("[data-t]"); if(f) f.onchange = function(){ ST.f = f.value; ST.r = "c"; RF(); }; if(t) t.onchange = function(){ ST.t = t.value; ST.r = "c"; RF(); };
      var q = B.querySelector("[data-q]"); if(q){ q.oninput = function(){ ST.q = q.value; clearTimeout(q.__t); q.__t = setTimeout(function(){ RF(); var q2 = B.querySelector("[data-q]"); if(q2){ q2.focus(); q2.setSelectionRange(q2.value.length, q2.value.length); } }, 350); }; }
      B.querySelectorAll("[data-open]").forEach(function(r){ r.onclick = function(){ detail(r.dataset.open); }; });
      B.querySelectorAll("[data-new]").forEach(function(b){ b.onclick = function(){ newForm(b.dataset.new); }; });
      B.querySelectorAll("[data-join]").forEach(function(b){ b.onclick = function(){ o.__close(); setTimeout(openGroup, 400); }; });
    };
    RF(); }
  function filtered(){ var q = ST.q.trim().toLowerCase(); return chains().filter(function(c){ var g = c.gp; if(!inRange(g.at)) return false; if(ST.route && g.route !== ST.route) return false; if(q && (g.ytm + " " + g.no + " " + (g.cust || "") + " " + (g.prog || "")).toLowerCase().indexOf(q) < 0) return false; return true; }); }
  function rpHtml(err){
    if(err) return '<div class="wqEmpty"><b>Join the Wash QC group first</b><br>The report reads the group messages.<br><button class="wqGo sm" data-join>Open the group</button></div>';
    var L = filtered(), K = {gp: L.length, sent: 0, wr: 0, ret: 0, fr: 0, s1: 0, s3: 0, pend: 0, qn: 0, qp: 0, ack: [], iss: 0, inw: 0};
    L.forEach(function(c){ K.sent += c.sent; K.wr += c.wr || 0; K.ret += c.ret; K.fr += c.fr; K.s1 += Math.max(0, c.s1); K.s3 += Math.max(0, c.s3); if(c.wr == null) K.pend++; c.rt.forEach(function(r){ if(!r.ack) K.pend++; }); if(c.q){ K.qn++; if(c.q.res !== "Fail") K.qp++; } if(c.ackT != null) K.ack.push(c.ackT); c.rt.forEach(function(r){ if(r.ack) K.ack.push(r.ack.at - r.at); }); K.iss += c.iss.length; if(c.wr != null) K.inw += Math.max(0, c.wr - c.ret); });
    var IS = []; L.forEach(function(c){ c.iss.forEach(function(i){ IS.push({c: c, i: i}); }); if(c.s1 > 0) IS.push({c: c, i: {by: "Production / transit to washing", t: n0(c.s1) + " pcs short when washing received"}}); if(c.s3 > 0) IS.push({c: c, i: {by: "Washing (return)", t: n0(c.s3) + " pcs short when floor received"}}); }); K.iss = IS.length;
    var avg = K.ack.length ? Math.round(K.ack.reduce(function(a, b){ return a + b; }, 0) / K.ack.length / 60000) : null;
    var h = '<div class="wqFl"><div class="wqSeg sm">' + [["1", "Today"], ["7", "7 days"], ["30", "30 days"], ["all", "All"]].map(function(r){ return '<button data-r="' + r[0] + '"' + (ST.r === r[0] ? ' class="on"' : '') + '>' + r[1] + '</button>'; }).join("") + '</div><span class="wqDt"><input type="date" data-f value="' + esc(ST.f) + '"> – <input type="date" data-t value="' + esc(ST.t) + '"></span><div class="wqSeg sm">' + [["", "All routes"], ["A", "Route A"], ["B", "Route B"]].map(function(r){ return '<button data-route="' + r[0] + '"' + (ST.route === r[0] ? ' class="on"' : '') + '>' + r[1] + '</button>'; }).join("") + '</div><input class="wqQ" data-q placeholder="Search YTM, gate pass, customer" value="' + esc(ST.q) + '"></div>';
    h += '<div class="wqHero"><div class="wqFlow">' +
      fl("Sent to washing", K.sent, K.gp + " gate pass" + (K.gp === 1 ? "" : "es"), "#A6DD5E") + '<i>→</i>' +
      fl("Washing received", K.wr, K.s1 ? '<em>' + n0(K.s1) + ' short</em>' : "matched", "#8ec5ff") + '<i>→</i>' +
      fl("Still in washing", K.inw, "after receiving", "#ffd27a") + '<i>→</i>' +
      fl("Returned to floor", K.ret, "by washing", "#ffd27a") + '<i>→</i>' +
      fl("Floor received", K.fr, K.s3 ? '<em>' + n0(K.s3) + ' short</em>' : "matched", "#A6DD5E") + '</div>' +
      '<div class="wqK"><div><b>' + K.pend + '</b><span>Waiting acknowledge</span></div><div><b>' + (avg == null ? "—" : avg < 60 ? avg + " min" : (avg / 60).toFixed(1) + " h") + '</b><span>Avg time to acknowledge</span></div><div><b>' + (K.qn ? Math.round(K.qp / K.qn * 100) + "%" : "—") + '</b><span>Washing QC pass (' + K.qn + ')</span></div><div class="' + (K.iss ? "bad" : "") + '"><b>' + K.iss + '</b><span>Issues</span></div></div></div>';
    if(!ROWS.length) return h + '<div class="wqEmpty"><b>No gate pass yet</b><br>Start from the group: Production QC sends a gate pass, washing acknowledges, washing QC checks 5%, washing returns, floor QC acknowledges.<div class="wqNewB"><button data-new="gp">🚚 New gate pass</button><button data-join>💬 Open group</button></div></div>';
    if(IS.length) h += '<div class="wqSec bad">Open issues · who is responsible</div><div class="wqIss">' + IS.map(function(x){ return '<button data-open="' + x.c.gp.id + '"><b>' + esc(x.c.gp.no) + ' · YTM ' + esc(x.c.gp.ytm) + '</b><span>' + esc(x.i.t) + '</span><em>' + esc(x.i.by) + '</em></button>'; }).join("") + '</div>';
    var tabs = [["all", "All"], ["open", "Open"], ["iss", "With issue"], ["done", "Closed"]];
    var LL = L.filter(function(c){ return ST.tab === "all" || (ST.tab === "open" ? ["wait", "inw", "qcd", "rtw", "part"].indexOf(c.st) >= 0 : ST.tab === "iss" ? c.iss.length || c.s1 > 0 || c.s3 > 0 : c.st === "done"); }).reverse();
    h += '<div class="wqSec">Gate passes <span class="wqSeg sm">' + tabs.map(function(t){ return '<button data-tab="' + t[0] + '"' + (ST.tab === t[0] ? ' class="on"' : '') + '>' + t[1] + '</button>'; }).join("") + '</span></div>';
    h += '<div class="wqTbl"><div class="wqTr wqTh"><span>Gate pass</span><span>YTM · customer</span><span>Route</span><span>Sent</span><span>Wash rcv</span><span>QC</span><span>Returned</span><span>Floor rcv</span><span>Status</span></div>' +
      (LL.length ? LL.map(function(c){ var g = c.gp; return '<button class="wqTr" data-open="' + g.id + '"><span><b>' + esc(g.no) + '</b><small>' + dt(g.at) + '</small></span><span><b>' + esc(g.ytm) + '</b><small>' + esc(g.cust || "") + '</small></span><span>' + esc(g.route || "") + '</span><span>' + n0(c.sent) + '</span><span>' + (c.wr == null ? "—" : n0(c.wr) + (c.s1 ? ' <em>−' + n0(c.s1) + '</em>' : '')) + '</span><span>' + (c.q ? '<b class="' + (c.q.res === "Fail" ? "bad" : "ok") + '">' + esc(c.q.res) + '</b>' : "—") + '</span><span>' + (c.rt.length ? n0(c.ret) : "—") + '</span><span>' + (c.rt.length && c.rt.every(function(r){ return r.ack; }) ? n0(c.fr) + (c.s3 ? ' <em>−' + n0(c.s3) + '</em>' : '') : "—") + '</span><span>' + chip(c.st) + '</span></button>'; }).join("") : '<div class="wqEmpty">Nothing in this filter</div>') + '</div>';
    return h; }
  function fl(l, v, s, c){ return '<div class="wqFb"><span>' + l + '</span><b style="color:' + c + '">' + n0(v) + '</b><small>' + s + '</small></div>'; }
  function detail(id){ var c = chains().filter(function(x){ return x.gp.id === id; })[0]; if(!c) return; var g = c.gp;
    var step = function(ic, t, who0, at, body, ok){ return '<div class="wqStep ' + (ok === 0 ? "bad" : ok === 1 ? "ok" : "wait") + '"><i>' + ic + '</i><div><b>' + t + '</b><small>' + (at ? esc(who0) + ' · ' + dt(at) : esc(who0)) + '</small>' + (body || "") + '</div></div>'; };
    var h = step("🚚", "Gate pass " + esc(g.no) + " · " + n0(g.qty) + " pcs" + (g.bun ? " · " + n0(g.bun) + " bundles" : "") + (g.tr ? " · " + n0(g.tr) + " trolleys" : ""), who(g.by), g.at, thumbs(g.ph) + (g.note ? '<p>' + esc(g.note) + '</p>' : ''), 1);
    h += g.ack ? step(g.ack.ok ? "✓" : "⚠", "Washing received " + n0(g.ack.q) + " pcs" + (c.s1 ? " · " + n0(c.s1) + " short" : ""), who(g.ack.by), g.ack.at, thumbs(g.ack.ph) + (g.ack.note ? '<p>' + esc(g.ack.note) + '</p>' : ''), g.ack.ok && !c.s1 ? 1 : 0) : step("⏳", "Waiting for washing to acknowledge", "Washing", 0, "", null);
    c.qc.forEach(function(q){ h += step("🧪", "Washing QC " + esc(q.res) + " · " + n0(q.n) + " of " + n0(q.lot) + " checked" + (q.def ? " · " + n0(q.def) + " defects" : ""), who(q.by), q.at, '<div class="wqChk">' + CHK.map(function(k){ var v = q.chk && q.chk[k[0]]; return '<span class="' + (v === 0 ? "bad" : "ok") + '">' + (v === 0 ? "✗ " : "✓ ") + k[1] + '</span>'; }).join("") + '</div>' + thumbs(q.ph) + (q.note ? '<p>' + esc(q.note) + '</p>' : ''), q.res === "Fail" ? 0 : 1); });
    c.rt.forEach(function(r){ h += step("📦", "Return " + esc(r.no) + " · " + n0(r.qty) + " pcs" + (r.pal ? " · " + n0(r.pal) + " pallet" + (r.pal > 1 ? "s" : "") : "") + (r.wrap ? " · wrapped" : " · NOT wrapped"), who(r.by), r.at, thumbs(r.ph) + (r.note ? '<p>' + esc(r.note) + '</p>' : ''), r.wrap ? 1 : 0);
      h += r.ack ? step(r.ack.ok ? "✓" : "⚠", "Floor QC received " + n0(r.ack.q) + " pcs" + (r.ack.q < r.qty ? " · " + n0(r.qty - r.ack.q) + " short" : ""), who(r.ack.by), r.ack.at, thumbs(r.ack.ph) + (r.ack.note ? '<p>' + esc(r.ack.note) + '</p>' : ''), r.ack.ok && r.ack.q >= r.qty ? 1 : 0) : step("⏳", "Waiting for floor QC to acknowledge", "Floor QC", 0, '<div class="wqBtns"><button data-wq="ack" data-id="' + r.id + '" data-ok="1">✓ Acknowledge</button><button data-wq="ack" data-id="' + r.id + '" data-ok="0" class="bad">⚠ Issue</button></div>', null); });
    if(!g.ack) h += '<div class="wqBtns pad"><button data-wq="ack" data-id="' + g.id + '" data-ok="1">✓ Washing acknowledge</button><button data-wq="ack" data-id="' + g.id + '" data-ok="0" class="bad">⚠ Issue</button></div>';
    var o = ov('<div class="wqPg"><div class="wqHd"><button data-x>‹</button><div><b>' + esc(g.no) + ' · YTM ' + esc(g.ytm) + '</b><small>' + esc([g.cust, g.prog, g.art, "Route " + g.route].filter(Boolean).join(" · ")) + '</small></div>' + chip(c.st) + '</div><div class="wqFm"><div class="wqMini"><div><b>' + n0(c.sent) + '</b><span>Sent</span></div><div><b>' + (c.wr == null ? "—" : n0(c.wr)) + '</b><span>Wash rcv</span></div><div><b>' + n0(c.ret) + '</b><span>Returned</span></div><div><b>' + n0(c.fr) + '</b><span>Floor rcv</span></div></div><div class="wqSteps">' + h + '</div></div></div>', "wqd");
  }
  function csv(){ var L = filtered(), q = function(v){ v = String(v == null ? "" : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    var rows = [["Gate pass", "Date", "YTM", "Customer", "Program", "Route", "Sent", "Washing received", "Short to washing", "QC result", "QC checked", "Returned", "Floor received", "Short to floor", "Status", "Issues"]].concat(L.map(function(c){ var g = c.gp; return [g.no, dt(g.at), g.ytm, g.cust, g.prog, g.route, c.sent, c.wr == null ? "" : c.wr, c.s1 || "", c.q ? c.q.res : "", c.q ? c.q.n : "", c.ret || "", c.fr || "", c.s3 || "", (STL[c.st] || [""])[0], c.iss.map(function(i){ return i.by + ": " + i.t; }).join(" | ")]; }));
    var b = new Blob(["﻿" + rows.map(function(r){ return r.map(q).join(","); }).join("\n")], {type: "text/csv"}), a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "Wash_QC_report_" + ymd(new Date()) + ".csv"; document.body.appendChild(a); a.click(); setTimeout(function(){ a.remove(); }, 500); }
  function viewImg(id){ var o = ov('<div class="wqImgV"><button data-x>✕</button><img alt=""></div>', "wqi"); YQCHAT.fileUrl(id).then(function(u){ o.querySelector("img").src = u; }).catch(function(){ toast("Photo not available"); }); }
  function openGroup(){ if(!window.YQCHAT || !YQCHAT.washOpen) return toast("Chat is loading – try again in a moment"); YQCHAT.washOpen(GID, GNAME, GDESC); }

  var TPL = {int: "#INTERNAL\nDate: {d}\nCustomer: \nYTM: \nArticle: \nUnit: \nOffer Qty: \nSample: \nAllowed: \nFound: \nPackaging: Pass\nWorkmanship: Pass\nResult: \nDefects: \nInspector: ", ext: "#EXTERNAL\nDate: {d}\nCustomer: \nYTM: \nPO: \nArticle: \nUnit: \nInspector: \nQty: \nSample: \nMajor: /\nMinor: /\nResult: \nDefects: "};
  document.addEventListener("click", function(e){ var b = e.target.closest && e.target.closest("[data-yqf]"); if(!b) return; e.stopPropagation(); e.preventDefault(); var tx = $("ycTx"); if(!tx) return; var d = new Date();
    tx.value = TPL[b.getAttribute("data-yqf")].replace("{d}", pad(d.getDate()) + "-" + pad(d.getMonth() + 1) + "-" + d.getFullYear()); tx.dispatchEvent(new Event("input")); tx.focus(); var k = tx.value.indexOf("Customer: ") + 10; try{ tx.setSelectionRange(k, k); }catch(x){} }, true);
  // clicks from chat cards / strip (chat stops bubbling, so listen in capture)
  document.addEventListener("click", function(e){ var b = e.target.closest && e.target.closest("[data-wq]"); if(!b) return; e.stopPropagation(); e.preventDefault(); var a = b.getAttribute("data-wq");
    if(a === "new"){ listen(); return newForm(b.getAttribute("data-t")); } if(a === "rep") return report(); if(a === "img") return viewImg(b.getAttribute("data-f"));
    if(a === "ack"){ listen(); var id = b.getAttribute("data-id"), ok = b.getAttribute("data-ok") === "1"; var go0 = function(){ ackForm(id, ok); }; if(!ROWS.some(function(x){ return x.id === id; })) setTimeout(go0, 700); else go0(); } }, true);

  var css = document.createElement("style"); css.textContent = [
  ".wqCard{width:min(300px,68vw);margin:-2px -4px 0;border-radius:12px;overflow:hidden;background:#fff;color:#13240f;font-family:Manrope,Inter,system-ui,sans-serif;border:1px solid #DCE6D2}",
  ".wqTop{display:flex;justify-content:space-between;gap:8px;padding:7px 10px;font-size:10.5px;letter-spacing:.04em}.wqTop span{opacity:.85;white-space:nowrap}",
  ".wqPh{display:grid;gap:2px;padding:2px;position:relative}.wqPh.n2{grid-template-columns:1fr 1fr}.wqPh.n3{grid-template-columns:1fr 1fr 1fr}.wqPh img{width:100%;height:92px;object-fit:cover;border-radius:6px;cursor:zoom-in;background:#eef2e9}.wqPh.n1 img{height:150px}.wqPh b{position:absolute;right:8px;bottom:8px;background:rgba(0,0,0,.6);color:#fff;border-radius:8px;padding:2px 7px;font-size:12px}",
  ".wqBody{padding:8px 11px 6px;font-size:13px;line-height:1.45}.wqY b{font-size:15px}.wqS{color:#55664d;font-size:12px}.wqN{margin-top:3px}.wqNote{margin-top:4px;padding:6px 8px;border-radius:8px;background:#F3F6EE;font-size:12.5px}.wqBy{color:#7a8a72;font-size:11px;margin-top:4px}",
  ".wqChk{display:flex;flex-wrap:wrap;gap:4px;margin-top:5px}.wqChk span{font-size:11px;padding:2px 7px;border-radius:8px;font-weight:700}.wqChk .ok{background:#DDF1C6;color:#2a5216}.wqChk .bad{background:#FDEBEA;color:#B3261E}b.ok{color:#2a7a12}.bad,b.bad{color:#B3261E}",
  ".wqAck{margin:4px 8px 8px;padding:7px 10px;border-radius:10px;font-size:12px;font-weight:800}.wqAck.ok{background:#DDF1C6;color:#2a5216}.wqAck.bad{background:#FDEBEA;color:#B3261E}.wqAck small{display:block;font-weight:600;color:#40503a;margin-top:2px}.wqAck .wqPh{padding:4px 0 0}.wqAck .wqPh img{height:60px}",
  ".wqWait{margin:2px 10px 4px;font-size:11.5px;color:#9A6A00;font-weight:800}.wqBtns{display:flex;gap:6px;padding:0 8px 9px}.wqBtns.pad{padding:8px 0}.wqBtns button{flex:1;border:0;border-radius:10px;padding:9px 6px;font:800 12.5px Manrope,Inter,system-ui,sans-serif;background:#10260F!important;color:#A6DD5E!important;cursor:pointer}.wqBtns button.bad{background:#FDEBEA!important;color:#B3261E!important}.wqBtns button.gh{background:#EEF4E6!important;color:#2a5216!important}",
  ".wqStrip{display:flex;gap:6px;padding:6px 8px;overflow-x:auto;background:#F3F6EE;border-bottom:1px solid #DCE6D2;scrollbar-width:none}.wqStrip button{flex:none;border:1px solid #DCE6D2;background:#fff;border-radius:999px;padding:7px 12px;font:800 12.5px Manrope,Inter,system-ui,sans-serif;color:#10260F!important;cursor:pointer}.wqStrip button:first-child{background:#10260F!important;color:#A6DD5E!important;border-color:#10260F!important}",
  ".wqOv{position:fixed;inset:0;z-index:2147483500;background:rgba(8,20,6,.55);display:flex;justify-content:center;align-items:stretch;font-family:Manrope,Inter,system-ui,sans-serif;color:#13240f;animation:wqIn .18s}@keyframes wqIn{from{opacity:0}}",
  ".wqPg{width:min(560px,100%);background:#F3F6EE;display:flex;flex-direction:column;overflow:hidden}.wqPg.wide{width:min(1180px,100%)}",
  ".wqHd{display:flex;align-items:center;gap:12px;padding:14px 16px;padding-top:max(14px,env(safe-area-inset-top));background:#10260F;color:#fff;flex:none}.wqHd>button{width:38px;height:38px;border-radius:12px;border:0;background:rgba(255,255,255,.14);color:inherit;font-size:22px;cursor:pointer;flex:none}.wqHd>div{flex:1;min-width:0}.wqHd b{display:block;font-size:16.5px}.wqHd small{display:block;font-size:12px;opacity:.8;margin-top:2px}.wqHd.big b{font-size:20px}.wqHa{display:flex;gap:6px;flex:none!important}.wqHa button{border:0;border-radius:10px;padding:8px 11px;background:rgba(255,255,255,.12);color:#fff;font:800 12px Manrope,Inter,sans-serif;cursor:pointer}.wqHa button:first-child{background:#A6DD5E;color:#10260F}",
  ".wqFm{flex:1;overflow:auto;padding:16px;display:flex;flex-direction:column;gap:14px;padding-bottom:max(24px,env(safe-area-inset-bottom))}.wqF{display:flex;flex-direction:column;gap:6px}.wqF>label{font-size:11px;letter-spacing:.12em;font-weight:800;color:#55664d;text-transform:uppercase}",
  ".wqF input,.wqF textarea{border:1px solid #DCE6D2;border-radius:14px;padding:12px 14px;font:600 16px Manrope,Inter,sans-serif;background:#fff;color:#13240f;outline:none;width:100%;box-sizing:border-box}.wqF input:focus,.wqF textarea:focus{border-color:#5BA32A;box-shadow:0 0 0 3px rgba(91,163,42,.18)}.wqF input[readonly]{background:#EEF2E9}.wqG2{display:grid;grid-template-columns:1fr 1fr;gap:10px}",
  ".wqInfo{font-size:12.5px;color:#2a5216}.wqInfo .dim{color:#9A6A00}.wqSeg{display:flex;gap:6px;flex-wrap:wrap}.wqSeg button{flex:1;border:1px solid #DCE6D2;background:#fff;border-radius:12px;padding:11px 8px;font:800 13px Manrope,Inter,sans-serif;color:#40503a;cursor:pointer}.wqSeg button.on{background:#10260F;color:#A6DD5E;border-color:#10260F}.wqSeg.sm button{flex:none;padding:7px 11px;font-size:12px;border-radius:10px}",
  ".wqPl{display:flex;gap:8px;flex-wrap:wrap}.wqPl span{position:relative}.wqPl img{width:76px;height:76px;object-fit:cover;border-radius:12px}.wqPl i{position:absolute;top:-6px;right:-6px;width:22px;height:22px;border-radius:50%;background:#B3261E;color:#fff;font-style:normal;font-size:12px;display:grid;place-items:center;cursor:pointer}.wqPb{display:flex;gap:8px}.wqCam{flex:1;text-align:center;border:2px dashed #A6DD5E;background:#F7FBF1;border-radius:14px;padding:13px;font-weight:800;font-size:13px;color:#2a5216;cursor:pointer;text-transform:none!important;letter-spacing:0!important}.wqCam.gh{border-color:#DCE6D2;background:#fff}",
  ".wqChks{display:grid;grid-template-columns:1fr 1fr;gap:6px}.wqChks button{border:0;border-radius:12px;padding:11px 8px;font:800 12.5px Manrope,Inter,sans-serif;cursor:pointer;text-align:left}.wqChks .ok{background:#DDF1C6;color:#2a5216}.wqChks .bad{background:#FDEBEA;color:#B3261E}",
  ".wqPick{display:flex;flex-direction:column;gap:6px}.wqPick button{display:flex;flex-direction:column;gap:3px;align-items:flex-start;text-align:left;border:1px solid #DCE6D2;background:#fff;border-radius:14px;padding:11px 13px;cursor:pointer;font-family:inherit;color:inherit}.wqPick button.on{border:2px solid #5BA32A;background:#F7FBF1}.wqPick small{color:#55664d;font-size:12px}",
  ".wqChip{display:inline-block;font-size:11px;font-weight:800;padding:3px 9px;border-radius:9px;white-space:nowrap}.wqSt{color:#B3261E;font-weight:700;font-size:13px;min-height:18px}",
  ".wqGo{border:0;border-radius:16px;padding:16px;font:800 16px Manrope,Inter,sans-serif;color:#10260F;background:linear-gradient(90deg,#5BA32A,#A6DD5E);box-shadow:0 10px 24px rgba(91,163,42,.3);cursor:pointer}.wqGo:disabled{opacity:.6}.wqGo.sm{padding:11px 18px;font-size:14px;margin-top:12px}",
  ".wqEmpty{padding:30px 16px;text-align:center;color:#55664d;font-size:14px;line-height:1.55}.wqNewB{display:flex;gap:8px;justify-content:center;margin-top:12px}.wqNewB button{border:0;border-radius:12px;padding:11px 16px;font:800 13px Manrope,Inter,sans-serif;background:#10260F;color:#A6DD5E;cursor:pointer}.wqNewB button+button{background:#fff;color:#10260F;border:1px solid #DCE6D2}",
  ".wqRp{flex:1;overflow:auto;padding:16px;display:flex;flex-direction:column;gap:14px;padding-bottom:40px}.wqFl{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.wqDt{display:flex;gap:4px;align-items:center;font-size:12px;color:#55664d}.wqDt input{border:1px solid #DCE6D2;border-radius:10px;padding:6px 8px;font:600 12.5px Manrope,Inter,sans-serif}.wqQ{flex:1;min-width:180px;border:1px solid #DCE6D2;border-radius:12px;padding:9px 12px;font:600 14px Manrope,Inter,sans-serif}",
  ".wqHero{border-radius:24px;background:radial-gradient(circle at 90% 0,#2d5a1c,#10260F 60%);color:#fff;padding:20px;display:flex;flex-direction:column;gap:16px}.wqFlow{display:flex;align-items:stretch;gap:6px;overflow-x:auto}.wqFlow>i{align-self:center;color:#A6DD5E;font-style:normal;font-weight:800}.wqFb{flex:1;min-width:120px;border-radius:16px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);padding:12px;display:flex;flex-direction:column;gap:3px}.wqFb span{font-size:11px;color:#CFE3BF;font-weight:700}.wqFb b{font-size:26px;letter-spacing:-.5px}.wqFb small{font-size:11.5px;color:#CFE3BF}.wqFb em{color:#ff9b93;font-style:normal;font-weight:800}",
  ".wqK{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.wqK div{border-radius:14px;background:rgba(255,255,255,.07);padding:10px 12px}.wqK b{display:block;font-size:20px}.wqK span{font-size:11.5px;color:#CFE3BF}.wqK .bad{background:rgba(179,38,30,.45)}.wqK .bad b,.wqK .bad span{color:#fff}",
  ".wqSec{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;font-size:12px;letter-spacing:.12em;font-weight:800;color:#55664d;text-transform:uppercase}.wqSec.bad{color:#B3261E}.wqSec .wqSeg{text-transform:none;letter-spacing:0}",
  ".wqIss{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:8px}.wqIss button{display:flex;flex-direction:column;gap:3px;text-align:left;border:0;border-radius:16px;background:#FDEBEA;padding:12px 14px;cursor:pointer;font-family:inherit;color:#13240f}.wqIss span{font-size:13px}.wqIss em{font-style:normal;font-size:11.5px;font-weight:800;color:#B3261E}",
  ".wqTbl{background:#fff;border:1px solid #DCE6D2;border-radius:18px;overflow:hidden}.wqTr{display:grid;grid-template-columns:1.2fr 1.4fr .5fr .7fr .9fr .6fr .8fr .9fr 1.3fr;gap:8px;align-items:center;padding:10px 14px;border:0;border-top:1px solid #EEF2E9;background:#fff;width:100%;text-align:left;font:600 13px Manrope,Inter,sans-serif;color:#13240f;cursor:pointer}.wqTr:hover{background:#F7FBF1}.wqTr.wqTh{display:grid!important;border-top:0;font-size:11px;font-weight:800;color:#55664d;background:#F3F6EE;cursor:default}.wqTr small{display:block;color:#7a8a72;font-size:11px}.wqTr em{color:#B3261E;font-style:normal;font-weight:800}",
  "@media(max-width:760px){.wqTr{grid-template-columns:1.2fr 1fr 1fr;row-gap:4px}.wqTr.wqTh{display:none!important}.wqTr>span:nth-child(3),.wqTr>span:nth-child(6){display:none}.wqK{grid-template-columns:1fr 1fr}.wqHa button{padding:7px 8px}}",
  ".wqMini{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.wqMini div{background:#fff;border:1px solid #DCE6D2;border-radius:14px;padding:10px;text-align:center}.wqMini b{display:block;font-size:18px}.wqMini span{font-size:11px;color:#55664d}",
  ".wqSteps{display:flex;flex-direction:column}.wqStep{display:flex;gap:12px;position:relative;padding-bottom:16px}.wqStep:before{content:'';position:absolute;left:17px;top:36px;bottom:0;width:2px;background:#DCE6D2}.wqStep:last-child:before{display:none}.wqStep>i{width:36px;height:36px;border-radius:12px;flex:none;display:grid;place-items:center;font-style:normal;font-weight:800;background:#DDF1C6;color:#2a5216}.wqStep.bad>i{background:#FDEBEA;color:#B3261E}.wqStep.wait>i{background:#FCE7BF}.wqStep>div{flex:1;min-width:0}.wqStep b{display:block;font-size:14px}.wqStep small{color:#55664d;font-size:12px}.wqStep p{margin:6px 0 0;font-size:13px;background:#fff;border-radius:10px;padding:7px 10px}.wqStep .wqPh{padding:6px 0 0;max-width:330px}",
  ".wqImgV{position:fixed;inset:0;background:rgba(0,0,0,.94);display:grid;place-items:center}.wqImgV img{max-width:100vw;max-height:92vh;object-fit:contain}.wqImgV button{position:absolute;top:14px;right:14px;width:44px;height:44px;border-radius:50%;border:0;background:rgba(255,255,255,.16);color:#fff;font-size:18px;cursor:pointer}",
  ".wqToast{position:fixed;left:50%;bottom:90px;transform:translateX(-50%);z-index:2147483600;background:#10260F;color:#fff;padding:11px 18px;border-radius:14px;font:700 14px Manrope,Inter,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.25)}",
  "@media print{body.wqPrint>*:not(.wqOv){display:none!important}body.wqPrint .wqOv{position:static;background:#fff}body.wqPrint .wqOv:not(:last-of-type){display:none}body.wqPrint .wqPg{width:100%;overflow:visible}body.wqPrint .wqRp{overflow:visible}body.wqPrint .wqHa,body.wqPrint .wqHd>button,body.wqPrint .wqFl{display:none}body.wqPrint *{-webkit-print-color-adjust:exact;print-color-adjust:exact}}"
  ].join("\n"); document.head.appendChild(css);

  window.YQWASH = {GID: GID, card: card, strip: strip, report: report, open: function(){ report(); }, group: openGroup, newForm: newForm};
})();

