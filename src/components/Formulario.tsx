import { useEffect, useState } from "react";
import {
  ActivoFormData,
  AsignacionFormData,
  EnvioFormData,
  Oficina,
  UsuarioFormData,
  UsuarioOption,
} from "./interfaces";
import { supabase } from "../lib/supabaseClient";

const emptyEnvio: EnvioFormData = {
  numero_guia: "",
  empresa_envio: "",
  fecha_envio: "",
  oficina_id: "",
  estado_envio: "Pendiente",
  observaciones: "",
};

const emptyUsuario: UsuarioFormData = {
  nombre: "",
  documento: "",
  email: "",
  telefono: "",
  area: "",
  cargo: "",
  oficina_id: "",
};

const baseActivo: ActivoFormData = {
  serial: "",
  tipo: "Laptop",
  marca: "",
  modelo: "",
  estado: "Disponible",
  fecha_compra: "",
  observaciones: "",
};

const emptyAsignacion: AsignacionFormData = {
  fecha_asignacion: "",
  estado: "Activo",
};

type FormEntregaProps = {
  onEntregaRegistrada?: () => void;
};

const FormEntrega = ({ onEntregaRegistrada }: FormEntregaProps) => {
  const [envio, setEnvio] = useState<EnvioFormData>(emptyEnvio);
  const [usuario, setUsuario] = useState<UsuarioFormData>(emptyUsuario);
  const [activos, setActivos] = useState<ActivoFormData[]>([createEmptyActivo()]);
  const [asignacion, setAsignacion] =
    useState<AsignacionFormData>(emptyAsignacion);
  const [oficinas, setOficinas] = useState<Oficina[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioOption[]>([]);
  const [selectedUsuario, setSelectedUsuario] = useState<number | "">("");
  const [isSaving, setIsSaving] = useState(false);
  const [alerta, setAlerta] = useState<
    | { tipo: "success" | "error"; mensaje: string }
    | null
  >(null);

  useEffect(() => {
    const fetchCatalogos = async () => {
      const { data: oficData, error: oficinasError } = await supabase
        .from("oficinas")
        .select("*");
      const { data: usuariosData, error: usuariosError } = await supabase
        .from("usuarios")
        .select("id, nombre, documento, email");

      if (oficData) setOficinas(oficData);
      if (usuariosData) setUsuarios(usuariosData);
      if (oficinasError || usuariosError) {
        console.error("Error cargando catálogos", oficinasError, usuariosError);
      }
    };

    fetchCatalogos();
  }, []);

  const handleAgregarEquipo = () => {
    setActivos((prev) => [...prev, createEmptyActivo()]);
  };

  const handleUpdateActivo = (index: number, patch: Partial<ActivoFormData>) => {
    setActivos((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, ...patch } : item))
    );
  };

  const handleSeleccionUsuario = (id: number | "") => {
    setSelectedUsuario(id);
    if (!id) {
      setUsuario(emptyUsuario);
      return;
    }

    const usuarioExistente = usuarios.find((u) => u.id === id);
    if (usuarioExistente) {
      setUsuario((prev) => ({
        ...prev,
        nombre: usuarioExistente.nombre,
        documento: usuarioExistente.documento,
        email: usuarioExistente.email,
      }));
    }
  };

  const handleGuardarEntrega = async () => {
    if (isSaving) return;

    const activosValidos = activos.filter((a) => a.serial.trim());
    const errores: string[] = [];

    if (!envio.numero_guia.trim()) errores.push("Ingresa el número de guía.");
    if (!envio.oficina_id) errores.push("Selecciona la oficina de destino.");
    if (!envio.fecha_envio) errores.push("Define la fecha de envío.");
    if (!selectedUsuario && !usuario.nombre.trim())
      errores.push("Ingresa el nombre del usuario destino.");
    if (!activosValidos.length)
      errores.push("Registra al menos un equipo con serial.");

    if (errores.length) {
      setAlerta({ tipo: "error", mensaje: errores.join(" ") });
      return;
    }

    setIsSaving(true);
    setAlerta(null);

    const parseNullableNumber = (value: number | "") =>
      value === "" ? null : value;

    try {
      let usuarioId = selectedUsuario || null;

      if (!usuarioId) {
        const { data: nuevoUsuario, error: usuarioError } = await supabase
          .from("usuarios")
          .insert({
            ...usuario,
            oficina_id: parseNullableNumber(usuario.oficina_id),
          })
          .select("id, nombre, documento, email")
          .single();

        if (usuarioError || !nuevoUsuario) {
          throw new Error(usuarioError?.message || "No se pudo crear el usuario");
        }

        usuarioId = nuevoUsuario.id;
        setUsuarios((prev) => [...prev, nuevoUsuario]);
        setSelectedUsuario(nuevoUsuario.id);
      }

      const { data: envioInsertado, error: envioError } = await supabase
        .from("envios")
        .insert({
          ...envio,
          oficina_id: parseNullableNumber(envio.oficina_id),
        })
        .select("id")
        .single();

      if (envioError || !envioInsertado) {
        throw new Error(envioError?.message || "No se pudo crear el envío");
      }

      const activosPayload = activosValidos.map((activo) => ({
        ...activo,
        fecha_compra: activo.fecha_compra || null,
      }));

      const { data: activosInsertados, error: activosError } = await supabase
        .from("activos")
        .insert(activosPayload)
        .select("id, serial");

      if (activosError || !activosInsertados?.length) {
        throw new Error(activosError?.message || "No se pudieron crear los activos");
      }

      const fechaAsignacion =
        asignacion.fecha_asignacion || envio.fecha_envio || new Date().toISOString();

      const asignacionesPayload = activosInsertados.map((activo) => ({
        activo_id: activo.id,
        usuario_id: usuarioId,
        envio_id: envioInsertado.id,
        fecha_asignacion: fechaAsignacion,
        estado: asignacion.estado,
      }));

      const { error: asignacionError } = await supabase
        .from("asignaciones")
        .insert(asignacionesPayload);

      if (asignacionError) {
        throw new Error(asignacionError.message || "No se pudo crear la asignación");
      }

      setAlerta({ tipo: "success", mensaje: "Entrega registrada correctamente." });
      resetFormulario();
      onEntregaRegistrada?.();
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : "Ocurrió un error desconocido";
      setAlerta({ tipo: "error", mensaje });
    } finally {
      setIsSaving(false);
    }
  };

  const resetFormulario = () => {
    setEnvio(emptyEnvio);
    setUsuario(emptyUsuario);
    setActivos([createEmptyActivo()]);
    setAsignacion(emptyAsignacion);
    setSelectedUsuario("");
  };

  return (
    <div className="container px-0">
      <h2 className="fw-bold mb-4">Entrega de Equipos</h2>

      <SeccionCard titulo="Envío (Guía)">
        <EnvioForm envio={envio} oficinas={oficinas} setEnvio={setEnvio} />
      </SeccionCard>

      <SeccionCard titulo="Usuario (Destinatario)">
        <UsuarioForm
          usuario={usuario}
          oficinas={oficinas}
          usuarios={usuarios}
          selectedUsuario={selectedUsuario}
          onSeleccionUsuario={handleSeleccionUsuario}
          setUsuario={setUsuario}
        />
      </SeccionCard>

      <SeccionCard titulo="Equipos (Activos)">
        {activos.map((activo, index) => (
          <ActivoForm
            key={index}
            index={index}
            activo={activo}
            onChange={handleUpdateActivo}
          />
        ))}
        <button
          type="button"
          className="btn btn-outline-primary mt-3"
          onClick={handleAgregarEquipo}>
          + Agregar equipo
        </button>
      </SeccionCard>

      <SeccionCard titulo="Asignación">
        <AsignacionForm
          asignacion={asignacion}
          setAsignacion={setAsignacion}
        />
      </SeccionCard>

      {alerta && (
        <div
          className={`alert alert-${alerta.tipo === "success" ? "success" : "danger"}`}
          role="alert"
        >
          {alerta.mensaje}
        </div>
      )}

      <div className="d-grid gap-2 mt-4">
        <button
          className="btn btn-primary btn-lg"
          onClick={handleGuardarEntrega}
          disabled={isSaving}
        >
          {isSaving ? "Guardando..." : "Guardar entrega"}
        </button>
      </div>
    </div>
  );
};

