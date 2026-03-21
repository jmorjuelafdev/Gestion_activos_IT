import { ListaAsignacionesProps } from "./interfaces";

const ListaAsignaciones: React.FC<ListaAsignacionesProps> = ({
  asignaciones,
  loading,
  error,
  onRefresh,
}) => {
  const renderEstadoBadge = (estado?: string) => {
    const variant = estado === "Activo" ? "success" : estado === "En tránsito" ? "warning" : "secondary";
    return <span className={`badge bg-${variant}`}>{estado || "Sin estado"}</span>;
  };

  const renderFecha = (fecha: string | null) =>
    fecha ? new Date(fecha).toLocaleDateString() : "-";

  return (
    <section className="border rounded-3 p-3 bg-white shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="mb-1 fw-bold">Asignaciones recientes</h4>
          <p className="text-muted mb-0">Conecta envíos, usuarios y activos registrados</p>
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
              <th>Asignado</th>
              <th>Devolución</th>
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
                  <td>{renderFecha(asignacion.fecha_devolucion)}</td>
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
