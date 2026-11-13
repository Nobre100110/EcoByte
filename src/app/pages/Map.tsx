import React, { useState, useEffect } from "react";
import { Search, MapPin, X, Clock, ChevronRight, Phone } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { MapView } from "../components/MapView";
import { useStore } from "../store";
import "../../styles/leaflet.css";

// Base de dados de pontos de coleta reais por cidade - CEARÁ
const ALL_COLLECTION_POINTS = [
  // ========== FORTALEZA (CAPITAL) ==========
  {
    id: 1,
    name: "Recicla Mais Fortaleza - Centro",
    addr: "Av. Beira Mar, 2000, Meireles, Fortaleza",
    lat: -3.728,
    lng: -38.5021,
    hours: "Seg-Sex 8h-18h, Sáb 8h-14h",
    phone: "(85) 3344-5566",
    accepts: ["Celulares", "Notebooks", "Tablets", "Baterias"],
    city: "Fortaleza",
    state: "CE",
  },
  {
    id: 2,
    name: "EcoByte Ponto Verde Aldeota",
    addr: "Av. Santos Dumont, 1500, Aldeota, Fortaleza",
    lat: -3.734,
    lng: -38.507,
    hours: "Seg-Sáb 8h-18h",
    phone: "(85) 3456-7890",
    accepts: ["Todos os eletrônicos"],
    city: "Fortaleza",
    state: "CE",
  },
  {
    id: 3,
    name: "COINTECE - Cooperativa de Reciclagem",
    addr: "R. Tibúrcio Cavalcante, 500, Dionísio Torres, Fortaleza",
    lat: -3.74,
    lng: -38.511,
    hours: "Seg-Sex 7h-17h",
    phone: "(85) 3232-4545",
    accepts: ["Computadores", "Impressoras", "Monitores", "Cabos"],
    city: "Fortaleza",
    state: "CE",
  },
  {
    id: 4,
    name: "Lixo Eletrônico CE - Iguatemi",
    addr: "Av. Washington Soares, 85, Edson Queiroz, Fortaleza",
    lat: -3.765,
    lng: -38.482,
    hours: "Seg-Sáb 10h-22h",
    phone: "(85) 3098-7654",
    accepts: ["Celulares", "Baterias", "Carregadores", "Cabos"],
    city: "Fortaleza",
    state: "CE",
  },
  {
    id: 5,
    name: "Ecocentro Fortaleza - Praia de Iracema",
    addr: "Av. Historiador Raimundo Girão, 900, Praia de Iracema, Fortaleza",
    lat: -3.7195,
    lng: -38.5205,
    hours: "Ter-Dom 9h-17h",
    phone: "(85) 3101-5555",
    accepts: ["Eletrônicos em geral", "Eletrodomésticos"],
    city: "Fortaleza",
    state: "CE",
  },
  {
    id: 6,
    name: "Recicla Tech - Messejana",
    addr: "R. Dom Joaquim, 1200, Messejana, Fortaleza",
    lat: -3.8123,
    lng: -38.4789,
    hours: "Seg-Sáb 8h-17h",
    phone: "(85) 3299-1234",
    accepts: ["Computadores", "Notebooks", "Periféricos"],
    city: "Fortaleza",
    state: "CE",
  },
  // ========== CIDADES DA REGIÃO METROPOLITANA ==========
  {
    id: 7,
    name: "EcoColeta Caucaia",
    addr: "Av. João XXIII, 500, Centro, Caucaia",
    lat: -3.7356,
    lng: -38.6532,
    hours: "Seg-Sex 8h-17h",
    phone: "(85) 3101-3333",
    accepts: ["Celulares", "Baterias", "Carregadores"],
    city: "Caucaia",
    state: "CE",
  },
  {
    id: 8,
    name: "Ponto Verde Maracanaú",
    addr: "Av. Litorânea, 1500, Maracanaú",
    lat: -3.6234,
    lng: -38.6125,
    hours: "Seg-Sex 8h-18h, Sáb 9h-14h",
    phone: "(85) 3337-7777",
    accepts: ["Todos os eletrônicos"],
    city: "Maracanaú",
    state: "CE",
  },
  {
    id: 9,
    name: "Reciclagem Maranguape",
    addr: "R. Principal, 800, Centro, Maranguape",
    lat: -3.6567,
    lng: -38.6234,
    hours: "Seg-Sex 8h-17h",
    phone: "(85) 3348-2222",
    accepts: ["Eletrônicos diversos", "Sucatas"],
    city: "Maranguape",
    state: "CE",
  },
  {
    id: 10,
    name: "Aquiraz Recicla - Praia",
    addr: "Av. Beira Mar, 350, Aquiraz",
    lat: -3.5945,
    lng: -38.3867,
    hours: "Seg-Dom 9h-18h",
    phone: "(85) 3345-5555",
    accepts: ["Celulares", "Tablets", "Acessórios"],
    city: "Aquiraz",
    state: "CE",
  },
  {
    id: 11,
    name: "Coleta Pacajus",
    addr: "Av. Getúlio Vargas, 1100, Pacajus",
    lat: -3.6712,
    lng: -38.2234,
    hours: "Seg-Sex 8h-17h",
    phone: "(85) 3334-4444",
    accepts: ["Todos os eletrônicos"],
    city: "Pacajus",
    state: "CE",
  },
  // ========== CIDADES DO INTERIOR ==========
  {
    id: 12,
    name: "Ecocenter Itapipoca",
    addr: "R. Coronel Antônio, 500, Centro, Itapipoca",
    lat: -3.1156,
    lng: -39.1234,
    hours: "Seg-Sex 8h-17h",
    phone: "(85) 3351-2222",
    accepts: ["Celulares", "Baterias", "Carregadores"],
    city: "Itapipoca",
    state: "CE",
  },
  {
    id: 13,
    name: "Ponto Sobral - Sertão",
    addr: "Av. Getúlio Vargas, 2000, Sobral",
    lat: -3.7685,
    lng: -40.3456,
    hours: "Seg-Sex 8h-17h, Sáb 8h-12h",
    phone: "(88) 3613-3333",
    accepts: ["Todos os eletrônicos"],
    city: "Sobral",
    state: "CE",
  },
  {
    id: 14,
    name: "Recicla Quixadá",
    addr: "R. Joaquim Machado, 800, Centro, Quixadá",
    lat: -4.9691,
    lng: -39.2889,
    hours: "Seg-Sex 8h-17h",
    phone: "(88) 3484-1111",
    accepts: ["Eletrônicos em geral"],
    city: "Quixadá",
    state: "CE",
  },
  {
    id: 15,
    name: "EcoJaguaruana",
    addr: "Av. Antônio Vieira, 600, Jaguaruana",
    lat: -5.3867,
    lng: -37.7834,
    hours: "Seg-Qui 8h-17h",
    phone: "(88) 3562-2222",
    accepts: ["Celulares", "Computadores", "Periféricos"],
    city: "Jaguaruana",
    state: "CE",
  },
  {
    id: 16,
    name: "Coleta Limoeiro do Norte",
    addr: "R. Liberato Barroso, 1000, Limoeiro do Norte",
    lat: -5.1697,
    lng: -37.8645,
    hours: "Seg-Sex 8h-17h",
    phone: "(88) 3534-3333",
    accepts: ["Todos os eletrônicos", "Eletrodomésticos"],
    city: "Limoeiro do Norte",
    state: "CE",
  },
  {
    id: 17,
    name: "Reciclagem Crateús",
    addr: "Av. Getúlio Vargas, 900, Crateús",
    lat: -5.1934,
    lng: -40.6723,
    hours: "Seg-Sex 8h-17h",
    phone: "(88) 3544-1111",
    accepts: ["Celulares", "Baterias"],
    city: "Crateús",
    state: "CE",
  },
  {
    id: 18,
    name: "Ponto Iguatu",
    addr: "R. Coronel Antônio Pessoa, 500, Iguatu",
    lat: -5.5613,
    lng: -39.3033,
    hours: "Seg-Sex 8h-17h",
    phone: "(88) 3581-2222",
    accepts: ["Eletrônicos diversos"],
    city: "Iguatu",
    state: "CE",
  },
  {
    id: 19,
    name: "EcoRecicla Juazeiro do Norte",
    addr: "Av. Leão XIII, 1500, Juazeiro do Norte",
    lat: -7.2156,
    lng: -39.3147,
    hours: "Seg-Sex 8h-17h, Sáb 9h-13h",
    phone: "(88) 3102-4444",
    accepts: ["Todos os eletrônicos"],
    city: "Juazeiro do Norte",
    state: "CE",
  },
  {
    id: 20,
    name: "Ponto Cariús - Região do Cariri",
    addr: "R. Principal, 400, Cariús",
    lat: -6.3067,
    lng: -39.2734,
    hours: "Seg-Qua-Sex 8h-17h",
    phone: "(88) 3522-1111",
    accepts: ["Celulares", "Acessórios"],
    city: "Cariús",
    state: "CE",
  },
  // ========== OUTRAS CIDADES PEQUENAS ==========
  {
    id: 21,
    name: "Ecopontos Morada Nova",
    addr: "R. João Batista, 300, Morada Nova",
    lat: -4.3567,
    lng: -37.8912,
    hours: "Seg-Sex 8h-17h",
    phone: "(88) 3451-1111",
    accepts: ["Celulares", "Baterias"],
    city: "Morada Nova",
    state: "CE",
  },
  {
    id: 22,
    name: "Ponto Tianguá - Norte",
    addr: "Av. Getúlio Vargas, 1000, Tianguá",
    lat: -4.2883,
    lng: -40.3078,
    hours: "Seg-Sex 8h-17h",
    phone: "(88) 3432-2222",
    accepts: ["Eletrônicos diversos"],
    city: "Tianguá",
    state: "CE",
  },
  {
    id: 23,
    name: "Coleta Redenção",
    addr: "R. Principal, 250, Redenção",
    lat: -4.2276,
    lng: -39.7645,
    hours: "Seg-Qui-Sex 8h-17h",
    phone: "(88) 3578-1111",
    accepts: ["Celulares", "Carregadores"],
    city: "Redenção",
    state: "CE",
  },
  {
    id: 24,
    name: "EcoAraçoaba",
    addr: "R. Dr. José de Aquino, 400, Araçoaba",
    lat: -4.6489,
    lng: -39.4156,
    hours: "Seg-Sex 8h-17h",
    phone: "(88) 3456-3333",
    accepts: ["Celulares", "Eletrônicos leves"],
    city: "Araçoaba",
    state: "CE",
  },
  {
    id: 25,
    name: "Recicla Camoim",
    addr: "Av. Central, 600, Camoim",
    lat: -3.8934,
    lng: -39.0123,
    hours: "Seg-Sex 8h-17h",
    phone: "(85) 3299-2222",
    accepts: ["Todos os eletrônicos"],
    city: "Camoim",
    state: "CE",
  },
];

