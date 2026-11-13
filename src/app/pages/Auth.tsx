import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { ArrowLeft, Eye, EyeOff, Github, Lock, Mail, User } from "lucide-react";
import { motion } from "motion/react";
import { useStore } from "../store";
import { isSupabaseConfigured, supabase } from "../../config/supabase";
import { getLevelInfo } from "../utils/level";
import { buildSupabaseRedirectUrl } from "../utils/auth";
import {
  signInWithEmail,
  signUpWithEmail,
} from "../../services/supabaseService";
import {
  DEVELOPER_ACCOUNT_EMAILS,
  ensureDeveloperStreak,
  getAccounts,
  hashPassword,
  saveAccounts,
  saveSession,
  verifyPassword,
} from "../utils/storage";

const GoogleLogo = () => (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
    <path
      d="M21.6 12.23c0-.72-.06-1.41-.19-2.08H12v3.94h5.39a4.62 4.62 0 0 1-2 3.03v2.52h3.24c1.9-1.75 2.97-4.33 2.97-7.41Z"
      fill="#4285F4"
    />
    <path
      d="M12 22c2.7 0 4.96-.9 6.62-2.43l-3.24-2.52c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.58-4.13H.8v2.67A10 10 0 0 0 12 22Z"
      fill="#34A853"
    />
    <path
      d="M6.42 19.9c-.97-1.9-1.52-3.94-1.52-6.9s.55-5 1.52-6.9V3.43H3.2A10 10 0 0 0 0 12.99c0 1.6.38 3.13 1.06 4.48L6.42 19.9Z"
      fill="#FBBC05"
    />
    <path
      d="M12 4.8c1.48 0 2.8.51 3.85 1.52l2.87-2.87A9.99 9.99 0 0 0 12 2a10 10 0 0 0-8.8 5.5l3.23 2.52C7.2 6.56 9.4 4.8 12 4.8Z"
      fill="#EA4335"
    />
  </svg>
);

