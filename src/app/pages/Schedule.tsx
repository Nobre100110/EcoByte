import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import {
  Smartphone,
  Battery,
  Laptop,
  Monitor,
  Printer,
  Headphones,
  Keyboard,
  Camera,
  Cable,
  Package,
  ChevronLeft,
  MapPin,
  Calendar,
  Check,
  Search,
  ArrowRight,
  CheckCircle2,
  Navigation,
  Clock,
  Phone,
} from "lucide-react";
import { useStore } from "../store";

const items = [
  { id: "1", name: "Celular / Smartphone", icon: Smartphone, pts: 30 },
  { id: "2", name: "Baterias / Pilhas", icon: Battery, pts: 10 },
  { id: "3", name: "Notebook / Computador", icon: Laptop, pts: 50 },
  { id: "4", name: "Monitor / TV", icon: Monitor, pts: 40 },
  { id: "5", name: "Impressora", icon: Printer, pts: 30 },
  { id: "6", name: "Acessórios e Cabos", icon: Cable, pts: 5 },
  { id: "7", name: "Teclados / Mouses", icon: Keyboard, pts: 10 },
  { id: "8", name: "Câmeras e Equipamentos", icon: Camera, pts: 25 },
  { id: "9", name: "Fones de Ouvido", icon: Headphones, pts: 15 },
];

const timeSlots = ["08:00", "10:00", "14:00", "16:00", "18:00", "19:00"];

