(function () {
  function getNs() {
    const m = location.pathname.match(/^\/(ns[0-9A-Za-z_-]+)(\/|$)/);
    if (m) {
      sessionStorage.setItem("finova_ns", m[1]);
      return m[1];
    }
    return sessionStorage.getItem("finova_ns");
  }

  function rewriteLinks() {
    const ns = getNs();
    if (!ns) return;

    // 重写 <a href>
    document.querySelectorAll("a[href]").forEach(a => {
      const href = a.getAttribute("href");
      if (!href) return;

      // 跳过外链/锚点/邮件电话
      if (href.startsWith("http://") || href.startsWith("https://")) return;
      if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

      const path = href.startsWith("/") ? href : "/" + href;

      // 已带 ns 不重复加
      if (path === `/${ns}` || path.startsWith(`/${ns}/`)) return;

      // 不改接口地址（按需扩展）
      if (path.startsWith("/functions/") || path.startsWith("/api/")) return;

      a.setAttribute("href", `/${ns}${path}`);
    });

    // 重写 <form action>（避免提交后丢 ns）
    document.querySelectorAll("form[action]").forEach(f => {
      const action = f.getAttribute("action");
      if (!action) return;
      if (action.startsWith("http://") || action.startsWith("https://")) return;

      const path = action.startsWith("/") ? action : "/" + action;
      if (path.startsWith(`/${ns}/`) || path === `/${ns}`) return;
      if (path.startsWith("/functions/") || path.startsWith("/api/")) return;

      f.setAttribute("action", `/${ns}${path}`);
    });
  }

  document.addEventListener("DOMContentLoaded", rewriteLinks);
})();


(function () {
  function getNs() {
    const m = location.pathname.match(/^\/(ns[0-9A-Za-z_-]+)(\/|$)/);
    if (m) {
      sessionStorage.setItem("finova_ns", m[1]);
      return m[1];
    }
    return sessionStorage.getItem("finova_ns");
  }

  function addNsToPath(path, ns) {
    if (!ns) return path;
    if (!path.startsWith("/")) return path;
    if (path === `/${ns}` || path.startsWith(`/${ns}/`)) return path;
    // 排除接口路径（按需扩展）
    if (path.startsWith("/functions/") || path.startsWith("/api/")) return path;
    return `/${ns}${path}`;
  }

  // 捕获阶段拦截所有 a 点击（即使是动态生成的也能拦到）
  document.addEventListener(
    "click",
    function (e) {
      const a = e.target.closest && e.target.closest("a");
      if (!a) return;

      const href = a.getAttribute("href");
      if (!href) return;

      // 外链/锚点/邮件电话不处理
      if (href.startsWith("http://") || href.startsWith("https://")) return;
      if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

      const ns = getNs();
      if (!ns) return;

      // 把相对链接也转成 /xxx 形式
      const path = href.startsWith("/") ? href : "/" + href;
      const newPath = addNsToPath(path, ns);

      if (newPath !== path) {
        e.preventDefault();
        window.location.assign(newPath);
      }
    },
    true
  );
})();