const SeccionCard: React.FC<{ titulo: string; children: React.ReactNode }> = ({
  titulo,
  children,
}) => (
  <section className="mb-4 border rounded-3 p-4 bg-white shadow-sm">
    <h5 className="fw-bold text-primary text-uppercase mb-3">{titulo}</h5>
    {children}
  </section>
);

const EnvioForm: React.FC<{
  envio: EnvioFormData;
  oficinas: Oficina[];
  setEnvio: React.Dispatch<React.SetStateAction<EnvioFormData>>;
}> = ({ envio, oficinas, setEnvio }) => (
  <div className="row g-3">
    <div className="col-md-4">
      <label className="form-label">Número de guía</label>
      <input
        type="text"
        className="form-control"
        value={envio.numero_guia}
        onChange={(e) =>
          setEnvio((prev) => ({ ...prev, numero_guia: e.target.value }))
        }
      />
    </div>
    <div className="col-md-4">
      <label className="form-label">Empresa de envío</label>
      <input
        type="text"
        className="form-control"
        value={envio.empresa_envio}
        onChange={(e) =>
          setEnvio((prev) => ({ ...prev, empresa_envio: e.target.value }))
        }
      />
    </div>
    <div className="col-md-4">
      <label className="form-label">Fecha de envío</label>
      <input
        type="date"
        className="form-control"
        value={envio.fecha_envio}
        onChange={(e) =>
          setEnvio((prev) => ({ ...prev, fecha_envio: e.target.value }))
        }
      />
    </div>
    <div className="col-md-4">
      <label className="form-label">Oficina destino</label>
      <select
        className="form-select"
        value={envio.oficina_id}
        onChange={(e) =>
          setEnvio((prev) => ({ ...prev, oficina_id: Number(e.target.value) }))
        }>
        <option value="">Seleccione la oficina</option>
        {oficinas.map((of) => (
          <option key={of.id} value={of.id}>
            {of.nombre} - {of.ciudad}
          </option>
        ))}
      </select>
    </div>
    <div className="col-md-4">
      <label className="form-label">Estado del envío</label>
      <select
        className="form-select"
        value={envio.estado_envio}
        onChange={(e) =>
          setEnvio((prev) => ({ ...prev, estado_envio: e.target.value }))
        }>
        <option>Pendiente</option>
        <option>En tránsito</option>
        <option>Entregado</option>
      </select>
    </div>
    <div className="col-12">
      <label className="form-label">Observaciones</label>
      <textarea
        className="form-control"
        rows={2}
        value={envio.observaciones}
        onChange={(e) =>
          setEnvio((prev) => ({ ...prev, observaciones: e.target.value }))
        }
      />
    </div>
  </div>
);

