# EcoByte - Integração Supabase

## 🚀 Início Rápido

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```
VITE_SUPABASE_URL=https://stefjkzdcaugjqwrqji.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-aqui

# Contatos de suporte opcionais
VITE_ECOBYTE_SUPPORT_EMAIL=support@ecobyte.app
# Configure apenas com o número oficial verificado, em formato internacional e somente dígitos.
# Sem essa variável, o botão do WhatsApp permanece indisponível.
VITE_ECOBYTE_SUPPORT_WHATSAPP=
```

O formulário de suporte salva um rascunho local por conta e abre um link `mailto` preenchido. Sem uma tabela/API de tickets ou integração de envio de e-mail, o aplicativo não confirma recebimento pela equipe.

### 2. Criar Tabelas no Supabase

No Supabase SQL Editor, execute:

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  age INTEGER,
  profile_photo TEXT,
  points INTEGER DEFAULT 0,
  level TEXT DEFAULT 'Bronze',
  items_disposed INTEGER DEFAULT 0,
  co2_saved DECIMAL DEFAULT 0,
  streak INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
```

## 📚 Como Usar

### Autenticação

```typescript
import {
  signInWithEmail,
  signUpWithEmail,
  signOut,
} from "@/services/supabaseService";

// Login
const result = await signInWithEmail("user@email.com", "password");

// Registro
const result = await signUpWithEmail("user@email.com", "password");

// Logout
await signOut();
```

### Perfil de Usuário

```typescript
import { upsertUserProfile, getUserProfile } from "@/services/supabaseService";
import { useStore } from "@/app/store";

// Obter usuário
const { authUser } = useStore();

// Atualizar perfil
await upsertUserProfile(authUser.id, {
  name: "João Silva",
  points: 100,
  level: "Prata",
});

// Buscar perfil
const { profile } = await getUserProfile(authUser.id);
```

## 📁 Estrutura

```
src/
├── config/supabase.ts          # Configuração do Supabase
├── services/supabaseService.ts  # Funções de auth e perfil
└── app/store.tsx               # State management com Supabase
```

## 🔐 Segurança

- ✅ RLS (Row Level Security) habilitado
- ✅ Apenas usuários autenticados acessam seus dados
- ✅ Chaves públicas no frontend, secretas no servidor

## 📖 Documentação

[Supabase Docs](https://supabase.com/docs)
