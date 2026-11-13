import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import { isSupabaseConfigured, supabase } from "../config/supabase";
import { getLevelInfo, LevelInfo } from "./utils/level";
import {
  buildAccountStorageKey,
  clearSession,
  ensureDeveloperStreak,
  getAccounts,
  getCurrentSession,
  readStorageJson,
  removeStorageItem,
  saveAccounts,
  saveSession,
  writeStorageJson,
} from "./utils/storage";
import {
  getCurrentSequenceState,
  updateSequenceAfterActivity,
} from "./utils/challenges";
import { MS_IN_DAY } from "./utils/time";

export type Address = {
  state: string;
  municipality?: string;
  city: string;
  neighborhood?: string;
  street?: string;
  number?: string;
  cep?: string;
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  category?: NotificationCategory;
  eventKey?: string;
};

export type NotificationCategory =
  | "account"
  | "missions"
  | "streak"
  | "rewards"
  | "support"
  | "system";

export type HelpTicket = {
  id: string;
  name?: string;
  email?: string;
  subject?: string;
  description?: string;
  text?: string;
  status?: "draft_not_sent";
  createdAt: string;
};

export type HelpTicketInput = {
  name: string;
  email: string;
  subject: string;
  description: string;
};

export type NotificationPreferences = {
  nonEssentialEnabled: boolean;
};

const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  nonEssentialEnabled: true,
};

type AddNotificationOptions = {
  category?: NotificationCategory;
  eventKey?: string;
  email?: string;
};

const createWelcomeNotification = (email: string): Notification => ({
  id: `welcome_${email}`,
  title: "Bem-vindo ao EcoByte!",
  message: "Acompanhe suas ações e receba atualizações importantes por aqui.",
  createdAt: new Date().toISOString(),
  read: false,
  category: "account",
  eventKey: `welcome:${email}`,
});

export type AccessibilityPreferences = {
  appearance: "dark" | "light" | "colorblind";
  contrast: "standard" | "high" | "maximum";
  textSize: "small" | "normal" | "large";
};

export const DEFAULT_ACCESSIBILITY_PREFERENCES: AccessibilityPreferences = {
  appearance: "dark",
  contrast: "standard",
  textSize: "normal",
};

const getAccessibilityPreferences = (email?: string) =>
  readStorageJson<AccessibilityPreferences>(
    buildAccountStorageKey("ecobyte_accessibility_preferences", email),
    DEFAULT_ACCESSIBILITY_PREFERENCES,
  );

export type UserData = {
  id?: string;
  name: string;
  email: string;
  age?: number;
  profilePhoto?: string;
  points: number;
  level: LevelInfo | null;
  itemsDisposed: number;
  co2Saved: number;
  streak: number;
  lastValidActivityAt?: number | null;
  phone?: string;
};

