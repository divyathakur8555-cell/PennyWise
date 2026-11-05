
import { useEffect, useMemo, useState } from "react";
import api from "../services/api.js";
import TransactionList from "../components/TransactionList.jsx";
import { exportCSV } from "../utils/exportCSV.js";

export default function Transactions() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    type: "",
    category: "",
    startDate: "",
    endDate: "",
  });

  const pageSize = 8;

  const load = async () => {
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value)
      );

      const response = await api.get("/transactions", { params });
      setItems(response.data);
      setError("");
    } catch {
      setError("Could not load transactions.");
    }
  };

  useEffect(() => {
    load();
  }, [filters]);

  const update = async (id, data) => {
    try {
      await api.put(`/transactions/${id}`, data);
      await load();
    } catch {
      setError("Unable to update transaction.");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete transaction?")) return;

    try {
      await api.delete(`/transactions/${id}`);
      await load();
    } catch {
      setError("Unable to delete transaction.");
    }
  };

  const pdf = async () => {
    try {
      const response = await api.get(
        "/transactions/report/pdf",
        { responseType: "blob" }
      );

      const url = URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "finance-report.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Unable to export PDF.");
    }
  };

  const filtered = useMemo(() => {
    const result = items.filter((item) => {
      const term = search.toLowerCase();

      return (
        String(item.title || "").toLowerCase().includes(term) ||
        String(item.category || "").toLowerCase().includes(term) ||
        String(item.notes || "").toLowerCase().includes(term)
      );
    });

    result.sort((a, b) => {
      if (sort === "newest") {
        return new Date(b.date) - new Date(a.date);
      }

      if (sort === "oldest") {
        return new Date(a.date) - new Date(b.date);
      }

      if (sort === "highest") {
        return Number(b.amount) - Number(a.amount);
      }

      if (sort === "lowest") {
        return Number(a.amount) - Number(b.amount);
      }

      return 0;
    });

    return result;
  }, [items, search, sort]);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / pageSize)
  );

  const currentPage = Math.min(page, totalPages);

  const visibleItems = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <main className="pft-shell mx-auto min-h-screen max-w-6xl space-y-5 bg-slate-100 p-4 text-slate-800 sm:p-6">

      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Transactions
          </h1>
          <p className="text-sm text-slate-500">
            Search, filter and manage your transactions.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            className="secondary rounded-lg px-4 py-2"
            onClick={() => exportCSV(filtered)}
          >
            Export CSV
          </button>

          <button
            className="primary w-auto rounded-lg px-4 py-2"
            onClick={pdf}
          >
            Export PDF
          </button>
        </div>
      </header>

      {error && (
        <p className="rounded-lg bg-rose-50 p-3 text-rose-600">
          {error}
        </p>
      )}

      {/* Search */}
      <section className="grid gap-3 rounded-xl bg-white p-4 shadow-sm md:grid-cols-2">
        <input
          className="field"
          placeholder="Search description, category or notes..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <select
          className="field"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="highest">Highest amount</option>
          <option value="lowest">Lowest amount</option>
        </select>
      </section>

      {/* Filters */}
      <section className="grid gap-3 rounded-xl bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <select
          className="field"
          value={filters.type}
          onChange={(e) =>
            setFilters({ ...filters, type: e.target.value })
          }
        >
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <input
          className="field"
          placeholder="Category"
          value={filters.category}
          onChange={(e) =>
            setFilters({ ...filters, category: e.target.value })
          }
        />

        <input
          className="field"
          type="date"
          value={filters.startDate}
          onChange={(e) =>
            setFilters({ ...filters, startDate: e.target.value })
          }
        />

        <input
          className="field"
          type="date"
          value={filters.endDate}
          onChange={(e) =>
            setFilters({ ...filters, endDate: e.target.value })
          }
        />
      </section>

      {/* Results */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-bold">
            All Transactions
          </h2>

          <span className="text-sm text-slate-500">
            {filtered.length} results
          </span>
        </div>

        <TransactionList
          items={visibleItems}
          onDelete={remove}
          onUpdate={update}
        />

        {/* Pagination */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-500">
            Page {currentPage} of {totalPages}
          </p>

          <div className="flex gap-2">
            <button
              className="secondary rounded-lg px-4 py-2 disabled:opacity-40"
              disabled={currentPage === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>

            <button
              className="secondary rounded-lg px-4 py-2 disabled:opacity-40"
              disabled={currentPage === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </section>

    </main>
  );
}
