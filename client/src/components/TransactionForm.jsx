
import { useState } from "react";

const defaultCategories = [
  "Food",
  "Shopping",
  "Transport",
  "Bills",
  "Entertainment",
  "Health",
  "Education",
  "Salary",
  "Business",
  "Investment",
  "Rent",
  "Other",
];

const blank = () => ({
  title: "",
  amount: "",
  type: "expense",
  category: "Food",
  date: new Date().toISOString().slice(0, 10),
  notes: "",
});

export default function TransactionForm({ onSubmit }) {
  const [f, S] = useState(blank);
  const [err, E] = useState("");
  const [categories, setCategories] = useState(defaultCategories);
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);

  const change = (e) =>
    S({ ...f, [e.target.name]: e.target.value });

  // Add a new category
  const addCategory = () => {
    const name = newCategory.trim();

    if (!name) return;

    const existing = categories.find(
      (c) => c.toLowerCase() === name.toLowerCase()
    );

    if (existing) {
      S((prev) => ({ ...prev, category: existing }));
    } else {
      setCategories((prev) => [...prev, name]);
      S((prev) => ({ ...prev, category: name }));
    }

    setNewCategory("");
    setShowNewCategory(false);
  };

  // Submit transaction
  const submit = async (e) => {
    e.preventDefault();
    E("");

    try {
      await onSubmit({
        ...f,
        title: f.title.trim() || f.category,
        amount: +f.amount,
      });

      S(blank());
      setShowNewCategory(false);
    } catch (x) {
      E(x.response?.data?.message || "Unable to save");
    }
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
    >
    

      {err && (
        <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-600">
          {err}
        </p>
      )}

      {/* Optional Description */}
      <input
        className="field"
        name="title"
        placeholder="Description (optional)"
        value={f.title}
        onChange={change}
      />

      <div className="grid gap-3 sm:grid-cols-2">

        {/* Amount */}
        <input
          className="field"
          name="amount"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Amount (₹)"
          value={f.amount}
          onChange={change}
          required
        />

        {/* Transaction Type */}
        <select
          className="field"
          name="type"
          value={f.type}
          onChange={change}
          required
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>

        {/* Category Dropdown */}
        <select
          className="field"
          value={showNewCategory ? "__new" : f.category}
          onChange={(e) => {
            if (e.target.value === "__new") {
              setShowNewCategory(true);
            } else {
              setShowNewCategory(false);
              S((prev) => ({
                ...prev,
                category: e.target.value,
              }));
            }
          }}
          required
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}

          <option value="__new">
            + Add New Category
          </option>
        </select>

        {/* Date */}
        <input
          className="field"
          name="date"
          type="date"
          value={f.date}
          onChange={change}
          required
        />
      </div>

      {/* New Category Input */}
      {showNewCategory && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className="field flex-1"
            placeholder="Enter new category name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCategory();
              }
            }}
            autoFocus
          />

          <button
            type="button"
            onClick={addCategory}
            disabled={!newCategory.trim()}
            className="rounded-xl bg-emerald-600 px-5 py-2 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            Add
          </button>

          <button
            type="button"
            onClick={() => {
              setShowNewCategory(false);
              setNewCategory("");
            }}
            className="rounded-xl border border-slate-200 px-4 py-2 text-slate-600"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Notes */}
      <input
        className="field"
        name="notes"
        placeholder="Notes (optional)"
        value={f.notes}
        onChange={change}
      />

      {/* Submit Button */}
      <button
        type="submit"
        className="primary w-full transition hover:-translate-y-0.5"
      >
        Add Transaction
      </button>
    </form>
  );
}
