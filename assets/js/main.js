(function() {
  const params = new URLSearchParams(window.location.search);
  const memberId = params.get("ref");

  if (memberId) {
    sessionStorage.setItem("ns_member_id", memberId);
  }

  const currentMemberId = sessionStorage.getItem("ns_member_id") || "ns12345";

  function applyMemberId() {
    // 替换所有 href 中的 ns12345
    document.querySelectorAll('a[href*="ns12345"]').forEach(a => {
      a.href = a.href.replace("ns12345", currentMemberId);
    });

    // 给所有内部链接添加 ?ref=MemberID
    document.querySelectorAll('a[href^="/"]').forEach(a => {
      const url = new URL(a.href, window.location.origin);
      url.searchParams.set("ref", currentMemberId);
      a.href = url.toString();
    });

    // 表单推荐码 / 优惠码自动填充
    document.querySelectorAll("input[name='ref'], input[name='referral_code'], .ref-code").forEach(el => {
      if (el.tagName === "INPUT") el.value = currentMemberId;
      else el.textContent = currentMemberId;
    });

    // 记录访问到后台 D1 表格
    fetch("/api/track_ns_visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        memberId: currentMemberId,
        page: window.location.pathname,
        timestamp: Date.now()
      })
    });
  }

  document.addEventListener("DOMContentLoaded", applyMemberId);
})();