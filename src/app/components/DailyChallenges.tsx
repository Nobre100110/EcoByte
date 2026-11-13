import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Battery,
  CalendarPlus,
  CheckCircle2,
  Share2,
  Sparkles,
  Trophy,
} from "lucide-react";
import { DailyChallenge } from "../store";

type DailyChallengesProps = {
  challenges: DailyChallenge[];
  onAdvance: (challengeId: string) => void;
  title?: string;
  subtitle?: string;
  compact?: boolean;
};

const iconMap: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  battery: Battery,
  share2: Share2,
  calendar: CalendarPlus,
};

export const DailyChallenges = ({
  challenges,
  onAdvance,
  title = "Desafios Diários",
  subtitle = "Complete cada passo e receba recompensas",
  compact = false,
}: DailyChallengesProps) => {
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 2200);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-400">
            {title}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">{subtitle}</h2>
        </div>
        <div className="rounded-full border border-eco-neon/20 bg-eco-neon/10 px-3 py-1 text-sm text-eco-neon">
          {challenges.filter((challenge) => challenge.completed).length}/
          {challenges.length}
        </div>
      </div>

      {feedback && (
        <div className="mt-3 rounded-2xl border border-eco-neon/20 bg-eco-neon/10 px-3 py-2 text-sm text-eco-mint">
          {feedback}
        </div>
      )}

      <div className={`mt-4 ${compact ? "space-y-2" : "space-y-3"}`}>
        {challenges.map((challenge) => {
          const Icon = iconMap[challenge.icon] || Sparkles;
          const percentage = Math.min(
            100,
            Math.round((challenge.progress / challenge.target) * 100),
          );
          const canAdvance = !challenge.completed;

          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border border-white/10 bg-eco-black/50 p-3 ${challenge.completed ? "border-eco-neon/30" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl ${challenge.completed ? "bg-eco-neon/15 text-eco-neon" : "bg-white/10 text-white"}`}
                  >
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-white">
                        {challenge.title}
                      </p>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-gray-400">
                        {challenge.difficulty}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-400">
                      {challenge.description}
                    </p>
                  </div>
                </div>
                <div className="rounded-full border border-eco-green/30 bg-eco-green/10 px-3 py-1 text-sm text-eco-green">
                  +{challenge.points} pts
                </div>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-all ${challenge.completed ? "bg-eco-neon" : "bg-gradient-to-r from-eco-green to-eco-neon"}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-sm text-gray-400">
                <span>
                  {challenge.completed
                    ? "Concluído"
                    : `${challenge.progress}/${challenge.target} passos`}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (!canAdvance) return;
                    const nextProgress = challenge.progress + 1;
                    onAdvance(challenge.id);
                    setFeedback(
                      nextProgress >= challenge.target
                        ? `Desafio concluído! +${challenge.points} EcoPontos.`
                        : `${challenge.title} avançou para ${nextProgress}/${challenge.target}.`,
                    );
                  }}
                  className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${challenge.completed ? "bg-eco-neon/10 text-eco-neon" : "bg-eco-neon text-black hover:brightness-110"}`}
                >
                  {challenge.completed ? "Concluído" : "Avançar"}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
