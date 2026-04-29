"use client";

import { useState } from "react";
import { Habit } from "@/types/habit";
import { validateHabitName } from "@/lib/validators";

interface HabitFormProps {
  initial?: Partial<Habit>;
  onSave: (data: { name: string; description: string; frequency: "daily" | "weekly" | "monthly" }) => void;
  onCancel: () => void;
}

export default function HabitForm({ initial, onSave, onCancel }: HabitFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">(initial?.frequency ?? "daily");
  const [nameError, setNameError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validation = validateHabitName(name);
    if (!validation.valid) {
      setNameError(validation.error);
      return;
    }
    setNameError(null);
    onSave({ name: validation.value, description: description.trim(), frequency });
  }

  return (
    <form
      data-testid="habit-form"
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4"
    >
      <div>
        <label
          htmlFor="habit-name"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Habit Name <span className="text-red-400">*</span>
        </label>
        <input
          id="habit-name"
          data-testid="habit-name-input"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (nameError) setNameError(null);
          }}
          className={`input-field ${nameError ? "border-red-300 focus:ring-red-400" : ""}`}
          placeholder="e.g. Drink Water"
          maxLength={65}
        />
        {nameError && (
          <p role="alert" className="mt-1 text-xs text-red-500">
            {nameError}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="habit-description"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Description <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <input
          id="habit-description"
          data-testid="habit-description-input"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-field"
          placeholder="Brief description"
        />
      </div>

      <div>
        <label
          htmlFor="habit-frequency"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Frequency
        </label>
        <select
          id="habit-frequency"
          data-testid="habit-frequency-select"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as "daily" | "weekly" | "monthly")}
          className="input-field"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          data-testid="habit-save-button"
          className="btn-primary flex-1"
        >
          {initial?.id ? "Save Changes" : "Create Habit"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary flex-1"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
