import React from "react";
import { Link } from "react-router";

export const TermsPage = () => {
  return (
    <div className="min-h-screen w-full bg-eco-black px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-eco-neon">
              Documentos legais
            </p>
            <h1 className="mt-3 text-3xl font-semibold">Termos de Uso</h1>
          </div>
          <Link
            to="/login"
            className="text-sm text-eco-neon transition hover:text-eco-mint"
          >
            Voltar ao login
          </Link>
        </div>

        <div className="mt-6 space-y-6 text-sm leading-7 text-gray-300">
          <p>
            Este documento é uma versão inicial de Termos de Uso do EcoByte,
            preparada para refletir o comportamento atual da plataforma em
            desenvolvimento. Ele foi escrito de forma clara e profissional para
            orientar o uso da aplicação e pode ser revisado por um responsável
            legal antes da etapa de publicação oficial.
          </p>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              1. Apresentação do EcoByte
            </h2>
            <p>
              O EcoByte é uma plataforma voltada para incentivar práticas mais
              sustentáveis, com registro de ações, acompanhamento de progresso,
              pontos, missões e recompensas. O objetivo principal do projeto é
              apoiar a conscientização ambiental e estimular o descarte correto
              de materiais e a participação ativa dos usuários.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              2. Objetivo e finalidade da plataforma
            </h2>
            <p>
              O EcoByte permite que os usuários cadastrem informações pessoais,
              acompanhem atividades, visualizem progresso e participem de
              missões e recompensas. A plataforma pode ser usada para fins de
              educação ambiental, organização de pontos e acompanhamento de
              ações sustentáveis realizadas pelo usuário.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              3. Condições para utilização
            </h2>
            <p>
              Para utilizar a plataforma, o usuário deve fornecer dados válidos,
              manter sua conta protegida e acessar o sistema por meios seguros.
              O uso da plataforma deve respeitar as regras do projeto, a
              legislação aplicável e a boa convivência entre usuários.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              4. Responsabilidades do usuário
            </h2>
            <p>
              O usuário é responsável por manter suas credenciais em segurança,
              informar dados corretos, utilizar sua conta de forma adequada e
              evitar qualquer tentativa de fraude, manipulação de pontuação,
              abuso de sistema ou violação de regras de uso da plataforma.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              5. Responsabilidades da plataforma
            </h2>
            <p>
              O EcoByte se compromete a manter a funcionalidade básica da
              plataforma, preservar o acesso e manter registros essenciais para
              o uso da conta e do histórico do usuário, conforme as regras
              implementadas atualmente. O projeto também se compromete a manter
              medidas básicas de segurança e organização dos dados dentro da
              arquitetura disponível.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              6. Cadastro e segurança da conta
            </h2>
            <p>
              O cadastro deve ser feito com informações verdadeiras e válidas.
              Cada conta deve ser protegida por senha segura e acessos
              autorizados. A plataforma pode aplicar validações e controles para
              evitar uso indevido, acessos não autorizados e alterações em dados
              pessoais sem controle adequado.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              7. Pontos, recompensas e missões
            </h2>
            <p>
              Pontos, recompensas, missões e sequência de atividades podem ser
              registrados conforme as regras do EcoByte. A disponibilidade e a
              elegibilidade para resgates dependem das regras vigentes no
              sistema, do saldo de pontos e do histórico de uso do usuário.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              8. Condutas proibidas
            </h2>
            <p>
              São proibidas ações como fraude de pontuação, criação de contas
              duplicadas para burlar regras, tentativa de acesso indevido,
              manipulação de registros, uso ofensivo, envio de conteúdo
              impróprio, interferência em outros usuários e abuso de suporte ou
              funcionalidade da plataforma.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              9. Suspensão e encerramento de contas
            </h2>
            <p>
              A plataforma pode suspender ou encerrar a conta do usuário em
              casos de violação de regras, uso indevido da conta, fraude,
              tentativa de manipulação de dados ou infrações às condições do
              serviço. O encerramento pode ocorrer de forma temporária ou
              definitiva, conforme a gravidade e a regra de negócio aplicável.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              10. Alterações nos Termos de Uso
            </h2>
            <p>
              Estes Termos podem ser revisados periodicamente para refletir
              mudanças de funcionamento, política interna, requisitos legais ou
              melhorias de operação. O uso continuado da plataforma após a
              atualização constitui aceitação das novas condições.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              11. Contato e suporte
            </h2>
            <p>
              Para dúvidas, solicitações, problemas de acesso ou suporte geral,
              o usuário pode utilizar os canais disponíveis dentro do projeto e
              a área de suporte da aplicação. O EcoByte pode revisar e ajustar o
              atendimento conforme a evolução da plataforma.
            </p>
          </section>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-gray-300">
            <strong className="text-white">Última atualização:</strong>{" "}
            12/11/2026. Documento inicial para revisão e alinhamento com a
            identidade do projeto e com eventuais ajustes jurídicos futuros.
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          <Link
            to="/privacy"
            className="text-eco-neon transition hover:text-eco-mint"
          >
            Política de Privacidade
          </Link>
          <Link
            to="/login"
            className="text-eco-neon transition hover:text-eco-mint"
          >
            Voltar ao login
          </Link>
        </div>
      </div>
    </div>
  );
};
