import React from "react";
import { Link } from "react-router";

export const PrivacyPage = () => {
  return (
    <div className="min-h-screen w-full bg-eco-black px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-eco-neon">
              Proteção de dados
            </p>
            <h1 className="mt-3 text-3xl font-semibold">
              Política de Privacidade
            </h1>
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
            Esta Política de Privacidade descreve, de forma clara e objetiva,
            como o EcoByte trata as informações dos usuários no contexto da
            plataforma atual. O texto abaixo reflete o funcionamento real do
            projeto e foi redigido para servir como base inicial para revisão e
            alinhamento com futuras decisões legais e de infraestrutura.
          </p>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              1. Apresentação
            </h2>
            <p>
              O EcoByte é uma plataforma de incentivo ambiental e gestão de
              atividades relacionadas a descarte responsável, acompanhamento de
              progresso, pontos, missões e recompensas. A coleta e o uso de
              dados estão diretamente ligados ao funcionamento da conta do
              usuário e à experiência da plataforma.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              2. Informações que podem ser coletadas
            </h2>
            <p>
              O EcoByte pode coletar informações fornecidas durante o cadastro,
              como nome, e-mail, dados pessoais relevantes para perfil e
              endereço cadastrado. Também podem ser registrados dados de uso da
              plataforma, como progresso em missões, pontuação, histórico de
              atividades, notificações, preferências de acesso e dados de
              configuração visual e de acessibilidade.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              3. Informações do cadastro
            </h2>
            <p>
              Durante o cadastro, o usuário pode fornecer nome completo, e-mail,
              senha e outros dados permitidos pela aplicação. Essas informações
              são utilizadas para autenticação, identificação da conta e
              personalização do ambiente do usuário dentro do EcoByte.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              4. Informações pessoais e da conta
            </h2>
            <p>
              Podem ser armazenados dados pessoais como idade, telefone, foto de
              perfil, endereço cadastrado, preferências e informações de
              configuração da conta. O objetivo é manter a experiência do
              usuário organizada e personalizada dentro da plataforma.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              5. Dados de utilização da plataforma
            </h2>
            <p>
              O sistema também pode registrar ações realizadas no app, como
              missões concluídas, progresso em desafios, uso de recompensa,
              notificações lidas, ajustes de aparência, acessibilidade e ações
              relacionadas ao histórico da conta. Esses dados ajudam a manter o
              uso da plataforma consistente e funcional.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              6. Finalidade da coleta
            </h2>
            <p>
              As informações coletadas são utilizadas para autenticação,
              personalização do fluxo de uso, cálculo de pontos e sequência,
              controle de progresso, geração de recompensas, suporte ao usuário,
              manutenção de histórico e organização do ambiente dentro do
              EcoByte.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              7. Armazenamento
            </h2>
            <p>
              Os dados podem ser armazenados no navegador, em estruturas locais
              do projeto e, quando houver infraestrutura externa configurada, em
              serviços de banco de dados ou autenticação. A arquitetura atual do
              projeto combina dados locais e dados em ambiente de
              desenvolvimento; ajustes futuros podem ampliar esse fluxo.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              8. Segurança e proteção das informações
            </h2>
            <p>
              O EcoByte aplica práticas básicas de segurança, incluindo
              validação de dados de cadastro, uso de hash para senhas em alguns
              fluxos, controle de acesso à conta e organização de registros por
              usuário. Ainda assim, este documento não garante conformidade
              jurídica absoluta: ele representa uma versão inicial de referência
              para o projeto e deve ser revisada junto a uma equipe responsável
              pela privacidade e compliance.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              9. Compartilhamento de informações
            </h2>
            <p>
              O EcoByte não deve compartilhar os dados do usuário com terceiros
              sem justificativa clara e autorização adequada. Quando existirem
              integrações com serviços externos, como autenticação ou envio de
              e-mails, essas integrações devem obedecer às políticas de cada
              serviço e às regras internas do projeto.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              10. Prazo de armazenamento
            </h2>
            <p>
              Os dados são mantidos pelo tempo necessário para o funcionamento
              da plataforma e para o atendimento de regras de uso e segurança do
              sistema. Registros de atividades, histórico e configurações podem
              permanecer armazenados para manter a experiência do usuário e a
              integridade da conta.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              11. Direitos e solicitações do usuário
            </h2>
            <p>
              O usuário pode solicitar acesso, correção ou atualização de dados,
              conforme a funcionalidade disponível no projeto e a legislação
              aplicável. Em ambientes mais avançados, esse processo pode ser
              ampliado para incluir mecanismos de exclusão e confirmação de
              propriedade dos dados.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              12. Exclusão e alteração de dados
            </h2>
            <p>
              Alterações em dados pessoais devem ocorrer mediante ação do
              próprio usuário ou por processo autorizado no sistema. Dados que
              forem necessários ao funcionamento da conta e ao histórico do
              usuário devem ser preservados conforme as regras do produto,
              exceto quando houver exclusão explícita e autorizada por quem tem
              direito sobre a conta.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              13. Cookies e tecnologias semelhantes
            </h2>
            <p>
              O EcoByte pode utilizar cookies ou tecnologias semelhantes para
              manter sessão, preferência de interface, configuração de acesso e
              funcionalidade básica do navegador. O uso desses recursos deve ser
              documentado conforme a evolução do app e a infraestrutura de
              hospedagem utilizada.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              14. Alterações na Política de Privacidade
            </h2>
            <p>
              Esta Política pode ser atualizada ao longo do desenvolvimento da
              plataforma, especialmente em função de novas integrações,
              alterações na infraestrutura ou ajustes legais. O uso contínuo da
              aplicação após atualização indica que o usuário acompanha e aceita
              a política vigente.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              15. Contato e suporte
            </h2>
            <p>
              Para dúvidas, pedidos de informação, ajustes de perfil e
              solicitações relacionadas ao uso dos dados, o usuário pode entrar
              em contato por meio dos canais disponíveis dentro do projeto e da
              área de suporte da plataforma.
            </p>
          </section>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-gray-300">
            <strong className="text-white">Última atualização:</strong>{" "}
            12/11/2026. Documento inicial para revisão e alinhamento com as
            regras internas e com futuras integrações de backend e compliance.
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          <Link
            to="/terms"
            className="text-eco-neon transition hover:text-eco-mint"
          >
            Termos de Uso
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
