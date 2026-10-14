export async function onRequest(context) {
  const { request, env } = context;
  const db = env.DB;
  if (request.method === "GET") {
    const res = await db.prepare("SELECT id, name FROM categories ORDER BY name").all();
    return new Response(JSON.stringify(res.results || res), { headers: { "Content-Type": "application/json"}});
  }
  if (request.method === "POST") {
    const { name } = await request.json();
    const ins = await db.prepare("INSERT INTO categories (name) VALUES (?)").bind(name).run();
    const row = await db.prepare("SELECT id, name FROM categories WHERE id = ?").bind(ins.lastInsertRowId).all();
    return new Response(JSON.stringify(row.results[0]), { headers: { "Content-Type": "application/json"}});
  }
  return new Response("Method not allowed", { status: 405 });
}
