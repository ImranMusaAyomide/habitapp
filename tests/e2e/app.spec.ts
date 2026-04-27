import { test, expect, Page } from "@playwright/test";

// Helpers
async function clearStorage(page: Page) {
  await page.evaluate(() => localStorage.clear());
}

async function seedUser(
  page: Page,
  email = "e2e@example.com",
  password = "password123"
) {
  await page.evaluate(
    ([e, p]) => {
      const users = JSON.parse(
        localStorage.getItem("habit-tracker-users") ?? "[]"
      );
      users.push({
        id: "e2e-user-id",
        email: e,
        password: p,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem("habit-tracker-users", JSON.stringify(users));
    },
    [email, password]
  );
}

async function seedSession(
  page: Page,
  userId = "e2e-user-id",
  email = "e2e@example.com"
) {
  await page.evaluate(
    ([uid, em]) => {
      localStorage.setItem(
        "habit-tracker-session",
        JSON.stringify({ userId: uid, email: em })
      );
    },
    [userId, email]
  );
}

async function signUp(page: Page, email: string, password: string) {
  await page.goto("/signup");
  await page.getByTestId("auth-signup-email").fill(email);
  await page.getByTestId("auth-signup-password").fill(password);
  await page.getByTestId("auth-signup-submit").click();
}

async function logIn(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByTestId("auth-login-email").fill(email);
  await page.getByTestId("auth-login-password").fill(password);
  await page.getByTestId("auth-login-submit").click();
}

test.describe("Habit Tracker app", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearStorage(page);
  });

  test("shows the splash screen and redirects unauthenticated users to /login", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByTestId("splash-screen")).toBeVisible();
    await page.waitForURL("/login", { timeout: 5000 });
    await expect(page).toHaveURL("/login");
  });

  test("redirects authenticated users from / to /dashboard", async ({
    page,
  }) => {
    await seedUser(page);
    await seedSession(page);
    await page.goto("/");
    await page.waitForURL("/dashboard", { timeout: 5000 });
    await expect(page).toHaveURL("/dashboard");
  });

  test("prevents unauthenticated access to /dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL("/login", { timeout: 5000 });
    await expect(page).toHaveURL("/login");
  });

  test("signs up a new user and lands on the dashboard", async ({ page }) => {
    await signUp(page, "newuser@example.com", "pass1234");
    await page.waitForURL("/dashboard", { timeout: 5000 });
    await expect(page.getByTestId("dashboard-page")).toBeVisible();
  });

  test("logs in an existing user and loads only that user's habits", async ({
    page,
  }) => {
    // Seed two users with different habits
    await page.evaluate(() => {
      localStorage.setItem(
        "habit-tracker-users",
        JSON.stringify([
          {
            id: "user-a",
            email: "usera@example.com",
            password: "pass",
            createdAt: new Date().toISOString(),
          },
          {
            id: "user-b",
            email: "userb@example.com",
            password: "pass",
            createdAt: new Date().toISOString(),
          },
        ])
      );
      localStorage.setItem(
        "habit-tracker-habits",
        JSON.stringify([
          {
            id: "h1",
            userId: "user-a",
            name: "User A Habit",
            description: "",
            frequency: "daily",
            createdAt: new Date().toISOString(),
            completions: [],
          },
          {
            id: "h2",
            userId: "user-b",
            name: "User B Habit",
            description: "",
            frequency: "daily",
            createdAt: new Date().toISOString(),
            completions: [],
          },
        ])
      );
    });

    await logIn(page, "usera@example.com", "pass");
    await page.waitForURL("/dashboard", { timeout: 5000 });

    await expect(page.getByTestId("habit-card-user-a-habit")).toBeVisible();
    await expect(page.getByTestId("habit-card-user-b-habit")).not.toBeVisible();
  });

  test("creates a habit from the dashboard", async ({ page }) => {
    await signUp(page, "creator@example.com", "pass1234");
    await page.waitForURL("/dashboard", { timeout: 5000 });

    await page.getByTestId("create-habit-button").click();
    await expect(page.getByTestId("habit-form")).toBeVisible();

    await page.getByTestId("habit-name-input").fill("Drink Water");
    await page.getByTestId("habit-description-input").fill("8 glasses");
    await page.getByTestId("habit-save-button").click();

    await expect(page.getByTestId("habit-card-drink-water")).toBeVisible();
  });

  test("completes a habit for today and updates the streak", async ({
    page,
  }) => {
    await signUp(page, "streaker@example.com", "pass1234");
    await page.waitForURL("/dashboard", { timeout: 5000 });

    // Create habit
    await page.getByTestId("create-habit-button").click();
    await page.getByTestId("habit-name-input").fill("Exercise");
    await page.getByTestId("habit-save-button").click();
    await expect(page.getByTestId("habit-card-exercise")).toBeVisible();

    // Verify streak is 0
    await expect(page.getByTestId("habit-streak-exercise")).toContainText("0");

    // Complete it
    await page.getByTestId("habit-complete-exercise").click();

    // Streak should now be 1
    await expect(page.getByTestId("habit-streak-exercise")).toContainText("1");
  });

  test("persists session and habits after page reload", async ({ page }) => {
    await signUp(page, "persist@example.com", "pass1234");
    await page.waitForURL("/dashboard", { timeout: 5000 });

    // Create a habit
    await page.getByTestId("create-habit-button").click();
    await page.getByTestId("habit-name-input").fill("Morning Run");
    await page.getByTestId("habit-save-button").click();
    await expect(page.getByTestId("habit-card-morning-run")).toBeVisible();

    // Reload
    await page.reload();
    await page.waitForURL("/dashboard", { timeout: 5000 });
    await expect(page.getByTestId("dashboard-page")).toBeVisible();
    await expect(page.getByTestId("habit-card-morning-run")).toBeVisible();
  });

  test("logs out and redirects to /login", async ({ page }) => {
    await signUp(page, "logout@example.com", "pass1234");
    await page.waitForURL("/dashboard", { timeout: 5000 });

    await page.getByTestId("auth-logout-button").click();
    await page.waitForURL("/login", { timeout: 5000 });
    await expect(page).toHaveURL("/login");
  });

  test("loads the cached app shell when offline after the app has been loaded once", async ({
    page,
    context,
  }) => {
    // Load the app once while online so SW caches it
    await signUp(page, "offline@example.com", "pass1234");
    await page.waitForURL("/dashboard", { timeout: 5000 });
    await expect(page.getByTestId("dashboard-page")).toBeVisible();

    // Wait a moment for SW to cache
    await page.waitForTimeout(1500);

    // Go offline
    await context.setOffline(true);

    // Navigate to root — should not hard-crash
    await page.goto("/");

    // App shell should still load (SW cache or static shell)
    // Check page is not a hard crash (no net::ERR_INTERNET_DISCONNECTED error page)
    const title = await page.title();
    expect(title).not.toBe("");

    // Re-enable network
    await context.setOffline(false);
  });
});
