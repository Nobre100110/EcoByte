import { isSupabaseConfigured, supabase } from "../config/supabase";
import { UserData } from "../app/store";

// Autenticação
export const signUpWithEmail = async (email: string, password: string) => {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { success: false, error: error.message };
  return { success: true, user: data.user };
};

export const signInWithEmail = async (email: string, password: string) => {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return { success: false, error: error.message };
  return { success: true, user: data.user };
};

export const signOut = async () => {
  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  const { error } = await supabase.auth.signOut();
  if (error) return { success: false, error: error.message };
  return { success: true };
};

// Perfil do Usuário
export const upsertUserProfile = async (
  userId: string,
  profile: Partial<UserData>,
) => {
  const { data, error } = await supabase
    .from("user_profiles")
    .upsert({
      id: userId,
      name: profile.name,
      email: profile.email,
      age: profile.age,
      profile_photo: profile.profilePhoto,
      points: profile.points || 0,
      level: profile.level || "Bronze",
      items_disposed: profile.itemsDisposed || 0,
      co2_saved: profile.co2Saved || 0,
      streak: profile.streak || 0,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, profile: data };
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, profile: data };
};
