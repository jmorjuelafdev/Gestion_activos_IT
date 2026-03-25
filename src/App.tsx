import { useEffect, useState } from "react";
import type { Session, AuthChangeEvent } from "@supabase/supabase-js";
import "./assets/css/App.css";
import Titulo from "./components/Titulo";
import FormEntrega from "./components/FormEntrega";
import ListaAsignaciones from "./components/ListaAsignaciones";
import EditEntregaModal from "./components/EditEntregaModal";
import ConsultarEntregas from "./components/ConsultarEntregas";
import Dashboard from "./components/Dashboard";
import { ToastContainer } from "./toastUtils";
import useAsignaciones from "./hooks/useAsignaciones";
import { supabase } from "./lib/supabaseClient";
import Swal from "sweetalert2";
import Login from "./components/Login";
import useProfile from "./hooks/useProfile";
import AdminPanel from "./components/AdminPanel";

function App() {
  const { asignaciones, loading, error, refresh } = useAsignaciones();
  const [editingAsignacionId, setEditingAsignacionId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vistaActiva, setVistaActiva] = useState<"dashboard" | "registrar" | "consultar" | "admin">("dashboard");
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme_preference");
      if (saved === "light" || saved === "dark") return saved;
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      return prefersDark ? "dark" : "light";
    }
    return "light";
  });
  const [nuevoPassword, setNuevoPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const { profile, loading: profileLoading, error: profileError, refetch: refetchProfile } = useProfile(session?.user?.id ?? null);
  const esAdmin = profile?.rol === "admin";

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme_preference", theme);
  }, [theme]);

  useEffect(() => {
    const initAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setAuthLoading(false);
    };
    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_: AuthChangeEvent, newSession) => {
      setSession(newSession);
      if (!newSession) {
        setVistaActiva("dashboard");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  const handleLoginSuccess = (newSession: Session) => {
    setSession(newSession);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setVistaActiva("dashboard");
  };

  const handleEdit = (asignacionId: number) => {
    setEditingAsignacionId(asignacionId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAsignacionId(null);
  };

  const handleSaveSuccess = () => {
    refresh();
  };

  const handleDelete = async (asignacionId: number) => {
    const result = await Swal.fire({
      title: "¿Eliminar entrega?",
      text: "Esta acción no se puede deshacer. Se eliminará la asignación.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (result.isConfirmed) {
      try {
        const { error } = await supabase
          .from("asignaciones")
          .delete()
          .eq("id", asignacionId);

        if (error) throw error;

        await Swal.fire({
          icon: "success",
          title: "Eliminada",
          text: "La entrega ha sido eliminada correctamente",
          confirmButtonColor: "#0d6efd",
          timer: 2000
        });

        refresh();
      } catch (error) {
        const mensaje = error instanceof Error ? error.message : "Error al eliminar";
        Swal.fire({
          icon: "error",
          title: "Error",
          text: mensaje,
          confirmButtonColor: "#0d6efd"
        });
      }
    }
  };

  const handlePasswordChange = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile) return;
    if (nuevoPassword.length < 8) {
      setPasswordError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (nuevoPassword !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden.");
      return;
    }
    try {
      setPasswordLoading(true);
      setPasswordError(null);
      const { error } = await supabase.auth.updateUser({ password: nuevoPassword });
      if (error) throw error;
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ must_change_password: false })
        .eq("id", profile.id);
      if (profileError) throw profileError;
      setNuevoPassword("");
      setConfirmPassword("");
      await refetchProfile();
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : "No se pudo actualizar la contraseña";
      setPasswordError(mensaje);
    } finally {
      setPasswordLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center py-5" style={{ backgroundColor: "var(--bg-light)" }}>
        <button className="theme-toggle mb-4" onClick={toggleTheme} aria-label="Cambiar tema">
          {theme === "light" ? (
            <>
              <i className="bi bi-moon-stars"></i>
              <span>Modo oscuro</span>
            </>
          ) : (
            <>
              <i className="bi bi-sun"></i>
              <span>Modo claro</span>
            </>
          )}
        </button>
        <Login onSuccess={handleLoginSuccess} />
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Obteniendo perfil...</p>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="card p-4 shadow-sm" style={{ maxWidth: 420 }}>
          <h5 className="text-danger">Error al cargar el perfil</h5>
          <p className="text-muted">{profileError}</p>
          <button className="btn btn-primary" onClick={() => refetchProfile()}>Reintentar</button>
        </div>
      </div>
    );
  }

  if (profile?.must_change_password) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: "var(--bg-light)" }}>
        <div className="card shadow-sm border-0" style={{ maxWidth: 480, width: "100%" }}>
          <div className="card-body p-4">
            <h3 className="fw-bold mb-2" style={{ color: "#5FB3A2" }}>Actualiza tu contraseña</h3>
            <p className="text-muted">Por seguridad debes definir una nueva contraseña antes de continuar.</p>
            {passwordError && <div className="alert alert-danger">{passwordError}</div>}
            <form className="d-grid gap-3" onSubmit={handlePasswordChange}>
              <div>
                <label className="form-label">Nueva contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  value={nuevoPassword}
                  onChange={(e) => setNuevoPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label className="form-label">Confirmar contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <button className="btn btn-success" type="submit" disabled={passwordLoading}>
                {passwordLoading ? "Guardando..." : "Guardar y continuar"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <ToastContainer />
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <Titulo />
        <div className="d-flex gap-2 flex-wrap">
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Cambiar tema">
            {theme === "light" ? (
              <>
                <i className="bi bi-moon-stars"></i>
                <span>Modo oscuro</span>
              </>
            ) : (
              <>
                <i className="bi bi-sun"></i>
                <span>Modo claro</span>
              </>
            )}
          </button>
          <button className="btn btn-outline-danger" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right"></i> Cerrar sesión
          </button>
        </div>
      </div>

      {profile && (
        <div className="alert alert-info mt-3" role="status">
          <i className="bi bi-person-circle me-2"></i>
          Bienvenido, <strong>{profile.nombre || profile.username}</strong>
        </div>
      )}

      {/* Pestañas de navegación */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${vistaActiva === "dashboard" ? "active" : ""}`}
            onClick={() => setVistaActiva("dashboard")}
          >
            <i className="bi bi-bar-chart-fill"></i> Dashboard
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${vistaActiva === "registrar" ? "active" : ""}`}
            onClick={() => setVistaActiva("registrar")}
          >
            <i className="bi bi-plus-circle"></i> Registrar Entrega
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${vistaActiva === "consultar" ? "active" : ""}`}
            onClick={() => setVistaActiva("consultar")}
          >
            <i className="bi bi-search"></i> Consultar Entregas
          </button>
        </li>
        {esAdmin && (
          <li className="nav-item">
            <button
              className={`nav-link ${vistaActiva === "admin" ? "active" : ""}`}
              onClick={() => setVistaActiva("admin")}
            >
              <i className="bi bi-gear"></i> Administración
            </button>
          </li>
        )}
      </ul>

      {/* Contenido según pestaña activa */}
      {vistaActiva === "dashboard" ? (
        <Dashboard />
      ) : vistaActiva === "registrar" ? (
        <div className="row g-4">
          <div className="col-lg-6">
            <FormEntrega onEntregaRegistrada={refresh} />
          </div>
          <div className="col-lg-6">
            <ListaAsignaciones
              asignaciones={asignaciones}
              loading={loading}
              error={error}
              onRefresh={refresh}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>
      ) : vistaActiva === "consultar" ? (
        <ConsultarEntregas />
      ) : (
        <AdminPanel />
      )}

      <EditEntregaModal
        asignacionId={editingAsignacionId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSaveSuccess}
      />

      {/* Footer con Copyright */}
      <footer className="mt-5 pt-4 pb-3 border-top">
        <div className="text-center">
          <p className="text-muted mb-1" style={{ fontSize: '0.9rem' }}>
            <i className="bi bi-code-slash" style={{ color: '#5FB3A2' }}></i> Gestión de Activos IT
          </p>
          <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
            © {new Date().getFullYear()} Todos los derechos reservados
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