const UsuarioForm: React.FC<{
  usuario: UsuarioFormData;
  oficinas: Oficina[];
  usuarios: UsuarioOption[];
  selectedUsuario: number | "";
  onSeleccionUsuario: (id: number | "") => void;
  setUsuario: React.Dispatch<React.SetStateAction<UsuarioFormData>>;
}> = ({
  usuario,
  oficinas,
  usuarios,
  selectedUsuario,
  onSeleccionUsuario,
  setUsuario,
}) => (
  <div className="row g-3">
    <div className="col-md-6">
      <label className="form-label">Usuario existente</label>
      <select
        className="form-select"
        value={selectedUsuario}
        onChange={(e) => onSeleccionUsuario(Number(e.target.value) || "")}
      >
        <option value="">Crear usuario nuevo</option>
        {usuarios.map((user) => (
          <option key={user.id} value={user.id}>
            {user.documento} - {user.nombre}
          </option>
        ))}
      </select>
    </div>
    <div className="col-md-6">
      <label className="form-label">Nombre</label>
      <input
        type="text"
        className="form-control"
        value= {usuario.nombre}
        onChange={(e) =>
          setUsuario((prev) => ({ ...prev, nombre: e.target.value }))
        }
      />
    </div>
    <div className="col-md-4">
      <label className="form-label">Documento</label>
      <input
        type="text"
        className="form-control"
        value={usuario.documento}
        onChange={(e) =>
          setUsuario((prev) => ({ ...prev, documento: e.target.value }))
        }
      />
    </div>
    <div className="col-md-4">
      <label className="form-label">Email</label>
      <input
        type="email"
        className="form-control"
        value={usuario.email}
        onChange={(e) =>
          setUsuario((prev) => ({ ...prev, email: e.target.value }))
        }
      />
    </div>
    <div className="col-md-4">
      <label className="form-label">Teléfono</label>
      <input
        type="text"
        className="form-control"
        value={usuario.telefono}
        onChange={(e) =>
          setUsuario((prev) => ({ ...prev, telefono: e.target.value }))
        }
      />
    </div>
    <div className="col-md-6">
      <label className="form-label">Área</label>
      <input
        type="text"
        className="form-control"
        value={usuario.area}
        onChange={(e) =>
          setUsuario((prev) => ({ ...prev, area: e.target.value }))
        }
      />
    </div>
    <div className="col-md-6">
      <label className="form-label">Cargo</label>
      <input
        type="text"
        className="form-control"
        value={usuario.cargo}
        onChange={(e) =>
          setUsuario((prev) => ({ ...prev, cargo: e.target.value }))
        }
      />
    </div>
    <div className="col-md-6">
      <label className="form-label">Oficina</label>
      <select
        className="form-select"
        value={usuario.oficina_id}
        onChange={(e) =>
          setUsuario((prev) => ({ ...prev, oficina_id: Number(e.target.value) }))
        }>
        <option value="">Seleccione</option>
        {oficinas.map((of) => (
          <option key={of.id} value={of.id}>
            {of.nombre}
          </option>
        ))}
      </select>
    </div>
  </div>
);

