import { describe, it, expect } from "vitest";
import { toggleHabitCompletion } from "@/lib/habits";
import { Habit } from "@/types/habit";

const baseHabit: Habit = {
  id: "habit-1",
  userId: "user-1",
  name: "Drink Water",
  description: "Stay hydrated",
  frequency: "daily",
  createdAt: "2024-01-01T00:00:00.000Z",
  completions: [],
};

describe("toggleHabitCompletion", () => {
  it("adds a completion date when the date is not present", () => {
    const result = toggleHabitCompletion(baseHabit, "2024-06-15");
    expect(result.completions).toContain("2024-06-15");
    expect(result.completions).toHaveLength(1);
  });

  it("removes a completion date when the date already exists", () => {
    const habit: Habit = { ...baseHabit, completions: ["2024-06-15", "2024-06-14"] };
    const result = toggleHabitCompletion(habit, "2024-06-15");
    expect(result.completions).not.toContain("2024-06-15");
    expect(result.completions).toContain("2024-06-14");
  });

  it("does not mutate the original habit object", () => {
    const habit: Habit = { ...baseHabit, completions: ["2024-06-14"] };
    const original = [...habit.completions];
    toggleHabitCompletion(habit, "2024-06-15");
    expect(habit.completions).toEqual(original);
  });

  it("does not return duplicate completion dates", () => {
    // Habit already has a duplicate (should not happen in practice but we guard against it)
    const habit: Habit = {
      ...baseHabit,
      completions: ["2024-06-15", "2024-06-15", "2024-06-14"],
    };
    // Toggle off the date — result should have no duplicates
    const result = toggleHabitCompletion(habit, "2024-06-15");
    const unique = new Set(result.completions);
    expect(result.completions.length).toBe(unique.size);
  });
});
