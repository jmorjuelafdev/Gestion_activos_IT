import { useState } from "react";
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

function App() {
  const { asignaciones, loading, error, refresh } = useAsignaciones();
  const [editingAsignacionId, setEditingAsignacionId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vistaActiva, setVistaActiva] = useState<"dashboard" | "registrar" | "consultar">("dashboard");

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

  return (
    <div className="container-fluid py-4">
      <ToastContainer />
      <Titulo />

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
      ) : (
        <ConsultarEntregas />
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
