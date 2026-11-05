
import { Link, Navigate, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import AuthPages from "./pages/AuthPages.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Transactions from "./pages/Transactions.jsx";
import Budgets from "./pages/Budgets.jsx";

function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
        <div>
          <span className="inline-block rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
            Personal Finance Management
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Take control of your money with{" "}
            <span className="text-green-600">PennyWise</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Track your income, manage expenses, create budgets and
            understand your spending — all in one place.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/register"
              className="rounded-xl bg-green-600 px-7 py-3.5 font-semibold text-white shadow-sm transition hover:bg-green-700"
            >
              Get Started
            </Link>

            <Link
              to="/login"
              className="rounded-xl border border-slate-300 bg-white px-7 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Log In
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-slate-900">
            Manage your finances
          </h2>

          <p className="mt-2 text-slate-500">
            Everything you need to organize your personal finances.
          </p>

          <div className="mt-8 space-y-5">
            {[
              ["01", "Track Transactions", "Record income and expenses."],
              ["02", "Manage Budgets", "Set spending limits by category."],
              ["03", "View Reports", "Understand your financial activity."],
            ].map(([number, title, description]) => (
              <div key={number} className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 font-bold text-green-700">
                  {number}
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800">{title}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="features"
        className="scroll-mt-24 bg-white px-6 py-20"
      >
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900">
              Everything in one place
            </h2>

            <p className="mt-3 text-slate-500">
              Simple tools to help you manage your money.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: "↗",
                title: "Income & Expenses",
                description:
                  "Record and organize your financial transactions.",
              },
              {
                icon: "◎",
                title: "Budget Management",
                description:
                  "Create category budgets and monitor spending.",
              },
              {
                icon: "▥",
                title: "Financial Reports",
                description:
                  "Review charts and export your transaction reports.",
              },
            ].map((feature) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-slate-200 p-7 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="text-3xl font-bold text-green-600">
                  {feature.icon}
                </div>

                <h3 className="mt-4 text-xl font-bold text-slate-800">
                  {feature.title}
                </h3>

                <p className="mt-2 leading-7 text-slate-500">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-slate-50 px-6 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} PennyWise. Personal Finance Tracker.
      </footer>
    </main>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/login"
          element={<AuthPages mode="login" />}
        />

        <Route
          path="/register"
          element={<AuthPages mode="register" />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/budgets"
          element={
            <ProtectedRoute>
              <Budgets />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
