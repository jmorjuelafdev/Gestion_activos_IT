import "./assets/css/App.css";
import Titulo from "./components/Titulo";
import FormEntrega from "./components/Formulario";
import ListaAsignaciones from "./components/ListaAsignaciones";
import { ToastContainer } from "./toastUtils";
import useAsignaciones from "./hooks/useAsignaciones";

function App() {
  const { asignaciones, loading, error, refresh } = useAsignaciones();

  return (
    <div className="container py-4">
      <ToastContainer />
      <Titulo />

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
          />
        </div>
      </div>
    </div>
  );
}

export default App;
