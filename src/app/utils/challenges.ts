import {
  buildAccountStorageKey,
  readStorageJson,
  writeStorageJson,
} from "./storage";
import {
  createMissionCycle,
  getActiveMissionCycle,
  MS_IN_DAY,
  reconcileSequenceState,
  recordDailyActivity,
} from "./time";

export type DailyChallenge = {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  points: number;
  completed: boolean;
  difficulty: "Fácil" | "Médio" | "Desafio";
  icon: string;
};

export type MissionClaimInput = {
  userPoints: number;
  userItemsDisposed: number;
  userStreak: number;
  alreadyClaimed: boolean;
  progressRatio: number;
  requiredSteps: number;
  reward: number;
};

export type MissionState = {
  id: string;
  title: string;
  description: string;
  target: number;
  reward: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  canClaim: boolean;
  difficulty: "Fácil" | "Médio" | "Desafio";
  icon: string;
};

export type MissionCycleRecord = {
  cycleId: string;
  startedAt: number;
  expiresAt: number;
  claimedMissionIds: string[];
  generatedAt: number;
};

const clampRatio = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  return Math.min(1, value);
};

export const calculateMissionProgress = (
  completed: number,
  required: number,
): number => {
  if (!Number.isFinite(completed) || !Number.isFinite(required)) {
    return 0;
  }

  if (required <= 0) {
    return 0;
  }

  const ratio = completed / required;
  return clampRatio(ratio);
};

export const canRedeemReward = (
  currentPoints: number,
  cost: number,
): boolean => {
  if (!Number.isFinite(currentPoints) || !Number.isFinite(cost)) {
    return false;
  }

  if (currentPoints < 0 || cost < 0) {
    return false;
  }

  return currentPoints >= cost;
};

export const claimMissionReward = ({
  userPoints,
  reward,
  progressRatio,
  alreadyClaimed,
}: MissionClaimInput): {
  canClaim: boolean;
  nextPoints: number;
  reward: number;
  reason?: string;
} => {
  if (!Number.isFinite(userPoints) || !Number.isFinite(reward)) {
    return {
      canClaim: false,
      nextPoints: Math.max(0, userPoints),
      reward: 0,
      reason: "Dados inválidos.",
    };
  }

  if (alreadyClaimed) {
    return {
      canClaim: false,
      nextPoints: Math.max(0, userPoints),
      reward: 0,
      reason: "Missão já foi resgatada.",
    };
  }

  if (progressRatio < 1) {
    return {
      canClaim: false,
      nextPoints: Math.max(0, userPoints),
      reward: 0,
      reason: "Missão ainda incompleta.",
    };
  }

  return {
    canClaim: true,
    nextPoints: Math.max(0, userPoints + reward),
    reward,
  };
};

export const getMissionCycleForAccount = ({
  email,
  now = Date.now(),
}: {
  email?: string;
  now?: number;
}): MissionCycleRecord => {
  if (!email) {
    return createMissionCycle(now);
  }

  const stored = readStorageJson<MissionCycleRecord | null>(
    buildAccountStorageKey("ecobyte_mission_cycle", email),
    null,
  );

  const cycle = getActiveMissionCycle({ cycle: stored, now });
  writeStorageJson(
    buildAccountStorageKey("ecobyte_mission_cycle", email),
    cycle,
  );

  return cycle;
};

