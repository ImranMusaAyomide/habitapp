"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUsers, saveUsers, saveSession } from "@/lib/storage";

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const users = getUsers();
    const exists = users.some((u) => u.email === email);

    if (exists) {
      setError("User already exists");
      setLoading(false);
      return;
    }

    const newUser = {
      id: generateId(),
      email,
      password,
      phone,
      createdAt: new Date().toISOString(),
    };

    saveUsers([...users, newUser]);
    saveSession({ userId: newUser.id, email: newUser.email });
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
            htmlFor="signup-email"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Email
          </label>
          <input
            id="signup-email"
            data-testid="auth-signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="signup-password"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Password
          </label>
          <input
            id="signup-password"
            data-testid="auth-signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            placeholder="Choose a password"
            required
            autoComplete="new-password"
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="signup-phone"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Phone Number
          </label>
          <input
            id="signup-phone"
            data-testid="auth-signup-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input-field"
            placeholder="+1 (555) 123-4567"
            autoComplete="tel"
          />
        </div>

        <button
          type="submit"
          data-testid="auth-signup-submit"
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? "Creating account…" : "Create Account"}
        </button>

        <p className="mt-4 text-center text-sm">
          <Link href="/login" className="text-green-600 font-medium hover:underline">
            Already have an account? Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