const ActivoForm: React.FC<{
  index: number;
  activo: ActivoFormData;
  onChange: (idx: number, patch: Partial<ActivoFormData>) => void;
}> = ({ index, activo, onChange }) => (
  <div className="border rounded-3 p-3 mb-3">
    <p className="fw-semibold text-secondary mb-3">
      Equipo #{index + 1}
    </p>
    <div className="row g-3">
      <div className="col-md-4">
        <label className="form-label">Serial</label>
        <input
          type="text"
          className="form-control"
          value={activo.serial}
          onChange={(e) => onChange(index, { serial: e.target.value })}
        />
      </div>
      <div className="col-md-4">
        <label className="form-label">Tipo</label>
        <select
          className="form-select"
          value={activo.tipo}
          onChange={(e) => onChange(index, { tipo: e.target.value })}
        >
          <option>Laptop</option>
          <option>PC</option>
          <option>Impresora</option>
        </select>
      </div>
      <div className="col-md-4">
        <label className="form-label">Marca</label>
        <input
          type="text"
          className="form-control"
          value={activo.marca}
          onChange={(e) => onChange(index, { marca: e.target.value })}
        />
      </div>
      <div className="col-md-4">
        <label className="form-label">Modelo</label>
        <input
          type="text"
          className="form-control"
          value={activo.modelo}
          onChange={(e) => onChange(index, { modelo: e.target.value })}
        />
      </div>
      <div className="col-md-4">
        <label className="form-label">Estado</label>
        <select
          className="form-select"
          value={activo.estado}
          onChange={(e) => onChange(index, { estado: e.target.value })}
        >
          <option>Disponible</option>
          <option>Asignado</option>
          <option>En mantenimiento</option>
        </select>
      </div>
      <div className="col-md-4">
        <label className="form-label">Fecha de compra</label>
        <input
          type="date"
          className="form-control"
          value={activo.fecha_compra}
          onChange={(e) => onChange(index, { fecha_compra: e.target.value })}
        />
      </div>
      <div className="col-12">
        <label className="form-label">Observaciones</label>
        <textarea
          rows={2}
          className="form-control"
          value={activo.observaciones}
          onChange={(e) => onChange(index, { observaciones: e.target.value })}
        />
      </div>
    </div>
  </div>
);

const AsignacionForm: React.FC<{
  asignacion: AsignacionFormData;
  setAsignacion: React.Dispatch<React.SetStateAction<AsignacionFormData>>;
}> = ({ asignacion, setAsignacion }) => (
  <div className="row g-3">
    <div className="col-md-6">
      <label className="form-label">Fecha de asignación</label>
      <input
        type="date"
        className="form-control"
        value={asignacion.fecha_asignacion}
        onChange={(e) =>
          setAsignacion((prev) => ({ ...prev, fecha_asignacion: e.target.value }))
        }
      />
    </div>
    <div className="col-md-6">
      <label className="form-label">Estado</label>
      <select
        className="form-select"
        value={asignacion.estado}
        onChange={(e) =>
          setAsignacion((prev) => ({ ...prev, estado: e.target.value }))
        }>
        <option>Activo</option>
        <option>En tránsito</option>
        <option>Entregado</option>
      </select>
    </div>
  </div>
);

function createEmptyActivo(): ActivoFormData {
  return { ...baseActivo };
}

export default FormEntrega;
