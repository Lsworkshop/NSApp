(function () {
  const BANNER_KEY = "pwa_banner_dismissed_v2";
  const DISMISS_DAYS = 30;

  // ===== 读取你现有语言系统 =====
  function getSiteLang() {
    try {
      const v = (localStorage.getItem("superedu-lang") || "").toLowerCase();
      if (v === "zh" || v === "en") return v;
    } catch {}
    const htmlLang = (document.documentElement.lang || "").toLowerCase();
    if (htmlLang.startsWith("zh")) return "zh";
    return "en";
  }

  const I18N = {
    zh: {
      bannerText: "将本应用添加到主屏幕，获得更快捷的访问体验。",
      howBtn: "如何添加",
      helpTitle: "添加到主屏幕",
      iosHelp: "在 Safari 点击底部“分享”按钮 → 选择“添加到主屏幕”。",
      andHelp: "在浏览器菜单中选择“安装应用”或“添加到主屏幕”。"
    },
    en: {
      bannerText: "Add this app to your Home Screen for faster and easier access.",
      howBtn: "How to add",
      helpTitle: "Add to Home Screen",
      iosHelp: "In Safari, tap Share → select Add to Home Screen.",
      andHelp: "Open the browser menu and choose Install app or Add to Home screen."
    }
  };

  function isStandalone() {
    const mql = window.matchMedia("(display-mode: standalone)").matches;
    const iosStandalone = window.navigator.standalone === true;
    return !!(mql || iosStandalone);
  }

  function dismissedRecently() {
    try {
      const raw = localStorage.getItem(BANNER_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      return Date.now() - data.ts < DISMISS_DAYS * 86400000;
    } catch {
      return false;
    }
  }

  function markDismissed() {
    try {
      localStorage.setItem(BANNER_KEY, JSON.stringify({ ts: Date.now() }));
    } catch {}
  }

  function isIOS() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent);
  }

  function ensureStyles() {
    if (document.getElementById("pwaBannerStyles")) return;
    const style = document.createElement("style");
    style.id = "pwaBannerStyles";
    style.textContent = `
      #pwaBannerWrap{display:none;position:fixed;left:12px;right:12px;bottom:12px;z-index:9999;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;}
      #pwaBannerCard{background:#fff;border:1px solid rgba(0,0,0,.1);border-radius:14px;padding:14px;box-shadow:0 10px 30px rgba(0,0,0,.12);display:flex;gap:12px;align-items:center;}
      #pwaBannerText{flex:1;font-size:14px;line-height:1.4;color:#111;}
      #pwaBannerBtn{border:0;background:#5A47E0;color:#fff;padding:8px 12px;border-radius:10px;font-size:13px;cursor:pointer;}
      #pwaBannerClose{border:0;background:transparent;font-size:18px;cursor:pointer;}
      #pwaHelpWrap{display:none;position:fixed;left:12px;right:12px;bottom:80px;z-index:9999;}
      #pwaHelpCard{background:#fff;border:1px solid rgba(0,0,0,.1);border-radius:14px;padding:14px;box-shadow:0 10px 30px rgba(0,0,0,.12);font-size:13px;line-height:1.5;}
      #pwaHelpTitle{font-weight:600;margin-bottom:6px;}
    `;
    document.head.appendChild(style);
  }

  function buildBanner(dict) {
    ensureStyles();

    const wrap = document.createElement("div");
    wrap.id = "pwaBannerWrap";
    wrap.innerHTML = `
      <div id="pwaBannerCard">
        <div id="pwaBannerText">${dict.bannerText}</div>
        <button id="pwaBannerBtn">${dict.howBtn}</button>
        <button id="pwaBannerClose">×</button>
      </div>
    `;

    const help = document.createElement("div");
    help.id = "pwaHelpWrap";
    help.innerHTML = `
      <div id="pwaHelpCard">
        <div id="pwaHelpTitle">${dict.helpTitle}</div>
        <div>${isIOS() ? dict.iosHelp : dict.andHelp}</div>
      </div>
    `;

    document.body.appendChild(wrap);
    document.body.appendChild(help);

    wrap.querySelector("#pwaBannerBtn").addEventListener("click", () => {
      help.style.display = help.style.display === "block" ? "none" : "block";
    });

    wrap.querySelector("#pwaBannerClose").addEventListener("click", () => {
      wrap.style.display = "none";
      help.style.display = "none";
      markDismissed();
    });

    return wrap;
  }

  function init() {
    if (isStandalone()) return;
    if (dismissedRecently()) return;

    const lang = getSiteLang();
    const dict = I18N[lang] || I18N.en;

    setTimeout(() => {
      const banner = buildBanner(dict);
      banner.style.display = "block";
    }, 600);
  }

  document.addEventListener("DOMContentLoaded", init);
})();