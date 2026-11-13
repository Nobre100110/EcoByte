import React, { useState, useEffect, useRef } from "react";
import { useStore } from "../store";
import {
  Settings,
  LogOut,
  ChevronRight,
  User as UserIcon,
  MapPin,
  HelpCircle,
  Info,
  X,
  Camera,
  Lock,
  UserPlus,
  CalendarDays,
  Recycle,
  Gift,
  Mail,
  MessageCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import type { AccessibilityPreferences } from "../store";
import { clearSession, getAccounts, saveAccounts } from "../utils/storage";
import { isSupabaseConfigured, supabase } from "../../config/supabase";

const profileEnv = (
  import.meta as ImportMeta & {
    env: Record<string, string | undefined>;
  }
).env;
const ecobyteLogo = new URL("../logo.png", import.meta.url).href;
const SUPPORT_EMAIL =
  profileEnv.VITE_ECOBYTE_SUPPORT_EMAIL || "support@ecobyte.app";
const SUPPORT_WHATSAPP_NUMBER = (
  profileEnv.VITE_ECOBYTE_SUPPORT_WHATSAPP || ""
).replace(/\D/g, "");
const SUPPORT_WHATSAPP_URL =
  SUPPORT_WHATSAPP_NUMBER.length >= 10 && SUPPORT_WHATSAPP_NUMBER.length <= 15
    ? `https://wa.me/${SUPPORT_WHATSAPP_NUMBER}`
    : null;

type PreferenceChoice<T extends string> = {
  value: T;
  label: string;
  description: string;
};

type PreferenceSelectorProps<T extends string> = {
  name: string;
  legend: string;
  description: string;
  value: T;
  options: PreferenceChoice<T>[];
  onChange: (value: T) => void;
};

const PreferenceSelector = <T extends string>({
  name,
  legend,
  description,
  value,
  options,
  onChange,
}: PreferenceSelectorProps<T>) => (
  <fieldset className="space-y-2">
    <legend className="text-sm font-semibold text-white">{legend}</legend>
    <p id={`${name}-description`} className="text-sm text-gray-400">
      {description}
    </p>
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {options.map((option) => {
        const id = `${name}-${option.value}`;
        const selected = value === option.value;

        return (
          <label
            key={option.value}
            htmlFor={id}
            className={`flex min-w-0 cursor-pointer items-start gap-3 rounded-xl border p-3 transition focus-within:ring-2 focus-within:ring-eco-neon focus-within:ring-offset-2 focus-within:ring-offset-eco-black ${
              selected
                ? "border-eco-neon/60 bg-eco-neon/10"
                : "border-white/10 bg-white/5 hover:border-white/25"
            }`}
          >
            <input
              id={id}
              type="radio"
              name={name}
              value={option.value}
              checked={selected}
              onChange={() => onChange(option.value)}
              aria-describedby={`${name}-description ${id}-description`}
              className="mt-1 h-4 w-4 shrink-0 accent-eco-neon"
            />
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center justify-between gap-1 text-sm font-medium text-white">
                {option.label}
                {selected && (
                  <span className="text-xs font-semibold text-eco-neon">
                    Ativo
                  </span>
                )}
              </span>
              <span
                id={`${id}-description`}
                className="mt-1 block text-xs leading-5 text-gray-400"
              >
                {option.description}
              </span>
            </span>
          </label>
        );
      })}
    </div>
  </fieldset>
);

const appearanceOptions: PreferenceChoice<
  AccessibilityPreferences["appearance"]
>[] = [
  { value: "dark", label: "Modo Escuro", description: "Tema escuro padrão." },
  {
    value: "light",
    label: "Modo Claro",
    description: "Fundos claros e texto escuro.",
  },
  {
    value: "colorblind",
    label: "Modo Daltônico",
    description: "Paleta com cores mais distinguíveis.",
  },
];

const contrastOptions: PreferenceChoice<
  AccessibilityPreferences["contrast"]
>[] = [
  {
    value: "standard",
    label: "Padrão",
    description: "Contraste original do tema.",
  },
  {
    value: "high",
    label: "Alto",
    description: "Reforça textos, bordas e controles.",
  },
  {
    value: "maximum",
    label: "Máximo",
    description: "Diferenças visuais ainda mais fortes.",
  },
];

const textSizeOptions: PreferenceChoice<
  AccessibilityPreferences["textSize"]
>[] = [
  {
    value: "small",
    label: "Pequeno",
    description: "Texto compacto e legível.",
  },
  {
    value: "normal",
    label: "Normal",
    description: "Tamanho original da aplicação.",
  },
  {
    value: "large",
    label: "Grande",
    description: "Texto ampliado proporcionalmente.",
  },
];

export const Profile = () => {
  const {
    user,
    setUser,
    address,
    saveAddress,
    saveHelpTicket,
    helpTickets,
    addNotification,
    accessibilityPreferences,
    updateAccessibilityPreferences,
  } = useStore();
  const navigate = useNavigate();

  // Edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [editAge, setEditAge] = useState(user?.age?.toString() || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(
    user?.profilePhoto || null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Other modals
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const [addressForm, setAddressForm] = useState(
    () =>
      address || {
        state: "",
        municipality: "",
        city: "",
        neighborhood: "",
        street: "",
        number: "",
        cep: "",
      },
  );
  const [helpText, setHelpText] = useState("");
  const [supportName, setSupportName] = useState(user?.name || "");
  const [supportEmail, setSupportEmail] = useState(user?.email || "");
  const [supportSubject, setSupportSubject] = useState("");
  const [supportFeedback, setSupportFeedback] = useState("");
  const [preparedSupportEmail, setPreparedSupportEmail] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (isAddressOpen) {
      setAddressForm(
        address || {
          state: "",
          municipality: "",
          city: "",
          neighborhood: "",
          street: "",
          number: "",
          cep: "",
        },
      );
    }
  }, [isAddressOpen, address]);

  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditAge(user.age?.toString() || "");
      setPhone(user.phone || "");
      setProfilePhoto(user.profilePhoto || null);
      setSupportName(user.name);
      setSupportEmail(user.email);
    }
  }, [user]);

  if (!user) return null;

  const handleLogout = async () => {
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.warn("Logout do Supabase falhou, usando fallback local.", error);
    } finally {
      setUser(null);
      clearSession();
      navigate("/login", { replace: true });
    }
  };

  const handleProfilePhotoSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setProfilePhoto(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedName = editName.trim();
    if (!normalizedName) {
      return;
    }

    const updatedAge = editAge ? parseInt(editAge, 10) : undefined;
    const updatedPhone = phone.trim();
    const updatedPhoto = profilePhoto || undefined;
    const hasChanges =
      user.name !== normalizedName ||
      user.age !== updatedAge ||
      user.phone !== updatedPhone ||
      user.profilePhoto !== updatedPhoto;
    const updatedUser = {
      ...user,
      name: normalizedName,
      age: updatedAge,
      phone: updatedPhone,
      profilePhoto: updatedPhoto,
    };
    setUser(updatedUser);

    const accounts = getAccounts<any[]>();
    const accIndex = accounts.findIndex(
      (acc: { email: string }) => acc.email === user.email,
    );
    if (accIndex !== -1) {
      accounts[accIndex] = {
        ...accounts[accIndex],
        ...updatedUser,
        email: user.email,
        password: accounts[accIndex].password,
      };
      saveAccounts(accounts);
    }

    if (hasChanges) {
      addNotification(
        "Dados da conta atualizados",
        "As informações do seu perfil foram alteradas.",
        {
          category: "account",
          eventKey: `profile-details-updated:${user.email}:${Date.now()}`,
        },
      );
    }

    setIsEditModalOpen(false);
  };

  const fetchAddressFromCep = async (cepValue: string) => {
    const cleanCep = cepValue.replace(/\D/g, "");
    if (cleanCep.length !== 8) return addressForm;

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cleanCep}/json/`,
      );
      const data = await response.json();
      if (!data || data.erro) return addressForm;

      const updatedForm = {
        ...addressForm,
        street: data.logradouro || addressForm.street,
        neighborhood: data.bairro || addressForm.neighborhood,
        city: data.localidade || addressForm.city,
        state: data.uf || addressForm.state,
        municipality:
          data.localidade || addressForm.municipality || addressForm.city,
      };
      setAddressForm(updatedForm);
      return updatedForm;
    } catch (error) {
      console.warn("Erro ao buscar CEP", error);
      return addressForm;
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCep = (addressForm.cep || "").replace(/\D/g, "");
    const addressToSave =
      cleanCep.length === 8
        ? await fetchAddressFromCep(addressForm.cep || "")
        : addressForm;

    saveAddress(addressToSave);
    setIsAddressOpen(false);
  };

  const handleSendHelp = (e: React.FormEvent) => {
    e.preventDefault();
    const ticket = saveHelpTicket({
      name: supportName,
      email: supportEmail,
      subject: supportSubject,
      description: helpText,
    });
    if (!ticket) {
      setSupportFeedback(
        "Confira os campos e descreva o pedido com ao menos 8 caracteres.",
      );
      return;
    }

    const mailSubject = encodeURIComponent(
      `[EcoByte] ${supportSubject.trim()}`,
    );
    const mailBody = encodeURIComponent(
      `Nome: ${supportName.trim()}\nE-mail para contato: ${supportEmail.trim()}\nIdentificação local: ${ticket.id}\n\n${helpText.trim()}`,
    );
    setPreparedSupportEmail(
      `mailto:${SUPPORT_EMAIL}?subject=${mailSubject}&body=${mailBody}`,
    );
    setSupportFeedback(
      `Rascunho ${ticket.id} salvo neste dispositivo. Ele ainda não foi enviado à equipe.`,
    );
  };

  const menuItems = [
    {
      icon: UserIcon,
      label: "Meus dados",
      onClick: () => setIsEditModalOpen(true),
    },
    {
      icon: MapPin,
      label: "Dados cadastrados",
      onClick: () => setIsAddressOpen(true),
    },
    {
      icon: HelpCircle,
      label: "Ajuda e Suporte",
      onClick: () => setIsHelpOpen(true),
    },
    {
      icon: Info,
      label: "Sobre o aplicativo",
      onClick: () => setIsAboutOpen(true),
    },
  ];

  return (
    <div className="min-h-full w-full bg-eco-black pt-6 pb-6 flex flex-col relative overflow-hidden">
      <div className="md:max-w-2xl md:mx-auto md:w-full flex-1 flex flex-col px-4 sm:px-6 md:px-0">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-eco-neon">
              Perfil
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-white">
              {user.name}
            </h1>
          </div>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-gray-400 transition hover:bg-white/10"
          >
            <Settings size={18} />
          </button>
        </div>

        <div className="mb-4 rounded-[24px] border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-eco-neon/40 bg-eco-green/20 text-xl font-semibold text-white">
              {user.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt="Perfil"
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user.email}</p>
              <p className="text-sm text-gray-400">
                {user.age ? `${user.age} anos` : "Perfil ativo"}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl border border-white/10 bg-eco-black/40 p-3 text-center">
            <p className="text-lg font-semibold text-white">
              {user.itemsDisposed}
            </p>
            <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400">
              Itens
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-eco-black/40 p-3 text-center">
            <p className="text-lg font-semibold text-eco-neon">
              {user.co2Saved}
            </p>
            <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400">
              CO₂
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-eco-black/40 p-3 text-center">
            <p className="text-lg font-semibold text-eco-amber">
              {user.points}
            </p>
            <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400">
              Pts
            </p>
          </div>
        </div>

        <div className="mb-4 space-y-2">
          {menuItems.slice(0, 2).map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-eco-black/50 text-gray-400">
                  <item.icon size={16} />
                </div>
                <span className="text-sm font-medium text-white">
                  {item.label}
                </span>
              </div>
              <ChevronRight size={16} className="text-gray-600" />
            </button>
          ))}

          <details className="group rounded-2xl border border-white/10 bg-white/5">
            <summary className="flex cursor-pointer list-none items-center justify-between rounded-2xl px-4 py-3 text-left [&::-webkit-details-marker]:hidden">
              <span className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-eco-black/50 text-gray-400">
                  <Settings size={16} />
                </span>
                <span className="text-sm font-medium text-white">
                  Aparência e Acessibilidade
                </span>
              </span>
              <ChevronRight
                size={16}
                className="text-gray-600 transition-transform group-open:rotate-90"
              />
            </summary>

            <div className="space-y-6 border-t border-white/10 px-4 py-4">
              <section aria-labelledby="appearance-heading">
                <h2
                  id="appearance-heading"
                  className="text-lg font-semibold text-white"
                >
                  Aparência
                </h2>
                <p className="mb-4 mt-1 text-sm text-gray-400">
                  Escolha como o EcoByte é exibido.
                </p>
                <PreferenceSelector
                  name="appearance"
                  legend="Tema"
                  description="A mudança é aplicada imediatamente."
                  value={accessibilityPreferences.appearance}
                  options={appearanceOptions}
                  onChange={(appearance) =>
                    updateAccessibilityPreferences({ appearance })
                  }
                />
              </section>

              <section
                aria-labelledby="accessibility-heading"
                className="border-t border-white/10 pt-5"
              >
                <h2
                  id="accessibility-heading"
                  className="text-lg font-semibold text-white"
                >
                  Acessibilidade
                </h2>
                <p className="mb-4 mt-1 text-sm text-gray-400">
                  Ajuste contraste e legibilidade do texto.
                </p>
                <div className="space-y-5">
                  <PreferenceSelector
                    name="contrast"
                    legend="Contraste"
                    description="Aumenta a distinção entre conteúdo e interface."
                    value={accessibilityPreferences.contrast}
                    options={contrastOptions}
                    onChange={(contrast) =>
                      updateAccessibilityPreferences({ contrast })
                    }
                  />
                  <PreferenceSelector
                    name="text-size"
                    legend="Tamanho do texto"
                    description="A escala também se adapta ao tamanho da tela."
                    value={accessibilityPreferences.textSize}
                    options={textSizeOptions}
                    onChange={(textSize) =>
                      updateAccessibilityPreferences({ textSize })
                    }
                  />
                </div>
              </section>
            </div>
          </details>

          {menuItems.slice(2).map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-eco-black/50 text-gray-400">
                  <item.icon size={16} />
                </div>
                <span className="text-sm font-medium text-white">
                  {item.label}
                </span>
              </div>
              <ChevronRight size={16} className="text-gray-600" />
            </button>
          ))}
        </div>

        <button
          onClick={handleLogout}
          className="mt-auto flex items-center justify-center gap-2 rounded-2xl bg-red-500/10 py-3 font-semibold text-red-500"
        >
          <LogOut size={18} />
          <span>Sair da conta</span>
        </button>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-eco-black border-t border-white/10 rounded-t-[32px] p-6 pb-12 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Editar Perfil</h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400"
                  aria-label="Fechar edição de perfil"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                {/* Foto de Perfil */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-eco-neon/50 bg-eco-green flex items-center justify-center">
                      {profilePhoto ? (
                        <img
                          src={profilePhoto}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-display font-bold text-3xl text-white">
                          {editName.charAt(0) || user.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-eco-neon rounded-full p-2 text-black shadow-lg"
                    >
                      <Camera size={14} />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleProfilePhotoSelect(file);
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-eco-neon"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">
                    Idade
                  </label>
                  <input
                    type="number"
                    value={editAge}
                    onChange={(e) => setEditAge(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-eco-neon"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                    <Lock size={11} /> Email (somente leitura)
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    readOnly
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 11);
                      const f = v
                        .replace(/^(\d{2})(\d)/, "($1) $2")
                        .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
                      setPhone(f);
                    }}
                    placeholder="(00) 00000-0000"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-eco-neon"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-eco-green text-white py-4 rounded-xl font-bold mt-4 active:scale-95 transition-transform"
                >
                  Salvar Alterações
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Address Modal */}
      <AnimatePresence>
        {isAddressOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-eco-black border-t border-white/10 rounded-t-[32px] p-6 pb-12 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Endereço Cadastrado</h3>
                <button
                  onClick={() => setIsAddressOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400"
                >
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSaveAddress} className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400">CEP</label>
                  <input
                    value={addressForm.cep}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 8);
                      const f =
                        v.length > 5
                          ? v.replace(/(\d{5})(\d{1,3})/, "$1-$2")
                          : v;
                      setAddressForm({ ...addressForm, cep: f });
                    }}
                    onBlur={(e) => fetchAddressFromCep(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        fetchAddressFromCep(
                          (e.target as HTMLInputElement).value,
                        );
                      }
                    }}
                    placeholder="00000-000"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-3 text-white focus:outline-none focus:border-eco-neon focus:ring-1 focus:ring-eco-neon"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Estado</label>
                  <select
                    value={addressForm.state}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, state: e.target.value })
                    }
                    style={{ backgroundColor: "#071316", color: "#f8fafc" }}
                    className="w-full border border-white/10 rounded-xl py-3 px-3 focus:outline-none focus:border-eco-neon appearance-none"
                  >
                    <option value="">Selecione o estado</option>
                    {[
                      "AC",
                      "AL",
                      "AP",
                      "AM",
                      "BA",
                      "CE",
                      "DF",
                      "ES",
                      "GO",
                      "MA",
                      "MT",
                      "MS",
                      "MG",
                      "PA",
                      "PB",
                      "PR",
                      "PE",
                      "PI",
                      "RJ",
                      "RN",
                      "RS",
                      "RO",
                      "RR",
                      "SC",
                      "SP",
                      "SE",
                      "TO",
                    ].map((s) => (
                      <option
                        key={s}
                        value={s}
                        style={{ backgroundColor: "#071316", color: "#f8fafc" }}
                      >
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400">Município</label>
                  <input
                    value={addressForm.municipality}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        municipality: e.target.value,
                      })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-3 text-white focus:outline-none focus:border-eco-neon"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Cidade</label>
                  <input
                    value={addressForm.city}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, city: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-3 text-white focus:outline-none focus:border-eco-neon"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Bairro</label>
                  <input
                    value={addressForm.neighborhood}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        neighborhood: e.target.value,
                      })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-3 text-white focus:outline-none focus:border-eco-neon"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400">Rua</label>
                    <input
                      value={addressForm.street}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          street: e.target.value,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-3 text-white focus:outline-none focus:border-eco-neon"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Número</label>
                    <input
                      value={addressForm.number}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          number: e.target.value,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-3 text-white focus:outline-none focus:border-eco-neon"
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-eco-green text-white py-3 rounded-xl font-bold active:scale-95 transition-transform"
                  >
                    Salvar Endereço
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Modal */}
      <AnimatePresence>
        {isHelpOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-eco-black border-t border-white/10 rounded-t-[32px] p-6 pb-12 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Ajuda e Suporte</h3>
                <button
                  onClick={() => setIsHelpOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-3 mb-3">
                {[
                  {
                    q: "Como descartar um celular?",
                    a: "Remova o chip e acondicione baterias separadamente. Leve ao ponto de coleta mais próximo.",
                  },
                  {
                    q: "Como acumular pontos?",
                    a: "Ao descartar eletrônicos em pontos cadastrados ou agendar coletas você ganha pontos conforme o item.",
                  },
                  {
                    q: "Como agendar?",
                    a: "Vá em Agendar Coleta, escolha os itens, a data, o horário e o ponto de coleta e siga as etapas de confirmação.",
                  },
                  {
                    q: "Troca de pontos por recompensas",
                    a: "Acesse Recompensas e troque seus pontos por vales ou descontos.",
                  },
                  {
                    q: "Posso cancelar um agendamento?",
                    a: "Sim, até 24h antes no histórico de agendamentos.",
                  },
                  {
                    q: "Privacidade",
                    a: "Seus dados são usados apenas para cadastro e comunicação de coletas.",
                  },
                ].map((item, i) => (
                  <details key={i} className="bg-white/5 p-3 rounded-xl">
                    <summary className="font-semibold cursor-pointer">
                      {item.q}
                    </summary>
                    <p className="text-sm text-gray-300 mt-2">{item.a}</p>
                  </details>
                ))}
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {SUPPORT_WHATSAPP_URL ? (
                  <a
                    href={`${SUPPORT_WHATSAPP_URL}?text=${encodeURIComponent("Olá, preciso de ajuda com o EcoByte.")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-w-0 items-center justify-center gap-2 rounded-xl bg-eco-neon px-3 py-3 text-center text-sm font-bold text-black"
                  >
                    <MessageCircle size={17} />
                    WhatsApp
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    aria-describedby="whatsapp-unavailable"
                    className="flex min-w-0 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-center text-sm text-gray-400"
                  >
                    <MessageCircle size={17} />
                    WhatsApp indisponível
                  </button>
                )}
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="flex min-w-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-center text-sm text-white"
                >
                  <Mail size={17} />
                  E-mail
                </a>
              </div>
              {!SUPPORT_WHATSAPP_URL && (
                <p
                  id="whatsapp-unavailable"
                  className="mt-2 text-xs text-gray-400"
                >
                  Número oficial de WhatsApp ainda não configurado.
                </p>
              )}
              <p className="mt-3 text-xs leading-5 text-gray-400">
                O formulário abre seu aplicativo de e-mail com os dados
                preenchidos. A mensagem só chega à equipe depois que você a
                enviar por lá.
              </p>
              <form onSubmit={handleSendHelp} className="mt-4 space-y-3">
                <div>
                  <label
                    htmlFor="support-name"
                    className="mb-1 block text-xs text-gray-400"
                  >
                    Nome
                  </label>
                  <input
                    id="support-name"
                    value={supportName}
                    onChange={(event) => {
                      setSupportName(event.target.value);
                      setPreparedSupportEmail(null);
                    }}
                    autoComplete="name"
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-eco-neon focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="support-email"
                    className="mb-1 block text-xs text-gray-400"
                  >
                    E-mail para contato
                  </label>
                  <input
                    id="support-email"
                    type="email"
                    value={supportEmail}
                    onChange={(event) => {
                      setSupportEmail(event.target.value);
                      setPreparedSupportEmail(null);
                    }}
                    autoComplete="email"
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-eco-neon focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="support-subject"
                    className="mb-1 block text-xs text-gray-400"
                  >
                    Assunto
                  </label>
                  <input
                    id="support-subject"
                    value={supportSubject}
                    onChange={(event) => {
                      setSupportSubject(event.target.value);
                      setPreparedSupportEmail(null);
                    }}
                    maxLength={120}
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-eco-neon focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="support-description"
                    className="mb-1 block text-xs text-gray-400"
                  >
                    Descrição do problema ou dúvida
                  </label>
                  <textarea
                    id="support-description"
                    value={helpText}
                    onChange={(event) => {
                      setHelpText(event.target.value);
                      setPreparedSupportEmail(null);
                    }}
                    minLength={8}
                    maxLength={2000}
                    required
                    className="min-h-24 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-eco-neon focus:outline-none"
                  />
                </div>
                {supportFeedback && (
                  <p
                    role="status"
                    aria-live="polite"
                    className="text-sm text-eco-mint"
                  >
                    {supportFeedback}
                  </p>
                )}
                {preparedSupportEmail && (
                  <a
                    href={preparedSupportEmail}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-eco-neon/40 bg-eco-neon/10 py-3 text-center text-sm font-semibold text-eco-neon"
                  >
                    <Mail size={17} />
                    Abrir e-mail para concluir o envio
                  </a>
                )}
                <button
                  type="submit"
                  className="w-full rounded-xl bg-eco-green py-3 font-bold text-white transition-transform active:scale-[0.99]"
                >
                  Salvar rascunho e preparar e-mail
                </button>
              </form>
              {helpTickets.length > 0 && (
                <section
                  aria-labelledby="support-history-heading"
                  className="mt-5 border-t border-white/10 pt-4"
                >
                  <h4
                    id="support-history-heading"
                    className="text-sm font-semibold text-white"
                  >
                    Registros neste dispositivo
                  </h4>
                  <div className="mt-2 space-y-2">
                    {helpTickets.slice(0, 5).map((ticket) => (
                      <div
                        key={ticket.id}
                        className="rounded-xl bg-white/5 p-3"
                      >
                        <p className="text-sm font-medium text-white">
                          {ticket.subject ||
                            ticket.text?.split("\n")[0] ||
                            "Solicitação anterior"}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {ticket.status === "draft_not_sent"
                            ? "Rascunho local · não enviado"
                            : "Registro local · sem status de envio"}
                          {" · "}
                          {new Date(ticket.createdAt).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* About Modal */}
      <AnimatePresence>
        {isAboutOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              transition={{ type: "spring", damping: 20, stiffness: 180 }}
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-eco-black p-5 sm:p-6"
            >
              <div className="flex items-center gap-4">
                <img
                  src={ecobyteLogo}
                  alt="Logo EcoByte"
                  className="h-20 w-20 shrink-0 rounded-xl object-contain sm:h-24 sm:w-24"
                />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-eco-neon">
                    Sobre o aplicativo
                  </p>
                  <h3 className="mt-1 text-2xl font-bold text-white">
                    EcoByte
                  </h3>
                  <p className="text-sm text-gray-400">Versão 1.0.0</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-gray-300">
                Plataforma para descarte responsável de eletrônicos, com pontos
                de coleta, EcoPontos e recompensas.
              </p>
              <ol className="mt-5 grid gap-2 sm:grid-cols-2">
                {[
                  {
                    icon: UserPlus,
                    title: "Crie sua conta",
                    description: "Acompanhe seu perfil e seu impacto.",
                  },
                  {
                    icon: CalendarDays,
                    title: "Agende uma coleta",
                    description: "Escolha os itens, horário e local.",
                  },
                  {
                    icon: Recycle,
                    title: "Descarte eletrônicos",
                    description: "Registre sua contribuição sustentável.",
                  },
                  {
                    icon: Gift,
                    title: "Resgate recompensas",
                    description: "Use seus EcoPontos no catálogo.",
                  },
                ].map(({ icon: StepIcon, title, description }, index) => (
                  <li
                    key={title}
                    className="flex min-w-0 items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-eco-neon/10 text-eco-neon">
                      <StepIcon size={18} aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold uppercase tracking-wider text-eco-neon">
                        {index + 1}. Etapa
                      </span>
                      <span className="mt-1 block text-sm font-semibold text-white">
                        {title}
                      </span>
                      <span className="mt-0.5 block text-xs leading-5 text-gray-400">
                        {description}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
              <button
                onClick={() => setIsAboutOpen(false)}
                className="mt-5 w-full rounded-xl bg-eco-green py-3 font-bold text-white transition-transform active:scale-95"
              >
                Fechar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
