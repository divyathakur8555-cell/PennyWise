
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export function Login() {
  return <Auth registerMode={false} />;
}

export function Register() {
  return <Auth registerMode={true} />;
}

function Auth({ registerMode }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const updateField = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (registerMode && !name) {
      setError("Please enter your full name.");
      return;
    }

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (!password || password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      if (registerMode) {
        await register({
          name,
          email,
          password,
        });
      } else {
        await login({
          email,
          password,
        });
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-slate-50 px-4 py-12">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl md:grid-cols-2">

        {/* Left information panel */}
        <div className="hidden flex-col justify-between bg-green-700 p-12 text-white md:flex">
          <div>
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl font-bold text-green-700">
                P
              </div>

              <span className="text-2xl font-bold">
                PennyWise
              </span>
            </Link>

            <h1 className="mt-16 text-4xl font-bold leading-tight">
              Make every rupee count.
            </h1>

            <p className="mt-6 leading-relaxed text-green-100">
              Take control of your money with simple expense tracking,
              smarter budgeting and clear financial insights.
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-6">
            <p className="text-lg font-semibold">
              Your financial journey starts here.
            </p>

            <p className="mt-2 text-sm text-green-100">
              Track better. Plan smarter. Save more.
            </p>
          </div>
        </div>

        {/* Form panel */}
        <div className="p-7 sm:p-12">
          <div className="mb-8">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-xl font-bold text-green-700 md:hidden">
              P
            </div>

            <p className="font-semibold text-green-600">
              {registerMode ? "GET STARTED" : "WELCOME BACK"}
            </p>

            <h2 className="mt-2 text-3xl font-bold text-slate-800">
              {registerMode
                ? "Create your account"
                : "Sign in to PennyWise"}
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              {registerMode
                ? "Create an account to start managing your personal finances."
                : "Enter your account details to access your personal dashboard."}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            {registerMode && (
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Full Name
                </label>

                <input
                  id="name"
                  className="field"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  autoComplete="name"
                  maxLength={80}
                  value={form.name}
                  onChange={updateField}
                  required
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email Address
              </label>

              <input
                id="email"
                className="field"
                type="email"
                name="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={form.email}
                onChange={updateField}
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  className="field pr-16"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  autoComplete={
                    registerMode ? "new-password" : "current-password"
                  }
                  minLength={8}
                  value={form.password}
                  onChange={updateField}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-green-700 hover:text-green-800"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {registerMode && (
                <p className="mt-2 text-xs text-slate-400">
                  Password must contain at least 8 characters.
                </p>
              )}
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-green-600 py-3.5 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Please wait..."
                : registerMode
                  ? "Create Account"
                  : "Sign In"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            {registerMode
              ? "Already have an account?"
              : "Don't have an account?"}

            <Link
              className="ml-1 font-semibold text-green-700 hover:text-green-800"
              to={registerMode ? "/login" : "/register"}
            >
              {registerMode ? "Log In" : "Create Account"}
            </Link>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-5 text-center">
            <Link
              to="/"
              className="text-sm text-slate-400 hover:text-green-700"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
