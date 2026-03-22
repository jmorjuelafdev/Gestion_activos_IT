import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

type DashboardStats = {
  totalEntregas: number;
  totalActivos: number;
  totalUsuarios: number;
  totalOficinas: number;
  entregasActivas: number;
  entregasEntregadas: number;
  entregasEnTransito: number;
  activosPorTipo: { tipo: string; cantidad: number }[];
  entregasPorRegional: { regional: string; cantidad: number }[];
  entregasRecientes: {
    id: number;
    fecha: string;
    usuario: string;
    regional: string;
    estado: string;
  }[];
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEntregas: 0,
    totalActivos: 0,
    totalUsuarios: 0,
    totalOficinas: 0,
    entregasActivas: 0,
    entregasEntregadas: 0,
    entregasEnTransito: 0,
    activosPorTipo: [],
    entregasPorRegional: [],
    entregasRecientes: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Total de entregas
      const { count: totalEntregas } = await supabase
        .from("asignaciones")
        .select("*", { count: "exact", head: true });

      // Total de activos
      const { count: totalActivos } = await supabase
        .from("activos")
        .select("*", { count: "exact", head: true });

      // Total de usuarios
      const { count: totalUsuarios } = await supabase
        .from("usuarios")
        .select("*", { count: "exact", head: true });

      // Total de oficinas
      const { count: totalOficinas } = await supabase
        .from("oficinas")
        .select("*", { count: "exact", head: true });

      // Entregas activas
      const { count: entregasActivas } = await supabase
        .from("asignaciones")
        .select("*", { count: "exact", head: true })
        .eq("estado", "Activo");

      // Entregas entregadas
      const { count: entregasEntregadas } = await supabase
        .from("asignaciones")
        .select("*", { count: "exact", head: true })
        .eq("estado", "Entregado");

      // Entregas en tránsito
      const { count: entregasEnTransito } = await supabase
        .from("asignaciones")
        .select("*", { count: "exact", head: true })
        .eq("estado", "En tránsito");

      // Activos por tipo
      const { data: activosData } = await supabase
        .from("activos")
        .select("tipo");

      const activosPorTipo = activosData?.reduce((acc: any[], activo) => {
        const tipo = activo.tipo || "Sin especificar";
        const existing = acc.find((item) => item.tipo === tipo);
        if (existing) {
          existing.cantidad++;
        } else {
          acc.push({ tipo, cantidad: 1 });
        }
        return acc;
      }, []) || [];

      // Entregas por regional
      const { data: asignacionesData } = await supabase
        .from("asignaciones")
        .select(`
          id,
          envio_id
        `);

      const envioIds = asignacionesData?.map((a) => a.envio_id) || [];
      
      const { data: enviosData } = await supabase
        .from("envios")
        .select("oficina_id")
        .in("id", envioIds);

      const oficinaIds = enviosData?.map((e) => e.oficina_id) || [];

      const { data: oficinasData } = await supabase
        .from("oficinas")
        .select("regional")
        .in("id", oficinaIds);

      const entregasPorRegional = oficinasData?.reduce((acc: any[], oficina) => {
        const regional = oficina.regional || "Sin especificar";
        const existing = acc.find((item) => item.regional === regional);
        if (existing) {
          existing.cantidad++;
        } else {
          acc.push({ regional, cantidad: 1 });
        }
        return acc;
      }, []).sort((a, b) => b.cantidad - a.cantidad).slice(0, 5) || [];

      // Entregas recientes
      const { data: recientesData } = await supabase
        .from("asignaciones")
        .select(`
          id,
          fecha_asignacion,
          estado,
          usuario_id,
          envio_id
        `)
        .order("fecha_asignacion", { ascending: false })
        .limit(5);

      const entregasRecientes = await Promise.all(
        (recientesData || []).map(async (asignacion) => {
          const { data: usuario } = await supabase
            .from("usuarios")
            .select("nombre")
            .eq("id", asignacion.usuario_id)
            .single();

          const { data: envio } = await supabase
            .from("envios")
            .select("oficina_id")
            .eq("id", asignacion.envio_id)
            .single();

          let regional = "N/A";
          if (envio?.oficina_id) {
            const { data: oficina } = await supabase
              .from("oficinas")
              .select("regional")
              .eq("id", envio.oficina_id)
              .single();
            regional = oficina?.regional || "N/A";
          }

          return {
            id: asignacion.id,
            fecha: asignacion.fecha_asignacion || "",
            usuario: usuario?.nombre || "N/A",
            regional,
            estado: asignacion.estado || "N/A",
          };
        })
      );

      setStats({
        totalEntregas: totalEntregas || 0,
        totalActivos: totalActivos || 0,
        totalUsuarios: totalUsuarios || 0,
        totalOficinas: totalOficinas || 0,
        entregasActivas: entregasActivas || 0,
        entregasEntregadas: entregasEntregadas || 0,
        entregasEnTransito: entregasEnTransito || 0,
        activosPorTipo: activosPorTipo.sort((a, b) => b.cantidad - a.cantidad).slice(0, 5),
        entregasPorRegional,
        entregasRecientes,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <h2 className="fw-bold mb-4" style={{ color: "#5FB3A2" }}>📊 Dashboard</h2>

      {/* Tarjetas de estadísticas principales */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100" style={{ borderLeft: "4px solid #5FB3A2" }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">Total Entregas</p>
                  <h3 className="mb-0 fw-bold">{stats.totalEntregas}</h3>
                </div>
                <div className="bg-light rounded-circle p-3">
                  <i className="bi bi-box-seam fs-4" style={{ color: "#5FB3A2" }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100" style={{ borderLeft: "4px solid #4A9080" }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">Total Activos</p>
                  <h3 className="mb-0 fw-bold">{stats.totalActivos}</h3>
                </div>
                <div className="bg-light rounded-circle p-3">
                  <i className="bi bi-laptop fs-4" style={{ color: "#4A9080" }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100" style={{ borderLeft: "4px solid #f39c12" }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">En Camino</p>
                  <h3 className="mb-0 fw-bold">{stats.entregasEnTransito}</h3>
                  <small className="text-muted" style={{ fontSize: "0.7rem" }}>Estado: En tránsito</small>
                </div>
                <div className="bg-light rounded-circle p-3">
                  <i className="bi bi-truck fs-4 text-warning"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Segunda fila - Estados de entrega */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100" style={{ borderLeft: "4px solid #5FB3A2" }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">Equipos Entregados</p>
                  <h3 className="mb-0 fw-bold">{stats.entregasEntregadas}</h3>
                  <small className="text-muted" style={{ fontSize: "0.7rem" }}>Estado: Entregado</small>
                </div>
                <div className="bg-light rounded-circle p-3">
                  <i className="bi bi-box-seam-fill fs-4" style={{ color: "#5FB3A2" }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100" style={{ borderLeft: "4px solid #2ecc71" }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">Equipos en Uso</p>
                  <h3 className="mb-0 fw-bold">{stats.entregasActivas}</h3>
                  <small className="text-muted" style={{ fontSize: "0.7rem" }}>Estado: Activo</small>
                </div>
                <div className="bg-light rounded-circle p-3">
                  <i className="bi bi-check-circle fs-4 text-success"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100" style={{ borderLeft: "4px solid #7FC4B5" }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">Total Usuarios</p>
                  <h3 className="mb-0 fw-bold">{stats.totalUsuarios}</h3>
                </div>
                <div className="bg-light rounded-circle p-3">
                  <i className="bi bi-people fs-4" style={{ color: "#7FC4B5" }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos y tablas */}
      <div className="row g-3">
        {/* Activos por tipo */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h5 className="mb-0 fw-bold">Top 5 Tipos de Activos</h5>
            </div>
            <div className="card-body">
              {stats.activosPorTipo.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Tipo</th>
                        <th className="text-end">Cantidad</th>
                        <th style={{ width: "50%" }}>Distribución</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.activosPorTipo.map((item, index) => {
                        const maxCantidad = Math.max(...stats.activosPorTipo.map((i) => i.cantidad));
                        const percentage = (item.cantidad / maxCantidad) * 100;
                        return (
                          <tr key={index}>
                            <td className="fw-semibold">{item.tipo}</td>
                            <td className="text-end">
                              <span className="badge bg-primary">{item.cantidad}</span>
                            </td>
                            <td>
                              <div className="progress" style={{ height: "20px" }}>
                                <div
                                  className="progress-bar"
                                  role="progressbar"
                                  style={{ width: `${percentage}%`, backgroundColor: "#5FB3A2" }}
                                  aria-valuenow={percentage}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                >
                                  {percentage.toFixed(0)}%
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted text-center py-4">No hay datos disponibles</p>
              )}
            </div>
          </div>
        </div>

        {/* Entregas por regional */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h5 className="mb-0 fw-bold">Top 5 Regionales</h5>
            </div>
            <div className="card-body">
              {stats.entregasPorRegional.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Regional</th>
                        <th className="text-end">Entregas</th>
                        <th style={{ width: "50%" }}>Distribución</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.entregasPorRegional.map((item, index) => {
                        const maxCantidad = Math.max(...stats.entregasPorRegional.map((i) => i.cantidad));
                        const percentage = (item.cantidad / maxCantidad) * 100;
                        return (
                          <tr key={index}>
                            <td className="fw-semibold">{item.regional}</td>
                            <td className="text-end">
                              <span className="badge bg-success">{item.cantidad}</span>
                            </td>
                            <td>
                              <div className="progress" style={{ height: "20px" }}>
                                <div
                                  className="progress-bar bg-success"
                                  role="progressbar"
                                  style={{ width: `${percentage}%` }}
                                  aria-valuenow={percentage}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                >
                                  {percentage.toFixed(0)}%
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted text-center py-4">No hay datos disponibles</p>
              )}
            </div>
          </div>
        </div>

        {/* Entregas recientes */}
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h5 className="mb-0 fw-bold">Entregas Recientes</h5>
            </div>
            <div className="card-body">
              {stats.entregasRecientes.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Fecha</th>
                        <th>Usuario</th>
                        <th>Regional</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.entregasRecientes.map((entrega) => (
                        <tr key={entrega.id}>
                          <td>
                            <span className="badge bg-secondary">#{entrega.id}</span>
                          </td>
                          <td>{entrega.fecha ? new Date(entrega.fecha).toLocaleDateString("es-CO") : "N/A"}</td>
                          <td className="fw-semibold">{entrega.usuario}</td>
                          <td>{entrega.regional}</td>
                          <td>
                            <span
                              className={`badge ${
                                entrega.estado === "Activo"
                                  ? "bg-success"
                                  : entrega.estado === "En tránsito"
                                  ? "bg-warning"
                                  : "bg-secondary"
                              }`}
                            >
                              {entrega.estado}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted text-center py-4">No hay entregas recientes</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
