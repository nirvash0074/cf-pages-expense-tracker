export async function onRequest(context) {
  const { request, env } = context;
  const db = env.DB;
  const url = new URL(request.url);

  if (request.method === "GET") {
    const month = url.searchParams.get("month");
    if (!month) return new Response(JSON.stringify([]), { headers: { "Content-Type": "application/json"}});
    const rows = await db.prepare("SELECT * FROM budgets WHERE month = ?").bind(month).all();
    return new Response(JSON.stringify(rows.results || rows), { headers: { "Content-Type": "application/json"}});
  }

  if (request.method === "POST") {
    const { category_id, month, amount } = await request.json();
    // upsert
    await db.prepare(`
      INSERT INTO budgets (category_id, month, amount)
      VALUES (?, ?, ?)
      ON CONFLICT(category_id, month) DO UPDATE SET amount=excluded.amount
    `).bind(category_id, month, amount).run();
    const row = await db.prepare("SELECT * FROM budgets WHERE category_id = ? AND month = ?").bind(category_id, month).all();
    return new Response(JSON.stringify(row.results[0]), { headers: { "Content-Type": "application/json"}});
  }

  return new Response("Method not allowed", { status: 405 });
}
