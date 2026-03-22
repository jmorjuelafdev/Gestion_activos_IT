import { useState } from "react";
import { OficinaFormData, UsuarioFormData, EnvioFormData } from "./interfaces";
import { supabase } from "../lib/supabaseClient";
import useRegionales from "../hooks/useRegionales";
import useCiudades from "../hooks/useCiudades";
import useLocalidades from "../hooks/useLocalidades";
import Swal from "sweetalert2";

type ActivoSimple = {
  tipo: string;
  marca: string;
  modelo: string;
  serial: string;
};

type FormEntregaProps = {
  onEntregaRegistrada?: () => void;
};

function FormEntrega({ onEntregaRegistrada }: FormEntregaProps) {
  const [oficina, setOficina] = useState<OficinaFormData>({
    regional: "",
    ciudad: "",
    departamento: "",
    localidad: "",
    empresa: "",
    nombre: "",
    direccion: "",
    area: "",
    responsable_nombre: "",
    responsable_documento: "",
    telefono: "",
    email: "",
  });

  const [usuario, setUsuario] = useState<Partial<UsuarioFormData>>({
    nombre: "",
    documento: "",
    email: "",
    telefono: "",
    area: "",
  });

  const [envio, setEnvio] = useState<Partial<EnvioFormData>>({
    numero_guia: "",
    empresa_envio: "",
    fecha_envio: "",
  });

  const [activos, setActivos] = useState<ActivoSimple[]>([]);
  const [activoActual, setActivoActual] = useState<ActivoSimple>({
    tipo: "",
    marca: "",
    modelo: "",
    serial: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [erroresCampos, setErroresCampos] = useState<{
    // Oficina
    regional?: string;
    ciudad?: string;
    departamento?: string;
    empresa?: string;
    oficinaNombre?: string;
    direccion?: string;
    area?: string;
    responsableNombre?: string;
    responsableDocumento?: string;
    telefono?: string;
    email?: string;
    // Usuario
    usuarioNombre?: string;
    usuarioDocumento?: string;
    usuarioEmail?: string;
    usuarioTelefono?: string;
    usuarioArea?: string;
    // Envio
    envioGuia?: string;
    envioEmpresa?: string;
    envioFecha?: string;
    // Activos
    activos?: string;
  }>({});

  const guardarTodo = async () => {
    if (isSaving) return;

    const nuevosErrores: typeof erroresCampos = {};

    // Validar Oficina
    if (!oficina.regional.trim()) nuevosErrores.regional = "Regional requerida";
    if (!oficina.ciudad.trim()) nuevosErrores.ciudad = "Ciudad requerida";
    if (!oficina.departamento.trim()) nuevosErrores.departamento = "Departamento requerido";
    if (!oficina.empresa.trim()) nuevosErrores.empresa = "Empresa requerida";
    if (!oficina.nombre.trim()) nuevosErrores.oficinaNombre = "Nombre de oficina requerido";
    if (!oficina.direccion.trim()) nuevosErrores.direccion = "Dirección requerida";
    if (!oficina.area.trim()) nuevosErrores.area = "Área requerida";
    if (!oficina.responsable_nombre.trim()) nuevosErrores.responsableNombre = "Nombre del responsable requerido";
    if (!oficina.responsable_documento.trim()) nuevosErrores.responsableDocumento = "Documento del responsable requerido";
    if (!oficina.telefono.trim()) nuevosErrores.telefono = "Teléfono requerido";
    if (!oficina.email.trim()) nuevosErrores.email = "Email requerido";

    // Validar Usuario
    if (!usuario.nombre?.trim()) nuevosErrores.usuarioNombre = "Nombre del usuario requerido";
    if (!usuario.documento?.trim()) nuevosErrores.usuarioDocumento = "Documento del usuario requerido";
    if (!usuario.email?.trim()) nuevosErrores.usuarioEmail = "Email del usuario requerido";
    if (!usuario.telefono?.trim()) nuevosErrores.usuarioTelefono = "Teléfono del usuario requerido";
    if (!usuario.area?.trim()) nuevosErrores.usuarioArea = "Área del usuario requerida";

    // Validar Envío
    if (!envio.numero_guia?.trim()) nuevosErrores.envioGuia = "Número de guía requerido";
    if (!envio.empresa_envio?.trim()) nuevosErrores.envioEmpresa = "Empresa de envío requerida";
    if (!envio.fecha_envio) nuevosErrores.envioFecha = "Fecha de envío requerida";

    // Validar Activos
    if (activos.length === 0) nuevosErrores.activos = "Debes agregar al menos un equipo";


    setErroresCampos(nuevosErrores);

    if (Object.keys(nuevosErrores).length > 0) {
      Swal.fire({
        icon: "error",
        title: "Campos incompletos",
        text: "Por favor corrige los campos marcados en rojo",
        confirmButtonColor: "#0d6efd"
      });
      return;
    }

    setIsSaving(true);
    setErroresCampos({});

    try {
      const { data: oficinaInsertada, error: oficinaError } = await supabase
        .from("oficinas")
        .insert(oficina)
        .select()
        .single();

      if (oficinaError || !oficinaInsertada) {
        throw new Error(oficinaError?.message || "No se pudo crear la oficina");
      }

      const oficinaId = oficinaInsertada.id;

      const { data: usuarioInsertado, error: usuarioError } = await supabase
        .from("usuarios")
        .insert({
          ...usuario,
          oficina_id: oficinaId,
        })
        .select()
        .single();

      if (usuarioError || !usuarioInsertado) {
        throw new Error(usuarioError?.message || "No se pudo crear el usuario");
      }

      const usuarioId = usuarioInsertado.id;

      const { data: envioInsertado, error: envioError } = await supabase
        .from("envios")
        .insert({
          ...envio,
          oficina_id: oficinaId,
          estado_envio: "Pendiente",
          observaciones: "",
        })
        .select()
        .single();

      if (envioError || !envioInsertado) {
        throw new Error(envioError?.message || "No se pudo crear el envío");
      }

      const envioId = envioInsertado.id;

      const activosPayload = activos.map((activo) => ({
        tipo: activo.tipo,
        marca: activo.marca,
        modelo: activo.modelo,
        serial: activo.serial,
        estado: "Asignado",
        fecha_compra: null,
        observaciones: "",
      }));

      const { data: activosInsertados, error: activosError } = await supabase
        .from("activos")
        .insert(activosPayload)
        .select();

      if (activosError || !activosInsertados?.length) {
        throw new Error(activosError?.message || "No se pudieron crear los activos");
      }

      const fechaAsignacion = envio.fecha_envio || new Date().toISOString().split("T")[0];

      const asignacionesPayload = activosInsertados.map((activo) => ({
        activo_id: activo.id,
        usuario_id: usuarioId,
        envio_id: envioId,
        fecha_asignacion: fechaAsignacion,
        estado: "En tránsito",
      }));

      const { error: asignacionError } = await supabase
        .from("asignaciones")
        .insert(asignacionesPayload);

      if (asignacionError) {
        throw new Error(asignacionError.message || "No se pudo crear la asignación");
      }

      await Swal.fire({
        icon: "success",
        title: "¡Entrega registrada!",
        text: "La entrega se ha registrado correctamente",
        confirmButtonColor: "#0d6efd",
        timer: 2000
      });
      
      setOficina({
        regional: "",
        ciudad: "",
        departamento: "",
        localidad: "",
        empresa: "",
        nombre: "",
        direccion: "",
        area: "",
        responsable_nombre: "",
        responsable_documento: "",
        telefono: "",
        email: "",
      });
      setUsuario({
        nombre: "",
        documento: "",
        email: "",
        telefono: "",
        area: "",
      });
      setEnvio({
        numero_guia: "",
        empresa_envio: "",
        fecha_envio: "",
      });
      setActivos([]);
      setActivoActual({
        tipo: "",
        marca: "",
        modelo: "",
        serial: "",
      });

      if (onEntregaRegistrada) {
        onEntregaRegistrada();
      }
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : "Ocurrió un error desconocido";
      Swal.fire({
        icon: "error",
        title: "Error al guardar",
        text: mensaje,
        confirmButtonColor: "#0d6efd"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="fw-bold mb-4">Entrega de Equipos</h2>

      <SeccionOficina 
        oficina={oficina} 
        setOficina={setOficina}
        errores={{
          regional: erroresCampos.regional,
          ciudad: erroresCampos.ciudad,
          departamento: erroresCampos.departamento,
          empresa: erroresCampos.empresa,
          nombre: erroresCampos.oficinaNombre,
          direccion: erroresCampos.direccion,
          area: erroresCampos.area,
          responsableNombre: erroresCampos.responsableNombre,
          responsableDocumento: erroresCampos.responsableDocumento,
          telefono: erroresCampos.telefono,
          email: erroresCampos.email,
        }}
        onClearError={(field) => setErroresCampos(prev => ({ ...prev, [field]: undefined }))}
      />
      <SeccionUsuario 
        usuario={usuario} 
        setUsuario={setUsuario}
        errores={{
          nombre: erroresCampos.usuarioNombre,
          documento: erroresCampos.usuarioDocumento,
          email: erroresCampos.usuarioEmail,
          telefono: erroresCampos.usuarioTelefono,
          area: erroresCampos.usuarioArea,
        }}
        onClearError={(field) => setErroresCampos(prev => ({ ...prev, [field]: undefined }))}
      />
      <SeccionEnvio 
        envio={envio} 
        setEnvio={setEnvio}
        errores={{
          guia: erroresCampos.envioGuia,
          empresa: erroresCampos.envioEmpresa,
          fecha: erroresCampos.envioFecha,
        }}
        onClearError={(field) => setErroresCampos(prev => ({ ...prev, [field]: undefined }))}
      />
      <SeccionActivos
        activos={activos}
        setActivos={setActivos}
        activoActual={activoActual}
        setActivoActual={setActivoActual}
        error={erroresCampos.activos}
        onClearError={() => setErroresCampos(prev => ({ ...prev, activos: undefined }))}
      />

      <button
        className="btn btn-primary mt-3 btn-lg w-100"
        onClick={guardarTodo}
        disabled={isSaving}
      >
        {isSaving ? "Guardando..." : "Guardar Entrega"}
      </button>
    </div>
  );
}

function SeccionOficina({
  oficina,
  setOficina,
  errores,
  onClearError,
}: {
  oficina: OficinaFormData;
  setOficina: React.Dispatch<React.SetStateAction<OficinaFormData>>;
  errores: {
    regional?: string;
    ciudad?: string;
    departamento?: string;
    empresa?: string;
    nombre?: string;
    direccion?: string;
    area?: string;
    responsableNombre?: string;
    responsableDocumento?: string;
    telefono?: string;
    email?: string;
  };
  onClearError: (field: string) => void;
}) {
  const { regionales, loading } = useRegionales();
  const { ciudades, loading: loadingCiudades } = useCiudades(oficina.regional);
  const { localidades, loading: loadingLocalidades } = useLocalidades(oficina.ciudad);
  
  const isBogotaCiudad = oficina.ciudad && oficina.ciudad.startsWith("Bogotá");

  return (
    <div className="card p-3 mt-3 shadow-sm">
      <h5 className="fw-bold mb-3" style={{ color: "#5FB3A2" }}>🏢 Oficina que recibe</h5>

      <div className="row g-2">
        <div className="col-md-6">
          <label className="form-label small text-muted">Regional *</label>
          <select
            className={`form-select ${errores.regional ? 'is-invalid' : ''}`}
            value={oficina.regional}
            onChange={(e) => {
              const newRegional = e.target.value;
              setOficina({ 
                ...oficina, 
                regional: newRegional,
                ciudad: "",
                localidad: ""
              });
              if (errores.regional) onClearError('regional');
            }}
            disabled={loading}
          >
            <option value="">Selecciona una regional</option>
            {regionales.map((reg) => (
              <option key={reg.id} value={reg.nombre}>
                {reg.nombre}
              </option>
            ))}
          </select>
          {errores.regional && <div className="invalid-feedback d-block">{errores.regional}</div>}
        </div>

        <div className="col-md-6">
          <label className="form-label small text-muted">Ciudad *</label>
          <select
            className={`form-select ${errores.ciudad ? 'is-invalid' : ''}`}
            value={oficina.ciudad}
            onChange={(e) => {
              const newCiudad = e.target.value;
              setOficina({ 
                ...oficina, 
                ciudad: newCiudad,
                localidad: ""
              });
              if (errores.ciudad) onClearError('ciudad');
            }}
            disabled={!oficina.regional || loadingCiudades}
          >
            <option value="">{!oficina.regional ? "Selecciona primero una regional" : "Selecciona una ciudad"}</option>
            {ciudades.map((ciudad) => (
              <option key={ciudad.id} value={ciudad.nombre}>
                {ciudad.nombre}
              </option>
            ))}
          </select>
          {errores.ciudad && <div className="invalid-feedback d-block">{errores.ciudad}</div>}
        </div>

        <div className="col-md-6">
          <label className="form-label small text-muted">Departamento *</label>
          <input
            className={`form-control ${errores.departamento ? 'is-invalid' : ''}`}
            placeholder="Departamento"
            value={oficina.departamento}
            onChange={(e) => {
              setOficina({ ...oficina, departamento: e.target.value });
              if (errores.departamento) onClearError('departamento');
            }}
          />
          {errores.departamento && <div className="invalid-feedback d-block">{errores.departamento}</div>}
        </div>

        {isBogotaCiudad && (
          <div className="col-md-6">
            <label className="form-label small text-muted">Localidad</label>
            <select
              className="form-select"
              value={oficina.localidad || ""}
              onChange={(e) => setOficina({ ...oficina, localidad: e.target.value })}
              disabled={!oficina.ciudad || loadingLocalidades}
            >
              <option value="">Selecciona una localidad</option>
              {localidades.map((localidad) => (
                <option key={localidad.id} value={localidad.nombre}>
                  {localidad.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="col-md-6">
          <label className="form-label small text-muted">Empresa *</label>
          <input
            className={`form-control ${errores.empresa ? 'is-invalid' : ''}`}
            placeholder="Empresa"
            value={oficina.empresa}
            onChange={(e) => {
              setOficina({ ...oficina, empresa: e.target.value });
              if (errores.empresa) onClearError('empresa');
            }}
          />
          {errores.empresa && <div className="invalid-feedback d-block">{errores.empresa}</div>}
        </div>

        <div className="col-md-6">
          <label className="form-label small text-muted">Nombre de la Oficina *</label>
          <input
            className={`form-control ${errores.nombre ? 'is-invalid' : ''}`}
            placeholder="Nombre de la Oficina"
            value={oficina.nombre}
            onChange={(e) => {
              setOficina({ ...oficina, nombre: e.target.value });
              if (errores.nombre) onClearError('oficinaNombre');
            }}
          />
          {errores.nombre && <div className="invalid-feedback d-block">{errores.nombre}</div>}
        </div>

        <div className="col-md-6">
          <label className="form-label small text-muted">Área *</label>
          <input
            className={`form-control ${errores.area ? 'is-invalid' : ''}`}
            placeholder="Área"
            value={oficina.area}
            onChange={(e) => {
              setOficina({ ...oficina, area: e.target.value });
              if (errores.area) onClearError('area');
            }}
          />
          {errores.area && <div className="invalid-feedback d-block">{errores.area}</div>}
        </div>

        <div className="col-12">
          <label className="form-label small text-muted">Dirección *</label>
          <input
            className={`form-control ${errores.direccion ? 'is-invalid' : ''}`}
            placeholder="Dirección"
            value={oficina.direccion}
            onChange={(e) => {
              setOficina({ ...oficina, direccion: e.target.value });
              if (errores.direccion) onClearError('direccion');
            }}
          />
          {errores.direccion && <div className="invalid-feedback d-block">{errores.direccion}</div>}
        </div>

        <div className="col-md-6">
          <label className="form-label small text-muted">Nombre del Responsable *</label>
          <input
            className={`form-control ${errores.responsableNombre ? 'is-invalid' : ''}`}
            placeholder="Nombre del Responsable"
            value={oficina.responsable_nombre}
            onChange={(e) => {
              setOficina({ ...oficina, responsable_nombre: e.target.value });
              if (errores.responsableNombre) onClearError('responsableNombre');
            }}
          />
          {errores.responsableNombre && <div className="invalid-feedback d-block">{errores.responsableNombre}</div>}
        </div>

        <div className="col-md-6">
          <label className="form-label small text-muted">Documento del Responsable *</label>
          <input
            className={`form-control ${errores.responsableDocumento ? 'is-invalid' : ''}`}
            placeholder="Documento del Responsable"
            value={oficina.responsable_documento}
            onChange={(e) => {
              setOficina({ ...oficina, responsable_documento: e.target.value });
              if (errores.responsableDocumento) onClearError('responsableDocumento');
            }}
          />
          {errores.responsableDocumento && <div className="invalid-feedback d-block">{errores.responsableDocumento}</div>}
        </div>

        <div className="col-md-6">
          <label className="form-label small text-muted">Teléfono *</label>
          <input
            className={`form-control ${errores.telefono ? 'is-invalid' : ''}`}
            placeholder="Teléfono"
            value={oficina.telefono}
            onChange={(e) => {
              setOficina({ ...oficina, telefono: e.target.value });
              if (errores.telefono) onClearError('telefono');
            }}
          />
          {errores.telefono && <div className="invalid-feedback d-block">{errores.telefono}</div>}
        </div>

        <div className="col-md-6">
          <label className="form-label small text-muted">Email *</label>
          <input
            type="email"
            className={`form-control ${errores.email ? 'is-invalid' : ''}`}
            placeholder="Email"
            value={oficina.email}
            onChange={(e) => {
              setOficina({ ...oficina, email: e.target.value });
              if (errores.email) onClearError('email');
            }}
          />
          {errores.email && <div className="invalid-feedback d-block">{errores.email}</div>}
        </div>
      </div>
    </div>
  );
}

function SeccionUsuario({
  usuario,
  setUsuario,
  errores,
  onClearError,
}: {
  usuario: Partial<UsuarioFormData>;
  setUsuario: React.Dispatch<React.SetStateAction<Partial<UsuarioFormData>>>;
  errores?: { nombre?: string; documento?: string; email?: string; telefono?: string; area?: string };
  onClearError: (field: string) => void;
}) {
  return (
    <div className="card p-3 mt-3 shadow-sm">
      <h5 className="fw-bold mb-3" style={{ color: "#5FB3A2" }}>👤 Usuario final</h5>

      <div className="mb-2">
        <input
          className={`form-control ${errores?.nombre ? 'is-invalid' : ''}`}
          placeholder="Nombre"
          value={usuario.nombre || ""}
          onChange={(e) => {
            setUsuario({ ...usuario, nombre: e.target.value });
            if (errores?.nombre) onClearError('usuarioNombre');
          }}
        />
        {errores?.nombre && <div className="invalid-feedback d-block">{errores.nombre}</div>}
      </div>

      <div className="mb-2">
        <input
          className={`form-control ${errores?.documento ? 'is-invalid' : ''}`}
          placeholder="Documento"
          value={usuario.documento || ""}
          onChange={(e) => {
            setUsuario({ ...usuario, documento: e.target.value });
            if (errores?.documento) onClearError('usuarioDocumento');
          }}
        />
        {errores?.documento && <div className="invalid-feedback d-block">{errores.documento}</div>}
      </div>

      <div className="mb-2">
        <input
          className={`form-control ${errores?.email ? 'is-invalid' : ''}`}
          placeholder="Email *"
          type="email"
          value={usuario.email || ""}
          onChange={(e) => {
            setUsuario({ ...usuario, email: e.target.value });
            if (errores?.email) onClearError('usuarioEmail');
          }}
        />
        {errores?.email && <div className="invalid-feedback d-block">{errores.email}</div>}
      </div>

      <div className="mb-2">
        <input
          className={`form-control ${errores?.telefono ? 'is-invalid' : ''}`}
          placeholder="Teléfono *"
          value={usuario.telefono || ""}
          onChange={(e) => {
            setUsuario({ ...usuario, telefono: e.target.value });
            if (errores?.telefono) onClearError('usuarioTelefono');
          }}
        />
        {errores?.telefono && <div className="invalid-feedback d-block">{errores.telefono}</div>}
      </div>

      <div className="mb-2">
        <input
          className={`form-control ${errores?.area ? 'is-invalid' : ''}`}
          placeholder="Área *"
          value={usuario.area || ""}
          onChange={(e) => {
            setUsuario({ ...usuario, area: e.target.value });
            if (errores?.area) onClearError('usuarioArea');
          }}
        />
        {errores?.area && <div className="invalid-feedback d-block">{errores.area}</div>}
      </div>
    </div>
  );
}

function SeccionEnvio({
  envio,
  setEnvio,
  errores,
  onClearError,
}: {
  envio: Partial<EnvioFormData>;
  setEnvio: React.Dispatch<React.SetStateAction<Partial<EnvioFormData>>>;
  errores?: { guia?: string; empresa?: string; fecha?: string };
  onClearError: (field: string) => void;
}) {
  return (
    <div className="card p-3 mt-3 shadow-sm">
      <h5 className="fw-bold mb-3" style={{ color: "#5FB3A2" }}>🚚 Datos de envío</h5>

      <div className="mb-2">
        <input
          className={`form-control ${errores?.guia ? 'is-invalid' : ''}`}
          placeholder="Número de guía"
          value={envio.numero_guia || ""}
          onChange={(e) => {
            setEnvio({ ...envio, numero_guia: e.target.value });
            if (errores?.guia) onClearError('envioGuia');
          }}
        />
        {errores?.guia && <div className="invalid-feedback d-block">{errores.guia}</div>}
      </div>

      <div className="mb-2">
        <input
          className={`form-control ${errores?.empresa ? 'is-invalid' : ''}`}
          placeholder="Empresa de envío *"
          value={envio.empresa_envio || ""}
          onChange={(e) => {
            setEnvio({ ...envio, empresa_envio: e.target.value });
            if (errores?.empresa) onClearError('envioEmpresa');
          }}
        />
        {errores?.empresa && <div className="invalid-feedback d-block">{errores.empresa}</div>}
      </div>

      <div className="mb-2">
        <input
          type="date"
          className={`form-control ${errores?.fecha ? 'is-invalid' : ''}`}
          value={envio.fecha_envio || ""}
          onChange={(e) => {
            setEnvio({ ...envio, fecha_envio: e.target.value });
            if (errores?.fecha) onClearError('envioFecha');
          }}
        />
        {errores?.fecha && <div className="invalid-feedback d-block">{errores.fecha}</div>}
      </div>
    </div>
  );
}

function SeccionActivos({
  activos,
  setActivos,
  activoActual,
  setActivoActual,
  error,
  onClearError,
}: {
  activos: ActivoSimple[];
  setActivos: React.Dispatch<React.SetStateAction<ActivoSimple[]>>;
  activoActual: ActivoSimple;
  setActivoActual: React.Dispatch<React.SetStateAction<ActivoSimple>>;
  error?: string;
  onClearError: () => void;
}) {
  const agregarActivo = () => {
    if (activoActual.serial.trim()) {
      setActivos([...activos, activoActual]);
      setActivoActual({
        tipo: "",
        marca: "",
        modelo: "",
        serial: "",
      });
      if (error) onClearError();
    }
  };

  const eliminarActivo = (index: number) => {
    setActivos(activos.filter((_, i) => i !== index));
  };

  return (
    <div className="card p-3 mt-3 shadow-sm">
      <h5 className="fw-bold mb-3" style={{ color: "#5FB3A2" }}>💻 Equipos</h5>
      {error && (
        <div className="alert alert-danger py-2">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      <div className="row g-2">
        <div className="col-md-3">
          <input
            className="form-control"
            placeholder="Tipo"
            value={activoActual.tipo}
            onChange={(e) => setActivoActual({ ...activoActual, tipo: e.target.value })}
          />
        </div>

        <div className="col-md-3">
          <input
            className="form-control"
            placeholder="Marca"
            value={activoActual.marca}
            onChange={(e) => setActivoActual({ ...activoActual, marca: e.target.value })}
          />
        </div>

        <div className="col-md-3">
          <input
            className="form-control"
            placeholder="Modelo"
            value={activoActual.modelo}
            onChange={(e) => setActivoActual({ ...activoActual, modelo: e.target.value })}
          />
        </div>

        <div className="col-md-3">
          <input
            className="form-control"
            placeholder="Serial"
            value={activoActual.serial}
            onChange={(e) => setActivoActual({ ...activoActual, serial: e.target.value })}
          />
        </div>
      </div>

      <button className="btn btn-success mt-3" onClick={agregarActivo}>
        + Agregar equipo
      </button>

      {activos.length > 0 && (
        <ul className="list-group mt-3">
          {activos.map((a, index) => (
            <li
              key={index}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <span>
                <strong>{a.tipo}</strong> - {a.marca} - {a.modelo} - <code>{a.serial}</code>
              </span>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => eliminarActivo(index)}
              >
                <i className="bi bi-trash"></i>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default FormEntrega;
