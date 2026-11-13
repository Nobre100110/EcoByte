import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Lock } from "lucide-react";
import { isSupabaseConfigured, supabase } from "../../config/supabase";
import { getSupabaseRecoverySession } from "../utils/auth";
import {
  consumePasswordResetToken,
  getAccounts,
  hashPassword,
  validatePasswordResetToken,
  verifyPassword,
} from "../utils/storage";

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSupabaseRecoveryFlow, setIsSupabaseRecoveryFlow] = useState(false);

  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  useEffect(() => {
    let cancelled = false;

    const verifyToken = async () => {
      if (!isSupabaseConfigured()) {
        if (!cancelled) {
          setIsChecking(false);
          setIsValidToken(Boolean(token && email));
        }
        return;
      }

      const recovery = getSupabaseRecoverySession();
      const isRecoveryFlow =
        recovery.recoveryType === "recovery" &&
        Boolean(recovery.accessToken && recovery.refreshToken);

      if (isRecoveryFlow) {
        const { error } = await supabase.auth.setSession({
          access_token: recovery.accessToken,
          refresh_token: recovery.refreshToken,
        });

        if (!cancelled) {
          setIsSupabaseRecoveryFlow(true);
          setIsValidToken(!error);
          setIsChecking(false);
          if (error) {
            setError("Este link de recuperação não é mais válido.");
          }
        }
        return;
      }

      if (!token || !email) {
        if (!cancelled) {
          setError("Link de recuperação inválido ou ausente.");
          setIsValidToken(false);
          setIsChecking(false);
        }
        return;
      }

      const result = await validatePasswordResetToken(email, token);
      if (!cancelled) {
        setIsValidToken(Boolean(result.valid));
        setIsChecking(false);
        if (!result.valid) {
          setError("Este link é inválido, expirou ou já foi usado.");
        }
      }
    };

    verifyToken();
    return () => {
      cancelled = true;
    };
  }, [email, token]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não conferem.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isSupabaseRecoveryFlow) {
        if (!isSupabaseConfigured()) {
          throw new Error("Recuperação do Supabase não está configurada.");
        }

        const { error: updateError } = await supabase.auth.updateUser({
          password,
        });

        if (updateError) {
          throw new Error(updateError.message);
        }

        setIsSuccess(true);
        setIsSubmitting(false);
        return;
      }

      if (!token || !email) {
        throw new Error("Link de recuperação inválido ou ausente.");
      }

      const validTokenResult = await validatePasswordResetToken(email, token);
      if (!validTokenResult.valid) {
        throw new Error("Este link é inválido ou expirou.");
      }

      const accounts = getAccounts<any[]>();
      const account = accounts.find(
        (item: any) =>
          (item?.email ?? "").trim().toLowerCase() ===
          email.trim().toLowerCase(),
      );

      if (!account) {
        throw new Error("Conta não encontrada para este link de recuperação.");
      }

      const isSamePassword = await verifyPassword(account.password, password);
      if (isSamePassword) {
        throw new Error("Escolha uma senha diferente da atual.");
      }

      const nextPassword = await hashPassword(password);
      const nextAccounts = [...accounts];
      const index = nextAccounts.findIndex(
        (item: any) =>
          (item?.email ?? "").trim().toLowerCase() ===
          email.trim().toLowerCase(),
      );

      if (index === -1) {
        throw new Error("Conta não encontrada.");
      }

      nextAccounts[index] = {
        ...nextAccounts[index],
        password: nextPassword,
      };
      localStorage.setItem("ecobyte_accounts", JSON.stringify(nextAccounts));

      const consumed = await consumePasswordResetToken(email, token);
      if (!consumed) {
        throw new Error("Não foi possível validar a recuperação desta senha.");
      }

      setIsSuccess(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível alterar a senha. Tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-eco-black px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-xl items-center justify-center">
        <div className="w-full rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:p-8">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-gray-300 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Voltar ao login
          </Link>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-eco-neon">
              Segurança
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-white">
              Redefinir senha
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Crie uma nova senha para continuar com segurança.
            </p>
          </div>

          {isChecking ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-gray-300">
              Validando link de recuperação...
            </div>
          ) : !isValidToken ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {error || "Este link de recuperação não está mais válido."}
              </div>
              <Link
                to="/forgot-password"
                className="inline-flex w-full items-center justify-center rounded-full bg-eco-green px-4 py-3 text-base font-semibold text-white transition hover:bg-eco-green/90"
              >
                Solicitar nova recuperação
              </Link>
            </div>
          ) : isSuccess ? (
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3 rounded-2xl border border-eco-neon/40 bg-eco-neon/10 px-4 py-3 text-sm text-eco-mint">
                <CheckCircle2 size={18} />
                <span>Sua senha foi alterada com sucesso.</span>
              </div>
              <button
                type="button"
                onClick={() => navigate("/login", { replace: true })}
                className="inline-flex w-full items-center justify-center rounded-full bg-eco-green px-4 py-3 text-base font-semibold text-white transition hover:bg-eco-green/90"
              >
                Voltar ao login
              </button>
            </div>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="newPassword"
                  className="mb-2 block text-sm text-gray-300"
                >
                  Nova senha
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                    <Lock size={18} />
                  </div>
                  <input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-12 text-white placeholder:text-gray-500 focus:border-eco-neon focus:outline-none focus:ring-2 focus:ring-eco-neon/20"
                    placeholder="Mínimo 6 caracteres"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 transition hover:text-white"
                    aria-label={
                      showPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm text-gray-300"
                >
                  Confirmar nova senha
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                    <Lock size={18} />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-12 text-white placeholder:text-gray-500 focus:border-eco-neon focus:outline-none focus:ring-2 focus:ring-eco-neon/20"
                    placeholder="Repita a nova senha"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 transition hover:text-white"
                    aria-label={
                      showConfirmPassword
                        ? "Ocultar confirmação"
                        : "Mostrar confirmação"
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

              {error && (
                <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-full bg-eco-green px-4 py-3.5 text-base font-semibold text-white transition hover:bg-eco-green/90 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Salvando..." : "Salvar nova senha"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
