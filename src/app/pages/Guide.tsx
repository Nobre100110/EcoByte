import React, { useState } from "react";
import {
  Search,
  ChevronDown,
  Share2,
  Smartphone,
  Battery,
  Laptop,
  Monitor,
  Printer,
  Headphones,
  Cable,
  Camera,
  Info,
  AlertTriangle,
  MapPin,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";

const guides = [
  {
    id: 1,
    name: "Celulares e Smartphones",
    icon: Smartphone,
    warning: "Não descarte no lixo comum!",
    steps: [
      "Faça backup de todos os seus dados pessoais.",
      "Restaure as configurações de fábrica.",
      "Remova o chip (SIM) e o cartão de memória.",
      "Leve a um ponto de coleta certificado EcoByte.",
    ],
    fact: "Um único celular descartado incorretamente pode contaminar 1 milhão de litros de água.",
    category: "Celulares",
  },
  {
    id: 2,
    name: "Baterias e Pilhas",
    icon: Battery,
    warning: "Risco de vazamento tóxico e incêndio",
    steps: [
      "Armazene em recipiente plástico seco.",
      "Não exponha ao calor ou umidade.",
      "Isole os polos com fita adesiva.",
      "Descarte em papa-pilhas ou pontos de coleta.",
    ],
    fact: "Uma única pilha pode contaminar a água equivalente a 600 mil litros.",
    category: "Baterias",
  },
  {
    id: 3,
    name: "Notebooks e Computadores",
    icon: Laptop,
    warning: "Contêm mercúrio e chumbo",
    steps: [
      "Faça backup e apague os dados com software especializado.",
      "Remova e descarte baterias separadamente.",
      "Leve ao ponto de coleta — muitas marcas têm programas de take-back.",
    ],
    fact: "Os metais presentes em computadores levam até 400 anos para se decompor no solo.",
    category: "Computadores",
  },
  {
    id: 4,
    name: "Monitores e TVs",
    icon: Monitor,
    warning: "Vidro e componentes frágeis com substâncias nocivas",
    steps: [
      "Não quebre a tela — libera substâncias tóxicas.",
      "Embale com cuidado antes de transportar.",
      "Leve a ponto de coleta ou ligue para coleta domiciliar.",
    ],
    fact: "TVs de tubo (CRT) contêm até 4 kg de chumbo em seu vidro.",
    category: "Monitores",
  },
  {
    id: 5,
    name: "Impressoras",
    icon: Printer,
    warning: "Cartuchos contêm tinta e metais pesados",
    steps: [
      "Retire e descarte os cartuchos separadamente.",
      "Procure programas de reciclagem das próprias marcas.",
      "Leve o equipamento a ponto de coleta certificado.",
    ],
    fact: "Cartuchos de tinta levam mais de 1.000 anos para se decompor em aterros sanitários.",
    category: "Impressoras",
  },
  {
    id: 6,
    name: "Cabos e Carregadores",
    icon: Cable,
    warning: "Plástico e cobre não se decompõem facilmente",
    steps: [
      "Enrole com fita para evitar emaranhamentos.",
      "Junte vários e leve de uma vez ao ponto de coleta.",
      "Verifique programas de troca de operadoras.",
    ],
    fact: "O cobre presente nos cabos pode ser 100% reciclado e reutilizado na indústria.",
    category: "Cabos",
  },
  {
    id: 7,
    name: "Câmeras e Equipamentos",
    icon: Camera,
    warning: "Baterias de lítio exigem cuidado especial",
    steps: [
      "Remova a bateria e descarte separadamente.",
      "Remova o cartão de memória.",
      "Verifique programas de trade-in das marcas.",
      "Leve a ponto de coleta certificado.",
    ],
    fact: "As câmeras digitais contêm terras raras que são extremamente difíceis de extrair da natureza.",
    category: "Câmeras",
  },
  {
    id: 8,
    name: "Fones e Acessórios",
    icon: Headphones,
    warning: "Baterias internas exigem atenção",
    steps: [
      "Verifique se tem bateria interna — neste caso, não abra.",
      "Procure o fabricante para reciclagem.",
      "Leve ao ponto de coleta certificado.",
    ],
    fact: "Fones com bateria interna não podem ser descartados com lixo eletrônico comum.",
    category: "Acessórios",
  },
];

export const Guide = () => {
  const [expandedId, setExpandedId] = useState<number | null>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const navigate = useNavigate();

  const categories = [
    "Todos",
    "Celulares",
    "Baterias",
    "Computadores",
    "Monitores",
    "Impressoras",
    "Cabos",
    "Câmeras",
    "Acessórios",
  ];
  const filtered = guides.filter((g) => {
    const matchCat =
      activeCategory === "Todos" || g.category === activeCategory;
    const matchSearch =
      searchQuery === "" ||
      g.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "EcoByte — Guia de Descarte",
        text: "Saiba como descartar seu lixo eletrônico corretamente!",
        url: window.location.href,
      });
      return;
    }

    navigator.clipboard?.writeText(window.location.href).then(() => {
      window.alert("Link copiado para a área de transferência.");
    });
  };

  return (
    <div className="min-h-full w-full bg-eco-black pb-6">
      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-12">
        <h1 className="text-2xl md:text-3xl font-display font-bold mb-1">
          Guia de descarte
        </h1>
        <p className="text-gray-400 text-sm mb-5">
          Descarte correto, passo a passo
        </p>

        <div className="relative mb-4">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            size={18}
          />
          <input
            type="text"
            placeholder="Qual item você quer descartar?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-11 pr-4 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-eco-neon"
          />
        </div>

        <div
          className="flex overflow-x-auto space-x-2 pb-3 -mx-5 px-5 md:mx-0 md:px-0 md:flex-wrap md:gap-2 md:space-x-0"
          style={{ scrollbarWidth: "none" }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${activeCategory === cat ? "bg-eco-neon text-black font-bold" : "bg-white/5 text-gray-400 border border-white/10"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="bg-eco-green/20 border border-eco-neon/30 rounded-2xl p-4 mb-5 flex items-start space-x-3 mt-4">
          <div className="bg-eco-neon/20 p-2 rounded-full text-eco-neon shrink-0">
            <Info size={18} />
          </div>
          <p className="text-sm text-white/90 leading-relaxed">
            <span className="font-bold text-eco-neon">Você sabia?</span> O
            Brasil gera 2,1 milhões de toneladas de lixo eletrônico por ano, mas
            apenas 3% é reciclado corretamente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.length === 0 && (
            <div className="col-span-2 text-center py-12 text-gray-500 text-sm">
              Nenhum item encontrado.
            </div>
          )}
          {filtered.map((guide) => (
            <div
              key={guide.id}
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpandedId(expandedId === guide.id ? null : guide.id)
                }
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-eco-neon">
                    <guide.icon size={20} />
                  </div>
                  <span className="font-bold text-sm text-left">
                    {guide.name}
                  </span>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-gray-400 transition-transform duration-300 shrink-0 ${expandedId === guide.id ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence>
                {expandedId === guide.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
                      <div className="flex items-center space-x-2 text-eco-amber bg-eco-amber/10 px-3 py-2 rounded-lg text-xs font-medium border border-eco-amber/20">
                        <AlertTriangle size={14} />
                        <span>{guide.warning}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-xs mb-2 text-gray-400 uppercase tracking-wider">
                          Passo a passo:
                        </h4>
                        <ol className="space-y-1.5">
                          {guide.steps.map((step, i) => (
                            <li
                              key={i}
                              className="text-sm text-gray-300 flex items-start space-x-2"
                            >
                              <span className="text-eco-neon font-bold text-xs mt-0.5">
                                {i + 1}.
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                        <p className="text-xs text-gray-400 italic">
                          💡 {guide.fact}
                        </p>
                      </div>
                      <button
                        onClick={() => navigate("/map")}
                        className="w-full py-2.5 bg-eco-neon/10 text-eco-neon rounded-xl font-medium text-sm hover:bg-eco-neon/20 transition-colors border border-eco-neon/20 flex items-center justify-center space-x-2"
                      >
                        <MapPin size={14} />
                        <span>Ver pontos de coleta próximos</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={handleShare}
            className="flex items-center space-x-2 text-eco-neon text-sm font-medium bg-eco-neon/10 px-5 py-2.5 rounded-full border border-eco-neon/20 hover:bg-eco-neon/20 transition-colors"
          >
            <Share2 size={15} />
            <span>Compartilhar este guia</span>
          </button>
        </div>
      </div>
    </div>
  );
};
