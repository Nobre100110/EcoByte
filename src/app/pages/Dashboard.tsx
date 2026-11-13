import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useStore } from "../store";
import { getLevelInfo } from "../utils/level";
import {
  Flame,
  CalendarPlus,
  MapPin,
  Gift,
  HelpCircle,
  Bell,
  X,
  Leaf,
  Wind,
  UserRound,
  Target,
  MessageCircle,
} from "lucide-react";

const notificationCategories = {
  account: { label: "Conta", icon: UserRound, color: "text-sky-300" },
  missions: { label: "Missões", icon: Target, color: "text-eco-neon" },
  streak: { label: "Sequência", icon: Flame, color: "text-eco-amber" },
  rewards: { label: "Recompensas", icon: Gift, color: "text-eco-neon" },
  support: { label: "Suporte", icon: MessageCircle, color: "text-sky-300" },
  system: { label: "Geral", icon: Bell, color: "text-gray-300" },
} as const;

export const Dashboard = () => {
  const {
    user,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    notificationPreferences,
    updateNotificationPreferences,
  } = useStore();
  const navigate = useNavigate();
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const quickActions = [
    {
      icon: CalendarPlus,
      label: "Agendar Coleta",
      path: "/schedule",
      color: "bg-eco-neon/20 text-eco-neon",
    },
    {
      icon: MapPin,
      label: "Pontos de Coleta",
      path: "/map",
      color: "bg-blue-500/20 text-blue-400",
    },
    {
      icon: Gift,
      label: "Recompensas",
      path: "/rewards",
      color: "bg-purple-500/20 text-purple-400",
    },
    {
      icon: HelpCircle,
      label: "Como Descartar?",
      path: "/guide",
      color: "bg-amber-500/20 text-amber-400",
    },
  ];

  if (!user) return null;

  const levelInfo = getLevelInfo(user.points || 0);
  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;
  const todayLabel = new Date().toLocaleDateString("pt-BR");
  const yesterdayLabel = new Date(
    Date.now() - 24 * 60 * 60 * 1000,
  ).toLocaleDateString("pt-BR");
  const notificationGroups: { label: string; items: typeof notifications }[] =
    [];

  [...notifications]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .forEach((notification) => {
      const date = new Date(notification.createdAt);
      const dateLabel = Number.isNaN(date.getTime())
        ? "Data indisponível"
        : date.toLocaleDateString("pt-BR");
      const label =
        dateLabel === todayLabel
          ? "Hoje"
          : dateLabel === yesterdayLabel
            ? "Ontem"
            : dateLabel;
      const existingGroup = notificationGroups.find(
        (group) => group.label === label,
      );
      if (existingGroup) existingGroup.items.push(notification);
      else notificationGroups.push({ label, items: [notification] });
    });

  useEffect(() => {
    const storageKey = `ecobyte_last_level_${user?.email || "default"}`;
    const prev = localStorage.getItem(storageKey);
    const prevLevel = prev ? parseInt(prev, 10) : null;
    if (prevLevel !== null && prevLevel < levelInfo.level) {
      setShowCelebrate(true);
      setTimeout(() => setShowCelebrate(false), 2500);
    }
    localStorage.setItem(storageKey, String(levelInfo.level));
  }, [levelInfo.level, user?.email]);

  return (
    <div className="min-h-full w-full bg-eco-black pt-12 px-5 md:px-8 lg:px-0 pb-6 space-y-6 relative overflow-hidden">
      <div className="lg:max-w-3xl lg:mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">
              Olá, {user.name.split(" ")[0]}!
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">
              Vamos fazer a diferença hoje?
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowNotifications(true)}
              className="relative w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <Bell size={18} className="text-gray-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-eco-neon text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-eco-neon/30 shadow-[0_0_15px_rgba(46,204,113,0.3)] bg-eco-green flex items-center justify-center font-bold text-lg"
            >
              {user.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt="Perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{user.name.charAt(0).toUpperCase()}</span>
              )}
            </button>
          </div>
        </div>

        {/* Impacto Ecológico */}
        <motion.div
          className="bg-white/5 rounded-2xl p-4 border border-white/5 relative overflow-hidden"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10">
            <Leaf size={72} className="text-eco-neon" />
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
            Seu Impacto Ecológico
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full border-2 border-white/30 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white/50" />
              </div>
              <span className="text-white font-medium">
                {user.itemsDisposed} itens descartados
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Wind size={16} className="text-eco-neon" />
              <span className="text-eco-neon font-medium">
                ↓ {user.co2Saved} kg de CO₂ evitados
              </span>
            </div>
          </div>
          {user.streak > 0 && (
            <div className="mt-3">
              <span className="inline-flex items-center space-x-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-sm">
                <Flame size={14} className="text-eco-amber" />
                <span className="text-white font-medium">
                  {user.streak} dia{user.streak !== 1 ? "s" : ""} consecutivo
                  {user.streak !== 1 ? "s" : ""}!
                </span>
              </span>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-base font-display font-bold mb-3">
            O que deseja fazer?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3">
            {quickActions.map((action, i) => (
              <motion.button
                key={i}
                onClick={() => navigate(action.path)}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileTap={{ scale: 0.97 }}
                className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-start hover:bg-white/10 transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${action.color}`}
                >
                  <action.icon size={20} />
                </div>
                <span className="text-sm font-medium text-left leading-tight">
                  {action.label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        <motion.div
          className="rounded-2xl border border-white/10 bg-white/5 p-4"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-gray-400">
                Próximo passo
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                Concluir mais coletas hoje
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate("/rewards")}
              className="rounded-full border border-eco-neon/30 bg-eco-neon/10 px-3 py-2 text-xs font-medium text-eco-neon"
            >
              Ver recompensas
            </button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-eco-black/40 p-3">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500">
                Pontos
              </p>
              <p className="mt-2 text-xl font-semibold text-white">
                {user.points || 0}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-eco-black/40 p-3">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500">
                Itens
              </p>
              <p className="mt-2 text-xl font-semibold text-white">
                {user.itemsDisposed || 0}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-eco-black/40 p-3">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500">
                Sequência
              </p>
              <p className="mt-2 text-xl font-semibold text-white">
                {user.streak || 0}d
              </p>
            </div>
          </div>
        </motion.div>

        {/* EcoScore Card */}
        <motion.div
          className="bg-white/5 rounded-2xl p-4 border border-white/5"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative w-14 h-14">
                <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                  <path
                    className="text-white/10"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <motion.path
                    className="text-eco-neon drop-shadow-[0_0_4px_rgba(46,204,113,0.8)]"
                    strokeDasharray={`${Math.round(levelInfo.progress * 100)}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    Lv.{levelInfo.level}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400">EcoScore</p>
                <p className="font-display font-bold text-white">
                  {levelInfo.name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {levelInfo.next - (user.points || 0)} pts para o próximo nível
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono text-2xl font-bold text-eco-neon">
                {user.points}
              </p>
              <p className="text-xs text-gray-500">pts</p>
              <button
                onClick={() => navigate("/rewards")}
                className="text-xs text-eco-neon mt-1 hover:underline"
              >
                Ver recompensas
              </button>
            </div>
          </div>
          <div className="mt-4">
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.round(levelInfo.progress * 100)}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
                className="h-full bg-eco-neon rounded-full"
              />
            </div>
          </div>
          {showCelebrate && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute left-1/2 -translate-x-1/2 top-36 pointer-events-none"
            >
              <div className="flex items-center space-x-3 bg-eco-black/70 px-4 py-2 rounded-xl border border-eco-neon">
                <div className="w-3 h-3 bg-eco-neon rounded-full animate-pulse" />
                <div className="text-white font-bold">
                  Parabéns! Novo nível alcançado.
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Notifications Modal */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end md:items-center md:justify-center"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowNotifications(false);
            }}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-eco-black border-t border-white/10 rounded-t-[32px] md:rounded-2xl md:border p-6 pb-12 md:pb-6 max-h-[80vh] flex flex-col md:w-full md:max-w-lg md:mx-4"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold">Notificações</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {unreadCount} não lida{unreadCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllNotificationsRead()}
                      className="px-3 py-1.5 rounded-xl bg-white/5 text-xs text-gray-300 hover:bg-white/10"
                    >
                      Marcar todas
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              <label className="mb-4 flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                <input
                  type="checkbox"
                  checked={notificationPreferences.nonEssentialEnabled}
                  onChange={(event) =>
                    updateNotificationPreferences({
                      nonEssentialEnabled: event.target.checked,
                    })
                  }
                  className="mt-1 h-4 w-4 shrink-0 accent-eco-neon"
                  aria-describedby="nonessential-notifications-description"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-white">
                    Avisos de missões e sequência
                  </span>
                  <span
                    id="nonessential-notifications-description"
                    className="mt-1 block text-xs leading-5 text-gray-400"
                  >
                    Pausa os lembretes não essenciais. Avisos de conta, suporte
                    e recompensas continuam ativos.
                  </span>
                </span>
                <span className="shrink-0 text-xs font-medium text-gray-400">
                  {notificationPreferences.nonEssentialEnabled
                    ? "Ativos"
                    : "Pausados"}
                </span>
              </label>
              <div className="flex-1 space-y-4 overflow-y-auto">
                {!notifications || notifications.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <Bell size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Nenhuma notificação por enquanto.</p>
                  </div>
                ) : (
                  notificationGroups.map((group) => (
                    <section
                      key={group.label}
                      aria-label={`Notificações de ${group.label}`}
                    >
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        {group.label}
                      </h4>
                      <div className="space-y-2">
                        {group.items.map((notification) => {
                          const category =
                            notificationCategories[
                              notification.category ?? "system"
                            ] ?? notificationCategories.system;
                          const CategoryIcon = category.icon;
                          const notificationDate = new Date(
                            notification.createdAt,
                          );

                          return (
                            <button
                              key={notification.id}
                              onClick={() =>
                                markNotificationRead(notification.id)
                              }
                              aria-label={`${notification.title}${notification.read ? ", lida" : ", não lida"}`}
                              className={`w-full rounded-xl border border-white/10 p-3 text-left transition-colors ${notification.read ? "bg-white/5" : "bg-eco-neon/5"}`}
                            >
                              <div className="flex items-start gap-3">
                                <span
                                  className={`mt-0.5 shrink-0 ${category.color}`}
                                >
                                  <CategoryIcon size={18} aria-hidden="true" />
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="text-sm font-semibold text-white">
                                      {notification.title}
                                    </span>
                                    {!notification.read && (
                                      <span className="rounded-full border border-eco-neon/40 px-2 py-0.5 text-[10px] font-semibold text-eco-neon">
                                        Não lida
                                      </span>
                                    )}
                                  </span>
                                  <span className="mt-1 block text-xs text-gray-400">
                                    {category.label}
                                    {Number.isNaN(notificationDate.getTime())
                                      ? ""
                                      : ` · ${notificationDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`}
                                  </span>
                                  <span className="mt-2 block text-sm leading-5 text-gray-300">
                                    {notification.message}
                                  </span>
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  ))
                )}
                {notifications && notifications.length > 0 && (
                  <button
                    onClick={() => clearNotifications()}
                    className="w-full py-3 rounded-2xl bg-white/5 text-sm text-gray-400 hover:bg-white/10 transition-colors"
                  >
                    Limpar notificações
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
