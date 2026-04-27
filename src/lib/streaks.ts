export function calculateCurrentStreak(
  completions: string[],
  today?: string
): number {
  const todayStr =
    today ?? new Date().toISOString().split("T")[0];

  // Remove duplicates and sort
  const unique = [...new Set(completions)].sort();

  if (!unique.includes(todayStr)) {
    return 0;
  }

  let streak = 0;
  let current = new Date(todayStr);

  while (true) {
    const dateStr = current.toISOString().split("T")[0];
    if (unique.includes(dateStr)) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
