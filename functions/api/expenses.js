export async function onRequest(context) {
  const { request, env, params } = context;
  const db = env.DB;
  const url = new URL(request.url);

  if (request.method === "GET") {
    const month = url.searchParams.get("month"); // YYYY-MM
    let rows;
    if (month) {
      // get first and last day
      const from = month + "-01";
      const nextMonth = new Date(month + "-01");
      nextMonth.setMonth(nextMonth.getMonth()+1);
      const to = nextMonth.toISOString().slice(0,10);
      rows = await db.prepare("SELECT * FROM expenses WHERE date >= ? AND date < ? ORDER BY date DESC").bind(from, to).all();
    } else {
      rows = await db.prepare("SELECT * FROM expenses ORDER BY date DESC LIMIT 200").all();
    }
    return new Response(JSON.stringify(rows.results || rows), { headers: { "Content-Type": "application/json"}});
  }

  if (request.method === "POST") {
    const body = await request.json();
    const { amount, category_id, date, note } = body;
    const q = await db.prepare("INSERT INTO expenses (amount, category_id, date, note) VALUES (?, ?, ?, ?)").bind(amount, category_id || null, date, note || "").run();
    const newRow = await db.prepare("SELECT * FROM expenses WHERE id = ?").bind(q.lastInsertRowId).all();
    return new Response(JSON.stringify(newRow.results[0]), { headers: { "Content-Type": "application/json"}});
  }

  return new Response("Method not allowed", { status: 405 });
}
