/*
 * EVIO Assistant - floating chat widget
 * Usage: add this before </body> in your HTML
 *   <script>window.EVIO_CHAT_API = "http://localhost:3000/api/chat";</script>
 *   <script src="evio-chatbot.js"></script>
 * Change the colours in the :root block below to match your app.
 */
(function () {
  var API_URL = window.EVIO_CHAT_API || "/api/chat";
  var STORE_KEY = "evio_chat_history";

  var css = `
  .evc-root{--evc-ink:#EFF0F4;--evc-accent:#0A26E6;--evc-accent-dark:#2B39A6;--evc-bg:#090D18;--evc-soft:#05050D;--evc-line:rgba(158, 164, 192, 0.16);--evc-user:#0A26E6;--evc-user-text:#EFF0F4;
    position:fixed;right:20px;bottom:20px;z-index:99999;font-family:inherit;font-size:15px;line-height:1.45;color:var(--evc-ink)}
  .evc-root *{box-sizing:border-box}
  .evc-fab{width:56px;height:56px;border-radius:50%;border:1px solid rgba(158,164,192,0.25);background:linear-gradient(135deg, #0A26E6 0%, #2B39A6 100%);color:#EFF0F4;cursor:pointer;display:grid;place-items:center;box-shadow:0 8px 25px -4px rgba(10, 38, 230, 0.65), 0 0 15px rgba(10, 38, 230, 0.35);transition:transform .2s ease, box-shadow .2s ease;}
  .evc-fab:hover{transform:scale(1.06);box-shadow:0 12px 30px -4px rgba(10, 38, 230, 0.85), 0 0 25px rgba(43, 57, 166, 0.5);}
  .evc-fab svg{width:26px;height:26px}
  .evc-panel{position:absolute;right:0;bottom:72px;width:372px;max-width:calc(100vw - 24px);height:540px;max-height:calc(100vh - 110px);background:var(--evc-bg);border:1px solid var(--evc-line);border-radius:16px;box-shadow:0 14px 40px rgba(18,48,59,.24);display:none;flex-direction:column;overflow:hidden}
  .evc-panel.evc-open{display:flex;animation:evc-pop .18s ease-out}
  @keyframes evc-pop{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  .evc-head{display:flex;align-items:center;gap:10px;padding:14px 16px;background:var(--evc-ink);color:#fff}
  .evc-head-dot{width:34px;height:34px;border-radius:50%;background:var(--evc-accent);display:grid;place-items:center;flex:none}
  .evc-head-dot svg{width:18px;height:18px}
  .evc-head-title{font-weight:600;font-size:15px}
  .evc-head-sub{font-size:12px;opacity:.75}
  .evc-head-text{flex:1;min-width:0}
  .evc-icon-btn{background:transparent;border:0;color:#fff;cursor:pointer;padding:6px;border-radius:8px;opacity:.8}
  .evc-icon-btn:hover{opacity:1;background:rgba(255,255,255,.12)}
  .evc-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;background:var(--evc-soft)}
  .evc-msg{max-width:86%;padding:10px 13px;border-radius:14px;word-wrap:break-word;overflow-wrap:anywhere}
  .evc-bot{align-self:flex-start;background:var(--evc-bg);border:1px solid var(--evc-line);border-bottom-left-radius:4px}
  .evc-user{align-self:flex-end;background:var(--evc-user);color:var(--evc-user-text);border-bottom-right-radius:4px}
  .evc-msg ul{margin:6px 0 2px;padding-left:18px}
  .evc-msg p{margin:0 0 6px}.evc-msg p:last-child{margin:0}
  .evc-err{align-self:flex-start;color:#9b1c1c;background:#fdecec;border:1px solid #f3c4c4;font-size:13px}
  .evc-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:2px}
  .evc-chip{border:1px solid var(--evc-accent);color:var(--evc-accent-dark);background:var(--evc-bg);border-radius:999px;padding:6px 12px;font:inherit;font-size:13px;cursor:pointer}
  .evc-chip:hover{background:var(--evc-accent);color:#fff}
  .evc-typing{display:inline-flex;gap:4px;align-items:center;height:18px}
  .evc-typing i{width:6px;height:6px;border-radius:50%;background:var(--evc-accent);animation:evc-blink 1s infinite ease-in-out}
  .evc-typing i:nth-child(2){animation-delay:.15s}.evc-typing i:nth-child(3){animation-delay:.3s}
  @keyframes evc-blink{0%,80%,100%{opacity:.25}40%{opacity:1}}
  .evc-form{display:flex;gap:8px;padding:12px;border-top:1px solid var(--evc-line);background:var(--evc-bg)}
  .evc-input{flex:1;resize:none;border:1px solid var(--evc-line);border-radius:12px;padding:10px 12px;font:inherit;color:inherit;max-height:96px;min-height:42px}
  .evc-input:focus{outline:2px solid var(--evc-accent);outline-offset:0;border-color:transparent}
  .evc-send{border:0;border-radius:12px;background:var(--evc-accent);color:#fff;padding:0 14px;cursor:pointer;font:inherit;font-weight:600}
  .evc-send:hover{background:var(--evc-accent-dark)}
  .evc-send:disabled{opacity:.5;cursor:not-allowed}
  .evc-fab:focus-visible,.evc-send:focus-visible,.evc-chip:focus-visible,.evc-icon-btn:focus-visible{outline:3px solid #f2b705;outline-offset:2px}
  .evc-note{font-size:11px;color:#5d7680;text-align:center;padding:0 12px 10px;background:var(--evc-bg)}
  @media (max-width:480px){
    .evc-root{right:12px;bottom:12px}
    .evc-panel{position:fixed;right:8px;left:8px;bottom:80px;width:auto;max-width:none;height:calc(100vh - 100px)}
  }
  @media (prefers-reduced-motion:reduce){.evc-panel.evc-open,.evc-typing i{animation:none}}
  `;

  var BOLT = '<img src="assets/evio-logo-icon.png" alt="EVIO" style="width:28px;height:28px;object-fit:contain;pointer-events:none;filter:drop-shadow(0 0 6px rgba(255,255,255,0.4));">';
  var CLOSE = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  var CLEAR = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>';

  var GREETING = "Namaste! Main EVIO Assistant hun. Charging, battery, range ya app se related koi bhi EV problem puchiye.";
  var SUGGESTIONS = [
    "Meri EV slow charge ho rahi hai",
    "Battery life kaise badhayein?",
    "TPMS warning aa rahi hai",
    "Slot kaise book karein?"
  ];

  var history = [];
  var busy = false;

  function load() {
    try { history = JSON.parse(sessionStorage.getItem(STORE_KEY)) || []; } catch (e) { history = []; }
  }
  function save() {
    try { sessionStorage.setItem(STORE_KEY, JSON.stringify(history.slice(-20))); } catch (e) {}
  }

  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  // Safe mini-markdown: escape first, then allow **bold**, bullet lists and paragraphs
  function render(text) {
    var lines = esc(text).split(/\r?\n/), out = "", inList = false;
    lines.forEach(function (line) {
      var m = line.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)/);
      if (m) {
        if (!inList) { out += "<ul>"; inList = true; }
        out += "<li>" + m[1] + "</li>";
      } else {
        if (inList) { out += "</ul>"; inList = false; }
        if (line.trim()) out += "<p>" + line + "</p>";
      }
    });
    if (inList) out += "</ul>";
    return out.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  }

  function build() {
    var style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    var root = document.createElement("div");
    root.className = "evc-root";
    root.innerHTML =
      '<div class="evc-panel" id="evc-panel" role="dialog" aria-label="EVIO Assistant">' +
        '<div class="evc-head">' +
          '<div class="evc-head-dot">' + BOLT + '</div>' +
          '<div class="evc-head-text"><div class="evc-head-title">EVIO Assistant</div><div class="evc-head-sub">EV charging aur battery help</div></div>' +
          '<button class="evc-icon-btn" id="evc-clear" type="button" aria-label="Clear chat" title="Clear chat">' + CLEAR + '</button>' +
          '<button class="evc-icon-btn" id="evc-close" type="button" aria-label="Close chat">' + CLOSE + '</button>' +
        '</div>' +
        '<div class="evc-msgs" id="evc-msgs" aria-live="polite"></div>' +
        '<div class="evc-form">' +
          '<textarea class="evc-input" id="evc-input" rows="1" maxlength="1000" placeholder="Apna EV sawaal likhiye..." aria-label="Message"></textarea>' +
          '<button class="evc-send" id="evc-send" type="button">Send</button>' +
        '</div>' +
        '<div class="evc-note">Emergency (dhuan, jalne ki smell, battery swelling) me gaadi band karke service centre ko call karein.</div>' +
      '</div>' +
      '<button class="evc-fab" id="evc-fab" type="button" aria-label="Open EVIO Assistant" aria-expanded="false" aria-controls="evc-panel">' + BOLT + '</button>';
    document.body.appendChild(root);

    var panel = root.querySelector("#evc-panel");
    var fab = root.querySelector("#evc-fab");
    var msgs = root.querySelector("#evc-msgs");
    var input = root.querySelector("#evc-input");
    var send = root.querySelector("#evc-send");

    function scroll() { msgs.scrollTop = msgs.scrollHeight; }

    function add(role, text) {
      var d = document.createElement("div");
      d.className = "evc-msg " + (role === "user" ? "evc-user" : "evc-bot");
      if (role === "user") d.textContent = text; else d.innerHTML = render(text);
      msgs.appendChild(d);
      scroll();
      return d;
    }

    function showError(text) {
      var d = document.createElement("div");
      d.className = "evc-msg evc-err";
      d.textContent = text;
      msgs.appendChild(d);
      scroll();
    }

    function showChips() {
      var wrap = document.createElement("div");
      wrap.className = "evc-chips";
      SUGGESTIONS.forEach(function (s) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "evc-chip";
        b.textContent = s;
        b.onclick = function () { wrap.remove(); ask(s); };
        wrap.appendChild(b);
      });
      msgs.appendChild(wrap);
      scroll();
    }

    function startView() {
      msgs.innerHTML = "";
      add("bot", GREETING);
      if (!history.length) showChips();
      history.forEach(function (m) { add(m.role, m.content); });
    }

    function ask(text) {
      text = (text || "").trim();
      if (!text || busy) return;
      busy = true;
      send.disabled = true;
      input.value = "";
      input.style.height = "auto";

      var chips = msgs.querySelector(".evc-chips");
      if (chips) chips.remove();

      add("user", text);
      history.push({ role: "user", content: text });
      save();

      var typing = document.createElement("div");
      typing.className = "evc-msg evc-bot";
      typing.innerHTML = '<span class="evc-typing" aria-label="Typing"><i></i><i></i><i></i></span>';
      msgs.appendChild(typing);
      scroll();

      fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // credentials: "include", // uncomment if your backend uses cookie login
        body: JSON.stringify({ messages: history.slice(-10) })
      })
        .then(function (r) {
          return r.json().then(function (data) {
            if (!r.ok) throw new Error(data.error || "Something went wrong.");
            return data;
          });
        })
        .then(function (data) {
          typing.remove();
          add("bot", data.reply);
          history.push({ role: "assistant", content: data.reply });
          save();
        })
        .catch(function (err) {
          typing.remove();
          history.pop(); // let the user retry the same message
          save();
          showError(err.message && err.message !== "Failed to fetch" ? err.message : "Server se connect nahi ho paaya. Internet check karke dobara try karein.");
        })
        .then(function () {
          busy = false;
          send.disabled = false;
          input.focus();
        });
    }

    function open() {
      panel.classList.add("evc-open");
      fab.setAttribute("aria-expanded", "true");
      input.focus();
    }
    function close() {
      panel.classList.remove("evc-open");
      fab.setAttribute("aria-expanded", "false");
      fab.focus();
    }

    fab.onclick = function () { panel.classList.contains("evc-open") ? close() : open(); };
    root.querySelector("#evc-close").onclick = close;
    root.querySelector("#evc-clear").onclick = function () {
      history = []; save(); startView();
    };
    send.onclick = function () { ask(input.value); };
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(input.value); }
    });
    input.addEventListener("input", function () {
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight, 96) + "px";
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && panel.classList.contains("evc-open")) close();
    });

    startView();
  }

  load();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
