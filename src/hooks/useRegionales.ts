import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

interface Regional {
  id: number;
  nombre: string;
  departamentos: string;
}

export default function useRegionales() {
  const [regionales, setRegionales] = useState<Regional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRegionales();
  }, []);

  const fetchRegionales = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("regionales")
        .select("*")
        .order("nombre", { ascending: true });

      if (error) throw error;

      setRegionales(data || []);
      setError(null);
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : "Error al cargar regionales";
      setError(mensaje);
      console.error("Error fetching regionales:", err);
    } finally {
      setLoading(false);
    }
  };

  return { regionales, loading, error, refetch: fetchRegionales };
}
