
import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);

  const active = (path) =>
    location.pathname === path
      ? "font-semibold text-green-700"
      : "text-slate-600 transition hover:text-green-700";

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleLogout() {
    logout();
    closeMenu();
    navigate("/", { replace: true });
  }

  // Navigate to the Features section
  function handleFeaturesClick() {
    closeMenu();

    if (location.pathname !== "/") {
      navigate("/#features");
      return;
    }

    document.getElementById("features")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    // Keep the URL updated
    window.history.replaceState(null, "", "/#features");
  }

  // Scroll to Features after navigating from another page
  useEffect(() => {
    if (location.pathname === "/" && location.hash === "#features") {
      const timer = setTimeout(() => {
        document.getElementById("features")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [location.pathname, location.hash]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">

        {/* Logo */}
        <Link
          to="/"
          onClick={closeMenu}
          className="flex items-center gap-2"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-xl font-bold text-white">
            P
          </span>

          <span className="text-xl font-bold text-slate-800">
            Penny<span className="text-green-600">Wise</span>
          </span>
        </Link>

        {/* Desktop navigation - Public */}
        {!user ? (
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <Link to="/" className={active("/")}>
              Home
            </Link>

            <button
              type="button"
              onClick={handleFeaturesClick}
              className="text-slate-600 transition hover:text-green-700"
            >
              Features
            </button>

            <Link to="/login" className={active("/login")}>
              Log In
            </Link>

            <Link
              to="/register"
              className="rounded-xl bg-green-600 px-5 py-2.5 text-white transition hover:bg-green-700"
            >
              Get Started
            </Link>
          </nav>
        ) : (
          /* Desktop navigation - Logged in */
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <Link to="/dashboard" className={active("/dashboard")}>
              Dashboard
            </Link>

            <Link to="/transactions" className={active("/transactions")}>
              Transactions
            </Link>

            <Link to="/budgets" className={active("/budgets")}>
              Budgets
            </Link>

            <span className="max-w-32 truncate text-slate-700">
              {user.name || "My Account"}
            </span>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-slate-300 px-4 py-2 text-slate-700 transition hover:bg-slate-50"
            >
              Log Out
            </button>
          </nav>
        )}

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMenuOpen((previous) => !previous)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 hover:bg-slate-50 md:hidden"
        >
          {menuOpen ? (
            <span className="text-xl">✕</span>
          ) : (
            <span className="text-xl">☰</span>
          )}
        </button>
      </div>

      {/* Mobile navigation */}
      {menuOpen && (
        <nav className="border-t border-slate-200 bg-white px-6 py-5 md:hidden">
          <div className="flex flex-col gap-5 text-sm font-medium">

            {!user ? (
              <>
                <Link
                  to="/"
                  onClick={closeMenu}
                  className={active("/")}
                >
                  Home
                </Link>

                <button
                  type="button"
                  onClick={handleFeaturesClick}
                  className="text-left text-slate-600 hover:text-green-700"
                >
                  Features
                </button>

                <Link
                  to="/login"
                  onClick={closeMenu}
                  className={active("/login")}
                >
                  Log In
                </Link>

                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="rounded-xl bg-green-600 px-5 py-3 text-center text-white hover:bg-green-700"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <span className="font-semibold text-slate-700">
                  Welcome, {user.name || "User"}
                </span>

                <Link
                  to="/dashboard"
                  onClick={closeMenu}
                  className={active("/dashboard")}
                >
                  Dashboard
                </Link>

                <Link
                  to="/transactions"
                  onClick={closeMenu}
                  className={active("/transactions")}
                >
                  Transactions
                </Link>

                <Link
                  to="/budgets"
                  onClick={closeMenu}
                  className={active("/budgets")}
                >
                  Budgets
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl border border-slate-300 px-4 py-3 text-left text-slate-700 hover:bg-slate-50"
                >
                  Log Out
                </button>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
