Design a complete mobile app called **EcoByte** — a sustainability platform for e-waste collection, gamification, and rewards. The app connects users to the nearest certified electronic recycling drop-off points via geolocation, educates them on proper disposal, and rewards eco-friendly behavior with redeemable points.

---

## 🎨 VISUAL IDENTITY & DESIGN SYSTEM

**Primary Palette:**
- Deep Black: #0D0D0D
- Forest Green: #1A7A3C
- Neon Eco Green: #2ECC71
- Pure White: #FFFFFF
- Soft Mint (cards/backgrounds): #F0FAF4
- Amber Accent (badges/alerts): #F5A623

**Typography:**
- Display/Headlines: Clash Display or Syne — bold, modern, geometric
- Body text: DM Sans or Plus Jakarta Sans — clean, readable
- Data/Numbers (points, stats): Space Mono — techy, distinctive

**Design Style:**
- Dark mode as the primary version + Clean light mode as secondary
- Glassmorphism cards on dark backgrounds (backdrop-blur, semi-transparent green tints)
- Organic shapes mixed with sharp UI elements (leaf motifs in backgrounds, hexagonal badges)
- Micro-detail: subtle circuit-board patterns on dark sections to represent "tech meets nature"
- Rounded corners: 16–24px on cards, 100px on buttons (pill shape)
- Depth through layered shadows with green tints

---

## 📱 SCREENS TO DESIGN (12 screens minimum)

---

### SCREEN 01 — Splash / Onboarding
- Animated logo: "EcoByte" with a lightning bolt morphing into a leaf
- Dark background with glowing green circuit-board texture
- Tagline: *"Descarte hoje. Transforme o amanhã."*
- Progress dots at the bottom (3-step onboarding)
- CTA button: "Começar" (pill, Neon Green)
- Secondary link: "Já tenho uma conta"
- Include 3 onboarding slides:
  1. "Encontre o ponto mais próximo" — map/pin illustration
  2. "Descarte e ganhe pontos" — coin/leaf illustration
  3. "Troque por recompensas reais" — gift card illustration

---

### SCREEN 02 — Login
- "Bem-vindo de volta!" headline, Clash Display
- Email + Password fields with glowing green focus states
- "Esqueci minha senha" link
- Social login: Google + Apple (outlined buttons)
- "Entrar" CTA (full-width pill, Forest Green)
- "Ainda não tem conta? Cadastre-se" footer link

---

### SCREEN 03 — Cadastro / Criar Conta
- Step indicator: 1 of 2
- Fields: Nome completo, E-mail, Senha, Confirmar senha
- Password strength indicator (visual bar, green gradient)
- Checkbox: Terms + Privacy Policy
- "Cadastrar" CTA
- Optional: Avatar picker (emoji-style eco characters)

---

### SCREEN 04 — Home / Dashboard
- Personalized greeting: "Olá, Lucas! 👋 Vamos fazer diferença hoje?"
- **Impact Banner** (glassmorphism card, dark green):
  - "Seu impacto ecológico"
  - Large number: "12 itens descartados"
  - Sub-stat: "48 kg de CO₂ evitados"
  - Animated green Earth icon
  - Weekly streak badge: 🔥 "5 semanas consecutivas!"
- **EcoScore** card: circular progress ring (green), current level "EcoWarrior Lv.3"
- **Quick Actions** grid (2x2, icon cards):
  - 📅 Agendar Coleta
  - 📍 Pontos de Coleta
  - 🎁 Minhas Recompensas
  - ♻️ Como Descartar?
- **Desafios da Semana** horizontal scroll:
  - "Descarte 1 bateria" — 50pts — progress bar
  - "Indique um amigo" — 100pts — locked
- **Feed de Novidades**: partner offers, eco tips
- Bottom tab bar: Início | Agendar | Mapa | Recompensas | Perfil

---

### SCREEN 05 — Agendar Coleta: Escolha o Tipo de Item
- Title: "O que você quer descartar?"
- Subtitle: "Selecione um ou mais itens"
- Filterable item list with icons + checkboxes:
  - 📱 Celular / Smartphone
  - 🔋 Baterias / Pilhas
  - 💻 Notebook / Computador
  - 🖥️ Monitor / TV
  - 🖨️ Impressora
  - 🎧 Acessórios e Cabos
  - ⌨️ Teclados / Mouses
  - 📷 Câmeras e equipamentos
  - 🔌 Carregadores
  - 📦 Outros eletrônicos
- Each item shows **estimated EcoPoints** reward badge (e.g., "+30 pts")
- Search/filter bar at top
- "Continuar" CTA at bottom (sticky)

---

### SCREEN 06 — Agendar Coleta: Calendário
- Title: "Escolha a data e horário"
- Month calendar (custom styled, dark/green theme)
- Highlighted available days in green
- Selected day: filled Neon Green circle
- Time slots: pill buttons in a horizontal scroll (08:00 | 10:00 | 14:00 | 16:00 | 18:00)
- Selected slot: filled green
- Availability indicator: "Alta disponibilidade" (green dot) / "Últimas vagas" (amber dot)
- "Continuar" CTA

---

### SCREEN 07 — Agendar Coleta: Endereço
- Title: "Informe o endereço de coleta"
- CEP field with auto-complete magnifier icon
- Address fields: Rua, Número, Complemento (opcional), Bairro, Cidade, Estado
- Map preview card (mini map showing pin location)
- Option: "Usar localização atual" (GPS icon)
- Saved addresses dropdown: "Usar endereço salvo"
- "Continuar" CTA

---

