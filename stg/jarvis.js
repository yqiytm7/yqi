// ===== Jarvis: YQI's built-in AI assistant (RAG + agentic tools + voice) =====
// Loaded on every screen (see index.html). Talks to a free Cloudflare Worker backend
// (see /cf-worker) - no Firebase Blaze plan or card required. Voice output uses the
// browser's own free speech synthesis (no Cloud Text-to-Speech, which needs billing).
// Visible only to staff accounts (qc/qa/auth - same gate as the rest of the app's
// company data), matching the backend's own role check.
(function () {
  "use strict";
  // Deployed Cloudflare Worker backend URL (see /cf-worker and docs/JARVIS-SETUP.md).
  // Can still be overridden at runtime via window.JARVIS_WORKER_URL if needed.
  var WORKER_URL = window.JARVIS_WORKER_URL || "https://yqi-jarvis.yqi-ytm7.workers.dev";

  var SETTINGS = { voiceURI: "", languageCode: "ur-PK", micLang: "ur-PK", speakingRate: 1, pitch: 0, autoSpeak: true, natural: true, gvoice: "Charon" };
  var GREETED = false, VOICE_MODE = false, AUDIO = null, PENDING_DO = null, PLAN_TEXT = "", DONE = [];
  var HISTORY = [], OPEN = false, BUSY = false, SETTINGS_LOADED = false;
  var RECOG = null, LISTENING = false, SPEAKING = false;
  var ALERTS = [], PENDING = [];
  var SID = "s" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  function ready() {
    var u = null; try { u = window.firebase && firebase.apps && firebase.apps.length && firebase.auth && firebase.auth().currentUser; } catch (e) { u = null; }
    return !!(u && u.email && typeof window.YQLV !== "undefined");
  }
  function staffOK() {
    var lv = window.YQLV || "";
    return lv === "auth" || lv === "qa" || lv === "qc";
  }

  // Calls the free Cloudflare Worker backend, authenticated with the user's own
  // Firebase ID token (the Worker verifies it itself - no Admin SDK/service account
  // needed on this side).
  function call(route, body) {
    return firebase.auth().currentUser.getIdToken().then(function (idToken) {
      return fetch(WORKER_URL.replace(/\/$/, "") + route, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: "Bearer " + idToken },
        body: JSON.stringify(body || {}),
      });
    }).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) throw new Error(data && data.error || ("HTTP " + res.status));
        return data;
      });
    });
  }

  // ---------------------------------------------------------------- styles
  var CSS = "" +
    "#jvOrb{position:fixed;z-index:2147483646;right:16px;bottom:calc(86px + env(safe-area-inset-bottom,0px));width:58px;height:58px;border-radius:50%;background:radial-gradient(circle at 30% 30%,#9BE58A,#3D6B22 70%);box-shadow:0 6px 20px rgba(17,30,24,.35);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;font-size:26px}" +
    "@media(min-width:900px){#jvOrb{bottom:24px;right:28px}}" +
    "#jvOrb .jvBadge{position:absolute;top:-2px;right:-2px;min-width:18px;height:18px;border-radius:9px;background:#D64545;color:#fff;font:700 10.5px/18px Manrope,sans-serif;text-align:center;padding:0 4px}" +
    "#jvOrb.listening{animation:jvPulse 1.2s infinite}#jvOrb.speaking{animation:jvPulse .6s infinite}" +
    "@keyframes jvPulse{0%{box-shadow:0 0 0 0 rgba(155,229,138,.6)}100%{box-shadow:0 0 0 18px rgba(155,229,138,0)}}" +
    "#jvPanel{position:fixed;z-index:2147483647;right:0;bottom:0;left:0;top:0;background:rgba(10,20,14,.35);display:flex;align-items:flex-end;justify-content:flex-end}" +
    "#jvPanel .jvBox{background:var(--bg,#F4F2EB);width:100%;max-width:420px;height:100%;max-height:100%;display:flex;flex-direction:column;box-shadow:-8px 0 30px rgba(0,0,0,.2);font-family:Manrope,sans-serif}" +
    "@media(min-width:900px){#jvPanel{align-items:stretch}#jvPanel .jvBox{margin:16px;height:calc(100% - 32px);border-radius:18px;overflow:hidden}}" +
    "#jvPanel .jvHead{background:var(--hero,#0C1A14);color:#fff;padding:14px 16px;display:flex;align-items:center;gap:10px}" +
    "#jvPanel .jvHead b{font-size:16px;flex:1}#jvPanel .jvHead button{background:transparent;border:none;color:#cfe8d4;font-size:20px;cursor:pointer;padding:4px 8px}" +
    "#jvTabs{display:flex;border-bottom:1px solid var(--line,#E4E1D6);background:var(--card,#fff)}" +
    "#jvTabs button{flex:1;border:none;background:transparent;padding:10px 4px;font:600 12.5px Manrope;color:var(--mut,#6E7B73);cursor:pointer;border-bottom:2px solid transparent}" +
    "#jvTabs button.on{color:var(--acc,#3D6B22);border-color:var(--acc,#3D6B22)}" +
    "#jvBody{flex:1;overflow:auto;padding:12px 14px;background:var(--bg,#F4F2EB)}" +
    ".jvMsg{margin:8px 0;max-width:88%;padding:9px 12px;border-radius:14px;font-size:13.5px;line-height:1.4;white-space:pre-wrap}" +
    ".jvMsg.me{margin-left:auto;background:var(--acc,#3D6B22);color:#fff;border-bottom-right-radius:4px}" +
    ".jvMsg.ai{background:var(--card,#fff);border:1px solid var(--line,#E4E1D6);border-bottom-left-radius:4px}" +
    ".jvMsg.sys{background:var(--nvb,#E7EDF1);color:var(--nvc,#4E6274);font-size:12px;text-align:center;max-width:100%}" +
    ".jvCard{background:var(--card,#fff);border:1px solid var(--line,#E4E1D6);border-radius:12px;padding:10px 12px;margin:8px 0;font-size:13px}" +
    ".jvCard b{display:block;margin-bottom:4px}.jvCard .jvRow{display:flex;gap:8px;margin-top:8px}" +
    ".jvCard button{flex:1;border:none;border-radius:8px;padding:8px;font:700 12.5px Manrope;cursor:pointer}" +
    ".jvCard .ok{background:var(--acc,#3D6B22);color:#fff}.jvCard .no{background:var(--rdb,#F8E4DF);color:var(--rdc,#A63D2A)}" +
    ".jvAlert{border-left:3px solid var(--nvc,#4E6274)}.jvAlert.warning{border-color:var(--amc,#92620F)}.jvAlert.critical{border-color:var(--rdc,#A63D2A)}" +
    "#jvInputRow{display:flex;gap:8px;padding:10px 12px;border-top:1px solid var(--line,#E4E1D6);background:var(--card,#fff)}" +
    "#jvInputRow input{flex:1;border:1px solid var(--line,#E4E1D6);border-radius:20px;padding:0 14px;height:40px;font-size:14px}" +
    "#jvInputRow button{width:40px;height:40px;border-radius:50%;border:none;background:var(--acc,#3D6B22);color:#fff;font-size:17px;cursor:pointer}" +
    "#jvInputRow button.mic.on{background:#D64545}" +
    "#jvSettings .lbl{display:block;font:600 11px Manrope;color:var(--mut,#6E7B73);text-transform:uppercase;letter-spacing:.08em;margin:14px 0 6px}" +
    "#jvSettings select,#jvSettings input[type=range]{width:100%}" +
    "#jvSettings .jvVoiceRow{display:flex;align-items:center;gap:8px;padding:8px;border:1px solid var(--line,#E4E1D6);border-radius:10px;margin-bottom:6px}" +
    "#jvSettings .jvVoiceRow button{border:none;background:var(--okb,#E3F0E8);color:var(--okc,#256B4B);border-radius:8px;padding:6px 10px;font-weight:700;cursor:pointer}" +
    ".jvDot{width:7px;height:7px;border-radius:50%;background:#9aa49a;display:inline-block;margin:0 1px;animation:jvBlink 1s infinite}" +
    ".jvDot:nth-child(2){animation-delay:.2s}.jvDot:nth-child(3){animation-delay:.4s}" +
    "@keyframes jvBlink{0%,80%,100%{opacity:.25}40%{opacity:1}}";

  function injectCss() {
    if ($("jvCss")) return;
    var s = document.createElement("style"); s.id = "jvCss"; s.textContent = CSS; document.head.appendChild(s);
  }

  // ---------------------------------------------------------------- orb + panel
  function badgeCount() {
    var uid = firebase.auth().currentUser && firebase.auth().currentUser.uid;
    var unread = ALERTS.filter(function (a) { return !(a.read && uid && a.read[uid]); }).length + PENDING.length + jobsGet().filter(function (j) { return !j.seen; }).length;
    return unread;
  }
  function renderOrb() {
    var orb = $("jvOrb"); if (!orb) return;
    orb.classList.toggle("listening", LISTENING);
    orb.classList.toggle("speaking", SPEAKING);
    var n = badgeCount();
    var badge = orb.querySelector(".jvBadge");
    if (n > 0) {
      if (!badge) { badge = document.createElement("span"); badge.className = "jvBadge"; orb.appendChild(badge); }
      badge.textContent = n > 9 ? "9+" : n;
    } else if (badge) badge.remove();
  }

  function buildOrb() {
    if ($("jvOrb")) return;
    var b = document.createElement("button");
    b.id = "jvOrb"; b.title = "Jarvis - YQI assistant"; b.innerHTML = "✦";
    b.onclick = function () { if (VOPEN) closeVoice(); else if (OPEN) closePanel(); else openVoice(); };
    document.body.appendChild(b);
  }

  var TAB = "chat";
  function togglePanel() { OPEN ? closePanel() : openPanel(); }
  function openPanel() {
    OPEN = true;
    loadSettings();
    var o = document.createElement("div"); o.id = "jvPanel";
    o.innerHTML =
      '<div class="jvBox">' +
      '<div class="jvHead"><span style="font-size:20px">✦</span><b>Jarvis</b><button data-vo title="Voice mode">🎙</button><button data-x title="Close">✕</button></div>' +
      '<div id="jvTabs">' +
      '<button data-t="chat" class="on">Chat</button>' +
      '<button data-t="alerts">Alerts</button>' +
      '<button data-t="approve">Approvals</button>' +
      '<button data-t="settings">Voice &amp; settings</button>' +
      "</div>" +
      '<div id="jvBody"></div>' +
      '<div id="jvInputRow"><button class="mic" data-mic title="Speak">🎤</button><input id="jvInput" placeholder="Jarvis se poochein ya kaam bolein…"><button data-send title="Send">➤</button></div>' +
      "</div>";
    document.body.appendChild(o);
    o.addEventListener("click", function (e) { if (e.target === o) closePanel(); });
    o.querySelector("[data-x]").onclick = closePanel;
    o.querySelector("[data-vo]").onclick = function () { closePanel(); openVoice(); };
    o.querySelectorAll("#jvTabs button").forEach(function (btn) {
      btn.onclick = function () { TAB = btn.getAttribute("data-t"); o.querySelectorAll("#jvTabs button").forEach(function (x) { x.classList.toggle("on", x === btn); }); render(); };
    });
    o.querySelector("[data-send]").onclick = sendText;
    o.querySelector("#jvInput").addEventListener("keydown", function (e) { if (e.key === "Enter") sendText(); });
    o.querySelector("[data-mic]").onclick = toggleMic;
    render();
    renderOrb();
    greet();
  }
  function closePanel() { setTimeout(wakeStart, 1500); OPEN = false; VOICE_MODE = false; try { if (RECOG && LISTENING) RECOG.stop(); } catch (e) { } var p = $("jvPanel"); if (p) p.remove(); }

  function render() {
    renderVoice();
    var body = $("jvBody"); if (!body) return;
    if (TAB === "chat") renderChat(body);
    else if (TAB === "alerts") renderAlerts(body);
    else if (TAB === "approve") renderApprovals(body);
    else renderSettings(body);
  }

  // ---------------------------------------------------------------- chat
  function renderChat(body) {
    body.innerHTML = HISTORY.map(function (m) {
      if (m.role === "sys") return '<div class="jvMsg sys">' + esc(m.text) + "</div>";
      if (m.role === "do") return PENDING_DO ? '<div class="jvCard"><b>Ye kaam karun?</b>' + PENDING_DO.steps.map(function (x) { return esc(x.t === "type" ? "✎ " + x.x + ": " + x.v : x.t === "tap" || !x.t ? "▸ " + x.x : x.t === "home" ? "▸ Home" : x.t === "back" ? "▸ Back" : x.t === "excel" ? "⬇ Excel: " + [x.what, x.customer, x.result, x.from && x.from + "→" + (x.to || "")].filter(Boolean).join(" · ") : ""); }).filter(Boolean).join("<br>") + '<div class="jvRow"><button class="ok" data-doyes>Haan, karo</button><button class="no" data-dono>Nahi</button></div></div>' : "";
      return '<div class="jvMsg ' + (m.role === "user" ? "me" : "ai") + '">' + esc(m.text).replace(/\*\*([^*\n]+)\*\*/g, "<b>$1</b>").replace(/^\* /gm, "• ") + "</div>";
    }).join("") + (BUSY ? '<div class="jvMsg ai"><span class="jvDot"></span><span class="jvDot"></span><span class="jvDot"></span></div>' : "");
    body.scrollTop = body.scrollHeight;
    var y = body.querySelector("[data-doyes]"), n = body.querySelector("[data-dono]");
    if (y) y.onclick = function () { var P = PENDING_DO; PENDING_DO = null; HISTORY = HISTORY.filter(function (m) { return m.role !== "do"; }); if (P) runSteps(P.steps); };
    if (n) n.onclick = function () { PENDING_DO = null; HISTORY = HISTORY.filter(function (m) { return m.role !== "do"; }); HISTORY.push({ role: "model", text: "Theek hai, nahi karta." }); render(); };
  }

  function sendText(byVoice, said) {
    if (byVoice !== true) VOICE_MODE = false;
    var inp = $("jvInput"), text = said != null ? String(said).trim() : (inp ? inp.value.trim() : "");
    if (!text || BUSY) return;
    if (inp && said == null) inp.value = "";
    if (PENDING_DO && /^(haan|han|ha|ji|jee|yes|ok|okay|kar do|karo|theek|ٹھیک|ہاں|جی|کر دو|کرو)(?=\s|$|[.!,،۔])/i.test(text)) { var P = PENDING_DO; PENDING_DO = null; HISTORY = HISTORY.filter(function (m) { return m.role !== "do"; }); HISTORY.push({ role: "user", text: text }); runSteps(P.steps); return; }
    if (PENDING_DO && /^(nahi|nahin|no|mat|cancel|نہیں|مت)(?=\s|$|[.!,،۔])/i.test(text)) { PENDING_DO = null; HISTORY = HISTORY.filter(function (m) { return m.role !== "do"; }); HISTORY.push({ role: "user", text: text }); HISTORY.push({ role: "model", text: "Theek hai, nahi karta." }); render(); return; }
    PENDING_DO = null; HISTORY = HISTORY.filter(function (m) { return m.role !== "do"; });
    HISTORY.push({ role: "user", text: text });
    if (TAB === "chat") render();
    ask(text);
  }

  function ask(text, opt) {
    opt = opt || {};
    BUSY = true; render(); stopSpeak();
    var geminiHistory = HISTORY.filter(function (m) { return m.role === "user" || m.role === "model"; }).slice(-10).map(function (m) {
      return { role: m.role === "user" ? "user" : "model", parts: [{ text: m.text }] };
    });
    buildCtx(text).catch(function () { return ""; }).then(function (ctx) {
      var body = { text: text, history: geminiHistory.slice(0, -1), scope: { sessionId: SID }, ctx: (ctx || "") + "\n\n" + screenCtx(), sys: sysPrompt() };
      if (opt.webq) { body.web = true; body.webq = opt.webq; }
      return call("/assistantChat", body);
    }).then(function (d) {
      var t = String(d.text || "").trim();
      var w = /\[\[WEB:\s*([^\]]+)\]\]/i.exec(t);
      if (w && !opt.webq) { HISTORY.push({ role: "sys", text: "🌐 Internet par dekh raha hoon…" }); render(); return ask(text, { webq: w[1].trim() }); }
      t = t.replace(/\[\[WEB:[^\]]*\]\]/gi, "").trim();
      var steps = null, di = t.indexOf("[[DO:");
      if (di >= 0) {
        var raw = t.slice(di + 5), a1 = raw.indexOf("["), a2 = raw.lastIndexOf("]");
        if (a1 >= 0 && a2 > a1) { for (var cut = a2; cut > a1 && !steps; cut = raw.lastIndexOf("]", cut - 1)) { try { steps = JSON.parse(raw.slice(a1, cut + 1)); if (!Array.isArray(steps)) steps = [steps]; } catch (e) { steps = null; } } }
        t = t.slice(0, di).trim();
      }
      BUSY = false;
      HISTORY.push({ role: "model", text: t || (steps ? "Ye kaam karun?" : "(jawab nahi mila)") });
      if (steps && steps.length) { PENDING_DO = { steps: steps, text: t }; PLAN_TEXT = t; HISTORY.push({ role: "do" }); }
      render();
      if (d.pendingActions && d.pendingActions.length) {
        HISTORY.push({ role: "sys", text: d.pendingActions.length + " kaam approval ke liye bheje — Approvals tab dekhein." });
        refreshPending(); render();
      }
      if (SETTINGS.autoSpeak && t) speak(t);
    }).catch(function (e) {
      BUSY = false;
      HISTORY.push({ role: "sys", text: "Jarvis jawab nahi de saka: " + (e && e.message || e) });
      render();
    });
  }

  // ------------------------------------------------- brain: who Jarvis is + app map
  function meName() {
    var u = null; try { u = firebase.auth().currentUser; } catch (e) { }
    var n = (window.YQMENAME && window.YQMENAME()) || (u && u.displayName) || "";
    if (!n) { var el = document.querySelector(".pfN, .ppName, [data-me-name]"); n = el ? el.textContent : ""; }
    if (!n && u && u.email) n = u.email.split("@")[0].replace(/[._\d]+/g, " ");
    return String(n || "").trim();
  }
  function firstName() { var n = meName().split(/\s+/)[0] || ""; return n ? n.charAt(0).toUpperCase() + n.slice(1).toLowerCase() : ""; }
  var APP_MAP = [
    "YQI = Yunus Quality Intelligence, quality app of Yunus Textile Mills (home textiles: duvet covers, sheets, pillowcases, comforters, quilts, towels). Customers include Bedsure, Target, Schou JYSK, IKEA, Carrefour, Walmart, Aldi, Lidl, Auchan, GLI, Standard Textile, Argos, Conforama and more.",
    "Terms: YTM = internal order/style number. PO = buyer order. OQL = major defects ÷ sample size × 100 (limit 2.5%). External inspection = buyer/3rd-party final inspection; Internal = floor (inline/end-line) inspections. Floors like YTM-7 First Floor-A, Second Floor-A, A-Building.",
    "Left sidebar buttons: Home, Inspections, Summary, CAPA tracker, Repacking, Chat, Settings. '‹ Home' goes back to the front page.",
    "Front page (Home): search box 'Search YTM, PO, inspection or CAPA number'; alerts bell; customer picker 'All customers'; period picker. Big cards: 'Inspections' (book/assign/report inline, final, PP meeting, fabric), 'Inspection Summary' (floor + external data, wastage, reports, PPT decks), 'CAPA tracker', 'Repacking' (repacks after inspection: done/due/late). 'Needs you' list on right (failed inspections, overdue CAPA, OQL over limit).",
    "Quick access tiles: 'Orders & specs' (customer workspaces, Bedsure desk with shipping plans/Amazon, Target Desk, spec folders; Excel/PDF reader shows files exactly as made), 'Data & export' (every list as Excel), 'Add data' (upload Excel/CSV), 'One-liner' (YTM plan upload), 'Wastage' (floor/customer/YTM wastage, ⬇ PPT with '✎ Edit slides'), 'Workload' (customer load per week/month), 'Wash QC' (floor ↔ washing gate pass/report), 'People', 'Lock app'.",
    "Inspection Summary / Quality Intelligence screen: date buttons 'Day', 'Last 3 days', 'This month', 'All (since Oct 2026)', '📅 Pick dates'; customer chips; 'Upload file', 'Download template'; ⬇ Excel downloads.",
    "CAPA tracker: tabs Open/Overdue/Verification/Closed/All, filters, '+ New CAPA' → write problem in '✨ Auto drafts' box → '✨ Make drafts' → pick a method draft (8D, 5 Why, Fishbone, PDCA, A3, FMEA) → steps → Save draft → preview/PDF/sign. '⬇ Excel' exports.",
    "Settings: Edit page, Customize dashboard, Admin · customers, People & access, Yunus Textile people, offline copy, 20 languages, Install app, Link a computer (QR), Sign out. Login: email/password, Google, or QR from phone.",
    "Recipe — new CAPA from a problem: tap 'CAPA tracker', wait, tap '+ New CAPA', wait, type into field 'e.g. Buyer found oil stains' the problem text, tap '✨ Make drafts'.",
    "Chat: company chat groups; '#INTERNAL' / '#EXTERNAL' formatted messages in inspection groups auto-feed the Inspection Summary (server checks every 5 min)."
  ].join("\n");
  function sysPrompt() {
    var now = new Date(), lv = window.YQLV || "", nm = meName(), fn = firstName();
    return [
      "You are Jarvis — the built-in assistant inside YQI, Yunus Textile Mills' quality app. You are talking to " + (nm || "a staff member") + (lv === "auth" ? " (app owner, full access)" : "") + ". Now: " + now.toLocaleString("en-GB", { timeZone: "Asia/Karachi" }) + " Pakistan time.",
      "VOICE & STYLE: Talk like a sharp, friendly senior colleague in a Pakistani textile office — natural spoken Urdu written in Roman script, the way people really speak (keep English trade words as they are: OQL, AQL, shade, GSM, YTM, PO, inline, final). Warm, confident, human. Never robotic, never 'As an AI', no filler, no emojis. Call the user '" + (fn ? fn + " bhai" : "aap") + "' only now and then, not every message. If the user writes English, reply in English.",
      "LENGTH: Answer exactly what was asked — usually 1-3 short sentences. Use a short list only when giving several items or numbers. No intro, no repeating the question, no 'aur kuch?' endings. Your text is also read aloud, so keep it speakable (no tables, no markdown headings).",
      "DATA: The 'Live data from the YQI app' block is the truth for every number about inspections, CAPA, customers. Never invent or estimate app numbers. If something isn't in the data, say so in one line.",
      "TEXTILE EXPERT: You know the whole chain from fiber to container — cotton/poly/blends, fiber length & micronaire, yarn count (Ne), twist, spinning (ring/open-end), weaving (plain/percale/sateen, thread count, EPI/PPI), knitting, GSM, desizing/scouring/bleaching, dyeing (reactive/vat/disperse/pigment), printing (rotary/digital), shade matching (D65, Delta E, CMC), finishing (sanforizing, peach, anti-pilling), cutting, stitching (SPI, seam & stitch types 301/401/504), quilting & filling (fiber fill, down, GSM of filling), home-textile construction, QC (AQL 1.0/2.5/4.0, ISO 2859-1 sampling, inline/end-line/final, defect classification critical/major/minor, needle control, metal detection), lab testing (dimensional stability/shrinkage ISO 6330, colour fastness ISO 105, pilling ISO 12945, tensile/tear, seam slippage), packing & labelling (care labels, barcodes, carton marks, drop test), shipping (CBM, carton fill, 20ft/40ft/40HC loading, container inspection, Incoterms), and buyer standards (IKEA IWAY, Target, Walmart, JYSK, OEKO-TEX, BSCI, GOTS). Give practical, technical answers with real figures and standards — like an experienced QA manager, not textbook filler.",
      "INTERNET: If the answer needs current outside information you can't know (prices, market rates, news, exchange rates, weather, latest standard changes) reply with ONLY: [[WEB: short English search query]] — nothing else. When web results are given, use them and mention the source name briefly.",
      "DOING THINGS IN THE APP: You can operate the app for the user. The SCREEN block lists buttons/fields visible right now; APP MAP below describes where things are. When the user asks you to open/show/go/filter/download/start something, reply with ONE short line in Urdu saying exactly what you will do and asking for a go-ahead (e.g. 'Theek hai — CAPA tracker khol ke naya CAPA shuru karta hoon. Karun?'), then on the same message add [[DO: [steps]]] — a JSON array of steps: {\"t\":\"tap\",\"x\":\"exact button text\"}, {\"t\":\"type\",\"x\":\"field placeholder or label\",\"v\":\"text\"}, {\"t\":\"home\"}, {\"t\":\"back\"}, {\"t\":\"wait\",\"ms\":800}, and {\"t\":\"excel\",\"what\":\"ext|int|capa\",\"customer\":\"name or empty\",\"from\":\"YYYY-MM-DD\",\"to\":\"YYYY-MM-DD\",\"result\":\"all|fail|pass|open|closed\",\"floor\":\"\"} which builds and downloads a styled Excel file directly from app data (use it for any 'Excel/list/report bana do' request — no taps needed). One command can contain several tasks: put ALL steps in one DO list so they run back-to-back after a single yes; the app then reports what was done in the Alerts tab and notifies the user. Use button texts exactly as in SCREEN/APP MAP; for buttons on the next screen chain taps with a wait. Never say it is already done — the app runs it after the user taps Yes. For pure questions don't add DO.",
      "APP MAP:\n" + APP_MAP
    ].join("\n\n");
  }
  // what is on the screen now (so Jarvis can tap the right buttons)
  function screenCtx() {
    try {
      var seen = {}, out = [], vis = function (e) { var r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2 && r.bottom > 0 && r.top < innerHeight + 400; };
      document.querySelectorAll("button, a, [role=button], .tp, .cpM, .cpRow, [data-ord], input, select, textarea").forEach(function (e) {
        if (out.length > 110 || (e.closest && e.closest("#jvPanel")) || e.id === "jvOrb" || !vis(e)) return;
        var t = /^(INPUT|TEXTAREA|SELECT)$/.test(e.tagName) ? "[field] " + (e.placeholder || e.getAttribute("aria-label") || e.name || e.type || "") : (e.getAttribute("aria-label") || e.innerText || e.title || "");
        t = String(t).replace(/\s+/g, " ").trim().slice(0, 60); if (!t || seen[t]) return; seen[t] = 1; out.push(t);
      });
      var h = document.querySelector("h1, .hdT, .ycpH, .cpH");
      return "SCREEN (" + (h ? h.textContent.replace(/\s+/g, " ").trim().slice(0, 60) : location.pathname) + "): " + out.join(" | ");
    } catch (e) { return ""; }
  }

  // ------------------------------------------------- run app actions (after the user says yes)
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function findEl(x, fields) {
    x = String(x || "").toLowerCase().replace(/\s+/g, " ").trim(); if (!x) return null;
    var best = null, score = 0;
    document.querySelectorAll(fields ? "input, textarea, select" : "button, a, [role=button], .tp, .cpM, .cpRow, [data-ord], label, li, [onclick]").forEach(function (e) {
      if (e.closest && e.closest("#jvPanel")) return;
      var r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return;
      var t = (fields ? (e.placeholder || e.getAttribute("aria-label") || e.name || "") : (e.getAttribute("aria-label") || e.innerText || e.title || "")).toLowerCase().replace(/\s+/g, " ").trim();
      if (!t) return; var sc = t === x ? 3 : t.indexOf(x) === 0 ? 2 : t.indexOf(x) >= 0 ? 1 : 0;
      if (sc > score || (sc === score && sc && best && t.length < best.t.length)) { score = sc; best = { e: e, t: t }; }
    });
    return best ? best.e : null;
  }
  function runSteps(steps) {
    closePanel(); closeVoice(true);
    var i = 0, fail = ""; DONE = [];
    var next = function () {
      if (i >= steps.length) return Promise.resolve();
      var s = steps[i++] || {}, t = s.t || s.type;
      var p;
      if (t === "home") { var h = findEl("‹ home") || findEl("home"); if (h) h.click(); p = sleep(900); }
      else if (t === "back") { try { if (window.YQBACK && YQBACK.back) YQBACK.back(); else history.back(); } catch (e) { history.back(); } p = sleep(700); }
      else if (t === "wait") p = sleep(Math.min(5000, +s.ms || 800));
      else if (t === "excel") p = makeExcel(s).then(function (r) { DONE.push(r); }, function (e) { fail = "Excel (" + (e && e.message || e) + ")"; });
      else if (t === "type") { var f = findEl(s.x, 1); if (!f) { fail = s.x; return Promise.resolve(); } f.focus(); f.value = s.v || ""; f.dispatchEvent(new Event("input", { bubbles: true })); f.dispatchEvent(new Event("change", { bubbles: true })); p = sleep(400); }
      else { var tries = 0, go = function () { var el = findEl(s.x); if (el) { el.scrollIntoView({ block: "center" }); el.click(); return sleep(900); } if (tries++ < 6) return sleep(500).then(go); fail = s.x; return Promise.resolve(); }; p = go(); }
      return p.then(function () { return fail ? null : next(); });
    };
    return next().then(function () {
      var what = (PLAN_TEXT || "").replace(/\s*(karun|karoon|kar doon|kar dun)\s*\?\s*$/i, "").trim();
      var msg = fail ? "“" + fail + "” nahi ho saka — main wahin ruk gaya." : "Ho gaya" + (DONE.length ? " — " + DONE.join("; ") : "") + ".";
      HISTORY.push({ role: fail ? "sys" : "model", text: msg });
      jobAdd((fail ? "✗ " : "") + (what ? what + " → " : "") + msg);
      try { if (window.YQNATIVE && YQNATIVE.notify) YQNATIVE.notify({ title: "Jarvis", body: msg, tag: "jarvis" }); else if (window.Notification && Notification.permission === "granted" && document.hidden) new Notification("Jarvis", { body: msg }); } catch (e) { }
      if (SETTINGS.autoSpeak) speak(msg);
    });
  }

  // ------------------------------------------------- Excel files made by Jarvis (from data already in the app)
  function makeExcel(o) {
    if (!window.YQJDATA || !window.yqAoaDl) return Promise.reject(new Error("app abhi tayyar nahi"));
    return Promise.resolve(window.YQJDATA()).then(function (D) {
      var what = String(o.what || "ext").toLowerCase(), cu = String(o.customer || "").toLowerCase().trim(), from = o.from || "", to = o.to || "9999", res = String(o.result || "all").toLowerCase(), fl = String(o.floor || "").toLowerCase();
      var inRange = function (d) { d = String(d || ""); return (!from || d >= from) && d <= to; };
      var okRes = function (r) { var p = /^pass/i.test(String(r.result || "")); return res === "all" || (res === "fail" ? !p : res === "pass" ? p : true); };
      var rows, title, n;
      if (/capa/.test(what)) {
        var C = (D.capa || []).filter(function (x) { return (!cu || String(x.customer || "").toLowerCase().indexOf(cu) >= 0) && (res === "all" || (res === "open" ? x.status !== "Closed" : res === "closed" ? x.status === "Closed" : true)); });
        rows = [["No", "Date", "Customer", "YTM", "Issue", "Method", "Owner", "Due", "Status"]].concat(C.map(function (x) { return [x.no || "", x.date || "", x.customer || "", x.ytm || "", x.issue || "", x.method || "", x.owner || "", x.due || "", x.status || ""]; }));
        title = "CAPA"; n = C.length;
      } else if (/int|floor/.test(what)) {
        var I = (D.int || []).filter(function (r) { return inRange(r.date) && okRes(r) && (!fl || String(r.floor || r.unit || "").toLowerCase().indexOf(fl) >= 0) && (!cu || String(r.customer || r.product || "").toLowerCase().indexOf(cu) >= 0); }).sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
        rows = [["Date", "Floor", "Product", "YTM", "Qty", "Checked", "Defects", "Result", "Remarks"]].concat(I.map(function (r) { return [r.date || "", r.floor || r.unit || "", r.product || r.article || "", r.ytm || "", r.qty || "", r.sample || r.checked || "", r.defects || "", r.result || "", r.remarks || ""]; }));
        title = "Internal inspections"; n = I.length;
      } else {
        var E = (D.ext || []).filter(function (r) { return inRange(r.date) && okRes(r) && (!cu || String(r.customer || "").toLowerCase().indexOf(cu) >= 0); }).sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
        rows = [["Date", "Customer", "YTM", "PO", "Article", "Unit", "Qty", "Sample", "Critical", "Major", "Minor", "OQL %", "Result", "Defects"]].concat(E.map(function (r) { return [r.date || "", r.customer || "", r.ytm || "", r.po || "", r.article || "", r.unit || r.bldg || "", +r.qty || "", +r.sample || "", +r.critical || 0, +r.major || 0, +r.minor || 0, r.sample ? Math.round(1000 * (+r.major || 0) / (+r.sample)) / 10 : "", r.result || "", r.defects || ""]; }));
        title = "External inspections"; n = E.length;
      }
      if (!n) throw new Error("is filter mein koi record nahi");
      var nm = [title, o.customer, res !== "all" ? res : "", from ? from + (o.to ? " to " + o.to : "") : ""].filter(Boolean).join(" ").replace(/[\\/:*?"<>|]/g, "-");
      return window.yqAoaDl(nm, rows, nm).then(function () { return nm + " (" + n + " rows) Excel download"; });
    });
  }

  // ------------------------------------------------- welcome
  function greet() {
    if (GREETED) return; GREETED = true;
    var fn = firstName(), t = "Assalam-o-Alaikum" + (fn ? " " + fn + " bhai" : "") + "! Bataiye, kya karna hai?";
    HISTORY.push({ role: "model", text: t }); render();
    if (SETTINGS.autoSpeak) speak(t);
  }


  // ------------------------------------------------- live data context (from this browser)
  // The app already has inspections / CAPA in memory, so Jarvis answers from that and the
  // server does not read Firebase for each question (saves the free daily quota).
  function pct(n, d) { return d ? Math.round(1000 * n / d) / 10 : 0; }
  function isFail(r) { return !/^pass/i.test(String(r.result || "")); }
  function buildCtx(question) {
    if (!window.YQJDATA) return Promise.resolve("");
    return Promise.resolve(window.YQJDATA()).then(function (D) {
      var q = String(question || "").toLowerCase(), out = [], today = new Date().toISOString().slice(0, 10);
      var ago = function (d) { var t = new Date(); t.setDate(t.getDate() - d); return t.toISOString().slice(0, 10); };
      var E = (D.ext || []).filter(function (r) { return r && r.date; }).sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
      var I = (D.int || []).filter(function (r) { return r && r.date; }).sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
      out.push("Today: " + today + ". OQL = major defects / sample size (limit 2.5%). Answer for exactly the period the user asks (\"is mahine\"/this month = " + today.slice(0, 7) + ", \"aaj\" = today, \"kal\" = yesterday). Reply in the user's language, short.");
      var per = function (lab, from, to) { var L = E.filter(function (r) { return r.date >= from && r.date <= to; }), F = L.filter(isFail), c = {}; F.forEach(function (r) { c[r.customer || "?"] = (c[r.customer || "?"] || 0) + 1; });
        out.push(lab + " (" + from + " to " + to + "): " + L.length + " external inspections, " + F.length + " failed" + (F.length ? " — " + Object.keys(c).map(function (k) { return k + " " + c[k]; }).join(", ") : "")); };
      var m0 = today.slice(0, 7) + "-01", pm = new Date(today.slice(0, 7) + "-01T00:00:00Z"); pm.setUTCMonth(pm.getUTCMonth() - 1); var p0 = pm.toISOString().slice(0, 10), p1 = new Date(Date.parse(m0) - 864e5).toISOString().slice(0, 10);
      if (E.length) { per("Today", today, today); per("Last 7 days", ago(7), today); per("This month", m0, today); per("Last month", p0, p1); }
      if (E.length) {
        out.push("\n## External inspections: " + E.length + " records, " + E[E.length - 1].date + " to " + E[0].date);
        var g = {}; E.forEach(function (r) { var k = String(r.date).slice(0, 7) + " | " + (r.customer || "?"), x = g[k] = g[k] || { n: 0, f: 0, s: 0, m: 0 }; x.n++; if (isFail(r)) x.f++; x.s += +r.sample || 0; x.m += +r.major || 0; });
        out.push("Month | Customer | inspections | failed | pass% | OQL%");
        Object.keys(g).sort().reverse().slice(0, 90).forEach(function (k) { var x = g[k]; out.push(k + " | " + x.n + " | " + x.f + " | " + pct(x.n - x.f, x.n) + "% | " + pct(x.m, x.s) + "%"); });
        var dc = {}; E.filter(function (r) { return r.date >= ago(30); }).forEach(function (r) { (r.dlist || []).forEach(function (d) { var k = (r.customer || "?") + " · " + d.n; dc[k] = (dc[k] || 0) + (+d.q || 0); }); });
        var top = Object.keys(dc).sort(function (a, b) { return dc[b] - dc[a]; }).slice(0, 25);
        if (top.length) out.push("\nTop defects last 30 days (customer · defect = pcs): " + top.map(function (k) { return k + " = " + dc[k]; }).join("; "));
        var row = function (r) { return [r.date, r.customer, "YTM " + (r.ytm || ""), "PO " + (r.po || ""), r.article || "", r.unit || r.bldg || "", r.result || "", "OQL " + pct(+r.major || 0, +r.sample || 0) + "%", String(r.defects || "").slice(0, 90)].join(" | "); };
        out.push("\nFailed external inspections (last 120 days):");
        E.filter(function (r) { return isFail(r) && r.date >= ago(120); }).slice(0, 80).forEach(function (r) { out.push(row(r)); });
        var words = q.split(/[^a-z0-9]+/).filter(function (w) { return w.length > 2; });
        var hit = E.filter(function (r) { var t = (String(r.customer) + " " + r.ytm + " " + r.po + " " + r.article).toLowerCase(); return words.some(function (w) { return /\d/.test(w) ? t.indexOf(w) >= 0 : (" " + t + " ").indexOf(" " + w) >= 0 && !/^(the|and|ytm|how|many|kis|kya|aur|hui|hai)$/.test(w); }); });
        if (hit.length) { out.push("\nRecords matching the question words:"); hit.slice(0, 60).forEach(function (r) { out.push(row(r)); }); }
        out.push("\nLatest 30 external inspections:"); E.slice(0, 30).forEach(function (r) { out.push(row(r)); });
      }
      if (I.length) {
        var fl = {}; I.filter(function (r) { return r.date >= ago(30); }).forEach(function (r) { var k = r.floor || r.unit || "?", x = fl[k] = fl[k] || { n: 0, f: 0 }; x.n++; if (isFail(r)) x.f++; });
        out.push("\n## Internal inspections: " + I.length + " records. Last 30 days by floor (inspections | failed): " + Object.keys(fl).map(function (k) { return k + " " + fl[k].n + "|" + fl[k].f; }).join("; "));
        out.push("Failed internal (last 30 days):"); I.filter(function (r) { return isFail(r) && r.date >= ago(30); }).slice(0, 40).forEach(function (r) { out.push([r.date, r.floor || "", r.product || "", "YTM " + (r.ytm || ""), r.result || "", String(r.defects || "").slice(0, 80)].join(" | ")); });
      }
      var C = (D.capa || []).filter(function (x) { return x && x.status !== "Closed"; });
      if (C.length) { out.push("\n## Open CAPA (" + C.length + "):"); C.slice(0, 30).forEach(function (x) { out.push([x.no || "", x.customer || "", x.status || "", "due " + (x.due || ""), String(x.issue || "").slice(0, 100)].join(" | ")); }); }
      var s = out.join("\n"); return s.length > 16000 ? s.slice(0, 16000) : s;
    });
  }

  // ---------------------------------------------------------------- voice in (STT)
  function micUi(on) { LISTENING = on; renderOrb(); renderVoice(); var b = document.querySelector("#jvInputRow .mic"); if (b) b.classList.toggle("on", on); }
  var NATIVE_BAD = false; function nativeMic() { return !!(window.YQNATIVE && window.YQNATIVE.listen) && !NATIVE_BAD; }
  function toggleMic() {
    wakeStop();
    if (LISTENING) { if (nativeMic()) { try { YQNATIVE.stopListen(); } catch (e) { } } if (RECOG) RECOG.stop(); return; }
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (nativeMic()) {
      stopSpeak(); micUi(true);
      YQNATIVE.listen({ lang: SETTINGS.micLang || "ur-PK" }).then(function (r) {
        micUi(false); var t = r && r.text ? String(r.text).trim() : "";
        if (t) { VOICE_MODE = true; sendText(true, t); }
      }).catch(function (e) {
        micUi(false); if (/not implemented|unimplemented/i.test(String(e && e.message || e))) { NATIVE_BAD = true; if (!SR) { HISTORY.push({ role: "sys", text: "Mic ke liye YQI app update karein (Settings → app update)." }); render(); } else toggleMic(); }
      });
      return;
    }
    if (!SR) { HISTORY.push({ role: "sys", text: "Is browser mein mic nahi chalta — Chrome use karein ya YQI app update karein." }); render(); return; }
    RECOG = new SR();
    RECOG.lang = SETTINGS.micLang || "ur-PK"; stopSpeak();
    RECOG.interimResults = false;
    RECOG.maxAlternatives = 1;
    RECOG.onstart = function () { LISTENING = true; renderOrb(); renderVoice(); var b = document.querySelector("#jvInputRow .mic"); if (b) b.classList.add("on"); };
    RECOG.onend = function () { LISTENING = false; renderOrb(); renderVoice(); var b = document.querySelector("#jvInputRow .mic"); if (b) b.classList.remove("on"); };
    RECOG.onresult = function (e) {
      var t = e.results[0][0].transcript;
      VOICE_MODE = true; sendText(true, t);
    };
    RECOG.start();
  }

  // ---------------------------------------------------------------- voice out (TTS)
  // Free, browser-only speech synthesis - no Cloud Text-to-Speech (which needs a
  // billing account). Quality/voice choice depends entirely on the device's own
  // installed voices (Chrome/Android/iOS all ship a decent default set).
  function pickVoice() {
    var voices = (window.speechSynthesis && speechSynthesis.getVoices()) || [];
    if (SETTINGS.voiceURI) {
      var v = voices.filter(function (x) { return x.voiceURI === SETTINGS.voiceURI; })[0];
      if (v) return v;
    }
    var pref = [SETTINGS.languageCode || "ur-PK", "ur-PK", "ur", "hi-IN", "hi", "en-IN"];
    for (var i = 0; i < pref.length; i++) { var g = voices.filter(function (x) { return x.lang && x.lang.toLowerCase().indexOf(pref[i].toLowerCase()) === 0; }); if (g.length) return g.filter(function (x) { return /google|natural|neural/i.test(x.name); })[0] || g[0]; }
    return voices[0];
  }
  function cleanSpeech(t) { return String(t || "").replace(/\*\*|__|`|#+ /g, "").replace(/\[\[[^\]]*\]\]/g, "").replace(/[\u{1F300}-\u{1FAFF}☀-➿]/gu, "").replace(/\s+/g, " ").trim().slice(0, 900); }
  function stopSpeak() { try { if (AUDIO) { AUDIO.pause(); AUDIO = null; } if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) { } SPEAKING = false; renderOrb(); }
  function wavFromPcm(b64, rate) {
    var bin = atob(b64), n = bin.length, buf = new ArrayBuffer(44 + n), v = new DataView(buf), u8 = new Uint8Array(buf, 44), i;
    var w = function (o, s) { for (var k = 0; k < s.length; k++) v.setUint8(o + k, s.charCodeAt(k)); };
    w(0, "RIFF"); v.setUint32(4, 36 + n, true); w(8, "WAVE"); w(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, "data"); v.setUint32(40, n, true);
    for (i = 0; i < n; i++) u8[i] = bin.charCodeAt(i);
    return URL.createObjectURL(new Blob([buf], { type: "audio/wav" }));
  }
  var TTS_MODELS = ["gemini-3.1-flash-tts-preview", "gemini-2.5-flash-preview-tts"], TTS_FAIL = 0;
  function speak(text) {
    text = cleanSpeech(text); if (!text) return;
    stopSpeak(); SPEAKING = true; renderOrb(); renderVoice();
    var done = function () { SPEAKING = false; renderOrb(); renderVoice(); if (!VOPEN && !OPEN) setTimeout(wakeStart, 800); var live = function () { return (VOICE_MODE && OPEN) || VOPEN; }; if (live() && !LISTENING) setTimeout(function () { if (live() && !LISTENING && !BUSY && !PENDING_DO_WAIT()) toggleMic(); }, 350); };
    var browser = function () {
      window.__jvVoice = "browser"; if (!window.speechSynthesis) return done();
      var u = new SpeechSynthesisUtterance(text);
      var v = pickVoice(); if (v) u.voice = v;
      u.lang = (v && v.lang) || SETTINGS.languageCode || "ur-PK";
      u.rate = SETTINGS.speakingRate || 1;
      u.pitch = Math.max(0, Math.min(2, ((SETTINGS.pitch || 0) + 10) / 10));
      u.onend = done; u.onerror = done;
      speechSynthesis.speak(u);
    };
    if (SETTINGS.natural === false || TTS_FAIL > 2) return browser();
    var model = TTS_MODELS[0], my = {};
    AUDIO = my;
    call("/tts", { model: model, voice: SETTINGS.gvoice || "Charon", text: "Read this aloud naturally, like a warm, friendly Pakistani colleague speaking Urdu in a calm conversational tone (not robotic, not too fast). English textile words stay English. Text: " + text })
      .catch(function () { TTS_MODELS.push(TTS_MODELS.shift()); return call("/tts", { model: TTS_MODELS[0], voice: SETTINGS.gvoice || "Charon", text: "Say naturally in friendly Pakistani Urdu: " + text }); })
      .then(function (d) {
        if (AUDIO !== my) return; // interrupted
        var rate = +((/rate=(\d+)/i.exec(d.mime || "") || [])[1] || 24000);
        var a = new Audio(wavFromPcm(d.audio, rate)); AUDIO = a; TTS_FAIL = 0; window.__jvVoice = "natural";
        try { if (!window.__jvAC) window.__jvAC = new (window.AudioContext || window.webkitAudioContext)(); var src = __jvAC.createMediaElementSource(a), an = __jvAC.createAnalyser(); an.fftSize = 256; src.connect(an); an.connect(__jvAC.destination); ANALYSER = an; if (__jvAC.state === "suspended") __jvAC.resume(); } catch (e) { ANALYSER = null; }
        a.onended = function () { AUDIO = null; ANALYSER = null; done(); }; a.onerror = function () { AUDIO = null; browser(); };
        return a.play().catch(function () { AUDIO = null; browser(); });
      }).catch(function () { TTS_FAIL++; if (AUDIO === my) { AUDIO = null; browser(); } });
  }

  // ---------------------------------------------------------------- alerts
  function watchAlerts() {
    try {
      firebase.firestore().collection("assistant_alerts").orderBy("at", "desc").limit(30).onSnapshot(function (snap) {
        ALERTS = snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
        renderOrb(); if (OPEN && TAB === "alerts") render();
      });
    } catch (e) { /* collection may not exist yet, or rules not deployed */ }
  }
  function jobsGet() { try { return JSON.parse(localStorage.getItem("yqi_jvjobs") || "[]"); } catch (e) { return []; } }
  function jobAdd(text) { var L = jobsGet(); L.unshift({ at: Date.now(), text: text, seen: false }); try { localStorage.setItem("yqi_jvjobs", JSON.stringify(L.slice(0, 40))); } catch (e) { } renderOrb(); }
  function jobsHtml() { var L = jobsGet(); if (!L.length) return ""; return '<div class="jvMsg sys" style="text-align:left">Jarvis ne ye kaam kiye</div>' + L.slice(0, 15).map(function (j) { return '<div class="jvCard jvAlert"><b>✓ ' + esc(new Date(j.at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })) + "</b>" + esc(j.text) + "</div>"; }).join(""); }
  function renderAlerts(body) {
    var J = jobsGet(); if (J.some(function (j) { return !j.seen; })) { J.forEach(function (j) { j.seen = true; }); try { localStorage.setItem("yqi_jvjobs", JSON.stringify(J)); } catch (e) { } renderOrb(); }
    if (!ALERTS.length) { body.innerHTML = jobsHtml() + '<div class="jvMsg sys">Koi alert nahi — Jarvis roz OQL, overdue CAPA aur internal data ki kami check karta hai.</div>'; return; }
    body.innerHTML = jobsHtml() + ALERTS.map(function (a) {
      return '<div class="jvCard jvAlert ' + esc(a.severity || "info") + '"><b>' + esc(a.title || "") + "</b>" + esc(a.detail || "") + "</div>";
    }).join("");
  }
  function renderAlertsOld(body) {
    if (!ALERTS.length) { body.innerHTML = '<div class="jvMsg sys">No alerts right now - Jarvis scans daily for OQL breaches, missing YTM numbers, overdue CAPA and gaps in internal inspection data.</div>'; return; }
    body.innerHTML = ALERTS.map(function (a) {
      return '<div class="jvCard jvAlert ' + esc(a.severity || "info") + '"><b>' + esc(a.title || "") + "</b>" + esc(a.detail || "") + "</div>";
    }).join("");
  }

  // ---------------------------------------------------------------- approvals
  function refreshPending() {
    try {
      firebase.firestore().collection("assistant_pending").where("status", "==", "pending").limit(25).get().then(function (snap) {
        PENDING = snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
        renderOrb(); if (OPEN && TAB === "approve") render();
      });
    } catch (e) { }
  }
  function renderApprovals(body) {
    if (!PENDING.length) { body.innerHTML = '<div class="jvMsg sys">No actions waiting for approval.</div>'; return; }
    body.innerHTML = PENDING.map(function (p) {
      return '<div class="jvCard"><b>' + esc(p.tool) + '</b>' + esc(JSON.stringify(p.args)) +
        '<div class="jvRow"><button class="ok" data-ap="' + p.id + '">Approve</button><button class="no" data-rj="' + p.id + '">Reject</button></div></div>';
    }).join("");
    body.querySelectorAll("[data-ap]").forEach(function (b) { b.onclick = function () { approve(b.getAttribute("data-ap")); }; });
    body.querySelectorAll("[data-rj]").forEach(function (b) { b.onclick = function () { reject(b.getAttribute("data-rj")); }; });
  }
  function approve(id) {
    call("/assistantApprove", { pendingId: id }).then(function () { refreshPending(); })
      .catch(function (e) { alert("Could not approve: " + (e && e.message || e)); });
  }
  function reject(id) {
    call("/assistantReject", { pendingId: id }).then(function () { refreshPending(); })
      .catch(function (e) { alert("Could not reject: " + (e && e.message || e)); });
  }

  // ---------------------------------------------------------------- settings / voices
  function loadSettings() {
    if (SETTINGS_LOADED) return;
    SETTINGS_LOADED = true;
    var uid = firebase.auth().currentUser && firebase.auth().currentUser.uid;
    if (!uid) return;
    firebase.firestore().collection("assistant_settings").doc(uid).get().then(function (d) {
      if (d.exists) SETTINGS = Object.assign(SETTINGS, d.data());
    }).catch(function () { });
  }
  function saveSettings() {
    var uid = firebase.auth().currentUser && firebase.auth().currentUser.uid;
    if (!uid) return;
    firebase.firestore().collection("assistant_settings").doc(uid).set(SETTINGS, { merge: true }).catch(function () { });
  }

  function renderSettings(body) {
    body.innerHTML =
      '<div class="lbl">Language / accent</div>' +
      '<select id="jvLang">' +
      ["en-US:English (US)", "en-GB:English (UK)", "en-IN:English (India)", "hi-IN:Hindi", "ur-PK:Urdu"].map(function (x) {
        var kv = x.split(":"); return '<option value="' + kv[0] + '"' + (SETTINGS.languageCode === kv[0] ? " selected" : "") + ">" + kv[1] + "</option>";
      }).join("") +
      "</select>" +
      '<div class="lbl">Voice</div><div id="jvVoices">Loading voices…</div>' +
      '<div class="lbl">Speed (' + (SETTINGS.speakingRate || 1).toFixed(2) + "x)</div>" +
      '<input id="jvRate" type="range" min="0.5" max="2" step="0.05" value="' + (SETTINGS.speakingRate || 1) + '">' +
      '<div class="lbl">Pitch (' + (SETTINGS.pitch || 0) + ")</div>" +
      '<input id="jvPitch" type="range" min="-10" max="10" step="1" value="' + (SETTINGS.pitch || 0) + '">' +
      '<div class="lbl">Speak answers out loud</div>' +
      '<label style="display:flex;align-items:center;gap:8px"><input id="jvAuto" type="checkbox"' + (SETTINGS.autoSpeak ? " checked" : "") + "> Auto-speak Jarvis replies</label>" +
      '<label style="display:flex;align-items:center;gap:8px;margin-top:8px"><input id="jvWake" type="checkbox"' + (wakeAllowed() ? " checked" : "") + '> "Jarvis" bolne se jaage (app khuli ho, computer/Chrome)</label>' +
      '<label style="display:flex;align-items:center;gap:8px;margin-top:8px"><input id="jvNat" type="checkbox"' + (SETTINGS.natural !== false ? " checked" : "") + "> Natural voice (online, Urdu)</label>" +
      '<div class="lbl">Jarvis ki awaaz</div><select id="jvGv">' + [["Charon", "Charon — mard, saaf"], ["Orus", "Orus — mard, gehri"], ["Puck", "Puck — mard, josh wali"], ["Fenrir", "Fenrir — mard, tez"], ["Kore", "Kore — aurat, saaf"], ["Aoede", "Aoede — aurat, naram"]].map(function (v) { return '<option value="' + v[0] + '"' + ((SETTINGS.gvoice || "Charon") === v[0] ? " selected" : "") + ">" + v[1] + "</option>"; }).join("") + "</select>" +
      '<div class="lbl">Mic ki zabaan</div><select id="jvMl">' + [["ur-PK", "Urdu"], ["en-US", "English"], ["hi-IN", "Hindi"]].map(function (v) { return '<option value="' + v[0] + '"' + ((SETTINGS.micLang || "ur-PK") === v[0] ? " selected" : "") + ">" + v[1] + "</option>"; }).join("") + "</select>" +
      '<div class="jvMsg sys" style="margin-top:14px;text-align:left">Voices listed here are your device\'s own free built-in voices (no card, no cloud cost) - the set varies by phone/browser. Urdu/Hindi voices, where installed, read Roman Urdu text phonetically rather than natively.</div>';

    body.querySelector("#jvLang").onchange = function (e) { SETTINGS.languageCode = e.target.value; SETTINGS.voiceURI = ""; saveSettings(); loadVoices(); };
    body.querySelector("#jvRate").oninput = function (e) { SETTINGS.speakingRate = +e.target.value; saveSettings(); };
    body.querySelector("#jvPitch").oninput = function (e) { SETTINGS.pitch = +e.target.value; saveSettings(); };
    body.querySelector("#jvAuto").onchange = function (e) { SETTINGS.autoSpeak = !!e.target.checked; saveSettings(); };
    body.querySelector("#jvWake").onchange = function (e) { SETTINGS.wake = !!e.target.checked; saveSettings(); if (SETTINGS.wake) setTimeout(wakeStart, 300); else wakeStop(); };
    body.querySelector("#jvNat").onchange = function (e) { SETTINGS.natural = !!e.target.checked; saveSettings(); };
    body.querySelector("#jvGv").onchange = function (e) { SETTINGS.gvoice = e.target.value; saveSettings(); speak("Assalam-o-Alaikum, main Jarvis hoon. Ye meri nayi awaaz hai."); };
    body.querySelector("#jvMl").onchange = function (e) { SETTINGS.micLang = e.target.value; saveSettings(); };
    loadVoices();
  }

  function loadVoices() {
    var el = $("jvVoices"); if (!el || !window.speechSynthesis) { if (el) el.innerHTML = '<div class="jvMsg sys">Voice output isn\'t supported in this browser.</div>'; return; }
    var voices = speechSynthesis.getVoices();
    if (!voices.length) {
      // Chrome loads voices asynchronously the first time.
      speechSynthesis.onvoiceschanged = function () { loadVoices(); };
      el.innerHTML = '<div class="jvMsg sys">Loading voices…</div>';
      return;
    }
    paintVoices(voices.filter(function (v) { return v.lang && v.lang.indexOf(SETTINGS.languageCode.split("-")[0]) === 0; }).concat(voices).slice(0, 20));
  }
  function paintVoices(voices) {
    var el = $("jvVoices"); if (!el) return;
    if (!voices.length) { el.innerHTML = '<div class="jvMsg sys">No voices found on this device.</div>'; return; }
    var seen = {};
    voices = voices.filter(function (v) { if (seen[v.voiceURI]) return false; seen[v.voiceURI] = 1; return true; });
    el.innerHTML = voices.map(function (v) {
      return '<div class="jvVoiceRow"><span style="flex:1">' + esc(v.name) + " · " + esc(v.lang) + '</span><button data-v="' + esc(v.voiceURI) + '">▶ Preview</button><button data-pick="' + esc(v.voiceURI) + '" style="background:var(--acc,#3D6B22);color:#fff">' + (SETTINGS.voiceURI === v.voiceURI ? "Selected" : "Use") + "</button></div>";
    }).join("");
    el.querySelectorAll("[data-v]").forEach(function (b) {
      b.onclick = function () {
        var uri = b.getAttribute("data-v"), v = voices.filter(function (x) { return x.voiceURI === uri; })[0];
        var u = new SpeechSynthesisUtterance("This is a preview of the Jarvis voice for YQI.");
        if (v) u.voice = v;
        speechSynthesis.speak(u);
      };
    });
    el.querySelectorAll("[data-pick]").forEach(function (b) {
      b.onclick = function () { SETTINGS.voiceURI = b.getAttribute("data-pick"); saveSettings(); renderSettings($("jvBody")); };
    });
  }

  // ---------------------------------------------------------------- "Hey Jarvis" wake word (browser only, while YQI is open)
  var WAKE = null, WAKE_WANT = false;
  var WAKE_RE = /(jarvis|jarwis|jervis|jarvi|jaarvis|جاروس|جارویس|جاروِس|جاروز|جاروِز|جارس|جاروی)/i;
  function wakeAllowed() { return SETTINGS.wake !== false && (SETTINGS.wake === true || window.YQLV === "auth") && !window.YQNATIVE && (window.SpeechRecognition || window.webkitSpeechRecognition); }
  function wakeStop() { WAKE_WANT = false; try { if (WAKE) WAKE.abort(); } catch (e) { } WAKE = null; }
  function wakeStart() {
    if (!wakeAllowed() || VOPEN || OPEN || LISTENING || SPEAKING || document.hidden || WAKE) return;
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    try {
      var w = new SR(); WAKE = w; WAKE_WANT = true;
      w.lang = SETTINGS.micLang || "ur-PK"; w.continuous = true; w.interimResults = true;
      w.onresult = function (e) {
        for (var i = e.resultIndex; i < e.results.length; i++) {
          var t = e.results[i][0].transcript || "", m = WAKE_RE.exec(t);
          if (!m) continue;
          if (!e.results[i].isFinal) continue;
          var rest = t.slice(m.index + m[0].length).replace(/^[\s,،.!?]+/, "").trim();
          wakeStop(); openVoice({ wake: true, said: rest.split(/\s+/).length >= 2 ? rest : "" }); return;
        }
      };
      w.onerror = function (e) { if (e && (e.error === "not-allowed" || e.error === "service-not-allowed")) { SETTINGS.wake = false; WAKE_WANT = false; } };
      w.onend = function () { WAKE = null; if (WAKE_WANT || wakeAllowed()) setTimeout(wakeStart, 600); };
      w.start();
    } catch (e) { WAKE = null; }
  }
  document.addEventListener("visibilitychange", function () { if (document.hidden) wakeStop(); else setTimeout(wakeStart, 800); });

  // ---------------------------------------------------------------- full-screen voice mode
  var VOPEN = false, ANALYSER = null, VRAF = 0;
  function PENDING_DO_WAIT() { return false; }
  var VCSS = "#jvVoice{position:fixed;inset:0;z-index:2147483647;background:radial-gradient(ellipse at 50% 42%,#13301f 0%,#07120c 55%,#030806 100%);color:#e9f5ec;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Manrope,sans-serif;animation:jvFade .35s ease;padding:40px 16px calc(120px + env(safe-area-inset-bottom,0px));box-sizing:border-box}" +
    "@keyframes jvFade{from{opacity:0}to{opacity:1}}" +
    "#jvVoice canvas{width:min(72vw,380px,44vh);height:min(72vw,380px,44vh)}" +
    "#jvVoice .vst{font:600 12px Manrope;letter-spacing:.22em;text-transform:uppercase;color:#8fd19a;margin-top:6px;min-height:16px}" +
    "#jvVoice .vme{max-width:min(86vw,640px);text-align:center;color:#9fb6a6;font-size:14px;margin-top:16px;min-height:20px}" +
    "#jvVoice .vai{max-width:min(88vw,680px);text-align:center;font-size:clamp(17px,2.4vw,22px);line-height:1.45;margin-top:10px;min-height:32px;max-height:24vh;overflow:auto;white-space:pre-wrap}" +
    "#jvVoice .vbar{position:absolute;bottom:calc(28px + env(safe-area-inset-bottom,0px));display:flex;gap:18px;align-items:center}" +
    "#jvVoice .vbar button{width:56px;height:56px;border-radius:50%;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.07);color:#fff;font-size:22px;cursor:pointer}" +
    "#jvVoice .vbar button.mic{width:72px;height:72px;font-size:28px;background:#2f7d4a;border-color:#4fb06c}" +
    "#jvVoice .vbar button.mic.on{background:#c0392b;border-color:#e57364}" +
    "#jvVoice .vdo{margin-top:16px;display:flex;gap:10px}#jvVoice .vdo button{border:none;border-radius:22px;padding:10px 22px;font:700 14px Manrope;cursor:pointer}#jvVoice .vdo .ok{background:#4fb06c;color:#fff}#jvVoice .vdo .no{background:rgba(255,255,255,.12);color:#fff}" +
    "#jvVoice .vtop{position:absolute;top:calc(14px + env(safe-area-inset-top,0px));left:18px;right:18px;display:flex;justify-content:space-between;align-items:center;color:#8fb59a;font:700 13px Manrope;letter-spacing:.12em}";
  function openVoice(opt) {
    opt = opt || {};
    if (VOPEN) return; VOPEN = true; loadSettings(); wakeStop();
    if (!$("jvVCss")) { var st = document.createElement("style"); st.id = "jvVCss"; st.textContent = VCSS; document.head.appendChild(st); }
    var v = document.createElement("div"); v.id = "jvVoice";
    v.innerHTML = '<div class="vtop"><span>✦ JARVIS</span><span></span></div><canvas width="760" height="760"></canvas><div class="vst"></div><div class="vme"></div><div class="vai"></div><div class="vdo"></div>' +
      '<div class="vbar"><button data-vchat title="Chat / likh kar">💬</button><button class="mic" data-vmic title="Boliye">🎤</button><button data-vx title="Band">✕</button></div>';
    document.body.appendChild(v);
    v.querySelector("[data-vx]").onclick = function () { closeVoice(); };
    v.querySelector("[data-vchat]").onclick = function () { closeVoice(); openPanel(); };
    v.querySelector("[data-vmic]").onclick = function () { if (SPEAKING) { stopSpeak(); } VOICE_MODE = true; toggleMic(); };
    VOICE_MODE = true;
    drawOrb(); renderVoice();
    if (opt.said) { GREETED = true; sendText(true, opt.said); }
    else if (opt.wake) { GREETED = true; var fn = firstName(), t = "Ji" + (fn ? " " + fn + " bhai" : "") + "?"; HISTORY.push({ role: "model", text: t }); render(); speak(t); }
    else if (!GREETED) greet(); else if (!LISTENING && !SPEAKING && !BUSY) toggleMic();
  }
  function closeVoice(keepTalk) {
    if (!VOPEN) return; VOPEN = false; cancelAnimationFrame(VRAF);
    if (!keepTalk) { VOICE_MODE = false; stopSpeak(); try { if (RECOG && LISTENING) RECOG.stop(); } catch (e) { } }
    var v = $("jvVoice"); if (v) v.remove();
    setTimeout(wakeStart, 1500);
  }
  function renderVoice() {
    var v = $("jvVoice"); if (!v) return;
    var st = BUSY ? "Soch raha hoon…" : SPEAKING ? "Bol raha hoon" : LISTENING ? "Sun raha hoon…" : "Mic dabakar boliye";
    v.querySelector(".vst").textContent = st;
    var lastU = null, lastA = null; for (var i = HISTORY.length - 1; i >= 0; i--) { var m = HISTORY[i]; if (!lastA && (m.role === "model" || m.role === "sys")) lastA = m; if (!lastU && m.role === "user") lastU = m; if (lastA && lastU) break; }
    v.querySelector(".vme").textContent = lastU ? "“" + lastU.text + "”" : "";
    v.querySelector(".vai").innerHTML = lastA ? esc(lastA.text).replace(/\*\*([^*\n]+)\*\*/g, "<b>$1</b>") : "";
    var mic = v.querySelector("[data-vmic]"); if (mic) mic.classList.toggle("on", LISTENING);
    var d = v.querySelector(".vdo");
    if (PENDING_DO) {
      d.innerHTML = '<button class="ok" data-vy>Haan, karo</button><button class="no" data-vn>Nahi</button>';
      d.querySelector("[data-vy]").onclick = function () { var P = PENDING_DO; PENDING_DO = null; HISTORY = HISTORY.filter(function (m) { return m.role !== "do"; }); if (P) runSteps(P.steps); };
      d.querySelector("[data-vn]").onclick = function () { PENDING_DO = null; HISTORY = HISTORY.filter(function (m) { return m.role !== "do"; }); HISTORY.push({ role: "model", text: "Theek hai, nahi karta." }); render(); };
    } else d.innerHTML = "";
  }
  // animated orb: breathes when idle, ripples when listening, spins when thinking, follows the voice when speaking
  function drawOrb() {
    var v = $("jvVoice"); if (!v) return; var c = v.querySelector("canvas"), g = c.getContext("2d"), W = c.width, H = c.height, t0 = performance.now(), buf = new Uint8Array(128), lvl = 0;
    var frame = function (now) {
      if (!VOPEN) return; var t = (now - t0) / 1000, amp = 0;
      if (SPEAKING) { if (ANALYSER) { ANALYSER.getByteFrequencyData(buf); var sum = 0; for (var i = 2; i < 60; i++) sum += buf[i]; amp = Math.min(1, sum / (58 * 150)); } else amp = 0.35 + 0.25 * Math.abs(Math.sin(t * 7.3) * Math.sin(t * 3.1)); }
      else if (LISTENING) amp = 0.18 + 0.12 * Math.sin(t * 4);
      else if (BUSY) amp = 0.12;
      else amp = 0.06 + 0.04 * Math.sin(t * 1.6);
      lvl += (amp - lvl) * 0.18;
      g.clearRect(0, 0, W, H); var cx = W / 2, cy = H / 2, R = W * 0.25 * (1 + lvl * 0.35);
      // glow
      var gr = g.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.9); gr.addColorStop(0, "rgba(120,230,150," + (0.35 + lvl * 0.4) + ")"); gr.addColorStop(1, "rgba(20,60,35,0)"); g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, R * 1.9, 0, 7); g.fill();
      // flowing rings
      for (var k = 0; k < 4; k++) {
        g.beginPath(); var n = 90;
        for (var j = 0; j <= n; j++) { var a = j / n * Math.PI * 2, wob = Math.sin(a * (3 + k) + t * (1.2 + k * 0.5) * (BUSY ? 3 : 1)) * (6 + lvl * 46) + Math.cos(a * (2 + k) - t * 0.9) * (4 + lvl * 20), rr = R * (0.78 + k * 0.09) + wob; var x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr; if (j) g.lineTo(x, y); else g.moveTo(x, y); }
        g.strokeStyle = ["rgba(170,255,190,.85)", "rgba(110,220,150,.55)", "rgba(80,190,200,.4)", "rgba(200,255,160,.28)"][k]; g.lineWidth = 3 - k * 0.5; g.stroke();
      }
      // core
      var cg = g.createRadialGradient(cx - R * 0.25, cy - R * 0.3, R * 0.05, cx, cy, R * 0.75); cg.addColorStop(0, "#d9ffe0"); cg.addColorStop(0.45, "#5ec27a"); cg.addColorStop(1, "#14432a"); g.fillStyle = cg; g.beginPath(); g.arc(cx, cy, R * 0.62, 0, 7); g.fill();
      if (LISTENING) { var p = (t % 1.4) / 1.4; g.strokeStyle = "rgba(160,255,180," + (1 - p) * 0.6 + ")"; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, R * (0.9 + p * 0.9), 0, 7); g.stroke(); }
      VRAF = requestAnimationFrame(frame);
    };
    VRAF = requestAnimationFrame(frame);
  }

  // ---------------------------------------------------------------- boot
  var tries = 0;
  (function wait() {
    if (ready()) {
      if (!staffOK()) return; // guests / customers don't get Jarvis
      injectCss(); buildOrb(); watchAlerts(); refreshPending(); loadSettings(); setTimeout(wakeStart, 4000);
      return;
    }
    if (tries++ > 600) return; // ~60s, then give up quietly
    setTimeout(wait, 100);
  })();
})();
