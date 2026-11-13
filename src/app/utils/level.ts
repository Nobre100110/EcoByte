export type LevelInfo = {
  level: number;
  name: string;
  current: number; // points threshold for current level
  next: number; // points threshold for next level
  progress: number; // 0-1 progress between current and next
};

const LEVELS: { level: number; name: string; pts: number }[] = [
  { level: 1, name: "Iniciante", pts: 0 },
  { level: 2, name: "Explorador", pts: 200 },
  { level: 3, name: "Consciente", pts: 500 },
  { level: 4, name: "Guardião Verde", pts: 1000 },
  { level: 5, name: "Reciclador", pts: 2000 },
  { level: 6, name: "EcoWarrior", pts: 3500 },
  { level: 7, name: "Sustentável", pts: 5500 },
  { level: 8, name: "EcoChampion", pts: 8000 },
  { level: 9, name: "Guardião do Planeta", pts: 12000 },
  { level: 10, name: "Lenda Verde", pts: 20000 },
];

export function getLevelInfo(points: number): LevelInfo {
  // clamp
  if (points < 0) points = 0;

  let current = LEVELS[0];
  let next = LEVELS[1];

  for (let i = 0; i < LEVELS.length; i++) {
    const item = LEVELS[i];
    const nextItem = LEVELS[i + 1];
    if (!nextItem) {
      current = item;
      next = item;
      break;
    }
    if (points >= item.pts && points < nextItem.pts) {
      current = item;
      next = nextItem;
      break;
    }
  }

  const denom = next.pts - current.pts || 1;
  const progress = Math.min(1, Math.max(0, (points - current.pts) / denom));

  return {
    level: current.level,
    name: current.name,
    current: current.pts,
    next: next.pts,
    progress,
  };
}

export const LEVELS_MAP = LEVELS;
