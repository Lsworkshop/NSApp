export async function onRequest(context) {
  const url = new URL(context.request.url);

  // 只处理 /nsxxxx 或 /nsxxxx/... 这种路径
  const m = url.pathname.match(/^\/(ns[0-9A-Za-z_-]+)(\/.*)?$/);
  if (!m) return context.next();

  const rest = m[2] || "/";

  // ns 根路径 -> 主页（我们用 home.html 当源文件）
  url.pathname = (rest === "/" || rest === "") ? "/home.html" : rest;

  // 取静态资源，但不要让浏览器“看到重定向”
  // 如果 ASSETS.fetch 返回 301/302/307/308，我们在服务器端再 fetch 一次目标并把最终内容返回。
  async function fetchNoRedirect(u) {
    const req = new Request(u.toString(), context.request);
    // 注意：Cloudflare 的 fetch 可能仍返回 redirect 响应，我们手动处理
    const resp = await context.env.ASSETS.fetch(req);

    if ([301, 302, 307, 308].includes(resp.status)) {
      const loc = resp.headers.get("Location");
      if (loc) {
        const nextUrl = new URL(loc, u); // 支持相对路径
        const req2 = new Request(nextUrl.toString(), context.request);
        const resp2 = await context.env.ASSETS.fetch(req2);
        // 返回最终内容（不把 redirect 透给浏览器）
        return resp2;
      }
    }
    return resp;
  }

  const resp = await fetchNoRedirect(url);

  // 如果找不到资源，交回 Pages 默认处理（可选）
  if (resp.status === 404) return context.next();

  return resp;
}
