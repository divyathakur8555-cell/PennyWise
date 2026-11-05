
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";

import TransactionForm from "../components/TransactionForm.jsx";
import TransactionList from "../components/TransactionList.jsx";

import {
  ExpenseChart,
  IncomeExpenseChart,
} from "../components/Charts.jsx";

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [actionError, setActionError] = useState("");
  const [saving, setSaving] = useState(false);

  // Load actual transactions belonging to the logged-in user
  const load = useCallback(async () => {
    setLoading(true);
    setErr("");

    try {
      const response = await api.get("/transactions");

      setItems(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setErr(
        error.response?.data?.message ||
          "Unable to load transactions. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Calculate financial totals from actual transactions
  const totals = useMemo(() => {
    return items.reduce(
      (acc, transaction) => {
        const amount = Number(transaction.amount) || 0;

        if (transaction.type === "income") {
          acc.income += amount;
        } else if (transaction.type === "expense") {
          acc.expense += amount;
        }

        return acc;
      },
      { income: 0, expense: 0 }
    );
  }, [items]);

  const balance = totals.income - totals.expense;

  // Format amounts in Indian Rupees
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);

  // Add a new transaction
  const add = async (data) => {
    if (saving) return;

    setSaving(true);
    setActionError("");

    try {
      await api.post("/transactions", data);
      await load();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Unable to add transaction. Please try again.";

      setActionError(message);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  // Update an existing transaction
  const update = async (id, data) => {
    setActionError("");

    try {
      await api.put(`/transactions/${id}`, data);
      await load();
    } catch (error) {
      setActionError(
        error.response?.data?.message ||
          "Unable to update transaction. Please try again."
      );
    }
  };

  // Delete a transaction
  const remove = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) return;

    setActionError("");

    try {
      await api.delete(`/transactions/${id}`);
      await load();
    } catch (error) {
      setActionError(
        error.response?.data?.message ||
          "Unable to delete transaction. Please try again."
      );
    }
  };

  // Dashboard summary cards
  const summaryCards = [
    {
      title: "Total Balance",
      amount: balance,
      icon: "◈",
      color: "text-blue-600",
      description: "Income minus expenses",
      background: "bg-blue-50",
    },
    {
      title: "Total Income",
      amount: totals.income,
      icon: "↗",
      color: "text-green-600",
      description: "Total money received",
      background: "bg-green-50",
    },
    {
      title: "Total Expenses",
      amount: totals.expense,
      icon: "↘",
      color: "text-rose-600",
      description: "Total money spent",
      background: "bg-rose-50",
    },
  ];

  return (
    <main className="pft-shell min-h-screen space-y-6 bg-slate-50 p-4 text-slate-800 sm:p-6 lg:p-8">

      {/* Dashboard header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-green-600">
            PERSONAL FINANCE
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Here is your financial overview.
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </header>

      {/* Loading state */}
      {loading && (
        <div className="flex min-h-40 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-green-100 border-t-green-600" />

            <p className="mt-3 text-sm font-medium text-slate-500">
              Loading your financial data...
            </p>
          </div>
        </div>
      )}

      {/* Loading error */}
      {!loading && err && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700"
        >
          <p className="font-semibold">Unable to load dashboard</p>
          <p className="mt-1 text-sm">{err}</p>

          <button
            type="button"
            onClick={load}
            className="mt-3 text-sm font-semibold underline"
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !err && (
        <>
          {/* Financial summary */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {summaryCards.map((card) => (
              <div
                key={card.title}
                className="pft-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-500">
                      {card.title}
                    </p>

                    <h2
                      className={`mt-2 break-words text-2xl font-bold ${card.color}`}
                    >
                      {formatCurrency(card.amount)}
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      {card.description}
                    </p>
                  </div>

                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.background} text-2xl ${card.color}`}
                  >
                    {card.icon}
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Transaction count */}
          <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <h2 className="font-bold text-slate-800">
                Your financial activity
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                All figures are calculated from your saved transactions.
              </p>
            </div>

            <span className="rounded-xl bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
              {items.length} {items.length === 1 ? "Transaction" : "Transactions"}
            </span>
          </section>

          {/* Action errors */}
          {actionError && (
            <div
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
            >
              {actionError}
            </div>
          )}

          {/* Monthly income vs expenses */}
          <section className="pft-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-800">
                Monthly Income vs Expenses
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Compare your income and spending over the last six months.
              </p>
            </div>

            <IncomeExpenseChart items={items} />
          </section>

          {/* Expense category breakdown */}
          <section className="pft-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-800">
                Expense Breakdown
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                See how your expenses are distributed across categories.
              </p>
            </div>

            <ExpenseChart items={items} />
          </section>

          {/* Add transaction */}
          <section className="pft-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-800">
                Add New Transaction
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Record your income or expenses.
              </p>
            </div>

            <TransactionForm onSubmit={add} />
          </section>

          {/* Recent transactions */}
          <section className="pft-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Recent Transactions
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your latest income and expenses.
                </p>
              </div>

              <Link
                to="/transactions"
                className="rounded-xl bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-100"
              >
                View All →
              </Link>
            </div>

            {items.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 px-5 py-12 text-center">
                <div className="text-4xl">💳</div>

                <h3 className="mt-4 font-semibold text-slate-800">
                  No transactions yet
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Add your first income or expense using the form above.
                </p>
              </div>
            ) : (
              <TransactionList
                items={items.slice(0, 8)}
                onDelete={remove}
                onUpdate={update}
              />
            )}
          </section>
        </>
      )}
    </main>
  );
}
