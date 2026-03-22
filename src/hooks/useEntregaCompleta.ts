import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { OficinaFormData, EnvioFormData } from "../components/interfaces";

type ActivoCompleto = {
  id: number;
  tipo: string;
  marca: string;
  modelo: string;
  serial: string;
};

type UsuarioCompleto = {
  id: number;
  nombre: string;
  documento: string;
  email: string;
  telefono: string;
  area: string;
};

export type EntregaCompleta = {
  asignacion_id: number;
  oficina: OficinaFormData & { id: number };
  usuario: UsuarioCompleto;
  envio: EnvioFormData & { id: number };
  activos: ActivoCompleto[];
  estado: string;
  fecha_asignacion: string;
};

export default function useEntregaCompleta() {
  const [entrega, setEntrega] = useState<EntregaCompleta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEntrega = async (asignacionId: number) => {
    try {
      setLoading(true);
      setError(null);

      // 1. Obtener la asignación con sus relaciones
      const { data: asignacion, error: asignacionError } = await supabase
        .from("asignaciones")
        .select(`
          id,
          estado,
          fecha_asignacion,
          activo_id,
          usuario_id,
          envio_id
        `)
        .eq("id", asignacionId)
        .single();

      if (asignacionError) throw asignacionError;
      if (!asignacion) throw new Error("Asignación no encontrada");

      // 2. Obtener el envío y su oficina
      const { data: envio, error: envioError } = await supabase
        .from("envios")
        .select("*")
        .eq("id", asignacion.envio_id)
        .single();

      if (envioError) throw envioError;

      // 3. Obtener la oficina
      const { data: oficina, error: oficinaError } = await supabase
        .from("oficinas")
        .select("*")
        .eq("id", envio.oficina_id)
        .single();

      if (oficinaError) throw oficinaError;

      // 4. Obtener el usuario
      const { data: usuario, error: usuarioError } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", asignacion.usuario_id)
        .single();

      if (usuarioError) throw usuarioError;

      // 5. Obtener todos los activos de este envío
      const { data: asignaciones, error: asignacionesError } = await supabase
        .from("asignaciones")
        .select("activo_id")
        .eq("envio_id", asignacion.envio_id);

      if (asignacionesError) throw asignacionesError;

      const activoIds = asignaciones.map(a => a.activo_id);

      const { data: activos, error: activosError } = await supabase
        .from("activos")
        .select("id, tipo, marca, modelo, serial")
        .in("id", activoIds);

      if (activosError) throw activosError;

      // 6. Construir el objeto EntregaCompleta
      const entregaCompleta: EntregaCompleta = {
        asignacion_id: asignacion.id,
        oficina: {
          id: oficina.id,
          regional: oficina.regional || "",
          ciudad: oficina.ciudad || "",
          departamento: oficina.departamento || "",
          localidad: oficina.localidad || "",
          empresa: oficina.empresa || "",
          nombre: oficina.nombre || "",
          direccion: oficina.direccion || "",
          area: oficina.area || "",
          responsable_nombre: oficina.responsable_nombre || "",
          responsable_documento: oficina.responsable_documento || "",
          telefono: oficina.telefono || "",
          email: oficina.email || "",
        },
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre || "",
          documento: usuario.documento || "",
          email: usuario.email || "",
          telefono: usuario.telefono || "",
          area: usuario.area || "",
        },
        envio: {
          id: envio.id,
          numero_guia: envio.numero_guia || "",
          empresa_envio: envio.empresa_envio || "",
          fecha_envio: envio.fecha_envio || "",
          oficina_id: envio.oficina_id,
          estado_envio: envio.estado_envio || "",
          observaciones: envio.observaciones || "",
        },
        activos: activos || [],
        estado: asignacion.estado,
        fecha_asignacion: asignacion.fecha_asignacion,
      };

      setEntrega(entregaCompleta);
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : "Error al cargar la entrega";
      setError(mensaje);
      console.error("Error fetching entrega:", err);
    } finally {
      setLoading(false);
    }
  };

  return { entrega, loading, error, fetchEntrega };
}