### SCREEN 08 — Resumo do Agendamento
- Title: "Tudo certo! Confira os detalhes"
- Summary card (glassmorphism):
  - 📅 Data e horário
  - 📍 Endereço
  - ♻️ Itens selecionados (with icons)
  - 🟢 EcoPoints a receber: "+120 pts"
- Observações (optional text area)
- CO₂ impact preview: "Você vai evitar 3.2 kg de CO₂!"
- Two CTAs: "Editar" (outlined) + "Confirmar agendamento" (filled green)

---

### SCREEN 09 — Agendamento Confirmado (Success)
- Full screen celebration moment:
  - Animated confetti in green/white tones
  - Large ✅ icon with pulsing green glow
  - "Agendamento realizado!" headline
  - Date/time highlighted in Neon Green
  - "+120 EcoPoints adicionados!" animated counter
  - Sub-message: "Confirmação enviada para seu e-mail"
- CTAs: "Ver meus agendamentos" + "Voltar ao início"

---

### SCREEN 10 — Meus Agendamentos
- Tab bar: "Próximos" | "Concluídos" | "Cancelados"
- **Próximos**: card with green "Agendado" badge, date, address, items list, arrow
  - Option to "Reagendar" or "Cancelar"
- **Concluídos**: card with gray "Concluído" badge + earned points shown in green
- Empty state: cute eco-robot illustration + "Nada por aqui ainda"
- Pull-to-refresh indicator (green spinner)

---

### SCREEN 11 — Mapa de Pontos de Coleta
- Full-screen map (dark styled: Mapbox dark theme or custom dark map)
- Custom green map pins (leaf-shaped or hexagonal)
- "Ponto Verde Tech" info card at bottom (peek/drawer):
  - Name, address, distance ("0.3 km de você")
  - Accepted items icons
  - Status badge: "Aberto até 18:00" (green) / "Fechado" (red)
  - Button: "Como chegar" + "Agendar aqui"
- Filter chips at top: Todos | Celulares | Baterias | Computadores | etc.
- Search bar: "Buscar por endereço ou lugar"
- My Location blue dot with green pulse animation
- Cluster pins for dense areas

---

### SCREEN 12 — Recompensas / EcoStore
- Title: "Suas Recompensas"
- **EcoPoints Balance** hero card:
  - Large number: "1.240 pts"
  - Level badge: "EcoWarrior 🌿"
  - Progress bar to next level: "560 pts para EcoChampion"
- **Categorias** horizontal chips: Todos | Gift Cards | Apps | Descontos | Doações
- **Reward cards** grid:
  - Partner logo + reward name
  - Points cost: "500 pts"
  - "Resgatar" CTA (green pill)
  - Tags: "🔥 Popular" | "⚡ Últimas unidades"
- Examples:
  - 🛒 R$20 em Mercado Livre — 800 pts
  - 🎵 1 mês Spotify Premium — 600 pts
  - 🍕 Ifood voucher R$15 — 500 pts
  - 🌳 Plante uma árvore (doação) — 200 pts
  - 💳 Gift card Amazon R$50 — 1200 pts
- Redemption history link at bottom

---

### SCREEN 13 — Como Descartar? (Guia)
- Title: "Guia de descarte correto"
- Search bar
- Categories with icons (horizontal scroll)
- Item detail cards (expandable accordion):
  - Item name + icon
  - "⚠️ Não descarte no lixo comum"
  - Step-by-step disposal guide
  - "Quais pontos aceitam este item" button
  - Environmental impact fact: "Celulares contêm metais pesados que contaminam o solo por até 500 anos"
- Fun facts banner: animated eco-tips carousel
- "Compartilhe este guia" social share button

---

### SCREEN 14 — Perfil do Usuário
- Header: dark green gradient + avatar (initials circle or photo)
- Name, email, edit icon
- **Stats row**: Itens descartados | CO₂ evitado | EcoPoints totais
- **Badge showcase**: earned achievement badges (hexagonal icons)
- Menu list:
  - Meus dados
  - Endereços cadastrados
  - Formas de pagamento
  - Notificações
  - Indique um amigo (+100 pts)
  - Ajuda e suporte
  - Sobre o app
  - Sair da conta (red, bottom)
- Dark/Light mode toggle in settings

---

## 🧩 COMPONENTS & DESIGN TOKENS

Design and document these reusable components:
- EcoPoints badge (animated counter variant)
- Item chip (selectable, with icon + points)
- Collection point card (map drawer version)
- Reward card (grid + list variants)
- Progress ring (EcoScore circular indicator)
- Achievement badge (hexagonal, locked/unlocked states)
- Bottom tab bar (5 tabs, active = green glow)
- Status badge (Agendado | Concluído | Cancelado | Aberto | Fechado)
- Notification toast (success, warning, error — eco-styled)
- Empty state illustration cards

---

## ✨ MICRO-INTERACTIONS & MOTION NOTES

- Splash: logo morph animation (bolt → leaf)
- Points counter: animated number roll on earn/spend
- Map pins: drop-in animation on load, pulse on selection
- Confirmation screen: confetti burst + points count-up
- Badge unlock: glow + scale pop animation
- Bottom nav: smooth active indicator slide
- Cards: subtle lift on tap (scale 0.97)
- Streak badge: fire flicker animation

---

## 📐 SPECS

- Frame: iPhone 14 Pro (393 x 852px)
- Corner radius system: 8 | 12 | 16 | 24 | 100px
- Spacing grid: 8px base unit
- Safe areas: 59px top (Dynamic Island) | 34px bottom
- Component library: Auto Layout everywhere
- Export: both dark mode and light mode versions for all screens