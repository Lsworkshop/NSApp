(function () {
  const BANNER_KEY = "pwa_banner_dismissed_v1";
  const DISMISS_DAYS = 30;

  function isStandalone() {
    const mql = window.matchMedia && window.matchMedia("(display-mode: standalone)").matches;
    const iosStandalone = window.navigator && window.navigator.standalone === true;
    return !!(mql || iosStandalone);
  }

  function dismissedRecently() {
    try {
      const raw = localStorage.getItem(BANNER_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!data || !data.ts) return false;
      return (Date.now() - data.ts) < DISMISS_DAYS * 24 * 60 * 60 * 1000;
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
    return /iphone|ipad|ipod/i.test(navigator.userAgent || "");
  }

  function ensureStyles() {
    if (document.getElementById("pwaBannerStyles")) return;
    const style = document.createElement("style");
    style.id = "pwaBannerStyles";
    style.textContent = `
      #pwaBannerWrap{display:none;position:fixed;left:12px;right:12px;bottom:12px;z-index:9999;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;}
      #pwaBannerCard{background:#fff;border:1px solid rgba(0,0,0,.12);border-radius:14px;padding:12px;box-shadow:0 10px 30px rgba(0,0,0,.12);display:flex;gap:10px;align-items:center;}
      #pwaBannerText{flex:1;font-size:14px;line-height:1.35;color:#111;}
      #pwaBannerBtn{border:0;background:#5A47E0;color:#fff;padding:8px 10px;border-radius:10px;font-size:13px;cursor:pointer;white-space:nowrap;}
      #pwaBannerClose{border:0;background:transparent;font-size:18px;line-height:1;cursor:pointer;padding:6px 8px;color:#111;}
      #pwaHelpWrap{display:none;position:fixed;left:12px;right:12px;bottom:70px;z-index:9999;}
      #pwaHelpCard{background:#fff;border:1px solid rgba(0,0,0,.12);border-radius:14px;padding:12px;box-shadow:0 10px 30px rgba(0,0,0,.12);font-size:13px;line-height:1.45;color:#111;}
      #pwaHelpTitle{font-weight:600;margin-bottom:6px;}
      #pwaHelpText b{font-weight:650;}
      @media (max-width:360px){#pwaBannerText{font-size:13px}}
    `;
    document.head.appendChild(style);
  }

  function buildBanner() {
    ensureStyles();

    const wrap = document.createElement("div");
    wrap.id = "pwaBannerWrap";
    wrap.innerHTML = `
      <div id="pwaBannerCard" role="status" aria-live="polite">
        <div id="pwaBannerText">可添加到手机主屏幕，更方便下次一键打开。</div>
        <button id="pwaBannerBtn" type="button">怎么添加</button>
        <button id="pwaBannerClose" type="button" aria-label="close">×</button>
      </div>
    `;

    const help = document.createElement("div");
    help.id = "pwaHelpWrap";
    help.innerHTML = `
      <div id="pwaHelpCard" role="dialog" aria-modal="false">
        <div id="pwaHelpTitle">添加到主屏幕方法</div>
        <div id="pwaHelpText"></div>
      </div>
    `;

    document.body.appendChild(wrap);
    document.body.appendChild(help);

    const helpText = help.querySelector("#pwaHelpText");
    if (helpText) {
      helpText.innerHTML = isIOS()
        ? `在 <b>Safari</b> 点击底部 <b>分享</b> → 选择 <b>添加到主屏幕</b>。`
        : `在浏览器右上角菜单中选择 <b>安装应用</b> 或 <b>添加到主屏幕</b>。`;
    }

    const btnHow = wrap.querySelector("#pwaBannerBtn");
    const btnClose = wrap.querySelector("#pwaBannerClose");

    btnHow && btnHow.addEventListener("click", () => {
      help.style.display = (help.style.display === "block") ? "none" : "block";
    });

    btnClose && btnClose.addEventListener("click", () => {
      wrap.style.display = "none";
      help.style.display = "none";
      markDismissed();
    });

    return { wrap, help };
  }

  function init() {
    if (isStandalone()) return;
    if (dismissedRecently()) return;

    setTimeout(() => {
      const { wrap } = buildBanner();
      wrap.style.display = "block";
    }, 600);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();