export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    const { ns_id, source, timestamp, user_agent, page_path } = data;

    if (!ns_id) throw new Error("Missing ns_id");

    await env.DB.prepare(`
      INSERT INTO ns_clicks (ns_id, source, page_path, user_agent, created_at)
      VALUES (?, ?, ?, ?, ?)
    `)
    .bind(ns_id, source || 'ns_partner', page_path || '', user_agent || '', timestamp || new Date().toISOString())
    .run();

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
}