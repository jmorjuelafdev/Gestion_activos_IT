import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

interface ProfileRow {
  id: string;
  nombre: string;
  cargo: string | null;
  username: string;
  rol: "admin" | "operador";
  must_change_password: boolean;
  activo: boolean;
  created_at: string;
}

interface CatalogEntry {
  id: number;
  nombre: string;
  activo: boolean;
  created_at: string;
}

interface AuditEntry {
  id: string;
  timestamp: string;
  username: string | null;
  rol: string | null;
  accion: string;
  entidad: string;
  entidad_id: string | null;
  detalle: Record<string, unknown> | null;
}

const catalogConfig = {
  tipos: {
    title: "Tipos de equipo",
    table: "tipos_equipo_catalogo",
  },
  marcas: {
    title: "Marcas",
    table: "marcas_equipo_catalogo",
  },
  empresas: {
    title: "Empresas de envío",
    table: "empresas_envio_catalogo",
  },
} as const;

type CatalogKey = keyof typeof catalogConfig;

const initialCatalogState: Record<CatalogKey, CatalogEntry[]> = {
  tipos: [],
  marcas: [],
  empresas: [],
};

const initialCatalogInputs: Record<CatalogKey, string> = {
  tipos: "",
  marcas: "",
  empresas: "",
};

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState<"usuarios" | "catalogos" | "auditoria">("usuarios");
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [catalogs, setCatalogs] = useState(initialCatalogState);
  const [catalogInputs, setCatalogInputs] = useState(initialCatalogInputs);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const catalogTabs = useMemo(() => Object.entries(catalogConfig) as [CatalogKey, typeof catalogConfig.tipos][], []);

  useEffect(() => {
    fetchProfiles();
    fetchCatalogs();
    fetchAuditLog();
  }, []);

  const fetchProfiles = async () => {
    try {
      setProfilesLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id,nombre,cargo,username,rol,must_change_password,activo,created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (err) {
      handleError(err, "Error al cargar usuarios");
    } finally {
      setProfilesLoading(false);
    }
  };

  const fetchCatalogs = async () => {
    try {
      setCatalogLoading(true);
      const entries: Record<CatalogKey, CatalogEntry[]> = { ...initialCatalogState };
      await Promise.all(
        (Object.keys(catalogConfig) as CatalogKey[]).map(async (key) => {
          const table = catalogConfig[key].table;
          const { data, error } = await supabase
            .from(table)
            .select("id,nombre,activo,created_at")
            .order("nombre", { ascending: true });
          if (error) throw error;
          entries[key] = data || [];
        })
      );
      setCatalogs(entries);
    } catch (err) {
      handleError(err, "Error al cargar catálogos");
    } finally {
      setCatalogLoading(false);
    }
  };

  const fetchAuditLog = async () => {
    try {
      setAuditLoading(true);
      const { data, error } = await supabase
        .from("audit_log")
        .select("id,timestamp,username,rol,accion,entidad,entidad_id,detalle")
        .order("timestamp", { ascending: false })
        .limit(25);
      if (error) throw error;
      setAuditEntries(data || []);
    } catch (err) {
      handleError(err, "Error al cargar auditoría");
    } finally {
      setAuditLoading(false);
    }
  };

  const handleError = (err: unknown, fallback: string) => {
    const message = err instanceof Error ? err.message : fallback;
    console.error(fallback, err);
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const handleCatalogInputChange = (key: CatalogKey, value: string) => {
    setCatalogInputs((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddCatalogEntry = async (key: CatalogKey) => {
    const value = catalogInputs[key].trim();
    if (!value) return;
    try {
      const table = catalogConfig[key].table;
      const { error } = await supabase.from(table).insert({ nombre: value });
      if (error) throw error;
      handleCatalogInputChange(key, "");
      fetchCatalogs();
    } catch (err) {
      handleError(err, "No se pudo agregar el registro");
    }
  };

  const handleToggleCatalogActive = async (key: CatalogKey, entry: CatalogEntry) => {
    try {
      const table = catalogConfig[key].table;
      const { error } = await supabase
        .from(table)
        .update({ activo: !entry.activo })
        .eq("id", entry.id);
      if (error) throw error;
      fetchCatalogs();
    } catch (err) {
      handleError(err, "No se pudo actualizar el registro");
    }
  };

  const handleDeleteCatalogEntry = async (key: CatalogKey, entry: CatalogEntry) => {
    if (!confirm(`¿Eliminar ${entry.nombre}?`)) return;
    try {
      const table = catalogConfig[key].table;
      const { error } = await supabase.from(table).delete().eq("id", entry.id);
      if (error) throw error;
      fetchCatalogs();
    } catch (err) {
      handleError(err, "No se pudo eliminar el registro");
    }
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <div>
            <h4 className="fw-bold mb-1" style={{ color: "#5FB3A2" }}>Panel administrativo</h4>
            <p className="text-muted mb-0">Gestiona usuarios, catálogos y registra auditorías.</p>
          </div>
          <div className="btn-group mt-3 mt-md-0" role="group">
            <button className={`btn btn-outline-primary ${activeTab === "usuarios" ? "active" : ""}`} onClick={() => setActiveTab("usuarios")}>
              <i className="bi bi-people me-2"></i>Usuarios
            </button>
            <button className={`btn btn-outline-primary ${activeTab === "catalogos" ? "active" : ""}`} onClick={() => setActiveTab("catalogos")}>
              <i className="bi bi-list-check me-2"></i>Catálogos
            </button>
            <button className={`btn btn-outline-primary ${activeTab === "auditoria" ? "active" : ""}`} onClick={() => setActiveTab("auditoria")}>
              <i className="bi bi-clipboard-data me-2"></i>Auditoría
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger">{error}</div>
        )}

        {activeTab === "usuarios" && (
          <section>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Usuarios del sistema</h5>
              <button className="btn btn-success" onClick={() => alert("Próximamente: registro de operadores")}> 
                <i className="bi bi-person-plus"></i> Crear operador
              </button>
            </div>
            {profilesLoading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="text-muted mt-2">Cargando usuarios...</p>
              </div>
            ) : profiles.length === 0 ? (
              <p className="text-muted">No hay perfiles registrados todavía.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Cargo</th>
                      <th>Correo</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      <th>Creado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map((profile) => (
                      <tr key={profile.id}>
                        <td className="fw-semibold">{profile.nombre}</td>
                        <td>{profile.cargo || "—"}</td>
                        <td>{profile.username}</td>
                        <td>
                          <span className={`badge ${profile.rol === "admin" ? "bg-primary" : "bg-secondary"}`}>
                            {profile.rol}
                          </span>
                        </td>
                        <td>
                          {profile.activo ? (
                            <span className="badge bg-success">Activo</span>
                          ) : (
                            <span className="badge bg-danger">Inactivo</span>
                          )}
                          {profile.must_change_password && (
                            <span className="badge bg-warning text-dark ms-1">Debe cambiar contraseña</span>
                          )}
                        </td>
                        <td>{new Date(profile.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {activeTab === "catalogos" && (
          <section>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Catálogos administrables</h5>
              <button className="btn btn-outline-secondary" onClick={fetchCatalogs} disabled={catalogLoading}>
                <i className="bi bi-arrow-clockwise"></i> Actualizar
              </button>
            </div>
            {catalogLoading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="text-muted mt-2">Cargando catálogos...</p>
              </div>
            ) : (
              <div className="row g-4">
                {catalogTabs.map(([key, config]) => (
                  <div className="col-md-4" key={key}>
                    <div className="border rounded-3 p-3 h-100">
                      <h6 className="fw-semibold mb-3">{config.title}</h6>
                      <div className="d-flex gap-2 mb-3">
                        <input
                          className="form-control form-control-sm"
                          placeholder={`Nuevo ${config.title.toLowerCase()}`}
                          value={catalogInputs[key]}
                          onChange={(e) => handleCatalogInputChange(key, e.target.value)}
                        />
                        <button className="btn btn-sm btn-primary" onClick={() => handleAddCatalogEntry(key)}>
                          Agregar
                        </button>
                      </div>
                      <ul className="list-group list-group-flush" style={{ maxHeight: 260, overflowY: "auto" }}>
                        {catalogs[key].map((entry) => (
                          <li key={entry.id} className="list-group-item d-flex justify-content-between align-items-center px-0">
                            <div>
                              <span className="fw-medium">{entry.nombre}</span>
                              <span className={`badge ms-2 ${entry.activo ? "bg-success" : "bg-secondary"}`}>
                                {entry.activo ? "Activo" : "Inactivo"}
                              </span>
                            </div>
                            <div className="btn-group">
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => handleToggleCatalogActive(key, entry)}
                              >
                                {entry.activo ? "Desactivar" : "Activar"}
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteCatalogEntry(key, entry)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "auditoria" && (
          <section>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Bitácora de acciones</h5>
              <button className="btn btn-outline-secondary" onClick={fetchAuditLog} disabled={auditLoading}>
                <i className="bi bi-arrow-clockwise"></i> Actualizar
              </button>
            </div>
            {auditLoading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="text-muted mt-2">Cargando auditoría...</p>
              </div>
            ) : auditEntries.length === 0 ? (
              <p className="text-muted">Aún no existen registros en la bitácora.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Usuario</th>
                      <th>Rol</th>
                      <th>Acción</th>
                      <th>Entidad</th>
                      <th>Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditEntries.map((entry) => (
                      <tr key={entry.id}>
                        <td>{new Date(entry.timestamp).toLocaleString()}</td>
                        <td>{entry.username || "—"}</td>
                        <td>{entry.rol || "—"}</td>
                        <td>{entry.accion}</td>
                        <td>
                          {entry.entidad}
                          {entry.entidad_id && <span className="text-muted ms-1">#{entry.entidad_id}</span>}
                        </td>
                        <td>
                          {entry.detalle ? (
                            <pre className="small mb-0 bg-light p-2 rounded" style={{ maxHeight: 120, overflowY: "auto" }}>
                              {JSON.stringify(entry.detalle, null, 2)}
                            </pre>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
