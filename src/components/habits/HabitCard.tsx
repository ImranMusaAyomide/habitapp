"use client";

import { useState } from "react";
import { Habit } from "@/types/habit";
import { getHabitSlug } from "@/lib/slug";
import { calculateCurrentStreak } from "@/lib/streaks";
import { toggleHabitCompletion } from "@/lib/habits";

interface HabitCardProps {
  habit: Habit;
  today: string;
  onUpdate: (updated: Habit) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
}

export default function HabitCard({
  habit,
  today,
  onUpdate,
  onEdit,
  onDelete,
}: HabitCardProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const slug = getHabitSlug(habit.name);
  const streak = calculateCurrentStreak(habit.completions, today);
  const isCompleted = habit.completions.includes(today);

  function handleToggle() {
    const updated = toggleHabitCompletion(habit, today);
    onUpdate(updated);
  }

  function handleDelete() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    onDelete(habit.id);
  }

  return (
    <div
      data-testid={`habit-card-${slug}`}
      className={`card p-4 transition-all duration-200 ${
        isCompleted
          ? "border-green-200 bg-green-50"
          : "border-slate-100 bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Complete toggle */}
        <button
          data-testid={`habit-complete-${slug}`}
          onClick={handleToggle}
          aria-label={isCompleted ? `Unmark ${habit.name}` : `Complete ${habit.name}`}
          aria-pressed={isCompleted}
          className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 ${
            isCompleted
              ? "bg-green-500 border-green-500 text-white"
              : "border-slate-300 hover:border-green-400"
          }`}
        >
          {isCompleted && (
            <svg className="w-full h-full p-0.5" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 13l4 4L19 7"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold text-sm ${
              isCompleted ? "text-green-800 line-through opacity-75" : "text-slate-900"
            }`}
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {habit.name}
          </h3>
          {habit.description && (
            <p className="text-xs text-slate-500 mt-0.5 truncate">{habit.description}</p>
          )}

          {/* Streak */}
          <div
            data-testid={`habit-streak-${slug}`}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium"
          >
            <span className={streak > 0 ? "text-orange-500" : "text-slate-400"}>
              {streak > 0 ? "🔥" : "○"}
            </span>
            <span className={streak > 0 ? "text-orange-600" : "text-slate-400"}>
              {streak} day{streak !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1 flex-shrink-0">
          {confirmingDelete ? (
            <div className="flex gap-1">
              <button
                data-testid="confirm-delete-button"
                onClick={handleDelete}
                className="text-xs px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmingDelete(false)}
                className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <button
                data-testid={`habit-edit-${slug}`}
                onClick={() => onEdit(habit)}
                aria-label={`Edit ${habit.name}`}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button
                data-testid={`habit-delete-${slug}`}
                onClick={() => setConfirmingDelete(true)}
                aria-label={`Delete ${habit.name}`}
                className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
