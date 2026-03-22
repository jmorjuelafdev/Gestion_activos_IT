import { ListaAsignacionesProps } from "./interfaces";
import { supabase } from "../lib/supabaseClient";
import { generarActaPDF } from "../utils/generarActaPDF";
import { EntregaCompleta } from "../hooks/useEntregaCompleta";
import Swal from "sweetalert2";

const ListaAsignaciones: React.FC<ListaAsignacionesProps> = ({
  asignaciones,
  loading,
  error,
  onRefresh,
  onEdit,
  onDelete,
}) => {
  const handleGenerarPDF = async (asignacionId: number) => {
    try {
      // Mostrar loading
      Swal.fire({
        title: "Generando PDF...",
        text: "Por favor espera",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Fetch entrega completa
      const { data, error } = await supabase
        .from("asignaciones")
        .select(`
          id,
          estado,
          fecha_asignacion,
          usuario_id,
          envio_id,
          activo_id
        `)
        .eq("id", asignacionId)
        .single();

      if (error) throw error;
      if (!data) throw new Error("No se encontró la entrega");

      // Fetch envio (que contiene oficina_id)
      const { data: envioData, error: envioError } = await supabase
        .from("envios")
        .select("*")
        .eq("id", data.envio_id)
        .single();

      if (envioError) throw envioError;

      // Fetch oficina a través del envio
      const { data: oficinaData, error: oficinaError } = await supabase
        .from("oficinas")
        .select("*")
        .eq("id", envioData.oficina_id)
        .single();

      if (oficinaError) throw oficinaError;

      // Fetch usuario
      const { data: usuarioData, error: usuarioError } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", data.usuario_id)
        .single();

      if (usuarioError) throw usuarioError;

      // Fetch activo
      const { data: activoData, error: activoError } = await supabase
        .from("activos")
        .select("*")
        .eq("id", data.activo_id)
        .single();

      if (activoError) throw activoError;

      // Mapear datos a EntregaCompleta
      const entregaCompleta: EntregaCompleta = {
        asignacion_id: data.id,
        estado: data.estado,
        fecha_asignacion: data.fecha_asignacion,
        oficina: oficinaData,
        usuario: usuarioData,
        envio: envioData,
        activos: [activoData]
      };

      // Cerrar loading
      Swal.close();

      // Generar PDF
      generarActaPDF(entregaCompleta);

      // Mostrar éxito
      await Swal.fire({
        icon: "success",
        title: "PDF Generado",
        text: "El acta de entrega se ha descargado correctamente",
        confirmButtonColor: "#0d6efd",
        timer: 2000
      });
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : "Error al generar PDF";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: mensaje,
        confirmButtonColor: "#0d6efd"
      });
    }
  };

  const renderEstadoBadge = (estado?: string) => {
    let variant = "secondary";
    if (estado === "Activo") variant = "success";
    else if (estado === "Entregado") variant = "info";
    else if (estado === "En tránsito") variant = "warning";
    return <span className={`badge bg-${variant}`}>{estado || "Sin estado"}</span>;
  };

  const renderFecha = (fecha: string | null) =>
    fecha ? new Date(fecha).toLocaleDateString() : "-";

  return (
    <section className="border rounded-3 p-3 bg-white shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="mb-1 fw-bold" style={{ color: "#5FB3A2" }}>Asignaciones Registradas</h4>
          <p className="text-muted mb-0">
            <i className="bi bi-info-circle me-1"></i>
            Seguimiento de entregas por estado: 
            <span className="badge bg-warning ms-1">En tránsito</span>
            <span className="badge bg-info ms-1">Entregado</span>
            <span className="badge bg-success ms-1">Activo</span>
          </p>
        </div>
        <button className="btn btn-outline-primary btn-sm" onClick={onRefresh} disabled={loading}>
          {loading ? "Actualizando..." : "Refrescar"}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Guía</th>
              <th>Usuario</th>
              <th>Activo</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th style={{ width: "150px" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {asignaciones.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-muted py-4">
                  {loading ? "Cargando asignaciones..." : "Aún no hay asignaciones registradas"}
                </td>
              </tr>
            ) : (
              asignaciones.map((asignacion) => (
                <tr key={asignacion.id}>
                  <td>
                    <div className="fw-semibold">{asignacion.envio?.numero_guia ?? "Sin guía"}</div>
                    <small className="text-muted">{asignacion.envio?.empresa_envio}</small>
                  </td>
                  <td>
                    <div className="fw-semibold">{asignacion.usuario?.nombre ?? "Sin usuario"}</div>
                    <small className="text-muted">{asignacion.usuario?.documento}</small>
                  </td>
                  <td>
                    <div className="fw-semibold">{asignacion.activo?.serial ?? "Sin serial"}</div>
                    <small className="text-muted">{asignacion.activo?.tipo}</small>
                  </td>
                  <td>{renderEstadoBadge(asignacion.estado)}</td>
                  <td>{renderFecha(asignacion.fecha_asignacion)}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <button 
                        className="btn btn-sm btn-outline-success"
                        onClick={() => handleGenerarPDF(asignacion.id)}
                        title="Generar Acta PDF"
                      >
                        <i className="bi bi-file-earmark-pdf"></i>
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => onEdit?.(asignacion.id)}
                        title="Editar entrega"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => onDelete?.(asignacion.id)}
                        title="Eliminar entrega"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ListaAsignaciones;