export const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, addNotification } = useStore();
  const [isLogin, setIsLogin] = useState(location.pathname !== "/register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsLogin(location.pathname !== "/register");
  }, [location.pathname]);

  const buildUserFromAccount = (account: any) => {
    const normalizedAccount = ensureDeveloperStreak(account) ?? account;

    return {
      name: normalizedAccount.name,
      email: normalizedAccount.email,
      age: normalizedAccount.age,
      profilePhoto: normalizedAccount.profilePhoto,
      points: Number(normalizedAccount.points) || 0,
      level:
        normalizedAccount.level && typeof normalizedAccount.level === "object"
          ? normalizedAccount.level
          : getLevelInfo(Number(normalizedAccount.points) || 0),
      itemsDisposed: Number(normalizedAccount.itemsDisposed) || 0,
      co2Saved: Number(normalizedAccount.co2Saved) || 0,
      streak: Number(normalizedAccount.streak) || 0,
      lastValidActivityAt:
        Number(normalizedAccount.lastValidActivityAt) || null,
      phone: normalizedAccount.phone,
    };
  };

  const syncSupabaseUser = React.useCallback((authUser: {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  }) => {
    const normalizedEmail = authUser.email?.trim().toLowerCase();
    if (!normalizedEmail) return false;

    const account = getAccounts<any[]>().find(
      (item: any) =>
        (item?.email ?? "").trim().toLowerCase() === normalizedEmail,
    );
    const normalizedAccount = ensureDeveloperStreak(account) ?? account;
    const metadata = authUser.user_metadata ?? {};
    const points = Number(normalizedAccount?.points) || 0;
    const metadataName =
      typeof metadata.full_name === "string"
        ? metadata.full_name
        : typeof metadata.name === "string"
          ? metadata.name
          : "";

    setUser({
      id: authUser.id,
      name:
        normalizedAccount?.name ||
        metadataName ||
        normalizedEmail.split("@")[0],
      email: normalizedEmail,
      age: normalizedAccount?.age,
      profilePhoto: normalizedAccount?.profilePhoto,
      points,
      level: getLevelInfo(points),
      itemsDisposed: Number(normalizedAccount?.itemsDisposed) || 0,
      co2Saved: Number(normalizedAccount?.co2Saved) || 0,
      streak: Number(normalizedAccount?.streak) || 0,
      lastValidActivityAt:
        Number(normalizedAccount?.lastValidActivityAt) || Date.now(),
      phone: normalizedAccount?.phone,
    });
    saveSession(normalizedEmail);
    return true;
  }, [setUser]);

  React.useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        if (syncSupabaseUser(session.user)) {
          navigate("/dashboard", { replace: true });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, syncSupabaseUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword || (!isLogin && !trimmedName)) {
      setErrorMsg("Preencha os campos obrigatórios para continuar.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMsg("Informe um e-mail válido.");
      return;
    }

    if (trimmedPassword.length < 6) {
      setErrorMsg("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (!isLogin && trimmedPassword !== confirmPassword.trim()) {
      setErrorMsg("As senhas não conferem.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
        const accounts = getAccounts<any[]>();
        const account = accounts.find(
          (item: any) =>
            (item?.email ?? "").trim().toLowerCase() === trimmedEmail &&
            typeof item?.password === "string",
        );

        if (account) {
          const isValidPassword = await verifyPassword(
            account.password,
            trimmedPassword,
          );

          if (!isValidPassword) {
            setErrorMsg("E-mail ou senha inválidos.");
            return;
          }

          const normalizedAccount = ensureDeveloperStreak(account) ?? account;
          if (normalizedAccount !== account) {
            const index = accounts.findIndex(
              (item: any) => item.email === trimmedEmail,
            );
            if (index >= 0) {
              accounts[index] = normalizedAccount;
              saveAccounts(accounts);
            }
          }

          setUser(buildUserFromAccount(normalizedAccount));
          saveSession(trimmedEmail);
          navigate("/dashboard", { replace: true });
          return;
        }

        if (!isSupabaseConfigured()) {
          setErrorMsg("Conta não encontrada.");
          return;
        }

        const result = await signInWithEmail(trimmedEmail, trimmedPassword);
        if (!result.success) {
          setErrorMsg(
            result.error.includes("Email not confirmed")
              ? "Confirme seu e-mail antes de entrar."
              : result.error.includes("Invalid login credentials")
                ? "E-mail ou senha inválidos."
                : result.error,
          );
          return;
        }

        if (!result.user || !result.session) {
          setErrorMsg("Não foi possível iniciar a sessão. Tente novamente.");
          return;
        }

        syncSupabaseUser(result.user);
        navigate("/dashboard", { replace: true });
        return;
      }

      const accounts = getAccounts<any[]>();
      if (
        accounts.find(
          (acc: any) => (acc.email ?? "").toLowerCase() === trimmedEmail,
        )
      ) {
        setErrorMsg("E-mail já está em uso.");
        return;
      }

      if (isSupabaseConfigured()) {
        const result = await signUpWithEmail(
          trimmedEmail,
          trimmedPassword,
          trimmedName,
        );

        if (!result.success) {
          setErrorMsg(result.error);
          return;
        }

        if (!result.user) {
          setErrorMsg("O Supabase não retornou os dados da conta. Tente novamente.");
          return;
        }

        if (result.user.identities?.length === 0) {
          setErrorMsg(
            "Este e-mail já possui uma conta. Tente entrar ou recuperar sua senha.",
          );
          return;
        }

        if (!result.session) {
          setSuccessMsg(
            "Cadastro iniciado! Confirme seu e-mail pelo link enviado para concluir e depois entre na sua conta.",
          );
          return;
        }

        syncSupabaseUser(result.user);
        addNotification(
          "Cadastro concluído",
          "Sua conta EcoByte foi criada com sucesso.",
          {
            category: "account",
            eventKey: `account-created:${trimmedEmail}`,
            email: trimmedEmail,
          },
        );
        navigate("/dashboard", { replace: true });
        return;
      }

      const hashedPassword = await hashPassword(trimmedPassword);
      const developerStarter = DEVELOPER_ACCOUNT_EMAILS.includes(trimmedEmail)
        ? 15
        : 0;
      const newAccount = ensureDeveloperStreak({
        name: trimmedName,
        email: trimmedEmail,
        password: hashedPassword,
        points: 0,
        level: getLevelInfo(0),
        itemsDisposed: 0,
        co2Saved: 0,
        streak: developerStarter,
        lastValidActivityAt: Date.now(),
        age: undefined,
        phone: undefined,
        profilePhoto: undefined,
        developerOverrideApplied: developerStarter > 0,
      });

      accounts.push(newAccount);
      saveAccounts(accounts);
      setUser(buildUserFromAccount(newAccount));
      saveSession(trimmedEmail);
      addNotification(
        "Cadastro concluído",
        "Sua conta EcoByte foi criada com sucesso.",
        {
          category: "account",
          eventKey: `account-created:${trimmedEmail}`,
          email: trimmedEmail,
        },
      );
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Falha na autenticação:", error);
      setErrorMsg(
        error instanceof Error
          ? error.message
          : "Não foi possível concluir a operação. Tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg("");

    if (!isSupabaseConfigured()) {
      setErrorMsg(
        "Login com Google ainda não está configurado. Use o login tradicional ou configure as variáveis do Supabase.",
      );
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: buildSupabaseRedirectUrl("/dashboard"),
      },
    });

    if (error) {
      console.error(error);
      setErrorMsg(error.message);
    }
  };

  const handleGithubLogin = async () => {
    setErrorMsg("");

    if (!isSupabaseConfigured()) {
      setErrorMsg(
        "Login com GitHub ainda não está configurado. Use o login tradicional ou configure as variáveis do Supabase.",
      );
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: buildSupabaseRedirectUrl("/dashboard"),
      },
    });

    if (error) {
      console.error(error);
      setErrorMsg(error.message);
    }
  };

  return (
    <div className="min-h-screen w-full bg-eco-black px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-center">
        <div className="w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-[#111815] shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
          <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="hidden border-r border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(46,204,113,0.18),transparent_38%),linear-gradient(135deg,#0d1511_0%,#101712_50%,#0d0d0d_100%)] p-7 lg:flex lg:flex-col lg:justify-between lg:p-10">
              <div>
                <div className="inline-flex items-center rounded-full border border-eco-neon/30 bg-eco-neon/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-eco-neon">
                  EcoByte
                </div>
                <h2 className="mt-8 max-w-sm text-4xl font-semibold leading-tight text-white">
                  Transforme hábitos em impacto real.
                </h2>
                <p className="mt-4 max-w-sm text-sm leading-6 text-gray-300">
                  Acompanhe descarte consciente, metas e recompensas em uma
                  experiência criada para manter a comunidade mais eficiente e
                  responsável.
                </p>
              </div>

              <div className="mt-10 grid gap-4 text-sm text-gray-200">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-eco-neon">
                    Missões diárias
                  </div>
                  <div className="mt-2 font-medium text-white">
                    Recompensas progressivas e ciclos de 24h.
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-eco-neon">
                    Sustentabilidade
                  </div>
                  <div className="mt-2 font-medium text-white">
                    Analytics claros para ação e engajamento.
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#111815] p-5 sm:p-7 lg:p-8">
              <div className="mb-6 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-200 transition hover:bg-white/10"
                  aria-label="Voltar"
                >
                  <ArrowLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => navigate(isLogin ? "/register" : "/login")}
                  className="text-sm font-medium text-eco-neon transition hover:text-eco-mint"
                >
                  {isLogin ? "Criar conta" : "Entrar"}
                </button>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className=""
              >
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-eco-neon">
                  EcoByte
                </p>
                <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
                  {isLogin ? "Acesse sua conta" : "Crie sua conta"}
                </h1>
                <p className="mt-2 text-sm leading-6 text-gray-300">
                  {isLogin
                    ? "Continue acompanhando seu impacto sustentável."
                    : "Junte-se a uma comunidade focada em ações reais."}
                </p>

                {errorMsg && (
                  <div className="mt-5 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                    {errorMsg}
                  </div>
                )}
                {successMsg && (
                  <div
                    className="mt-5 rounded-2xl border border-eco-neon/30 bg-eco-neon/10 px-4 py-3 text-sm text-eco-neon"
                    role="status"
                  >
                    {successMsg}
                  </div>
                )}

                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                  {!isLogin && (
                    <div>
                      <label
                        htmlFor="name"
                        className="mb-2 block text-sm text-gray-300"
                      >
                        Nome completo
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                          <User size={18} />
                        </div>
                        <input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-gray-50 placeholder:text-gray-500 focus:border-eco-neon focus:outline-none focus:ring-2 focus:ring-eco-neon/20"
                          placeholder="Seu nome"
                          autoComplete="name"
                          required={!isLogin}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm text-gray-300"
                    >
                      E-mail
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                        <Mail size={18} />
                      </div>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-gray-50 placeholder:text-gray-500 focus:border-eco-neon focus:outline-none focus:ring-2 focus:ring-eco-neon/20"
                        placeholder="seu@email.com"
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm text-gray-300"
                    >
                      Senha
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                        <Lock size={18} />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-12 text-gray-50 placeholder:text-gray-500 focus:border-eco-neon focus:outline-none focus:ring-2 focus:ring-eco-neon/20"
                        placeholder="••••••••"
                        autoComplete={
                          isLogin ? "current-password" : "new-password"
                        }
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 transition hover:text-white"
                        aria-label={
                          showPassword ? "Ocultar senha" : "Mostrar senha"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  {!isLogin && (
                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="mb-2 block text-sm text-gray-300"
                      >
                        Confirmar senha
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                          <Lock size={18} />
                        </div>
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-12 text-gray-50 placeholder:text-gray-500 focus:border-eco-neon focus:outline-none focus:ring-2 focus:ring-eco-neon/20"
                          placeholder="Repita a senha"
                          autoComplete="new-password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword((prev) => !prev)
                          }
                          className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 transition hover:text-white"
                          aria-label={
                            showConfirmPassword
                              ? "Ocultar confirmação de senha"
                              : "Mostrar confirmação de senha"
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {isLogin && (
                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => navigate("/forgot-password")}
                        className="text-sm font-medium text-eco-neon transition hover:text-eco-mint"
                      >
                        Esqueci minha senha
                      </button>
                    </div>
                  )}

                  {!isLogin && (
                    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
                      <input
                        id="legalAccept"
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-eco-neon focus:ring-eco-neon"
                        required
                      />
                      <label
                        htmlFor="legalAccept"
                        className="text-sm leading-6 text-gray-300"
                      >
                        Concordo com os{" "}
                        <Link
                          to="/terms"
                          className="text-eco-neon underline-offset-2 hover:underline"
                        >
                          Termos de Uso
                        </Link>{" "}
                        e a{" "}
                        <Link
                          to="/privacy"
                          className="text-eco-neon underline-offset-2 hover:underline"
                        >
                          Política de Privacidade
                        </Link>
                        .
                      </label>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="mt-2 w-full rounded-full bg-eco-green px-4 py-3.5 text-base font-semibold text-white transition hover:bg-eco-green/90 disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Processando..."
                      : isLogin
                        ? "Entrar"
                        : "Cadastrar"}
                  </button>
                </form>

                <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-gray-500">
                  <div className="h-px flex-1 bg-white/10" />
                  <span>ou</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:border-eco-neon/50 hover:bg-white/10"
                    aria-label="Continuar com Google"
                  >
                    <GoogleLogo />
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGithubLogin}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:border-eco-neon/50 hover:bg-white/10"
                    aria-label="Continuar com GitHub"
                  >
                    <Github size={18} className="text-white" />
                    <span>GitHub</span>
                  </button>
                </div>

                <div className="mt-6 text-center text-sm text-gray-400">
                  {isLogin ? (
                    <>
                      Ainda não tem conta?{" "}
                      <button
                        type="button"
                        onClick={() => navigate("/register")}
                        className="font-semibold text-eco-neon transition hover:text-eco-mint"
                      >
                        Cadastre-se
                      </button>
                    </>
                  ) : (
                    <>
                      Já possui conta?{" "}
                      <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="font-semibold text-eco-neon transition hover:text-eco-mint"
                      >
                        Entrar
                      </button>
                    </>
                  )}
                </div>

                <div className="mt-6 border-t border-white/10 pt-4 text-center text-xs text-gray-400">
                  <p>
                    Ao continuar, você concorda com os{" "}
                    <Link
                      to="/terms"
                      className="text-eco-neon underline-offset-2 hover:underline"
                    >
                      Termos de Uso
                    </Link>{" "}
                    e a{" "}
                    <Link
                      to="/privacy"
                      className="text-eco-neon underline-offset-2 hover:underline"
                    >
                      Política de Privacidade
                    </Link>
                    .
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
