import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock next/navigation
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, push: vi.fn() }),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import { getSession, getUsers } from "@/lib/storage";

describe("auth flow", () => {
  beforeEach(() => {
    localStorage.clear();
    mockReplace.mockClear();
  });

  it("submits the signup form and creates a session", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByTestId("auth-signup-email"), "test@example.com");
    await user.type(screen.getByTestId("auth-signup-password"), "password123");
    await user.click(screen.getByTestId("auth-signup-submit"));

    await waitFor(() => {
      const session = getSession();
      expect(session).not.toBeNull();
      expect(session?.email).toBe("test@example.com");
    });

    expect(mockReplace).toHaveBeenCalledWith("/dashboard");
  });

  it("shows an error for duplicate signup email", async () => {
    const user = userEvent.setup();

    // Pre-seed a user
    const users = [
      {
        id: "existing-id",
        email: "dupe@example.com",
        password: "pass",
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem("habit-tracker-users", JSON.stringify(users));

    render(<SignupForm />);
    await user.type(screen.getByTestId("auth-signup-email"), "dupe@example.com");
    await user.type(screen.getByTestId("auth-signup-password"), "password123");
    await user.click(screen.getByTestId("auth-signup-submit"));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("User already exists");
    });
  });

  it("submits the login form and stores the active session", async () => {
    const user = userEvent.setup();

    // Pre-seed user
    const users = [
      {
        id: "user-abc",
        email: "login@example.com",
        password: "secret",
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem("habit-tracker-users", JSON.stringify(users));

    render(<LoginForm />);
    await user.type(screen.getByTestId("auth-login-email"), "login@example.com");
    await user.type(screen.getByTestId("auth-login-password"), "secret");
    await user.click(screen.getByTestId("auth-login-submit"));

    await waitFor(() => {
      const session = getSession();
      expect(session).not.toBeNull();
      expect(session?.userId).toBe("user-abc");
      expect(session?.email).toBe("login@example.com");
    });

    expect(mockReplace).toHaveBeenCalledWith("/dashboard");
  });

  it("shows an error for invalid login credentials", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByTestId("auth-login-email"), "nobody@example.com");
    await user.type(screen.getByTestId("auth-login-password"), "wrongpass");
    await user.click(screen.getByTestId("auth-login-submit"));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Invalid email or password");
    });
  });
});