type StoreContextType = {
  user: UserData | null;
  setUser: React.Dispatch<React.SetStateAction<UserData | null>>;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  authUser: any | null;
  address: Address | null;
  saveAddress: (a: Address) => void;
  helpTickets: HelpTicket[];
  saveHelpTicket: (ticket: HelpTicketInput) => HelpTicket | null;
  notifications: Notification[];
  notificationPreferences: NotificationPreferences;
  updateNotificationPreferences: (
    updates: Partial<NotificationPreferences>,
  ) => void;
  accessibilityPreferences: AccessibilityPreferences;
  updateAccessibilityPreferences: (
    updates: Partial<AccessibilityPreferences>,
  ) => void;
  addNotification: (
    title: string,
    message: string,
    options?: AddNotificationOptions,
  ) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const sessionEmail = getCurrentSession()?.email;
  const [accessibilityPreferences, setAccessibilityPreferences] =
    useState<AccessibilityPreferences>(() =>
      getAccessibilityPreferences(getCurrentSession()?.email),
    );
  const [notificationPreferences, setNotificationPreferences] =
    useState<NotificationPreferences>(() =>
      readStorageJson<NotificationPreferences>(
        buildAccountStorageKey(
          "ecobyte_notification_preferences",
          sessionEmail,
        ),
        DEFAULT_NOTIFICATION_PREFERENCES,
      ),
    );
  const [user, setUser] = useState<UserData | null>(() => {
    const session = getCurrentSession();
    if (session?.email) {
      const accounts = getAccounts<any[]>();
      const current = ensureDeveloperStreak(
        accounts.find((acc: any) => acc.email === session.email),
      );
      if (current) {
        const seq = getCurrentSequenceState({
          lastValidActivityAt: current.lastValidActivityAt ?? null,
          currentDailyStreak: Number(current.streak) || 0,
          currentWeeklyStreak: 0,
        });

        return {
          name: current.name,
          email: current.email,
          age: current.age,
          profilePhoto: current.profilePhoto,
          points: Number(current.points) || 0,
          level: getLevelInfo(Number(current.points) || 0),
          itemsDisposed: Number(current.itemsDisposed) || 0,
          co2Saved: Number(current.co2Saved) || 0,
          streak: seq.dailyStreak,
          lastValidActivityAt: seq.lastValidActivityAt,
          phone: current.phone,
        };
      }
    }

    return null;
  });

  const [authUser, setAuthUser] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState("inicio");

  useEffect(() => {
    const email = user?.email;
    setAccessibilityPreferences(getAccessibilityPreferences(email));
    setNotificationPreferences(
      readStorageJson<NotificationPreferences>(
        buildAccountStorageKey("ecobyte_notification_preferences", email),
        DEFAULT_NOTIFICATION_PREFERENCES,
      ),
    );
  }, [user?.email]);

  const appOpenCheckInKey = useRef<string | null>(null);

  useEffect(() => {
    if (!user?.email) {
      appOpenCheckInKey.current = null;
      return;
    }

    const now = Date.now();
    const openKey = `${user.email}:${new Date(now).toISOString().slice(0, 10)}`;
    if (appOpenCheckInKey.current === openKey) {
      return;
    }

    appOpenCheckInKey.current = openKey;

    const nextSequence = updateSequenceAfterActivity({
      lastValidActivityAt: user.lastValidActivityAt ?? null,
      currentDailyStreak: Number(user.streak) || 0,
      currentWeeklyStreak: 0,
      now,
    });

    setUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        streak: nextSequence.dailyStreak,
        lastValidActivityAt: nextSequence.lastValidActivityAt,
      };
    });
  }, [user?.email, user?.lastValidActivityAt]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.appearance = accessibilityPreferences.appearance;
    root.dataset.contrast = accessibilityPreferences.contrast;
    root.dataset.textSize = accessibilityPreferences.textSize;
  }, [accessibilityPreferences]);

  const updateAccessibilityPreferences = (
    updates: Partial<AccessibilityPreferences>,
  ) => {
    setAccessibilityPreferences((current) => {
      const next = { ...current, ...updates };
      const email = user?.email;
      writeStorageJson(
        buildAccountStorageKey("ecobyte_accessibility_preferences", email),
        next,
      );
      return next;
    });
  };

  const updateNotificationPreferences = (
    updates: Partial<NotificationPreferences>,
  ) => {
    setNotificationPreferences((current) => {
      const next = { ...current, ...updates };
      writeStorageJson(
        buildAccountStorageKey("ecobyte_notification_preferences", user?.email),
        next,
      );
      return next;
    });
  };

  const [address, setAddress] = useState<Address | null>(() => {
    const session = getCurrentSession();
    if (!session?.email) return null;
    return readStorageJson<Address | null>(
      buildAccountStorageKey("ecobyte_address", session.email),
      null,
    );
  });

  const [helpTickets, setHelpTickets] = useState<HelpTicket[]>(() =>
    sessionEmail
      ? readStorageJson<HelpTicket[]>(
          buildAccountStorageKey("ecobyte_helpTickets", sessionEmail),
          [],
        )
      : [],
  );
  const helpTicketsOwner = useRef(sessionEmail ?? null);

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    if (!sessionEmail) return [];
    return (
      readStorageJson<Notification[] | null>(
        buildAccountStorageKey("ecobyte_notifications", sessionEmail),
        null,
      ) ?? [createWelcomeNotification(sessionEmail)]
    );
  });
  const notificationsOwner = useRef(sessionEmail ?? null);

  // Sincronizar com Supabase Auth
  useEffect(() => {
    const session = getCurrentSession();
    if (session?.email) {
      const accounts = getAccounts<any[]>();
      const current = ensureDeveloperStreak(
        accounts.find((acc: any) => acc.email === session.email),
      );
      if (current) {
        const seq = getCurrentSequenceState({
          lastValidActivityAt: current.lastValidActivityAt ?? null,
          currentDailyStreak: Number(current.streak) || 0,
          currentWeeklyStreak: 0,
        });

        setUser({
          name: current.name,
          email: current.email,
          age: current.age,
          profilePhoto: current.profilePhoto,
          points: Number(current.points) || 0,
          level: getLevelInfo(Number(current.points) || 0),
          itemsDisposed: Number(current.itemsDisposed) || 0,
          co2Saved: Number(current.co2Saved) || 0,
          streak: seq.dailyStreak,
          lastValidActivityAt: seq.lastValidActivityAt,
          phone: current.phone,
        });
      }
    }

    if (!isSupabaseConfigured()) {
      setAuthUser(null);
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const authUser = session?.user ?? null;
      setAuthUser(authUser);
      if (!authUser?.email) return;

      const email = authUser.email.trim().toLowerCase();
      const accounts = getAccounts<any[]>();
      const account = ensureDeveloperStreak(
        accounts.find(
          (item: any) =>
            (item?.email ?? "").trim().toLowerCase() === email,
        ),
      );
      const points = Number(account?.points) || 0;
      const lastValidActivityAt =
        Number(account?.lastValidActivityAt) || Date.now();
      const sequence = getCurrentSequenceState({
        lastValidActivityAt,
        currentDailyStreak: Number(account?.streak) || 0,
        currentWeeklyStreak: 0,
      });

      setUser({
        id: authUser.id,
        name:
          account?.name ||
          authUser.user_metadata?.full_name ||
          authUser.user_metadata?.name ||
          email.split("@")[0],
        email,
        age: account?.age,
        profilePhoto: account?.profilePhoto,
        points,
        level: getLevelInfo(points),
        itemsDisposed: Number(account?.itemsDisposed) || 0,
        co2Saved: Number(account?.co2Saved) || 0,
        streak: sequence.dailyStreak,
        lastValidActivityAt: sequence.lastValidActivityAt,
        phone: account?.phone,
      });
      saveSession(email);
    });

    return () => subscription?.unsubscribe();
  }, []);

  // Salvar usuário no localStorage e manter level atualizado
  useEffect(() => {
    if (user) {
      const withLevel = {
        ...user,
        points: Number(user.points) || 0,
        itemsDisposed: Number(user.itemsDisposed) || 0,
        co2Saved: Number(user.co2Saved) || 0,
        streak: Number(user.streak) || 0,
        lastValidActivityAt: user.lastValidActivityAt ?? null,
        level: getLevelInfo(Number(user.points) || 0),
      };
      const accounts = getAccounts<any[]>();
      const index = accounts.findIndex(
        (acc: any) =>
          (acc.email ?? "").toLowerCase() === user.email.toLowerCase(),
      );
      if (index !== -1) {
        const current = accounts[index] ?? {};
        accounts[index] = {
          ...current,
          ...withLevel,
          email: user.email,
          password: current.password,
        };
        saveAccounts(accounts);
      }
      writeStorageJson(
        buildAccountStorageKey("ecobyte_user", user.email),
        withLevel,
      );
    } else {
      clearSession();
      removeStorageItem("ecobyte_user");
    }
  }, [user]);

  // persist address
  useEffect(() => {
    if (user?.email && address) {
      writeStorageJson(
        buildAccountStorageKey("ecobyte_address", user.email),
        address,
      );
    } else if (user?.email) {
      removeStorageItem(buildAccountStorageKey("ecobyte_address", user.email));
    }
  }, [address, user?.email]);

  // Load and persist tickets per account, including tickets from older versions.
  useEffect(() => {
    const email = user?.email ?? null;
    if (helpTicketsOwner.current !== email) {
      helpTicketsOwner.current = email;
      setHelpTickets(
        email
          ? readStorageJson<HelpTicket[]>(
              buildAccountStorageKey("ecobyte_helpTickets", email),
              [],
            )
          : [],
      );
      return;
    }

    if (email) {
      writeStorageJson(
        buildAccountStorageKey("ecobyte_helpTickets", email),
        helpTickets,
      );
    }
  }, [helpTickets, user?.email]);

  // Load and persist notifications per account without carrying them across users.
  useEffect(() => {
    const email = user?.email ?? null;
    if (notificationsOwner.current !== email) {
      notificationsOwner.current = email;
      const stored = email
        ? readStorageJson<Notification[] | null>(
            buildAccountStorageKey("ecobyte_notifications", email),
            null,
          )
        : null;
      setNotifications(
        email ? (stored ?? [createWelcomeNotification(email)]) : [],
      );
      return;
    }

    if (email) {
      writeStorageJson(
        buildAccountStorageKey("ecobyte_notifications", email),
        notifications,
      );
    }
  }, [notifications, user?.email]);

  const addNotification = (
    title: string,
    message: string,
    options: AddNotificationOptions = {},
  ) => {
    const normalizedTitle = title.trim();
    const normalizedMessage = message.trim();
    if (!normalizedTitle || !normalizedMessage) {
      return;
    }

    if (
      !notificationPreferences.nonEssentialEnabled &&
      (options.category === "missions" || options.category === "streak")
    ) {
      return;
    }

    const email = options.email ?? user?.email;
    const eventKey = options.eventKey;
    const eventLedgerKey = email
      ? buildAccountStorageKey("ecobyte_notification_events", email)
      : null;
    const recordedEventKeys = eventLedgerKey
      ? readStorageJson<string[]>(eventLedgerKey, [])
      : [];

    if (eventKey && recordedEventKeys.includes(eventKey)) return;

    setNotifications((current) => {
      let existing = current;
      if (email && email !== user?.email) {
        existing = readStorageJson<Notification[] | null>(
          buildAccountStorageKey("ecobyte_notifications", email),
          null,
        ) ?? [createWelcomeNotification(email)];
      }

      const duplicate = existing.some((notification) => {
        if (eventKey && notification.eventKey === eventKey) return true;
        const sameContent =
          notification.title === normalizedTitle &&
          notification.message === normalizedMessage;
        const createdRecently =
          Date.now() - new Date(notification.createdAt).getTime() < 60000;
        return sameContent && createdRecently;
      });

      if (duplicate) return existing;

      const notification = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        title: normalizedTitle,
        message: normalizedMessage,
        createdAt: new Date().toISOString(),
        read: false,
        category: options.category ?? "system",
        eventKey,
      };

      const next = [notification, ...existing].slice(0, 50);
      if (email && email !== user?.email) {
        writeStorageJson(
          buildAccountStorageKey("ecobyte_notifications", email),
          next,
        );
      }
      return next;
    });

    if (eventKey && eventLedgerKey) {
      writeStorageJson(
        eventLedgerKey,
        [...recordedEventKeys, eventKey].slice(-100),
      );
    }
  };

  useEffect(() => {
    const email = user?.email;
    const lastActivityAt = Number(user?.lastValidActivityAt);
    if (
      !email ||
      !user.streak ||
      !Number.isFinite(lastActivityAt) ||
      !lastActivityAt
    ) {
      return;
    }

    const reminderAt = lastActivityAt + 18 * 60 * 60 * 1000;
    const sendReminderIfStillValid = () => {
      const elapsed = Date.now() - lastActivityAt;
      if (elapsed < 18 * 60 * 60 * 1000 || elapsed >= MS_IN_DAY) return;

      addNotification(
        "Sua sequência está perto de expirar",
        "Volte e registre uma atividade antes de completar 24 horas da última atividade para manter seu progresso.",
        {
          category: "streak",
          eventKey: `streak-reminder:${email}:${lastActivityAt}`,
        },
      );
    };

    const delay = reminderAt - Date.now();
    if (delay <= 0) {
      sendReminderIfStillValid();
      return;
    }

    const timer = window.setTimeout(sendReminderIfStillValid, delay);
    return () => window.clearTimeout(timer);
  }, [user?.email, user?.streak, user?.lastValidActivityAt]);

  const markNotificationRead = (id: string) => {
    setNotifications((s) =>
      s.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((s) =>
      s.map((notification) => ({
        ...notification,
        read: true,
      })),
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const saveAddress = (a: Address) => {
    setAddress(a);
    addNotification(
      "Endereço atualizado",
      "Seu endereço cadastrado foi salvo com sucesso.",
      {
        category: "account",
        eventKey: `address-updated:${user?.email}:${Date.now()}`,
      },
    );
  };

  const saveHelpTicket = (input: HelpTicketInput): HelpTicket | null => {
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    const subject = input.subject.trim();
    const description = input.description.trim();
    if (
      !name ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !subject ||
      description.length < 8
    ) {
      return null;
    }

    const existing = helpTickets.find(
      (ticket) =>
        ticket.email === email &&
        ticket.subject === subject &&
        ticket.description === description &&
        Date.now() - new Date(ticket.createdAt).getTime() < 60000,
    );
    if (existing) return existing;

    const ticket: HelpTicket = {
      id: `EB-${Date.now().toString(36).toUpperCase()}`,
      name,
      email,
      subject,
      description,
      status: "draft_not_sent",
      createdAt: new Date().toISOString(),
    };
    setHelpTickets((current) => [ticket, ...current].slice(0, 20));
    addNotification(
      "Rascunho de suporte salvo",
      `Solicitação ${ticket.id} foi salva neste dispositivo. O e-mail ainda não foi enviado.`,
      {
        category: "support",
        eventKey: `support-draft:${ticket.id}`,
      },
    );
    return ticket;
  };

  return (
    <StoreContext.Provider
      value={{
        user,
        setUser,
        activeTab,
        setActiveTab,
        authUser,
        address,
        saveAddress,
        helpTickets,
        saveHelpTicket,
        notifications,
        accessibilityPreferences,
        updateAccessibilityPreferences,
        notificationPreferences,
        updateNotificationPreferences,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};
