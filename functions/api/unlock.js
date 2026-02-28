export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    console.log("SERVER RECEIVED:", data);   // 👈 加这一行
    const { firstName, lastName, email, referral_code } = data;

    // -------------- Email Format Check --------------
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), { status: 400 });
    }

    // -------------- Required Fields --------------
    if (!firstName || !lastName || !email) {
      return new Response(JSON.stringify({ error: "Missing required fields." }), {
        status: 400,
      });
    }

    const now = new Date().toISOString();

    // -------------- Insert Into D1 (NO TOKEN) --------------
    await env.DB.prepare(
  `INSERT INTO unlocks 
   (first_Name, last_Name, email, referral_code, created_At)
   VALUES (?, ?, ?, ?, ?)`
)
.bind(firstName, lastName, email, referral_code, now)
.run();
    // -------------- SUCCESS Response --------------
    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500
    });
  }
}

