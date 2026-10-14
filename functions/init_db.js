export async function onRequest(context) {
  const { env } = context;
  const db = env.DB;
  // Run migrations (idempotent)
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );
  `).run();
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      month TEXT NOT NULL,
      amount INTEGER NOT NULL,
      UNIQUE(category_id, month),
      FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE CASCADE
    );
  `).run();
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount INTEGER NOT NULL,
      category_id INTEGER,
      date TEXT NOT NULL,
      note TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL
    );
  `).run();

  // Seed a few categories if none exist
  const cats = await db.prepare("SELECT COUNT(*) AS c FROM categories").all();
  if (cats[0].c === 0) {
    const names = ["Food","Transport","Rent","Utilities","Entertainment","Other"];
    for (const n of names) {
      await db.prepare("INSERT OR IGNORE INTO categories (name) VALUES (?)").bind(n).run();
    }
  }

  return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" }});
}
