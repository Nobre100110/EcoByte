import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Coins, Gift } from "lucide-react";
import logo from "../logo.png";

const slides = [
  {
    id: 1,
    title: "Encontre o ponto mais próximo",
    desc: "Localize facilmente os pontos de coleta certificados para seus eletrônicos.",
    icon: MapPin,
  },
  {
    id: 2,
    title: "Descarte e ganhe pontos",
    desc: "O meio ambiente agradece, e você acumula EcoPoints.",
    icon: Coins,
  },
  {
    id: 3,
    title: "Troque por recompensas",
    desc: "Use seus pontos para resgatar gift cards e benefícios exclusivos.",
    icon: Gift,
  },
];

export const Splash = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowOnboarding(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (!showOnboarding) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-eco-black relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-eco-green)_0%,_transparent_50%)] opacity-20" />
        <div className="absolute w-[200vw] h-[200vw] border-[1px] border-eco-neon/10 rounded-full animate-[spin_10s_linear_infinite]" />

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="mb-6 flex flex-col items-center"
          >
            {/* Logo */}
            <div
              style={{ width: "240px", height: "170px", overflow: "hidden" }}
            >
              <img
                src={logo}
                alt="EcoByte Logo"
                className="mix-blend-screen"
                style={{ width: "240px", marginTop: "-8px" }}
                onError={(e) => (e.currentTarget.src = "/logo.png")}
              />
            </div>
          </motion.div>

          <p className="text-eco-mint/80 font-body text-center max-w-[250px] text-lg">
            Descarte hoje. Transforme o amanhã.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col justify-between bg-eco-black px-6 pt-16 pb-12 relative">
      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center"
          >
            <div className="w-48 h-48 mb-12 rounded-full bg-eco-green/10 flex items-center justify-center relative shadow-[0_0_40px_rgba(46,204,113,0.15)]">
              {React.createElement(slides[currentSlide].icon, {
                size: 80,
                className: "text-eco-neon",
                strokeWidth: 1.5,
              })}
            </div>
            <h2 className="text-2xl font-bold font-display mb-4 leading-tight">
              {slides[currentSlide].title}
            </h2>
            <p className="text-gray-400 font-body px-4">
              {slides[currentSlide].desc}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex flex-col items-center w-full space-y-8">
        <div className="flex space-x-2">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentSlide ? "w-8 bg-eco-neon" : "w-2 bg-white/20"
              }`}
            />
          ))}
        </div>

        <div className="w-full flex flex-col items-center space-y-4">
          <button
            onClick={() => {
              if (currentSlide < slides.length - 1) {
                setCurrentSlide((c) => c + 1);
              } else {
                navigate("/login", { replace: true });
              }
            }}
            className="w-full max-w-xs bg-eco-neon text-eco-black py-3 rounded-full font-bold text-base hover:bg-eco-neon/90 transition-colors"
            aria-label={
              currentSlide < slides.length - 1
                ? "Próximo slide"
                : "Começar a usar o app"
            }
          >
            {currentSlide < slides.length - 1 ? "Próximo" : "Começar"}
          </button>
          <button
            onClick={() => navigate("/login", { replace: true })}
            className="text-white/60 font-medium py-2 hover:text-white transition-colors text-sm"
            aria-label="Ir para a tela de login"
          >
            Já tenho uma conta
          </button>
        </div>
      </div>
    </div>
  );
};
