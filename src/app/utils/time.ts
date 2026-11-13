export const MS_IN_DAY = 24 * 60 * 60 * 1000;

export type SequenceSnapshot = {
  dailyStreak: number;
  weeklyStreak: number;
  lastValidActivityAt: number | null;
  resetReason: "none" | "expired" | "missing";
};

export type MissionCycle = {
  cycleId: string;
  startedAt: number;
  expiresAt: number;
  claimedMissionIds: string[];
  generatedAt: number;
};

export const normalizeTimestamp = (
  value: number | string | null | undefined,
): number | null => {
  if (typeof value === "string") {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return null;
    return parsed;
  }

  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return value;
};

export const reconcileSequenceState = ({
  lastValidActivityAt,
  currentDailyStreak = 0,
  currentWeeklyStreak = 0,
  now = Date.now(),
}: {
  lastValidActivityAt: number | string | null | undefined;
  currentDailyStreak?: number;
  currentWeeklyStreak?: number;
  now?: number;
}): SequenceSnapshot => {
  const lastAt = normalizeTimestamp(lastValidActivityAt);

  if (!lastAt) {
    return {
      dailyStreak: 0,
      weeklyStreak: 0,
      lastValidActivityAt: null,
      resetReason: "missing",
    };
  }

  const elapsed = now - lastAt;
  if (elapsed > MS_IN_DAY) {
    return {
      dailyStreak: 0,
      weeklyStreak: 0,
      lastValidActivityAt: null,
      resetReason: "expired",
    };
  }

  return {
    dailyStreak: Math.max(0, Number(currentDailyStreak) || 0),
    weeklyStreak: Math.max(0, Number(currentWeeklyStreak) || 0),
    lastValidActivityAt: lastAt,
    resetReason: "none",
  };
};

export const recordDailyActivity = ({
  lastValidActivityAt,
  currentDailyStreak = 0,
  currentWeeklyStreak = 0,
  now = Date.now(),
}: {
  lastValidActivityAt: number | string | null | undefined;
  currentDailyStreak?: number;
  currentWeeklyStreak?: number;
  now?: number;
}) => {
  const lastAt = normalizeTimestamp(lastValidActivityAt);
  const safeDailyStreak = Math.max(0, Number(currentDailyStreak) || 0);
  const safeWeeklyStreak = Math.max(0, Number(currentWeeklyStreak) || 0);

  if (!lastAt) {
    return {
      dailyStreak: 1,
      weeklyStreak: 0,
      lastValidActivityAt: now,
      didCreateNewStreak: true,
      didReset: false,
    };
  }

  const elapsed = now - lastAt;
  if (elapsed < MS_IN_DAY) {
    const nextDailyStreak = Math.max(1, safeDailyStreak);
    return {
      dailyStreak: nextDailyStreak,
      weeklyStreak: safeWeeklyStreak,
      lastValidActivityAt: now,
      didCreateNewStreak: safeDailyStreak === 0,
      didReset: false,
    };
  }

  const nextDailyStreak = Math.max(1, safeDailyStreak + 1);
  const nextWeeklyStreak = Math.floor(nextDailyStreak / 7);

  return {
    dailyStreak: nextDailyStreak,
    weeklyStreak: nextWeeklyStreak,
    lastValidActivityAt: now,
    didCreateNewStreak: true,
    didReset: false,
  };
};

export const createMissionCycle = (now = Date.now()): MissionCycle => ({
  cycleId: `mission-cycle-${Math.floor(now / MS_IN_DAY)}`,
  startedAt: now,
  expiresAt: now + MS_IN_DAY,
  claimedMissionIds: [],
  generatedAt: now,
});

export const getActiveMissionCycle = ({
  cycle,
  now = Date.now(),
}: {
  cycle: MissionCycle | null | undefined;
  now?: number;
}) => {
  if (
    !cycle ||
    !cycle.startedAt ||
    !cycle.expiresAt ||
    now >= cycle.expiresAt
  ) {
    return createMissionCycle(now);
  }

  return cycle;
};

export const formatRemainingWindow = (
  expiresAt: number | null | undefined,
  now = Date.now(),
): string => {
  if (!expiresAt || !Number.isFinite(expiresAt)) {
    return "Próxima renovação em breve";
  }

  const remainingMs = Math.max(0, expiresAt - now);
  const totalHours = Math.floor(remainingMs / (60 * 60 * 1000));
  const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));

  if (totalHours > 0) {
    return `${totalHours}h ${minutes}m restantes`;
  }

  if (minutes > 0) {
    return `${minutes}m restantes`;
  }

  return "Renovando agora";
};
