import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

interface Ciudad {
  id: number;
  nombre: string;
  regional_nombre: string;
}

export default function useCiudades(regionalNombre?: string) {
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (regionalNombre) {
      fetchCiudades(regionalNombre);
    } else {
      setCiudades([]);
    }
  }, [regionalNombre]);

  const fetchCiudades = async (regional: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("ciudades")
        .select("*")
        .eq("regional_nombre", regional)
        .order("nombre", { ascending: true });

      if (error) throw error;

      setCiudades(data || []);
      setError(null);
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : "Error al cargar ciudades";
      setError(mensaje);
      console.error("Error fetching ciudades:", err);
    } finally {
      setLoading(false);
    }
  };

  return { ciudades, loading, error };
}
