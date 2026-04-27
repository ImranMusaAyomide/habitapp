import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, push: vi.fn() }),
}));
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

import DashboardClient from "@/components/habits/DashboardClient";
import { getHabits, saveSession } from "@/lib/storage";

const SESSION = { userId: "user-test", email: "test@example.com" };

function seedSession() {
  localStorage.setItem("habit-tracker-session", JSON.stringify(SESSION));
}

describe("habit form", () => {
  beforeEach(() => {
    localStorage.clear();
    mockReplace.mockClear();
    seedSession();
  });

  it("shows a validation error when habit name is empty", async () => {
    const user = userEvent.setup();
    render(<DashboardClient />);

    await waitFor(() => screen.getByTestId("dashboard-page"));
    await user.click(screen.getByTestId("create-habit-button"));
    await waitFor(() => screen.getByTestId("habit-form"));

    // Submit without entering a name
    await user.click(screen.getByTestId("habit-save-button"));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Habit name is required");
    });
  });

  it("creates a new habit and renders it in the list", async () => {
    const user = userEvent.setup();
    render(<DashboardClient />);

    await waitFor(() => screen.getByTestId("dashboard-page"));
    await user.click(screen.getByTestId("create-habit-button"));
    await waitFor(() => screen.getByTestId("habit-form"));

    await user.type(screen.getByTestId("habit-name-input"), "Drink Water");
    await user.type(screen.getByTestId("habit-description-input"), "8 glasses a day");
    await user.click(screen.getByTestId("habit-save-button"));

    await waitFor(() => {
      expect(screen.getByTestId("habit-card-drink-water")).toBeInTheDocument();
    });

    // Also persisted in localStorage
    const habits = getHabits();
    expect(habits.some((h) => h.name === "Drink Water")).toBe(true);
  });

  it("edits an existing habit and preserves immutable fields", async () => {
    const user = userEvent.setup();

    // Pre-seed a habit
    const habit = {
      id: "habit-original-id",
      userId: SESSION.userId,
      name: "Read Books",
      description: "Read daily",
      frequency: "daily" as const,
      createdAt: "2024-01-01T00:00:00.000Z",
      completions: ["2024-06-14"],
    };
    localStorage.setItem("habit-tracker-habits", JSON.stringify([habit]));

    render(<DashboardClient />);
    await waitFor(() => screen.getByTestId("habit-card-read-books"));

    // Click edit
    await user.click(screen.getByTestId("habit-edit-read-books"));
    await waitFor(() => screen.getByTestId("habit-form"));

    // Change name
    const nameInput = screen.getByTestId("habit-name-input");
    await user.clear(nameInput);
    await user.type(nameInput, "Read Every Day");
    await user.click(screen.getByTestId("habit-save-button"));

    await waitFor(() => {
      expect(screen.getByTestId("habit-card-read-every-day")).toBeInTheDocument();
    });

    // Immutable fields preserved
    const habits = getHabits();
    const updated = habits.find((h) => h.id === "habit-original-id");
    expect(updated).toBeDefined();
    expect(updated!.createdAt).toBe("2024-01-01T00:00:00.000Z");
    expect(updated!.completions).toEqual(["2024-06-14"]);
    expect(updated!.userId).toBe(SESSION.userId);
  });

  it("deletes a habit only after explicit confirmation", async () => {
    const user = userEvent.setup();

    const habit = {
      id: "habit-del-id",
      userId: SESSION.userId,
      name: "Morning Run",
      description: "",
      frequency: "daily" as const,
      createdAt: "2024-01-01T00:00:00.000Z",
      completions: [],
    };
    localStorage.setItem("habit-tracker-habits", JSON.stringify([habit]));

    render(<DashboardClient />);
    await waitFor(() => screen.getByTestId("habit-card-morning-run"));

    // Click delete — should show confirmation, not delete yet
    await user.click(screen.getByTestId("habit-delete-morning-run"));
    expect(screen.getByTestId("habit-card-morning-run")).toBeInTheDocument();
    expect(screen.getByTestId("confirm-delete-button")).toBeInTheDocument();

    // Now confirm
    await user.click(screen.getByTestId("confirm-delete-button"));

    await waitFor(() => {
      expect(screen.queryByTestId("habit-card-morning-run")).not.toBeInTheDocument();
    });

    const habits = getHabits();
    expect(habits.find((h) => h.id === "habit-del-id")).toBeUndefined();
  });

  it("toggles completion and updates the streak display", async () => {
    const user = userEvent.setup();
    const today = new Date().toISOString().split("T")[0];

    const habit = {
      id: "habit-streak-id",
      userId: SESSION.userId,
      name: "Meditate",
      description: "",
      frequency: "daily" as const,
      createdAt: "2024-01-01T00:00:00.000Z",
      completions: [],
    };
    localStorage.setItem("habit-tracker-habits", JSON.stringify([habit]));

    render(<DashboardClient />);
    await waitFor(() => screen.getByTestId("habit-card-meditate"));

    // Initially streak is 0
    expect(screen.getByTestId("habit-streak-meditate")).toHaveTextContent("0");

    // Mark complete
    await user.click(screen.getByTestId("habit-complete-meditate"));

    await waitFor(() => {
      expect(screen.getByTestId("habit-streak-meditate")).toHaveTextContent("1");
    });

    // Unmark
    await user.click(screen.getByTestId("habit-complete-meditate"));

    await waitFor(() => {
      expect(screen.getByTestId("habit-streak-meditate")).toHaveTextContent("0");
    });
  });
});
