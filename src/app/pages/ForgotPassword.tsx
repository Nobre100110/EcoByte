import React, { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Mail } from "lucide-react";
import { isSupabaseConfigured, supabase } from "../../config/supabase";
import { buildSupabaseRedirectUrl } from "../utils/auth";
import { createPasswordResetRequest } from "../utils/storage";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [recoveryUrl, setRecoveryUrl] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail) {
      setError("Informe o endereço de e-mail para continuar.");
      return;
    }

    if (!emailRegex.test(trimmedEmail)) {
      setError("Informe um e-mail válido.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isSupabaseConfigured()) {
        const redirectUrl = buildSupabaseRedirectUrl("/reset-password");
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          trimmedEmail,
          {
            redirectTo: redirectUrl,
          },
        );

        if (!resetError) {
          setRecoveryUrl(redirectUrl);
          setIsReady(true);
          setIsSubmitting(false);
          return;
        }
      }

      const request = await createPasswordResetRequest(trimmedEmail);
      if (!request) {
        throw new Error("Não foi possível gerar a recuperação.");
      }

      setRecoveryUrl(request.recoveryUrl);
      setIsReady(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível concluir a recuperação neste momento.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-eco-black px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-2xl items-center justify-center">
        <div className="w-full rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:p-8">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-gray-300 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Voltar para o login
          </Link>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-eco-neon">
              Segurança
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-white">
              Esqueceu sua senha?
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Informe o e-mail cadastrado para receber o link de recuperação.
            </p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="reset-email"
                className="mb-2 block text-sm text-gray-300"
              >
                E-mail cadastrado
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                  <Mail size={18} />
                </div>
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-white placeholder:text-gray-500 focus:border-eco-neon focus:outline-none focus:ring-2 focus:ring-eco-neon/20"
                  placeholder="seu@email.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            )}

            {isReady && !error && (
              <div className="space-y-3 rounded-2xl border border-eco-neon/30 bg-eco-neon/10 px-4 py-3 text-sm text-eco-mint">
                <p>
                  {isSupabaseConfigured()
                    ? "Se esse e-mail estiver cadastrado, um link de recuperação foi enviado com sucesso."
                    : "Se esse e-mail estiver cadastrado, o processo de recuperação foi gerado com sucesso."}
                </p>
                {!isSupabaseConfigured() && (
                  <p>
                    Como o ambiente atual ainda não possui o serviço externo de
                    e-mail configurado, o link de recuperação foi gerado
                    localmente para teste e revisão.
                  </p>
                )}
                {recoveryUrl && (
                  <a
                    href={recoveryUrl}
                    className="block break-all rounded-xl border border-eco-neon/40 bg-black/10 px-3 py-2 text-eco-mint underline"
                  >
                    {recoveryUrl}
                  </a>
                )}
              </div>
            )}

            <button
              type="submit"
              className="mt-2 w-full rounded-full bg-eco-green px-4 py-3.5 text-base font-semibold text-white transition hover:bg-eco-green/90 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Enviar instruções"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            Lembrou da senha?{" "}
            <Link
              to="/login"
              className="font-semibold text-eco-neon transition hover:text-eco-mint"
            >
              Voltar ao login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
