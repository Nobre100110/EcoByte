import React, { useEffect, useMemo, useState } from "react";
import { useStore } from "../store";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Coins, Search, Trophy, X } from "lucide-react";
import { getLevelInfo } from "../utils/level";
import {
  canRedeemReward,
  claimMissionReward,
  getDailyMissionState,
  getMissionCycleForAccount,
} from "../utils/challenges";
import {
  buildAccountStorageKey,
  readStorageJson,
  writeStorageJson,
} from "../utils/storage";

type RewardCategory =
  | "Todos"
  | "Tecnologia"
  | "Compras"
  | "Doações"
  | "Experiências";

type Reward = {
  id: number;
  name: string;
  description: string;
  pts: number;
  category: Exclude<RewardCategory, "Todos">;
  tag: string;
  tagTone: string;
  stockLabel: string;
  estimatedDays: number;
  icon: string;
  featured?: boolean;
};

type ActivityItem = {
  id: string;
  title: string;
  subtitle: string;
  points: number;
  type: "earn" | "redeem";
  createdAt: string;
};

type Mission = {
  id: number;
  title: string;
  description: string;
  target: number;
  reward: number;
  progress: number;
};

const categories: RewardCategory[] = [
  "Todos",
  "Tecnologia",
  "Compras",
  "Doações",
  "Experiências",
];

const baseRewards: Reward[] = [
  {
    id: 1,
    name: "R$ 20 no Mercado Livre",
    description:
      "Vale para compras rápidas com cashback em ecossistemas digitais.",
    pts: 800,
    category: "Compras",
    tag: "Popular",
    tagTone: "bg-eco-amber/20 text-eco-amber border-eco-amber/30",
    stockLabel: "Últimas 8 unidades",
    estimatedDays: 6,
    icon: "🛍️",
    featured: true,
  },
  {
    id: 2,
    name: "Spotify Premium por 1 mês",
    description: "Acesse playlists e podcasts sem interrupções.",
    pts: 650,
    category: "Tecnologia",
    tag: "Exclusivo",
    tagTone: "bg-blue-500/20 text-blue-400 border-blue-400/30",
    stockLabel: "Em estoque",
    estimatedDays: 5,
    icon: "🎵",
  },
  {
    id: 3,
    name: "Voucher iFood R$ 15",
    description: "Ideal para refeições e delivery com economia real.",
    pts: 500,
    category: "Compras",
    tag: "Rápido",
    tagTone: "bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-400/30",
    stockLabel: "Últimas 3 unidades",
    estimatedDays: 4,
    icon: "🍜",
  },
  {
    id: 4,
    name: "Plante uma árvore",
    description: "Contribua para reflorestamento com impacto mensurável.",
    pts: 220,
    category: "Doações",
    tag: "Impacto",
    tagTone: "bg-eco-green/20 text-eco-green border-eco-green/30",
    stockLabel: "Disponível agora",
    estimatedDays: 2,
    icon: "🌳",
  },
  {
    id: 5,
    name: "Gift Card Amazon R$ 50",
    description: "Ideal para explorar produtos com maior conveniência.",
    pts: 1200,
    category: "Compras",
    tag: "Premium",
    tagTone: "bg-violet-500/20 text-violet-400 border-violet-400/30",
    stockLabel: "Reserva limitada",
    estimatedDays: 8,
    icon: "📦",
  },
  {
    id: 6,
    name: "Passeio de observação de aves",
    description: "Uma experiência sensorial para quem ama natureza.",
    pts: 900,
    category: "Experiências",
    tag: "Novo",
    tagTone: "bg-eco-neon/20 text-eco-neon border-eco-neon/30",
    stockLabel: "Próximo fim de semana",
    estimatedDays: 7,
    icon: "🦜",
  },
];

const defaultActivity: ActivityItem[] = [
  {
    id: "earn-1",
    title: "Descarte registrado",
    subtitle: "Você ganhou +120 EcoPontos hoje.",
    points: 120,
    type: "earn",
    createdAt: "Há 2h",
  },
  {
    id: "redeem-1",
    title: "Resgate confirmado",
    subtitle: "Voucher iFood R$ 15 removido do saldo.",
    points: -500,
    type: "redeem",
    createdAt: "Ontem",
  },
];

