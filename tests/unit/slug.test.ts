import { describe, it, expect } from "vitest";
import { getHabitSlug } from "@/lib/slug";

describe("getHabitSlug", () => {
  it("returns lowercase hyphenated slug for a basic habit name", () => {
    expect(getHabitSlug("Drink Water")).toBe("drink-water");
    expect(getHabitSlug("Read Books")).toBe("read-books");
  });

  it("trims outer spaces and collapses repeated internal spaces", () => {
    expect(getHabitSlug("  Drink  Water  ")).toBe("drink-water");
    expect(getHabitSlug("  Read   Books  ")).toBe("read-books");
  });

  it("removes non alphanumeric characters except hyphens", () => {
    // Trailing punctuation is stripped
    expect(getHabitSlug("Drink Water!")).toBe("drink-water");
    // Commas and periods within words are stripped
    expect(getHabitSlug("Say hello, world.")).toBe("say-hello-world");
    // Non-alphanum chars stripped without leaving residue
    expect(getHabitSlug("Morning!")).toBe("morning");
    // Hyphens already in the name survive
    expect(getHabitSlug("self-care")).toBe("self-care");
  });
});
