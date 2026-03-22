import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { AsignacionListado } from "./interfaces";
import Swal from "sweetalert2";
import { generarActaPDF } from "../utils/generarActaPDF";
import { EntregaCompleta } from "../hooks/useEntregaCompleta";
import { exportarAExcel, exportarACSV, DatosExportacion } from "../utils/exportarDatos";

type FiltrosConsulta = {
  busqueda: string;
  regional: string;
  ciudad: string;
  estado: string;
  fechaDesde: string;
  fechaHasta: string;
};

export default function ConsultarEntregas() {
  const [asignaciones, setAsignaciones] = useState<AsignacionListado[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosConsulta>({
    busqueda: "",
    regional: "",
    ciudad: "",
    estado: "",
    fechaDesde: "",
    fechaHasta: "",
  });
  const [entregaSeleccionada, setEntregaSeleccionada] = useState<AsignacionListado | null>(null);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Live search con debounce - solo si hay algún filtro activo
  useEffect(() => {
    const hayFiltros = filtros.busqueda || filtros.estado || filtros.fechaDesde || filtros.fechaHasta;
    
    if (hayFiltros) {
      const timeoutId = setTimeout(() => {
        consultarEntregas();
      }, 500);

      return () => clearTimeout(timeoutId);
    } else if (hasSearched) {
      // Si limpió todos los filtros, limpiar resultados
      setAsignaciones([]);
      setHasSearched(false);
    }
  }, [filtros.busqueda, filtros.estado, filtros.fechaDesde, filtros.fechaHasta]);

  const consultarEntregas = async () => {
    try {
      setLoading(true);
      setHasSearched(true);

      let query = supabase
        .from("asignaciones")
        .select(`
          id,
          estado,
          fecha_asignacion,
          usuarios!usuario_id (id, nombre, documento, email, telefono),
          envios!envio_id (id, numero_guia, empresa_envio, estado_envio, oficina_id),
          activos!activo_id (id, serial, tipo, marca, modelo)
        `)
        .order("fecha_asignacion", { ascending: false });

      // Aplicar filtros
      if (filtros.estado) {
        query = query.eq("estado", filtros.estado);
      }

      if (filtros.fechaDesde) {
        query = query.gte("fecha_asignacion", filtros.fechaDesde);
      }

      if (filtros.fechaHasta) {
        query = query.lte("fecha_asignacion", filtros.fechaHasta);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Mapear datos
      const asignacionesMapeadas: AsignacionListado[] = (data || []).map((row: any) => ({
        id: row.id,
        estado: row.estado,
        fecha_asignacion: row.fecha_asignacion,
        usuario: row.usuarios ? {
          id: row.usuarios.id,
          nombre: row.usuarios.nombre,
          documento: row.usuarios.documento,
          email: row.usuarios.email,
          telefono: row.usuarios.telefono,
        } : null,
        envio: row.envios ? {
          id: row.envios.id,
          numero_guia: row.envios.numero_guia,
          empresa_envio: row.envios.empresa_envio,
          estado_envio: row.envios.estado_envio,
        } : null,
        activo: row.activos ? {
          id: row.activos.id,
          serial: row.activos.serial,
          tipo: row.activos.tipo,
          marca: row.activos.marca,
          modelo: row.activos.modelo,
        } : null,
      }));

      // Filtrar por búsqueda (cliente)
      let resultados = asignacionesMapeadas;
      if (filtros.busqueda) {
        const busquedaLower = filtros.busqueda.toLowerCase();
        resultados = asignacionesMapeadas.filter(a => 
          a.envio?.numero_guia?.toLowerCase().includes(busquedaLower) ||
          a.usuario?.nombre?.toLowerCase().includes(busquedaLower) ||
          a.usuario?.documento?.toLowerCase().includes(busquedaLower) ||
          a.activo?.serial?.toLowerCase().includes(busquedaLower)
        );
      }

      setAsignaciones(resultados);
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : "Error al consultar";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: mensaje,
        confirmButtonColor: "#0d6efd"
      });
    } finally {
      setLoading(false);
    }
  };

  const verDetalle = (asignacion: AsignacionListado) => {
    setEntregaSeleccionada(asignacion);
    setMostrarDetalle(true);
  };

  const handleGenerarPDFDetalle = async () => {
    if (!entregaSeleccionada) return;

    try {
      Swal.fire({
        title: "Generando PDF...",
        text: "Por favor espera",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

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
        .eq("id", entregaSeleccionada.id)
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

      const entregaCompleta: EntregaCompleta = {
        asignacion_id: data.id,
        estado: data.estado,
        fecha_asignacion: data.fecha_asignacion,
        oficina: oficinaData,
        usuario: usuarioData,
        envio: envioData,
        activos: [activoData]
      };

      Swal.close();
      generarActaPDF(entregaCompleta);

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

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: "",
      regional: "",
      ciudad: "",
      estado: "",
      fechaDesde: "",
      fechaHasta: "",
    });
    setAsignaciones([]);
    setHasSearched(false);
  };

  const handleExportarExcel = () => {
    if (asignaciones.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Sin datos",
        text: "No hay registros para exportar. Realiza una búsqueda primero.",
        confirmButtonColor: "#5FB3A2"
      });
      return;
    }

    const datosExportar: DatosExportacion[] = asignaciones.map(asig => ({
      id: asig.id,
      fecha_asignacion: asig.fecha_asignacion || '',
      estado: asig.estado || '',
      numero_guia: asig.envio?.numero_guia,
      empresa_envio: asig.envio?.empresa_envio,
      usuario_nombre: asig.usuario?.nombre,
      usuario_documento: asig.usuario?.documento,
      usuario_email: asig.usuario?.email,
      usuario_telefono: asig.usuario?.telefono,
      activo_tipo: asig.activo?.tipo,
      activo_marca: asig.activo?.marca,
      activo_modelo: asig.activo?.modelo,
      activo_serial: asig.activo?.serial,
    }));

    exportarAExcel(datosExportar, 'entregas');
    
    Swal.fire({
      icon: "success",
      title: "Exportado",
      text: `Se exportaron ${asignaciones.length} registros a Excel`,
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleExportarCSV = () => {
    if (asignaciones.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Sin datos",
        text: "No hay registros para exportar. Realiza una búsqueda primero.",
        confirmButtonColor: "#5FB3A2"
      });
      return;
    }

    const datosExportar: DatosExportacion[] = asignaciones.map(asig => ({
      id: asig.id,
      fecha_asignacion: asig.fecha_asignacion || '',
      estado: asig.estado || '',
      numero_guia: asig.envio?.numero_guia,
      empresa_envio: asig.envio?.empresa_envio,
      usuario_nombre: asig.usuario?.nombre,
      usuario_documento: asig.usuario?.documento,
      usuario_email: asig.usuario?.email,
      usuario_telefono: asig.usuario?.telefono,
      activo_tipo: asig.activo?.tipo,
      activo_marca: asig.activo?.marca,
      activo_modelo: asig.activo?.modelo,
      activo_serial: asig.activo?.serial,
    }));

    exportarACSV(datosExportar, 'entregas');
    
    Swal.fire({
      icon: "success",
      title: "Exportado",
      text: `Se exportaron ${asignaciones.length} registros a CSV`,
      timer: 2000,
      showConfirmButton: false
    });
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
    <div className="container-fluid">
      <div className="card shadow-sm">
        <div className="card-header text-white" style={{ backgroundColor: "#5FB3A2" }}>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">🔍 Consultar Entregas</h5>
            <div className="d-flex gap-2 align-items-center">
              <small className="me-2">Estados:</small>
              <span className="badge bg-warning">En tránsito</span>
              <span className="badge bg-info">Entregado</span>
              <span className="badge bg-success">Activo</span>
            </div>
          </div>
        </div>

        <div className="card-body">
          {/* Filtros */}
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <label className="form-label small fw-bold">
                Búsqueda {loading && <span className="spinner-border spinner-border-sm ms-2" role="status"></span>}
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Guía, usuario, documento, serial..."
                  value={filtros.busqueda}
                  onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                />
              </div>
              <small className="text-muted">Búsqueda automática mientras escribes</small>
            </div>

            <div className="col-md-2">
              <label className="form-label small fw-bold">Estado</label>
              <select
                className="form-select"
                value={filtros.estado}
                onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
              >
                <option value="">Todos</option>
                <option value="En tránsito">En tránsito</option>
                <option value="Entregado">Entregado</option>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label small fw-bold">Desde</label>
              <input
                type="date"
                className="form-control"
                value={filtros.fechaDesde}
                onChange={(e) => setFiltros({ ...filtros, fechaDesde: e.target.value })}
              />
            </div>

            <div className="col-md-2">
              <label className="form-label small fw-bold">Hasta</label>
              <input
                type="date"
                className="form-control"
                value={filtros.fechaHasta}
                onChange={(e) => setFiltros({ ...filtros, fechaHasta: e.target.value })}
              />
            </div>

            <div className="col-md-2 d-flex align-items-end gap-2">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={limpiarFiltros}
                title="Limpiar filtros"
              >
                <i className="bi bi-x-circle"></i> Limpiar
              </button>
            </div>
          </div>

          {/* Botones de exportación */}
          {hasSearched && asignaciones.length > 0 && (
            <div className="d-flex gap-2 mb-3 mt-3">
              <button
                className="btn btn-success btn-sm"
                onClick={handleExportarExcel}
                title="Exportar a Excel"
              >
                <i className="bi bi-file-earmark-excel"></i> Exportar a Excel
              </button>
              <button
                className="btn btn-outline-success btn-sm"
                onClick={handleExportarCSV}
                title="Exportar a CSV"
              >
                <i className="bi bi-filetype-csv"></i> Exportar a CSV
              </button>
              <small className="text-muted align-self-center ms-2">
                {asignaciones.length} registro{asignaciones.length !== 1 ? 's' : ''} encontrado{asignaciones.length !== 1 ? 's' : ''}
              </small>
            </div>
          )}

          {/* Resultados */}
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Guía</th>
                  <th>Usuario</th>
                  <th>Activo</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      Cargando resultados...
                    </td>
                  </tr>
                ) : !hasSearched ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5">
                      <i className="bi bi-search" style={{ fontSize: "3rem", color: "#ccc" }}></i>
                      <p className="text-muted mt-3 mb-0">Usa los filtros para buscar entregas</p>
                      <small className="text-muted">Escribe en el campo de búsqueda o selecciona un filtro</small>
                    </td>
                  </tr>
                ) : asignaciones.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-muted">
                      <i className="bi bi-inbox" style={{ fontSize: "2rem" }}></i>
                      <p className="mt-2 mb-0">No se encontraron entregas con los filtros aplicados</p>
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
                        <button
                          className="btn btn-sm btn-outline-info"
                          onClick={() => verDetalle(asignacion)}
                          title="Ver detalle completo"
                        >
                          <i className="bi bi-eye"></i> Ver
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Contador de resultados */}
          {!loading && asignaciones.length > 0 && (
            <div className="text-muted small mt-2">
              Se encontraron {asignaciones.length} entrega{asignaciones.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalle */}
      {mostrarDetalle && entregaSeleccionada && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">📦 Detalle de Entrega</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setMostrarDetalle(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-12">
                    <h6 className="text-primary fw-bold">🚚 Información de Envío</h6>
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <th style={{ width: "30%" }}>Número de Guía:</th>
                          <td>{entregaSeleccionada.envio?.numero_guia || "-"}</td>
                        </tr>
                        <tr>
                          <th>Empresa de Envío:</th>
                          <td>{entregaSeleccionada.envio?.empresa_envio || "-"}</td>
                        </tr>
                        <tr>
                          <th>Estado Envío:</th>
                          <td>{entregaSeleccionada.envio?.estado_envio || "-"}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="col-12">
                    <h6 className="text-primary fw-bold">👤 Usuario</h6>
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <th style={{ width: "30%" }}>Nombre:</th>
                          <td>{entregaSeleccionada.usuario?.nombre || "-"}</td>
                        </tr>
                        <tr>
                          <th>Documento:</th>
                          <td>{entregaSeleccionada.usuario?.documento || "-"}</td>
                        </tr>
                        <tr>
                          <th>Email:</th>
                          <td>{entregaSeleccionada.usuario?.email || "-"}</td>
                        </tr>
                        <tr>
                          <th>Teléfono:</th>
                          <td>{entregaSeleccionada.usuario?.telefono || "-"}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="col-12">
                    <h6 className="text-primary fw-bold">💻 Activo</h6>
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <th style={{ width: "30%" }}>Serial:</th>
                          <td><code>{entregaSeleccionada.activo?.serial || "-"}</code></td>
                        </tr>
                        <tr>
                          <th>Tipo:</th>
                          <td>{entregaSeleccionada.activo?.tipo || "-"}</td>
                        </tr>
                        <tr>
                          <th>Marca:</th>
                          <td>{entregaSeleccionada.activo?.marca || "-"}</td>
                        </tr>
                        <tr>
                          <th>Modelo:</th>
                          <td>{entregaSeleccionada.activo?.modelo || "-"}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="col-12">
                    <h6 className="text-primary fw-bold">📋 Estado de Asignación</h6>
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <th style={{ width: "30%" }}>Estado:</th>
                          <td>{renderEstadoBadge(entregaSeleccionada.estado)}</td>
                        </tr>
                        <tr>
                          <th>Fecha de Asignación:</th>
                          <td>{renderFecha(entregaSeleccionada.fecha_asignacion)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleGenerarPDFDetalle}
                >
                  <i className="bi bi-file-earmark-pdf me-2"></i>
                  Generar PDF
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setMostrarDetalle(false)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
