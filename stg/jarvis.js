// ===== Jarvis: YQI's built-in AI assistant (RAG + agentic tools + voice) =====
// Loaded on every screen (see index.html). Talks to a free Cloudflare Worker backend
// (see /cf-worker) - no Firebase Blaze plan or card required. Voice output uses the
// browser's own free speech synthesis (no Cloud Text-to-Speech, which needs billing).
// Visible only to staff accounts (qc/qa/auth - same gate as the rest of the app's
// company data), matching the backend's own role check.
(function () {
  "use strict";
  // Set this to your deployed Worker's URL after `wrangler deploy` (see
  // docs/JARVIS-SETUP.md) - e.g. "https://yqi-jarvis.<your-subdomain>.workers.dev"
  var WORKER_URL = window.JARVIS_WORKER_URL || "https://yqi-jarvis.workers.dev";

  var SETTINGS = { voiceURI: "", languageCode: "en-US", speakingRate: 1, pitch: 0, autoSpeak: true };
  var HISTORY = [], OPEN = false, BUSY = false, SETTINGS_LOADED = false;
  var RECOG = null, LISTENING = false, SPEAKING = false;
  var ALERTS = [], PENDING = [];
  var SID = "s" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  function ready() {
    return !!(window.FS && window.EMAIL && window.firebase && typeof window.YQLV !== "undefined");
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
    "#jvOrb{position:fixed;z-index:9000;right:16px;bottom:calc(86px + env(safe-area-inset-bottom,0px));width:58px;height:58px;border-radius:50%;background:radial-gradient(circle at 30% 30%,#9BE58A,#3D6B22 70%);box-shadow:0 6px 20px rgba(17,30,24,.35);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;font-size:26px}" +
    "@media(min-width:900px){#jvOrb{bottom:24px;right:28px}}" +
    "#jvOrb .jvBadge{position:absolute;top:-2px;right:-2px;min-width:18px;height:18px;border-radius:9px;background:#D64545;color:#fff;font:700 10.5px/18px Manrope,sans-serif;text-align:center;padding:0 4px}" +
    "#jvOrb.listening{animation:jvPulse 1.2s infinite}#jvOrb.speaking{animation:jvPulse .6s infinite}" +
    "@keyframes jvPulse{0%{box-shadow:0 0 0 0 rgba(155,229,138,.6)}100%{box-shadow:0 0 0 18px rgba(155,229,138,0)}}" +
    "#jvPanel{position:fixed;z-index:9001;right:0;bottom:0;left:0;top:0;background:rgba(10,20,14,.35);display:flex;align-items:flex-end;justify-content:flex-end}" +
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
    var unread = ALERTS.filter(function (a) { return !(a.read && uid && a.read[uid]); }).length + PENDING.length;
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
    b.onclick = togglePanel;
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
      '<div class="jvHead"><span style="font-size:20px">✦</span><b>Jarvis</b><button data-x title="Close">✕</button></div>' +
      '<div id="jvTabs">' +
      '<button data-t="chat" class="on">Chat</button>' +
      '<button data-t="alerts">Alerts</button>' +
      '<button data-t="approve">Approvals</button>' +
      '<button data-t="settings">Voice &amp; settings</button>' +
      "</div>" +
      '<div id="jvBody"></div>' +
      '<div id="jvInputRow"><button class="mic" data-mic title="Speak">🎤</button><input id="jvInput" placeholder="Ask Jarvis about inspections, OQL, CAPA…"><button data-send title="Send">➤</button></div>' +
      "</div>";
    document.body.appendChild(o);
    o.addEventListener("click", function (e) { if (e.target === o) closePanel(); });
    o.querySelector("[data-x]").onclick = closePanel;
    o.querySelectorAll("#jvTabs button").forEach(function (btn) {
      btn.onclick = function () { TAB = btn.getAttribute("data-t"); o.querySelectorAll("#jvTabs button").forEach(function (x) { x.classList.toggle("on", x === btn); }); render(); };
    });
    o.querySelector("[data-send]").onclick = sendText;
    o.querySelector("#jvInput").addEventListener("keydown", function (e) { if (e.key === "Enter") sendText(); });
    o.querySelector("[data-mic]").onclick = toggleMic;
    render();
    renderOrb();
  }
  function closePanel() { OPEN = false; var p = $("jvPanel"); if (p) p.remove(); }

  function render() {
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
      return '<div class="jvMsg ' + (m.role === "user" ? "me" : "ai") + '">' + esc(m.text) + "</div>";
    }).join("") + (BUSY ? '<div class="jvMsg ai"><span class="jvDot"></span><span class="jvDot"></span><span class="jvDot"></span></div>' : "");
    body.scrollTop = body.scrollHeight;
  }

  function sendText() {
    var inp = $("jvInput"); if (!inp) return;
    var text = inp.value.trim(); if (!text || BUSY) return;
    inp.value = "";
    HISTORY.push({ role: "user", text: text });
    if (TAB === "chat") render();
    ask(text);
  }

  function ask(text) {
    BUSY = true; render();
    var geminiHistory = HISTORY.filter(function (m) { return m.role === "user" || m.role === "model"; }).slice(-10).map(function (m) {
      return { role: m.role === "user" ? "user" : "model", parts: [{ text: m.text }] };
    });
    call("/assistantChat", { text: text, history: geminiHistory.slice(0, -1), scope: { sessionId: SID } }).then(function (d) {
      HISTORY.push({ role: "model", text: d.text || "(no answer)" });
      BUSY = false; render();
      if (d.pendingActions && d.pendingActions.length) {
        HISTORY.push({ role: "sys", text: d.pendingActions.length + " action(s) queued for approval - see the Approvals tab." });
        refreshPending();
      }
      if (SETTINGS.autoSpeak && d.text) speak(d.text);
    }).catch(function (e) {
      BUSY = false;
      HISTORY.push({ role: "sys", text: "Jarvis couldn't answer: " + (e && e.message || e) });
      render();
    });
  }

  // ---------------------------------------------------------------- voice in (STT)
  function toggleMic() {
    if (LISTENING) { if (RECOG) RECOG.stop(); return; }
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { HISTORY.push({ role: "sys", text: "Voice input isn't supported in this browser." }); render(); return; }
    RECOG = new SR();
    RECOG.lang = SETTINGS.languageCode || "en-US";
    RECOG.interimResults = false;
    RECOG.maxAlternatives = 1;
    RECOG.onstart = function () { LISTENING = true; renderOrb(); var b = document.querySelector("#jvInputRow .mic"); if (b) b.classList.add("on"); };
    RECOG.onend = function () { LISTENING = false; renderOrb(); var b = document.querySelector("#jvInputRow .mic"); if (b) b.classList.remove("on"); };
    RECOG.onresult = function (e) {
      var t = e.results[0][0].transcript;
      var inp = $("jvInput"); if (inp) { inp.value = t; sendText(); }
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
    return voices.filter(function (x) { return x.lang && x.lang.indexOf(SETTINGS.languageCode.split("-")[0]) === 0; })[0] || voices[0];
  }
  function speak(text) {
    if (!text || !window.speechSynthesis) return;
    SPEAKING = true; renderOrb();
    var done = function () { SPEAKING = false; renderOrb(); };
    var u = new SpeechSynthesisUtterance(text);
    var v = pickVoice(); if (v) u.voice = v;
    u.lang = SETTINGS.languageCode || "en-US";
    u.rate = SETTINGS.speakingRate || 1;
    u.pitch = Math.max(0, Math.min(2, ((SETTINGS.pitch || 0) + 10) / 10));
    u.onend = done; u.onerror = done;
    speechSynthesis.speak(u);
  }

  // ---------------------------------------------------------------- alerts
  function watchAlerts() {
    try {
      FS.collection("assistant_alerts").orderBy("at", "desc").limit(30).onSnapshot(function (snap) {
        ALERTS = snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
        renderOrb(); if (OPEN && TAB === "alerts") render();
      });
    } catch (e) { /* collection may not exist yet, or rules not deployed */ }
  }
  function renderAlerts(body) {
    if (!ALERTS.length) { body.innerHTML = '<div class="jvMsg sys">No alerts right now - Jarvis scans daily for OQL breaches, missing YTM numbers, overdue CAPA and gaps in internal inspection data.</div>'; return; }
    body.innerHTML = ALERTS.map(function (a) {
      return '<div class="jvCard jvAlert ' + esc(a.severity || "info") + '"><b>' + esc(a.title || "") + "</b>" + esc(a.detail || "") + "</div>";
    }).join("");
  }

  // ---------------------------------------------------------------- approvals
  function refreshPending() {
    try {
      FS.collection("assistant_pending").where("status", "==", "pending").limit(25).get().then(function (snap) {
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
    FS.collection("assistant_settings").doc(uid).get().then(function (d) {
      if (d.exists) SETTINGS = Object.assign(SETTINGS, d.data());
    }).catch(function () { });
  }
  function saveSettings() {
    var uid = firebase.auth().currentUser && firebase.auth().currentUser.uid;
    if (!uid) return;
    FS.collection("assistant_settings").doc(uid).set(SETTINGS, { merge: true }).catch(function () { });
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
      '<div class="jvMsg sys" style="margin-top:14px;text-align:left">Voices listed here are your device\'s own free built-in voices (no card, no cloud cost) - the set varies by phone/browser. Urdu/Hindi voices, where installed, read Roman Urdu text phonetically rather than natively.</div>';

    body.querySelector("#jvLang").onchange = function (e) { SETTINGS.languageCode = e.target.value; SETTINGS.voiceURI = ""; saveSettings(); loadVoices(); };
    body.querySelector("#jvRate").oninput = function (e) { SETTINGS.speakingRate = +e.target.value; saveSettings(); };
    body.querySelector("#jvPitch").oninput = function (e) { SETTINGS.pitch = +e.target.value; saveSettings(); };
    body.querySelector("#jvAuto").onchange = function (e) { SETTINGS.autoSpeak = !!e.target.checked; saveSettings(); };
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

  // ---------------------------------------------------------------- boot
  var tries = 0;
  (function wait() {
    if (ready()) {
      if (!staffOK()) return; // guests / customers don't get Jarvis
      injectCss(); buildOrb(); watchAlerts(); refreshPending();
      return;
    }
    if (tries++ > 600) return; // ~60s, then give up quietly
    setTimeout(wait, 100);
  })();
})();
