import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

export interface Profile {
  id: string;
  nombre: string;
  cargo?: string;
  username: string;
  rol: "admin" | "operador";
  must_change_password: boolean;
  activo: boolean;
}

interface UseProfileResult {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export default function useProfile(userId?: string | null): UseProfileResult {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;
      setProfile(data ?? null);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cargar perfil";
      setError(message);
      setProfile(null);
      console.error("useProfile error", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, refetch: fetchProfile };
}
