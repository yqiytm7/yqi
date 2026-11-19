// ===================== YQI Chat v2 — chats, groups, status, calls, video, meetings =====================
(function(){
"use strict";
var FS, FV, MY = "", EMAIL = "", ME = null, started = false;
var PEOPLE = {}, CHATS = {}, CALLS = [], STATUS = [], MEETS = {}, MSGS = [], OPEN = null;
var VIEW = "home", TAB = "chats", FILTER = "all", STACK = [], PARAM = {};
var unMsgs = null, firstChats = true, MSGLIM = 60, REPLY = null, SEARCHQ = "";
var MAXF = 12 * 1024 * 1024, CHUNK = 700000, DARK = false;
function ask(m, o){ return window.yqAsk ? window.yqAsk(m, o) : Promise.resolve(window.confirm(m)); }
window.YQCHAT = {setToken: function(t, k){ setToken(t, k); },
  washPost: function(cid, m, prev){ if(!MY || !FS) return Promise.reject(new Error("Chat is not ready yet")); var getC = CHATS[cid] ? Promise.resolve(CHATS[cid]) : FS.collection("chats").doc(cid).get().then(function(d){ if(!d.exists) throw new Error("Open the Wash QC group first"); return Object.assign({id: cid}, d.data()); });
    return getC.then(function(c){ m.by = MY; m.at = now(); var ref = FS.collection("chats").doc(cid).collection("m").doc(), u = {at: m.at, last: {t: String(prev || "").slice(0, 120), by: MY, at: m.at, k: m.k === "wash" ? "text" : m.k}}; u["rd." + MY] = m.at; (c.members || []).forEach(function(x){ if(x !== MY) u["n." + x] = FV.increment(1); });
      if(OPEN === cid){ MSGS.push(Object.assign({id: ref.id, pend: 1}, m)); renderMsgs(); }
      return ref.set(m).then(function(){ return FS.collection("chats").doc(cid).update(u); }).then(function(){ try{ pushNote(Object.assign({id: cid}, c), String(prev || "").slice(0, 120)); }catch(e){} return ref.id; }); }); },
  washOpen: function(gid, name, desc){ try{ var pp = $("ycP"); if(!pp || !pp.classList.contains("on")) openPanel(); }catch(e){}
    var go1 = function(){ if(CHATS[gid]){ openChat(gid); return true; } return false; };
    setTimeout(function(){ if(go1()) return; wantJoin(gid).then(function(){ return ensureGroup(gid, name, desc); }).then(function(made){ if(made){ var n = 0, iv = setInterval(function(){ if(go1() || ++n > 20) clearInterval(iv); }, 300); toast(name + " group is ready – add Production QC and Washing people from Group info"); } else { toast("Request sent – a member of the group will add you"); paint(true); } }); }, 120); },
  msg: function(id){ return msgById(id); }, feedGroups: function(){ return FEEDG; }, feedJoin: function(){ Object.keys(FEEDG).forEach(function(g){ if(!CHATS[g]) wantJoin(g); }); return Object.keys(FEEDG).map(function(g){ return g + ":" + (CHATS[g] ? "member" : "requested"); }); }, pushInit: function(){ pushInit(); }, openChat: function(cid){ try{ var pp = $("ycP"); if(!pp || !pp.classList.contains("on")) openPanel(); if(cid && CHATS[cid]) openChat(cid); }catch(e){} }, alert: function(rid, text){ try{ qaAlert(rid, text); }catch(e){} }, dmSend: function(uidOrEmail, t){ if(!MY) return Promise.resolve(false); var u = PEOPLE[uidOrEmail] ? uidOrEmail : Object.keys(PEOPLE).filter(function(k){ return String(PEOPLE[k].email || "").toLowerCase() === String(uidOrEmail).toLowerCase(); })[0]; if(!u || u === MY) return Promise.resolve(false);
  var id = dmId(MY, u), at = now(), ref = FS.collection("chats").doc(id), m = {k: "text", t: String(t).slice(0, 5000), by: MY, at: at};
  return ref.set({type: "dm", members: [MY, u].sort(), made: at, by: MY}, {merge: true}).then(function(){ var up = {at: at, last: {t: m.t.slice(0, 120), by: MY, at: at, k: "text"}}; up["rd." + MY] = at; up["n." + u] = FV.increment(1); return ref.collection("m").add(m).then(function(){ return ref.update(up); }); }).then(function(){ try{ pushSend([u], fullName(MY), m.t.slice(0, 160), id, "msg", null); }catch(e){} return true; }).catch(function(){ return false; }); },
  people: function(){ return PEOPLE; }, setDark: function(v){ DARK = !!v; try{ var p = $("ycP"); if(p){ p.classList.toggle("dk", DARK); var w = $("ycW"); if(w) w.removeAttribute("data-v"); if(p.classList.contains("on")) paint(true); } }catch(e){} },
  postTo: function(cid, t){ var c = CHATS[cid]; if(!c || !MY) return Promise.resolve(false); var m = {k: "text", t: String(t).slice(0, 5000), by: MY, at: now()}, ref = FS.collection("chats").doc(cid).collection("m").doc(), u = {at: m.at, last: {t: m.t.slice(0, 120), by: MY, at: m.at, k: "text"}}; u["rd." + MY] = m.at; (c.members || []).forEach(function(x){ if(x !== MY) u["n." + x] = FV.increment(1); });
  return ref.set(m).then(function(){ return FS.collection("chats").doc(cid).update(u); }).then(function(){ pushNote(c, m.t.slice(0, 120)); return true; }).catch(function(){ return false; }); }, start: start, close: function(){ try{ closePanel(); }catch(e){} }, openProfile: function(){ try{ openPanel(); setTimeout(function(){ go("profile", {}); }, 60); }catch(e){} }, openStaff: function(){ try{ openPanel(); setTimeout(function(){ go("staff", {}); }, 60); }catch(e){} }, fileUrl: function(id){ return fileUrl(id); }, putFile: function(f, n){ return putFile(f, n); }, refresh: function(){ var w = $("ycW"); if(w && VIEW !== "profile" && VIEW !== "tasknew") w.removeAttribute("data-v"); repaint(); }};

// ---------- helpers ----------
function $(id){ return document.getElementById(id); }
function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c]; }); }
function now(){ return Date.now(); }
function pad(n){ return (n < 10 ? "0" : "") + n; }
function hm(t){ var d = new Date(t); return pad(d.getHours()) + ":" + pad(d.getMinutes()); }
function sameDay(a, b){ return new Date(a).toDateString() === new Date(b).toDateString(); }
function dayLbl(t){ var td = new Date(); td.setHours(0, 0, 0, 0); var x = new Date(t); x.setHours(0, 0, 0, 0); var df = Math.round((td - x) / 864e5);
  return df === 0 ? "Today" : df === 1 ? "Yesterday" : df < 7 ? new Date(t).toLocaleDateString("en-GB", {weekday: "long"}) : new Date(t).toLocaleDateString("en-GB", {day: "numeric", month: "short", year: "numeric"}); }
