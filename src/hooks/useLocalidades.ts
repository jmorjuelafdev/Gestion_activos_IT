import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

interface Localidad {
  id: number;
  nombre: string;
  ciudad_nombre: string;
}

export default function useLocalidades(ciudadNombre?: string) {
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ciudadNombre) {
      fetchLocalidades(ciudadNombre);
    } else {
      setLocalidades([]);
    }
  }, [ciudadNombre]);

  const fetchLocalidades = async (ciudad: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("localidades")
        .select("*")
        .eq("ciudad_nombre", ciudad)
        .order("nombre", { ascending: true });

      if (error) throw error;

      setLocalidades(data || []);
      setError(null);
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : "Error al cargar localidades";
      setError(mensaje);
      console.error("Error fetching localidades:", err);
    } finally {
      setLoading(false);
    }
  };

  return { localidades, loading, error };
}
