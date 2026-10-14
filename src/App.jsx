import React, { useEffect, useState } from "react";

function fetchJson(url, opts) {
  return fetch(url, opts).then(r => r.json());
}

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0,7)); // YYYY-MM
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [note, setNote] = useState("");
  const [budgets, setBudgets] = useState([]);

  useEffect(() => { load(); }, [month]);

  async function load() {
    const [expRes, catRes, budRes] = await Promise.all([
      fetchJson(`/api/expenses?month=${month}`),
      fetchJson(`/api/categories`),
      fetchJson(`/api/budgets?month=${month}`)
    ]);
    setExpenses(expRes);
    setCategories(catRes);
    setBudgets(budRes);
    if (catRes.length && !categoryId) setCategoryId(catRes[0].id);
  }

  async function addExpense(e) {
    e.preventDefault();
    const res = await fetchJson("/api/expenses", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        amount: Math.round(parseFloat(amount) * 100),
        date: new Date().toISOString(),
        category_id: categoryId,
        note
      })
    });
    setAmount(""); setNote("");
    load();
  }

  async function setBudget(category_id) {
    const val = prompt("Monthly budget amount (e.g. 200.00) in your currency:");
    if (!val) return;
    const cents = Math.round(parseFloat(val) * 100);
    await fetchJson("/api/budgets", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ category_id, month, amount: cents })
    });
    load();
  }

  function formatMoney(cents) {
    return (cents/100).toFixed(2);
  }

  const totalsByCategory = budgets.reduce((acc, b) => {
    acc[b.category_id] = { budget: b.amount, spent: 0 };
    return acc;
  }, {});
  for (const e of expenses) {
    totalsByCategory[e.category_id] = totalsByCategory[e.category_id] || { budget: 0, spent: 0 };
    totalsByCategory[e.category_id].spent += e.amount;
  }

  return (
    <div style={{ padding: 20, fontFamily: "system-ui, sans-serif", maxWidth: 900 }}>
      <h1>Expense Tracker</h1>

      <div style={{ marginBottom: 12 }}>
        <label>Month: <input type="month" value={month} onChange={e=>setMonth(e.target.value)} /></label>
      </div>

      <form onSubmit={addExpense} style={{ marginBottom: 18 }}>
        <input placeholder="Amount (e.g. 12.50)" value={amount} onChange={e=>setAmount(e.target.value)} />
        <select value={categoryId} onChange={e=>setCategoryId(e.target.value)}>
          {categories.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}
        </select>
        <input placeholder="Note" value={note} onChange={e=>setNote(e.target.value)} />
        <button type="submit">Add</button>
      </form>

      <h2>Budgets & spending</h2>
      <ul>
        {Object.entries(totalsByCategory).map(([catId, t]) => {
          const cat = categories.find(c=>c.id==catId) || { name: "Uncategorized" };
          return (
            <li key={catId}>
              <strong>{cat.name}:</strong> Spent {formatMoney(t.spent)} / Budget {formatMoney(t.budget)} {" "}
              <button onClick={()=>setBudget(catId)}>Set budget</button>
            </li>
          );
        })}
      </ul>

      <h2>Expenses</h2>
      <table border="1" cellPadding="6">
        <thead><tr><th>Date</th><th>Category</th><th>Note</th><th>Amount</th></tr></thead>
        <tbody>
          {expenses.map(e => (
            <tr key={e.id}>
              <td>{(new Date(e.date)).toLocaleString()}</td>
              <td>{(categories.find(c=>c.id===e.category_id)||{name:"-" }).name}</td>
              <td>{e.note}</td>
              <td>{formatMoney(e.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
