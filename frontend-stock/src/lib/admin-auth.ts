import { supabase } from "@/lib/supabase-browser";

export async function signInAdmin(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(error.message);
  }
}

export async function signOutAdmin(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}

export async function getAdminAccessToken(): Promise<string | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error(error.message);
  }

  return data.session?.access_token ?? null;
}

export async function hasAdminSession(): Promise<boolean> {
  const token = await getAdminAccessToken();
  return Boolean(token);
}

export async function requireAdminAccessToken(): Promise<string> {
  const token = await getAdminAccessToken();
  if (!token) {
    throw new Error("Admin session expired. Please sign in again.");
  }

  return token;
}
