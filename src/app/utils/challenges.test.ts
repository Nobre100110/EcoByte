import { describe, expect, it } from "vitest";
import {
  advanceDailyChallenge,
  canRedeemReward,
  calculateMissionProgress,
  claimMissionReward,
  createDefaultDailyChallenges,
  getCurrentSequenceState,
  getDailyMissionState,
  getMissionCycleForAccount,
  updateSequenceAfterActivity,
} from "./challenges";
import { MS_IN_DAY } from "./time";

describe("daily challenges", () => {
  it("advances progress and completes a challenge when the target is reached", () => {
    const challenges = createDefaultDailyChallenges();
    const updated = advanceDailyChallenge(challenges, challenges[0].id);

    expect(updated[0].progress).toBe(1);
    expect(updated[0].completed).toBe(true);

    const locked = advanceDailyChallenge(updated, challenges[0].id);
    expect(locked[0].progress).toBe(1);
    expect(locked[0].completed).toBe(true);
  });

  it("prevents rewards that the user cannot afford and accepts exact matching balances", () => {
    expect(canRedeemReward(0, 50)).toBe(false);
    expect(canRedeemReward(49, 50)).toBe(false);
    expect(canRedeemReward(50, 50)).toBe(true);
    expect(canRedeemReward(999, 500)).toBe(true);
  });

  it("calculates mission progress from real activity and blocks duplicate claims", () => {
    expect(calculateMissionProgress(0, 4)).toBe(0);
    expect(calculateMissionProgress(2, 4)).toBe(0.5);
    expect(calculateMissionProgress(4, 4)).toBe(1);

    const result = claimMissionReward({
      userPoints: 900,
      userItemsDisposed: 0,
      userStreak: 0,
      alreadyClaimed: false,
      progressRatio: 1,
      requiredSteps: 1,
      reward: 80,
    });

    expect(result.canClaim).toBe(true);
    expect(result.nextPoints).toBe(980);

    const duplicate = claimMissionReward({
      userPoints: 900,
      userItemsDisposed: 0,
      userStreak: 0,
      alreadyClaimed: true,
      progressRatio: 1,
      requiredSteps: 1,
      reward: 80,
    });

    expect(duplicate.canClaim).toBe(false);
    expect(duplicate.nextPoints).toBe(900);
  });

  it("derives mission state from actual user data without a negative or inflated state", () => {
    const state = getDailyMissionState({
      itemsDisposed: 0,
      points: 125,
      streak: 0,
      claimedMissionIds: [],
    });

    expect(state[0].progress).toBe(0);
    expect(state[0].completed).toBe(false);
    expect(state[1].progress).toBe(0);
    expect(state[2].progress).toBe(0.25);
    expect(state[2].completed).toBe(false);
  });

  it("counts an app open as a new day streak when the user has no current streak yet", () => {
    const now = Date.now();
    const activity = updateSequenceAfterActivity({
      lastValidActivityAt: now - 1000,
      currentDailyStreak: 0,
      currentWeeklyStreak: 0,
      now,
    });

    expect(activity.dailyStreak).toBe(1);
    expect(activity.lastValidActivityAt).toBe(now);
  });

  it("resets a daily streak after the 24-hour validity window expires", () => {
    const sequence = getCurrentSequenceState({
      lastValidActivityAt: Date.now() - MS_IN_DAY - 1000,
      currentDailyStreak: 4,
      currentWeeklyStreak: 1,
      now: Date.now(),
    });

    expect(sequence.dailyStreak).toBe(0);
    expect(sequence.weeklyStreak).toBe(0);
    expect(sequence.lastValidActivityAt).toBeNull();
  });

  it("applies a 15-day developer starter streak only to the developer account", () => {
    const devEmail = "nobre3arthur@gmail.com";
    const regularEmail = "usuario@teste.com";

    const devSequence = getCurrentSequenceState({
      lastValidActivityAt: Date.now() - 1000,
      currentDailyStreak: 15,
      currentWeeklyStreak: 2,
      now: Date.now(),
    });

    const regularSequence = getCurrentSequenceState({
      lastValidActivityAt: null,
      currentDailyStreak: 0,
      currentWeeklyStreak: 0,
      now: Date.now(),
    });

    expect(devSequence.dailyStreak).toBe(15);
    expect(regularSequence.dailyStreak).toBe(0);
    expect(devEmail).not.toBe(regularEmail);
  });

  it("creates a new mission cycle and keeps the reward claim bounded to its expiry window", () => {
    const now = 1_700_000_000_000;
    const cycle = getMissionCycleForAccount({ email: "user@example.com", now });

    expect(cycle.startedAt).toBe(now);
    expect(cycle.expiresAt).toBe(now + MS_IN_DAY);
    expect(cycle.claimedMissionIds).toEqual([]);

    const afterDailyActivity = updateSequenceAfterActivity({
      lastValidActivityAt: now - MS_IN_DAY + 1000,
      currentDailyStreak: 2,
      currentWeeklyStreak: 0,
      now: now + 2000,
    });

    expect(afterDailyActivity.dailyStreak).toBe(3);
    expect(afterDailyActivity.lastValidActivityAt).toBe(now + 2000);
  });
});