function shortT(t){ if(!t) return ""; if(sameDay(t, now())) return hm(t); var y = new Date(); y.setDate(y.getDate() - 1); if(sameDay(t, y)) return "Yesterday"; return now() - t < 6 * 864e5 ? new Date(t).toLocaleDateString("en-GB", {weekday: "short"}) : new Date(t).toLocaleDateString("en-GB", {day: "2-digit", month: "2-digit", year: "2-digit"}); }
function fmtDur(s){ s = Math.round(s || 0); var h = Math.floor(s / 3600); return (h ? h + ":" + pad(Math.floor(s % 3600 / 60)) : Math.floor(s / 60)) + ":" + pad(s % 60); }
function fmtSize(b){ return b > 1048576 ? (b / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(b / 1024)) + " KB"; }
function hex(n){ var s = ""; for(var i = 0; i < n; i++) s += "0123456789abcdef"[Math.floor(Math.random() * 16)]; return s; }
var COLS = ["#2F5A1A", "#3f7d22", "#1a7a6a", "#7a5a1a", "#5a3a8a", "#8a3a3a", "#2a5a8a", "#6a7a1a", "#245e4a", "#7a3a6a"];
function colorOf(s){ var h = 0; s = String(s || ""); for(var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return COLS[h % COLS.length]; }
function initials(n){ n = String(n || "?").trim().split(/\s+/); return ((n[0] || "?")[0] + (n.length > 1 ? n[n.length - 1][0] : "")).toUpperCase(); }
function lsGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
function lsSet(k, v){ try{ localStorage.setItem(k, v); }catch(e){} }
function lsJ(k, d){ try{ var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; }catch(e){ return d; } }
function isOn(p){ return p && p.at && now() - p.at < 150000; }
function blkMap(){ return (ME && ME.bl) || {}; }
function iBlocked(u){ return !!blkMap()[u]; }
function blockedMe(u){ var p = PEOPLE[u]; return !!(p && p.bl && p.bl[MY]); }
function setBlock(u, on){ var x = {}; if(on){ x["bl." + u] = now(); } else x["bl." + u] = FV.delete();
  return FS.collection("people").doc(MY).update(x).then(function(){ ME = ME || {}; ME.bl = ME.bl || {}; if(on) ME.bl[u] = now(); else delete ME.bl[u]; MKEY = ""; var w = $("ycW"); if(w) w.removeAttribute("data-v"); paint(true); toast(on ? fullName(u) + " blocked" : fullName(u) + " unblocked"); }).catch(function(e){ toast(e.code || e.message); }); }
function askBlock(u){ if(iBlocked(u)) return setBlock(u, false); ask("Blocked contacts cannot call you or send you messages.", {title: "Block " + fullName(u) + "?", ok: "Block", danger: 1}).then(function(y){ if(y) setBlock(u, true); }); }
function person(uid){ return PEOPLE[uid] || (uid === MY && ME) || null; }
function pname(uid){ var p = person(uid); return uid === MY ? "You" : p ? p.name : "Someone"; }
function fullName(uid){ var p = person(uid); return p ? p.name : "Someone"; }
function first(uid){ return uid === MY ? "You" : fullName(uid).split(" ")[0]; }
function chatOther(c){ return (c.members || []).filter(function(u){ return u !== MY; })[0] || MY; }
function chatTitle(c){ if(!c) return ""; if(c.type === "group") return c.title || "Group"; var o = chatOther(c); return o === MY ? (ME ? ME.name + " (You)" : "You") : fullName(o); }
function lastSeen(p){ if(!p || !p.at) return ""; if(isOn(p)) return "online"; return "last seen " + (sameDay(p.at, now()) ? "today at " + hm(p.at) : dayLbl(p.at).toLowerCase() + " at " + hm(p.at)); }
function avImg(name, key, size, ph, on, ring){
  size = size || 44; var st = 'width:' + size + 'px;height:' + size + 'px;font-size:' + Math.round(size * .38) + 'px;background:' + (ph ? "#dfe8d4" : colorOf(key || name));
  return '<span class="ycAv' + (ring ? " ycRing " + ring : "") + '" style="' + st + '">' + (ph ? '<img src="' + ph + '" alt="">' : esc(initials(name))) + (on ? '<i class="ycOn"></i>' : '') + '</span>'; }
function avU(uid, size, on){ var p = person(uid); return avImg(p ? p.name : "?", uid, size, p && p.pt, on && isOn(p), isMg(uid) ? "gold" : custOf(uid) ? "cust" : ""); }
// ---------- verified ticks: blue = profile complete, green = active member, gold = management, purple = customer ----------
var LV = {m: {}, mg: [], cu: {}, rj: {}}, LVOK = false, LVJS = "";
function lvLoad(){ return FS.collection("meta").doc("levels").onSnapshot(function(d){ var x = d.exists ? d.data() : {}, js = JSON.stringify([x.m, x.mg, x.cu, x.rj]); if(js === LVJS) return; LVJS = js; LV = {m: x.m || {}, mg: (x.mg || []).map(function(e){ return String(e).toLowerCase(); }), cu: x.cu || {}, rj: x.rj || {}}; LVOK = true; var w = $("ycW"); if(w && VIEW !== "profile" && VIEW !== "tasknew") w.removeAttribute("data-v"); repaint(); }, function(){}); }
function emOf(u){ var p = person(u); return p && p.email ? String(p.email).toLowerCase() : (u === MY ? EMAIL : ""); }
function custOf(u){ var e = emOf(u); return (e && LV.cu[e]) || ""; }
function isMg(u){ var e = emOf(u); return !!e && LV.mg.indexOf(e) >= 0; }
function lvOfU(u){ var e = emOf(u); return e && window.yqLvOf ? window.yqLvOf(e) : ""; }
function isStaff(u){ var l = lvOfU(u); return l === "qc" || l === "qa" || l === "auth"; }
function amStaff(){ var l = window.YQLV || ""; return l === "qc" || l === "qa" || l === "auth"; }
function profSteps(p){ p = p || {}; var e = p.emp || {}, ext = p.kind === "cust" || p.kind === "agency" || /^(customer|inspection agency|management)$/i.test(String(p.dept || "").trim()) || (p.uid && (custOf(p.uid) || isMg(p.uid)));
  var s = [["Profile photo", !!p.pt], ["Full name", String(p.name || "").trim().split(/\s+/).length >= 2], ["@username", !!p.uname]];
  if(!ext) s.push(["Department / role", !!String(p.dept || "").trim()], ["Unit / location", !!String(p.unit || "").trim()], ["About", !!String(p.about || "").trim()]);
  return s; }
function ymdL(t){ var d = new Date(t); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
function actDays(p){ var a = (p && p.ad) || [], set = {}, n = 0; a.forEach(function(d){ set[d] = 1; }); for(var i = 0; i < 7; i++) if(set[ymdL(now() - i * 864e5)]) n++; return n; }
function markDay(){ if(!ME) return; var d = ymdL(now()), a = (ME.ad || []).slice(); if(a.indexOf(d) >= 0) return; a.push(d); a = a.slice(-12); ME.ad = a; FS.collection("people").doc(MY).set({ad: a}, {merge: true}).catch(function(){}); }
function vTier(u){ var p = person(u); if(!p) return ""; if(custOf(u)) return "cu"; if(isMg(u)) return "mg";
  if(!profSteps(p).every(function(s){ return s[1]; })) return "";
  return (now() - (p.made || now()) >= 30 * 864e5 && actDays(p) >= 4) ? "gr" : "bl"; }
var VCOL = {bl: "#1d9bf0", gr: "#3d9a1f", mg: "#d4a637", cu: "#7c3aed"}, VNAME = {bl: "Profile complete", gr: "Active member", mg: "Management", cu: "Customer"};
function vSvg(t, s){ return '<svg class="ycVb" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" aria-label="' + VNAME[t] + '"><path fill="' + VCOL[t] + '" d="M12 1.5l2.6 1.9 3.2-.2 1 3 2.6 1.9-.9 3.1.9 3.1-2.6 1.9-1 3-3.2-.2L12 22.5l-2.6-1.9-3.2.2-1-3-2.6-1.9.9-3.1-.9-3.1 2.6-1.9 1-3 3.2.2z"/><path d="M8 12.3l2.6 2.6L16.2 9.3" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'; }
function vB(u, s){ var t = vTier(u); return t ? vSvg(t, s || 15) : ""; }
function vLbl(u){ var c = custOf(u); if(c) return '<span class="ycVl cu">' + esc(c.toUpperCase()) + '</span>'; if(isMg(u)) return '<span class="ycVl mg">MGMT</span>'; return ""; }
function nmT(u, nm){ return esc(nm != null ? nm : fullName(u)) + vB(u) + vLbl(u); }
function grpCust(c){ if(!c || c.type !== "group") return ""; var m = (c.members || []).filter(function(u){ return custOf(u); })[0]; return m ? custOf(m) : ""; }
function custGate(fn){ var c = CHATS[OPEN], cu = grpCust(c); if(!cu || custOf(MY)) return fn(); ask("This group has the customer (" + cu + ") in it.", {title: "Send this file?", ok: "Send"}).then(function(y){ if(y) fn(); }); }
function stepsCard(p){ var st = profSteps(p), ok = st.filter(function(s){ return s[1]; }).length, ad = actDays(p), days = Math.floor((now() - (p.made || now())) / 864e5), t = vTier(MY);
  var h = '<div class="ycSteps"><div class="ycStT">' + (t ? vSvg(t, 18) + ' <b>' + VNAME[t] + '</b>' : '<b>Blue tick: ' + ok + '/' + st.length + ' done</b>') + '</div>';
  if(t !== "cu" && t !== "mg"){ h += '<div class="ycBar"><i style="width:' + Math.round(ok / st.length * 100) + '%"></i></div><div class="ycStL">' + st.map(function(s){ return '<span class="' + (s[1] ? "ok" : "no") + '">' + (s[1] ? "✓ " : "✗ ") + s[0] + '</span>'; }).join("") + '</div>';
    h += '<div class="ycStT" style="margin-top:12px"><b>Green tick: ' + Math.min(ad, 4) + '/4 days this week</b></div><div class="ycBar"><i style="width:' + Math.min(100, ad * 25) + '%"></i></div><div class="ycSoft" style="font-size:12px;margin-top:4px">' + (days >= 30 ? "1 month on YQI done" : (30 - days) + " days left to 1 month on YQI") + ' · use YQI 4 days a week to keep it</div>'; }
  return h + '</div>'; }
function empHtml(me){ var e = me.emp || {}, lv = window.YQLV || "", ok = lv === "qc" || lv === "qa" || lv === "auth";
  var st = ok ? '<span class="ycEmpS ok">✓ Verified employee</span>' : (e.code || e.at) ? ((LV.rj[EMAIL] || 0) >= (e.at || 0) && LV.rj[EMAIL] ? '<span class="ycEmpS no">Not approved — check your details</span>' : '<span class="ycEmpS wt">Waiting for approval</span>') : '<span class="ycEmpS">Not added</span>';
  var ph = function(k, lbl){ var th = e[k + "T"]; return '<button class="ycEmpC" data-c="empph" data-k="' + k + '">' + (th ? '<img src="' + th + '" alt="">' : '<span>' + IC.cam + '</span>') + '<small>' + lbl + '</small></button>'; };
  return '<div class="ycSec">Employee card ' + st + '</div><div class="ycForm" style="padding-top:4px"><div class="ycSoft" style="font-size:12.5px;margin-bottom:6px">Yunus Textile employees: add a photo of the front of your card. After approval you get company data in YQI. Chat works without it.</div><label>Employee number · optional</label><input id="ycEc" maxlength="20" placeholder="e.g. 104523" value="' + esc(PARAM.ec != null ? PARAM.ec : e.code || "") + '"' + (ok ? " readonly" : "") + '><div class="ycEmpR">' + ph("f", "Card front") + '</div><div class="ycErr" id="ycEe"></div>' + (ok ? '' : '<button class="ycPb" data-c="empsave">' + (e.code || e.at ? "Send again" : "Send for approval") + '</button>') + '</div>'; }
function empPhoto(k){ var f = $("ycPhF"); if(!f || !ME) return toast("Save your profile first."); f.onchange = function(){ var x = f.files[0]; f.value = ""; if(!x) return;
  cropper(x, 1.586, false, 1100).then(function(c){ toast("Uploading…"); return canvasBlob(c, .86); }).then(function(b){ return Promise.all([thumbOf(b, 320), putFile(b, "card-" + k + ".jpg", true)]); }).then(function(a){
    var e = Object.assign({}, ME.emp || {}); e[k + "T"] = a[0] ? a[0].u : ""; e[k] = a[1].id; return FS.collection("people").doc(MY).set({emp: e}, {merge: true}).then(function(){ ME.emp = e; $("ycW").removeAttribute("data-v"); paint(true); toast("Saved"); }); }).catch(function(e){ toast("Could not upload: " + (e.message || e)); }); }; f.click(); }
function empSave(){ var code = String(($("ycEc") || {}).value || "").trim().toUpperCase().replace(/\s+/g, ""), er = $("ycEe"), e = Object.assign({}, ME.emp || {});
  if(code && !/^[A-Z0-9-]{3,20}$/.test(code)){ er.textContent = "Employee number: 3–20 letters, numbers or -. Or leave it empty."; return; }
  if(!e.f){ er.textContent = "Add a photo of the card front."; return; }
  if(!code){ e.at = now(); delete e.rj; er.textContent = "Sending…"; FS.collection("people").doc(MY).set({emp: e}, {merge: true}).then(function(){ ME.emp = e; $("ycW").removeAttribute("data-v"); paint(true); toast("Sent for approval"); }).catch(function(x){ er.textContent = "Could not send: " + (x && (x.code || x.message) || x); }); return; }
  er.textContent = "Sending…"; var ref = FS.collection("ecodes").doc(code), old = e.code;
  ref.get().then(function(d){ if(d.exists && d.data().uid !== MY){ FS.collection("ecdup").add({code: code, uid: MY, email: EMAIL, name: ME.name || "", at: now()}).catch(function(){}); throw new Error("dup"); }
    return d.exists ? null : ref.set({uid: MY, email: EMAIL, at: now()}); })
  .then(function(){ if(old && old !== code) FS.collection("ecodes").doc(old).delete().catch(function(){}); e.code = code; e.at = now(); delete e.rj; return FS.collection("people").doc(MY).set({emp: e}, {merge: true}); })
  .then(function(){ ME.emp = e; PARAM.ec = null; $("ycW").removeAttribute("data-v"); paint(true); toast("Sent for approval"); })
  .catch(function(x){ er.textContent = x && x.message === "dup" ? "This employee number is already used by another account. The owner has been told." : "Could not send: " + (x && (x.code || x.message) || x); }); }
var STAFFF = "all";
function staffView(w){ var q = (PARAM.q || "").toLowerCase(), boss = isMg(MY) || window.YQLV === "auth";
  var ids = Object.keys(PEOPLE).filter(function(u){ return isStaff(u); }), cnt = {qc: 0, qa: 0, auth: 0}; ids.forEach(function(u){ cnt[lvOfU(u)]++; });
  var L = ids.filter(function(u){ var p = PEOPLE[u]; return (STAFFF === "all" || lvOfU(u) === STAFFF || (STAFFF === "mg" && isMg(u))) && (!q || (p.name + " " + (p.dept || "") + " " + (p.unit || "") + " " + (p.emp && p.emp.code || "")).toLowerCase().indexOf(q) >= 0); }).sort(function(a, b){ return fullName(a).localeCompare(fullName(b)); });
  var LN = {qc: "QC", qa: "QA", auth: "Authorised"};
  var h = bar(BACKB(), '<b>Yunus Textile people</b>', ids.length + " employees on YQI") + '<div class="ycScroll"><div class="ycStaffN"><div><b>' + ids.length + '</b><span>on YQI</span></div><div><b>' + cnt.qc + '</b><span>QC</span></div><div><b>' + cnt.qa + '</b><span>QA</span></div><div><b>' + cnt.auth + '</b><span>Authorised</span></div></div>' +
    '<div class="ycForm" style="padding:6px 14px"><input id="ycSq" placeholder="Search name, department, unit, employee no." value="' + esc(PARAM.q || "") + '"></div><div class="ycChips">' + [["all", "All"], ["qc", "QC"], ["qa", "QA"], ["auth", "Authorised"], ["mg", "Management"]].map(function(f){ return '<button data-c="sfilt" data-f="' + f[0] + '" class="' + (STAFFF === f[0] ? "on" : "") + '">' + f[1] + '</button>'; }).join("") + '</div>' +
    L.map(function(u){ var p = PEOPLE[u] || {}; return '<div class="ycRow"><span class="ycAvT" data-c="pcard" data-u="' + u + '">' + avU(u, 46, true) + '</span><div class="ycRm"><div class="ycR1"><b>' + nmT(u) + '</b></div><div class="ycR2"><span>' + esc([p.dept, p.unit, LN[lvOfU(u)]].filter(Boolean).join(" · ")) + '</span></div></div>' + (u !== MY ? '<button class="ycMk" data-c="dm" data-u="' + u + '">Message</button>' + (boss ? '<button class="ycMk" data-c="stask" data-u="' + u + '">Task</button>' : '') : '') + '</div>'; }).join("") +
    (L.length ? '' : '<div class="ycEmpty"><span>No one here yet.</span></div>') + '</div>';
  w.innerHTML = h; bind(w); var si = $("ycSq"); if(si) si.oninput = function(){ PARAM.q = si.value; var p0 = si.selectionStart; w.removeAttribute("data-v"); staffView(w); var s2 = $("ycSq"); if(s2){ s2.focus(); try{ s2.setSelectionRange(p0, p0); }catch(e){} } }; }
function avC(c, size){ if(c.type === "group") return avImg(c.title || "G", c.id, size, c.pt, false); var o = chatOther(c); return avU(o, size, true); }
function toast(t){ var e = document.createElement("div"); e.className = "ycToast"; e.textContent = t; document.body.appendChild(e); setTimeout(function(){ e.classList.add("on"); }, 10); setTimeout(function(){ e.classList.remove("on"); setTimeout(function(){ e.remove(); }, 400); }, 2600); }
var IC = {
  back: '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  callO: '<svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M8.2 3.5H5.5a2 2 0 00-2 2.2c.9 8 6.8 13.9 14.8 14.8a2 2 0 002.2-2v-2.7a1 1 0 00-.8-1l-3.3-.8a1 1 0 00-1 .3l-1.6 1.6a12 12 0 01-5.4-5.4l1.6-1.6a1 1 0 00.3-1l-.8-3.3a1 1 0 00-1-.8z"/></svg>',
  videoO: '<svg viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><rect x="2.8" y="6" width="13" height="12" rx="2.5"/><path d="M15.8 10.2l5.4-3.2v10l-5.4-3.2z"/></svg>',
  call: '<svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z"/></svg>',
  video: '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z"/></svg>',
  dots: '<svg viewBox="0 0 24 24" width="22" height="22"><circle cx="12" cy="5" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="19" r="2" fill="currentColor"/></svg>',
  search: '<svg viewBox="0 0 24 24" width="22" height="22"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M15.5 15.5L21 21" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  clip: '<svg viewBox="0 0 24 24" width="23" height="23"><path d="M16.5 6.5l-7.8 7.8a2 2 0 102.8 2.8l8.1-8.1a4 4 0 10-5.7-5.7L5.6 11.6a6 6 0 108.5 8.5l6.4-6.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  cam: '<svg viewBox="0 0 24 24" width="23" height="23"><path fill="currentColor" d="M9 4l-1.8 2H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-3.2L15 4H9zm3 4.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9zm0 2a2.5 2.5 0 100 5 2.5 2.5 0 000-5z"/></svg>',
  mic: '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 15a3 3 0 003-3V6a3 3 0 10-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 006 6.9V21h2v-2.1A7 7 0 0019 12h-2z"/></svg>',
  send: '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M3.4 20.4l17.5-7.5a1 1 0 000-1.8L3.4 3.6a1 1 0 00-1.4 1.1L4 11l9 1-9 1-2 6.3a1 1 0 001.4 1.1z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M9 3h6l1 2h4v2H4V5h4l1-2zm-3 6h12l-1 12H7L6 9z"/></svg>',
  chat: '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 3C6.9 3 3 6.5 3 10.9c0 2.4 1.2 4.6 3.1 6.1L5.4 21l4-2.1c.8.2 1.7.3 2.6.3 5.1 0 9-3.5 9-7.9S17.1 3 12 3z"/></svg>',
  status: '<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4 3"/><circle cx="12" cy="12" r="4.5" fill="currentColor"/></svg>',
  calls: '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>',
  pin: '<svg viewBox="0 0 24 24" width="15" height="15"><path fill="currentColor" d="M14 3l7 7-2 1-2-2-4 4 1 5-2 2-3-4-5 5-1-1 5-5-4-3 2-2 5 1 4-4-2-2z"/></svg>',
  mute: '<svg viewBox="0 0 24 24" width="15" height="15"><path fill="currentColor" d="M12 4L7 9H3v6h4l5 5V4zm5.6 4.6L16.2 10l2 2-2 2 1.4 1.4 2-2 2 2 1.4-1.4-2-2 2-2-1.4-1.4-2 2-2-2z"/></svg>',
  star: '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>',
  arch: '<svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M3 4h18v4H3V4zm1 5h16v11H4V9zm5 3v2h6v-2H9z"/></svg>',
  reply: '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/></svg>',
  flip: '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M20 5h-3.2L15 3H9L7.2 5H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V7a2 2 0 00-2-2zm-8 13a5 5 0 01-4.6-3H9l-2.5-3L4 15h1.3A7 7 0 0012 20v-2zm5.7-6A7 7 0 0012 7v2a5 5 0 014.6 3H15l2.5 3 2.5-3h-2.3z"/></svg>',
  camoff: '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M3.3 2L2 3.3 4.7 6H4a1 1 0 00-1 1v10a1 1 0 001 1h12c.2 0 .4-.1.5-.2l3.2 3.2L21 20 3.3 2zM21 6.5l-4 4V7a1 1 0 00-1-1H9.8L21 17.2V6.5z"/></svg>',
  spk: '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 8v8a4.5 4.5 0 002.5-4zM14 3.2v2.1a7 7 0 010 13.4v2.1a9 9 0 000-17.6z"/></svg>',
  hang: '<svg viewBox="0 0 24 24" width="30" height="30"><path fill="#fff" d="M12 9c-1.6 0-3.2.3-4.6.7v3.1c0 .4-.2.7-.6.9-1 .5-1.9 1.1-2.7 1.8-.2.2-.4.3-.7.3s-.5-.1-.7-.3L.3 13.1A1 1 0 010 12.4c0-.3.1-.5.3-.7C3.3 8.8 7.4 7 12 7s8.7 1.8 11.7 4.7c.2.2.3.4.3.7s-.1.5-.3.7l-2.4 2.4c-.2.2-.4.3-.7.3s-.5-.1-.7-.3c-.8-.7-1.7-1.3-2.7-1.8-.3-.2-.6-.5-.6-.9V9.7C15.2 9.3 13.6 9 12 9z"/></svg>',
  arrIn: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M18 6L7 17M7 9v8h8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  arrOut: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M6 18L17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  doc: '<svg viewBox="0 0 24 24" width="26" height="26"><path fill="#fff" d="M6 2h8l6 6v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2zm7 1.5V9h5.5L13 3.5z"/></svg>',
  gal: '<svg viewBox="0 0 24 24" width="26" height="26"><path fill="#fff" d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm1 13h14l-4.5-6-3.5 4.5-2.5-3L5 17z"/></svg>',
  meet: '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M16 11a3 3 0 100-6 3 3 0 000 6zm-8 0a3 3 0 100-6 3 3 0 000 6zm0 2c-2.3 0-7 1.2-7 3.5V19h14v-2.5C15 14.2 10.3 13 8 13zm8 0c-.3 0-.6 0-1 .1 1.2.8 2 2 2 3.4V19h6v-2.5c0-2.3-4.7-3.5-7-3.5z"/></svg>'
};

var WLOGO = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgLTM2IDEyNCA5OCIgd2lkdGg9IjYyMCIgaGVpZ2h0PSI0OTAiPjxnIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxMSI+PHBhdGggZD0iTTggNiBMMjYgMjkgTDQ0IDYiLz48cGF0aCBkPSJNMjYgMjggTDI2IDUyIi8+PGNpcmNsZSBjeD0iNzUiIGN5PSIyOCIgcj0iMTYuNSIvPjxwYXRoIGQ9Ik0xMDcgNiBMMTA3IDUwIi8+PC9nPjxwYXRoIGQ9Ik03OSAzNCBMOTIgNTIiIHN0cm9rZT0iIzdEQjgyRSIgc3Ryb2tlLXdpZHRoPSI4IiBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg4NyAtMzMpIHNjYWxlKDAuMzMzMzMzMzMzMzMzMzMzMykiPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZzEiIHgxPSIwIiB5MT0iMSIgeDI9IjEiIHkyPSIwIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiM3REI4MkUiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNCOURDNEYiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0iZzIiIHgxPSIwIiB5MT0iMSIgeDI9IjEiIHkyPSIwIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiM4Q0MzMzgiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNDNkUzNkEiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz4KPHBhdGggZD0iTTMwIDExMCBDMTAgODIgMTQgMzggODggNCBDODAgNDIgNjIgNzQgMzQgMTAwIFoiIGZpbGw9InVybCgjZzEpIi8+CjxwYXRoIGQ9Ik0yNyA5OCBDMjAgNzIgMzIgNDIgNjYgMTgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii44IiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8cGF0aCBkPSJNMzMgMTA2IEM1MiA3NiA3OCA1OCAxMDcgNTAgQzk4IDg0IDY4IDEwNCAzMyAxMDYgWiIgZmlsbD0idXJsKCNnMikiLz4KPHBhdGggZD0iTTQwIDEwMCBDNTggODQgNzYgNzIgOTggNjIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii43IiBzdHJva2Utd2lkdGg9IjIuNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9nPjwvc3ZnPg==";
function li(d, w){ return '<svg viewBox="0 0 24 24" width="' + (w || 22) + '" height="' + (w || 22) + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>'; }
var IL = {
  info: li('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'),
  search: li('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>'),
  media: li('<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.6"/><path d="M20.5 16l-5-5-8.5 8.5"/>'),
  wall: li('<path d="M12 3.5a8.5 8.5 0 100 17c1.2 0 1.8-.8 1.8-1.7 0-.5-.2-.9-.5-1.2-.3-.4-.5-.8-.5-1.2 0-1 .8-1.7 1.7-1.7h2a4.5 4.5 0 004.5-4.5c0-3.7-4-6.7-9-6.7z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10.5" cy="7.5" r="1"/><circle cx="15" cy="7.8" r="1"/>'),
  bell: li('<path d="M6 16.5V11a6 6 0 0112 0v5.5l1.5 1.5h-15L6 16.5zM10 20.5a2 2 0 004 0"/>'),
  bellOff: li('<path d="M9 5.3A6 6 0 0118 11v4M6 11v5.5L4.5 18H17M10 20.5a2 2 0 004 0M3 3l18 18"/>'),
  archive: li('<rect x="3" y="4" width="18" height="4.5" rx="1"/><path d="M5 8.5V19a1.5 1.5 0 001.5 1.5h11A1.5 1.5 0 0019 19V8.5M10 12.5h4"/>'),
  trash: li('<path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l.8 12a1.5 1.5 0 001.5 1.4h6.4a1.5 1.5 0 001.5-1.4l.8-12M10 11v6M14 11v6"/>'),
  block: li('<circle cx="12" cy="12" r="8.5"/><path d="M6 6l12 12"/>'),
  users: li('<circle cx="9" cy="8.5" r="3.2"/><path d="M3 19.5c.5-3.3 3-5 6-5s5.5 1.7 6 5"/><path d="M15.5 5.5a3 3 0 010 6M17.5 14.6c2 .6 3.2 2.3 3.5 4.9"/>'),
  cal: li('<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4M8 14h3M8 17h6"/>'),
  star: li('<path d="M12 3.8l2.5 5.2 5.7.8-4.1 4 1 5.7L12 16.8l-5.1 2.7 1-5.7-4.1-4 5.7-.8z"/>'),
  user: li('<circle cx="12" cy="8.5" r="4"/><path d="M4.5 20c.8-3.8 3.7-6 7.5-6s6.7 2.2 7.5 6"/>'),
  close: li('<path d="M6 6l12 12M18 6L6 18"/>'),
  copy: li('<rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2"/><path d="M15.5 8.5V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7.5a2 2 0 002 2h2.5"/>'),
  fwd: li('<path d="M14 5l6 6-6 6M20 11H10a6 6 0 00-6 6v1"/>'),
  reply: li('<path d="M10 5l-6 6 6 6M4 11h10a6 6 0 016 6v1"/>'),
  edit: li('<path d="M15.5 4.5l4 4L8 20H4v-4L15.5 4.5z"/>'),
  pin: li('<path d="M9 3.5h6M10 3.5v6L6.5 13v1.5h11V13L14 9.5v-6M12 14.5V21"/>'),
  check: li('<path d="M4.5 12.5l4.5 4.5L19.5 6.5"/>'),
  moon: li('<path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z"/>'),
  agenda: li('<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>'),
  notes: li('<path d="M6 3.5h9l4 4V20a.5.5 0 01-.5.5h-12A.5.5 0 016 20V3.5z"/><path d="M14.5 3.5V8h4.5M9 12h7M9 15.5h7"/>'),
  exit: li('<path d="M14 4.5h4.5a1.5 1.5 0 011.5 1.5v12a1.5 1.5 0 01-1.5 1.5H14M10 16l4-4-4-4M14 12H3.5"/>'),
  smile: li('<circle cx="12" cy="12" r="8.5"/><path d="M8.5 14.2c.8 1.3 2 2 3.5 2s2.7-.7 3.5-2M9 9.8h.01M15 9.8h.01"/>', 18),
  plus: li('<path d="M12 5v14M5 12h14"/>'),
  lock: li('<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 018 0v3"/>'),
  qr: li('<rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1"/><rect x="14" y="3.5" width="6.5" height="6.5" rx="1"/><rect x="3.5" y="14" width="6.5" height="6.5" rx="1"/><path d="M14 14h3v3h-3zM20.5 14v.01M14 20.5h.01M17 20.5h3.5V17"/>')
};

// ---------- sounds ----------
var AC = null; function ac(){ try{ AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if(AC.state === "suspended") AC.resume(); }catch(e){} return AC; }
function beep(f, d, v, when){ var a = ac(); if(!a) return; var o = a.createOscillator(), g = a.createGain(), t = a.currentTime + (when || 0); o.frequency.value = f; o.type = "sine"; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v || .15, t + .02); g.gain.linearRampToValueAtTime(0, t + d); o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + d + .05); }
function msgSound(){ if(lsGet("yqc_snd") === "0") return; beep(880, .1, .1); beep(1320, .14, .09, .1); }
var RINGT = null;
function ringStart(kind){ ringStop(); var f = function(){ if(kind === "in"){ beep(740, .35, .22); beep(988, .35, .22, .4); try{ navigator.vibrate && navigator.vibrate([400, 200, 400]); }catch(e){} } else beep(440, .9, .07); }; f(); RINGT = setInterval(f, kind === "in" ? 1800 : 3000); }
function ringStop(){ if(RINGT){ clearInterval(RINGT); RINGT = null; } try{ navigator.vibrate && navigator.vibrate(0); }catch(e){} }

// ---------- media: Firestore pieces + on-phone cache ----------
function b64(u8){ var s = "", k = 0x8000; for(var i = 0; i < u8.length; i += k) s += String.fromCharCode.apply(null, u8.subarray(i, i + k)); return btoa(s); }
function unb64(s){ var b = atob(s), u = new Uint8Array(b.length); for(var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
function imgResize(f, max, q){ return createImageBitmap(f).then(function(bm){ var sc = Math.min(1, max / Math.max(bm.width, bm.height)), c = document.createElement("canvas"); c.width = Math.max(1, Math.round(bm.width * sc)); c.height = Math.max(1, Math.round(bm.height * sc)); var x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); x.drawImage(bm, 0, 0, c.width, c.height); return {c: c, w: c.width, h: c.height}; }); }
function canvasBlob(c, q){ return new Promise(function(r){ c.toBlob(function(b){ r(b); }, "image/jpeg", q || .82); }); }
function thumbOf(f, max){ if(!window.createImageBitmap) return Promise.resolve(null); return imgResize(f, max || 360).then(function(o){ return {u: o.c.toDataURL("image/jpeg", .62), w: o.w, h: o.h}; }).catch(function(){ return null; }); }
function shrink(f){ if(!/^image\/(jpeg|png|webp|heic|heif)$/.test(f.type) || !window.createImageBitmap) return Promise.resolve(f); if(f.size < 220000 && f.type === "image/jpeg") return Promise.resolve(f);
  return imgResize(f, 1280).then(function(o){ return canvasBlob(o.c, .78); }).then(function(b){ return b && b.size < f.size ? b : f; }).catch(function(){ return f; }); }
var MC = null; function mcache(){ if(MC !== null) return MC; try{ MC = window.caches ? caches.open("yqc-media-v1") : Promise.resolve(null); }catch(e){ MC = Promise.resolve(null); } return MC; }
function mcPut(id, blob){ mcache().then(function(c){ if(c) c.put("/yqc-media/" + id, new Response(blob)).catch(function(){}); }).catch(function(){}); }
function mcGet(id){ return mcache().then(function(c){ return c ? c.match("/yqc-media/" + id) : null; }).then(function(r){ return r ? r.blob() : null; }).catch(function(){ return null; }); }
function putFile(f, name, already){ return (already ? Promise.resolve(f) : shrink(f)).then(function(x){ return x.arrayBuffer().then(function(buf){
  if(buf.byteLength > MAXF) throw new Error("File too big (max 12 MB)");
  var id = hex(32), s = b64(new Uint8Array(buf)), n = Math.max(1, Math.ceil(s.length / CHUNK)), ps = [];
  for(var i = 0; i < n; i++) ps.push(FS.collection("cblobc").doc(id + "_" + i).set({d: s.slice(i * CHUNK, (i + 1) * CHUNK)}));
  var ct = x.type || f.type || "application/octet-stream", blob = x instanceof Blob ? x : new Blob([buf], {type: ct});
  return Promise.all(ps).then(function(){ return FS.collection("cblob").doc(id).set({ct: ct, size: buf.byteLength, n: n, at: now(), by: MY}); })
    .then(function(){ BU[id] = URL.createObjectURL(blob); mcPut(id, blob); return {id: id, name: name || f.name || "file", ct: ct, size: buf.byteLength}; });
}); }); }
var BU = {}, BP = {};
function fileUrl(id){ if(BU[id]) return Promise.resolve(BU[id]); if(BP[id]) return BP[id];
  return (BP[id] = mcGet(id).then(function(b){ if(b) return (BU[id] = URL.createObjectURL(b));
    return FS.collection("cblob").doc(id).get().then(function(d){ if(!d.exists) throw new Error("missing"); var m = d.data(), ps = []; for(var i = 0; i < (m.n || 1); i++) ps.push(FS.collection("cblobc").doc(id + "_" + i).get());
      return Promise.all(ps).then(function(a){ var bl = new Blob([unb64(a.map(function(x){ return x.exists ? x.data().d : ""; }).join(""))], {type: m.ct}); mcPut(id, bl); return (BU[id] = URL.createObjectURL(bl)); }); }); })); }

// ---------- cache for instant open ----------
function saveCache(){ try{ lsSet("yqc_p", JSON.stringify(PEOPLE)); var c = {}; Object.keys(CHATS).forEach(function(k){ c[k] = CHATS[k]; }); lsSet("yqc_c", JSON.stringify(c)); }catch(e){} }
var saveT = 0; function saveSoon(){ clearTimeout(saveT); saveT = setTimeout(saveCache, 1500); }
function saveMsgs(cid){ try{ var keep = MSGS.filter(function(m){ return !m.pend; }).slice(-50).map(function(m){ var x = Object.assign({}, m); return x; }); localStorage.setItem("yqc_m_" + cid, JSON.stringify(keep)); }catch(e){ try{ localStorage.removeItem("yqc_m_" + cid); }catch(x){} } }

// ---------- start ----------
function start(o){ AUTHO = o.auth || null; setTimeout(pushInit, 2500);
  if(started || !o || !o.fs || !o.user) return; started = true;
  FS = o.fs; FV = firebase.firestore.FieldValue; MY = o.user.uid || ("u" + hex(12)); EMAIL = String(o.email || o.user.email || "").toLowerCase();
  DARK = window.yqDarkNow ? window.yqDarkNow() : false;
  var cacheMy = lsGet("yqc_my"); if(cacheMy !== MY){ ["yqc_p", "yqc_c"].forEach(function(k){ try{ localStorage.removeItem(k); }catch(e){} }); lsSet("yqc_my", MY); }
  PEOPLE = lsJ("yqc_p", {}); CHATS = lsJ("yqc_c", {}); ME = PEOPLE[MY] || null;
  css(); shell(); badge();
  if(ME) live();
  FS.collection("people").doc(MY).get().then(function(d){ if(d.exists){ ME = d.data(); PEOPLE[MY] = ME; live(); } else if(!LIVE){ ME = null; badge(); } }).catch(function(){ if(ME) live(); });
}
var LIVE = false;
function live(){
  if(LIVE) return; LIVE = true; lvLoad(); setTimeout(markDay, 4000);
  presence(); setInterval(presence, 60000); document.addEventListener("visibilitychange", function(){ if(!document.hidden){ presence(); if(OPEN && VIEW === "chat") readNow(OPEN); } });
  FS.collection("people").onSnapshot(function(q){ var P = {}; q.docs.forEach(function(d){ P[d.id] = d.data(); }); PEOPLE = P; if(PEOPLE[MY]) ME = PEOPLE[MY]; saveSoon(); repaint(); }, function(){});
  FS.collection("chats").where("members", "array-contains", MY).onSnapshot(function(q){
    var old = CHATS; CHATS = {}; q.docs.forEach(function(d){ var c = d.data(); c.id = d.id; CHATS[d.id] = c; });
    if(!firstChats) Object.keys(CHATS).forEach(function(id){ var c = CHATS[id], o2 = old[id], l = c.last; if(!l || l.by === MY || l.k === "sys") return; if(o2 && o2.last && o2.last.at >= l.at) return; if(OPEN === id && panelOpen() && !document.hidden) return; if(c.mu && c.mu[MY]) return; notifyMsg(c); });
    firstChats = false; badge(); saveSoon(); repaint(); if(OPEN && CHATS[OPEN] && VIEW === "chat" && panelOpen()) readNow(OPEN);
  }, function(){});
  FS.collection("inbox").doc(MY).onSnapshot(function(d){ var r = d.exists ? d.data().ring : null; if(r) onRing(r); }, function(){});
  FS.collection("calls").where("members", "array-contains", MY).onSnapshot(function(q){ CALLS = q.docs.map(function(d){ var x = d.data(); x.id = d.id; return x; }).sort(function(a, b){ return (b.at || 0) - (a.at || 0); }).slice(0, 80); if(TAB === "calls") repaint(); }, function(){});
  FS.collection("status").where("at", ">", now() - 864e5).onSnapshot(function(q){ STATUS = q.docs.map(function(d){ var x = d.data(); x.id = d.id; return x; }).filter(function(s){ return now() - s.at < 864e5; }).sort(function(a, b){ return a.at - b.at; }); badge(); if(TAB === "updates") repaint(); }, function(){});
  FS.collection("meets").where("members", "array-contains", MY).onSnapshot(function(q){ MEETS = {}; TASKS = {}; q.docs.forEach(function(d){ var x = d.data(); x.id = d.id; if(x.kind === "task") TASKS[d.id] = x; else MEETS[d.id] = x; }); taskCheck(); if(TAB === "tasks" && VIEW === "home") repaint(); if($("ycNotes")) notesFeed(); if(VIEW === "meet") repaintMeet(); else if(TAB === "calls") repaint(); }, function(){});
  setInterval(meetReminders, 30000);
  var cq = /[?&]chat=([^&]*)/.exec(location.search); if(cq) setTimeout(function(){ openPanel(); var id = decodeURIComponent(cq[1] || ""); if(id) openChat(id); }, 1500);
}
function presence(){ if(!ME || document.hidden) return; FS.collection("people").doc(MY).set({at: now()}, {merge: true}).catch(function(){}); }
function unreadOf(c){ return (c.n && c.n[MY]) || 0; }
function badge(){ var b = $("ycFabN"); if(!b) return; if(!ME){ b.textContent = "!"; b.style.display = ""; return; }
  var n = 0; Object.keys(CHATS).forEach(function(id){ var c = CHATS[id]; if(!(c.ar && c.ar[MY]) && !(c.mu && c.mu[MY])) n += unreadOf(c); });
  b.textContent = n > 99 ? "99+" : n; b.style.display = n ? "" : "none";
  var nt = $("ycTabN_chats"); if(nt){ nt.textContent = n; nt.style.display = n ? "" : "none"; }
  var su = STATUS.filter(function(s){ return s.by !== MY && !(s.v && s.v[MY]); }).length, ns = $("ycTabN_updates"); if(ns){ ns.style.display = su ? "" : "none"; }
}
function notifyMsg(c){ if(document.hidden && window.YQPUSH_ON && ME && ME.fcm && Object.keys(ME.fcm).length && window.YQNATIVE) return;
  if(c.type !== "group" && iBlocked(c.last && c.last.by)) return;
  var l = c.last, who = fullName(l.by), title = c.type === "group" ? (c.title || "Group") : who, body = (c.type === "group" ? who.split(" ")[0] + ": " : "") + (l.t || "");
  msgSound();
  if(document.hidden && window.Notification && Notification.permission === "granted"){ try{ navigator.serviceWorker.getRegistration().then(function(r){ if(r) r.showNotification(title, {body: body, icon: "icon-192.png", badge: "icon-192.png", tag: "c_" + c.id, renotify: true, data: {cid: c.id}}); }); }catch(e){} return; }
  if(panelOpen() && OPEN === c.id) return;
  var e = document.createElement("div"); e.className = "ycPop"; e.innerHTML = avC(c, 40) + '<div><b>' + esc(title) + '</b><span>' + esc(body).slice(0, 100) + '</span></div>';
  e.onclick = function(){ e.remove(); openPanel(); openChat(c.id); }; document.body.appendChild(e); setTimeout(function(){ e.classList.add("on"); }, 10); setTimeout(function(){ e.classList.remove("on"); setTimeout(function(){ e.remove(); }, 400); }, 5000);
}
if(navigator.serviceWorker) try{ navigator.serviceWorker.addEventListener("message", function(e){ var d = e.data || {}; if(d.yqcOpen){ openPanel(); if(d.cid) setTimeout(function(){ openChat(d.cid); }, 300); } }); }catch(e){}

// ---------- shell + navigation ----------
function shell(){
  if($("ycFab") || /[?&]buyer=/.test(location.search)) return;
  var b = document.createElement("button"); b.id = "ycFab"; b.title = "YQI Chat"; b.innerHTML = IC.chat + '<b id="ycFabN" style="display:none"></b>';
  b.onclick = function(){ panelOpen() ? closePanel() : openPanel(); }; document.body.appendChild(b);
  var p = document.createElement("div"); p.id = "ycP"; p.innerHTML = '<div class="ycBg"></div><div class="ycW" id="ycW"></div>'; document.body.appendChild(p);
  p.querySelector(".ycBg").onclick = function(){ closePanel(); };
}
var BK = window.YQBACK || {push: function(){}, back: function(){ return false; }, killTag: function(){}, purge: function(){}, count: function(){ return 0; }};
function pushH(){ BK.push(chatBack, "chat"); }
// one step back: overlay → sheet → previous screen → close chat
function chatBack(){
  var v = document.querySelector(".ycView"); if(v){ v.remove(); return; }
  if(SV){ closeStory(); return; }
  if(closeSheet()) return;
  if(!panelOpen()){ BK.back(); return; }
  if(ME && (STACK.length || VIEW !== "home")){ navBack(); return; }
  closeNow(); BK.killTag("chat"); BK.purge();
}
function uiBack(){ if(BK.count("chat") > 0) BK.back(); else chatBack(); }
function panelOpen(){ var p = $("ycP"); return !!(p && p.classList.contains("on")); }
function openPanel(){ var p = $("ycP"); if(!p) return; ac(); p.classList.add("on"); p.classList.toggle("dk", DARK); document.documentElement.classList.add("ycLock"); pushH(); if(!ME){ VIEW = "profile"; STACK = []; PARAM = {setup: 1}; } paint(); askNotif(); }
function closeNow(){ var p = $("ycP"); if(!p) return; closeSheet(); p.classList.remove("on"); document.documentElement.classList.remove("ycLock"); stopMsgs(); OPEN = null; VIEW = ME ? "home" : "profile"; STACK = []; PARAM = {}; }
function closePanel(){ closeNow(); BK.killTag("chat"); BK.purge(); }
function askNotif(){ try{ if(window.Notification && Notification.permission === "default") Promise.resolve(Notification.requestPermission()).then(function(p){ if(p === "granted" && window.yqWebPush) window.yqWebPush(); }); }catch(e){} }
function go(v, param){ STACK.push({v: VIEW, p: PARAM, o: OPEN}); pushH(); VIEW = v; PARAM = param || {}; paint(true); }
function navBack(){ var s = STACK.pop(); closeSheet(); if(VIEW === "chat"){ stopMsgs(); REPLY = null; } if(!s){ VIEW = "home"; PARAM = {}; OPEN = null; } else { VIEW = s.v; PARAM = s.p; if(s.v === "chat" && s.o){ return openChat(s.o, true); } OPEN = s.v === "chat" ? s.o : (s.v === "info" ? s.o : null); } paint(true); }
var RPT = 0; function repaint(){ if(!panelOpen()) return; clearTimeout(RPT); RPT = setTimeout(function(){ paint(false); }, 60); }
function paint(full){
  if(!panelOpen()) return; var w = $("ycW"); if(!w) return; $("ycP").classList.toggle("dk", DARK);
  if(!ME && VIEW !== "profile"){ VIEW = "profile"; PARAM = {setup: 1}; }
  var key = VIEW + ":" + (OPEN || "") + ":" + TAB;
  if(!full && w.getAttribute("data-v") === key){ if(VIEW === "chat") return chatUpdate(); if(VIEW === "profile" || VIEW === "newgroup" || VIEW === "meetnew" || VIEW === "stext" || VIEW === "meet" || VIEW === "tasknew") return; }
  w.setAttribute("data-v", key);
  var sc = w.querySelector(".ycScroll"), top = sc && !full ? sc.scrollTop : 0;
  if(VIEW === "home") homeView(w);
  else if(VIEW === "chat" && OPEN && CHATS[OPEN]) chatView(w);
  else if(VIEW === "profile") profileView(w);
  else if(VIEW === "info") infoView(w);
  else if(VIEW === "pick") pickView(w);
  else if(VIEW === "newgroup") newGroupView(w);
  else if(VIEW === "meetnew") meetNewView(w);
  else if(VIEW === "archived") archivedView(w);
  else if(VIEW === "starred") starredView(w);
  else if(VIEW === "stext") statusTextView(w);
  else if(VIEW === "meet") meetView(w);
  else if(VIEW === "tasknew") taskNewView(w);
  else if(VIEW === "staff") staffView(w);
  else { VIEW = "home"; homeView(w); }
  var sc2 = w.querySelector(".ycScroll"); if(sc2 && top) sc2.scrollTop = top;
}
function bar(left, title, sub, right, cls){ return '<div class="ycHd' + (cls ? " " + cls : "") + '">' + left + '<div class="ycHt">' + title + (sub ? '<span>' + sub + '</span>' : '') + '</div>' + (right || '') + '</div>'; }
function ib(c, icon, title, extra){ return '<button class="ycIb" data-c="' + c + '" title="' + (title || "") + '"' + (extra || "") + '>' + icon + '</button>'; }
var BACKB = function(){ return ib("back", IC.back, "Back"); };

// ---------- home: chats / updates / calls ----------
function homeView(w){
  var h = bar('', '<b class="ycBrand"><img src="' + WLOGO + '" alt="YQI"><em>Chat</em></b>', '', ib("search", IC.search, "Search") + ib("linkpc", IL.qr, "Link a computer (scan QR)") + '<button class="ycIb" data-c="me" title="My profile">' + avU(MY, 32) + '</button>' + ib("menu", IC.dots, "Menu"), "home");
  if(PARAM.search){ h = bar(ib("unsearch", IC.back, "Back"), '<input id="ycQ" class="ycQin" placeholder="Search chats, people, messages" value="' + esc(SEARCHQ) + '">', '', '', "home"); }
  h += '<div class="ycTabs">' + ["chats:Chats", "updates:Updates", "calls:Calls", "tasks:Tasks"].map(function(t){ var a = t.split(":"); return '<button data-c="tab" data-t="' + a[0] + '" class="' + (TAB === a[0] ? "on" : "") + '">' + a[1] + '<i id="ycTabN_' + a[0] + '" class="ycTn" style="display:none"></i></button>'; }).join("") + '</div><div class="ycScroll" id="ycList">';
  if(TAB === "updates") h += updatesList(); else if(TAB === "calls") h += callsList(); else if(TAB === "tasks") h += tasksList(); else h += chatsList();
  h += '</div>';
  h += TAB === "tasks" ? '<button class="ycFab2" data-c="tasknew" title="New task">' + IL.plus + '</button>' : TAB === "chats" ? '<button class="ycFab2" data-c="newchat" title="New chat">' + IC.chat + '<i>+</i></button>' : TAB === "updates" ? '<div class="ycFab2s"><button class="ycFab2 sm" data-c="stext" title="Text status">✎</button><button class="ycFab2" data-c="sphoto" title="Photo status">' + IC.cam + '</button></div>' : '<button class="ycFab2" data-c="meetnew" title="New meeting">' + IC.meet + '</button>';
  w.innerHTML = h; bind(w); badge();
  var q = $("ycQ"); if(q){ q.focus(); try{ q.setSelectionRange(q.value.length, q.value.length); }catch(e){} q.oninput = function(){ SEARCHQ = q.value; var l = $("ycList"); if(l){ l.innerHTML = TAB === "chats" ? chatsList() : TAB === "calls" ? callsList() : updatesList(); bind(l); } }; }
}
function visibleChats(arch){
  return Object.keys(CHATS).map(function(k){ return CHATS[k]; }).filter(function(c){
    if(c.type !== "group" && !c.last && c.by !== MY) return false;
    var hid = c.hid && c.hid[MY]; if(hid && !(c.last && c.last.at > hid)) return false;
    return arch ? !!(c.ar && c.ar[MY]) : !(c.ar && c.ar[MY]);
  }).sort(function(a, b){ var pa = a.pn && a.pn[MY] ? 1 : 0, pb = b.pn && b.pn[MY] ? 1 : 0; return (pb - pa) || ((b.at || 0) - (a.at || 0)); });
}
function chatRow(c){
  var t = chatTitle(c), l = c.last || {}, n = unreadOf(c), typing = typers(c), hid = c.hid && c.hid[MY];
  var prev = l.at && hid && l.at <= hid ? "" : (l.t || (c.type === "group" ? "Group created" : "Tap to chat"));
  var tick = l.by === MY && l.k !== "sys" ? tickOf(c, l.at) : "";
  var who = c.type === "group" && l.by && l.by !== MY && l.k !== "sys" ? esc(first(l.by)) + ": " : "";
  var icons = (c.mu && c.mu[MY] ? '<i class="ycMi">' + IC.mute + '</i>' : '') + (c.pn && c.pn[MY] ? '<i class="ycMi">' + IC.pin + '</i>' : '');
  return '<button class="ycRow" data-c="open" data-id="' + c.id + '" data-lp="chat">' + (c.type === "group" ? avC(c, 50) : '<span class="ycAvT" data-c="pcard" data-u="' + chatOther(c) + '">' + avC(c, 50) + '</span>') + '<div class="ycRm"><div class="ycR1"><b>' + (c.type === "group" ? esc(t) + (grpCust(c) && !custOf(MY) ? '<span class="ycVl cu">EXTERNAL</span>' : '') : nmT(chatOther(c), t)) + '</b><time class="' + (n ? "nw" : "") + '">' + shortT(l.at || c.at) + '</time></div><div class="ycR2"><span class="' + (typing ? "ycTy" : "") + '">' + (typing ? esc(typing) : tick + who + esc(prev)) + '</span>' + icons + (n ? '<i class="ycN' + (c.mu && c.mu[MY] ? " mu" : "") + '">' + n + '</i>' : '') + '</div></div></button>';
}
function chatsList(){
  var q = (SEARCHQ || "").toLowerCase().trim(), h = "";
  if(!PEOPLE[MY] && !ME) return '';
  if(!q) h += '<div class="ycChips">' + [["all", "All"], ["unread", "Unread"], ["groups", "Groups"]].map(function(f){ return '<button data-c="filter" data-f="' + f[0] + '" class="' + (FILTER === f[0] ? "on" : "") + '">' + f[1] + '</button>'; }).join("") + '</div>';
  var arch = visibleChats(true);
  if(arch.length && !q) h += '<button class="ycRow ycArchRow" data-c="archived"><span class="ycAv" style="width:50px;height:50px;background:transparent;color:#3d9a1f">' + IC.arch + '</span><div class="ycRm"><div class="ycR1"><b>Archived</b><time class="nw">' + (arch.reduce(function(s, c){ return s + unreadOf(c); }, 0) || "") + '</time></div></div></button>';
  var list = visibleChats(false).filter(function(c){ if(FILTER === "unread" && !unreadOf(c)) return false; if(FILTER === "groups" && c.type !== "group") return false;
    return !q || (chatTitle(c) + " " + (c.last && c.last.t || "")).toLowerCase().indexOf(q) >= 0; });
  h += list.map(chatRow).join("");
  if(q){ var ppl = Object.keys(PEOPLE).filter(function(u){ var p = PEOPLE[u]; return u !== MY && (p.name + " @" + p.uname + " " + (p.dept || "")).toLowerCase().indexOf(q) >= 0; });
    if(ppl.length) h += '<div class="ycSec">People</div>' + ppl.map(personRow).join("");
    var hits = q.length >= 2 ? msgSearch(q) : []; if(hits.length) h += '<div class="ycSec">Messages and files</div>' + hits.map(msgHitRow).join(""); }
  if(!list.length && !q) h += '<div class="ycEmpty">' + (FILTER === "all" ? '<b>Start chatting</b><span>Tap the green button to message a colleague, make a group or start a meeting.</span>' : '<span>Nothing here.</span>') + '</div>';
  return h;
}
function personRow(u){ var p = PEOPLE[u] || {}; return '<button class="ycRow" data-c="dm" data-u="' + u + '"><span class="ycAvT" data-c="pcard" data-u="' + u + '">' + avU(u, 46, true) + '</span>' + '<div class="ycRm"><div class="ycR1"><b>' + nmT(u, p.name) + '</b><time>' + (isOn(p) ? '<em>online</em>' : '') + '</time></div><div class="ycR2"><span>' + esc(p.about || ("@" + (p.uname || "") + (p.dept ? " · " + p.dept : ""))) + '</span></div></div></button>'; }
function typers(c){ var t = c.ty || {}, a = Object.keys(t).filter(function(u){ return u !== MY && now() - t[u] < 6000; }); if(!a.length) return ""; return c.type === "group" ? first(a[0]) + " is typing…" : "typing…"; }
function tickOf(c, at){ var oth = (c.members || []).filter(function(u){ return u !== MY; }), rd = c.rd || {}, dl = c.dl || {};
  var seen = oth.length && oth.every(function(u){ return (rd[u] || 0) >= at; }), got = oth.length && oth.every(function(u){ return (dl[u] || rd[u] || 0) >= at || isOn(PEOPLE[u]); });
  return '<i class="ycTk' + (seen ? " sn" : "") + '">' + (seen || got ? "✓✓" : "✓") + '</i> '; }

// ---------- status / updates ----------
function myStatus(){ return STATUS.filter(function(s){ return s.by === MY; }); }
function updatesList(){
  var mine = myStatus(), h = '<div class="ycSec">Status</div>';
  var last = mine[mine.length - 1];
  h += '<button class="ycRow" data-c="' + (mine.length ? "sview" : "sphoto") + '" data-u="' + MY + '">' + '<span class="ycStAv">' + avU(MY, 52) + (mine.length ? ring(mine.length, 0) : '<i class="ycStPlus">+</i>') + '</span><div class="ycRm"><div class="ycR1"><b>My status</b></div><div class="ycR2"><span>' + (mine.length ? (shortT(last.at) + " · " + seenCount(mine) + " views") : "Tap to add a photo or text update") + '</span></div></div></button>';
  var by = {}; STATUS.forEach(function(s){ if(s.by !== MY && PEOPLE[s.by]) (by[s.by] = by[s.by] || []).push(s); });
  var us = Object.keys(by).sort(function(a, b){ var ua = by[a].some(unseen), ub = by[b].some(unseen); return (ub - ua) || (by[b][by[b].length - 1].at - by[a][by[a].length - 1].at); });
  var rec = us.filter(function(u){ return by[u].some(unseen); }), vw = us.filter(function(u){ return !by[u].some(unseen); });
  function row(u){ var a = by[u], l = a[a.length - 1], un = a.filter(unseen).length; return '<button class="ycRow" data-c="sview" data-u="' + u + '"><span class="ycStAv">' + avU(u, 52) + ring(a.length, a.length - un) + '</span><div class="ycRm"><div class="ycR1"><b>' + esc(fullName(u)) + '</b></div><div class="ycR2"><span>' + shortT(l.at) + '</span></div></div></button>'; }
  if(rec.length) h += '<div class="ycSec">Recent updates</div>' + rec.map(row).join("");
  if(vw.length) h += '<div class="ycSec">Viewed updates</div>' + vw.map(row).join("");
  if(!us.length) h += '<div class="ycEmpty sm"><span>Updates from your team show here for 24 hours.</span></div>';
  return h;
}
function unseen(s){ return !(s.v && s.v[MY]); }
function seenCount(a){ var u = {}; a.forEach(function(s){ Object.keys(s.v || {}).forEach(function(k){ if(k !== MY) u[k] = 1; }); }); return Object.keys(u).length; }
function ring(n, seen){ var R = 29, C = 2 * Math.PI * R, gap = n > 1 ? 4 : 0, seg = C / n - gap, h = '<svg class="ycStRing" viewBox="0 0 64 64">';
  for(var i = 0; i < n; i++){ h += '<circle cx="32" cy="32" r="' + R + '" fill="none" stroke="' + (i < seen ? "#b9c7ad" : "#3d9a1f") + '" stroke-width="3" stroke-dasharray="' + seg + ' ' + (C - seg) + '" stroke-dashoffset="' + (-(i * (seg + gap)) + C / 4) + '"/>'; }
  return h + '</svg>'; }
var SBG = ["#2F5A1A", "#1a6a5a", "#5a3a8a", "#8a3a3a", "#2a5a8a", "#7a5a1a", "#0f3d2e", "#3d3d3d"];
function statusTextView(w){
  var bg = PARAM.bg || SBG[0];
  w.innerHTML = '<div class="ycSt" style="background:' + bg + '"><div class="ycStTop">' + ib("back", IC.back, "Back") + '<span style="flex:1"></span><button class="ycIb" data-c="sbg" title="Colour" style="font-size:22px">🎨</button></div><textarea id="ycStT" maxlength="400" placeholder="Type a status"></textarea><button class="ycSend big" data-c="spost" title="Post">' + IC.send + '</button></div>';
  bind(w); setTimeout(function(){ var t = $("ycStT"); if(t) t.focus(); }, 50);
}
function postTextStatus(){ var t = ($("ycStT").value || "").trim(); if(!t) return toast("Write something first"); FS.collection("status").add({by: MY, at: now(), k: "text", t: t, bg: PARAM.bg || SBG[0], v: {}}).then(function(){ toast("Status posted"); navBack(); }).catch(function(e){ toast("Could not post: " + (e.code || e.message)); }); }
function postPhotoStatus(f){ toast("Posting status…"); Promise.all([thumbOf(f, 480), putFile(f, "status.jpg"), ask("", {title: "Add a caption", input: "", placeholder: "Optional", ok: "Post"})]).then(function(a){ if(a[2] === null) throw new Error("cancelled"); var cap = a[2] || ""; return FS.collection("status").add({by: MY, at: now(), k: "img", th: a[0] ? a[0].u : "", f: a[1], t: cap.slice(0, 200), v: {}}); }).then(function(){ toast("Status posted"); TAB = "updates"; repaint(); }).catch(function(e){ if(e && e.message === "cancelled") return toast("Status not posted"); toast("Could not post: " + (e.message || e)); }); }
var SV = null;
function viewStatus(uid){
  var list = STATUS.filter(function(s){ return s.by === uid; }); if(!list.length) return;
  var i = uid === MY ? 0 : Math.max(0, list.findIndex(unseen)); if(i < 0) i = 0;
  pushH(); var x = document.createElement("div"); x.id = "ycSV"; document.body.appendChild(x); SV = {list: list, i: i, el: x, uid: uid, t0: 0, raf: 0, paused: false};
  showStory();
}
function showStory(){
  var s = SV.list[SV.i], x = SV.el, p = person(SV.uid) || {};
  x.innerHTML = '<div class="ycSVbars">' + SV.list.map(function(_, k){ return '<i><b style="width:' + (k < SV.i ? 100 : 0) + '%"></b></i>'; }).join("") + '</div><div class="ycSVhd">' + avU(SV.uid, 40) + '<div><b>' + esc(SV.uid === MY ? "My status" : p.name) + '</b><span>' + shortT(s.at) + '</span></div><span style="flex:1"></span>' + (SV.uid === MY ? '<button data-s="del">' + IC.trash + '</button>' : '') + '<button data-s="x">✕</button></div>' +
    '<div class="ycSVbody" style="' + (s.k === "text" ? "background:" + (s.bg || SBG[0]) : "background:#000") + '">' + (s.k === "text" ? '<div class="ycSVtxt">' + esc(s.t) + '</div>' : '<img src="' + (BU[s.f && s.f.id] || s.th || "") + '" alt="">' + (s.t ? '<div class="ycSVcap">' + esc(s.t) + '</div>' : '')) + '</div>' +
    (SV.uid === MY ? '<div class="ycSVfoot">👁 ' + Object.keys(s.v || {}).filter(function(k){ return k !== MY; }).map(function(k){ return esc(first(k)); }).join(", ") + (Object.keys(s.v || {}).filter(function(k){ return k !== MY; }).length ? "" : "No views yet") + '</div>' : '<div class="ycSVfoot"><button data-s="reply">' + IC.reply + ' Reply</button></div>') +
    '<div class="ycSVnav"><span data-s="prev"></span><span data-s="next"></span></div>';
  if(s.k === "img" && s.f && !BU[s.f.id]) fileUrl(s.f.id).then(function(u){ var im = x.querySelector(".ycSVbody img"); if(im) im.src = u; }).catch(function(){});
  if(SV.uid !== MY && unseen(s)){ var u = {}; u["v." + MY] = now(); FS.collection("status").doc(s.id).update(u).catch(function(){}); }
  x.querySelectorAll("[data-s]").forEach(function(b){ b.onclick = function(e){ e.stopPropagation(); var a = b.getAttribute("data-s");
    if(a === "x") return closeStory(); if(a === "prev"){ if(SV.i > 0){ SV.i--; showStory(); } else showStory(); return; } if(a === "next") return nextStory();
    if(a === "del"){ cancelAnimationFrame(SV.raf); ask("", {title: "Delete this status?", ok: "Delete", danger: 1}).then(function(y){ if(y) FS.collection("status").doc(s.id).delete().then(function(){ closeStory(); }).catch(function(){}); else if(SV) showStory(); }); return; }
    if(a === "reply"){ var u2 = SV.uid; closeStory(); openPanel(); openDm(u2, "Replying to your status: " + (s.k === "text" ? "“" + s.t.slice(0, 60) + "”" : "📷 photo")); } }; });
  cancelAnimationFrame(SV.raf); SV.t0 = performance.now(); var D = s.k === "text" ? 5000 : 6500, bar = x.querySelectorAll(".ycSVbars i b")[SV.i];
  (function lp(t){ if(!SV) return; var k = (t - SV.t0) / D; if(bar) bar.style.width = Math.min(100, k * 100) + "%"; if(k >= 1) return nextStory(); SV.raf = requestAnimationFrame(lp); })(SV.t0);
}
function nextStory(){ if(!SV) return; if(SV.i < SV.list.length - 1){ SV.i++; showStory(); } else closeStory(); }
function closeStory(){ if(!SV) return; cancelAnimationFrame(SV.raf); SV.el.remove(); SV = null; repaint(); }

// ---------- calls tab ----------
function callsList(){
  var h = '<div class="ycCallActs"><button data-c="meetnow"><span style="background:#3d9a1f">' + IC.meet + '</span>Start meeting</button><button data-c="meetnew"><span style="background:#2a5a8a">' + IL.cal.replace('currentColor', '#fff') + '</span>Schedule</button><button data-c="newcall"><span style="background:#7a5a1a">' + IC.call + '</span>Call someone</button></div>';
  var up = Object.keys(MEETS).map(function(k){ return MEETS[k]; }).filter(function(m){ return (m.at || 0) + (m.dur || 60) * 60000 > now() && !m.done; }).sort(function(a, b){ return a.at - b.at; });
  if(up.length) h += '<div class="ycSec">Upcoming meetings</div>' + up.map(function(m){ var soon = m.at - now() < 15 * 60000; return '<div class="ycRow" data-c="meetinfo" data-id="' + m.id + '"><span class="ycAv ycCalIc" style="width:46px;height:46px">' + IL.cal + '</span><div class="ycRm"><div class="ycR1"><b>' + esc(m.title) + '</b><time>' + esc(dayLbl(m.at)) + ' ' + hm(m.at) + '</time></div><div class="ycR2"><span>' + (m.members || []).length + ' people · by ' + esc(first(m.by)) + (m.video ? " · video" : "") + '</span><button class="ycJoin' + (soon ? " hot" : "") + '" data-c="meetjoin" data-id="' + m.id + '">Join</button></div></div></div>'; }).join("");
  var past = Object.keys(MEETS).map(function(k){ return MEETS[k]; }).filter(function(m){ return up.indexOf(m) < 0 && now() - (m.at || 0) < 30 * 864e5; }).sort(function(a, b){ return b.at - a.at; }).slice(0, 6);
  if(past.length) h += '<div class="ycSec">Past meetings · minutes</div>' + past.map(function(m){ return '<button class="ycRow" data-c="meetinfo" data-id="' + m.id + '"><span class="ycAv ycCalIc" style="width:46px;height:46px">' + IL.notes + '</span><div class="ycRm"><div class="ycR1"><b>' + esc(m.title) + '</b><time>' + esc(shortT(m.at)) + '</time></div><div class="ycR2"><span>' + ((m.agenda || []).length + (m.pts || []).length) + ' agenda points · tap for minutes</span></div></div></button>'; }).join("");
  h += '<div class="ycSec">Recent</div>';
  var rows = CALLS.map(function(c){
    var out = c.by === MY, was = c.was && c.was[MY], missed = !out && !was && !c.group, oth = (c.members || []).filter(function(u){ return u !== MY; });
    var title = c.group ? (c.title || "Meeting") : fullName(out ? oth[0] : c.by);
    var key = c.group ? c.cid : (out ? oth[0] : c.by);
    return '<button class="ycRow" data-c="callback" data-id="' + c.id + '">' + (c.group ? avImg(title, c.cid, 46, CHATS[c.cid] && CHATS[c.cid].pt) : avU(key, 46)) + '<div class="ycRm"><div class="ycR1"><b class="' + (missed ? "ycMiss" : "") + '">' + esc(title) + '</b><time>' + shortT(c.at) + '</time></div><div class="ycR2"><span class="ycCdir ' + (missed ? "miss" : out ? "out" : "in") + '">' + (out ? IC.arrOut : IC.arrIn) + ' ' + (missed ? "Missed" : out ? "Outgoing" : "Incoming") + (c.dur ? " · " + fmtDur(c.dur) : "") + '</span><i class="ycCk">' + (c.video ? IC.video : IC.call) + '</i></div></div></button>';
  }).join("");
  return h + (rows || '<div class="ycEmpty sm"><span>Your calls and meetings will show here.</span></div>');
}

// ---------- pickers ----------
function pickView(w){ if(PARAM.mode === "chat") setTimeout(function(){ var l = w.querySelector(".ycScroll"); if(l && !l.querySelector(".ycCg")){ var d = document.createElement("div"); d.className = "ycCg"; d.innerHTML = custGroupsHtml(); l.appendChild(d); bind(d); } }, 0);
  var mode = PARAM.mode, sel = PARAM.sel || (PARAM.sel = {}), q = PARAM.q || "", multi = mode === "group" || mode === "meet" || mode === "add" || mode === "fwd" || mode === "meetsel";
  var title = {chat: "New chat", group: "New group", meet: "Meeting people", add: "Add members", call: "Call someone", fwd: "Forward to"}[mode] || "Select";
  var n = Object.keys(sel).length;
  var h = bar(BACKB(), '<b>' + title + '</b>', multi ? n + " selected" : Object.keys(PEOPLE).filter(function(u){ return u !== MY; }).length + " people") + '<div class="ycSearch"><input id="ycPq" placeholder="Search name, @username, department" value="' + esc(q) + '"></div><div class="ycScroll" id="ycPick">';
  h += pickRows();
  h += '</div>' + (multi ? '<div class="ycFoot"><button class="ycPb" data-c="pickdone"' + (n ? "" : " disabled") + '>' + ({group: "Next", meet: "Start meeting", add: "Add", fwd: "Send"}[mode]) + '</button></div>' : '');
  w.innerHTML = h; bind(w);
  var pq = $("ycPq"); pq.oninput = function(){ PARAM.q = pq.value; var l = $("ycPick"); l.innerHTML = pickRows(); bind(l); };
}
function pickRows(){
  var mode = PARAM.mode, sel = PARAM.sel, q = (PARAM.q || "").toLowerCase(), multi = mode !== "chat" && mode !== "call", h = "";
  if(mode === "chat" && !q) h += '<button class="ycRow" data-c="newgroup0"><span class="ycAv" style="width:46px;height:46px;background:#3d9a1f">' + IC.meet + '</span><div class="ycRm"><div class="ycR1"><b>New group</b></div></div></button><button class="ycRow" data-c="meetnew"><span class="ycAv" style="width:46px;height:46px;background:#2a5a8a;color:#fff;display:grid;place-items:center">' + IL.cal + '</span><div class="ycRm"><div class="ycR1"><b>New meeting</b></div></div></button><div class="ycSec">People on YQI</div>';
  if(mode === "fwd"){ var cs = visibleChats(false).filter(function(c){ return !q || chatTitle(c).toLowerCase().indexOf(q) >= 0; }); h += '<div class="ycSec">Recent chats</div>' + cs.map(function(c){ return '<button class="ycRow ycSel' + (sel["c:" + c.id] ? " on" : "") + '" data-c="psel" data-k="c:' + c.id + '">' + avC(c, 44) + '<div class="ycRm"><div class="ycR1"><b>' + esc(chatTitle(c)) + '</b></div></div><i class="ycCkb">' + (sel["c:" + c.id] ? "✓" : "") + '</i></button>'; }).join("") + '<div class="ycSec">People</div>'; }
  var ex = mode === "add" && OPEN && CHATS[OPEN] ? CHATS[OPEN].members || [] : [];
  var known = {}; if(custOf(MY)) Object.keys(CHATS).forEach(function(k){ (CHATS[k].members || []).forEach(function(x){ known[x] = 1; }); });
  var ids = Object.keys(PEOPLE).filter(function(u){ return u !== MY && ex.indexOf(u) < 0 && (!custOf(MY) || known[u]); }).filter(function(u){ var p = PEOPLE[u]; return !q || (p.name + " @" + p.uname + " " + (p.dept || "") + " " + (p.email || "")).toLowerCase().indexOf(q) >= 0; })
    .sort(function(a, b){ return (isOn(PEOPLE[b]) - isOn(PEOPLE[a])) || String(PEOPLE[a].name).localeCompare(PEOPLE[b].name); });
  h += ids.map(function(u){ var p = PEOPLE[u], k = "u:" + u; if(!multi) return '<button class="ycRow" data-c="' + (mode === "call" ? "pcall" : "dm") + '" data-u="' + u + '">' + avU(u, 44, true) + '<div class="ycRm"><div class="ycR1"><b>' + nmT(u, p.name) + '</b><time>' + (isOn(p) ? "<em>online</em>" : "") + '</time></div><div class="ycR2"><span>' + esc(p.about || "@" + p.uname + (p.dept ? " · " + p.dept : "")) + '</span>' + (mode === "call" ? '<i class="ycCk">' + IC.call + '</i>' : '') + '</div></div></button>';
    return '<button class="ycRow ycSel' + (sel[k] ? " on" : "") + '" data-c="psel" data-k="' + k + '">' + avU(u, 44, true) + '<div class="ycRm"><div class="ycR1"><b>' + nmT(u, p.name) + '</b></div><div class="ycR2"><span>@' + esc(p.uname) + (p.dept ? " · " + esc(p.dept) : "") + '</span></div></div><i class="ycCkb">' + (sel[k] ? "✓" : "") + '</i></button>'; }).join("");
  if(!ids.length) h += '<div class="ycEmpty sm"><span>' + (q ? "No one found." : "Colleagues appear here after they open YQI Chat once.") + '</span></div>';
  return h;
}
function pickDone(){
  var mode = PARAM.mode, sel = Object.keys(PARAM.sel || {}), us = sel.filter(function(k){ return k.indexOf("u:") === 0; }).map(function(k){ return k.slice(2); });
  if(mode === "group"){ var s2 = PARAM.sel; navBack(); go("newgroup", {sel: s2}); return; }
  if(mode === "add") return addMembers(us);
  if(mode === "meet"){ var mem = [MY].concat(us); navBack(); startAdhocMeeting(mem, PARAM.video); return; }
  if(mode === "fwd") return forwardTo(sel);
}
function newGroupView(w){
  var n = Object.keys(PARAM.sel || {}).length;
  w.innerHTML = bar(BACKB(), '<b>New group</b>', n + " members") + '<div class="ycScroll"><div class="ycForm"><div class="ycGph" data-c="gphoto">' + (PARAM.pt ? '<img src="' + PARAM.pt + '">' : IC.cam) + '</div><label>Group name</label><input id="ycGn" maxlength="40" placeholder="e.g. QA Team, Bedsure team" value="' + esc(PARAM.name || "") + '"><label>Description (optional)</label><input id="ycGd" maxlength="120" value="' + esc(PARAM.desc || "") + '"><div class="ycSec" style="padding-left:0">Members</div><div class="ycMemb">' +
    Object.keys(PARAM.sel || {}).map(function(k){ var u = k.slice(2); return '<span>' + avU(u, 40) + '<small>' + esc(first(u)) + '</small></span>'; }).join("") + '</div></div></div><div class="ycFoot"><button class="ycPb" data-c="gmake">Create group</button></div><input type="file" id="ycPhF" accept="image/*" hidden>';
  bind(w); var gn = $("ycGn"); gn.oninput = function(){ PARAM.name = gn.value; }; $("ycGd").oninput = function(){ PARAM.desc = this.value; };
}
function makeGroup(){
  var nm = ($("ycGn").value || "").trim(); if(!nm){ toast("Write a group name"); return; }
  var mem = [MY].concat(Object.keys(PARAM.sel || {}).map(function(k){ return k.slice(2); })), ref = FS.collection("chats").doc("g_" + hex(16)), t = now();
  var doc = {type: "group", title: nm, desc: ($("ycGd").value || "").trim(), members: mem, admins: [MY], at: t, made: t, by: MY, n: {}, rd: {}, last: {t: first(MY) + " created the group", by: MY, at: t, k: "sys"}};
  if(PARAM.pt){ doc.pt = PARAM.pt; if(PARAM.ph) doc.ph = PARAM.ph; }
  ref.set(doc).then(function(){ return ref.collection("m").add({k: "sys", t: fullName(MY) + " created “" + nm + "”", by: MY, at: t}); })
    .then(function(){ doc.id = ref.id; CHATS[ref.id] = CHATS[ref.id] || doc; STACK = []; VIEW = "home"; openChat(ref.id); }).catch(function(e){ toast("Could not create group: " + (e.code || e.message)); });
}
function addMembers(us){ var id = OPEN; if(!us.length) return; var u = {members: FV.arrayUnion.apply(null, us)};
  FS.collection("chats").doc(id).update(u).then(function(){ return FS.collection("chats").doc(id).collection("m").add({k: "sys", t: first(MY) + " added " + us.map(first).join(", "), by: MY, at: now()}); }).then(function(){ navBack(); }).catch(function(e){ toast(e.code || e.message); }); }

// ---------- chats ----------
function dmId(a, b){ return "dm_" + [a, b].sort().join("_"); }
function openDm(u, draft){
  var id = dmId(MY, u);
  var after = function(){ STACK = []; VIEW = "home"; openChat(id); if(draft) setTimeout(function(){ var t = $("ycTx"); if(t){ t.value = draft + "\n"; t.focus(); inputMode(); } }, 200); };
  if(CHATS[id]) return after();
  FS.collection("chats").doc(id).get().catch(function(){ return {exists: false}; }).then(function(d){ if(d.exists) return; return FS.collection("chats").doc(id).set({type: "dm", members: [MY, u].sort(), at: now(), made: now(), by: MY, n: {}, rd: {}}); })
    .then(function(){ CHATS[id] = CHATS[id] || {id: id, type: "dm", members: [MY, u].sort(), at: now(), by: MY, n: {}, rd: {}}; after(); }).catch(function(e){ toast("Could not open chat: " + (e.code || e.message)); });
}
function openChat(id, keepStack){
  if(!keepStack){ if(VIEW !== "chat"){ STACK.push({v: VIEW, p: PARAM, o: OPEN}); pushH(); } }
  OPEN = id; VIEW = "chat"; PARAM = {}; REPLY = null; MSGLIM = 60;
  MSGS = lsJ("yqc_m_" + id, []); stopMsgs(); paint(true); listenMsgs(id); readNow(id);
}
function listenMsgs(id){ stopMsgs();
  unMsgs = FS.collection("chats").doc(id).collection("m").orderBy("at", "desc").limit(MSGLIM).onSnapshot(function(q){
    var pend = MSGS.filter(function(m){ return m.pend; }); var got = q.docs.map(function(d){ var m = d.data(); m.id = d.id; return m; }).reverse();
    var ids = {}; got.forEach(function(m){ ids[m.id] = 1; }); MSGS = got.concat(pend.filter(function(m){ return !ids[m.id]; }));
    if(VIEW === "chat" && OPEN === id){ renderMsgs(); saveMsgs(id); } readNow(id); }, function(e){ toast("Messages could not load: " + (e.code || e.message)); }); }
function stopMsgs(){ if(unMsgs){ try{ unMsgs(); }catch(e){} unMsgs = null; } }
function readNow(id){ var c = CHATS[id]; if(!c || document.hidden || !panelOpen() || VIEW !== "chat") return; var lat = c.last && c.last.at || 0;
  if(unreadOf(c) || !(c.rd && c.rd[MY] >= lat)){ var u = {}; u["n." + MY] = 0; u["rd." + MY] = now(); c.n = c.n || {}; c.n[MY] = 0; c.rd = c.rd || {}; c.rd[MY] = now(); FS.collection("chats").doc(id).update(u).catch(function(){}); badge(); } }
function chatHead(){
  var c = CHATS[OPEN], g = c.type === "group", oth = chatOther(c), p = person(oth);
  var sub = typers(c) || (g ? (c.members || []).map(first).join(", ") : (oth === MY ? "Message yourself" : lastSeen(p)));
  var acts = g ? ib("vcall", IC.videoO, "Video meeting") + ib("call", IC.callO, "Voice meeting") : (oth === MY || iBlocked(oth) || blockedMe(oth) ? "" : ib("vcall", IC.videoO, "Video call") + ib("call", IC.callO, "Voice call"));
  return '<div id="ycHdW">' + bar(BACKB() + '<button class="ycIb ycHav" data-c="info">' + avC(c, 40) + '</button>', '<b data-c="info">' + (c.type === "group" ? esc(chatTitle(c)) + (grpCust(c) && !custOf(MY) ? '<span class="ycVl cu">EXTERNAL</span>' : '') : nmT(chatOther(c), chatTitle(c))) + '</b>', '<span class="' + (typers(c) ? "ycTy" : "") + '" data-c="info">' + esc(sub) + '</span>', acts + ib("cmenu", IC.dots, "More"), "chat") +
    (CALL && CALL.cid === OPEN ? '<div class="ycLive" data-c="showcall">● Call in progress — tap to return</div>' : '') + (OPEN === "grp_wash" && window.YQWASH ? window.YQWASH.strip() : '') + (FEEDG[OPEN] ? '<div class="wqStrip"><button data-yqf="' + FEEDG[OPEN] + '">📋 ' + (FEEDG[OPEN] === "int" ? "#INTERNAL" : "#EXTERNAL") + ' format</button><span class="ycFedH">Send in this format → saved to Inspection Summary live</span></div>' : '') + (PARAM.find ? '<div class="ycSearch"><input id="ycFind" placeholder="Search in this chat" value="' + esc(PARAM.find === true ? "" : PARAM.find) + '"></div>' : '') + '</div>';
}
function chatView(w){
  MKEY = "";
  var cc = CHATS[OPEN] || {}, bo = cc.type !== "group" ? chatOther(cc) : "", blk = bo && bo !== MY && (iBlocked(bo) || blockedMe(bo));
  w.innerHTML = chatHead() + '<div class="ycMsgs ycScroll ' + wallClass() + '" id="ycMsgs"></div><div id="ycReplyBar"></div>' + (blk ? '<div class="ycBlk">' + (iBlocked(bo) ? 'You blocked this contact. <button data-c="unblock" data-u="' + bo + '">Unblock</button>' : "You can't message this contact.") + '</div>' : '<div class="ycIn" id="ycIn">' + inputBar() + '</div>') +
    '<input type="file" id="ycFile" multiple hidden><input type="file" id="ycGal" accept="image/*,video/*" multiple hidden><input type="file" id="ycCam" accept="image/*" capture="environment" hidden>';
  bind(w); bindInput(); renderMsgs(); replyBar();
  $("ycFile").onchange = function(){ var fs = [].slice.call(this.files); this.value = ""; pickSend(fs); };
  $("ycGal").onchange = function(){ var fs = [].slice.call(this.files); this.value = ""; pickSend(fs); };
  $("ycCam").onchange = function(){ var f = this.files[0]; this.value = ""; if(f) pickSend([f]); };
  var fi = $("ycFind"); if(fi){ fi.focus(); fi.oninput = function(){ PARAM.find = fi.value || true; MKEY = ""; renderMsgs(); }; }
}
function chatUpdate(){ var hd = $("ycHdW"); if(hd){ var fi = $("ycFind"), had = fi && document.activeElement === fi; var nh = chatHead(); if(hd.outerHTML !== nh && !had){ var t = document.createElement("div"); t.innerHTML = nh; hd.replaceWith(t.firstChild); bind($("ycHdW")); var f2 = $("ycFind"); if(f2) f2.oninput = function(){ PARAM.find = f2.value || true; MKEY = ""; renderMsgs(); }; } } renderMsgs(); }
function inputBar(){
  if(REC) return '<div class="ycRec"><button class="ycIb red" data-c="reccancel" title="Delete">' + IC.trash + '</button><i class="ycRecDot"></i><b id="ycRecT">0:00</b><span class="ycRecW" id="ycRecW"></span></div><button class="ycSend" data-c="recsend" title="Send voice note">' + IC.send + '</button>';
  return '<div class="ycPill"><textarea id="ycTx" rows="1" placeholder="Message"></textarea><button class="ycIb" data-c="attach" title="Attach">' + IC.clip + '</button><button class="ycIb" id="ycCamB" data-c="cam" title="Camera">' + IC.cam + '</button></div><button class="ycSend" id="ycSendB" data-c="sendormic" title="Voice note">' + IC.mic + '</button>';
}
function bindInput(){ var box = $("ycIn"); if(!box) return; bind(box); var tx = $("ycTx"); if(!tx) return;
  tx.oninput = function(){ tx.style.height = "auto"; tx.style.height = Math.min(130, tx.scrollHeight) + "px"; inputMode(); typing(); menAuto(tx); };
  tx.onblur = function(){ setTimeout(function(){ var p = $("ycMenP"); if(p && document.activeElement !== tx) p.remove(); }, 200); };
  tx.onkeydown = function(e){ if(e.key === "Enter" && !e.shiftKey && !/Android|iPhone|iPad/i.test(navigator.userAgent)){ e.preventDefault(); send(); } };
  inputMode(); }
function inputMode(){ var tx = $("ycTx"), b = $("ycSendB"), cb = $("ycCamB"); if(!tx || !b) return; var has = !!tx.value.trim(); b.innerHTML = has ? IC.send : IC.mic; b.title = has ? "Send" : "Voice note"; if(cb) cb.style.display = has ? "none" : ""; }
var tyT = 0; function typing(){ if(now() - tyT < 3500 || !OPEN) return; tyT = now(); var u = {}; u["ty." + MY] = now(); FS.collection("chats").doc(OPEN).update(u).catch(function(){}); }
function wallClass(){ return "ycWall-" + (lsGet("yqc_wall") || "leaf"); }
var MKEY = "";
function renderMsgs(){
  var box = $("ycMsgs"); if(!box) return; var c = CHATS[OPEN] || {}, g = c.type === "group", hid = c.hid && c.hid[MY] || 0, fq = typeof PARAM.find === "string" ? PARAM.find.toLowerCase() : "";
  var bo = !g ? chatOther(c) : "", bat = bo && iBlocked(bo) ? blkMap()[bo] : 0;
  var list = MSGS.filter(function(m){ return m.at > hid && !(m.dm && m.dm[MY]) && !(bat && m.by === bo && m.at > bat); });
  var key = list.map(function(m){ return m.id + (m.pend ? "p" : "") + (m.del ? "d" : "") + JSON.stringify(m.re || 0) + (m.st && m.st[MY] ? "s" : "") + (m.ack ? "a" + m.ack.at : "") + (m.fed ? "f" + m.fed.at + (m.fed.gone ? "g" : "") : ""); }).join(",") + "|" + JSON.stringify(c.rd || {}) + JSON.stringify(c.dl || {}) + "|" + Object.keys(PEOPLE).length + "|" + fq;
  if(key === MKEY) return; MKEY = key;
  var atBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 160 || !box.getAttribute("data-r");
  var h = MSGS.length >= MSGLIM ? '<div class="ycMore"><button data-c="more">Load earlier messages</button></div>' : "", lastDay = "", lastBy = "", lastAt = 0;
  if(!list.length) h += '<div class="ycSafe"><span>🔒 Messages are only for your YQI team.</span></div>';
  list.forEach(function(m){
    var d = dayLbl(m.at); if(d !== lastDay){ h += '<div class="ycDay"><span>' + d + '</span></div>'; lastDay = d; lastBy = ""; }
    if(m.k === "sys"){ h += '<div class="ycDay sys"><span>' + esc(m.t) + '</span></div>'; lastBy = ""; return; }
    var mine = m.by === MY, firstOf = lastBy !== m.by || m.at - lastAt > 300000; lastBy = m.by; lastAt = m.at;
    if(fq && (m.t || "").toLowerCase().indexOf(fq) < 0 && !(m.f && (m.f.name || "").toLowerCase().indexOf(fq) >= 0)) return;
    var body = "", media = false;
    if(m.del) body = '<div class="ycTxt ycDel">🚫 ' + (mine ? "You deleted this message" : "This message was deleted") + '</div>';
    else {
      if(m.rp) body += '<div class="ycQuote" data-c="jump" data-id="' + esc(m.rp.id) + '"><b style="color:' + colorOf(m.rp.by) + '">' + esc(m.rp.by === MY ? "You" : fullName(m.rp.by)) + '</b><span>' + esc(m.rp.t || "") + '</span></div>';
      if(m.fw) body += '<div class="ycFw">↪ Forwarded</div>';
      if(m.k === "img"){ media = true; var ar = m.w && m.h ? m.h / m.w : .75, wd = Math.min(260, Math.round(((($("ycW") || {}).clientWidth) || window.innerWidth || 400) * .64)), ht = Math.max(90, Math.min(340, Math.round(wd * ar)));
        body += '<div class="ycImg" style="width:' + wd + 'px;height:' + ht + 'px" data-c="view" data-f="' + m.f.id + '"><img src="' + (BU[m.f.id] || m.th || "") + '" data-f="' + m.f.id + '" alt="">' + (m.pend ? '<i class="ycSpin"></i>' : '') + (m.t ? '' : '<span class="ycOver">' + hm(m.at) + (mine ? " " + tickOf(c, m.at) : "") + '</span>') + '</div>' + (m.t ? '<div class="ycTxt">' + linkify(m.t, fq) + '</div>' : ''); }
      else if(m.k === "voice") body += '<div class="ycVn"><button class="ycPlay' + ((m.by === MY ? Object.keys(m.pl || {}).some(function(u){ return u !== MY; }) : !!(m.pl && m.pl[MY])) ? " heard" : "") + '" data-c="play" data-f="' + m.f.id + '" data-id="' + m.id + '">▶</button><div class="ycWave">' + waveBars(m.id) + '</div><span>' + fmtDur(m.dur || 0) + '</span>' + avU(m.by, 34) + '</div>';
      else if(m.k === "file") body += '<button class="ycFile" data-c="dl" data-f="' + m.f.id + '" data-n="' + esc(m.f.name) + '"><span class="ycFic" style="background:' + fileCol(m.f.name) + '">' + esc(ext(m.f.name)) + '</span><span class="ycFn"><b>' + esc(m.f.name) + '</b><small>' + fmtSize(m.f.size) + ' · ' + esc(ext(m.f.name)) + '</small></span><span class="ycDlI">⬇</span></button>' + (m.t ? '<div class="ycTxt">' + linkify(m.t, fq) + '</div>' : '');
      else if(m.k === "call") body += '<div class="ycCallM" data-c="' + (m.video ? "vcall" : "call") + '"><span class="ycCallIc' + (/Missed|no one|declined|Busy/i.test(m.t) ? " miss" : "") + '">' + (m.video ? IC.video : IC.call) + '</span><span><b>' + esc(m.t) + '</b><small>' + (m.dur ? fmtDur(m.dur) : "Tap to call back") + '</small></span></div>';
      else if(m.k === "wash" && window.YQWASH) body += window.YQWASH.card(m);
      else if(m.k === "meet") body += '<div class="ycMeetM"><b>' + IL.cal + ' ' + esc(m.t) + '</b><small>' + esc(dayLbl(m.mat) + " at " + hm(m.mat)) + '</small><div class="ycMeetB"><button data-c="meetinfo" data-id="' + esc(m.mid) + '" class="gh">Agenda & minutes</button><button data-c="meetjoin" data-id="' + esc(m.mid) + '">Join</button></div></div>';
      else body += '<div class="ycTxt' + (/^\p{Extended_Pictographic}{1,3}$/u.test(m.t || "") ? " big" : "") + '">' + linkify(m.t, fq) + '</div>';
    }
    if(m.fed && !m.del && fdKind(m.t)) body += m.fed.ok ? '<div class="ycFed ok">✓ Saved to YQI · ' + esc(m.fed.s || "") + '</div>' : '<div class="ycFed bad">⚠ Not saved – fix: ' + esc((m.fed.err || []).join(", ")) + ' (long-press → Edit)</div>';
    var meta = media && !m.t && !m.del && m.k === "img" ? "" : '<span class="ycMeta">' + (m.st && m.st[MY] ? '<i class="ycStar">' + IC.star + '</i>' : '') + (m.ed ? "edited " : "") + hm(m.at) + (mine && !m.del ? " " + (m.pend ? '<i class="ycTk">🕓</i>' : tickOf(c, m.at)) : "") + '</span>';
    var re = m.re && Object.keys(m.re).length ? '<div class="ycRe" data-c="reinfo" data-id="' + m.id + '">' + reacts(m.re) + '</div>' : "";
    var who = g && !mine && firstOf ? '<div class="ycWho" style="color:' + colorOf(m.by) + '">' + nmT(m.by) + '</div>' : "";
    h += '<div class="ycMsg ' + (mine ? "me" : "th") + (firstOf ? " f" : "") + (re ? " hasre" : "") + '" id="m_' + m.id + '">' + (g && !mine ? '<span class="ycMav">' + (firstOf ? avU(m.by, 28) : "") + '</span>' : '') + '<div class="ycB' + (media ? " media" : "") + (m.k === "voice" ? " vn" : "") + '" data-lp="msg" data-id="' + m.id + '">' + who + body + meta + re + '</div>' + (m.del || m.pend ? '' : '<button class="ycReB" data-c="reactpick" data-id="' + m.id + '" title="React">' + IL.smile + '</button>') + '<i class="ycSwR">' + IL.reply + '</i></div>';
  });
  box.innerHTML = h; box.setAttribute("data-r", "1");
  box.querySelectorAll(".ycImg img").forEach(function(im){ var id = im.getAttribute("data-f"); if(!BU[id]) fileUrl(id).then(function(u){ im.src = u; }).catch(function(){}); });
  if(atBottom) box.scrollTop = box.scrollHeight;
  bind(box);
}
function reacts(re){ var cnt = {}; Object.keys(re).forEach(function(u){ cnt[re[u]] = (cnt[re[u]] || 0) + 1; }); return Object.keys(cnt).map(function(e){ return e + (cnt[e] > 1 ? "<small>" + cnt[e] + "</small>" : ""); }).join(""); }
function waveBars(seed){ var h = 0, s = ""; for(var i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0; for(var j = 0; j < 28; j++){ h = (h * 1103515245 + 12345) >>> 0; s += '<i style="height:' + (20 + (h % 80)) + '%"></i>'; } return s; }
function ext(n){ var e = String(n || "").split(".").pop(); return e && e.length <= 5 ? e.toUpperCase() : "FILE"; }
function fileCol(n){ var e = ext(n); return {PDF: "#d9433b", XLSX: "#1f7a3e", XLS: "#1f7a3e", CSV: "#1f7a3e", DOC: "#2a5ab0", DOCX: "#2a5ab0", PPT: "#c75a1a", PPTX: "#c75a1a", ZIP: "#6a6a6a"}[e] || "#5a6a50"; }
function linkify(t, hl){ var s = esc(t).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>').replace(/\*([^*\n]+)\*/g, "<b>$1</b>").replace(/_([^_\n]+)_/g, "<i>$1</i>").replace(/@([a-z0-9_]{3,20})/gi, function(m0, u){ if(u.toLowerCase() === "all") return '<span class="ycMen me">@all</span>'; var ok = Object.keys(PEOPLE).some(function(k){ return PEOPLE[k].uname === u; }); return ok ? '<span class="ycMen' + (ME && ME.uname === u ? " me" : "") + '">@' + u + '</span>' : m0; }).replace(/\n/g, "<br>");
  if(hl){ var r = new RegExp("(" + hl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig"); s = s.replace(/(^|>)([^<]+)/g, function(a, b, txt){ return b + txt.replace(r, "<mark>$1</mark>"); }); }
  return s; }

// ---------- sending ----------
function post(m, preview){
  var id = OPEN, c = CHATS[id]; if(!c) return Promise.reject(new Error("no chat"));
  m.by = MY; m.at = now(); if(REPLY){ m.rp = REPLY; REPLY = null; replyBar(); }
  if(c.type === "group" && m.t){ var mn = mentionsOf(m.t, c); if(mn.length) m.mn = mn; }
  var tg = []; if(c.cu) tg.push(c.cu); String(m.t || "").replace(/\b(YTM|PO|LOT)\s*[-#:]?\s*([A-Z0-9-]{3,})/gi, function(a, k, n){ tg.push(k.toUpperCase() + " " + n.toUpperCase()); }); if(tg.length) m.tg = tg.filter(function(x, i, a){ return a.indexOf(x) === i; }).slice(0, 6);
  var ref = FS.collection("chats").doc(id).collection("m").doc();
  var u = {at: m.at, last: {t: preview, by: MY, at: m.at, k: m.k}}; u["ty." + MY] = 0; u["rd." + MY] = m.at;
  (c.members || []).forEach(function(x){ if(x !== MY) u["n." + x] = FV.increment(1); });
  if(c.hid && c.hid[MY]){} MSGS.push(Object.assign({id: ref.id, pend: 1}, m)); renderMsgs();
  if((id === "grp_insp_int" || id === "grp_insp_ext") && window.yqRepackAfter && m.k !== "sys") setTimeout(function(){ try{ window.yqRepackAfter({gid: id, t: m.t || "", tg: m.tg || []}); }catch(e){} }, 900);
  return ref.set(m).then(function(){ return FS.collection("chats").doc(id).update(u); }).then(function(){ pushNote(c, preview, m.mn); }).catch(function(e){ toast("Not sent: " + (e.code || e.message)); });
}
// ---------- @mentions in groups: type @ to pick a member, @all for everyone ----------
function menAuto(tx){ var c = CHATS[OPEN], old = $("ycMenP"); if(!c || c.type !== "group"){ if(old) old.remove(); return; }
  var pos = tx.selectionStart, before = tx.value.slice(0, pos), m = /(^|\s)@([^\s@]{0,20})$/.exec(before); if(!m){ if(old) old.remove(); return; }
  var q = m[2].toLowerCase(), L = (c.members || []).filter(function(u){ return u !== MY && person(u) && person(u).uname; }).map(function(u){ var p = person(u); return {u: u, k: p.uname, n: p.name || p.uname}; })
    .filter(function(x){ return !q || x.k.toLowerCase().indexOf(q) === 0 || x.n.toLowerCase().indexOf(q) >= 0; }).slice(0, 8);
  if(!q || "all".indexOf(q) === 0) L.unshift({u: "all", k: "all", n: "Everyone in this group"});
  if(!L.length){ if(old) old.remove(); return; }
  var p = old || document.createElement("div"); p.id = "ycMenP"; p.className = "ycMenP";
  p.innerHTML = L.map(function(x){ return '<button data-k="' + esc(x.k) + '">' + (x.u === "all" ? '<span class="ycAv ycCalIc" style="width:34px;height:34px">' + IL.users + '</span>' : avU(x.u, 34)) + '<span><b>' + esc(x.n) + vB(x.u === "all" ? "" : x.u, 13) + '</b><small>@' + esc(x.k) + '</small></span></button>'; }).join("");
  if(!old){ var box = $("ycIn"); if(!box) return; box.appendChild(p); }
  p.querySelectorAll("button").forEach(function(b){ b.onmousedown = function(e){ e.preventDefault(); }; b.onclick = function(){ var k = b.getAttribute("data-k"), st = before.length - m[2].length - 1;
    tx.value = tx.value.slice(0, st) + "@" + k + " " + tx.value.slice(pos); var np = st + k.length + 2; tx.focus(); try{ tx.setSelectionRange(np, np); }catch(e){} p.remove(); inputMode(); }; }); }
function mentionsOf(t, c){ var out = [], all = false; String(t || "").replace(/(^|\s)@([a-z0-9_]{3,20})\b/gi, function(a, sp, k){ k = k.toLowerCase(); if(k === "all") all = true; else (c.members || []).forEach(function(u){ var p = person(u); if(p && String(p.uname || "").toLowerCase() === k && out.indexOf(u) < 0) out.push(u); }); });
  return all ? (c.members || []).filter(function(u){ return u !== MY; }) : out.filter(function(u){ return u !== MY; }); }
function send(){ var p0 = $("ycMenP"); if(p0) p0.remove(); var tx = $("ycTx"); if(!tx) return; var t = tx.value.trim(); if(!t) return; tx.value = ""; tx.style.height = "auto"; inputMode(); post({k: "text", t: t.slice(0, 5000)}, t.slice(0, 120)); tx.focus(); }
// ---------- photo preview & edit before sending (crop, rotate, draw, highlight, caption) ----------
function pickSend(fs){ if(!fs.length) return; var im = fs.filter(function(f){ return /^image\//.test(f.type) && !/svg|gif/.test(f.type); }).slice(0, 10), ot = fs.filter(function(f){ return im.indexOf(f) < 0; });
  if(ot.length) custGate(function(){ ot.forEach(function(f){ sendFile(f); }); });
  if(im.length) photoEd(im).then(function(out){ if(out && out.length) custGate(function(){ out.forEach(function(x){ sendFile(x.blob, x.name, x.cap); }); }); }); }
function photoEd(files){ return new Promise(function(res){
  pushH(); var v = document.createElement("div"); v.className = "ycView ycPE"; document.body.appendChild(v);
  var L = files.map(function(f){ return {f: f, base: null, hist: [], strokes: [], cap: ""}; }), cur = 0, mode = "", col = "#e5484d", crop = null, done = false;
  var COLS = ["#e5484d", "#ffd60a", "#3d9a1f", "#1d9bf0", "#ffffff", "#111111"];
  v.innerHTML = '<div class="ycPEt"><button data-k="x" title="Cancel">' + IL.close + '</button><span class="ycPEn"></span><div class="ycPEtools"><button data-k="crop" title="Crop">' + PEI.crop + '</button><button data-k="rot" title="Rotate">' + PEI.rot + '</button><button data-k="pen" title="Draw">' + PEI.pen + '</button><button data-k="hl" title="Highlight">' + PEI.hl + '</button><button data-k="undo" title="Undo">' + PEI.undo + '</button></div></div>' +
    '<div class="ycPEm"><canvas></canvas><div class="ycPEc" style="display:none"><i data-h="nw"></i><i data-h="ne"></i><i data-h="sw"></i><i data-h="se"></i></div></div>' +
    '<div class="ycPEcol" style="display:none">' + COLS.map(function(c){ return '<button data-col="' + c + '" style="background:' + c + '"></button>'; }).join("") + '</div>' +
    '<div class="ycPEcb" style="display:none"><button data-k="ccancel">Cancel</button><button data-k="cdone" class="ok">Done</button></div>' +
    '<div class="ycPEth"></div><div class="ycPEb"><input placeholder="Add a caption…" maxlength="1000"><button data-k="send" title="Send">' + IC.send + '</button></div>';
  var cv = v.querySelector("canvas"), g = cv.getContext("2d"), box = v.querySelector(".ycPEc"), M = v.querySelector(".ycPEm"), capI = v.querySelector(".ycPEb input"), sc = 1;
  function load(i){ var it = L[i]; if(it.base) return Promise.resolve(it);
    return imgResize(it.f, 1800).then(function(o){ it.base = o.c; return it; }); }
  function render(){ var it = L[cur]; if(!it || !it.base) return; var b = it.base; v.querySelector(".ycPEcol").style.display = mode === "pen" || mode === "hl" ? "" : "none"; v.querySelector(".ycPEcb").style.display = mode === "crop" ? "" : "none"; var mw = Math.max(80, M.clientWidth - 16), mh = Math.max(80, M.clientHeight - 16); sc = Math.min(mw / b.width, mh / b.height, 1.6);
    cv.width = b.width; cv.height = b.height; cv.style.width = Math.round(b.width * sc) + "px"; cv.style.height = Math.round(b.height * sc) + "px";
    g.drawImage(b, 0, 0); it.strokes.forEach(function(s){ stroke(g, s); });
    v.querySelector(".ycPEn").textContent = L.length > 1 ? (cur + 1) + " / " + L.length : "";
    v.querySelectorAll(".ycPEtools button").forEach(function(bt){ bt.classList.toggle("on", bt.getAttribute("data-k") === mode); });
    var sh = function(sel, on){ var e = typeof sel === "string" ? v.querySelector(sel) : sel; e.style.display = on ? "" : "none"; }; sh(".ycPEcol", mode === "pen" || mode === "hl"); sh(".ycPEcb", mode === "crop"); sh(box, mode === "crop"); v.querySelector(".ycPEb").style.visibility = mode === "crop" ? "hidden" : "";
    v.querySelectorAll("[data-col]").forEach(function(bt){ bt.classList.toggle("on", bt.getAttribute("data-col") === col); });
    var th = v.querySelector(".ycPEth"); th.innerHTML = L.length > 1 ? L.map(function(x, i){ return '<button data-i="' + i + '" class="' + (i === cur ? "on" : "") + '">' + (x.base ? '<img src="' + x.base.toDataURL("image/jpeg", .4) + '">' : '') + '</button>'; }).join("") : "";
    th.querySelectorAll("[data-i]").forEach(function(bt){ bt.onclick = function(){ go2(+bt.getAttribute("data-i")); }; });
    if(mode === "crop") placeCrop(); }
  function stroke(c, s){ if(!s.p.length) return; c.save(); c.lineCap = "round"; c.lineJoin = "round"; c.strokeStyle = s.c; c.lineWidth = s.w; c.globalAlpha = s.hl ? .38 : 1; if(s.hl) c.globalCompositeOperation = "multiply";
    c.beginPath(); c.moveTo(s.p[0][0], s.p[0][1]); s.p.forEach(function(q){ c.lineTo(q[0], q[1]); }); if(s.p.length === 1) c.lineTo(s.p[0][0] + .1, s.p[0][1]); c.stroke(); c.restore(); }
  function go2(i){ L[cur].cap = capI.value; cur = i; mode = ""; load(i).then(function(){ capI.value = L[cur].cap; render(); }); }
  // drawing
  var drawing = null;
  function pt(e){ var r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / sc, (e.clientY - r.top) / sc]; }
  cv.addEventListener("pointerdown", function(e){ if(mode !== "pen" && mode !== "hl") return; e.preventDefault(); cv.setPointerCapture(e.pointerId); var b = L[cur].base, u = Math.max(b.width, b.height);
    drawing = {c: mode === "hl" ? (col === "#ffffff" || col === "#111111" ? "#ffd60a" : col) : col, w: mode === "hl" ? u * .035 : u * .008, hl: mode === "hl", p: [pt(e)]}; L[cur].strokes.push(drawing); render(); });
  cv.addEventListener("pointermove", function(e){ if(!drawing) return; drawing.p.push(pt(e)); render(); });
  var endD = function(){ drawing = null; }; cv.addEventListener("pointerup", endD); cv.addEventListener("pointercancel", endD);
  // crop box (in screen px relative to canvas)
  function placeCrop(){ var r = cv.getBoundingClientRect(), m = M.getBoundingClientRect(); if(!crop) crop = {x: 0, y: 0, w: r.width, h: r.height};
    box.style.left = (r.left - m.left + crop.x) + "px"; box.style.top = (r.top - m.top + crop.y) + "px"; box.style.width = crop.w + "px"; box.style.height = crop.h + "px"; }
  var cd = null;
  box.addEventListener("pointerdown", function(e){ e.preventDefault(); box.setPointerCapture(e.pointerId); cd = {h: e.target.getAttribute("data-h") || "mv", x: e.clientX, y: e.clientY, c: Object.assign({}, crop)}; });
  box.addEventListener("pointermove", function(e){ if(!cd) return; var r = cv.getBoundingClientRect(), dx = e.clientX - cd.x, dy = e.clientY - cd.y, c = Object.assign({}, cd.c), min = 40;
    if(cd.h === "mv"){ c.x = Math.max(0, Math.min(r.width - c.w, c.x + dx)); c.y = Math.max(0, Math.min(r.height - c.h, c.y + dy)); }
    else { if(/w/.test(cd.h)){ var nx = Math.max(0, Math.min(c.x + c.w - min, c.x + dx)); c.w += c.x - nx; c.x = nx; } if(/e/.test(cd.h)) c.w = Math.max(min, Math.min(r.width - c.x, c.w + dx));
      if(/n/.test(cd.h)){ var ny = Math.max(0, Math.min(c.y + c.h - min, c.y + dy)); c.h += c.y - ny; c.y = ny; } if(/s/.test(cd.h)) c.h = Math.max(min, Math.min(r.height - c.y, c.h + dy)); }
    crop = c; placeCrop(); });
  var endC = function(){ cd = null; }; box.addEventListener("pointerup", endC); box.addEventListener("pointercancel", endC);
  function flat(it){ var c = document.createElement("canvas"); c.width = it.base.width; c.height = it.base.height; var x = c.getContext("2d"); x.drawImage(it.base, 0, 0); it.strokes.forEach(function(s){ stroke(x, s); }); return c; }
  function applyCrop(){ var it = L[cur], f = flat(it), x0 = Math.round(crop.x / sc), y0 = Math.round(crop.y / sc), w = Math.round(crop.w / sc), h = Math.round(crop.h / sc);
    var c = document.createElement("canvas"); c.width = Math.max(1, w); c.height = Math.max(1, h); c.getContext("2d").drawImage(f, x0, y0, w, h, 0, 0, w, h); it.hist.push({b: it.base, s: it.strokes}); it.base = c; it.strokes = []; }
  function rotate(){ var it = L[cur], f = flat(it), c = document.createElement("canvas"); c.width = f.height; c.height = f.width; var x = c.getContext("2d"); x.translate(c.width, 0); x.rotate(Math.PI / 2); x.drawImage(f, 0, 0); it.hist.push({b: it.base, s: it.strokes}); it.base = c; it.strokes = []; }
  v.querySelectorAll("[data-col]").forEach(function(bt){ bt.onclick = function(){ col = bt.getAttribute("data-col"); render(); }; });
  v.querySelectorAll("[data-k]").forEach(function(bt){ bt.onclick = function(){ var k = bt.getAttribute("data-k"), it = L[cur];
    if(k === "x"){ uiBack(); return; }
    if(!it || !it.base) return;
    if(k === "pen" || k === "hl"){ mode = mode === k ? "" : k; return render(); }
    if(k === "crop"){ mode = "crop"; crop = null; return render(); }
    if(k === "ccancel"){ mode = ""; return render(); }
    if(k === "cdone"){ applyCrop(); mode = ""; crop = null; return render(); }
    if(k === "rot"){ rotate(); return render(); }
    if(k === "undo"){ if(it.strokes.length) it.strokes.pop(); else if(it.hist.length){ var h = it.hist.pop(); it.base = h.b; it.strokes = h.s; } return render(); }
    if(k === "send"){ if(done) return; done = true; L[cur].cap = capI.value.trim();
      Promise.all(L.map(function(x, i){ return load(i).then(function(){ return canvasBlob(flat(x), .86); }).then(function(bl){ return {blob: bl, name: "Photo " + hm(now()) + (L.length > 1 ? "-" + (i + 1) : "") + ".jpg", cap: (x.cap || "").trim()}; }); }))
        .then(function(out){ uiBack(); res(out); }).catch(function(e){ done = false; toast("Could not prepare photo"); }); } }; });
  capI.addEventListener("keydown", function(e){ if(e.key === "Enter"){ e.preventDefault(); v.querySelector('[data-k="send"]').click(); } });
  window.addEventListener("resize", function(){ if(document.body.contains(v)) render(); });
  load(0).then(function(){ render(); Promise.all(L.map(function(x, i){ return load(i); })).then(render); }).catch(function(){ toast("Could not open this photo"); uiBack(); });
}); }
var PEI = {crop: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2v14a2 2 0 002 2h14M2 6h14a2 2 0 012 2v14"/></svg>', rot: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 10-2.3 5.7M20 4v7h-7"/></svg>', pen: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M15.5 4.5l4 4L8 20H4v-4L15.5 4.5z"/></svg>', hl: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l6-6 4 4-6 6M9 11l-4 4v3h3l5-3M9 11l4 4M3 21h8"/></svg>', undo: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 010 11H11"/></svg>'};
function sendFile(f, name, cap){
  var img = /^image\//.test(f.type) && !/svg/.test(f.type);
  if(img){ var tmpId = "tmp" + hex(8); thumbOf(f, 360).then(function(th){ var pid = OPEN; var ph = {k: "img", t: cap || "", th: th ? th.u : "", w: th ? th.w : 0, h: th ? th.h : 0, f: {id: tmpId}};
      MSGS.push(Object.assign({id: tmpId, pend: 1, by: MY, at: now()}, ph)); renderMsgs();
      return putFile(f, name).then(function(r){ MSGS = MSGS.filter(function(m){ return m.id !== tmpId; }); if(OPEN !== pid) return; ph.f = r; return post(ph, "📷 Photo" + (cap ? " " + cap.slice(0, 80) : "")); }); }).catch(function(e){ MSGS = MSGS.filter(function(m){ return m.id !== tmpId; }); renderMsgs(); toast(e.message || "Could not send"); }); return; }
  toast("Sending " + (f.name || "file") + "…");
  putFile(f, name).then(function(r){ return post({k: "file", t: "", f: r}, "📄 " + r.name); }).catch(function(e){ toast(e.message || "Could not send"); });
}
// voice notes — tap mic to record, ✈ to send, 🗑 to cancel
var REC = null;
function recStart(){
  if(!navigator.mediaDevices || !window.MediaRecorder){ toast("Voice notes are not supported on this phone."); return; }
  navigator.mediaDevices.getUserMedia({audio: {echoCancellation: true, noiseSuppression: true}}).then(function(st){
    var mt = ["audio/webm;codecs=opus", "audio/ogg;codecs=opus", "audio/mp4"].filter(function(x){ return MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(x); })[0] || "";
    var r = new MediaRecorder(st, mt ? {mimeType: mt} : undefined), ch = [];
    REC = {r: r, st: st, ch: ch, t0: now(), cancel: false};
    r.ondataavailable = function(e){ if(e.data && e.data.size) ch.push(e.data); };
    r.onstop = function(){ var R = REC; REC = null; try{ st.getTracks().forEach(function(x){ x.stop(); }); }catch(e){} clearInterval(R && R.tm); var ib2 = $("ycIn"); if(ib2){ ib2.innerHTML = inputBar(); bindInput(); }
      if(!R || R.cancel) return; var dur = (now() - R.t0) / 1000; if(dur < .8){ toast("Too short — hold on a little longer"); return; }
      var b = new Blob(ch, {type: r.mimeType || mt || "audio/webm"}); var cid = OPEN;
      toast("Sending voice note…"); putFile(b, "voice." + (/mp4/.test(b.type) ? "m4a" : /ogg/.test(b.type) ? "ogg" : "webm"), true).then(function(f){ if(OPEN !== cid) return; return post({k: "voice", t: "", f: f, dur: Math.round(dur)}, "🎤 Voice note (" + fmtDur(dur) + ")"); }).catch(function(e){ toast(e.message); }); };
    r.start(250); var ib3 = $("ycIn"); if(ib3){ ib3.innerHTML = inputBar(); bind(ib3); }
    REC.tm = setInterval(function(){ var t = $("ycRecT"); if(t && REC) t.textContent = fmtDur((now() - REC.t0) / 1000); }, 300);
    try{ var a = ac(), src = a.createMediaStreamSource(st), an = a.createAnalyser(); an.fftSize = 128; src.connect(an); var buf = new Uint8Array(an.frequencyBinCount);
      (function lp(){ if(!REC) return; an.getByteFrequencyData(buf); var s = 0; for(var i = 0; i < buf.length; i++) s += buf[i]; var w = $("ycRecW"); if(w){ var bar2 = document.createElement("i"); bar2.style.height = Math.max(8, Math.min(100, s / buf.length * 1.6)) + "%"; w.appendChild(bar2); while(w.children.length > 40) w.removeChild(w.firstChild); } setTimeout(lp, 120); })(); }catch(e){}
  }).catch(function(){ toast("Please allow the microphone for voice notes."); });
}
function recStop(cancel){ if(!REC) return; REC.cancel = !!cancel; try{ REC.r.requestData && REC.r.requestData(); }catch(e){} try{ REC.r.stop(); }catch(e){} }
var PLAYING = null;
function play(btn){
  var id = btn.getAttribute("data-f"), mid = btn.getAttribute("data-id"), vm = mid && msgById(mid);
  if(vm && vm.by !== MY && !(vm.pl && vm.pl[MY]) && OPEN){ vm.pl = vm.pl || {}; vm.pl[MY] = now(); btn.classList.add("heard"); var px = {}; px["pl." + MY] = now(); FS.collection("chats").doc(OPEN).collection("m").doc(mid).update(px).catch(function(){}); } if(PLAYING && PLAYING.btn === btn){ if(PLAYING.a.paused){ PLAYING.a.play(); btn.textContent = "❚❚"; } else { PLAYING.a.pause(); btn.textContent = "▶"; } return; }
  if(PLAYING){ PLAYING.a.pause(); PLAYING.btn.textContent = "▶"; }
  btn.textContent = "…"; fileUrl(id).then(function(u){ var a = new Audio(u), bars = btn.parentNode.querySelectorAll(".ycWave i"); PLAYING = {a: a, btn: btn}; btn.textContent = "❚❚";
    a.ontimeupdate = function(){ var d = a.duration && isFinite(a.duration) ? a.duration : 0; if(!d) return; var k = Math.floor(bars.length * a.currentTime / d); bars.forEach(function(b, i){ b.classList.toggle("p", i <= k); }); };
    a.onended = function(){ btn.textContent = "▶"; bars.forEach(function(b){ b.classList.remove("p"); }); PLAYING = null; }; a.play().catch(function(){ btn.textContent = "▶"; toast("Could not play"); }); }).catch(function(){ btn.textContent = "▶"; toast("Voice note missing"); });
}
function download(id, name){ fileUrl(id).then(function(u){ var a = document.createElement("a"); a.href = u; a.download = name || "file"; document.body.appendChild(a); a.click(); a.remove(); }).catch(function(){ toast("File missing"); }); }
function viewImg(id, th){ pushH(); var v = document.createElement("div"); v.className = "ycView"; v.innerHTML = '<img src="' + (BU[id] || th || "") + '"><div class="ycViewT"><button data-v="dl">⬇</button><button data-v="x">✕</button></div>'; document.body.appendChild(v);
  if(!BU[id]) fileUrl(id).then(function(u){ var im = v.querySelector("img"); if(im) im.src = u; }).catch(function(){});
  v.onclick = function(e){ var b = e.target.closest("[data-v]"); if(b && b.getAttribute("data-v") === "dl"){ download(id, "photo.jpg"); return; } uiBack(); }; }

// ---------- message actions (long press) ----------
function msgById(id){ for(var i = 0; i < MSGS.length; i++) if(MSGS[i].id === id) return MSGS[i]; return null; }
function preview(m){ return m.k === "img" ? "📷 Photo" + (m.t ? " " + m.t : "") : m.k === "voice" ? "🎤 Voice note" : m.k === "file" ? "📄 " + (m.f && m.f.name || "File") : m.k === "call" ? "📞 " + m.t : (m.t || "").slice(0, 120); }
var EMO = ["👍", "❤️", "😂", "😮", "😢", "🙏"], EMOALL = "👍 👎 ❤️ 😂 😮 😢 🙏 ✅ ❌ 🔥 👏 💯 😊 😍 🤝 👌 🎉 😅 🤔 😡 😴 🙌 💪 ⭐ ⚠️ 📌 🧵 🪡 👕 🛏️ 📦 🚚 ✔️ ⏰ 📊 💡".split(" ");
function msgMenu(id, reactOnly){
  var m = msgById(id); if(!m || m.pend || m.k === "sys") return; var mine = m.by === MY, c = CHATS[OPEN];
  var acts = [];
  if(!m.del){ acts.push(["reply", IL.reply, "Reply"]); if(m.t) acts.push(["copy", IL.copy, "Copy"]); acts.push(["fwd", IL.fwd, "Forward"]); acts.push(["star", IL.star, m.st && m.st[MY] ? "Unstar" : "Star"]); if(mine && m.k === "text" && (now() - m.at < 15 * 60000 || fdKind(m.t))) acts.push(["edit", IL.edit, "Edit"]); if(mine) acts.push(["info", IL.info, "Info"]); }
  acts.push(["delme", IL.trash, "Delete for me"]); if(mine && !m.del && now() - m.at < 48 * 3600000) acts.push(["delall", IL.trash, "Delete for everyone"]);
  closeSheet(); var s = document.createElement("div"); s.id = "ycSheet"; s.className = "ycMsgOv" + (DARK ? " dk" : "");
  var pill = m.del ? "" : '<div class="ycPill2">' + EMO.map(function(e){ return '<button data-a="re" data-e="' + e + '" class="' + (m.re && m.re[MY] === e ? "on" : "") + '">' + e + '</button>'; }).join("") + '<button data-a="more" class="pl">' + IL.plus + '</button></div>';
  s.innerHTML = '<div class="ycShBg"></div>' + pill + (reactOnly ? "" : '<div class="ycMenu ycMact">' + acts.map(function(a){ return '<button class="ycMi' + (/del/.test(a[0]) ? " red" : "") + '" data-a="' + a[0] + '">' + a[1] + '<span>' + a[2] + '</span></button>'; }).join("") + '</div>');
  document.body.appendChild(s);
  var b = document.querySelector('#m_' + id + ' .ycB'), r = b ? b.getBoundingClientRect() : {top: innerHeight / 2, bottom: innerHeight / 2, left: 20, right: innerWidth - 20};
  if(b) b.classList.add("ycPick");
  var P = s.querySelector(".ycPill2"), A = s.querySelector(".ycMact"), W = innerWidth;
  var place = function(el, top){ if(!el) return; var w = el.offsetWidth; var x = mine ? Math.min(W - w - 8, r.right - w) : Math.max(8, r.left); el.style.left = Math.max(8, Math.min(W - w - 8, x)) + "px"; el.style.top = Math.max(8, Math.min(innerHeight - el.offsetHeight - 8, top)) + "px"; };
  var ph = P ? P.offsetHeight : 0, ah = A ? A.offsetHeight : 0;
  if(P) place(P, r.top - ph - 8 > 60 ? r.top - ph - 8 : r.bottom + 8);
  if(A){ var below = r.bottom + 8 + (P && r.top - ph - 8 <= 60 ? ph + 8 : 0); place(A, below + ah < innerHeight - 8 ? below : Math.max(8, r.top - ah - 8 - (P && r.top - ph - 8 > 60 ? ph + 8 : 0))); }
  setTimeout(function(){ s.classList.add("on"); }, 10); pushH();
  var done = function(){ if(b) b.classList.remove("ycPick"); };
  s.querySelector(".ycShBg").onclick = function(){ done(); uiBack(); };
  var doAct = function(a, el){

    var ref = FS.collection("chats").doc(OPEN).collection("m").doc(id), u = {};
    if(a === "re"){ var e = el.getAttribute("data-e"); u["re." + MY] = m.re && m.re[MY] === e ? FV.delete() : e; ref.update(u).catch(function(x){ toast(x.code || x.message); }); }
    else if(a === "reply"){ REPLY = {id: m.id, by: m.by, t: preview(m)}; replyBar(); var t = $("ycTx"); if(t) t.focus(); }
    else if(a === "copy"){ try{ navigator.clipboard.writeText(m.t); toast("Copied"); }catch(x){ toast("Could not copy"); } }
    else if(a === "fwd"){ FWD = m; go("pick", {mode: "fwd", sel: {}}); }
    else if(a === "star"){ var on = !(m.st && m.st[MY]); u["st." + MY] = on ? now() : FV.delete(); ref.update(u).catch(function(){});
      var sref = FS.collection("people").doc(MY).collection("star").doc(OPEN + "_" + id); if(on) sref.set({cid: OPEN, mid: id, at: m.at, by: m.by, k: m.k, t: preview(m), th: m.th || "", f: m.f || null, sat: now()}).catch(function(){}); else sref.delete().catch(function(){}); toast(on ? "Starred" : "Unstarred"); }
    else if(a === "edit"){ ask("", {title: "Edit message", input: m.t, multi: 1, ok: "Save"}).then(function(nt){ if(nt != null && nt.trim() && nt !== m.t) ref.update({t: nt.trim().slice(0, 5000), ed: 1}).catch(function(x){ toast(x.code || x.message); }); }); }
    else if(a === "info"){ var oth = (c.members || []).filter(function(x){ return x !== MY; }); ask("Read by: " + (oth.filter(function(x){ return (c.rd || {})[x] >= m.at; }).map(fullName).join(", ") || "no one yet") + "\nSent: " + new Date(m.at).toLocaleString(), {title: "Message info", alert: 1}); }
    else if(a === "delme"){ u["dm." + MY] = 1; ref.update(u).catch(function(){}); m.dm = m.dm || {}; m.dm[MY] = 1; MKEY = ""; renderMsgs(); }
    else if(a === "delall"){ ask("Everyone in this chat will see “This message was deleted”.", {title: "Delete for everyone?", ok: "Delete", danger: 1}).then(function(y){ if(y) ref.update({del: 1, t: "", f: null, th: "", rp: null}).then(function(){ if(c.last && c.last.at === m.at){ FS.collection("chats").doc(OPEN).update({"last.t": "🚫 Message deleted"}).catch(function(){}); } }).catch(function(x){ toast(x.code || x.message); }); }); }
    };
  s.querySelectorAll("[data-a]").forEach(function(btn){ btn.onclick = function(e){ e.stopPropagation(); var a = btn.getAttribute("data-a");
    if(a === "more"){ var g2 = document.createElement("div"); g2.className = "ycEmoG"; g2.innerHTML = EMOALL.map(function(x){ return '<button data-e="' + x + '">' + x + '</button>'; }).join(""); if(A) A.remove(); s.appendChild(g2); var gw = Math.min(330, W - 16); g2.style.width = gw + "px"; g2.style.left = Math.round((W - gw) / 2) + "px"; g2.style.top = Math.max(8, Math.min(innerHeight - g2.offsetHeight - 8, (P ? P.getBoundingClientRect().bottom : r.bottom) + 8)) + "px";
      g2.querySelectorAll("button").forEach(function(x){ x.onclick = function(ev){ ev.stopPropagation(); done(); closeSheet(); doAct("re", x); }; }); return; }
    done(); closeSheet(); doAct(a, btn); }; });
}
var FWD = null;
function forwardTo(keys){ var m = FWD; if(!m) return; var targets = [];
  var p = keys.map(function(k){ if(k.indexOf("c:") === 0) return Promise.resolve(k.slice(2)); var u = k.slice(2), id = dmId(MY, u); if(CHATS[id]) return Promise.resolve(id); return FS.collection("chats").doc(id).set({type: "dm", members: [MY, u].sort(), at: now(), made: now(), by: MY, n: {}, rd: {}}, {merge: true}).then(function(){ CHATS[id] = CHATS[id] || {id: id, type: "dm", members: [MY, u].sort(), n: {}, rd: {}}; return id; }); });
  Promise.all(p).then(function(ids){ var keep = OPEN; return Promise.all(ids.map(function(cid){ OPEN = cid; var x = {k: m.k, t: m.t || ""}; if(!m.nofw) x.fw = 1; ["f", "th", "w", "h", "dur"].forEach(function(f){ if(m[f] != null) x[f] = m[f]; }); var pr = post(x, preview(m)); OPEN = keep; return pr; })); })
    .then(function(){ toast("Forwarded"); FWD = null; navBack(); }).catch(function(e){ toast(e.message || "Could not forward"); }); }
function replyBar(){ var b = $("ycReplyBar"); if(!b) return; if(!REPLY){ b.innerHTML = ""; return; } b.innerHTML = '<div class="ycRb"><div class="ycQuote"><b style="color:' + colorOf(REPLY.by) + '">' + esc(REPLY.by === MY ? "You" : fullName(REPLY.by)) + '</b><span>' + esc(REPLY.t) + '</span></div><button class="ycIb" data-c="unreply">✕</button></div>'; bind(b); }
function chatMenu(id){
  var c = CHATS[id]; if(!c) return; var ar = c.ar && c.ar[MY], pn = c.pn && c.pn[MY], mu = c.mu && c.mu[MY], n = unreadOf(c);
  var acts = [["pin", IL.pin, pn ? "Unpin chat" : "Pin chat"], ["mute", mu ? IL.bell : IL.bellOff, mu ? "Unmute" : "Mute notifications"], ["arch", IL.archive, ar ? "Unarchive" : "Archive chat"], ["read", IL.check, n ? "Mark as read" : "Mark as unread"], ["clear", IL.trash, "Delete chat"]];
  sheet('<div class="ycShT">' + esc(chatTitle(c)) + '</div>' + acts.map(function(a){ return '<button class="ycAct' + (a[0] === "clear" ? " red" : "") + '" data-a="' + a[0] + '"><span>' + a[1] + '</span>' + a[2] + '</button>'; }).join(""), function(a){
    var u = {}, ref = FS.collection("chats").doc(id);
    if(a === "pin") u["pn." + MY] = pn ? FV.delete() : now(); if(a === "mute") u["mu." + MY] = mu ? FV.delete() : 1; if(a === "arch"){ u["ar." + MY] = ar ? FV.delete() : 1; toast(ar ? "Chat unarchived" : "Chat archived"); }
    if(a === "read"){ u["n." + MY] = n ? 0 : 1; if(n) u["rd." + MY] = now(); }
    if(a === "clear"){ ask("Messages stay for the other people.", {title: "Delete this chat for you?", ok: "Delete", danger: 1}).then(function(y){ if(!y) return; var u2 = {}; u2["hid." + MY] = now(); u2["n." + MY] = 0; try{ localStorage.removeItem("yqc_m_" + id); }catch(e){} if(OPEN === id){ STACK = []; VIEW = "home"; OPEN = null; stopMsgs(); } ref.update(u2).catch(function(e){ toast(e.code || e.message); }); }); return; }
    ref.update(u).catch(function(e){ toast(e.code || e.message); });
  });
}
function sheet(html, onAct){
  closeSheet(); var s = document.createElement("div"); s.id = "ycSheet"; s.className = DARK ? "dk" : ""; s.innerHTML = '<div class="ycShBg"></div><div class="ycShIn">' + html + '</div>'; document.body.appendChild(s);
  setTimeout(function(){ s.classList.add("on"); }, 10); pushH();
  s.querySelector(".ycShBg").onclick = uiBack;
  s.querySelectorAll("[data-a]").forEach(function(b){ b.onclick = function(e){ e.stopPropagation(); var a = b.getAttribute("data-a"); closeSheet(); onAct(a, b); }; });
}
function menu(anchor, items, onAct){
  closeSheet(); var s = document.createElement("div"); s.id = "ycSheet"; s.className = "ycMenuW" + (DARK ? " dk" : "");
  s.innerHTML = '<div class="ycShBg"></div><div class="ycMenu">' + items.map(function(a){ return '<button class="ycMi' + (a[3] ? " " + a[3] : "") + '" data-a="' + a[0] + '">' + (a[1] || "") + '<span>' + esc(a[2]) + '</span></button>'; }).join("") + '</div>';
  document.body.appendChild(s); var m = s.querySelector(".ycMenu"), r = anchor && anchor.getBoundingClientRect ? anchor.getBoundingClientRect() : {right: innerWidth - 8, bottom: 56, top: 56};
  var top = r.bottom + 4; m.style.right = Math.max(6, innerWidth - r.right) + "px"; m.style.top = top + "px";
  var mh = m.offsetHeight; if(top + mh > innerHeight - 8) m.style.top = Math.max(8, r.top - mh - 4) + "px";
  setTimeout(function(){ s.classList.add("on"); }, 10); pushH();
  s.querySelector(".ycShBg").onclick = uiBack;
  s.querySelectorAll("[data-a]").forEach(function(b){ b.onclick = function(e){ e.stopPropagation(); var a = b.getAttribute("data-a"); closeSheet(); onAct(a, b); }; });
}
function closeSheet(){ document.querySelectorAll(".ycPick").forEach(function(x){ x.classList.remove("ycPick"); }); var s = $("ycSheet"); if(!s) return false; s.remove(); return true; }
function attachSheet(){
  sheet('<div class="ycAttach">' + [["doc", IC.doc, "Document", "#7a4adb"], ["cam", IC.cam.replace('fill="currentColor"', 'fill="#fff"'), "Camera", "#d9435f"], ["gal", IC.gal, "Gallery", "#2a7ad9"], ["meet", IC.meet.replace('fill="currentColor"', 'fill="#fff"'), "Meeting", "#1f9a6a"]].map(function(a){ return '<button data-a="' + a[0] + '"><span style="background:' + a[3] + '">' + a[1] + '</span>' + a[2] + '</button>'; }).join("") + '</div>', function(a){
    if(a === "doc") $("ycFile").click(); else if(a === "cam") $("ycCam").click(); else if(a === "gal") $("ycGal").click(); else if(a === "meet") go("meetnew", {cid: OPEN}); });
}
function homeMenu(el){
  menu(el, [["newgroup0", IL.users, "New group"], ["meetnew", IL.cal, "New meeting"], ["starred", IL.star, "Starred messages"], ["archived", IL.archive, "Archived chats"], ["me", IL.user, "Profile & settings"]].concat(amStaff() && !custOf(MY) && !document.body.classList.contains("yqfu") ? [["staff", IL.users, "Yunus Textile people"]] : []).concat(document.body.classList.contains("yqfu") ? [] : [["linkpc", IL.qr, "Link a computer (scan QR)"]]).concat([["close", IL.exit, "Close chat"]]), function(a){ act(a); });
}
function chatMoreMenu(el){
  var c = CHATS[OPEN], g = c.type === "group", oth = chatOther(c);
  var items = [["info", IL.info, g ? "Group info" : "View contact"], ["find", IL.search, "Search in chat"], ["media", IL.media, "Media, links and docs"], ["wall", IL.wall, "Wallpaper"], ["cmute", c.mu && c.mu[MY] ? IL.bell : IL.bellOff, c.mu && c.mu[MY] ? "Unmute notifications" : "Mute notifications"], ["carch", IL.archive, c.ar && c.ar[MY] ? "Unarchive chat" : "Archive chat"]];
  if(!g && oth !== MY) items.push(["cblock", IL.block, iBlocked(oth) ? "Unblock" : "Block", "red"]);
  items.push(["cdel", IL.trash, "Delete chat", "red"]);
  menu(el, items, function(a){
    if(a === "cblock") return askBlock(oth);
    if(a === "info" || a === "media") return go("info", {media: a === "media"});
    if(a === "find"){ PARAM.find = true; var w = $("ycW"); w.removeAttribute("data-v"); return paint(true); }
    if(a === "wall") return wallSheet();
    var u = {}; if(a === "cmute") u["mu." + MY] = c.mu && c.mu[MY] ? FV.delete() : 1; if(a === "carch") u["ar." + MY] = c.ar && c.ar[MY] ? FV.delete() : 1;
    if(a === "cdel"){ var cid0 = OPEN; ask("Messages stay for the other people.", {title: "Delete this chat for you?", ok: "Delete", danger: 1}).then(function(y){ if(!y) return; var u2 = {}; u2["hid." + MY] = now(); u2["n." + MY] = 0; FS.collection("chats").doc(cid0).update(u2).then(function(){ STACK = []; VIEW = "home"; OPEN = null; stopMsgs(); paint(true); }).catch(function(e){ toast(e.code || e.message); }); }); return; }
    FS.collection("chats").doc(OPEN).update(u).then(function(){ if(a === "cdel" || a === "carch"){ STACK = []; VIEW = "home"; OPEN = null; stopMsgs(); paint(true); } }).catch(function(e){ toast(e.code || e.message); });
  });
}
function wallSheet(){ sheet('<div class="ycShT">Chat wallpaper</div><div class="ycWalls">' + [["leaf", "YQI leaf"], ["weave", "Textile weave"], ["plain", "Plain"]].map(function(x){ return '<button data-a="' + x[0] + '" class="ycWall-' + x[0] + (wallClass() === "ycWall-" + x[0] ? " on" : "") + '"><b>' + x[1] + '</b></button>'; }).join("") + '</div>', function(a){
  if(a === "dark"){ DARK = !DARK; lsSet("yqc_dark", DARK ? "1" : "0"); $("ycW").removeAttribute("data-v"); return paint(true); } lsSet("yqc_wall", a); var m = $("ycMsgs"); if(m) m.className = "ycMsgs ycScroll " + wallClass(); }); }

// ---------- profile + settings ----------
function profileView(w){
  var me = ME || {}, setup = PARAM.setup || !ME;
  var nm = PARAM.nm != null ? PARAM.nm : me.name || EMAIL.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, function(c){ return c.toUpperCase(); });
  var un = PARAM.un != null ? PARAM.un : me.uname || EMAIL.split("@")[0].replace(/[^a-z0-9_]/g, "").slice(0, 20);
  var h = bar(setup ? '' : BACKB(), '<b>' + (setup ? "Welcome to YQI Chat" : "Profile") + '</b>', setup ? "Set up your profile" : "", setup ? ib("close", "✕", "Close") : "");
  h += '<div class="ycScroll"><div class="ycCover" data-c="' + (setup ? "noop" : "mycover") + '" style="' + (me.cvt ? "background-image:url(" + me.cvt + ")" : "") + '"><span class="ycCoverB">' + IC.cam + ' ' + (me.cvt ? "Change cover" : "Add cover photo") + '</span></div>';
  h += '<div class="ycProf"><div class="ycProfAv" data-c="' + (setup ? "noop" : "mycard") + '">' + avImg(nm, MY, 110, me.pt) + '<span class="ycCamB">' + IC.cam + '</span></div>';
  h += '<div class="ycForm"><label>Full name</label><input id="ycNm" maxlength="40" value="' + esc(nm) + '"><label>Username</label><div class="ycAt"><i>@</i><input id="ycUn" maxlength="20" value="' + esc(un) + '"></div><label>About</label><input id="ycAb" maxlength="120" placeholder="e.g. Available · QA Bedsure" value="' + esc(PARAM.ab != null ? PARAM.ab : me.about || "") + '"><label>Department / role</label><input id="ycDp" maxlength="40" placeholder="e.g. QA, Stitching, Planning" value="' + esc(PARAM.dp != null ? PARAM.dp : me.dept || "") + '"><label>Unit / location</label><input id="ycUt" maxlength="40" placeholder="e.g. YTM-7 Third Floor" value="' + esc(PARAM.ut != null ? PARAM.ut : me.unit || "") + '"><div class="ycErr" id="ycErr"></div><button class="ycPb" data-c="saveme">' + (setup ? "Start chatting" : "Save profile") + '</button></div></div>';
  if(!setup){ h += stepsCard(me) + (custOf(MY) ? '' : empHtml(me)); h += '<div class="ycSec">Settings</div>' +
    '<button class="ycRow" data-c="tsnd"><span class="ycSi">🔔</span><div class="ycRm"><div class="ycR1"><b>Message sound</b><time>' + (lsGet("yqc_snd") === "0" ? "Off" : "On") + '</time></div></div></button>' +
    '<button class="ycRow" data-c="notif"><span class="ycSi">📲</span><div class="ycRm"><div class="ycR1"><b>Phone notifications</b><time>' + (window.Notification ? Notification.permission : "n/a") + '</time></div><div class="ycR2"><span>Shows messages when YQI is in the background</span></div></div></button>' +
    '<button class="ycRow" data-c="wallset"><span class="ycSi">🌿</span><div class="ycRm"><div class="ycR1"><b>Wallpaper</b><time>' + (DARK ? "Dark" : "Light") + ' · follows app theme</time></div></div></button>' +
    '<button class="ycRow" data-c="starred"><span class="ycSi">⭐</span><div class="ycRm"><div class="ycR1"><b>Starred messages</b></div></div></button>' +
    '<button class="ycRow" data-c="archived"><span class="ycSi">🗄</span><div class="ycRm"><div class="ycR1"><b>Archived chats</b></div></div></button>' +
    '<div class="ycEmpty sm"><span>YQI Chat · ' + esc(EMAIL) + '</span></div>'; }
  w.innerHTML = h + '</div><input type="file" id="ycPhF" accept="image/*" hidden>'; bind(w);
  ["Nm:nm", "Un:un", "Ab:ab", "Dp:dp", "Ut:ut", "Ec:ec"].forEach(function(k){ var a = k.split(":"), el = $("yc" + a[0]); if(el) el.oninput = function(){ PARAM[a[1]] = el.value; }; });
}
// ---------- adjust photo: move and zoom inside a fixed frame ----------
function cropper(file, aspect, round, outW){
  return new Promise(function(res){
    pushH(); var v = document.createElement("div"); v.className = "ycView ycCrop"; var url = URL.createObjectURL(file);
    var bw = Math.min(window.innerWidth - 32, 440), bh = Math.round(bw / aspect); if(bh > window.innerHeight - 260){ bh = window.innerHeight - 260; bw = Math.round(bh * aspect); }
    v.innerHTML = '<div class="ycCardT"><button data-k="x">' + IC.back + '</button><div><b>Adjust photo</b><span>Drag to move · pinch or slide to zoom</span></div></div><div class="ycCropM"><div class="ycCropB' + (round ? " rd" : "") + '" style="width:' + bw + 'px;height:' + bh + 'px"><img alt="" draggable="false"><i></i></div></div><div class="ycCropZ"><span>−</span><input type="range" min="1" max="4" step="0.01" value="1"><span>+</span></div><div class="ycCropA"><button data-k="x">Cancel</button><button data-k="rot">⟳ Rotate</button><button data-k="ok" class="ok">Done</button></div>';
    document.body.appendChild(v);
    var img = v.querySelector(".ycCropB img"), box = v.querySelector(".ycCropB"), rng = v.querySelector("input"), iw = 0, ih = 0, base = 1, z = 1, x = 0, y = 0, rot = 0;
    function dims(){ return rot % 2 ? {w: ih, h: iw} : {w: iw, h: ih}; }
    function clamp(){ var d = dims(), s = base * z, w = d.w * s, h = d.h * s; x = Math.min(0, Math.max(bw - w, x)); y = Math.min(0, Math.max(bh - h, y)); }
    function draw(){ clamp(); var d = dims(), s = base * z; img.style.width = iw + "px"; img.style.height = ih + "px"; img.style.transformOrigin = "0 0";
      var tx = x, ty = y, r = rot * 90; if(rot === 1) tx += d.w * s; else if(rot === 2){ tx += d.w * s; ty += d.h * s; } else if(rot === 3) ty += d.h * s;
      img.style.transform = "translate(" + tx + "px," + ty + "px) rotate(" + r + "deg) scale(" + s + ")"; }
    function fit(){ var d = dims(); base = Math.max(bw / d.w, bh / d.h); z = 1; rng.value = 1; x = (bw - d.w * base) / 2; y = (bh - d.h * base) / 2; draw(); }
    function zoomTo(nz, cx, cy){ nz = Math.max(1, Math.min(4, nz)); var s0 = base * z, s1 = base * nz; x = cx - (cx - x) * s1 / s0; y = cy - (cy - y) * s1 / s0; z = nz; rng.value = nz; draw(); }
    img.onload = function(){ iw = img.naturalWidth; ih = img.naturalHeight; fit(); }; img.src = url;
    rng.oninput = function(){ zoomTo(+rng.value, bw / 2, bh / 2); };
    var pts = {}, last = null;
    box.addEventListener("pointerdown", function(e){ box.setPointerCapture(e.pointerId); pts[e.pointerId] = {x: e.clientX, y: e.clientY}; last = null; });
    box.addEventListener("pointermove", function(e){ if(!pts[e.pointerId]) return; var ids = Object.keys(pts), p0 = pts[e.pointerId];
      if(ids.length === 1){ x += e.clientX - p0.x; y += e.clientY - p0.y; draw(); }
      pts[e.pointerId] = {x: e.clientX, y: e.clientY};
      if(ids.length >= 2){ var a = pts[ids[0]], b = pts[ids[1]], dd = Math.hypot(a.x - b.x, a.y - b.y), r = box.getBoundingClientRect(), cx = (a.x + b.x) / 2 - r.left, cy = (a.y + b.y) / 2 - r.top; if(last) zoomTo(z * dd / last, cx, cy); last = dd; } });
    var up = function(e){ delete pts[e.pointerId]; last = null; }; box.addEventListener("pointerup", up); box.addEventListener("pointercancel", up);
    box.addEventListener("wheel", function(e){ e.preventDefault(); var r = box.getBoundingClientRect(); zoomTo(z * (e.deltaY < 0 ? 1.1 : .9), e.clientX - r.left, e.clientY - r.top); }, {passive: false});
    v.querySelectorAll("[data-k]").forEach(function(b){ b.onclick = function(){ var k = b.getAttribute("data-k");
      if(k === "rot"){ rot = (rot + 1) % 4; fit(); return; }
      if(k === "x"){ URL.revokeObjectURL(url); uiBack(); return; }
      if(!iw) return; var oh = Math.round(outW / aspect), c = document.createElement("canvas"); c.width = outW; c.height = oh; var g = c.getContext("2d"), k2 = outW / bw, s = base * z, d = dims();
      g.fillStyle = "#fff"; g.fillRect(0, 0, outW, oh); g.save(); g.scale(k2, k2); g.translate(x, y); g.scale(s, s);
      if(rot === 1){ g.translate(d.w, 0); g.rotate(Math.PI / 2); } else if(rot === 2){ g.translate(d.w, d.h); g.rotate(Math.PI); } else if(rot === 3){ g.translate(0, d.h); g.rotate(-Math.PI / 2); }
      g.drawImage(img, 0, 0, iw, ih); g.restore(); URL.revokeObjectURL(url); v.remove(); res(c); }; });
  });
}
function cropUpload(x, kind){ var cover = kind === "cover"; return cropper(x, cover ? 2.6 : 1, !cover, cover ? 1300 : 640).then(function(c){ toast("Uploading…"); return canvasBlob(c, .86); }).then(function(b){ return Promise.all([thumbOf(b, cover ? 640 : 200), putFile(b, kind + ".jpg", true)]); }); }
function pickPhoto(kind){ var f = $("ycPhF"); if(!f) return; f.onchange = function(){ var x = f.files[0]; f.value = ""; if(!x) return; if(!ME){ toast("Save your name first, then add a photo."); return; }
  cropUpload(x, kind).then(function(a){
    var u = kind === "cover" ? {cvt: a[0] ? a[0].u : "", cv: a[1].id} : {pt: a[0] ? a[0].u : "", ph: a[1].id};
    return FS.collection("people").doc(MY).set(u, {merge: true}).then(function(){ Object.assign(ME, u); PEOPLE[MY] = ME; $("ycW").removeAttribute("data-v"); paint(true); toast("Saved"); }); }).catch(function(e){ toast("Could not upload: " + (e.message || e)); }); }; f.click(); }
function saveMe(){
  var nm = $("ycNm").value.trim(), un = $("ycUn").value.trim().toLowerCase().replace(/^@/, ""), dp = $("ycDp").value.trim(), ab = $("ycAb").value.trim(), ut = ($("ycUt") || {value: ""}).value.trim(), er = $("ycErr");
  if(nm.length < 2){ er.textContent = "Please write your name."; return; }
  if(!/^[a-z0-9_]{3,20}$/.test(un)){ er.textContent = "Username: 3–20 letters, numbers or _ only."; return; }
  er.textContent = "Saving…"; var old = ME && ME.uname;
  var claim = un === old ? Promise.resolve() : FS.collection("unames").doc(un).get().then(function(d){ if(d.exists && d.data().uid !== MY) throw new Error("@" + un + " is taken. Try another."); return FS.collection("unames").doc(un).set({uid: MY}); });
  claim.then(function(){ return FS.collection("people").doc(MY).set({uid: MY, email: EMAIL, name: nm, uname: un, dept: dp, unit: ut, about: ab, at: now(), made: ME && ME.made || now()}, {merge: true}); })
    .then(function(){ if(old && old !== un) FS.collection("unames").doc(old).delete().catch(function(){}); var firstTime = !ME; ME = Object.assign(ME || {}, {uid: MY, email: EMAIL, name: nm, uname: un, dept: dp, unit: ut, about: ab, at: now()}); PEOPLE[MY] = ME; PARAM = {}; STACK = []; VIEW = "home"; if(firstTime) live(); paint(true); badge(); toast("Profile saved"); })
    .catch(function(e){ er.textContent = (e && e.message && /taken/.test(e.message)) ? e.message : "Could not save: " + (e && (e.code || e.message) || e); });
}


// ---------- photo card: see the picture first, then actions ----------
function photoCard(o){
  pushH(); var v = document.createElement("div"); v.className = "ycView ycCard";
  v.innerHTML = '<div class="ycCardT"><button data-k="x">' + IC.back + '</button><div><b>' + esc(o.title) + '</b><span>' + esc(o.sub || "") + '</span></div></div><div class="ycCardI">' + (o.pt || o.ph ? '<img src="' + (BU[o.ph] || o.pt || "") + '" alt="">' : avImg(o.title, o.key, 220, "")) + '</div><div class="ycCardA">' + (o.acts || []).map(function(a){ return '<button data-k="' + a[0] + '">' + a[1] + '<small>' + a[2] + '</small></button>'; }).join("") + '</div>';
  document.body.appendChild(v);
  if(o.ph && !BU[o.ph]) fileUrl(o.ph).then(function(u){ var im = v.querySelector(".ycCardI img"); if(im) im.src = u; }).catch(function(){});
  v.addEventListener("click", function(e){ var b = e.target.closest("[data-k]"); if(!b){ return; } var k = b.getAttribute("data-k"); v.remove(); if(k !== "x" && o.on) o.on(k); });
}
function personCard(u){
  var p = person(u) || {}, me = u === MY;
  photoCard({title: me ? (p.name || "You") : p.name || "Someone", sub: me ? "Your profile photo" : (p.about || "@" + (p.uname || "") + (p.dept ? " · " + p.dept : "")), pt: p.pt, ph: p.ph, key: u,
    acts: me ? [["edit", IC.cam, p.pt ? "Change photo" : "Add photo"], ["prof", "✎", "Edit profile"]].concat(p.pt ? [["rm", IC.trash, "Remove"]] : []) : [["msg", IC.chat, "Message"], ["call", IC.call, "Voice"], ["vid", IC.video, "Video"], ["info", "ⓘ", "Info"]],
    on: function(k){
      if(k === "edit"){ if(VIEW !== "profile"){ go("profile", {}); } setTimeout(function(){ pickPhoto("photo"); }, 0); }
      else if(k === "prof"){ if(VIEW !== "profile") go("profile", {}); }
      else if(k === "rm"){ ask("", {title: "Remove your profile photo?", ok: "Remove", danger: 1}).then(function(y){ if(y) FS.collection("people").doc(MY).set({pt: "", ph: ""}, {merge: true}).then(function(){ ME.pt = ""; ME.ph = ""; $("ycW").removeAttribute("data-v"); paint(true); }).catch(function(){}); }); }
      else if(k === "msg") openDm(u); else if(k === "call") openDmThenCall(u, false); else if(k === "vid") openDmThenCall(u, true);
      else if(k === "info"){ var id = dmId(MY, u); if(CHATS[id]){ if(OPEN !== id || VIEW !== "chat") openChat(id); go("info", {}); } else openDm(u); }
    }});
}
function coverCard(){ var me = ME || {}; photoCard({title: "Cover photo", sub: me.name || "", pt: me.cvt, ph: me.cv, key: MY, acts: [["edit", IC.cam, me.cvt ? "Change cover" : "Add cover"]].concat(me.cvt ? [["rm", IC.trash, "Remove"]] : []), on: function(k){ if(k === "edit") pickPhoto("cover"); else if(k === "rm") ask("", {title: "Remove cover photo?", ok: "Remove", danger: 1}).then(function(y){ if(y) FS.collection("people").doc(MY).set({cvt: "", cv: ""}, {merge: true}).then(function(){ ME.cvt = ""; ME.cv = ""; $("ycW").removeAttribute("data-v"); paint(true); }).catch(function(){}); }); } }); }
function groupCard(){ var c = CHATS[OPEN]; if(!c) return; var adm = (c.admins || []).indexOf(MY) >= 0; photoCard({title: c.title || "Group", sub: (c.members || []).length + " members", pt: c.pt, ph: c.ph, key: c.id, acts: adm ? [["edit", IC.cam, c.pt ? "Change photo" : "Add photo"]] : [], on: function(k){ if(k === "edit") groupPhoto("photo"); } }); }
// ---------- contact / group info ----------
function infoView(w){
  var c = CHATS[OPEN]; if(!c){ VIEW = "home"; return homeView(w); }
  var g = c.type === "group", oth = chatOther(c), p = person(oth) || {}, t = chatTitle(c), adm = (c.admins || []).indexOf(MY) >= 0;
  var cov = g ? "" : p.cvt;
  var h = bar(BACKB(), '<b>' + (g ? "Group info" : "Contact info") + '</b>', "") + '<div class="ycScroll">';
  h += '<div class="ycCover sm" style="' + (cov ? "background-image:url(" + cov + ")" : "") + '"' + (g && adm ? ' data-c="gcover"' : '') + '></div><div class="ycProf"><div class="ycProfAv" data-c="' + (g ? "gcard" : "pcard") + '" data-u="' + oth + '">' + (g ? avImg(t, c.id, 110, c.pt) : avU(oth, 110, true)) + (g && adm ? '<span class="ycCamB">' + IC.cam + '</span>' : '') + '</div><h2>' + (g ? esc(t) : nmT(oth, t)) + '</h2>' +
    (g ? '<span>Group · ' + (c.members || []).length + ' members</span>' + (c.desc ? '<p>' + esc(c.desc) + '</p>' : '') : '<span>@' + esc(p.uname || "") + (p.dept ? " · " + esc(p.dept) : "") + '</span>' + (p.about ? '<p>' + esc(p.about) + '</p>' : '') + '<span>' + esc(p.email || "") + '</span><span class="ycSoft">' + esc(lastSeen(p)) + '</span>') +
    '<div class="ycActs">' + (oth !== MY || g ? '<button data-c="call">' + IC.call + '<span>' + (g ? "Meet" : "Voice") + '</span></button><button data-c="vcall">' + IC.video + '<span>Video</span></button>' : '') + '<button data-c="back">' + IC.chat + '<span>Message</span></button><button data-c="ifind">' + IC.search + '<span>Search</span></button></div></div>';
  var media = MSGS.filter(function(m){ return m.k === "img" && !m.del; }).slice(-30).reverse(), files = MSGS.filter(function(m){ return m.k === "file" && !m.del; }).slice(-10).reverse();
  h += '<div class="ycSec">Media and files</div>' + (media.length ? '<div class="ycGrid">' + media.map(function(m){ return '<span data-c="view" data-f="' + m.f.id + '"><img src="' + (BU[m.f.id] || m.th || "") + '"></span>'; }).join("") + '</div>' : '') +
    files.map(function(m){ return '<button class="ycRow" data-c="dl" data-f="' + m.f.id + '" data-n="' + esc(m.f.name) + '"><span class="ycFic" style="background:' + fileCol(m.f.name) + '">' + esc(ext(m.f.name)) + '</span><div class="ycRm"><div class="ycR1"><b>' + esc(m.f.name) + '</b><time>' + shortT(m.at) + '</time></div><div class="ycR2"><span>' + fmtSize(m.f.size) + '</span></div></div></button>'; }).join("") + (!media.length && !files.length ? '<div class="ycEmpty sm"><span>No media yet.</span></div>' : '');
  if(g){ h += '<div class="ycSec">' + (c.members || []).length + ' members</div>' + (adm ? '<button class="ycRow" data-c="addm"><span class="ycAv" style="width:46px;height:46px;background:#3d9a1f">' + IC.plus + '</span><div class="ycRm"><div class="ycR1"><b>Add members</b></div></div></button>' : '') +
    (c.members || []).map(function(u){ var pp = person(u) || {}; var isA = (c.admins || []).indexOf(u) >= 0; return '<button class="ycRow" data-c="' + (u === MY ? "noop" : "mem") + '" data-u="' + u + '">' + avU(u, 46, true) + '<div class="ycRm"><div class="ycR1"><b>' + nmT(u, u === MY ? "You" : pp.name || "Someone") + '</b><time>' + (isA ? '<em class="adm">Group admin</em>' : '') + '</time></div><div class="ycR2"><span>' + esc(pp.about || "@" + (pp.uname || "")) + '</span></div></div></button>'; }).join("") +
    '<button class="ycRow red" data-c="leave"><span class="ycSi">' + IL.exit + '</span><div class="ycRm"><div class="ycR1"><b>Exit group</b></div></div></button>'; }
  else h += (oth !== MY ? '<button class="ycRow red" data-c="iblock" data-u="' + oth + '"><span class="ycSi">' + IL.block + '</span><div class="ycRm"><div class="ycR1"><b>' + (iBlocked(oth) ? "Unblock " : "Block ") + esc(fullName(oth)) + '</b></div></div></button>' : '') + '<button class="ycRow red" data-c="cdel2"><span class="ycSi">' + IL.trash + '</span><div class="ycRm"><div class="ycR1"><b>Delete chat</b></div></div></button>';
  w.innerHTML = h + '</div><input type="file" id="ycPhF" accept="image/*" hidden>'; bind(w);
}
function memberMenu(u){ var c = CHATS[OPEN], adm = (c.admins || []).indexOf(MY) >= 0, isA = (c.admins || []).indexOf(u) >= 0;
  var acts = [["msg", IC.chat, "Message " + first(u)], ["vc", IC.call, "Voice call"]]; if(adm){ acts.push(["adm", "★", isA ? "Remove as admin" : "Make group admin"]); acts.push(["rm", IC.trash, "Remove from group"]); }
  sheet('<div class="ycShT">' + esc(fullName(u)) + '</div>' + acts.map(function(a){ return '<button class="ycAct' + (a[0] === "rm" ? " red" : "") + '" data-a="' + a[0] + '"><span>' + a[1] + '</span>' + a[2] + '</button>'; }).join(""), function(a){
    if(a === "msg") return openDm(u); if(a === "vc"){ return openDmThenCall(u, false); }
    var ref = FS.collection("chats").doc(OPEN); if(a === "adm") ref.update({admins: isA ? FV.arrayRemove(u) : FV.arrayUnion(u)}).catch(function(e){ toast(e.code || e.message); });
    if(a === "rm") ask("", {title: "Remove " + fullName(u) + " from the group?", ok: "Remove", danger: 1}).then(function(y){ if(y) ref.update({members: FV.arrayRemove(u), admins: FV.arrayRemove(u)}).then(function(){ return ref.collection("m").add({k: "sys", t: first(MY) + " removed " + first(u), by: MY, at: now()}); }).catch(function(e){ toast(e.code || e.message); }); }); }); }
function groupPhoto(kind){ var f = $("ycPhF"); f.onchange = function(){ var x = f.files[0]; f.value = ""; if(!x) return;
  cropUpload(x, "photo").then(function(a){
    var u = {pt: a[0] ? a[0].u : "", ph: a[1].id}; if(VIEW === "newgroup"){ PARAM.pt = u.pt; PARAM.ph = u.ph; $("ycW").removeAttribute("data-v"); return paint(true); }
    return FS.collection("chats").doc(OPEN).update(u); }).catch(function(e){ toast(e.message || e); }); }; f.click(); }
function leaveGroup(){ var id = OPEN; ask("", {title: "Exit this group?", ok: "Exit", danger: 1}).then(function(y){ if(y) leaveGroup2(id); }); }
function leaveGroup2(id){ try{ var jx = {}; jx["join." + id] = FV.delete(); FS.collection("people").doc(MY).update(jx); var ox = {}; ox["out." + MY] = now(); FS.collection("chats").doc(id).update(ox); }catch(e){} FS.collection("chats").doc(id).collection("m").add({k: "sys", t: first(MY) + " left", by: MY, at: now()}).then(function(){ return FS.collection("chats").doc(id).update({members: FV.arrayRemove(MY), admins: FV.arrayRemove(MY)}); }).then(function(){ OPEN = null; STACK = []; VIEW = "home"; stopMsgs(); paint(true); }).catch(function(e){ toast(e.code || e.message); }); }
function archivedView(w){ var list = visibleChats(true); w.innerHTML = bar(BACKB(), '<b>Archived</b>', list.length + " chats") + '<div class="ycScroll">' + (list.map(chatRow).join("") || '<div class="ycEmpty"><span>No archived chats. Long-press a chat → Archive.</span></div>') + '</div>'; bind(w); }
var STARS = null;
function starredView(w){ w.innerHTML = bar(BACKB(), '<b>Starred messages</b>', "") + '<div class="ycScroll" id="ycStars"><div class="ycEmpty sm"><span>Loading…</span></div></div>'; bind(w);
  FS.collection("people").doc(MY).collection("star").get().then(function(q){ var a = q.docs.map(function(d){ return d.data(); }).sort(function(x, y){ return y.sat - x.sat; }); var el = $("ycStars"); if(!el) return;
    el.innerHTML = a.map(function(s){ var c = CHATS[s.cid]; return '<button class="ycRow" data-c="open" data-id="' + s.cid + '">' + avU(s.by, 40) + '<div class="ycRm"><div class="ycR1"><b>' + esc(fullName(s.by)) + (c ? ' <small>▸ ' + esc(chatTitle(c)) + '</small>' : '') + '</b><time>' + shortT(s.at) + '</time></div><div class="ycR2"><span>' + esc(s.t) + '</span>' + (s.th ? '<img class="ycStTh" src="' + s.th + '">' : '') + '</div></div></button>'; }).join("") || '<div class="ycEmpty"><span>Long-press a message and tap ⭐ Star to keep it here.</span></div>'; bind(el); }).catch(function(){}); }

// ---------- meetings ----------
function meetNewView(w){
  var d = new Date(now() + 30 * 60000); d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
  var dt = PARAM.dt || (d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + "T" + pad(d.getHours()) + ":" + pad(d.getMinutes()));
  var sel = PARAM.sel || (PARAM.sel = {}); if(PARAM.cid && CHATS[PARAM.cid] && !PARAM.init){ PARAM.init = 1; (CHATS[PARAM.cid].members || []).forEach(function(u){ if(u !== MY) sel["u:" + u] = 1; }); }
  var n = Object.keys(sel).length;
  w.innerHTML = bar(BACKB(), '<b>New meeting</b>', "") + '<div class="ycScroll"><div class="ycForm"><label>Title</label><input id="ycMt" maxlength="60" placeholder="e.g. Daily QA meeting, Bedsure final audit" value="' + esc(PARAM.title || "") + '"><label>Date & time</label><input id="ycMd" type="datetime-local" value="' + dt + '"><label>Length</label><select id="ycMl">' + [15, 30, 45, 60, 90, 120].map(function(m){ return '<option value="' + m + '"' + ((PARAM.dur || 30) == m ? " selected" : "") + '>' + m + ' minutes</option>'; }).join("") + '</select>' +
    '<label>Agenda <small>(one point per line)</small></label><textarea id="ycMa" rows="4" placeholder="e.g.&#10;Bedsure final audit result&#10;Shade variation in lot 42&#10;Next week shipment plan">' + esc(PARAM.agenda || "") + '</textarea>' +
    '<label class="ycChk"><input type="checkbox" id="ycMv"' + (PARAM.video ? " checked" : "") + '> Video meeting (camera on)</label><div class="ycSec" style="padding-left:0">People (' + n + ')</div><div class="ycMemb">' + Object.keys(sel).map(function(k){ var u = k.slice(2); return '<span>' + avU(u, 40) + '<small>' + esc(first(u)) + '</small></span>'; }).join("") + '<span data-c="meetppl" class="ycAddP">' + IC.plus + '<small>Add</small></span></div></div></div>' +
    '<div class="ycFoot two"><button class="ycPb ghost" data-c="meetstart"' + (n ? "" : " disabled") + '>Start now</button><button class="ycPb" data-c="meetsave"' + (n ? "" : " disabled") + '>Schedule</button></div>';
  bind(w); ["Mt:title", "Md:dt", "Ml:dur", "Ma:agenda"].forEach(function(k){ var a = k.split(":"), el = $("yc" + a[0]); el.oninput = el.onchange = function(){ PARAM[a[1]] = el.value; }; }); $("ycMv").onchange = function(){ PARAM.video = this.checked; };
}
function meetSave(){
  var title = ($("ycMt").value || "").trim() || "Meeting", at = new Date($("ycMd").value).getTime(), dur = +$("ycMl").value || 30, mem = [MY].concat(Object.keys(PARAM.sel || {}).map(function(k){ return k.slice(2); }));
  if(!at || isNaN(at)) return toast("Pick a date and time");
  var ref = FS.collection("meets").doc(), doc = {title: title, at: at, dur: dur, members: mem, by: MY, video: !!PARAM.video, made: now(), agenda: agendaOf($("ycMa").value)};
  ref.set(doc).then(function(){ var cid = PARAM.cid; var post2 = function(id){ var keep = OPEN; OPEN = id; var p = post({k: "meet", t: title, mid: ref.id, mat: at}, "📅 " + title + " · " + dayLbl(at) + " " + hm(at)); OPEN = keep; return p; };
    if(cid && CHATS[cid]) post2(cid); else if(mem.length === 2){ var u = mem[1], id = dmId(MY, u); (CHATS[id] ? Promise.resolve() : FS.collection("chats").doc(id).set({type: "dm", members: [MY, u].sort(), at: now(), made: now(), by: MY, n: {}, rd: {}}, {merge: true}).then(function(){ CHATS[id] = CHATS[id] || {id: id, type: "dm", members: [MY, u].sort(), n: {}, rd: {}}; })).then(function(){ post2(id); }); }
    toast("Meeting scheduled"); STACK = []; VIEW = "home"; TAB = "calls"; paint(true); }).catch(function(e){ toast("Could not save: " + (e.code || e.message)); });
}
function meetJoin(id){ var m = MEETS[id]; if(!m){ return toast("Meeting not found"); }
  if(m.call){ FS.collection("calls").doc(m.call).get().then(function(d){ if(d.exists && !d.data().ended){ joinCall({id: m.call, cid: d.data().cid}); } else startMeetCall(m); }).catch(function(){ startMeetCall(m); }); }
  else startMeetCall(m); }
function startMeetCall(m){ startCall({members: m.members, group: true, title: m.title, cid: "meet_" + m.id, video: !!m.video, meet: m.id}); }
function startAdhocMeeting(mem, video){ adhocMeet(mem, "Meeting · " + fullName(MY).split(" ")[0], !!video, []); }
function agendaOf(t){ return String(t || "").split(/\n+/).map(function(x){ return x.replace(/^\s*[-•*\d.)]+\s*/, "").trim(); }).filter(Boolean).slice(0, 20); }
function adhocMeet(mem, title, video, agenda){ mem = [MY].concat(mem).filter(function(u, i, a){ return a.indexOf(u) === i; });
  var ref = FS.collection("meets").doc(), doc = {title: title, at: now(), dur: 60, members: mem, by: MY, video: !!video, made: now(), agenda: agenda || [], adhoc: 1};
  ref.set(doc).catch(function(){}); doc.id = ref.id; MEETS[ref.id] = doc; startCall({members: mem, group: true, title: title, cid: "meet_" + ref.id, video: !!video, meet: ref.id}); }
var REMIND = {}; function meetReminders(){ Object.keys(MEETS).forEach(function(k){ var m = MEETS[k], dt = m.at - now(); if(dt < 5 * 60000 && dt > -60000 && !REMIND[k]){ REMIND[k] = 1; msgSound(); var e = document.createElement("div"); e.className = "ycPop"; e.innerHTML = '<span class="ycAv ycCalIc" style="width:40px;height:40px">' + IL.cal + '</span><div><b>' + esc(m.title) + '</b><span>Starts at ' + hm(m.at) + ' — tap to join</span></div>'; e.onclick = function(){ e.remove(); meetJoin(k); }; document.body.appendChild(e); setTimeout(function(){ e.classList.add("on"); }, 10); setTimeout(function(){ e.classList.remove("on"); setTimeout(function(){ e.remove(); }, 400); }, 12000); } }); }

// ---------- open groups: QA Alerts, YQI Team, one per customer (join on request, added by any member) ----------
var GROUPS0 = [["grp_qa_alerts", "QA Alerts", "Inspection fail alerts and urgent quality issues", 1], ["grp_team", "YQI Team", "Everyone using YQI", 1]];
function gslug(n){ return "grp_c_" + String(n).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 40); }
function wantJoin(gid){ var j = {}; j["join." + gid] = now(); return FS.collection("people").doc(MY).update(j).then(function(){ ME.join = ME.join || {}; ME.join[gid] = now(); }).catch(function(){}); }
function ensureGroup(gid, name, desc, cu){ var ref = FS.collection("chats").doc(gid), t = now();
  if(CHATS[gid]) return Promise.resolve(true);
  var doc = {type: "group", open: 1, title: name, desc: desc || "", members: [MY], admins: [MY], at: t, made: t, by: MY, n: {}, rd: {}, last: {t: name + " group is ready", by: MY, at: t, k: "sys"}}; if(cu) doc.cu = cu;
  return ref.set(doc).then(function(){ return true; }).catch(function(){ return wantJoin(gid).then(function(){ return false; }); }); }
function autoGroups(){ if(!ME) return; if(!window.YQLV){ window.__yqAG = 0; return; } if(!amStaff() || custOf(MY)) return; GROUPS0.forEach(function(g){ if(!CHATS[g[0]] && !(ME.join && ME.join[g[0]])){ wantJoin(g[0]); setTimeout(function(){ if(!CHATS[g[0]]) ensureGroup(g[0], g[1], g[2]); }, 4000 + Math.random() * 3000); } }); }
function autoAdd(){ Object.keys(CHATS).forEach(function(gid){ var c = CHATS[gid]; if(!c.open || c.type !== "group") return; var add = Object.keys(PEOPLE).filter(function(u){ var p = PEOPLE[u]; return p && p.join && p.join[gid] && (c.members || []).indexOf(u) < 0 && !(c.out && c.out[u] && c.out[u] > p.join[gid]); });
  if(add.length) FS.collection("chats").doc(gid).update({members: FV.arrayUnion.apply(null, add)}).catch(function(){}); }); }
setInterval(function(){ if(MY && ME){ if(!window.__yqAG){ window.__yqAG = 1; autoGroups(); } autoAdd(); } }, 10000);
function custGroupsHtml(){ var cs = (window.YQCUST || []).slice(0, 60); if(!cs.length || !amStaff() || custOf(MY)) return "";
  return '<div class="ycSec">Customer groups</div>' + cs.map(function(n){ var gid = gslug(n), mem = !!CHATS[gid], req = ME && ME.join && ME.join[gid];
    return '<div class="ycRow"><span class="ycAv ycCalIc" style="width:44px;height:44px">' + IL.users + '</span><div class="ycRm"><div class="ycR1"><b>' + esc(n) + '</b></div><div class="ycR2"><span>' + (mem ? "You are in this group" : req ? "Request sent — a member will add you" : "Chat and files for " + esc(n)) + '</span></div></div>' + (mem ? '<button class="ycMk" data-c="open" data-id="' + gid + '">Open</button>' : req ? '' : '<button class="ycMk" data-c="cjoin" data-n="' + esc(n) + '">Join</button>') + '</div>'; }).join(""); }
function custJoin(n){ var gid = gslug(n); wantJoin(gid).then(function(){ return ensureGroup(gid, n, "Quality chat for " + n, n); }).then(function(made){ toast(made ? n + " group created" : "Request sent"); paint(true); }); }
// ---------- #INTERNAL / #EXTERNAL messages in the inspection groups → Inspection Summary (live) ----------
var FEEDG = {grp_insp_int: "int", grp_insp_ext: "ext"}, FEEDU = {}, FEEDNO = false;
function fdHash(t){ var h = 0; t = String(t || ""); for(var i = 0; i < t.length; i++){ h = (h * 31 + t.charCodeAt(i)) | 0; } return h; }
function fdKind(t){ var m = /^\s*#\s*(INTERNAL|EXTERNAL)\b/i.exec(String(t || "")); return m ? (m[1].toUpperCase() === "INTERNAL" ? "int" : "ext") : ""; }
function fdNum(v){ var n = parseFloat(String(v || "").replace(/,/g, "")); return isFinite(n) ? n : 0; }
function fdDate(v){ v = String(v || "").trim(); if(/^today$/i.test(v)){ var d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  var m = /^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{2,4})$/.exec(v); if(m){ var y = +m[3]; if(y < 100) y += 2000; if(+m[2] > 12 || +m[1] > 31) return ""; return y + "-" + pad(+m[2]) + "-" + pad(+m[1]); }
  m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(v); return m ? m[1] + "-" + pad(+m[2]) + "-" + pad(+m[3]) : ""; }
function fdRes(v, kind){ v = String(v || "").trim().toLowerCase().replace(/[^a-z]/g, ""); var M = {pass: "Pass", passed: "Pass", ok: "Pass", fail: "Fail", failed: "Fail", abort: "Abort", aborted: "Abort", inprocess: "In process", inprogress: "In process", pending: "Pending"}; var r = M[v] || ""; if(r === "In process" && kind === "ext") r = "Pending"; if(r === "Pending" && kind === "int") r = "In process"; return r; }
function fdDefects(v){ var L = []; String(v || "").split(/[,;\n]+/).forEach(function(p){ p = p.trim(); if(!p || /^(nil|none|no|-|0)$/i.test(p)) return; var m = /^(.*?)[\s:x×-]*(\d+)\s*(pcs)?$/i.exec(p), n = m && m[1].trim() ? m[1].trim() : p, q = m && m[1].trim() ? +m[2] : 1; var c = /sew|stitch|seam|pleat|skip|broken/i.test(n) ? "Sewing" : /pack|label|carton|poly|sticker/i.test(n) ? "Packaging" : /fabric|hole|slub|shade|weav/i.test(n) ? "Fabric" : /measure|size/i.test(n) ? "Measurement" : /stain|spot|dirt|oil/i.test(n) ? "Stain" : "Other"; var ex = L.filter(function(x){ return x.n.toLowerCase() === n.toLowerCase(); })[0]; if(ex) ex.q += q; else L.push({n: n, q: q, c: c}); }); return L; }
var FDORD = {G: "GROUND", GROUND: "GROUND", "1": "FIRST", "1ST": "FIRST", FIRST: "FIRST", "2": "SECOND", "2ND": "SECOND", SECOND: "SECOND", "3": "THIRD", "3RD": "THIRD", THIRD: "THIRD", "4": "FOURTH", "4TH": "FOURTH", FOURTH: "FOURTH", "5": "FIFTH", "5TH": "FIFTH", FIFTH: "FIFTH"};
function fdFloor(v){ var u = String(v || "").toUpperCase().replace(/FLOOR|FLR|UNIT/g, " ").replace(/[^A-Z0-9 ]/g, " ").replace(/\s+/g, " ").trim(); var known = (window.yqFloors && window.yqFloors()) || [];
  var cmp = function(x){ return String(x).toUpperCase().replace(/[^A-Z0-9]/g, ""); }, k0 = known.filter(function(x){ return cmp(x) === cmp(v) || cmp(x) === cmp(v + " FLOOR"); })[0]; if(k0) return k0;
  var m = /^(?:YTM\s*)?(\d+)\s*([A-Z])?\s*(GROUND|G|FIRST|SECOND|THIRD|FOURTH|FIFTH|\d(?:ST|ND|RD|TH)?)$/.exec(u); if(!m) return "";
  var key = m[1] + "|" + (m[2] || "") + "|" + FDORD[m[3]], nm = "YTM-" + m[1] + (m[2] ? " " + m[2] : "") + " " + FDORD[m[3]] + " FLOOR";
  var k1 = known.filter(function(x){ var y = String(x).toUpperCase().replace(/FLOOR|FLR/g, " ").replace(/[^A-Z0-9 ]/g, " ").replace(/\s+/g, " ").trim(), q = /^(?:YTM\s*)?(\d+)\s*([A-Z])?\s*(GROUND|G|FIRST|SECOND|THIRD|FOURTH|FIFTH|\d(?:ST|ND|RD|TH)?)$/.exec(y); return q && q[1] + "|" + (q[2] || "") + "|" + FDORD[q[3]] === key; });
  k1.sort(function(a, b){ return /FLOOR/.test(b) - /FLOOR/.test(a); }); return k1[0] || nm; }
function fdParse(t){ var kind = fdKind(t), F = {}; String(t || "").split(/\n/).slice(1).forEach(function(l){ var m = /^\s*([A-Za-z .\/]+?)\s*[:=]\s*(.*)$/.exec(l); if(m) F[m[1].toLowerCase().replace(/[^a-z]/g, "")] = m[2].trim(); });
  var g = function(){ for(var i = 0; i < arguments.length; i++){ var v = F[arguments[i]]; if(v != null && v !== "") return v; } return ""; }, err = [];
  var date = fdDate(g("date")); if(!date) err.push("Date (write DD-MM-YYYY)");
  var ytm = g("ytm", "ytmno").toUpperCase().replace(/^YTM\s*[-#:]?\s*/, ""), ol = null; try{ var O = window.YQOL || {}; ol = O[ytm] || null; }catch(e){}
  var cust = g("customer", "buyer") || (ol && ol.cust) || ""; try{ if(cust && window.yqCanonC) cust = yqCanonC(cust); }catch(e){} if(!cust) err.push("Customer");
  var res = fdRes(g("result", "status"), kind), dl = fdDefects(g("defects", "defect", "defectlist"));
  var r = {date: date, customer: cust, result: res, count: 1, src: "chat", at: new Date().toISOString(), dlist: dl, defects: dl.map(function(d){ return d.n + " " + d.q; }).join(", ")};
  if(ytm) r.ytm = ytm; var insp = g("inspector", "inspectedby", "qc"); if(insp) r.inspector = insp;
  if(kind === "int"){
    var fl = fdFloor(g("unit", "floor", "line")); if(!fl) err.push("Unit (write like YTM-3 FIRST FLOOR)"); r.floor = fl;
    r.product = g("article", "product", "item") || (ol && (ol.art || ol.prog)) || ""; r.qty = fdNum(g("offerqty", "offerquantity", "qty", "quantity")); r.sample = fdNum(g("sample", "samplesize")); r.allowed = fdNum(g("allowed", "alloweddefects")); r.found = fdNum(g("found", "founddefects")); r.major = r.found; r.minor = 0; r.critical = 0; r.inspection = g("inspection", "type") || "PARTIAL FRI";
    var pk = fdRes(g("packaging", "packing"), kind), wk = fdRes(g("workmanship"), kind); if(pk) r.packaging = pk; if(wk) r.workmanship = wk;
    if(!res && (pk || wk)) r.result = pk === "Fail" || wk === "Fail" ? "Fail" : "Pass";
    if(r.result === "Pass" && (pk === "Fail" || wk === "Fail")) err.push("Result says Pass but Packaging / Workmanship is Fail");
  } else {
    r.po = g("po", "pono"); r.article = g("article", "articles", "product", "item") || (ol && (ol.art || ol.prog)) || ""; r.unit = g("unit", "inspectiongoodsunit"); r.qty = fdNum(g("qty", "totalquantity", "quantity", "orderqty")); r.sample = fdNum(g("sample", "samplesize"));
    var mj = /^\s*([\d.]+)(?:\s*\/\s*([\d.]+))?/.exec(g("major")), mn = /^\s*([\d.]+)(?:\s*\/\s*([\d.]+))?/.exec(g("minor")), cr = /^\s*([\d.]+)/.exec(g("critical"));
    r.major = mj ? +mj[1] : 0; r.minor = mn ? +mn[1] : 0; r.critical = cr ? +cr[1] : 0; if(mj && mj[2]) r.majAllow = +mj[2]; if(mn && mn[2]) r.minAllow = +mn[2];
    if(!r.sample) err.push("Sample"); r.oql = r.sample ? r.major / r.sample : 0;
  }
  if(!r.result) err.push("Result (Pass / Fail / Abort / " + (kind === "int" ? "In process" : "Pending") + ")");
  return {kind: kind, rec: r, err: err}; }
function fdCol(kind){ return FS.collection("ws").doc("_all").collection(kind === "int" ? "is_int" : "is_ext"); }
function fdProc(gid, d){ var m = d.data() || {}, mid = d.id, kind = fdKind(m.t), f = m.fed || {}, id = "chat_" + gid.slice(-3) + "_" + mid;
  if(m.del){ if(f.ok && !f.gone){ fdCol(f.k || FEEDG[gid]).doc(f.id || id).delete().then(function(){ return d.ref.update({"fed.gone": 1}); }).catch(function(){}); } return; }
  if(!kind || FEEDNO) return; var h = fdHash(m.t); if(f.h === h) return;
  var P = fdParse(m.t); if(P.kind !== FEEDG[gid]) P.err.unshift("Send #" + (FEEDG[gid] === "int" ? "INTERNAL" : "EXTERNAL") + " in this group");
  if(P.err.length){ d.ref.update({fed: {ok: 0, h: h, at: now(), err: P.err.slice(0, 4)}}).catch(function(){}); if(f.ok) fdCol(f.k).doc(f.id).delete().catch(function(){}); return; }
  var r = P.rec; r.chat = {gid: gid, mid: mid, by: m.by || "", name: fullName(m.by)}; r.by = EMAIL;
  var ph = MSGS.length ? null : null; if(m.k === "img" && m.f && m.f.id) r.photo = m.f.id;
  fdCol(P.kind).doc(id).set(r).then(function(){ return d.ref.update({fed: {ok: 1, h: h, at: now(), id: id, k: P.kind, s: r.customer + " · " + r.result + (P.kind === "ext" && r.sample ? " · OQL " + (r.oql * 100).toFixed(1) + "%" : "") + (r.floor ? " · " + r.floor : "")}}); })
    .then(function(){ try{ window.yqDataPing && yqDataPing(P.kind === "int" ? "is_int" : "is_ext", (P.kind === "int" ? "an internal" : "an external") + " inspection from chat", ""); }catch(e){} })
    .catch(function(e){ if(e && e.code === "permission-denied") FEEDNO = true; }); }
function feedWatch(){ if(!MY || !FS || window.__RO !== false) return; Object.keys(FEEDG).forEach(function(gid){ if(FEEDU[gid] || !CHATS[gid]) return;
  FEEDU[gid] = FS.collection("chats").doc(gid).collection("m").orderBy("at", "desc").limit(40).onSnapshot(function(q){ q.docChanges().forEach(function(ch){ if(ch.type !== "removed") fdProc(gid, ch.doc); }); }, function(){ FEEDU[gid] = null; }); }); }
setInterval(feedWatch, 8000);
// inspection fail → message in QA Alerts (fixed id: posted once even if many phones see it)
function qaAlert(rid, text){ var gid = "grp_qa_alerts", c = CHATS[gid]; if(!c) return; var id = "al_" + String(rid).replace(/[^A-Za-z0-9_-]/g, "").slice(0, 60), t = now();
  var ref = FS.collection("chats").doc(gid).collection("m").doc(id);
  ref.get().then(function(d){ if(d.exists) return; return ref.set({k: "text", t: text, by: MY, at: t, alert: 1}).then(function(){ return FS.collection("chats").doc(gid).update({last: {t: text, by: MY, at: t, k: "text"}, at: t}); }); }).catch(function(){}); }
// ---------- search inside all messages and files kept on this phone ----------
function msgSearch(q){ var out = []; Object.keys(CHATS).forEach(function(cid){ var L = lsJ("yqc_m_" + cid, []); L.forEach(function(m){ if(m.del || m.k === "sys") return; var hay = [m.t, m.fn, m.f && m.f.n, m.name, (m.tg || []).join(" ")].filter(Boolean).join(" ").toLowerCase(); if(hay.indexOf(q) >= 0) out.push({c: cid, m: m}); }); });
  out.sort(function(a, b){ return b.m.at - a.m.at; }); return out.slice(0, 40); }
function msgHitRow(h){ var c = CHATS[h.c], m = h.m, kind = m.k === "img" ? "📷 " : m.k === "file" ? "📄 " : m.k === "voice" ? "🎤 " : "";
  return '<button class="ycRow" data-c="openmsg" data-id="' + h.c + '" data-m="' + m.id + '">' + avC(c, 44) + '<div class="ycRm"><div class="ycR1"><b>' + esc(chatTitle(c)) + '</b><time>' + esc(shortT(m.at)) + '</time></div><div class="ycR2"><span>' + (m.by === MY ? "You: " : "") + kind + esc(preview(m)).slice(0, 90) + ((m.tg || []).length ? ' <i class="ycTg">' + esc(m.tg.join(" · ")) + '</i>' : '') + '</span></div></div></button>'; }

// ---------- tasks: decisions from meetings and chats, with due-time reminders ----------
var TASKS = {};
function taskList(){ return Object.keys(TASKS).map(function(k){ return TASKS[k]; }); }
function dueTxt(t){ if(!t.due) return "no due date"; var d = t.due - now(), lbl = dayLbl(t.due) + " " + hm(t.due); return (d < 0 && !t.done ? "overdue · " : "due ") + lbl; }
function taskRow(t){ var mine = t.who === MY, od = t.due && t.due < now() && !t.done;
  return '<div class="ycRow ycTask' + (t.done ? " done" : "") + '" data-c="taskopen" data-id="' + t.id + '"><button class="ycTk' + (t.done ? " on" : "") + '" data-c="tdone" data-id="' + t.id + '" title="Mark done">' + (t.done ? IL.check : "") + '</button><div class="ycRm"><div class="ycR1"><b>' + esc(t.t) + '</b></div><div class="ycR2"><span class="' + (od ? "od" : "") + '">' + (mine ? (t.by === MY ? "My task" : "from " + esc(first(t.by))) : "to " + esc(first(t.who))) + ' · ' + esc(dueTxt(t)) + (t.mid && MEETS[t.mid] ? ' · ' + esc(MEETS[t.mid].title) : '') + '</span></div></div></div>'; }
function tasksList(){ var L = taskList(), q = (SEARCHQ || "").toLowerCase(); if(q) L = L.filter(function(t){ return (t.t + " " + (t.note || "")).toLowerCase().indexOf(q) >= 0; });
  var by = function(a, b){ return (a.due || 9e15) - (b.due || 9e15); };
  var my = L.filter(function(t){ return t.who === MY && !t.done; }).sort(by), gv = L.filter(function(t){ return t.by === MY && t.who !== MY && !t.done; }).sort(by), dn = L.filter(function(t){ return t.done; }).sort(function(a, b){ return (b.doneAt || 0) - (a.doneAt || 0); }).slice(0, 25);
  if(!L.length) return '<div class="ycEmpty"><span>' + IL.check + '</span><b>No tasks yet</b><span>Add a task with the + button, or turn a meeting point into a task from its minutes.</span></div>';
  return (my.length ? '<div class="ycSec">My tasks (' + my.length + ')</div>' + my.map(taskRow).join("") : '') + (gv.length ? '<div class="ycSec">Given by me (' + gv.length + ')</div>' + gv.map(taskRow).join("") : '') + (dn.length ? '<div class="ycSec">Done</div>' + dn.map(taskRow).join("") : ''); }
function taskNewView(w){ var P = PARAM, ppl = Object.keys(PEOPLE).filter(function(u){ return PEOPLE[u].uname; }).sort(function(a, b){ return fullName(a).localeCompare(fullName(b)); });
  if(P.mid && MEETS[P.mid]) ppl = (MEETS[P.mid].members || []).slice();
  var t = P.id ? TASKS[P.id] : null, dv = function(ms){ var d = new Date(ms - new Date().getTimezoneOffset() * 60000); return d.toISOString().slice(0, 16); };
  var due = t && t.due ? dv(t.due) : dv(now() + 864e5);
  w.innerHTML = bar(BACKB(), '<b>' + (t ? "Edit task" : "New task") + '</b>', P.mid && MEETS[P.mid] ? esc(MEETS[P.mid].title) : "") + '<div class="ycScroll"><div class="ycForm">' +
    '<label>Task</label><textarea id="ycKt" rows="2" maxlength="300" placeholder="What needs to be done?">' + esc(t ? t.t : (P.t || "")) + '</textarea>' +
    '<label>Who will do it</label><select id="ycKw">' + ppl.map(function(u){ return '<option value="' + u + '"' + ((t ? t.who : (P.who || MY)) === u ? " selected" : "") + '>' + esc(u === MY ? fullName(u) + " (me)" : fullName(u)) + '</option>'; }).join("") + '</select>' +
    '<label>Due</label><input id="ycKd" type="datetime-local" value="' + due + '">' +
    '<label>Note <small>(optional)</small></label><textarea id="ycKn" rows="2" maxlength="600">' + esc(t ? t.note || "" : "") + '</textarea></div></div>' +
    '<div class="ycFoot">' + (t && (t.by === MY) ? '<button class="ycPb ghost" data-c="taskdel" data-id="' + t.id + '" style="flex:0 0 auto;color:#c8373d">Delete</button>' : '') + '<button class="ycPb" data-c="tasksave">' + (t ? "Save" : "Add task") + '</button></div>';
  bind(w); var f = $("ycKt"); if(f && !t) f.focus(); }
function taskSave(){ var t = ($("ycKt").value || "").trim(); if(!t) return toast("Write the task"); var who = $("ycKw").value, due = new Date($("ycKd").value).getTime() || 0, note = ($("ycKn").value || "").trim(), id = PARAM.id;
  var mem = [MY, who].filter(function(u, i, a){ return a.indexOf(u) === i; });
  var p = id ? FS.collection("meets").doc(id).update({t: t, who: who, due: due, note: note, members: FV.arrayUnion.apply(null, mem)}) : FS.collection("meets").add({kind: "task", t: t, who: who, by: MY, members: mem, due: due, note: note, done: false, made: now(), mid: PARAM.mid || ""});
  p.then(function(){ toast(id ? "Task saved" : (who === MY ? "Task added" : "Task sent to " + first(who))); navBack(); }).catch(function(e){ toast(e.code || e.message); }); }
function taskDone(id){ var t = TASKS[id]; if(!t) return; var d = !t.done; t.done = d; repaint(); FS.collection("meets").doc(id).update({done: d, doneAt: d ? now() : 0, doneBy: MY}).then(function(){ if(d) toast("Done ✓"); }).catch(function(e){ toast(e.code || e.message); }); }
function sysPop(title, body, onClick){ msgSound();
  if(document.hidden && window.Notification && Notification.permission === "granted"){ try{ navigator.serviceWorker.getRegistration().then(function(r){ if(r) r.showNotification(title, {body: body, tag: "task" + title, icon: "icon-192.png"}); }); }catch(e){} }
  var e = document.createElement("div"); e.className = "ycPop"; e.innerHTML = '<span class="ycAv ycCalIc" style="width:40px;height:40px">' + IL.check + '</span><div><b>' + esc(title) + '</b><span>' + esc(body).slice(0, 110) + '</span></div>'; e.onclick = function(){ e.remove(); if(onClick) onClick(); }; document.body.appendChild(e); setTimeout(function(){ e.remove(); }, 7000); }
var TSEEN = null;
function taskCheck(){ var key = "yqc_tseen_" + MY, seen = TSEEN || (function(){ try{ return JSON.parse(lsGet(key) || "{}"); }catch(e){ return {}; } })(), first0 = !TSEEN; TSEEN = seen; var ch = 0, nOpen = 0;
  taskList().forEach(function(t){ if(t.who !== MY || t.done) return; nOpen++;
    var k = t.id, st = seen[k] || {};
    if(!st.n){ st.n = 1; ch = 1; if(!first0 && t.by !== MY) sysPop("New task from " + first(t.by), t.t + (t.due ? " · " + dueTxt(t) : ""), function(){ openPanelTab("tasks"); }); }
    if(t.due && !st.s && t.due - now() < 30 * 60000 && t.due > now()){ st.s = 1; ch = 1; sysPop("Task due soon", t.t + " · " + dueTxt(t), function(){ openPanelTab("tasks"); }); }
    if(t.due && !st.o && t.due < now()){ st.o = 1; ch = 1; sysPop("Task overdue", t.t, function(){ openPanelTab("tasks"); }); }
    seen[k] = st; });
  if(ch) lsSet(key, JSON.stringify(seen));
  var tn = $("ycTabN_tasks"); if(tn){ var od = taskList().filter(function(t){ return t.who === MY && !t.done && t.due && t.due < now(); }).length; tn.textContent = od || ""; tn.style.display = od ? "" : "none"; } }
function openPanelTab(t){ TAB = t; STACK = []; VIEW = "home"; PARAM = {}; var pp = $("ycP"); if(!pp || !pp.classList.contains("on")) openPanel(); else paint(true); }
setInterval(function(){ if(MY) taskCheck(); }, 60000);

// ---------- meeting details: agenda, points, live notes, minutes ----------
function txOf(id){ var m = MEETS[id]; return ((m && m.tx) || []).slice().sort(function(a, b){ return a.at - b.at; }); }
function watchTx(id){}
function repaintMeet(){ var w = $("ycW"); if(w && VIEW === "meet"){ var sc = w.querySelector(".ycScroll"), t = sc ? sc.scrollTop : 0, f = $("ycPt"), v = f ? f.value : "", had = f && document.activeElement === f; meetView(w); var s2 = w.querySelector(".ycScroll"); if(s2) s2.scrollTop = t; var f2 = $("ycPt"); if(f2){ f2.value = v; if(had) f2.focus(); } } }
function agendaAll(m){ return (m.agenda || []).map(function(t){ return {t: t, by: m.by}; }).concat((m.pts || []).map(function(p){ return {t: p.t, by: p.by, add: 1}; })); }
var STOP = ("the and for are but not you all any can had her was one our out day get has him his how man new now old see two way who boy did its let put say she too use that with have this will your from they know want been good much some time very when come here just like long make many more only over such take than them well were what yes also into about after again could every there their these those then other which while would should shall being doing because kal aaj abhi bas bhai sahab sir ji haan han nahi nahin hai hain tha thi thay ho hon hoga hogi kar karo karna karen kiya kia raha rahi rahe wala wali wale aur ya bhi kya kyun kaise kab kahan yeh ye woh wo ap aap hum tum main mein mai mujhe hamein unka unki uska uski iska iski apna apni ka ki ke ko se par pe tak sab koi kuch acha achha theek thik okay okk please").split(" ");
function toks(t){ var o = {}; String(t || "").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).forEach(function(w){ if(w.length >= 3 && STOP.indexOf(w) < 0) o[w.length > 5 ? w.slice(0, 5) : w] = 1; }); return Object.keys(o); }
function minutes(m, tx){
  var items = agendaAll(m).map(function(a){ return {t: a.t, k: toks(a.t), lines: []}; }), other = [], who = {};
  tx.forEach(function(l){ who[l.by] = (who[l.by] || 0) + 1; var lt = toks(l.t), best = -1, bs = 0;
    items.forEach(function(it, i){ var sc = 0; lt.forEach(function(w){ if(it.k.indexOf(w) >= 0) sc++; }); if(sc > bs){ bs = sc; best = i; } });
    if(best >= 0) items[best].lines.push(l); else other.push(l); });
  var span = function(ls){ if(!ls.length) return ""; var a = ls[0].at, b = ls[ls.length - 1].at; return hm(a) + (b - a > 60000 ? "–" + hm(b) + " (" + Math.max(1, Math.round((b - a) / 60000)) + " min)" : ""); };
  return {items: items, other: other, who: who, start: tx.length ? tx[0].at : 0, end: tx.length ? tx[tx.length - 1].at : 0, span: span};
}
function minutesHtml(m, tx){
  if(!tx.length) return '<div class="ycEmpty sm"><span>Minutes appear here once the meeting starts. Everyone\'s spoken words (auto notes) and typed notes are collected here.</span></div>';
  var r = minutes(m, tx), line = function(l){ return '<div class="ycTxL"><time>' + hm(l.at) + '</time><b style="color:' + colorOf(l.by) + '">' + esc(first(l.by)) + '</b><span>' + (l.k === "n" ? '<i class="ycNt">note</i> ' : '') + esc(l.t) + '</span><button class="ycMk" data-c="tasknew" data-mid="' + m.id + '" data-t="' + esc(l.t.replace(/^decision:\s*/i, "")) + '" title="Make this a task">+ task</button></div>'; };
  var h = '<div class="ycMinHd"><span>' + hm(r.start) + ' – ' + hm(r.end) + ' · ' + Math.max(1, Math.round((r.end - r.start) / 60000)) + ' min</span><span>' + Object.keys(r.who).map(function(u){ return esc(first(u)) + " " + r.who[u]; }).join(" · ") + '</span></div>';
  h += r.items.map(function(it, i){ return '<div class="ycMinI' + (it.lines.length ? "" : " no") + '"><div class="ycMinT"><b>' + (i + 1) + '. ' + esc(it.t) + '</b><em>' + (it.lines.length ? it.lines.length + (it.lines.length > 1 ? " points · " : " point · ") + r.span(it.lines) : "Not discussed") + '</em></div>' + it.lines.map(line).join("") + '</div>'; }).join("");
  h += '<div class="ycMinI other"><div class="ycMinT"><b>Other discussion</b><em>' + (r.other.length ? r.other.length + (r.other.length > 1 ? " points · " : " point · ") + r.span(r.other) : "None") + '</em></div>' + r.other.map(line).join("") + '</div>';
  return h;
}
function minutesText(m, tx){ var r = minutes(m, tx), o = "📝 Minutes — " + m.title + "\n" + dayLbl(r.start || m.at) + " " + hm(r.start || m.at) + (r.end ? "–" + hm(r.end) : "") + "\n";
  r.items.forEach(function(it, i){ o += "\n" + (i + 1) + ". " + it.t + " — " + (it.lines.length ? r.span(it.lines) : "not discussed") + "\n" + it.lines.slice(0, 12).map(function(l){ return "   • " + first(l.by) + ": " + l.t; }).join("\n") + (it.lines.length ? "\n" : ""); });
  if(r.other.length) o += "\nOther discussion — " + r.span(r.other) + "\n" + r.other.slice(0, 12).map(function(l){ return "   • " + first(l.by) + ": " + l.t; }).join("\n") + "\n";
  return o.slice(0, 4900); }
function meetView(w){
  var m = MEETS[PARAM.id]; if(!m){ w.innerHTML = bar(BACKB(), '<b>Meeting</b>', "") + '<div class="ycEmpty"><span>Meeting not found.</span></div>'; bind(w); return; }
  var tx = txOf(m.id), ag = agendaAll(m), live = m.call && !(m.done);
  var h = bar(BACKB(), '<b>' + esc(m.title) + '</b>', esc(dayLbl(m.at) + " · " + hm(m.at) + " · " + (m.dur || 30) + " min")) + '<div class="ycScroll"><div class="ycMeetBox">';
  h += '<div class="ycMemb">' + (m.members || []).map(function(u){ return '<span>' + avU(u, 38) + '<small>' + esc(first(u)) + '</small></span>'; }).join("") + '</div>';
  h += '<div class="ycSec" style="padding-left:0">' + IL.agenda + ' Agenda</div>' + (ag.length ? '<ol class="ycAg">' + ag.map(function(a){ return '<li>' + esc(a.t) + (a.add ? ' <small>added by ' + esc(first(a.by)) + '</small>' : '') + '</li>'; }).join("") + '</ol>' : '<div class="ycSoft" style="padding:4px 0 8px">No agenda yet — add the first point.</div>');
  h += '<div class="ycAddPt"><input id="ycPt" maxlength="140" placeholder="Add a point to the agenda"><button data-c="addpt">' + IL.plus + '</button></div>';
  h += '<button class="ycPb" data-c="meetjoin" data-id="' + m.id + '" style="width:100%;margin:12px 0 4px">' + (live ? "Join meeting (in progress)" : "Start / join meeting") + '</button></div>';
  var mt = taskList().filter(function(t){ return t.mid === m.id; });
  h += '<div class="ycSec">' + IL.check + ' Tasks from this meeting</div>' + mt.map(taskRow).join("") + '<button class="ycRow" data-c="tasknew" data-mid="' + m.id + '"><span class="ycAv ycCalIc" style="width:40px;height:40px">' + IL.plus + '</span><div class="ycRm"><div class="ycR1"><b>Add a task</b></div><div class="ycR2"><span>Who does what, by when</span></div></div></button>';
  h += '<div class="ycSec">' + IL.notes + ' Minutes</div><div class="ycMin">' + minutesHtml(m, tx) + '</div>';
  if(tx.length) h += '<div style="padding:4px 14px 18px;display:flex;gap:8px"><button class="ycPb ghost" data-c="minshare" style="flex:1">Share minutes in chat</button><button class="ycPb ghost" data-c="mindl" style="flex:1">Download</button></div>';
  w.innerHTML = h + '</div>'; bind(w);
  var pt = $("ycPt"); if(pt) pt.onkeydown = function(e){ if(e.key === "Enter"){ e.preventDefault(); addPoint(); } };
}
function addPoint(){ var f = $("ycPt"), t = f && f.value.trim(); if(!t) return; var id = PARAM.id || (CALL && CALL.meet); if(!id) return; f.value = "";
  FS.collection("meets").doc(id).update({pts: FV.arrayUnion({t: t.slice(0, 140), by: MY, at: now()})}).then(function(){ toast("Point added"); }).catch(function(e){ toast(e.code || e.message); }); }
function addNote(id, t, k){ t = String(t || "").trim(); if(!t || !id) return Promise.resolve(); return FS.collection("meets").doc(id).update({tx: FV.arrayUnion({by: MY, t: t.slice(0, 600), at: now(), k: k || "s"})}).catch(function(e){ toast("Note not saved: " + (e.code || e.message)); }); }
function shareMinutes(){ var m = MEETS[PARAM.id]; if(!m) return; var txt = minutesText(m, txOf(m.id));
  var cid = (m.cid && CHATS[m.cid]) ? m.cid : null; var targets = Object.keys(CHATS).filter(function(k){ var c = CHATS[k]; return c.type === "group" && (m.members || []).every(function(u){ return (c.members || []).indexOf(u) >= 0; }); });
  FWD = {k: "text", t: txt, nofw: 1}; go("pick", {mode: "fwd", sel: targets.length ? (function(o){ o["c:" + targets[0]] = 1; return o; })({}) : {}}); }
function downloadMinutes(){ var m = MEETS[PARAM.id]; if(!m) return; var b = new Blob([minutesText(m, txOf(m.id)).replace(/\n/g, "\r\n")], {type: "text/plain"}), a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "Minutes - " + m.title.replace(/[\\/:*?"<>|]/g, "_") + ".txt"; a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); }, 4000); }

// ---------- live notes during a meeting (speech → text, plus typed notes) ----------
var SR = null;
function srOk(){ return !!(window.SpeechRecognition || window.webkitSpeechRecognition); }
function srStart(){ if(!CALL || !CALL.meet || SR || !srOk()) return; var R = window.SpeechRecognition || window.webkitSpeechRecognition, r = new R(), mid = CALL.meet;
  r.lang = lsGet("yqc_srl") || "en-IN"; r.continuous = true; r.interimResults = false;
  r.onresult = function(e){ for(var i = e.resultIndex; i < e.results.length; i++){ if(e.results[i].isFinal){ var t = e.results[i][0].transcript; if(t && t.trim().split(/\s+/).length >= 2) addNote(mid, t, "s"); } } };
  r.onerror = function(e){ if(e.error === "not-allowed" || e.error === "service-not-allowed"){ SR = null; lsSet("yqc_sron", "0"); notesHead(); } };
  r.onend = function(){ if(SR === r && CALL && CALL.meet === mid && lsGet("yqc_sron") !== "0"){ try{ r.start(); }catch(x){ SR = null; } } else if(SR === r) SR = null; notesHead(); };
  SR = r; try{ r.start(); }catch(x){ SR = null; } notesHead(); }
function srStop(){ var r = SR; SR = null; if(r) try{ r.stop(); }catch(x){} notesHead(); }
function notesPanel(){ if(!CALL || !CALL.meet) return; var x = $("ycCall"); if(!x) return; var n = $("ycNotes"); if(n){ n.remove(); return; } watchTx(CALL.meet);
  n = document.createElement("div"); n.id = "ycNotes"; x.appendChild(n);
  var m = MEETS[CALL.meet] || {}, ag = agendaAll(m);
  n.innerHTML = '<div class="ycNh"><b>' + IL.notes + ' Meeting notes</b><button data-k="x">' + IL.close + '</button></div><div class="ycNsub" id="ycNsub"></div>' + (ag.length ? '<ol class="ycAg sm">' + ag.map(function(a){ return '<li>' + esc(a.t) + '</li>'; }).join("") + '</ol>' : '') + '<div class="ycNfeed" id="ycNfeed"></div><div class="ycAddPt"><input id="ycNin" maxlength="300" placeholder="Type a note or decision"><button data-k="add">' + IL.plus + '</button></div>';
  n.addEventListener("click", function(e){ e.stopPropagation(); var b = e.target.closest("[data-k]"); if(!b) return; var k = b.getAttribute("data-k");
    if(k === "x") n.remove(); if(k === "add"){ var f = $("ycNin"); addNote(CALL.meet, f.value, "n"); f.value = ""; }
    if(k === "sr"){ if(SR){ lsSet("yqc_sron", "0"); srStop(); } else { lsSet("yqc_sron", "1"); srStart(); } }
    if(k === "lang"){ lsSet("yqc_srl", (lsGet("yqc_srl") || "en-IN") === "en-IN" ? "ur-PK" : "en-IN"); if(SR){ srStop(); lsSet("yqc_sron", "1"); setTimeout(srStart, 300); } notesHead(); } });
  $("ycNin").onkeydown = function(e){ if(e.key === "Enter"){ e.preventDefault(); addNote(CALL.meet, this.value, "n"); this.value = ""; } };
  notesHead(); notesFeed(); }
function notesHead(){ var s = $("ycNsub"); if(!s) return; var L = (lsGet("yqc_srl") || "en-IN") === "en-IN" ? "English / Roman Urdu" : "اردو";
  s.innerHTML = srOk() ? '<button data-k="sr" class="' + (SR ? "on" : "") + '"><i></i>' + (SR ? "Auto notes ON — your words are written down" : "Auto notes OFF — tap to turn on") + '</button><button data-k="lang">' + L + '</button>' : '<span>Auto notes need Chrome (PC or phone browser). In this app, type notes below — they go into the minutes.</span>'; }
function notesFeed(){ var f = $("ycNfeed"); if(!f || !CALL) return; var tx = txOf(CALL.meet).slice(-40); f.innerHTML = tx.map(function(l){ return '<div class="ycTxL"><time>' + hm(l.at) + '</time><b style="color:' + colorOf(l.by) + '">' + esc(first(l.by)) + '</b><span>' + (l.k === "n" ? '<i class="ycNt">note</i> ' : '') + esc(l.t) + '</span></div>'; }).join("") || '<div class="ycSoft">Nothing yet.</div>'; f.scrollTop = f.scrollHeight; }

// ---------- one click / long-press handler ----------
function bind(root){
  root.querySelectorAll("[data-c]").forEach(function(el){ if(el.__yb) return; el.__yb = 1; el.addEventListener("click", function(e){ if(el.__lpFired){ el.__lpFired = 0; return; } e.stopPropagation(); act(el.getAttribute("data-c"), el); }); });
  root.querySelectorAll("[data-lp]").forEach(function(el){ if(el.__lb) return; el.__lb = 1; var t = 0, sx = 0, sy = 0;
    var fire = function(){ el.__lpFired = 1; try{ navigator.vibrate && navigator.vibrate(25); }catch(e){} if(el.getAttribute("data-lp") === "chat") chatMenu(el.getAttribute("data-id")); else msgMenu(el.getAttribute("data-id")); setTimeout(function(){ el.__lpFired = 0; }, 600); };
    el.addEventListener("touchstart", function(e){ var p = e.touches[0]; sx = p.clientX; sy = p.clientY; t = setTimeout(fire, 480); }, {passive: true});
    el.addEventListener("touchmove", function(e){ var p = e.touches[0]; if(Math.abs(p.clientX - sx) > 10 || Math.abs(p.clientY - sy) > 10) clearTimeout(t); }, {passive: true});
    el.addEventListener("touchend", function(){ clearTimeout(t); }); el.addEventListener("touchcancel", function(){ clearTimeout(t); });
    el.addEventListener("contextmenu", function(e){ e.preventDefault(); clearTimeout(t); if(!el.__lpFired) fire(); });
    if(el.getAttribute("data-lp") === "msg"){ var sw = 0, row = el.parentNode, ic = row.querySelector(".ycSwR"), swx = 0, swy = 0;
      el.addEventListener("touchstart", function(e){ var p = e.touches[0]; swx = p.clientX; swy = p.clientY; sw = 0; row.style.transition = "none"; }, {passive: true});
      el.addEventListener("touchmove", function(e){ var p = e.touches[0], dx = p.clientX - swx, dy = p.clientY - swy; if(!sw && dx > 14 && Math.abs(dx) > Math.abs(dy) * 1.6) sw = 1; if(sw){ clearTimeout(t); var d = Math.max(0, Math.min(84, dx * .75)); row.style.transform = "translateX(" + d + "px)"; if(ic){ ic.style.opacity = Math.min(1, d / 60); ic.style.transform = "scale(" + (d >= 56 ? 1.15 : .8) + ")"; } } }, {passive: true});
      var swEnd = function(){ if(!sw) return; var d = parseFloat((row.style.transform.match(/-?[\d.]+/) || [0])[0]); row.style.transition = "transform .2s"; row.style.transform = ""; if(ic){ ic.style.opacity = 0; } sw = 0; el.__lpFired = 1; setTimeout(function(){ el.__lpFired = 0; }, 350);
        if(d >= 56){ var m = msgById(el.getAttribute("data-id")); if(m && !m.del && !m.pend){ try{ navigator.vibrate && navigator.vibrate(15); }catch(x){} REPLY = {id: m.id, by: m.by, t: preview(m)}; replyBar(); var tx = $("ycTx"); if(tx) tx.focus(); } } };
      el.addEventListener("touchend", swEnd); el.addEventListener("touchcancel", swEnd); }
    if(el.getAttribute("data-lp") === "msg") el.addEventListener("dblclick", function(e){ e.preventDefault(); var id = el.getAttribute("data-id"), m = msgById(id); if(!m || m.pend) return; var u = {}; u["re." + MY] = m.re && m.re[MY] === "👍" ? FV.delete() : "👍"; FS.collection("chats").doc(OPEN).collection("m").doc(id).update(u).catch(function(){}); });
  });
}
function openDmThenCall(u, video){ var id = dmId(MY, u); var c = function(){ startCallChat(id, video); }; if(CHATS[id]) return c(); FS.collection("chats").doc(id).set({type: "dm", members: [MY, u].sort(), at: now(), made: now(), by: MY, n: {}, rd: {}}, {merge: true}).then(function(){ CHATS[id] = CHATS[id] || {id: id, type: "dm", members: [MY, u].sort(), n: {}, rd: {}}; c(); }).catch(function(e){ toast(e.code || e.message); }); }
function act(a, el){
  var id = el && el.getAttribute("data-id"), u = el && el.getAttribute("data-u");
  switch(a){
  case "close": return closePanel();
  case "back": return uiBack();
  case "noop": return;
  case "tab": TAB = el.getAttribute("data-t"); SEARCHQ = ""; PARAM = {}; return paint(true);
  case "filter": FILTER = el.getAttribute("data-f"); var l = $("ycList"); if(l){ l.innerHTML = chatsList(); bind(l); } return;
  case "search": PARAM = {search: 1}; SEARCHQ = ""; TAB = "chats"; return paint(true);
  case "unsearch": PARAM = {}; SEARCHQ = ""; return paint(true);
  case "menu": return homeMenu(el);
  case "me": return go("profile", {});
  case "saveme": return saveMe();
  case "empsave": return empSave();
  case "empph": return empPhoto(el.getAttribute("data-k"));
  case "staff": return go("staff", {});
  case "sfilt": STAFFF = el.getAttribute("data-f"); return paint(true);
  case "stask": return go("tasknew", {who: u});
  case "setphoto": return pickPhoto("photo");
  case "mycard": return personCard(MY);
  case "mycover": return coverCard();
  case "pcard": return personCard(u);
  case "gcard": return groupCard();
  case "setcover": return pickPhoto("cover");
  case "open": return openChat(id);
  case "openmsg": var mid = el.getAttribute("data-m"); openChat(id); var tries = 0, jt = setInterval(function(){ var e = document.getElementById("m_" + mid); if(e || ++tries > 20){ clearInterval(jt); if(e){ e.scrollIntoView({block: "center"}); var bb = e.querySelector(".ycB"); if(bb){ bb.classList.add("ycPick"); setTimeout(function(){ bb.classList.remove("ycPick"); }, 1600); } } } }, 150); return;
  case "cjoin": return custJoin(el.getAttribute("data-n"));
  case "dm": return openDm(u);
  case "newchat": return go("pick", {mode: "chat", sel: {}});
  case "newgroup0": return go("pick", {mode: "group", sel: {}});
  case "newcall": return go("pick", {mode: "call"});
  case "pcall": return openDmThenCall(u, false);
  case "psel": var k = el.getAttribute("data-k"); if(PARAM.sel[k]) delete PARAM.sel[k]; else PARAM.sel[k] = 1; el.classList.toggle("on", !!PARAM.sel[k]); el.querySelector(".ycCkb").textContent = PARAM.sel[k] ? "✓" : ""; var n = Object.keys(PARAM.sel).length, pb = document.querySelector('[data-c="pickdone"]'); if(pb) pb.disabled = !n; var sub = document.querySelector(".ycHt span"); if(sub) sub.textContent = n + " selected"; return;
  case "pickdone": return pickDone();
  case "gmake": return makeGroup();
  case "gphoto": return groupPhoto("photo");
  case "gphoto2": return groupPhoto("photo");
  case "gcover": return;
  case "archived": return go("archived", {});
  case "starred": return go("starred", {});
  case "send": return send();
  case "sendormic": var tx = $("ycTx"); if(tx && tx.value.trim()) return send(); return recStart();
  case "recsend": return recStop(false);
  case "reccancel": return recStop(true);
  case "attach": return attachSheet();
  case "cam": return $("ycCam").click();
  case "play": return play(el);
  case "dl": return download(el.getAttribute("data-f"), el.getAttribute("data-n"));
  case "view": var im = el.querySelector("img"); return viewImg(el.getAttribute("data-f"), im && im.src);
  case "viewph": return viewImg(el.getAttribute("data-f"));
  case "info": return go("info", {});
  case "ifind": navBack(); PARAM.find = true; $("ycW").removeAttribute("data-v"); return paint(true);
  case "cmenu": return chatMoreMenu(el);
  case "unblock": return setBlock(u, false);
  case "iblock": return askBlock(u);
  case "reactpick": return msgMenu(id, true);
  case "addm": return go("pick", {mode: "add", sel: {}});
  case "mem": return memberMenu(u);
  case "leave": return leaveGroup();
  case "cdel2": var c2 = OPEN; ask("Messages stay for the other people.", {title: "Delete this chat for you?", ok: "Delete", danger: 1}).then(function(y){ if(!y) return; var uu = {}; uu["hid." + MY] = now(); uu["n." + MY] = 0; FS.collection("chats").doc(c2).update(uu).then(function(){ STACK = []; VIEW = "home"; OPEN = null; stopMsgs(); paint(true); }).catch(function(){}); }); return;
  case "call": return startCallChat(OPEN, false);
  case "vcall": return startCallChat(OPEN, true);
  case "showcall": return showCallUi();
  case "unreply": REPLY = null; return replyBar();
  case "jump": var t = $("m_" + id); if(t){ t.scrollIntoView({block: "center", behavior: "smooth"}); t.classList.add("ycFlash"); setTimeout(function(){ t.classList.remove("ycFlash"); }, 1400); } return;
  case "more": MSGLIM += 60; MKEY = ""; return listenMsgs(OPEN);
  case "reinfo": var m = msgById(id); if(m && m.re) toast(Object.keys(m.re).map(function(x){ return m.re[x] + " " + first(x); }).join("  ")); return;
  case "stext": return go("stext", {bg: SBG[0]});
  case "sbg": var i = SBG.indexOf(PARAM.bg); PARAM.bg = SBG[(i + 1) % SBG.length]; var st = document.querySelector(".ycSt"); if(st) st.style.background = PARAM.bg; return;
  case "spost": return postTextStatus();
  case "sphoto": var f = document.createElement("input"); f.type = "file"; f.accept = "image/*"; f.onchange = function(){ if(f.files[0]) postPhotoStatus(f.files[0]); }; f.click(); return;
  case "sview": return viewStatus(u);
  case "meetnew": return go("meetnew", {sel: {}, cid: PARAM.cid || (VIEW === "chat" ? OPEN : null)});
  case "meetnow": return go("pick", {mode: "meet", sel: {}});
  case "meetppl": var keep = PARAM; return go("pick", {mode: "meetsel", sel: keep.sel, back: keep});
  case "meetsave": return meetSave();
  case "meetstart": var mem = [MY].concat(Object.keys(PARAM.sel || {}).map(function(x){ return x.slice(2); })); var vid = !!PARAM.video, ttl = ($("ycMt").value || "").trim() || "Meeting"; var ag = agendaOf(($("ycMa") || {}).value); STACK = []; VIEW = "home"; TAB = "calls"; paint(true); return adhocMeet(mem, ttl, vid, ag);
  case "meetjoin": return meetJoin(id);
  case "meetinfo": return go("meet", {id: id});
  case "linkpc": if(window.yqQrScan) window.yqQrScan(); return;
  case "tasknew": return go("tasknew", {mid: el.getAttribute("data-mid") || "", t: el.getAttribute("data-t") || ""});
  case "taskopen": return go("tasknew", {id: id});
  case "tdone": return taskDone(id);
  case "tasksave": return taskSave();
  case "taskdel": return ask("", {title: "Delete this task?", ok: "Delete", danger: 1}).then(function(y){ if(y) FS.collection("meets").doc(id).delete().then(function(){ toast("Task deleted"); navBack(); }); });
  case "addpt": return addPoint();
  case "minshare": return shareMinutes();
  case "mindl": return downloadMinutes();
  case "callback": var cl = CALLS.filter(function(x){ return x.id === id; })[0]; if(!cl) return; if(cl.group){ if(cl.meet && MEETS[cl.meet]) return meetJoin(cl.meet); if(cl.cid && CHATS[cl.cid]) return startCallChat(cl.cid, !!cl.video); return startCall({members: cl.members, group: true, title: cl.title || "Meeting", cid: "", video: !!cl.video}); } var o = (cl.members || []).filter(function(x){ return x !== MY; })[0]; return openDmThenCall(o, !!cl.video);
  case "tsnd": lsSet("yqc_snd", lsGet("yqc_snd") === "0" ? "1" : "0"); $("ycW").removeAttribute("data-v"); return paint(true);
  case "notif": try{ Notification.requestPermission().then(function(){ $("ycW").removeAttribute("data-v"); paint(true); }); }catch(e){} return;
  case "wallset": return wallSheet();
  }
}
// meeting people picker returns into the meeting form
var _pickDone = pickDone; pickDone = function(){ if(PARAM.mode === "meetsel"){ var sel = PARAM.sel, back = PARAM.back; STACK.pop(); VIEW = "meetnew"; PARAM = back; PARAM.sel = sel; $("ycW").removeAttribute("data-v"); return paint(true); } return _pickDone(); };
var _pickRows = pickRows; pickRows = function(){ if(PARAM.mode === "meetsel"){ PARAM.mode = "meet"; var h = _pickRows(); PARAM.mode = "meetsel"; return h; } return _pickRows(); };
var _pickView = pickView; pickView = function(w){ _pickView(w); if(PARAM.mode === "meetsel"){ var b = document.querySelector('[data-c="pickdone"]'); if(b){ b.textContent = "Done"; b.disabled = false; } } };

// ---------- background push hook (filled once the push server is set up) ----------
function pushNote(c, preview, mn){ try{ var g = c.type === "group"; mn = mn || [];
  if(mn.length) pushSend(mn, fullName(MY) + " mentioned you · " + chatTitle(c), preview, c.id, "men", null);
  pushSend((c.members || []).filter(function(u){ return mn.indexOf(u) < 0; }), g ? chatTitle(c) : fullName(MY), (g ? first(MY) + ": " : "") + preview, c.id, "msg", c); }catch(e){} }
// ---------- push to phones that are closed (Cloudflare worker → Firebase Cloud Messaging) ----------
var PUSHURL = "", AUTHO = null;
function pushInit(){ FS.collection("meta").doc("push").get().catch(function(){ return null; }).then(function(d){ PUSHURL = (d && d.exists && d.data().url) || "https://yqi-push.yqi-ytm7.workers.dev"; return fetch(PUSHURL).then(function(r){ return r.json(); }).then(function(j){ window.YQPUSH_ON = !!(j && j.ready); if(!window.YQPUSH_ON && !/push\.test/.test(PUSHURL)) PUSHURL = PUSHURL; }); }).catch(function(){}); if(window.YQPUSHTOK) setToken(window.YQPUSHTOK.t, window.YQPUSHTOK.k); }
function setToken(t, k){ window.YQPUSHTOK = {t: t, k: k}; if(!MY || !t) return; var h = 0; for(var i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0; var key = (k || "a") + h.toString(36);
  if(ME && ME.fcm && ME.fcm[key] === t) return; var x = {}; x["fcm." + key] = t; FS.collection("people").doc(MY).update(x).then(function(){ ME = ME || {}; ME.fcm = ME.fcm || {}; ME.fcm[key] = t; }).catch(function(){}); }
function pushSend(mem, title, body, cid, kind, c){ if(!PUSHURL || !AUTHO || !AUTHO.currentUser) return;
  var toks = []; mem.forEach(function(u){ if(u === MY) return; var p = PEOPLE[u]; if(!p || !p.fcm) return; if(kind !== "call" && c && c.mu && c.mu[u]) return; if(p.bl && p.bl[MY]) return; Object.keys(p.fcm).forEach(function(k){ toks.push(p.fcm[k]); }); });
  if(!toks.length) return; AUTHO.currentUser.getIdToken().then(function(idt){ return fetch(PUSHURL, {method: "POST", headers: {"content-type": "application/json"}, body: JSON.stringify({idToken: idt, tokens: toks, title: title, body: String(body || "").slice(0, 180), cid: cid || "", kind: kind || "msg"})}); }).catch(function(){}); }

// ===================== voice + video calls and meetings (WebRTC, Firestore signalling) =====================
var CALL = null;
function iceCfg(){ return {iceServers: [{urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"]}].concat(window.YQ_TURN || [])}; }
function startCallChat(cid, video){ var c = CHATS[cid]; if(!c) return; var g = c.type === "group"; startCall({members: (c.members || []).slice(), group: g, title: g ? (c.title || "Meeting") : chatTitle(c), cid: cid, video: !!video}); }
function getMedia(video){ if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return Promise.reject(new Error("Calls are not supported in this browser"));
  return navigator.mediaDevices.getUserMedia({audio: {echoCancellation: true, noiseSuppression: true, autoGainControl: true}, video: video ? {facingMode: "user", width: {ideal: 640}, height: {ideal: 480}, frameRate: {ideal: 24}} : false}); }
function startCall(o){
  if(CALL){ showCallUi(); return; } if(!ME) return toast("Set up your profile first");
  var mem = o.members.filter(function(u, i, a){ return a.indexOf(u) === i; }); if(mem.indexOf(MY) < 0) mem.unshift(MY);
  if(mem.length < 2) return toast("Pick at least one person");
  if(mem.length > 8 && !o.okBig) return ask("Calls work best with up to 8 people" + (o.video ? " (video: 4–6)" : "") + ".", {title: "Big call", ok: "Continue"}).then(function(y){ if(y){ o.okBig = 1; startCall(o); } });
  getMedia(o.video).then(function(st){
    var ref = FS.collection("calls").doc(), t = now(), j = {}; j[MY] = t; var was = {}; was[MY] = 1;
    CALL = {id: ref.id, cid: o.cid || "", group: !!o.group, video: !!o.video, title: o.title, by: MY, members: mem, st: st, pcs: {}, joined: j, t0: 0, out: true, muted: false, camOff: false, seen: {}, meet: o.meet || "", face: "user"};
    return ref.set({cid: o.cid || "", by: MY, members: mem, group: !!o.group, video: !!o.video, title: o.group ? o.title : "", meet: o.meet || "", at: t, joined: j, was: was, ended: false}).then(function(){
      if(o.meet) FS.collection("meets").doc(o.meet).update({call: ref.id}).catch(function(){});
      ringAll(mem, t); try{ if(window.YQ_PUSH && YQ_PUSH.call) YQ_PUSH.call(CALL, ME); }catch(e){}
      watchCall(); showCallUi(); ringStart("out");
      CALL.noAns = setTimeout(function(){ if(CALL && CALL.id === ref.id && !CALL.t0) endCall(CALL.group ? "" : "No answer"); }, 45000);
    });
  }).catch(function(e){ toast(e && e.name === "NotAllowedError" ? "Please allow the " + (o.video ? "camera and " : "") + "microphone." : "Could not start call: " + (e.message || e)); CALL = null; });
}
function ringAll(mem, t){ try{ var tgt = mem.filter(function(u){ return u !== MY && !(CALL.joined || {})[u]; }); pushSend(tgt, (CALL.video ? "📹 " : "📞 ") + (CALL.group ? CALL.title : fullName(MY)), CALL.group ? first(MY) + " is inviting you to a meeting" : "Incoming " + (CALL.video ? "video" : "voice") + " call — open YQI to answer", CALL.cid || "", "call"); }catch(e){}
  mem.forEach(function(u){ if(u !== MY && !(CALL.joined || {})[u]) FS.collection("inbox").doc(u).set({ring: {id: CALL.id, cid: CALL.cid, from: MY, name: ME.name, pt: ME.pt || "", group: CALL.group, video: CALL.video, title: CALL.group ? CALL.title : "", at: t || now()}}, {merge: true}).catch(function(){}); }); }
var RINGING = null;
function onRing(r){ if(r && iBlocked(r.from)) return;
  if(!r || !r.id || r.from === MY) return; if(now() - (r.at || 0) > 50000) return; if(CALL && CALL.id === r.id) return; if(RINGING && RINGING.id === r.id) return;
  if(CALL){ FS.collection("calls").doc(r.id).collection("sig").add({f: MY, t: r.from, ty: "busy", at: now()}).catch(function(){}); return; }
  FS.collection("calls").doc(r.id).get().then(function(d){ if(!d.exists || d.data().ended) return; RINGING = r; incomingUi(r);
    RINGING.un = FS.collection("calls").doc(r.id).onSnapshot(function(x){ if(!x.exists || x.data().ended) stopRinging(); }, function(){});
    RINGING.to = setTimeout(stopRinging, 45000); }).catch(function(){});
}
function stopRinging(){ ringStop(); if(RINGING){ clearTimeout(RINGING.to); if(RINGING.un) try{ RINGING.un(); }catch(e){} } RINGING = null; var x = $("ycIn2"); if(x) x.remove(); }
function incomingUi(r){
  var x = $("ycIn2"); if(x) x.remove(); x = document.createElement("div"); x.id = "ycIn2";
  var nm = r.group ? r.title : r.name;
  x.innerHTML = '<div class="ycInT">YQI · ' + (r.video ? "Video" : "Voice") + (r.group ? " meeting" : " call") + '</div><div class="ycInB">' + avImg(nm, r.group ? r.cid || r.id : r.from, 120, r.group ? "" : r.pt) + '<b>' + esc(nm) + '</b><span>' + (r.group ? esc(r.name) + ' is inviting you' : (r.video ? "Incoming video call" : "Incoming voice call")) + '</span></div><div class="ycInBtns"><button class="no" data-x="no">' + IC.hang + '<small>Decline</small></button><button class="yes" data-x="yes">' + (r.video ? IC.video : IC.call) + '<small>Accept</small></button></div>';
  document.body.appendChild(x); ringStart("in");
  x.querySelector('[data-x="no"]').onclick = function(){ var rr = RINGING; stopRinging(); if(rr && !rr.group) FS.collection("calls").doc(rr.id).update({ended: true, why: "declined"}).catch(function(){}); };
  x.querySelector('[data-x="yes"]').onclick = function(){ var rr = RINGING; stopRinging(); joinCall(rr); };
  if(document.hidden && window.Notification && Notification.permission === "granted"){ try{ navigator.serviceWorker.getRegistration().then(function(reg){ if(reg) reg.showNotification(nm + (r.video ? " · video call" : " · voice call"), {body: "Tap to open YQI and answer", icon: "icon-192.png", tag: "call_" + r.id, requireInteraction: true, vibrate: [500, 250, 500, 250, 500], data: {cid: r.cid}}); }); }catch(e){} }
}
function joinCall(r){
  FS.collection("calls").doc(r.id).get().then(function(d){ if(!d.exists || d.data().ended){ toast("Call has ended"); return; } var cd = d.data();
    return getMedia(!!cd.video).catch(function(e){ if(cd.video) return getMedia(false); throw e; }).then(function(st){
      CALL = {id: r.id, cid: cd.cid, group: !!cd.group, video: !!cd.video, title: cd.group ? (cd.title || "Meeting") : fullName(cd.by), by: cd.by, members: cd.members, st: st, pcs: {}, joined: cd.joined || {}, t0: now(), out: false, muted: false, camOff: !st.getVideoTracks().length, seen: {}, meet: cd.meet || "", face: "user"};
      var u = {}; u["joined." + MY] = now(); u["was." + MY] = 1; return FS.collection("calls").doc(r.id).update(u).then(function(){ watchCall(); showCallUi(); }); });
  }).catch(function(e){ toast(e && e.name === "NotAllowedError" ? "Please allow the microphone to answer." : "Could not join: " + (e.message || e)); });
}
function watchCall(){
  var C0 = CALL, ref = FS.collection("calls").doc(C0.id);
  C0.unDoc = ref.onSnapshot(function(d){ if(CALL !== C0) return; if(!d.exists) return endCall("", true); var x = d.data(); C0.members = x.members || C0.members;
    if(x.ended) return endCall(x.why === "declined" ? "Declined" : "", true);
    var j = x.joined || {}; C0.joined = j;
    Object.keys(j).forEach(function(u){ if(u !== MY && !C0.pcs[u] && MY < u) makePc(u, true); });
    Object.keys(C0.pcs).forEach(function(u){ if(!j[u]) closePc(u); });
    var others = Object.keys(j).filter(function(u){ return u !== MY; });
    if(others.length && !C0.t0){ C0.t0 = now(); ringStop(); clearTimeout(C0.noAns); }
    if(others.length) C0.hadPeer = true;
    if(!C0.group && C0.hadPeer && !others.length) return endCall("");
    callUi();
  }, function(){});
  C0.unSig = ref.collection("sig").where("t", "==", MY).onSnapshot(function(q){ if(CALL !== C0) return; q.docs.slice().sort(function(a, b){ var x = a.data(), y = b.data(); return (x.at - y.at) || (x.ty === "offer" ? -1 : y.ty === "offer" ? 1 : 0); }).forEach(function(d){ if(C0.seen[d.id]) return; C0.seen[d.id] = 1; onSig(d.data()); d.ref.delete().catch(function(){}); }); }, function(){});
}
function sig(to, ty, data){ if(!CALL) return; FS.collection("calls").doc(CALL.id).collection("sig").add({f: MY, t: to, ty: ty, d: data ? JSON.stringify(data) : "", at: now()}).catch(function(){}); }
function makePc(u, offer){
  var C0 = CALL, pc = new RTCPeerConnection(iceCfg()), P = {pc: pc, q: [], el: null, lvl: 0, stream: null}; C0.pcs[u] = P;
  C0.st.getTracks().forEach(function(t){ pc.addTrack(t, C0.st); });
  if(C0.video && !C0.st.getVideoTracks().length) try{ pc.addTransceiver("video", {direction: "recvonly"}); }catch(e){}
  pc.onicecandidate = function(e){ if(e.candidate) sig(u, "ice", e.candidate.toJSON ? e.candidate.toJSON() : e.candidate); };
  pc.ontrack = function(e){ P.stream = e.streams[0] || new MediaStream([e.track]); attachMedia(u); if(e.track.kind === "audio") meter(u, P.stream); };
  pc.onconnectionstatechange = function(){ P.state = pc.connectionState; callUi(); if(pc.connectionState === "failed" && offer){ try{ pc.restartIce && pc.restartIce(); pc.createOffer({iceRestart: true}).then(function(o2){ return pc.setLocalDescription(o2); }).then(function(){ sig(u, "offer", pc.localDescription); }); }catch(e){} } };
  if(offer) pc.createOffer({offerToReceiveAudio: true, offerToReceiveVideo: !!C0.video}).then(function(o2){ return pc.setLocalDescription(o2); }).then(function(){ sig(u, "offer", pc.localDescription); }).catch(function(){});
  return P;
}
function onSig(m){
  var C0 = CALL; if(!C0) return; var u = m.f, d = m.d ? JSON.parse(m.d) : null;
  if(m.ty === "busy"){ if(!C0.group){ toast(fullName(u) + " is on another call"); endCall("Busy"); } return; }
  if(m.ty === "cam"){ var P0 = C0.pcs[u]; if(P0){ P0.camOff = d && d.off; callUi(true); } return; }
  var P = C0.pcs[u];
  if(m.ty === "offer"){ if(P && P.pc.signalingState !== "stable"){ closePc(u); P = null; } if(!P) P = makePc(u, false); if(C0.pice && C0.pice[u]){ P.q = P.q.concat(C0.pice[u]); delete C0.pice[u]; }
    P.pc.setRemoteDescription(d).then(function(){ P.q.splice(0).forEach(function(c){ P.pc.addIceCandidate(c).catch(function(){}); }); return P.pc.createAnswer(); }).then(function(a){ return P.pc.setLocalDescription(a); }).then(function(){ sig(u, "answer", P.pc.localDescription); }).catch(function(){}); }
  else if(m.ty === "answer" && P){ P.pc.setRemoteDescription(d).then(function(){ P.q.splice(0).forEach(function(c){ P.pc.addIceCandidate(c).catch(function(){}); }); }).catch(function(){}); }
  else if(m.ty === "ice"){ if(!P){ C0.pice = C0.pice || {}; (C0.pice[u] = C0.pice[u] || []).push(d); return; } if(P.pc.remoteDescription && P.pc.remoteDescription.type) P.pc.addIceCandidate(d).catch(function(){}); else P.q.push(d); }
}
function closePc(u){ var P = CALL && CALL.pcs[u]; if(!P) return; try{ P.pc.close(); }catch(e){} if(P.el){ try{ P.el.srcObject = null; }catch(e){} } if(P.au){ try{ P.au.srcObject = null; P.au.remove(); }catch(e){} } delete CALL.pcs[u]; callUi(true); }
function attachMedia(u){ var P = CALL && CALL.pcs[u]; if(!P || !P.stream) return;
  if(!P.au){ P.au = document.createElement("audio"); P.au.autoplay = true; P.au.setAttribute("playsinline", ""); P.au.style.display = "none"; document.body.appendChild(P.au); }
  if(P.au.srcObject !== P.stream){ P.au.srcObject = P.stream; P.au.play().catch(function(){}); }
  if(SINK && P.au.setSinkId) P.au.setSinkId(SINK).catch(function(){});
  callUi(true); }
function meter(u, st){ try{ var a = ac(); if(!a) return; var src = a.createMediaStreamSource(st), an = a.createAnalyser(); an.fftSize = 256; src.connect(an); var buf = new Uint8Array(an.frequencyBinCount);
  (function lp(){ if(!CALL || !CALL.pcs[u]) return; an.getByteFrequencyData(buf); var s = 0; for(var i = 0; i < buf.length; i++) s += buf[i]; CALL.pcs[u].lvl = s / buf.length; setTimeout(lp, 150); })(); }catch(e){} }
function endCall(why, remote){
  var C0 = CALL; if(!C0) return; CALL = null; ringStop(); srStop(); try{ if(window.YQNATIVE) window.YQNATIVE.callEnd(); }catch(e){} clearTimeout(C0.noAns); clearInterval(C0.tm);
  try{ C0.unDoc && C0.unDoc(); }catch(e){} try{ C0.unSig && C0.unSig(); }catch(e){}
  Object.keys(C0.pcs).forEach(function(u){ var P = C0.pcs[u]; try{ P.pc.close(); }catch(e){} if(P.au){ try{ P.au.srcObject = null; P.au.remove(); }catch(e){} } });
  try{ C0.st.getTracks().forEach(function(t){ t.stop(); }); }catch(e){}
  var x = $("ycCall"); if(x) x.remove();
  var ref = FS.collection("calls").doc(C0.id), dur = C0.t0 ? Math.round((now() - C0.t0) / 1000) : 0;
  var stillIn = Object.keys(C0.joined || {}).filter(function(u){ return u !== MY; }), end = !C0.group || !stillIn.length;
  var left = {}; left["joined." + MY] = FV.delete();
  (end ? ref.update({ended: true, endAt: now(), why: why || "", dur: dur}) : ref.update(left)).catch(function(){});
  if(end && C0.meet) FS.collection("meets").doc(C0.meet).update({call: FV.delete()}).catch(function(){});
  if(C0.cid && CHATS[C0.cid]){
    if(!C0.group){ if(C0.out){ var txt = C0.t0 ? (C0.video ? "Video call" : "Voice call") : (why === "Declined" ? "Call declined" : why === "Busy" ? "Busy — not answered" : (C0.video ? "Missed video call" : "Missed voice call")); logCall(C0.cid, txt, dur, C0.video); } }
    else if(end) logCall(C0.cid, C0.t0 ? "Meeting ended" : "Meeting — no one joined", dur, C0.video);
  }
  if(VIEW === "chat") { var w = $("ycW"); if(w) w.removeAttribute("data-v"); paint(true); }
}
function logCall(cid, t, dur, video){ var c = CHATS[cid]; if(!c) return; var ref = FS.collection("chats").doc(cid).collection("m").doc(), at = now(); var u = {at: at, last: {t: "📞 " + t, by: MY, at: at, k: "call"}};
  (c.members || []).forEach(function(x){ if(x !== MY && /Missed|no one/.test(t)) u["n." + x] = FV.increment(1); });
  ref.set({k: "call", t: t, dur: dur || 0, video: !!video, by: MY, at: at}).then(function(){ return FS.collection("chats").doc(cid).update(u); }).catch(function(){}); }
var SINK = "";
function showCallUi(){ if(!CALL) return; var x = $("ycCall"); if(x){ x.classList.remove("min"); return; }
  x = document.createElement("div"); x.id = "ycCall"; document.body.appendChild(x); x.className = CALL.video ? "vid" : "";
  if(CALL.meet){ watchTx(CALL.meet); if(lsGet("yqc_sron") !== "0") setTimeout(srStart, 1500); }
  if(window.YQNATIVE){ CALL.spkOn = !!CALL.video; try{ window.YQNATIVE.callStart({speaker: CALL.spkOn}); }catch(e){} }
  x.innerHTML = '<div class="ycCtop"><button data-k="min" title="Minimise">⌄</button><span>' + (CALL.video ? "Video" : "Voice") + (CALL.group ? " meeting" : " call") + ' · YQI</span></div><div class="ycStage" id="ycStage"></div><div class="ycCinfo"><b>' + esc(CALL.title) + '</b><span id="ycCs">Calling…</span></div><video id="ycSelf" autoplay playsinline muted></video><div class="ycCbar" id="ycCbar"></div>';
  x.querySelector('[data-k="min"]').onclick = function(e){ e.stopPropagation(); x.classList.add("min"); };
  x.addEventListener("click", function(e){ if(x.classList.contains("min") && !e.target.closest("[data-k]")) x.classList.remove("min"); });
  var self = $("ycSelf"); if(CALL.st.getVideoTracks().length){ self.srcObject = CALL.st; self.play().catch(function(){}); } else self.style.display = "none";
  ctrlBar(); CALL.tm = setInterval(function(){ callUi(false); }, 400); callUi(true);
}
function ctrlBar(){ var b = $("ycCbar"); if(!b || !CALL) return; var hasV = CALL.st.getVideoTracks().length > 0, sinks = !!(HTMLMediaElement.prototype.setSinkId && navigator.mediaDevices && navigator.mediaDevices.enumerateDevices);
  b.innerHTML = (hasV ? '<button data-k="flip" title="Switch camera">' + IC.flip + '<small>Flip</small></button><button data-k="cam" class="' + (CALL.camOff ? "on" : "") + '" title="Camera">' + (CALL.camOff ? IC.camoff : IC.video) + '<small>' + (CALL.camOff ? "Cam off" : "Camera") + '</small></button>' : '') +
    '<button data-k="mute" class="' + (CALL.muted ? "on" : "") + '">' + IC.mic + '<small>' + (CALL.muted ? "Unmute" : "Mute") + '</small></button>' + (window.YQNATIVE ? '<button data-k="ear" class="' + (CALL.spkOn ? "on" : "") + '">' + IC.spk + '<small>' + (CALL.spkOn ? "Speaker" : "Earpiece") + '</small></button>' : '') + (sinks && !/Android|iPhone|iPad/i.test(navigator.userAgent) ? '<button data-k="spk">' + IC.spk + '<small>Output</small></button>' : '') +
    (CALL.meet ? '<button data-k="notes" class="' + (SR ? "on" : "") + '" title="Agenda and notes">' + IL.notes + '<small>Notes</small></button>' : '') + (CALL.group ? '<button data-k="ring" title="Ring everyone not here">' + IC.plus + '<small>Ring all</small></button>' : '') + '<button data-k="end" class="end">' + IC.hang + '<small>End</small></button>';
  b.querySelectorAll("[data-k]").forEach(function(el){ el.onclick = function(e){ e.stopPropagation(); var k = el.getAttribute("data-k"); if(!CALL) return;
    if(k === "end") return endCall("");
    if(k === "mute"){ CALL.muted = !CALL.muted; CALL.st.getAudioTracks().forEach(function(t){ t.enabled = !CALL.muted; }); }
    if(k === "cam"){ CALL.camOff = !CALL.camOff; CALL.st.getVideoTracks().forEach(function(t){ t.enabled = !CALL.camOff; }); Object.keys(CALL.pcs).forEach(function(u){ sig(u, "cam", {off: CALL.camOff}); }); var sv = $("ycSelf"); if(sv) sv.style.opacity = CALL.camOff ? ".25" : "1"; }
    if(k === "flip") return flipCam();
    if(k === "ring"){ ringAll(CALL.members); toast("Ringing everyone who is not in the meeting"); }
    if(k === "spk") return pickSink();
    if(k === "notes") return notesPanel();
    if(k === "ear"){ CALL.spkOn = !CALL.spkOn; try{ window.YQNATIVE.setSpeaker({on: CALL.spkOn}); }catch(x){} }
    ctrlBar(); }; }); }
function flipCam(){ var C0 = CALL; if(!C0) return; C0.face = C0.face === "user" ? "environment" : "user";
  navigator.mediaDevices.getUserMedia({video: {facingMode: {exact: C0.face}, width: {ideal: 640}, height: {ideal: 480}}}).catch(function(){ return navigator.mediaDevices.getUserMedia({video: {facingMode: C0.face}}); }).then(function(ns){
    var nt = ns.getVideoTracks()[0]; if(!nt || !CALL) return; var old = C0.st.getVideoTracks()[0];
    Object.keys(C0.pcs).forEach(function(u){ C0.pcs[u].pc.getSenders().forEach(function(s){ if(s.track && s.track.kind === "video") s.replaceTrack(nt).catch(function(){}); }); });
    if(old){ C0.st.removeTrack(old); old.stop(); } C0.st.addTrack(nt); nt.enabled = !C0.camOff; var sv = $("ycSelf"); if(sv){ sv.srcObject = C0.st; sv.classList.toggle("back", C0.face !== "user"); } }).catch(function(){ toast("Could not switch camera"); }); }
function pickSink(){ navigator.mediaDevices.enumerateDevices().then(function(ds){ var outs = ds.filter(function(d){ return d.kind === "audiooutput"; }); if(outs.length < 2){ toast("Only one speaker found"); return; }
  var i = outs.findIndex(function(d){ return d.deviceId === SINK; }); var n = outs[(i + 1) % outs.length]; SINK = n.deviceId; Object.keys(CALL.pcs).forEach(function(u){ var P = CALL.pcs[u]; if(P.au && P.au.setSinkId) P.au.setSinkId(SINK).catch(function(){}); }); toast("Sound: " + (n.label || "speaker " + ((i + 1) % outs.length + 1))); }).catch(function(){}); }
function callUi(rebuild){
  var C0 = CALL, x = $("ycCall"); if(!C0 || !x) return; var j = C0.joined || {}, others = Object.keys(j).filter(function(u){ return u !== MY; });
  var st = $("ycCs"); if(st){ var conn = others.some(function(u){ return C0.pcs[u] && C0.pcs[u].state === "connected"; });
    st.textContent = C0.t0 ? (conn ? fmtDur((now() - C0.t0) / 1000) : "Connecting…") + (C0.group ? " · " + (others.length + 1) + " in call" : "") : (C0.out ? (C0.group ? "Ringing everyone…" : "Ringing…") : "Connecting…"); }
  var stage = $("ycStage"); if(!stage) return;
  var show = C0.group ? others.slice() : [others[0] || (C0.members || []).filter(function(u){ return u !== MY; })[0]];
  var key = show.join(",") + "|" + show.map(function(u){ var P = C0.pcs[u]; return P && P.stream && P.stream.getVideoTracks().length && !P.camOff ? "v" : "a"; }).join("");
  x.classList.toggle("has-vid", /v/.test(key.split("|")[1] || ""));
  if(rebuild || stage.getAttribute("data-k") !== key){ stage.setAttribute("data-k", key); stage.className = "ycStage n" + Math.min(show.length, 6);
    stage.innerHTML = show.map(function(u){ var P = C0.pcs[u], vid = P && P.stream && P.stream.getVideoTracks().length && !P.camOff; return '<div class="ycTile" data-u="' + u + '">' + (vid ? '<video autoplay playsinline muted></video>' : avU(u, show.length > 2 ? 76 : 130)) + '<small>' + esc(fullName(u).split(" ")[0]) + '</small></div>'; }).join("") || '<div class="ycTile">' + avU(MY, 120) + '<small>Waiting for others…</small></div>';
    stage.querySelectorAll(".ycTile").forEach(function(t){ var u = t.getAttribute("data-u"), v = t.querySelector("video"), P = C0.pcs[u]; if(v && P && P.stream){ v.srcObject = P.stream; v.play().catch(function(){}); } }); }
  stage.querySelectorAll(".ycTile").forEach(function(t){ var P = C0.pcs[t.getAttribute("data-u")]; t.classList.toggle("talk", !!(P && P.lvl > 16)); });
}

// ---------- styles ----------
function wallSvg(dark){
  var leaf = dark ? "%23182a16" : "%23dde8d1", leaf2 = dark ? "%23142312" : "%23e4edda", tx = dark ? "%23172815" : "%23d7e3cb";
  return "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cg fill='" + leaf + "'%3E%3Cpath d='M22 52c-6-18 2-34 26-44 2 22-8 36-26 44z'/%3E%3Cpath d='M26 54c10-12 24-18 40-18-6 14-22 22-40 18z' fill='" + leaf2 + "'/%3E%3Cpath d='M112 132c-5-15 2-28 22-37 2 18-7 30-22 37z'/%3E%3Cpath d='M115 134c8-10 20-15 34-15-5 12-18 18-34 15z' fill='" + leaf2 + "'/%3E%3C/g%3E%3Ctext x='92' y='42' font-family='Arial' font-weight='900' font-size='15' fill='" + tx + "'%3EYQI%3C/text%3E%3Ctext x='14' y='118' font-family='Arial' font-weight='900' font-size='11' fill='" + tx + "'%3EYQI%3C/text%3E%3Ccircle cx='70' cy='92' r='2' fill='" + tx + "'/%3E%3Ccircle cx='140' cy='70' r='1.6' fill='" + tx + "'/%3E%3C/svg%3E\")"; }
function css(){
  if($("ycCss")) return; var s = document.createElement("style"); s.id = "ycCss";
  var G = "#2F5A1A", G2 = "#3d9a1f";
  s.textContent = [
  "#ycFab{position:fixed;left:16px;bottom:18px;z-index:2147482000;width:58px;height:58px;border-radius:18px;border:0;background:linear-gradient(135deg,#5BA32A," + G + ");color:#fff;box-shadow:0 10px 26px rgba(20,50,10,.45);display:grid;place-items:center;cursor:pointer;transition:transform .2s}#ycFab:active{transform:scale(.92)}#ycFab svg{width:28px;height:28px}",
  "#ycFab b{position:absolute;top:-6px;right:-6px;min-width:22px;height:22px;padding:0 6px;border-radius:11px;background:#e5484d;color:#fff;font:800 12px/22px Manrope,system-ui,sans-serif;border:2px solid #fff;box-sizing:border-box}",
  "html.ycLock,html.ycLock body{overflow:hidden!important}",
  "#ycP .ycMsg.th,#ycP .ycMsg.me{width:auto;height:auto;border-radius:0;object-fit:initial;display:flex}",
  ".ycMenP{position:absolute;left:8px;right:8px;bottom:100%;margin-bottom:6px;background:var(--bg);border:1px solid var(--ln);border-radius:14px;box-shadow:0 10px 28px rgba(0,0,0,.18);max-height:260px;overflow-y:auto;z-index:5;padding:4px}.ycMenP button{display:flex;gap:10px;align-items:center;width:100%;border:0;background:none;padding:7px 8px;border-radius:10px;cursor:pointer;text-align:left;color:var(--tx);font-family:inherit}.ycMenP button:hover{background:var(--bg2)}.ycMenP b{display:flex;align-items:center;font-size:14px}.ycMenP small{display:block;font-size:12px;color:var(--tx2)}.ycMen.me{background:#e3f0fb;border-radius:5px;padding:0 3px}",
  ".ycView.ycPE{position:fixed;inset:0;z-index:2147483300;background:#0b0f0a;display:flex;flex-direction:column;place-items:stretch;font-family:Manrope,system-ui,sans-serif;color:#fff;touch-action:none}.ycPEt{display:flex;align-items:center;gap:6px;padding:10px 10px;padding-top:max(10px,env(safe-area-inset-top))}.ycPEt button,.ycPEtools button{width:42px;height:42px;border-radius:50%;border:0;background:rgba(255,255,255,.08);color:#fff;display:grid;place-items:center;cursor:pointer}.ycPEt button svg{width:22px;height:22px}.ycPEtools{margin-left:auto;display:flex;gap:6px}.ycPEtools button.on{background:#3d9a1f}.ycPEn{font-weight:700;font-size:14px;opacity:.8;margin-left:6px}.ycPEm{flex:1 1 0;position:relative;overflow:hidden;min-height:0}.ycPEm canvas{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:block;box-shadow:0 6px 30px rgba(0,0,0,.5);touch-action:none}.ycPEc{position:absolute;border:2px solid #fff;box-shadow:0 0 0 9999px rgba(0,0,0,.55);cursor:move;touch-action:none}.ycPEc i{position:absolute;width:22px;height:22px;border:4px solid #fff;background:transparent}.ycPEc i[data-h=nw]{left:-4px;top:-4px;border-right:0;border-bottom:0;cursor:nwse-resize}.ycPEc i[data-h=ne]{right:-4px;top:-4px;border-left:0;border-bottom:0;cursor:nesw-resize}.ycPEc i[data-h=sw]{left:-4px;bottom:-4px;border-right:0;border-top:0;cursor:nesw-resize}.ycPEc i[data-h=se]{right:-4px;bottom:-4px;border-left:0;border-top:0;cursor:nwse-resize}",
  ".ycPEcol{display:flex;gap:12px;justify-content:center;padding:8px}.ycPEcol button{width:28px;height:28px;border-radius:50%;border:2px solid rgba(255,255,255,.5);cursor:pointer}.ycPEcol button.on{transform:scale(1.25);border-color:#fff;box-shadow:0 0 0 2px #3d9a1f}.ycPEcb{display:flex;justify-content:space-between;padding:8px 16px}.ycPEcb button{border:0;background:rgba(255,255,255,.1);color:#fff;border-radius:12px;padding:10px 20px;font:700 15px inherit;font-family:inherit;cursor:pointer}.ycPEcb button.ok{background:#3d9a1f}.ycPEth{display:flex;gap:6px;justify-content:center;padding:4px 10px;overflow-x:auto}.ycPEth button{width:46px;height:46px;border-radius:8px;border:2px solid transparent;padding:0;overflow:hidden;background:#222;flex:none;cursor:pointer}.ycPEth button.on{border-color:#3d9a1f}.ycPEth img{width:100%;height:100%;object-fit:cover}.ycPEb{display:flex;gap:8px;align-items:center;padding:10px 12px;padding-bottom:max(12px,env(safe-area-inset-bottom))}.ycPEb input{flex:1;border:0;border-radius:24px;background:#1f2a1c;color:#fff;padding:13px 16px;font:15px inherit;font-family:inherit;outline:none}.ycPEb button{width:52px;height:52px;border-radius:50%;border:0;background:#3d9a1f;color:#fff;display:grid;place-items:center;cursor:pointer;flex:none}.ycPEb button svg{width:24px;height:24px}",
  ".ycVb{flex:none;vertical-align:-2px;margin-left:4px;display:inline-block}.ycVl{display:inline-block;margin-left:6px;font-size:9.5px;font-weight:800;letter-spacing:.5px;border-radius:6px;padding:1px 5px;vertical-align:2px;line-height:14px}.ycVl.mg{background:#fbf1d6;color:#8a6200}.ycVl.cu{background:#efe7fd;color:#6d28d9}.ycAv.ycRing.gold{box-shadow:0 0 0 2px var(--bg,#fff),0 0 0 4px #d4a637}.ycAv.ycRing.cust{box-shadow:0 0 0 2px var(--bg,#fff),0 0 0 4px #7c3aed}",
  ".ycSteps{margin:10px 14px 4px;padding:14px;border:1px solid var(--ln);border-radius:14px;background:var(--bg2)}.ycStT{display:flex;align-items:center;gap:6px;font-size:14px}.ycStT .ycVb{margin:0}.ycBar{height:8px;border-radius:9px;background:var(--ln);overflow:hidden;margin-top:8px}.ycBar i{display:block;height:100%;background:linear-gradient(90deg,#7DB82E,#3d9a1f);border-radius:9px}.ycStL{display:grid;grid-template-columns:1fr 1fr;gap:3px 10px;margin-top:10px;font-size:12.5px}.ycStL span{background:none!important;padding:0!important}.ycStL .ok{color:var(--tx2)}.ycStL .no{color:#c8373d;font-weight:700}",
  ".ycEmpS{margin-left:8px;font-size:11px;font-weight:800;border-radius:7px;padding:2px 7px;background:var(--ln);color:var(--tx2)}.ycEmpS.ok{background:#e3f4d6;color:#2f7a14}.ycEmpS.wt{background:#fff3d6;color:#8a6200}.ycEmpS.no{background:#fde4e4;color:#b42318}.ycEmpR{display:flex;gap:10px;margin:10px 0 4px}.ycEmpC{flex:1;aspect-ratio:1.586;border:1.5px dashed #b9c9ab;border-radius:12px;background:var(--bg2);display:grid;place-items:center;position:relative;overflow:hidden;cursor:pointer;color:var(--tx2);padding:0}.ycEmpC img{width:100%;height:100%;object-fit:cover}.ycEmpC small{position:absolute;left:0;right:0;bottom:0;background:rgba(0,0,0,.45);color:#fff;font-size:11px;font-weight:700;padding:3px}.ycEmpC span svg{width:26px;height:26px}",
  ".ycStaffN{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:12px 14px 4px}.ycStaffN div{background:var(--bg2);border:1px solid var(--ln);border-radius:12px;padding:10px 6px;text-align:center}.ycStaffN b{display:block;font-size:20px;color:#2f7a14}.ycStaffN span{font-size:11.5px;color:var(--tx2);font-weight:700}.ycRow .ycMk+.ycMk{margin-left:6px}",
  "#ycP{position:fixed;inset:0;z-index:2147482100;pointer-events:none;font-family:Manrope,Inter,system-ui,sans-serif;--bg:#fff;--bg2:#f2f5ee;--ln:#e6ece0;--tx:#16230f;--tx2:#667560;--in:#fff;--me:#d9f6c5;--th:#fff;--hd:linear-gradient(135deg,#1f4a16,#0f240d)}",
  "#ycP.dk{--bg:#0f1a0e;--bg2:#0b140a;--ln:#1d2c1b;--tx:#e5efdc;--tx2:#93a688;--in:#1a2918;--me:#24451c;--th:#1a2918}",
  "#ycP .ycBg{position:absolute;inset:0;background:rgba(6,19,10,.45);opacity:0;transition:opacity .25s}#ycP .ycW{position:absolute;top:0;right:0;bottom:0;width:min(460px,100%);background:var(--bg);color:var(--tx);display:flex;flex-direction:column;transform:translateX(105%);transition:transform .3s cubic-bezier(.2,.9,.3,1);box-shadow:-20px 0 50px rgba(0,0,0,.25);overflow:hidden}",
  "#ycP.on{pointer-events:auto}#ycP.on .ycBg{opacity:1}#ycP.on .ycW{transform:none}#ycP button{font-family:inherit;color:inherit}#ycP *{box-sizing:border-box}",
  "#ycP .ycHd{display:flex;align-items:center;gap:4px;padding:8px 6px 8px 8px;padding-top:max(8px,env(safe-area-inset-top));background:var(--hd);color:#fff;min-height:60px;flex:none}#ycP .ycHd.home{padding-left:16px}",
  "#ycP .ycHt{flex:1;min-width:0;display:flex;flex-direction:column;padding:0 4px}#ycP .ycHt b{font-size:17px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}#ycP .ycHt span{font-size:12.5px;color:#cfe8b0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}",
  "#ycP .ycBrand{font-size:21px!important;letter-spacing:.3px}#ycP .ycBrand em{font-style:normal;color:#a6dd5e}#ycP .ycQin{width:100%;border:0;border-radius:20px;padding:9px 14px;font:500 15px inherit;font-family:inherit;outline:0;background:rgba(255,255,255,.95);color:#16230f}",
  "#ycP .ycIb{border:0;background:transparent;width:42px;height:42px;border-radius:50%;display:grid;place-items:center;cursor:pointer;font-size:19px;padding:0;flex:none}#ycP .ycHd .ycIb{color:#fff}#ycP .ycIb:hover{background:rgba(127,127,127,.15)}#ycP .ycHav{width:auto;height:auto;margin-left:-2px}",
  ".ycAv{flex:none;border-radius:50%;color:#fff;display:inline-grid;place-items:center;font-weight:800;position:relative;letter-spacing:.4px;font-family:Manrope,Inter,system-ui,sans-serif;overflow:visible}.ycAv img{width:100%!important;height:100%!important;max-width:none!important;aspect-ratio:1/1;border-radius:50%!important;object-fit:cover!important;display:block}.ycAv .ycOn{position:absolute;right:0;bottom:0;width:26%;height:26%;min-width:11px;min-height:11px;border-radius:50%;background:#31c46c;border:2.5px solid #fff;box-sizing:border-box}",
  "#ycP .ycTabs{display:flex;background:#0f240d;flex:none}#ycP .ycTabs button{flex:1;border:0;background:none;color:#a9c79a!important;padding:12px 0 11px;font-weight:800;font-size:14.5px;border-bottom:3px solid transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px}#ycP .ycTabs button.on{color:#fff!important;border-color:#9be15d}",
  "#ycP .ycTn{font-style:normal;min-width:19px;height:19px;border-radius:10px;background:#9be15d;color:#0f240d;font:800 11px/19px inherit;padding:0 5px}#ycP #ycTabN_updates{min-width:9px;width:9px;height:9px;padding:0}",
  "#ycP .ycScroll{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;background:var(--bg);overscroll-behavior:contain}",
  "#ycP .ycChips{display:flex;gap:8px;padding:10px 14px 4px}#ycP .ycChips button{border:0;border-radius:18px;padding:7px 14px;background:var(--bg2);color:var(--tx2)!important;font-weight:700;font-size:13.5px;cursor:pointer}#ycP .ycChips button.on{background:#dff3cf;color:#1d5a12!important}#ycP.dk .ycChips button.on{background:#24451c;color:#c9f0a8!important}",
  "#ycP .ycRow{display:flex;align-items:center;gap:13px;width:100%;border:0;background:var(--bg);padding:10px 16px;text-align:left;cursor:pointer;color:var(--tx);user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}#ycP .ycRow:hover{background:var(--bg2)}#ycP .ycRow.red b{color:#d0393f}",
  "#ycP .ycRm{flex:1;min-width:0;border-bottom:1px solid var(--ln);padding:4px 0 12px;margin-bottom:-10px}#ycP .ycR1,#ycP .ycR2{display:flex;align-items:center;justify-content:space-between;gap:8px}#ycP .ycR1 b{font-size:16px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#ycP .ycR1 b small{font-weight:600;color:var(--tx2);font-size:12px}",
  "#ycP .ycR1 time{font-size:12px;color:var(--tx2);flex:none}#ycP .ycR1 time.nw{color:" + G2 + ";font-weight:800}#ycP .ycR1 time em{color:#2f9a4f;font-style:normal;font-weight:700}#ycP .ycR1 time em.adm{color:" + G2 + ";border:1px solid " + G2 + ";border-radius:6px;padding:1px 6px;font-size:11px}",
  "#ycP .ycR2 span{font-size:14px;color:var(--tx2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:3px;flex:1;min-width:0}#ycP .ycTy{color:" + G2 + "!important;font-weight:700}#ycP .ycMi{color:var(--tx2);font-style:normal;flex:none;display:grid}",
  "#ycP .ycN{flex:none;min-width:21px;height:21px;padding:0 6px;border-radius:11px;background:" + G2 + ";color:#fff;font:800 11.5px/21px inherit;font-style:normal;text-align:center}#ycP .ycN.mu{background:#9aa890}",
  "#ycP .ycSel .ycCkb{width:24px;height:24px;border-radius:50%;border:2px solid #b9c9ab;display:grid;place-items:center;color:#fff;font-style:normal;font-weight:800;flex:none}#ycP .ycSel.on .ycCkb{background:" + G2 + ";border-color:" + G2 + "}",
  "#ycP .ycTk{font-style:normal;color:#9aa890;letter-spacing:-3.5px;margin-right:4px;font-size:12px;font-weight:700}#ycP .ycTk.sn{color:#34b7f1}",
  "#ycP .ycEmpty{padding:44px 26px;text-align:center;color:var(--tx2);display:flex;flex-direction:column;gap:6px}#ycP .ycEmpty b{color:var(--tx);font-size:17px}#ycP .ycEmpty.sm{padding:22px}",
  "#ycP .ycSec{padding:16px 16px 6px;font-size:13px;font-weight:800;color:var(--tx2);background:var(--bg)}#ycP .ycArchRow .ycRm{border:0}",
  "#ycP .ycFab2{position:absolute;right:18px;bottom:max(20px,env(safe-area-inset-bottom));width:58px;height:58px;border-radius:18px;border:0;background:" + G2 + ";color:#fff!important;display:grid;place-items:center;box-shadow:0 8px 20px rgba(30,80,20,.35);cursor:pointer;z-index:3}#ycP .ycFab2 i{position:absolute;font-style:normal;font-weight:900;font-size:15px;right:13px;top:11px;color:#fff}#ycP .ycFab2.sm{width:44px;height:44px;border-radius:14px;background:var(--bg2);color:var(--tx)!important;position:static;font-size:20px;box-shadow:0 4px 12px rgba(0,0,0,.15)}",
  "#ycP .ycFab2s{position:absolute;right:18px;bottom:max(20px,env(safe-area-inset-bottom));display:flex;flex-direction:column;align-items:center;gap:14px;z-index:3}#ycP .ycFab2s .ycFab2:not(.sm){position:static}",
  "#ycP .ycFoot{padding:10px 14px;padding-bottom:max(10px,env(safe-area-inset-bottom));background:var(--bg);border-top:1px solid var(--ln);flex:none}#ycP .ycFoot.two{display:flex;gap:10px}#ycP .ycPb{width:100%;border:0;border-radius:14px;padding:14px;background:linear-gradient(135deg,#4c8a2a," + G + ");color:#fff!important;font-weight:800;font-size:15.5px;cursor:pointer;box-shadow:0 8px 20px rgba(47,90,26,.25)}#ycP .ycPb:disabled{opacity:.45}#ycP .ycPb.ghost{background:var(--bg2);color:" + G + "!important;box-shadow:none}",
  "#ycP .ycSearch{padding:8px 12px;background:var(--bg);border-bottom:1px solid var(--ln);flex:none}#ycP .ycSearch input{width:100%;border:0;background:var(--bg2);color:var(--tx);border-radius:22px;padding:11px 16px;font:500 15px inherit;font-family:inherit;outline:0}",
  "#ycP .ycForm{padding:18px 18px 8px;display:flex;flex-direction:column}#ycP .ycForm label{font-size:12px;font-weight:800;color:var(--tx2);margin:12px 0 6px;text-transform:uppercase;letter-spacing:.6px}#ycP .ycForm input,#ycP .ycForm select{border:1.5px solid var(--ln);background:var(--bg2);color:var(--tx);border-radius:12px;padding:12px;font:500 15px inherit;font-family:inherit;outline:0;width:100%}#ycP .ycForm input:focus{border-color:#5BA32A}",
  "#ycP .ycForm .ycChk{display:flex;align-items:center;gap:10px;text-transform:none;font-size:14px;color:var(--tx);letter-spacing:0;margin-top:16px}#ycP .ycForm .ycChk input{width:20px;height:20px;accent-color:" + G2 + "}#ycP .ycAt{position:relative}#ycP .ycAt i{position:absolute;left:12px;top:50%;transform:translateY(-50%);font-style:normal;color:var(--tx2);font-weight:700}#ycP .ycAt input{padding-left:28px}#ycP .ycErr{color:#c0392b;font-size:13px;min-height:18px;margin:12px 0 8px}",
  "#ycP .ycMemb{display:flex;flex-wrap:wrap;gap:14px}#ycP .ycMemb span{display:flex;flex-direction:column;align-items:center;gap:4px;width:58px;cursor:pointer}#ycP .ycMemb small{font-size:11.5px;color:var(--tx2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:58px}#ycP .ycAddP{color:" + G2 + "}#ycP .ycAddP svg{width:40px;height:40px;padding:8px;border-radius:50%;border:2px dashed " + G2 + "}",
  "#ycP .ycGph{width:96px;height:96px;border-radius:50%;background:var(--bg2);align-self:center;display:grid;place-items:center;color:var(--tx2);cursor:pointer;overflow:hidden}#ycP .ycGph img{width:100%;height:100%;object-fit:cover}",
  "#ycP .ycCover{height:150px;background:linear-gradient(135deg,#2c5a1f,#0f240d) center/cover;position:relative;cursor:pointer;flex:none}#ycP .ycCover.sm{height:120px;cursor:default}#ycP .ycCoverB{position:absolute;right:10px;bottom:10px;background:rgba(0,0,0,.45);color:#fff;border-radius:16px;padding:5px 10px;font-size:12px;font-weight:700;display:flex;align-items:center;gap:6px}#ycP .ycCoverB svg{width:16px;height:16px}",
  "#ycP .ycProf{display:flex;flex-direction:column;align-items:center;margin-top:-58px;padding:0 16px 14px;text-align:center;gap:3px;border-bottom:8px solid var(--bg2)}#ycP .ycProfAv{position:relative;border:4px solid var(--bg);border-radius:50%;cursor:pointer;background:var(--bg)}#ycP .ycCamB{position:absolute;right:2px;bottom:2px;width:36px;height:36px;border-radius:50%;background:" + G2 + ";color:#fff;display:grid;place-items:center;border:3px solid var(--bg)}#ycP .ycCamB svg{width:18px;height:18px}",
  "#ycP .ycProf h2{margin:8px 0 0;font-size:22px}#ycP .ycProf>span{color:var(--tx2);font-size:14px}#ycP .ycProf p{margin:6px 0;font-size:14.5px;color:var(--tx)}#ycP .ycSoft{font-size:13px!important}#ycP .ycProf .ycForm{width:100%;padding:6px 2px 0;text-align:left}",
  "#ycP .ycActs{display:flex;gap:10px;margin-top:14px;justify-content:center;flex-wrap:wrap}#ycP .ycActs button{border:1px solid var(--ln);background:var(--bg);border-radius:14px;width:76px;padding:10px 4px;display:flex;flex-direction:column;align-items:center;gap:4px;color:" + G2 + "!important;cursor:pointer}#ycP .ycActs span{font-size:12px;font-weight:800}",
  "#ycP .ycGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:3px;padding:0 12px 10px}#ycP .ycGrid span{aspect-ratio:1;overflow:hidden;border-radius:6px;cursor:pointer;background:var(--bg2)}#ycP .ycGrid img{width:100%;height:100%;object-fit:cover}#ycP .ycSi{width:46px;height:46px;display:grid;place-items:center;font-size:21px;flex:none;color:var(--tx2)}",
  // messages
  "#ycP .ycMsgs{padding:8px 8px 6px;background-color:#eaf0e3;background-image:" + wallSvg(false) + ";background-size:160px}#ycP.dk .ycMsgs{background-color:#0b140a;background-image:" + wallSvg(true) + "}#ycP .ycMsgs.ycWall-plain{background-image:none}",
  "#ycP .ycMsgs.ycWall-weave{background-image:repeating-linear-gradient(45deg,rgba(47,90,26,.05) 0 2px,transparent 2px 10px),repeating-linear-gradient(-45deg,rgba(47,90,26,.05) 0 2px,transparent 2px 10px)}",
  "#ycP .ycDay{text-align:center;margin:12px 0 8px}#ycP .ycDay span{display:inline-block;background:var(--th);color:var(--tx2);font-size:12px;font-weight:700;padding:5px 12px;border-radius:9px;box-shadow:0 1px 1px rgba(0,0,0,.08)}#ycP .ycDay.sys span{background:#fff6d6;color:#6b5a1a;font-weight:600;max-width:85%}#ycP.dk .ycDay.sys span{background:#2e2a15;color:#e8d79a}",
  "#ycP .ycSafe{text-align:center;margin:10px 0}#ycP .ycSafe span{display:inline-block;background:#fff6d6;color:#6b5a1a;font-size:12.5px;padding:7px 12px;border-radius:9px}#ycP .ycMore{text-align:center;margin:6px 0}#ycP .ycMore button{border:0;background:var(--th);border-radius:14px;padding:6px 14px;font-weight:700;font-size:12.5px;cursor:pointer;color:" + G2 + "!important}",
  "#ycP .ycMsg{display:flex;align-items:flex-end;gap:6px;margin:1px 0;padding:0 2px}#ycP .ycMsg.f{margin-top:8px}#ycP .ycMsg.me{justify-content:flex-end}#ycP .ycMsg.hasre{margin-bottom:16px}#ycP .ycMav{width:28px;flex:none;align-self:flex-start}",
  "#ycP .ycB{position:relative;max-width:min(78%,340px);padding:6px 8px 5px 9px;border-radius:12px;box-shadow:0 1px 1px rgba(0,0,0,.1);font-size:15px;line-height:1.38;color:var(--tx);overflow-wrap:anywhere;display:block;min-height:0;height:auto;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}#ycP .ycMsg.me .ycB{background:var(--me)}#ycP .ycMsg.th .ycB{background:var(--th)}",
  "#ycP .ycMsg.me.f .ycB{border-top-right-radius:3px}#ycP .ycMsg.th.f .ycB{border-top-left-radius:3px}#ycP .ycB.media{padding:3px;max-width:none;width:min-content}#ycP .ycB.media .ycTxt{padding:4px 6px 0}#ycP .ycB.media .ycMeta{padding-right:5px}",
  "#ycP .ycWho{font-size:13px;font-weight:800;margin:0 0 2px}#ycP .ycB.media .ycWho{padding:3px 6px 2px}#ycP .ycTxt{display:inline;white-space:normal}#ycP .ycTxt.big{font-size:40px;line-height:1.15}#ycP .ycTxt a{color:#1a6fb0}#ycP .ycTxt mark{background:#ffe066;border-radius:3px}#ycP .ycDel{color:var(--tx2);font-style:italic}#ycP .ycMen{color:#1a6fb0;font-weight:700}",
  "#ycP .ycMeta{float:right;font-size:11px;color:var(--tx2);margin:6px 0 -3px 10px;white-space:nowrap;line-height:1;display:inline-flex;align-items:center;gap:2px}#ycP .ycStar{color:#d9a400;font-style:normal;display:inline-grid;margin-right:2px}#ycP .ycMeta:after{content:'';clear:both}",
  "#ycP .ycQuote{display:flex;flex-direction:column;background:rgba(0,0,0,.06);border-left:4px solid " + G2 + ";border-radius:7px;padding:5px 8px;margin:0 0 4px;cursor:pointer;font-size:13px;max-width:100%}#ycP .ycQuote b{font-size:12.5px}#ycP .ycQuote span{color:var(--tx2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#ycP .ycFw{font-size:12px;color:var(--tx2);font-style:italic;margin-bottom:2px}",
  "#ycP .ycImg{position:relative;border-radius:9px;overflow:hidden;background:#cfdcc4;cursor:pointer;flex:none}#ycP .ycImg img{width:100%;height:100%;object-fit:cover;display:block}#ycP .ycOver{position:absolute;right:6px;bottom:5px;color:#fff;font-size:11px;background:linear-gradient(transparent,rgba(0,0,0,.45));padding:10px 4px 1px 18px;border-radius:0 0 8px 0;display:flex;gap:3px;align-items:center}#ycP .ycOver .ycTk{color:#fff}#ycP .ycOver .ycTk.sn{color:#7fd8ff}",
  "#ycP .ycSpin{position:absolute;left:50%;top:50%;width:38px;height:38px;margin:-19px;border-radius:50%;border:4px solid rgba(255,255,255,.4);border-top-color:#fff;animation:ycSp 1s linear infinite}@keyframes ycSp{to{transform:rotate(360deg)}}",
  "#ycP .ycVn{display:flex;align-items:center;gap:8px;min-width:230px;padding:2px 2px 0}#ycP .ycPlay.heard{background:#2f86d6!important}#ycP .ycPlay{width:38px;height:38px;border-radius:50%;border:0;background:" + G2 + ";color:#fff!important;font-size:14px;cursor:pointer;flex:none}#ycP .ycWave{flex:1;height:28px;display:flex;align-items:center;gap:2px}#ycP .ycWave i{flex:1;background:#a9bf98;border-radius:2px;min-height:3px}#ycP .ycWave i.p{background:" + G + "}#ycP.dk .ycWave i.p{background:#a6dd5e}#ycP .ycVn>span{font-size:11.5px;color:var(--tx2);min-width:30px}",
  "#ycP .ycFile{display:flex;align-items:center;gap:10px;border:0;background:rgba(0,0,0,.05);border-radius:9px;padding:9px 10px;cursor:pointer;text-align:left;width:250px}#ycP .ycFic{width:40px;height:44px;border-radius:6px;color:#fff;font:800 10px/44px inherit;text-align:center;flex:none;display:inline-block}#ycP .ycFn{display:flex;flex-direction:column;min-width:0;flex:1}#ycP .ycFn b{font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#ycP .ycFn small{font-size:12px;color:var(--tx2)}#ycP .ycDlI{width:30px;height:30px;border-radius:50%;border:1.5px solid var(--tx2);display:grid;place-items:center;color:var(--tx2);font-size:14px;flex:none}",
  "#ycP .ycCallM{display:flex;align-items:center;gap:10px;padding:3px 4px;cursor:pointer;min-width:180px}#ycP .ycCallIc{width:38px;height:38px;border-radius:50%;background:rgba(61,154,31,.15);color:" + G2 + ";display:grid;place-items:center}#ycP .ycCallIc.miss{background:rgba(229,72,77,.12);color:#e5484d}#ycP .ycCallM>span:last-child{display:flex;flex-direction:column;justify-content:center;line-height:1.25;min-width:0}#ycP .ycCallIc{flex:none;display:grid!important;place-items:center}#ycP .ycCallIc svg{width:20px!important;height:20px!important;display:block}#ycP .ycCallM b{font-size:14.5px}#ycP .ycCallM small{font-size:12px;color:var(--tx2)}",
  "#ycP .ycMeetM{display:flex;flex-direction:column;gap:3px;padding:4px;min-width:210px}#ycP .ycMeetM small{color:var(--tx2)}#ycP .ycMeetM button{margin-top:6px;border:0;border-radius:10px;padding:9px;background:" + G2 + ";color:#fff!important;font-weight:800;cursor:pointer}",
  "#ycP .ycRe{position:absolute;bottom:-15px;right:8px;background:var(--th);border-radius:12px;padding:1px 6px;font-size:14px;box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:pointer;white-space:nowrap}#ycP .ycMsg.th .ycRe{right:auto;left:8px}#ycP .ycRe small{font-size:11px;color:var(--tx2);margin-left:2px}",
  "#ycP .ycFlash .ycB{animation:ycFl 1.4s}@keyframes ycFl{30%{box-shadow:0 0 0 4px rgba(155,225,93,.8)}}",
  "#ycP .ycLive{background:" + G2 + ";color:#fff;text-align:center;font-weight:800;font-size:13px;padding:7px;cursor:pointer}",
  // input
  "#ycP .ycIn{display:flex;align-items:flex-end;gap:6px;padding:6px 6px;padding-bottom:max(7px,env(safe-area-inset-bottom));background:transparent;flex:none;position:relative}#ycP .ycMsgs+#ycReplyBar+.ycIn{background:inherit}",
  "#ycP .ycPill{flex:1;display:flex;align-items:flex-end;background:var(--in);border-radius:26px;box-shadow:0 1px 2px rgba(0,0,0,.12);padding:2px 4px 2px 16px;min-height:50px}#ycP .ycPill textarea{flex:1;resize:none;border:0;padding:13px 0 12px;height:48px;min-height:0!important;box-shadow:none!important;font:500 16px/1.35 inherit;font-family:inherit;outline:0;background:transparent;color:var(--tx);max-height:130px}#ycP .ycPill .ycIb{color:var(--tx2);width:42px;height:46px}",
  "#ycP .ycSend{flex:none;width:52px;height:52px;border-radius:50%;border:0;background:" + G2 + ";color:#fff!important;display:grid;place-items:center;cursor:pointer;box-shadow:0 3px 8px rgba(30,80,20,.3)}#ycP .ycSend.big{position:absolute;right:20px;bottom:24px}",
  "#ycP .ycRec{flex:1;display:flex;align-items:center;gap:8px;background:var(--in);border-radius:26px;height:52px;padding:0 10px 0 4px;box-shadow:0 1px 2px rgba(0,0,0,.12)}#ycP .ycRec .ycIb.red{color:#e5484d}#ycP .ycRecDot{width:11px;height:11px;border-radius:50%;background:#e5484d;animation:ycBl 1s infinite}@keyframes ycBl{50%{opacity:.25}}#ycP .ycRec b{font-size:15px;min-width:40px}#ycP .ycRecW{flex:1;height:28px;display:flex;align-items:center;gap:2px;overflow:hidden;justify-content:flex-end}#ycP .ycRecW i{width:3px;background:" + G2 + ";border-radius:2px;flex:none}",
  "#ycP .ycRb{display:flex;align-items:center;gap:6px;margin:0 8px -2px;background:var(--in);border-radius:14px 14px 0 0;padding:6px 6px 4px 8px}#ycP .ycRb .ycQuote{flex:1;margin:0}",
  // status + calls tab
  "#ycP .ycStAv{position:relative;width:60px;height:60px;display:grid;place-items:center;flex:none}#ycP .ycStRing{position:absolute;inset:0;width:60px;height:60px}#ycP .ycStPlus{position:absolute;right:0;bottom:0;width:22px;height:22px;border-radius:50%;background:" + G2 + ";color:#fff;font-style:normal;font-weight:900;display:grid;place-items:center;border:2px solid var(--bg);font-size:15px}",
  "#ycP .ycSt{position:absolute;inset:0;display:flex;flex-direction:column;color:#fff}#ycP .ycStTop{display:flex;padding:10px;padding-top:max(10px,env(safe-area-inset-top))}#ycP .ycStTop .ycIb{color:#fff}#ycP .ycSt textarea{flex:1;margin:20px;border:0;background:transparent;color:#fff;font:700 28px/1.3 inherit;font-family:inherit;text-align:center;outline:0;resize:none;padding-top:20vh}#ycP .ycSt textarea::placeholder{color:rgba(255,255,255,.6)}",
  "#ycP .ycCallActs{display:flex;gap:10px;padding:14px 14px 6px;overflow-x:auto}#ycP .ycCallActs button{flex:1;min-width:96px;border:1px solid var(--ln);background:var(--bg);border-radius:16px;padding:12px 6px;display:flex;flex-direction:column;align-items:center;gap:8px;font-weight:800;font-size:12.5px;cursor:pointer}#ycP .ycCallActs span{width:46px;height:46px;border-radius:50%;display:grid;place-items:center;color:#fff;font-size:20px}",
  "#ycP .ycJoin{border:0;border-radius:14px;padding:6px 14px;background:var(--bg2);color:" + G2 + "!important;font-weight:800;cursor:pointer;flex:none}#ycP .ycJoin.hot{background:" + G2 + ";color:#fff!important}#ycP .ycMiss{color:#e5484d!important}#ycP .ycCdir{display:flex;align-items:center;gap:4px}#ycP .ycCdir svg{flex:none}#ycP .ycCdir.miss svg{color:#e5484d}#ycP .ycCdir.out svg,#ycP .ycCdir.in svg{color:" + G2 + "}#ycP .ycCk{color:" + G2 + ";font-style:normal;display:grid;flex:none}#ycP .ycStTh{width:40px;height:40px;border-radius:6px;object-fit:cover;flex:none}",
  // global overlays
  ".ycToast{position:fixed;left:50%;bottom:90px;transform:translate(-50%,20px);background:#16230f;color:#fff;padding:10px 16px;border-radius:12px;font:600 13.5px Manrope,system-ui,sans-serif;z-index:2147483500;opacity:0;transition:all .3s;max-width:86vw;text-align:center;pointer-events:none}.ycToast.on{opacity:1;transform:translate(-50%,0)}",
  ".ycPop{position:fixed;top:12px;left:50%;transform:translate(-50%,-150%);width:min(430px,calc(100% - 24px));background:#fff;border-radius:18px;box-shadow:0 14px 40px rgba(0,0,0,.28);display:flex;gap:12px;align-items:center;padding:12px 14px;z-index:2147483200;transition:transform .35s cubic-bezier(.2,1.2,.4,1);cursor:pointer;font-family:Manrope,system-ui,sans-serif}.ycPop.on{transform:translate(-50%,0)}.ycPop div{display:flex;flex-direction:column;min-width:0}.ycPop b{font-size:15px;color:#16230f}.ycPop span{font-size:13.5px;color:#5d6b54;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
  ".ycFed{margin-top:6px;padding:5px 8px;border-radius:8px;font-size:12px;font-weight:700}.ycFed.ok{background:#DDF1C6;color:#2a5216}.ycFed.bad{background:#FDEBEA;color:#B3261E}.ycFedH{align-self:center;font-size:11.5px;color:#55664d;white-space:nowrap}.ycView{position:fixed;inset:0;background:rgba(0,0,0,.94);z-index:2147483300;display:grid;place-items:center}.ycView img{max-width:100vw;max-height:92vh;object-fit:contain}.ycViewT{position:absolute;top:max(12px,env(safe-area-inset-top));right:12px;display:flex;gap:8px}.ycViewT button{width:44px;height:44px;border-radius:50%;border:0;background:rgba(255,255,255,.16);color:#fff;font-size:19px;cursor:pointer}",
  ".ycAvT{display:inline-grid;flex:none}.ycCard{display:flex!important;flex-direction:column;place-items:stretch!important;align-items:stretch!important;background:#000!important;color:#fff;font-family:Manrope,system-ui,sans-serif}.ycCardT{display:flex;align-items:center;gap:8px;padding:10px;padding-top:max(10px,env(safe-area-inset-top))}.ycCardT button{border:0;background:none;color:#fff;width:44px;height:44px;cursor:pointer}.ycCardT div{display:flex;flex-direction:column}.ycCardT b{font-size:17px}.ycCardT span{font-size:12.5px;opacity:.75}",
  ".ycCardI{flex:1;display:grid;place-items:center;min-height:0;overflow:hidden}.ycCardI img{max-width:100vw;max-height:100%;width:min(100vw,560px);object-fit:contain}.ycCardA{display:flex;justify-content:space-around;padding:14px 10px max(22px,env(safe-area-inset-bottom));background:#111;flex:none}.ycCardA button{border:0;background:none;color:#a6dd5e;display:flex;flex-direction:column;align-items:center;gap:6px;font-size:20px;cursor:pointer;min-width:64px}.ycCardA small{font:700 12px Manrope,system-ui,sans-serif;color:#fff}",
  ".ycCrop{display:flex!important;flex-direction:column;align-items:stretch!important;justify-items:stretch!important;background:#000!important;color:#fff;font-family:Manrope,system-ui,sans-serif;touch-action:none}.ycCropM{flex:1;display:grid;place-items:center;min-height:0}.ycCropB{position:relative;overflow:hidden;background:#222;touch-action:none;cursor:grab;box-shadow:0 0 0 2000px rgba(0,0,0,.55)}.ycCropB img{position:absolute;left:0;top:0;max-width:none!important;max-height:none!important;object-fit:fill!important;user-select:none;-webkit-user-drag:none;pointer-events:none;border-radius:0!important}",
  ".ycCropB i{position:absolute;inset:0;border:2px solid #fff;pointer-events:none}.ycCropB.rd i{border-radius:50%;box-shadow:0 0 0 2000px rgba(0,0,0,.5)}.ycCropZ{display:flex;align-items:center;gap:12px;padding:14px 26px;position:relative;z-index:2;font-size:22px}.ycCropZ input{flex:1;accent-color:#9be15d;height:28px}",
  ".ycCropA{display:flex;gap:10px;padding:8px 14px max(18px,env(safe-area-inset-bottom));position:relative;z-index:2}.ycCropA button{flex:1;border:0;border-radius:14px;padding:14px 6px;background:rgba(255,255,255,.14);color:#fff;font:800 14.5px Manrope,system-ui,sans-serif;cursor:pointer}.ycCropA .ok{background:#3d9a1f}.ycCrop .ycCardT{position:relative;z-index:2}",
  "#ycSheet{position:fixed;inset:0;z-index:2147483250;font-family:Manrope,system-ui,sans-serif}#ycSheet .ycShBg{position:absolute;inset:0;background:rgba(0,0,0,.35);opacity:0;transition:opacity .2s}#ycSheet.on .ycShBg{opacity:1}",
  "#ycSheet .ycShIn{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:min(460px,100%);background:#fff;color:#16230f;border-radius:20px 20px 0 0;padding:10px 8px max(12px,env(safe-area-inset-bottom));transform:translateY(100%);transition:transform .25s cubic-bezier(.2,.9,.3,1);max-height:80vh;overflow:auto}#ycSheet.on .ycShIn{transform:none}#ycSheet.dk .ycShIn{background:#162415;color:#e5efdc}",
  "#ycP .ycBrand{display:flex!important;align-items:center;gap:8px}#ycP .ycBrand img{height:27px!important;width:auto!important;max-width:none!important;display:block}#ycP .ycBrand em{font-size:18px;font-weight:600;color:#cfe9ae;letter-spacing:.2px;padding-top:6px}",
  "#ycSheet.ycMenuW .ycShBg{background:transparent}#ycSheet .ycMenu{position:fixed;min-width:224px;max-width:calc(100% - 16px);background:#fff;color:#1b2616;border-radius:14px;padding:6px 0;box-shadow:0 10px 32px rgba(10,30,10,.22),0 2px 6px rgba(0,0,0,.08);transform:scale(.92);transform-origin:top right;opacity:0;transition:transform .16s cubic-bezier(.2,.9,.3,1),opacity .12s}#ycSheet.on .ycMenu{transform:none;opacity:1}",
  "#ycSheet .ycMi{display:flex;align-items:center;gap:16px;width:100%;border:0;background:none;padding:11px 20px 11px 18px;font:500 15px/1.2 Manrope,system-ui,sans-serif;color:inherit;text-align:left;cursor:pointer;white-space:nowrap}#ycSheet .ycMi svg{flex:none;color:#5f6f57}#ycSheet .ycMi:hover,#ycSheet .ycMi:active{background:#f1f6ec}#ycSheet .ycMi.red,#ycSheet .ycMi.red svg{color:#c8373d}",
  "#ycSheet.dk .ycMenu,#ycSheet.dk .ycPill2,#ycSheet.dk .ycEmoG{background:#1f2e1d;color:#e5efdc}#ycSheet.dk .ycMi svg{color:#a9bb9f}#ycSheet.dk .ycMi:hover{background:#2a3b27}",
  "#ycSheet.ycMsgOv .ycShBg{background:rgba(8,20,8,.28)}#ycSheet .ycPill2{position:fixed;display:flex;align-items:center;gap:2px;background:#fff;border-radius:999px;padding:5px 6px;box-shadow:0 8px 26px rgba(0,0,0,.2);transform:scale(.6);opacity:0;transition:transform .18s cubic-bezier(.2,1.4,.4,1),opacity .12s}#ycSheet.on .ycPill2{transform:none;opacity:1}",
  "#ycSheet .ycPill2 button{width:42px;height:42px;border:0;background:none;border-radius:50%;font-size:25px;line-height:1;cursor:pointer;display:grid;place-items:center;padding:0;transition:transform .12s}#ycSheet .ycPill2 button:hover{transform:scale(1.2)}#ycSheet .ycPill2 button.on{background:#e2f0d3}#ycSheet .ycPill2 .pl{color:#5f6f57;background:#eef3ea;width:36px;height:36px;margin-left:2px}",
  "#ycSheet .ycEmoG{position:fixed;display:grid;grid-template-columns:repeat(8,1fr);gap:2px;background:#fff;border-radius:16px;padding:8px;box-shadow:0 10px 30px rgba(0,0,0,.22)}#ycSheet .ycEmoG button{border:0;background:none;font-size:25px;height:40px;border-radius:10px;cursor:pointer;padding:0}#ycSheet .ycEmoG button:hover{background:#eef3ea}",
  "#ycSheet .ycMact{transform-origin:top center}#ycP .ycB.ycPick{box-shadow:0 0 0 2.5px #8cc63f!important}",
  "#ycP .ycMsg{position:relative}#ycP .ycReB{align-self:center;flex:none;width:30px;height:30px;border:0;border-radius:50%;background:rgba(255,255,255,.92);color:#5f6f57;display:grid;place-items:center;padding:0;cursor:pointer;opacity:0;transition:opacity .15s;box-shadow:0 1px 3px rgba(0,0,0,.12)}#ycP .ycMsg.me .ycReB{order:-1}#ycP .ycMsg:hover .ycReB{opacity:1}@media (hover:none){#ycP .ycReB{display:none}}",
  "#ycP .ycSwR{position:absolute;left:-36px;top:50%;margin-top:-15px;width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.9);color:#4d6a3a;display:grid;place-items:center;opacity:0;pointer-events:none;transition:transform .12s}#ycP .ycSwR svg{width:18px;height:18px}",
  "#ycP .ycBlk{flex:none;padding:14px 16px max(14px,env(safe-area-inset-bottom));text-align:center;background:#f4f7f1;color:#5d6b54;font-size:14px;border-top:1px solid #e0e8d8}#ycP .ycBlk button{border:0;background:none;color:#2f7d1f;font:700 14px inherit;font-family:inherit;cursor:pointer;margin-left:6px}#ycP.dk .ycBlk{background:#162415;color:#b9c8ad;border-color:#253624}",
  "#ycP .ycForm textarea{width:100%;box-sizing:border-box;border:1.5px solid #d5dfcc;border-radius:12px;padding:10px 12px;font:15px/1.4 inherit;font-family:inherit;resize:vertical;min-height:90px;background:#fff;color:inherit}#ycP .ycForm label small{font-weight:500;color:#7b8a74}",
  "#ycP .ycMeetBox{padding:12px 16px 4px}#ycP .ycSec svg{width:17px;height:17px;vertical-align:-3px;margin-right:4px}#ycP .ycAg{margin:2px 0 8px;padding-left:22px;font-size:15px;line-height:1.5}#ycP .ycAg li{padding:3px 0}#ycP .ycAg small{color:#7b8a74;font-size:12px}",
  "#ycP .ycAddPt,#ycNotes .ycAddPt{display:flex;gap:8px;align-items:center}#ycP .ycAddPt input,#ycNotes .ycAddPt input{flex:1;min-width:0;border:1.5px solid #d5dfcc;border-radius:22px;padding:10px 14px;font:15px inherit;font-family:inherit;background:#fff;color:#16230f}#ycP .ycAddPt button,#ycNotes .ycAddPt button{width:42px;height:42px;border:0;border-radius:50%;background:#3d9a1f;color:#fff;display:grid;place-items:center;cursor:pointer;flex:none}",
  "#ycP .ycMin{padding:0 14px 6px}#ycP .ycMinHd{display:flex;flex-wrap:wrap;justify-content:space-between;gap:6px;font-size:12.5px;color:#5d6b54;padding:2px 2px 10px}#ycP .ycMinI{background:#fff;border-radius:14px;padding:10px 12px;margin-bottom:10px;box-shadow:0 1px 2px rgba(0,0,0,.06);border-left:4px solid #7DB82E}#ycP .ycMinI.no{border-left-color:#d8c06a;opacity:.85}#ycP .ycMinI.other{border-left-color:#8aa0b8}",
  "#ycP .ycMinT{display:flex;flex-direction:column;gap:2px;margin-bottom:4px}#ycP .ycMinT b{font-size:15px}#ycP .ycMinT em{font-style:normal;font-size:12.5px;color:#6b7a63}",
  ".ycTxL{display:flex;gap:6px;font-size:13.5px;line-height:1.4;padding:3px 0;align-items:baseline}.ycTxL time{color:#8a9783;font-size:11.5px;flex:none;width:36px}.ycTxL b{flex:none;font-size:13px}.ycTxL span{flex:1;min-width:0;overflow-wrap:anywhere}.ycNt{font-style:normal;font-size:10.5px;background:#eaf3df;color:#3d7a1f;border-radius:6px;padding:1px 5px;font-weight:700}",
  "#ycP .ycMeetB{display:flex;gap:6px;margin-top:6px}#ycP .ycMeetB button{flex:1}#ycP .ycMeetB button.gh{background:transparent!important;color:#2f7d1f!important;border:1.5px solid #9bc77a!important}#ycP .ycMeetM b svg{width:17px;height:17px;vertical-align:-3px}#ycP .ycCalIc{background:#e6efdd!important;color:#2f6b1c!important;display:grid;place-items:center}#ycP .ycCalIc svg{width:24px;height:24px}#ycP .ycCallActs span svg{width:24px;height:24px}",
  "#ycNotes{position:absolute;left:8px;right:8px;bottom:110px;max-height:58%;display:flex;flex-direction:column;gap:8px;background:rgba(255,255,255,.97);color:#16230f;border-radius:18px;padding:12px;box-shadow:0 12px 40px rgba(0,0,0,.35);z-index:5;font-family:Manrope,system-ui,sans-serif}#ycNotes .ycNh{display:flex;align-items:center;justify-content:space-between}#ycNotes .ycNh b{display:flex;gap:6px;align-items:center;font-size:15px}#ycNotes .ycNh button{border:0;background:none;color:#5f6f57;cursor:pointer}",
  "#ycNotes .ycNsub{display:flex;gap:6px;flex-wrap:wrap;font-size:12.5px;color:#5d6b54}#ycNotes .ycNsub button{border:1.5px solid #cfdcc3;background:#fff;border-radius:16px;padding:5px 10px;font:600 12.5px inherit;font-family:inherit;color:#3d5a2c;cursor:pointer;display:flex;align-items:center;gap:6px}#ycNotes .ycNsub button i{width:8px;height:8px;border-radius:50%;background:#aab4a3}#ycNotes .ycNsub button.on{border-color:#e05252;color:#b52a2a}#ycNotes .ycNsub button.on i{background:#e53935;animation:ycBl 1s infinite}@keyframes ycBl{50%{opacity:.3}}",
  "#ycNotes .ycAg.sm{margin:0;padding-left:20px;font-size:13px;color:#3d4a36;max-height:80px;overflow:auto}#ycNotes .ycNfeed{flex:1;min-height:60px;overflow:auto;border-top:1px solid #e6ece0;padding-top:6px}",
  "#ycP .ycTask{align-items:center}#ycP .ycTk{flex:none;width:26px;height:26px;border-radius:50%;border:2px solid #9bb38a;background:#fff;color:#fff;display:grid;place-items:center;padding:0;cursor:pointer;margin-right:2px}#ycP .ycTk.on{background:#3d9a1f;border-color:#3d9a1f}#ycP .ycTk svg{width:16px;height:16px}#ycP .ycTask.done .ycR1 b{text-decoration:line-through;color:#8a9783}#ycP .ycR2 .od{color:#c8373d;font-weight:600}",
  "#ycP .ycMk{flex:none;border:1px solid #cfdcc3;background:#fff;color:#3d7a1f;border-radius:10px;font:700 11px inherit;font-family:inherit;padding:2px 7px;cursor:pointer;align-self:center}#ycP .ycForm select,#ycP .ycForm input[type=datetime-local]{width:100%;box-sizing:border-box;border:1.5px solid #d5dfcc;border-radius:12px;padding:11px 12px;font:15px inherit;font-family:inherit;background:#fff;color:inherit}#ycP .ycTabs button{font-size:14.5px!important}",
  "#ycP .ycTg{font-style:normal;font-size:11px;font-weight:700;background:#eaf3df;color:#3d7a1f;border-radius:6px;padding:1px 6px;margin-left:4px}",
  "#ycSheet .ycShT{font-weight:800;font-size:15px;padding:8px 14px 10px;color:#5d6b54}#ycSheet .ycAct{display:flex;align-items:center;gap:14px;width:100%;border:0;background:none;padding:13px 14px;font:600 15.5px inherit;font-family:inherit;color:inherit;text-align:left;border-radius:12px;cursor:pointer}#ycSheet .ycAct:hover{background:rgba(127,127,127,.12)}#ycSheet .ycAct span{width:26px;display:grid;place-items:center;font-size:18px;color:#3d9a1f}#ycSheet .ycAct.red{color:#d0393f}#ycSheet .ycAct.red span{color:#d0393f}",
  "#ycSheet .ycReact{display:flex;justify-content:space-around;padding:6px 6px 10px;border-bottom:1px solid rgba(127,127,127,.18);margin-bottom:4px}#ycSheet .ycReact button{border:0;background:rgba(127,127,127,.1);width:46px;height:46px;border-radius:50%;font-size:24px;cursor:pointer}#ycSheet .ycReact button.on{background:#dff3cf;box-shadow:0 0 0 2px #3d9a1f}",
  "#ycSheet .ycAttach{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:14px 6px 8px}#ycSheet .ycAttach button{border:0;background:none;display:flex;flex-direction:column;align-items:center;gap:8px;font:700 13px inherit;font-family:inherit;color:inherit;cursor:pointer}#ycSheet .ycAttach span{width:58px;height:58px;border-radius:50%;display:grid;place-items:center;box-shadow:0 4px 10px rgba(0,0,0,.15)}",
  "#ycSheet .ycWalls{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:4px 10px 10px}#ycSheet .ycWalls button{height:120px;border-radius:14px;border:2px solid transparent;background-color:#eaf0e3;background-size:110px;cursor:pointer;display:flex;align-items:flex-end;justify-content:center;padding:8px;font:700 12px inherit;font-family:inherit;color:#16230f}#ycSheet .ycWalls button.on{border-color:#3d9a1f}",
  "#ycSheet .ycWall-leaf{background-image:" + wallSvg(false) + "}#ycSheet .ycWall-weave{background-image:repeating-linear-gradient(45deg,rgba(47,90,26,.08) 0 2px,transparent 2px 10px),repeating-linear-gradient(-45deg,rgba(47,90,26,.08) 0 2px,transparent 2px 10px)}#ycSheet .ycWalls b{background:rgba(255,255,255,.85);border-radius:8px;padding:3px 8px}",
  "#ycSV{position:fixed;inset:0;z-index:2147483400;background:#000;color:#fff;font-family:Manrope,system-ui,sans-serif;display:flex;flex-direction:column}#ycSV .ycSVbars{display:flex;gap:4px;padding:8px 10px;padding-top:max(8px,env(safe-area-inset-top));position:absolute;left:0;right:0;top:0;z-index:3}#ycSV .ycSVbars i{flex:1;height:3px;background:rgba(255,255,255,.35);border-radius:2px;overflow:hidden}#ycSV .ycSVbars b{display:block;height:100%;background:#fff}",
  "#ycSV .ycSVhd{position:absolute;top:max(18px,calc(env(safe-area-inset-top) + 12px));left:0;right:0;display:flex;align-items:center;gap:10px;padding:8px 12px;z-index:3}#ycSV .ycSVhd div{display:flex;flex-direction:column}#ycSV .ycSVhd span{font-size:12px;opacity:.8}#ycSV .ycSVhd button{border:0;background:rgba(0,0,0,.3);color:#fff;width:40px;height:40px;border-radius:50%;font-size:18px;cursor:pointer;display:grid;place-items:center}",
  "#ycSV .ycSVbody{flex:1;display:grid;place-items:center;position:relative}#ycSV .ycSVbody img{max-width:100%;max-height:100vh;object-fit:contain}#ycSV .ycSVtxt{font-size:30px;font-weight:700;text-align:center;padding:30px;line-height:1.35;white-space:pre-wrap}#ycSV .ycSVcap{position:absolute;bottom:80px;left:0;right:0;text-align:center;background:rgba(0,0,0,.4);padding:10px;font-size:16px}",
  "#ycSV .ycSVfoot{position:absolute;bottom:max(18px,env(safe-area-inset-bottom));left:0;right:0;text-align:center;z-index:3;font-size:14px}#ycSV .ycSVfoot button{border:0;background:rgba(255,255,255,.18);color:#fff;border-radius:20px;padding:10px 18px;font-weight:700;display:inline-flex;gap:6px;align-items:center;cursor:pointer}#ycSV .ycSVnav{position:absolute;inset:80px 0 70px;display:flex;z-index:2}#ycSV .ycSVnav span{flex:1}#ycSV .ycSVnav span:last-child{flex:2}",
  // calls overlay
  "#ycIn2{position:fixed;inset:0;z-index:2147483450;background:radial-gradient(circle at 50% 30%,#2c5a1f,#081407 75%);display:flex;flex-direction:column;align-items:center;justify-content:space-between;font-family:Manrope,system-ui,sans-serif;color:#fff;padding:max(30px,env(safe-area-inset-top)) 20px max(40px,env(safe-area-inset-bottom));animation:ycFi .3s}@keyframes ycFi{from{opacity:0}}",
  "#ycIn2 .ycInT{color:#cfe8b0;font-size:14px;letter-spacing:.5px}#ycIn2 .ycInB{display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center}#ycIn2 .ycAv{box-shadow:0 0 0 14px rgba(155,225,93,.12),0 0 0 30px rgba(155,225,93,.06);animation:ycRg 1.6s infinite}@keyframes ycRg{50%{box-shadow:0 0 0 20px rgba(155,225,93,.18),0 0 0 40px rgba(155,225,93,.08)}}#ycIn2 b{font-size:27px;margin-top:30px}#ycIn2 .ycInB span{color:#cfe8b0;font-size:15px}",
  "#ycIn2 .ycInBtns{display:flex;gap:80px}#ycIn2 .ycInBtns button{width:72px;height:72px;border-radius:50%;border:0;color:#fff;display:grid;place-items:center;cursor:pointer;position:relative}#ycIn2 .ycInBtns small{position:absolute;top:80px;font-size:13px;font-weight:700;color:#e6f5d6;white-space:nowrap}#ycIn2 .no{background:#e5484d}#ycIn2 .yes{background:#31c46c;animation:ycSh 1.4s infinite}@keyframes ycSh{0%,60%,100%{transform:none}10%,30%{transform:rotate(-14deg)}20%,40%{transform:rotate(14deg)}}",
  "#ycCall{position:fixed;inset:0;z-index:2147483350;background:linear-gradient(170deg,#1f4a16,#081407 80%);color:#fff;display:flex;flex-direction:column;font-family:Manrope,system-ui,sans-serif}#ycCall .ycCtop{display:flex;align-items:center;gap:8px;padding:12px;padding-top:max(12px,env(safe-area-inset-top));font-size:12.5px;color:#a9c79a;position:relative;z-index:3}#ycCall .ycCtop button{border:0;background:rgba(255,255,255,.12);color:#fff;width:42px;height:42px;border-radius:50%;font-size:22px;cursor:pointer}",
  "#ycCall .ycStage{flex:1;display:grid;place-items:center;gap:8px;padding:8px;min-height:0}#ycCall .ycStage.n2{grid-template-columns:1fr;grid-template-rows:1fr 1fr}#ycCall .ycStage.n3,#ycCall .ycStage.n4{grid-template-columns:1fr 1fr}#ycCall .ycStage.n5,#ycCall .ycStage.n6{grid-template-columns:1fr 1fr;grid-auto-rows:1fr}",
  "#ycCall .ycTile{position:relative;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;border-radius:16px;overflow:hidden;min-height:0}#ycCall .ycStage:not(.n1) .ycTile{background:rgba(255,255,255,.06)}#ycCall .ycTile video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#000}#ycCall .ycTile small{position:relative;font-size:13px;color:#e6f5d6;background:rgba(0,0,0,.25);border-radius:8px;padding:2px 8px}",
  "#ycCall .ycTile video~small{position:absolute;left:8px;bottom:8px}#ycCall .ycTile .ycAv{transition:box-shadow .15s}#ycCall .ycTile.talk .ycAv{box-shadow:0 0 0 4px #9be15d,0 0 26px #9be15d}#ycCall .ycTile.talk{box-shadow:inset 0 0 0 3px #9be15d}",
  "#ycCall .ycCinfo{text-align:center;padding:6px 10px 2px;display:flex;flex-direction:column;gap:4px;position:relative;z-index:2}#ycCall .ycCinfo b{font-size:23px}#ycCall .ycCinfo span{color:#cfe8b0;font-size:15px}#ycCall.vid.has-vid .ycCinfo{position:absolute;top:max(60px,calc(env(safe-area-inset-top) + 56px));left:0;right:0;text-shadow:0 1px 6px rgba(0,0,0,.6)}",
  "#ycCall #ycSelf{position:absolute;right:14px;bottom:130px;width:110px;height:150px;object-fit:cover;border-radius:14px;border:2px solid rgba(255,255,255,.6);background:#000;transform:scaleX(-1);z-index:4;box-shadow:0 8px 20px rgba(0,0,0,.4)}#ycCall #ycSelf.back{transform:none}",
  "#ycCall .ycCbar{display:flex;justify-content:center;gap:14px;padding:16px 10px max(30px,env(safe-area-inset-bottom));background:linear-gradient(transparent,rgba(0,0,0,.45));position:relative;z-index:3;flex-wrap:wrap}#ycCall .ycCbar button{width:60px;height:60px;border-radius:50%;border:0;background:rgba(255,255,255,.16);color:#fff;display:grid;place-items:center;cursor:pointer;position:relative;margin-bottom:18px}#ycCall .ycCbar button small{position:absolute;top:65px;font-size:11.5px;color:#cfe8b0;white-space:nowrap}#ycCall .ycCbar button.on{background:#fff;color:#16230f}#ycCall .ycCbar .end{background:#e5484d}",
  "#ycCall.min{inset:auto 12px 90px auto;width:190px;height:auto;border-radius:18px;box-shadow:0 12px 30px rgba(0,0,0,.45);cursor:pointer;overflow:hidden}#ycCall.min .ycCtop,#ycCall.min .ycStage,#ycCall.min #ycSelf{display:none}#ycCall.min .ycCinfo{position:static!important;padding:12px 12px 4px;text-align:left}#ycCall.min .ycCinfo b{font-size:14px}#ycCall.min .ycCinfo span{font-size:12px}#ycCall.min .ycCbar{padding:6px 10px 12px;gap:10px;justify-content:flex-start}#ycCall.min .ycCbar button{width:40px;height:40px;margin:0}#ycCall.min .ycCbar small{display:none}#ycCall.min .ycCbar button:not(.end):not([data-k=mute]){display:none}"
  ].join("\n");
  document.head.appendChild(s);
}
})();