export const Rewards = () => {
  const { user, setUser, addNotification } = useStore();
  const [activeCategory, setActiveCategory] = useState<RewardCategory>("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [activityLog, setActivityLog] = useState<ActivityItem[]>(() =>
    readStorageJson<ActivityItem[]>(
      buildAccountStorageKey("ecobyte_reward_activity", user?.email),
      defaultActivity,
    ),
  );
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [claimedMissionIds, setClaimedMissionIds] = useState<string[]>(() =>
    readStorageJson<string[]>(
      buildAccountStorageKey("ecobyte_claimed_missions", user?.email),
      [],
    ),
  );
  const [isRewardProcessing, setIsRewardProcessing] = useState(false);

  useEffect(() => {
    if (!user?.email) return;

    const cycle = getMissionCycleForAccount({
      email: user.email,
      now: Date.now(),
    });
    if (cycle.expiresAt <= Date.now()) {
      setClaimedMissionIds([]);
      writeStorageJson(
        buildAccountStorageKey("ecobyte_claimed_missions", user.email),
        [],
      );
    }
  }, [user?.email]);

  useEffect(() => {
    if (user?.email) {
      writeStorageJson(
        buildAccountStorageKey("ecobyte_reward_activity", user.email),
        activityLog,
      );
    }
  }, [activityLog, user?.email]);

  useEffect(() => {
    if (user?.email) {
      writeStorageJson(
        buildAccountStorageKey("ecobyte_claimed_missions", user.email),
        claimedMissionIds,
      );
    }
  }, [claimedMissionIds, user?.email]);

  if (!user) {
    return (
      <div className="min-h-full w-full bg-eco-black px-6 py-12 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-eco-neon">
            Recompensas
          </p>
          <h1 className="mt-3 text-2xl font-semibold">
            Faça login para explorar seu painel.
          </h1>
        </div>
      </div>
    );
  }

  const levelInfo = getLevelInfo(user.points || 0);

  const missions = useMemo(
    () =>
      getDailyMissionState({
        itemsDisposed: user.itemsDisposed || 0,
        points: user.points || 0,
        streak: user.streak || 0,
        claimedMissionIds,
      }),
    [claimedMissionIds, user.itemsDisposed, user.points, user.streak],
  );

  useEffect(() => {
    if (!user?.email) return;

    const cycle = getMissionCycleForAccount({ email: user.email });
    const unclaimedMissions = missions.filter((mission) => !mission.claimed);
    if (unclaimedMissions.length === 0) return;

    addNotification(
      "Missões do ciclo disponíveis",
      `${unclaimedMissions.length} missão(ões) aguardam seu progresso.`,
      {
        category: "missions",
        eventKey: `missions-available:${user.email}:${cycle.cycleId}`,
      },
    );

    const remainingMs = cycle.expiresAt - Date.now();
    if (remainingMs > 0 && remainingMs <= 2 * 60 * 60 * 1000) {
      addNotification(
        "Missões perto de expirar",
        "O ciclo atual termina em até duas horas. Confira o progresso das missões não resgatadas.",
        {
          category: "missions",
          eventKey: `missions-expiring:${user.email}:${cycle.cycleId}`,
        },
      );
    }
  }, [user?.email, missions]);

  const filteredRewards = useMemo(() => {
    return baseRewards.filter((reward) => {
      const categoryMatch =
        activeCategory === "Todos" || reward.category === activeCategory;
      const searchMatch = `${reward.name} ${reward.description}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [activeCategory, searchTerm]);

  const handleRedeem = (reward: Reward) => {
    if (isRewardProcessing) {
      return;
    }

    if (!canRedeemReward(user.points || 0, reward.pts)) {
      setFeedbackMessage(
        `Faltam ${Math.max(0, reward.pts - (user.points || 0))} EcoPontos para este resgate.`,
      );
      return;
    }

    setSelectedReward(reward);
  };

  const confirmRedeem = () => {
    if (!selectedReward || isRewardProcessing) return;

    const remainingCost = selectedReward.pts;
    if (!canRedeemReward(user.points || 0, remainingCost)) {
      setFeedbackMessage(
        `Você não tem saldo suficiente para resgatar ${selectedReward.name}.`,
      );
      setSelectedReward(null);
      return;
    }

    setIsRewardProcessing(true);
    const nextBalance = Math.max(0, (user.points || 0) - remainingCost);
    const redemptionId = Date.now();

    setUser((prev) => {
      if (!prev) return prev;
      return { ...prev, points: Math.max(0, prev.points - remainingCost) };
    });

    setActivityLog((prev) =>
      [
        {
          id: `redeem-${redemptionId}`,
          title: "Resgate realizado",
          subtitle: `${selectedReward.name} foi removido do seu saldo.`,
          points: -remainingCost,
          type: "redeem" as const,
          createdAt: "Agora",
        },
        ...prev,
      ].slice(0, 6),
    );

    addNotification(
      "Resgate realizado",
      `${selectedReward.name} foi resgatado por ${remainingCost} EcoPontos. Saldo restante: ${nextBalance} EcoPontos.`,
      {
        category: "rewards",
        eventKey: `reward-redemption:${user.email}:${redemptionId}`,
      },
    );

    setFeedbackMessage(
      `Resgate confirmado. Você agora tem ${nextBalance} EcoPontos.`,
    );
    setSelectedReward(null);
    setIsRewardProcessing(false);
  };

  const completeMission = (mission: (typeof missions)[number]) => {
    if (mission.claimed) {
      setFeedbackMessage(`A missão “${mission.title}” já foi resgatada.`);
      return;
    }

    const claimResult = claimMissionReward({
      userPoints: user.points || 0,
      userItemsDisposed: user.itemsDisposed || 0,
      userStreak: user.streak || 0,
      alreadyClaimed: mission.claimed,
      progressRatio: mission.progress,
      requiredSteps: mission.target,
      reward: mission.reward,
    });

    if (!claimResult.canClaim) {
      setFeedbackMessage(
        claimResult.reason || "Missão ainda não está disponível.",
      );
      return;
    }

    setUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        points: Math.max(0, prev.points + mission.reward),
      };
    });

    setClaimedMissionIds((prev) =>
      prev.includes(mission.id) ? prev : [...prev, mission.id],
    );

    setActivityLog((prev) =>
      [
        {
          id: `earn-${Date.now()}`,
          title: "Missão concluída",
          subtitle: `${mission.title} desbloqueou +${mission.reward} EcoPontos.`,
          points: mission.reward,
          type: "earn" as const,
          createdAt: "Agora",
        },
        ...prev,
      ].slice(0, 6),
    );

    const missionCycle = getMissionCycleForAccount({ email: user.email });
    addNotification(
      "Missão concluída",
      `${mission.title}: +${mission.reward} EcoPontos adicionados ao saldo.`,
      {
        category: "missions",
        eventKey: `mission-claimed:${user.email}:${missionCycle.cycleId}:${mission.id}`,
      },
    );

    setFeedbackMessage(
      `Missão concluída! +${mission.reward} EcoPontos adicionados.`,
    );
  };

  return (
    <div className="min-h-full w-full bg-eco-black pb-8 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <AnimatePresence>
          {feedbackMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-2xl border border-eco-green/40 bg-eco-green/15 p-4 text-sm text-eco-mint"
              role="status"
              aria-live="polite"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} />
                <span>{feedbackMessage}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-eco-neon">
              EcoByte Rewards
            </p>
            <h1 className="text-2xl font-semibold sm:text-3xl">
              Seu sistema de fidelidade verde
            </h1>
          </div>
        </header>

        <section>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4 rounded-[20px] border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-xl border border-eco-neon/25 bg-eco-neon/10 p-3 text-eco-neon">
                <Coins size={21} />
              </div>
              <div>
                <p className="text-sm text-gray-300">Saldo disponível</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-white">
                    {user.points || 0}
                  </span>
                  <span className="text-sm text-eco-neon">EcoPontos</span>
                </div>
              </div>
            </div>

            <div className="sm:min-w-56 sm:max-w-xs sm:flex-1">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-white">
                  {levelInfo?.name || "Iniciante"}
                </span>
                <span className="text-right text-gray-400">
                  {Math.max(0, levelInfo.next - (user.points || 0))} pts para o
                  próximo nível
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-eco-neon transition-all duration-500"
                  style={{ width: `${Math.round(levelInfo.progress * 100)}%` }}
                />
              </div>
            </div>
          </motion.div>
        </section>

        <section className="rounded-[20px] border border-white/10 bg-white/5 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-400">
                Missões diárias
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white">
                Avance e ganhe mais pontos
              </h2>
            </div>
            <div className="rounded-full border border-eco-neon/20 bg-eco-neon/10 px-3 py-1 text-sm text-eco-neon">
              +{missions.reduce((acc, m) => acc + m.reward, 0)} pts
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {missions.map((mission) => (
              <div
                key={mission.id}
                className="rounded-2xl border border-white/10 bg-eco-black/50 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{mission.title}</p>
                    <p className="mt-1 text-sm text-gray-400">
                      {mission.description}
                    </p>
                  </div>
                  <div className="rounded-full border border-eco-green/30 bg-eco-green/10 px-3 py-1 text-sm text-eco-green">
                    +{mission.reward} pts
                  </div>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-eco-green to-eco-neon transition-all"
                    style={{
                      width: `${Math.min(100, mission.progress * 100)}%`,
                    }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-gray-400">
                  <span>{Math.round(mission.progress * 100)}% concluído</span>
                  <button
                    type="button"
                    onClick={() => completeMission(mission)}
                    disabled={!mission.canClaim}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${mission.claimed ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : mission.canClaim ? "border-eco-neon/30 bg-eco-neon/10 text-eco-neon hover:border-eco-neon/50 hover:bg-eco-neon/20" : "border-white/10 bg-white/5 text-gray-500"}`}
                  >
                    {mission.claimed
                      ? "Resgatado"
                      : mission.canClaim
                        ? "Resgatar"
                        : "Em progresso"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[24px] border border-white/10 bg-white/5 p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-400">
                Recompensas
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white">
                Encontre a melhor opção para você
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="flex items-center gap-2 rounded-full border border-white/10 bg-eco-black/50 px-3 py-2 text-sm text-gray-400">
                <Search size={16} />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Buscar recompensa"
                  aria-label="Buscar recompensa"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500 sm:w-44"
                />
              </label>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full px-4 py-2 text-sm transition ${activeCategory === category ? "bg-eco-neon text-black" : "border border-white/10 bg-white/5 text-gray-300 hover:text-white"}`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredRewards.length > 0 ? (
              filteredRewards.map((reward, index) => {
                const affordable = (user.points || 0) >= reward.pts;
                return (
                  <motion.article
                    key={reward.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex flex-col rounded-[20px] border border-white/10 bg-eco-black/50 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        {reward.featured ? (
                          <div className="inline-flex items-center rounded-full border border-eco-neon/30 bg-eco-neon/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-eco-neon">
                            Destaque
                          </div>
                        ) : (
                          <div
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${reward.tagTone}`}
                          >
                            {reward.tag}
                          </div>
                        )}
                        <h3 className="mt-3 text-lg font-semibold text-white">
                          {reward.name}
                        </h3>
                      </div>
                    </div>

                    <div className="mt-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-xl">
                      {reward.icon}
                    </div>

                    <p className="mt-3 text-sm leading-5 text-gray-400">
                      {reward.description}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-gray-400">
                          Custo
                        </p>
                        <p className="text-lg font-semibold text-eco-neon">
                          {reward.pts} pts
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRedeem(reward)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${affordable ? "bg-eco-neon text-black hover:brightness-110" : "bg-white/5 text-gray-500"}`}
                      >
                        {affordable ? "Resgatar" : "Indisponível"}
                      </button>
                    </div>
                  </motion.article>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-eco-black/40 p-8 text-center text-sm text-gray-400 md:col-span-2 xl:col-span-3">
                Nenhuma recompensa corresponde à sua busca. Tente outro termo ou
                categoria.
              </div>
            )}
          </div>
        </section>

        <details className="group rounded-[20px] border border-white/10 bg-white/5 p-4 sm:p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
            <div className="flex items-center gap-3">
              <Trophy size={18} className="text-eco-neon" />
              <div>
                <p className="font-semibold text-white">Histórico</p>
                <p className="text-sm text-gray-400">Movimentações recentes</p>
              </div>
            </div>
            <span className="text-sm text-eco-neon group-open:hidden">Ver</span>
            <span className="hidden text-sm text-eco-neon group-open:inline">
              Ocultar
            </span>
          </summary>
          <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
            {activityLog.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-3 rounded-xl bg-eco-black/40 p-3"
              >
                <div>
                  <p className="font-medium text-white">{item.title}</p>
                  <p className="mt-1 text-sm text-gray-400">{item.subtitle}</p>
                </div>
                <div
                  className={`shrink-0 text-sm font-semibold ${item.points > 0 ? "text-eco-green" : "text-eco-neon"}`}
                >
                  {item.points > 0 ? `+${item.points}` : item.points} pts
                </div>
              </div>
            ))}
          </div>
        </details>
      </div>

      <AnimatePresence>
        {selectedReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              className="w-full max-w-md rounded-[24px] border border-white/10 bg-eco-black p-4 text-white"
              role="dialog"
              aria-modal="true"
              aria-labelledby="reward-modal-title"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-eco-neon">
                    Confirmar resgate
                  </p>
                  <h3
                    id="reward-modal-title"
                    className="mt-2 text-xl font-semibold"
                  >
                    {selectedReward.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReward(null)}
                  className="rounded-full border border-white/10 bg-white/5 p-2 text-gray-300"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="mt-4 text-sm leading-6 text-gray-400">
                {selectedReward.description}
              </p>
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center justify-between text-sm text-gray-300">
                  <span>Saldo atual</span>
                  <span className="font-semibold text-white">
                    {user.points || 0} pts
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-gray-300">
                  <span>Depois do resgate</span>
                  <span className="font-semibold text-eco-neon">
                    {Math.max(0, (user.points || 0) - selectedReward.pts)} pts
                  </span>
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedReward(null)}
                  className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmRedeem}
                  className="flex-1 rounded-full bg-eco-neon px-4 py-3 text-sm font-semibold text-black"
                >
                  Confirmar resgate
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
