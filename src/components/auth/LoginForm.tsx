"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUsers, saveSession } from "@/lib/storage";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const users = getUsers();
    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    saveSession({ userId: user.id, email: user.email });
    router.replace("/dashboard");
  }

  return (
    <div className="card p-6">
      <form onSubmit={handleSubmit} noValidate>
        {error && (
          <div
            role="alert"
            className="mb-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600"
          >
            {error}
          </div>
        )}

        <div className="mb-4">
          <label
            htmlFor="login-email"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Email
          </label>
          <input
            id="login-email"
            data-testid="auth-login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="login-password"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Password
          </label>
          <input
            id="login-password"
            data-testid="auth-login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          data-testid="auth-login-submit"
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>

        <p className="mt-4 text-center text-sm text-slate-500">
          No account?{" "}
          <Link href="/signup" className="text-green-600 font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
