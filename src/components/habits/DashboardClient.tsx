"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Habit } from "@/types/habit";
import { Session } from "@/types/auth";
import { getSession, clearSession, getUserHabits, saveHabits, getHabits } from "@/lib/storage";
import HabitCard from "./HabitCard";
import HabitForm from "./HabitForm";

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

type Mode = "list" | "create" | "edit";

export default function DashboardClient() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [mode, setMode] = useState<Mode>("list");
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [loading, setLoading] = useState(true);
  const today = getToday();

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace("/login");
      return;
    }
    setSession(s);
    setHabits(getUserHabits(s.userId));
    setLoading(false);
  }, [router]);

  function handleLogout() {
    clearSession();
    router.replace("/login");
  }

  function handleCreate(data: { name: string; description: string; frequency: "daily" }) {
    if (!session) return;
    const newHabit: Habit = {
      id: generateId(),
      userId: session.userId,
      name: data.name,
      description: data.description,
      frequency: data.frequency,
      createdAt: new Date().toISOString(),
      completions: [],
    };
    const allHabits = getHabits();
    const updated = [...allHabits, newHabit];
    saveHabits(updated);
    setHabits(updated.filter((h) => h.userId === session.userId));
    setMode("list");
  }

  function handleEdit(data: { name: string; description: string; frequency: "daily" }) {
    if (!session || !editingHabit) return;
    const updatedHabit: Habit = {
      ...editingHabit,
      name: data.name,
      description: data.description,
      frequency: data.frequency,
    };
    const allHabits = getHabits();
    const updated = allHabits.map((h) => (h.id === updatedHabit.id ? updatedHabit : h));
    saveHabits(updated);
    setHabits(updated.filter((h) => h.userId === session.userId));
    setMode("list");
    setEditingHabit(null);
  }

  function handleUpdate(updated: Habit) {
    if (!session) return;
    const allHabits = getHabits();
    const newAll = allHabits.map((h) => (h.id === updated.id ? updated : h));
    saveHabits(newAll);
    setHabits(newAll.filter((h) => h.userId === session.userId));
  }

  function handleDelete(id: string) {
    if (!session) return;
    const allHabits = getHabits();
    const newAll = allHabits.filter((h) => h.id !== id);
    saveHabits(newAll);
    setHabits(newAll.filter((h) => h.userId === session.userId));
  }

  function startEdit(habit: Habit) {
    setEditingHabit(habit);
    setMode("edit");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div data-testid="dashboard-page" className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-sm">✦</span>
            </div>
            <h1
              className="text-lg font-bold text-slate-900"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Habit Tracker
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:block">
              {session?.email}
            </span>
            <button
              data-testid="auth-logout-button"
              onClick={handleLogout}
              className="text-sm px-3 py-1.5 text-slate-600 hover:text-red-500 border border-slate-200 hover:border-red-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-lg mx-auto px-4 py-6">
        {mode === "list" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">
                  Today
                </p>
                <h2
                  className="text-xl font-bold text-slate-900"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </h2>
              </div>
              <button
                data-testid="create-habit-button"
                onClick={() => setMode("create")}
                className="btn-primary py-2 px-4 text-sm"
              >
                + New Habit
              </button>
            </div>

            {habits.length === 0 ? (
              <div
                data-testid="empty-state"
                className="text-center py-16 px-4"
              >
                <div className="text-5xl mb-4">🌱</div>
                <h3
                  className="text-lg font-bold text-slate-700 mb-2"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  No habits yet
                </h3>
                <p className="text-sm text-slate-400 mb-6">
                  Start building better days by adding your first habit.
                </p>
                <button
                  onClick={() => setMode("create")}
                  className="btn-primary"
                >
                  Create your first habit
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {habits.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    today={today}
                    onUpdate={handleUpdate}
                    onEdit={startEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {mode === "create" && (
          <div className="card p-5">
            <h2
              className="text-lg font-bold text-slate-900 mb-4"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              New Habit
            </h2>
            <HabitForm
              onSave={handleCreate}
              onCancel={() => setMode("list")}
            />
          </div>
        )}

        {mode === "edit" && editingHabit && (
          <div className="card p-5">
            <h2
              className="text-lg font-bold text-slate-900 mb-4"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Edit Habit
            </h2>
            <HabitForm
              initial={editingHabit}
              onSave={handleEdit}
              onCancel={() => {
                setMode("list");
                setEditingHabit(null);
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
}
