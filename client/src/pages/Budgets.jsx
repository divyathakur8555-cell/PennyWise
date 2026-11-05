
import { useEffect, useState } from "react";
import api from "../services/api.js";

export default function Budgets() {
  const today = new Date();

  const [budgets, setBudgets] = useState([]);
  const [form, setForm] = useState({
    category: "Food",
    amount: "",
  });

  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [error, setError] = useState("");

  const categories = [
    "Food",
    "Shopping",
    "Transport",
    "Bills",
    "Entertainment",
    "Health",
    "Education",
    "Rent",
    "Other",
  ];

  const loadBudgets = async () => {
    try {
      const response = await api.get("/budgets", {
        params: { month, year },
      });

      setBudgets(response.data);
      setError("");
    } catch {
      setError("Unable to load budgets.");
    }
  };

  useEffect(() => {
    loadBudgets();
  }, [month, year]);

  const addBudget = async (e) => {
    e.preventDefault();

    try {
      await api.post("/budgets", {
        ...form,
        amount: Number(form.amount),
        month,
        year,
      });

      setForm({ ...form, amount: "" });
      await loadBudgets();
    } catch (error) {
      setError(
        error.response?.data?.message || "Unable to save budget."
      );
    }
  };

  const deleteBudget = async (id) => {
    if (!window.confirm("Delete this budget?")) return;

    try {
      await api.delete(`/budgets/${id}`);
      await loadBudgets();
    } catch {
      setError("Unable to delete budget.");
    }
  };

  const money = (value) =>
    `₹${Number(value).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;

  return (
    <main className="pft-shell min-h-screen space-y-6 bg-slate-100 p-4 sm:p-6">

      <header>
        <h1 className="text-3xl font-bold text-slate-900">
          Budget Management
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Plan your monthly spending and monitor your limits.
        </p>
      </header>

      {error && (
        <p className="rounded-lg bg-rose-50 p-3 text-rose-600">
          {error}
        </p>
      )}

      {/* Month and Year */}
      <section className="flex flex-wrap gap-3 rounded-xl bg-white p-4">
        <select
          className="field"
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i}>
              {new Date(2000, i).toLocaleString("en-IN", {
                month: "long",
              })}
            </option>
          ))}
        </select>

        <input
          className="field w-32"
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        />
      </section>

      {/* Add Budget */}
      <form
        onSubmit={addBudget}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2 className="text-xl font-bold text-slate-800">
          Set Monthly Budget
        </h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <select
            className="field"
            value={form.category}
            onChange={(e) =>
              setForm({ ...form, category: e.target.value })
            }
          >
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>

          <input
            className="field"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Budget amount"
            required
            value={form.amount}
            onChange={(e) =>
              setForm({ ...form, amount: e.target.value })
            }
          />
        </div>

        <button className="primary" type="submit">
          Save Budget
        </button>
      </form>

      {/* Budget Cards */}
      <section className="grid gap-4 md:grid-cols-2">
        {budgets.map((budget) => {
          const percentage = Math.max(
            0,
            Number(budget.percentage)
          );

          const exceeded = percentage >= 100;
          const warning = percentage >= 80;

          return (
            <article
              key={budget._id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-slate-800">
                  {budget.category}
                </h3>

                <button
                  onClick={() => deleteBudget(budget._id)}
                  className="text-sm font-medium text-rose-600 hover:underline"
                >
                  Delete
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-500">Spent</p>
                  <p className="font-bold text-rose-600">
                    {money(budget.spent)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Budget</p>
                  <p className="font-bold text-slate-800">
                    {money(budget.amount)}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex justify-between text-sm">
                <span className="text-slate-500">
                  {percentage.toFixed(1)}% used
                </span>

                <span className="font-semibold text-slate-700">
                  {money(budget.remaining)} remaining
                </span>
              </div>

              <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${
                    exceeded
                      ? "bg-rose-600"
                      : warning
                        ? "bg-amber-500"
                        : "bg-green-500"
                  }`}
                  style={{
                    width: `${Math.min(percentage, 100)}%`,
                  }}
                />
              </div>

              {exceeded && (
                <p className="mt-3 rounded-lg bg-rose-50 p-2 text-sm font-medium text-rose-600">
                  Budget exceeded! Reduce your spending.
                </p>
              )}

              {!exceeded && warning && (
                <p className="mt-3 rounded-lg bg-amber-50 p-2 text-sm font-medium text-amber-700">
                  Warning: You have used at least 80% of your budget.
                </p>
              )}
            </article>
          );
        })}
      </section>

      {budgets.length === 0 && (
        <p className="rounded-xl bg-white p-8 text-center text-slate-500">
          No budgets found for this month.
        </p>
      )}

    </main>
  );
}