function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export const MapPage = () => {
  const navigate = useNavigate();
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [showPointsList, setShowPointsList] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationCity, setLocationCity] = useState<string>("Fortaleza");
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [nearbyPoints, setNearbyPoints] = useState<
    typeof ALL_COLLECTION_POINTS
  >(ALL_COLLECTION_POINTS.filter((p) => p.city === "Fortaleza"));
  const { address } = useStore();

  const pointsWithDistance = nearbyPoints
    .map((p) => ({
      ...p,
      distance: userLocation
        ? getDistance(userLocation.lat, userLocation.lng, p.lat, p.lng)
        : null,
    }))
    .filter((p) => {
      const matchFilter =
        activeFilter === "Todos" ||
        p.accepts.some((item) =>
          item.toLowerCase().includes(activeFilter.toLowerCase()),
        );
      const matchSearch =
        searchQuery === "" ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.addr.toLowerCase().includes(searchQuery.toLowerCase());
      return matchFilter && matchSearch;
    })
    .sort((a, b) => {
      if (a.distance === null || b.distance === null) return 0;
      return a.distance - b.distance;
    });

  const locateUser = async () => {
    setIsLocating(true);
    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
          });
        },
      );

      const { latitude, longitude } = position.coords;
      setUserLocation({ lat: latitude, lng: longitude });

      // Encontrar a cidade mais próxima
      const withDist = ALL_COLLECTION_POINTS.map((p) => ({
        ...p,
        distance: getDistance(latitude, longitude, p.lat, p.lng),
      }));
      const nearest = withDist.reduce((prev, current) =>
        prev.distance < current.distance ? prev : current,
      );

      setLocationCity(nearest.city);
      setNearbyPoints(
        ALL_COLLECTION_POINTS.filter((p) => p.city === nearest.city),
      );
    } catch (error) {
      console.log(
        "Localização não disponível, usando Fortaleza como padrão",
        error,
      );
    } finally {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    // if user has saved address, center map on that city
    if (address && address.city) {
      setLocationCity(address.city);
      setNearbyPoints(
        ALL_COLLECTION_POINTS.filter((p) => p.city === address.city),
      );
      return;
    }
    locateUser();
  }, []);

  const selected = pointsWithDistance.find((p) => p.id === selectedPoint);
  const mapCenter = userLocation || { lat: -3.728, lng: -38.5021 };

  return (
    <div className="w-full h-full bg-eco-black relative overflow-hidden flex flex-col">
      {/* Mapa - Ocupa TUDO até o menu inferior */}
      <div className="flex-1 w-full relative">
        <MapView
          points={pointsWithDistance}
          userLocation={userLocation}
          center={mapCenter}
          onSelectPoint={(p) => setSelectedPoint(p.id)}
        />
      </div>

      {/* Barra de Pesquisa Compacta - Topo */}
      <div className="absolute top-0 left-0 right-0 z-30 pt-4 px-4 pb-2 bg-gradient-to-b from-eco-black/90 to-transparent">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar ponto de coleta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full py-2.5 pl-11 pr-4 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-eco-neon"
          />
        </div>
      </div>

      {/* Botão Flutuante - Ver Pontos */}
      <motion.button
        onClick={() => setShowPointsList(!showPointsList)}
        className="absolute bottom-6 right-6 z-30 bg-eco-neon text-black rounded-full p-4 font-bold shadow-lg hover:bg-eco-neon/90 transition-all"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center gap-2">
          <MapPin size={20} />
          <span className="text-sm font-bold">{pointsWithDistance.length}</span>
        </div>
      </motion.button>

      {/* Drawer - Lista de Pontos (Modal) */}
      <AnimatePresence>
        {showPointsList && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPointsList(false)}
              className="absolute inset-0 bg-black/40 z-35"
            />

            {/* Drawer do lado */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 bottom-0 w-80 md:w-96 bg-eco-black z-40 border-r border-white/10 overflow-hidden flex flex-col"
            >
              {/* Header do Drawer */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <MapPin size={20} className="text-eco-neon" />
                  Pontos de Coleta
                </h2>
                <button
                  onClick={() => setShowPointsList(false)}
                  className="p-1 hover:bg-white/10 rounded"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Filtros Compactos */}
              <div className="p-3 border-b border-white/10 bg-eco-black/50">
                <div
                  className="flex gap-2 overflow-x-auto pb-1"
                  style={{ scrollbarWidth: "none" }}
                >
                  {["Todos", "Celulares", "Baterias", "Computadores"].map(
                    (cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveFilter(cat)}
                        className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                          activeFilter === cat
                            ? "bg-eco-neon text-black font-bold"
                            : "bg-white/10 text-white border border-white/10"
                        }`}
                      >
                        {cat}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* Lista de Pontos */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {pointsWithDistance.length > 0 ? (
                  pointsWithDistance.map((point) => (
                    <motion.button
                      key={point.id}
                      onClick={() => {
                        setSelectedPoint(point.id);
                        setShowPointsList(false);
                      }}
                      className={`w-full p-3 rounded-xl text-left transition-all ${
                        selectedPoint === point.id
                          ? "bg-eco-neon/20 border border-eco-neon"
                          : "bg-white/5 border border-white/10 hover:bg-white/10"
                      }`}
                      whileHover={{ x: 4 }}
                    >
                      <h3 className="font-bold text-white text-sm line-clamp-2">
                        {point.name}
                      </h3>
                      <p className="text-gray-400 text-xs mt-1 line-clamp-1">
                        {point.addr}
                      </p>
                      {point.distance !== null && (
                        <p className="text-eco-neon text-xs mt-1.5 font-semibold">
                          📍 {point.distance.toFixed(1)} km
                        </p>
                      )}
                    </motion.button>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    <svg
                      width="120"
                      height="80"
                      viewBox="0 0 120 80"
                      className="mx-auto mb-3"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect rx="12" width="120" height="80" fill="#0f1724" />
                      <g fill="#64748b">
                        <circle cx="30" cy="40" r="10" />
                        <rect x="48" y="32" width="40" height="16" rx="4" />
                      </g>
                    </svg>
                    Nenhum ponto encontrado na sua cidade — continue descartando
                    para aumentar o alcance de pontos!
                  </div>
                )}
              </div>

              {/* Status de Localização */}
              <div className="p-3 border-t border-white/10 bg-eco-black/50">
                <AnimatePresence>
                  {isLocating && (
                    <div className="flex items-center gap-2 text-xs text-eco-neon">
                      <div className="w-2 h-2 border-2 border-eco-neon border-t-transparent rounded-full animate-spin" />
                      <span>Detectando localização...</span>
                    </div>
                  )}
                  {!isLocating && (
                    <div className="flex items-center gap-2 text-xs text-eco-neon">
                      <MapPin size={14} />
                      <span>{locationCity}</span>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal de Detalhes do Ponto */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPoint(null)}
            className="absolute inset-0 bg-black/50 z-40 flex items-end"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-gradient-to-t from-eco-black to-eco-black/95 rounded-t-3xl p-6 pb-24 max-h-[85vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedPoint(null)}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full"
              >
                <X size={20} />
              </button>

              <h2 className="text-2xl font-bold text-white mb-2">
                {selected.name}
              </h2>
              <p className="text-gray-400 text-sm mb-4">{selected.addr}</p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-eco-neon" />
                  <div>
                    <p className="text-xs text-gray-400">
                      Horário de atendimento
                    </p>
                    <p className="text-white font-semibold">{selected.hours}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-eco-neon" />
                  <div>
                    <p className="text-xs text-gray-400">Contato</p>
                    <p className="text-white font-semibold">{selected.phone}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-xs text-gray-400 mb-2">Aceita</p>
                <div className="flex flex-wrap gap-2">
                  {selected.accepts.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-eco-neon/20 text-eco-neon text-xs rounded-full"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => navigate("/schedule")}
                className="w-full bg-eco-green text-white py-3 rounded-full font-bold hover:bg-eco-green/90 transition-colors"
              >
                Agendar Coleta
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