export const getDailyMissionState = ({
  itemsDisposed,
  points,
  streak,
  claimedMissionIds,
}: {
  itemsDisposed: number;
  points: number;
  streak: number;
  claimedMissionIds: string[];
}): MissionState[] => {
  const missionDefinitions = [
    {
      id: "dispose-three",
      title: "Registrar 3 descartes",
      description: "Registre itens eletrônicos para acumular pontos reais.",
      target: 3,
      reward: 120,
      difficulty: "Fácil",
      icon: "battery",
      progressValue: Math.max(0, Number(itemsDisposed) || 0),
    },
    {
      id: "schedule-collection",
      title: "Completar 1 coleta",
      description:
        "Finalize uma coleta agendada para manter o ciclo sustentável.",
      target: 1,
      reward: 180,
      difficulty: "Médio",
      icon: "calendar",
      progressValue: Number(streak) > 0 ? 1 : 0,
    },
    {
      id: "points-500",
      title: "Acumular 500 EcoPontos",
      description: "Conquiste pontos suficientes para reforçar seu progresso.",
      target: 500,
      reward: 80,
      difficulty: "Desafio",
      icon: "coins",
      progressValue: Math.max(0, Number(points) || 0),
    },
  ];

  return missionDefinitions.map((mission) => {
    const progress = calculateMissionProgress(
      mission.progressValue,
      mission.target,
    );
    const claimed = claimedMissionIds.includes(mission.id);
    const completed = progress >= 1;

    return {
      id: mission.id,
      title: mission.title,
      description: mission.description,
      target: mission.target,
      reward: mission.reward,
      progress,
      completed: completed || claimed,
      claimed,
      canClaim: completed && !claimed,
      difficulty: mission.difficulty,
      icon: mission.icon,
    };
  });
};

export const createDefaultDailyChallenges = (): DailyChallenge[] => [
  {
    id: "dispose-battery",
    title: "Descartar 1 bateria corretamente",
    description: "Leve uma bateria usada até um ponto de coleta.",
    target: 1,
    progress: 0,
    points: 80,
    completed: false,
    difficulty: "Fácil",
    icon: "battery",
  },
  {
    id: "share-guide",
    title: "Compartilhar o guia",
    description: "Ajude outra pessoa a encontrar o app.",
    target: 1,
    progress: 0,
    points: 60,
    completed: false,
    difficulty: "Médio",
    icon: "share2",
  },
  {
    id: "schedule-collection",
    title: "Agendar uma coleta",
    description: "Marque uma coleta no calendário para hoje.",
    target: 1,
    progress: 0,
    points: 120,
    completed: false,
    difficulty: "Desafio",
    icon: "calendar",
  },
];

export const advanceDailyChallenge = (
  challenges: DailyChallenge[],
  challengeId: string,
): DailyChallenge[] =>
  challenges.map((challenge) => {
    if (challenge.id !== challengeId || challenge.completed) {
      return challenge;
    }

    const nextProgress = Math.min(
      challenge.target,
      Math.max(0, challenge.progress + 1),
    );
    return {
      ...challenge,
      progress: nextProgress,
      completed: nextProgress >= challenge.target,
    };
  });

export const loadChallengesForAccount = (email?: string): DailyChallenge[] => {
  if (!email) {
    return createDefaultDailyChallenges();
  }

  return (
    readStorageJson<DailyChallenge[] | null>(
      buildAccountStorageKey("ecobyte_daily_challenges", email),
      null,
    ) ?? createDefaultDailyChallenges()
  );
};

export const saveChallengesForAccount = (
  email: string | undefined,
  challenges: DailyChallenge[],
) => {
  if (!email) return;
  writeStorageJson(
    buildAccountStorageKey("ecobyte_daily_challenges", email),
    challenges,
  );
};

export const getCurrentSequenceState = ({
  lastValidActivityAt,
  currentDailyStreak,
  currentWeeklyStreak,
  now,
}: {
  lastValidActivityAt: number | string | null | undefined;
  currentDailyStreak?: number;
  currentWeeklyStreak?: number;
  now?: number;
}) =>
  reconcileSequenceState({
    lastValidActivityAt,
    currentDailyStreak,
    currentWeeklyStreak,
    now,
  });

export const updateSequenceAfterActivity = ({
  lastValidActivityAt,
  currentDailyStreak,
  currentWeeklyStreak,
  now,
}: {
  lastValidActivityAt: number | string | null | undefined;
  currentDailyStreak?: number;
  currentWeeklyStreak?: number;
  now?: number;
}) =>
  recordDailyActivity({
    lastValidActivityAt,
    currentDailyStreak,
    currentWeeklyStreak,
    now,
  });

export const getEffectiveWindowDuration = () => MS_IN_DAY;
