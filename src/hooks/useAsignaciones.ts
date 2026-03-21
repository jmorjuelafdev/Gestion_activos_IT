import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  ActivoResumen,
  AsignacionListado,
  EnvioResumen,
  UsuarioBasico,
} from "../components/interfaces";

type SupabaseAsignacionRow = {
  id: number;
  estado: string;
  fecha_asignacion: string | null;
  fecha_devolucion: string | null;
  usuarios: (UsuarioBasico & { telefono?: string }) | null;
  envios: (EnvioResumen & { fecha_envio?: string | null }) | null;
  activos: (ActivoResumen & { estado?: string }) | null;
};

const SELECT_ASIGNACIONES = `
  id,
  estado,
  fecha_asignacion,
  fecha_devolucion,
  usuarios:usuario_id (id, nombre, documento, email, telefono),
  envios:envio_id (id, numero_guia, empresa_envio, estado_envio),
  activos:activo_id (id, serial, tipo, marca, modelo)
`;

const mapRowToAsignacion = (row: SupabaseAsignacionRow): AsignacionListado => ({
  id: row.id,
  estado: row.estado,
  fecha_asignacion: row.fecha_asignacion,
  fecha_devolucion: row.fecha_devolucion,
  usuario: row.usuarios ? { ...row.usuarios } : null,
  envio: row.envios ? { ...row.envios } : null,
  activo: row.activos ? { ...row.activos } : null,
});

const useAsignaciones = () => {
  const [asignaciones, setAsignaciones] = useState<AsignacionListado[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAsignaciones = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("asignaciones")
      .select(SELECT_ASIGNACIONES)
      .order("fecha_asignacion", { ascending: false });

    if (error) {
      setError(error.message);
      setAsignaciones([]);
    } else {
      const rows = (data as unknown as SupabaseAsignacionRow[] | null) ?? [];
      setAsignaciones(rows.map(mapRowToAsignacion));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAsignaciones();
  }, [fetchAsignaciones]);

  return { asignaciones, loading, error, refresh: fetchAsignaciones };
};

export default useAsignaciones;