const ALL_POINTS = [
  // Fortaleza (PADRÃO)
  {
    name: "Recicla Mais Fortaleza",
    addr: "Av. Beira Mar, 2000, Meireles, Fortaleza",
    lat: -3.728,
    lng: -38.5021,
    hours: "Seg-Sex 8h-18h",
    city: "Fortaleza",
    accepts: ["Celulares", "Notebooks", "Tablets", "Baterias"],
  },
  {
    name: "EcoByte Ponto Verde Aldeota",
    addr: "Av. Santos Dumont, 1500, Aldeota, Fortaleza",
    lat: -3.734,
    lng: -38.507,
    hours: "Seg-Sáb 8h-18h",
    city: "Fortaleza",
    accepts: ["Todos"],
  },
  {
    name: "COINTECE - Cooperativa de Reciclagem",
    addr: "R. Tibúrcio Cavalcante, 500, Dionísio Torres, Fortaleza",
    lat: -3.74,
    lng: -38.511,
    hours: "Seg-Sex 7h-17h",
    city: "Fortaleza",
    accepts: ["Computadores", "Impressoras", "Monitores"],
  },
  // São Paulo
  {
    name: "EcoPonto Consolação",
    addr: "R. da Consolação, 1000, São Paulo",
    lat: -23.5489,
    lng: -46.645,
    hours: "Seg-Sex 9h-17h",
    city: "São Paulo",
    accepts: ["Celulares", "Baterias"],
  },
  {
    name: "Cooperativa Recicla Eletro SP",
    addr: "Av. Paulista, 1578, Bela Vista, São Paulo",
    lat: -23.5614,
    lng: -46.6558,
    hours: "Seg-Sex 8h-18h",
    city: "São Paulo",
    accepts: ["Todos"],
  },
  {
    name: "Green Eletronics Reciclagem",
    addr: "R. Vergueiro, 3800, Vila Mariana, São Paulo",
    lat: -23.592,
    lng: -46.633,
    hours: "Seg-Sex 8h-17h",
    city: "São Paulo",
    accepts: ["Todos"],
  },
  // Rio de Janeiro
  {
    name: "Recicla Rio Eletrônicos",
    addr: "Av. Rio Branco, 156, Centro, Rio de Janeiro",
    lat: -22.905,
    lng: -43.173,
    hours: "Seg-Sex 9h-18h",
    city: "Rio de Janeiro",
    accepts: ["Celulares", "Notebooks"],
  },
];

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// Generate calendar days for current month
function getCalendarDays() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const today = now.getDate();
  return { daysInMonth, firstDay, today, month, year };
}

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export const Schedule = () => {
  const navigate = useNavigate();
  const { user, setUser, addNotification } = useStore();
  const [step, setStep] = useState(1);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [locations, setLocations] = useState(
    ALL_POINTS.filter((p) => p.city === "Fortaleza"),
  );
  const { daysInMonth, firstDay, today, month, year } = getCalendarDays();

  const filteredItems = items.filter(
    (i) =>
      searchQuery === "" ||
      i.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const locationsWithDist = locations
    .map((l) => ({
      ...l,
      distance: userPos
        ? getDistance(userPos.lat, userPos.lng, l.lat, l.lng)
        : null,
    }))
    .sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));

  const totalPts = selectedItems.reduce((acc, id) => {
    const item = items.find((i) => i.id === id);
    return acc + (item?.pts || 0);
  }, 0);

  const locate = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      setIsLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserPos({ lat: latitude, lng: longitude });
        const sorted = ALL_POINTS.map((p) => ({
          ...p,
          dist: getDistance(latitude, longitude, p.lat, p.lng),
        })).sort((a, b) => a.dist - b.dist);
        const nearCity = sorted[0].city;
        setLocations(ALL_POINTS.filter((p) => p.city === nearCity));
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  useEffect(() => {
    locate();
  }, []);

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleConfirm = () => {
    const collectionEventId = Date.now();
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#2ECC71", "#1A7A3C", "#FFFFFF", "#F5A623"],
    });
    setStep(5);
    setTimeout(() => {
      setUser((prev) =>
        prev
          ? {
              ...prev,
              points: prev.points + totalPts,
              itemsDisposed: prev.itemsDisposed + selectedItems.length,
            }
          : prev,
      );
      addNotification(
        "EcoPontos adicionados",
        `${selectedItems.length} item(ns) registrados: +${totalPts} EcoPontos.`,
        {
          category: "rewards",
          eventKey: `collection-points:${user?.email}:${collectionEventId}`,
        },
      );
    }, 1500);
  };

  const canContinue = () => {
    if (step === 1) return selectedItems.length > 0;
    if (step === 2) return selectedDate !== null && selectedTime !== null;
    if (step === 3) return selectedLocation !== null;
    return true;
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-2xl font-display font-bold mb-1">
              O que você quer descartar?
            </h2>
            <p className="text-gray-400 text-sm mb-5">
              Selecione um ou mais itens
            </p>

            <div className="relative mb-5">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                size={18}
              />
              <input
                type="text"
                placeholder="Buscar item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-4 focus:border-eco-neon focus:outline-none text-white text-sm"
              />
            </div>

            <div className="space-y-2.5">
              {filteredItems.map((item) => {
                const isSelected = selectedItems.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (isSelected)
                        setSelectedItems((prev) =>
                          prev.filter((i) => i !== item.id),
                        );
                      else setSelectedItems((prev) => [...prev, item.id]);
                    }}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-eco-green/20 border-eco-neon shadow-[0_0_15px_rgba(46,204,113,0.12)]"
                        : "bg-white/5 border-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? "bg-eco-neon text-black" : "bg-white/10 text-white"}`}
                      >
                        <item.icon size={20} />
                      </div>
                      <span className="font-medium text-sm">{item.name}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-mono text-eco-neon">
                        +{item.pts} pts
                      </span>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${isSelected ? "border-eco-neon bg-eco-neon text-black" : "border-gray-500"}`}
                      >
                        {isSelected && <Check size={11} strokeWidth={3} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 flex items-center justify-between text-sm bg-eco-green/10 border border-eco-neon/20 rounded-xl px-4 py-3"
              >
                <span className="text-gray-300">
                  {selectedItems.length} item(s) selecionado(s)
                </span>
                <span className="text-eco-neon font-mono font-bold">
                  +{totalPts} pts
                </span>
              </motion.div>
            )}
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-2xl font-display font-bold mb-1">
              Escolha a data e horário
            </h2>
            <p className="text-gray-400 text-sm mb-5">
              Selecione um dia disponível
            </p>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-5 mb-5">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold">
                  {MONTH_NAMES[month]} {year}
                </span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
                {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
                  <span key={i}>{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`e${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isPast = day < today;
                  const isWeekend = new Date(year, month, day).getDay() === 0;
                  const isAvailable = !isPast && !isWeekend;
                  const isSelected = selectedDate === day;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => isAvailable && setSelectedDate(day)}
                      disabled={!isAvailable}
                      aria-label={`Selecionar dia ${day} de ${MONTH_NAMES[month]}`}
                      className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full text-sm transition-all ${
                        isSelected
                          ? "bg-eco-neon text-black font-bold scale-110"
                          : isAvailable
                            ? "text-white hover:bg-white/10 cursor-pointer"
                            : "text-gray-600 cursor-not-allowed"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <h3 className="font-bold mb-3 text-sm">Horários disponíveis</h3>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`py-3 rounded-xl font-medium text-sm transition-all border ${
                    selectedTime === time
                      ? "bg-eco-neon text-black border-eco-neon font-bold"
                      : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>

            {selectedDate && selectedTime && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-sm bg-eco-green/10 border border-eco-neon/20 rounded-xl px-4 py-3 text-center"
              >
                <span className="text-eco-neon font-bold">
                  {selectedDate} de {MONTH_NAMES[month]} às {selectedTime}
                </span>
              </motion.div>
            )}
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-2xl font-display font-bold mb-1">
              Onde deseja entregar?
            </h2>
            <p className="text-gray-400 text-sm mb-5">
              {userPos
                ? "Locais ordenados pela distância de você"
                : "Locais mais próximos"}
            </p>

            <button
              onClick={locate}
              className="w-full flex items-center justify-center space-x-2 bg-white/5 border border-eco-neon/40 text-eco-neon py-3 rounded-xl hover:bg-eco-neon/10 transition-colors mb-5 text-sm font-medium"
            >
              <MapPin size={16} />
              <span>
                {isLocating
                  ? "Detectando localização..."
                  : userPos
                    ? "📍 Localização detectada — Atualizar"
                    : "Usar minha localização atual"}
              </span>
            </button>

            <div className="space-y-3">
              {locationsWithDist.map((loc, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedLocation(loc)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedLocation?.name === loc.name
                      ? "bg-eco-green/20 border-eco-neon shadow-[0_0_15px_rgba(46,204,113,0.12)]"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-white text-sm pr-2">
                      {loc.name}
                    </h3>
                    <div className="flex flex-col items-end shrink-0">
                      {loc.distance !== null && (
                        <span className="text-eco-neon font-mono text-xs font-bold">
                          {loc.distance.toFixed(1)} km
                        </span>
                      )}
                      {selectedLocation?.name === loc.name && (
                        <CheckCircle2
                          size={16}
                          className="text-eco-neon mt-1"
                        />
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{loc.addr}</p>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Clock size={11} />
                      <span>{loc.hours}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {loc.accepts.slice(0, 3).map((a) => (
                      <span
                        key={a}
                        className="text-[10px] bg-white/5 border border-white/10 text-gray-400 px-2 py-0.5 rounded-full"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="pb-28"
          >
            <h2 className="text-2xl font-display font-bold mb-1">
              Resumo do Agendamento
            </h2>
            <p className="text-gray-400 text-sm mb-5">
              Confira tudo antes de confirmar
            </p>

            <div className="glass-card rounded-3xl p-5 space-y-5">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-eco-neon/10 flex items-center justify-center shrink-0">
                  <Calendar size={20} className="text-eco-neon" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Data e Horário</p>
                  <p className="font-bold">
                    {selectedDate} de {MONTH_NAMES[month]}, {selectedTime}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-eco-neon/10 flex items-center justify-center shrink-0">
                  <MapPin size={20} className="text-eco-neon" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">
                    Local de Entrega
                  </p>
                  <p className="font-bold text-sm">{selectedLocation?.name}</p>
                  <p className="text-xs text-gray-400">
                    {selectedLocation?.addr}
                  </p>
                  {selectedLocation?.distance && (
                    <p className="text-xs text-eco-neon mt-0.5">
                      {selectedLocation.distance.toFixed(1)} km de você
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-eco-neon/10 flex items-center justify-center shrink-0">
                  <Package size={20} className="text-eco-neon" />
                </div>
                <div className="w-full">
                  <p className="text-xs text-gray-400 mb-2">
                    Itens selecionados ({selectedItems.length})
                  </p>
                  <div className="space-y-1.5">
                    {selectedItems.map((id) => {
                      const item = items.find((i) => i.id === id);
                      return (
                        <div
                          key={id}
                          className="flex justify-between items-center bg-black/20 px-3 py-2 rounded-lg"
                        >
                          <span className="text-sm">{item?.name}</span>
                          <span className="text-xs font-mono text-eco-neon">
                            +{item?.pts} pts
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                <span className="font-bold">Total a receber</span>
                <span className="text-xl font-mono font-bold text-eco-neon">
                  +{totalPts} pts
                </span>
              </div>
            </div>

            <div className="mt-4 text-center text-sm text-eco-neon/80 bg-eco-green/10 py-3 rounded-xl border border-eco-neon/20">
              🌍 Você vai evitar aproximadamente{" "}
              {(selectedItems.length * 0.4).toFixed(1)} kg de CO₂!
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            key="step5"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-full flex flex-col items-center justify-center text-center px-6 pt-12"
          >
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-eco-neon/20 blur-3xl rounded-full animate-pulse" />
              <CheckCircle2
                size={100}
                className="text-eco-neon relative z-10 drop-shadow-[0_0_20px_rgba(46,204,113,0.5)]"
              />
            </div>
            <h2 className="text-3xl font-display font-bold mb-3 text-white">
              Agendamento
              <br />
              Realizado!
            </h2>
            <div className="bg-white/5 rounded-2xl py-3 px-6 mb-4 inline-block border border-white/10">
              <span className="text-eco-neon font-bold text-sm">
                {selectedDate} de {MONTH_NAMES[month]} às {selectedTime}
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-2">
              {selectedLocation?.name}
            </p>
            <div className="flex items-center space-x-2 text-xl font-mono font-bold text-eco-neon mb-6">
              <span>+{totalPts} EcoPoints!</span>
            </div>
            <p className="text-gray-500 text-sm mb-10">
              Você receberá uma confirmação no seu e-mail
            </p>
            <div className="w-full space-y-3">
              <button
                onClick={() => navigate("/appointments")}
                className="w-full bg-white/10 text-white py-4 rounded-full font-bold hover:bg-white/20 transition-colors border border-white/10"
              >
                Ver meus agendamentos
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full bg-eco-neon text-black py-4 rounded-full font-bold hover:bg-eco-neon/90 transition-colors shadow-[0_0_20px_rgba(46,204,113,0.3)]"
              >
                Voltar ao início
              </button>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-full w-full bg-eco-black relative flex flex-col">
      <div className="max-w-2xl mx-auto w-full px-6 pt-12 flex-1 flex flex-col">
        {step < 5 && (
          <div className="flex items-center justify-between mb-6 shrink-0">
            <button
              onClick={() => (step > 1 ? setStep(step - 1) : navigate(-1))}
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all ${step >= i ? "bg-eco-neon w-6" : "bg-white/10 w-2"}`}
                />
              ))}
            </div>
            <div className="w-10" />
          </div>
        )}

        {step < 5 && (
          <div
            className="flex-1 overflow-y-auto flex flex-col"
            style={{ scrollbarWidth: "none" }}
          >
            <div className="flex-1">
              <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
            </div>

            {/* Button section - in normal flow, not absolute */}
            <div className="mt-6 pb-6 pt-4 border-t border-white/10">
              {step === 4 ? (
                <button
                  onClick={handleConfirm}
                  className="w-full bg-eco-neon text-black py-4 rounded-full font-bold text-lg hover:bg-eco-neon/90 transition-all shadow-[0_0_20px_rgba(46,204,113,0.4)] flex items-center justify-center space-x-2"
                >
                  <Check size={20} />
                  <span>Confirmar agendamento</span>
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={!canContinue()}
                  className="w-full bg-eco-neon text-black py-4 rounded-full font-bold text-lg transition-all shadow-[0_0_20px_rgba(46,204,113,0.4)] disabled:opacity-40 disabled:shadow-none flex items-center justify-center space-x-2"
                >
                  <span>Continuar</span>
                  <ArrowRight size={20} />
                </button>
              )}
            </div>
          </div>
        )}

        {step === 5 && (
          <div
            className="flex-1 overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
          >
            <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
          </div>
        )}
      </div>
      {/* end max-width wrapper */}
    </div>
  );
};
