import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { Home, Calendar, MapPin, Gift, User } from "lucide-react";
import { useStore } from "../store";

export const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useStore();

  const tabs = [
    { id: "home", icon: Home, label: "Início", path: "/dashboard" },
    { id: "schedule", icon: Calendar, label: "Agendar", path: "/schedule" },
    { id: "map", icon: MapPin, label: "Mapa", path: "/map" },
    { id: "rewards", icon: Gift, label: "Recompensas", path: "/rewards" },
    { id: "profile", icon: User, label: "Perfil", path: "/profile" },
  ];

  const isPublicPage = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/terms",
    "/privacy",
  ].includes(location.pathname);
  const isMapPage = location.pathname.includes("/map");

  useEffect(() => {
    if (!user && !isPublicPage) {
      navigate("/login", { replace: true });
    }
  }, [user, location.pathname, isPublicPage, navigate]);

  // ─── Breakpoint detection ────────────────────────────────────────────────
  // sm  < 768  → phone shell (moldura centralizada)
  // md  768–1023 → tablet (fullscreen, bottom nav)
  // lg  ≥ 1024  → desktop (fullscreen, sidebar nav)
  const [bp, setBp] = useState<"phone" | "tablet" | "desktop">(() => {
    if (typeof window === "undefined") return "phone";
    if (window.innerWidth >= 1024) return "desktop";
    if (window.innerWidth >= 768) return "tablet";
    return "phone";
  });

  useEffect(() => {
    const update = () => {
      if (window.innerWidth >= 1024) setBp("desktop");
      else if (window.innerWidth >= 768) setBp("tablet");
      else setBp("phone");
    };
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // ─── PHONE layout (original: moldura centralizada) ───────────────────────
  if (bp === "phone") {
    return (
      <div className="flex justify-center min-h-screen bg-black w-full">
        <div className="w-full max-w-[393px] h-[100dvh] bg-eco-black text-eco-white relative shadow-2xl shadow-eco-neon/20 ring-1 ring-white/10 flex flex-col">
          {isMapPage ? (
            <div
              className="flex-1 overflow-hidden"
              style={{ height: "calc(100% - 80px)", minHeight: 0 }}
            >
              <Outlet />
            </div>
          ) : (
            <div
              className={`flex-1 overflow-y-auto overflow-x-hidden ${!isPublicPage ? "pb-[80px]" : ""}`}
              style={{ minHeight: 0 }}
            >
              <Outlet />
            </div>
          )}

          {!isPublicPage && (
            <div className="h-[80px] bg-eco-black/90 backdrop-blur-md border-t border-white/10 flex items-center justify-around px-2 z-50 flex-shrink-0">
              {tabs.map((tab) => {
                const isActive = location.pathname.includes(tab.path);
                return (
                  <button
                    key={tab.id}
                    onClick={() => navigate(tab.path)}
                    className={`flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all duration-300 ${isActive ? "text-eco-neon scale-110" : "text-gray-500 hover:text-gray-400"}`}
                  >
                    <div
                      className={`relative p-1 ${isActive ? "bg-eco-neon/10 rounded-xl" : ""}`}
                    >
                      <tab.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                      {isActive && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-eco-neon rounded-full" />
                      )}
                    </div>
                    <span className="text-[10px] mt-1 font-medium font-body">
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── TABLET layout (fullscreen, bottom nav maior) ────────────────────────
  if (bp === "tablet") {
    return (
      <div className="flex flex-col w-full h-[100dvh] bg-eco-black text-eco-white">
        {isMapPage ? (
          <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
            <Outlet />
          </div>
        ) : (
          <div
            className={`flex-1 overflow-y-auto overflow-x-hidden ${!isPublicPage ? "pb-[80px]" : ""}`}
            style={{ minHeight: 0 }}
          >
            <Outlet />
          </div>
        )}

        {!isPublicPage && (
          <div className="h-[80px] bg-eco-black/95 backdrop-blur-md border-t border-white/10 flex items-center justify-around px-8 z-50 flex-shrink-0">
            {tabs.map((tab) => {
              const isActive = location.pathname.includes(tab.path);
              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.path)}
                  className={`flex flex-col items-center justify-center px-6 h-14 rounded-2xl transition-all duration-300 ${isActive ? "text-eco-neon" : "text-gray-500 hover:text-gray-300"}`}
                >
                  <div
                    className={`relative p-1.5 ${isActive ? "bg-eco-neon/10 rounded-xl" : ""}`}
                  >
                    <tab.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                    {isActive && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-eco-neon rounded-full" />
                    )}
                  </div>
                  <span className="text-xs mt-1 font-medium font-body">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ─── DESKTOP layout (sidebar fixa à esquerda) ────────────────────────────
  return (
    <div className="flex w-full h-[100dvh] bg-eco-black text-eco-white">
      {/* Sidebar */}
      {!isPublicPage && (
        <aside className="w-64 h-full bg-eco-black border-r border-white/10 flex flex-col flex-shrink-0 z-50">
          {/* Logo */}
          <div className="px-6 py-8 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-eco-neon/20 border border-eco-neon/30 flex items-center justify-center">
                <span className="text-eco-neon font-bold text-lg">E</span>
              </div>
              <div>
                <p className="font-display font-bold text-white text-lg leading-none">
                  EcoByte
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Descarte inteligente
                </p>
              </div>
            </div>
          </div>

          {/* Nav items */}
          <nav className="flex-1 px-3 py-6 space-y-1">
            {tabs.map((tab) => {
              const isActive = location.pathname.includes(tab.path);
              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                    isActive
                      ? "bg-eco-neon/15 text-eco-neon border border-eco-neon/20"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <tab.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="font-medium text-sm">{tab.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-eco-neon" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer da sidebar */}
          <div className="px-6 py-6 border-t border-white/10">
            <p className="text-[11px] text-gray-600 leading-relaxed">
              © 2025 EcoByte
              <br />
              <span className="text-eco-neon/60">
                Descarte hoje. Transforme o amanhã.
              </span>
            </p>
          </div>
        </aside>
      )}

      {/* Conteúdo principal */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {isMapPage ? (
          <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
            <Outlet />
          </div>
        ) : (
          <div
            className="flex-1 overflow-y-auto overflow-x-hidden"
            style={{ minHeight: 0 }}
          >
            <Outlet />
          </div>
        )}
      </main>
    </div>
  );
};
