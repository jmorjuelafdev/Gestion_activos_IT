import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import useEntregaCompleta, { EntregaCompleta } from "../hooks/useEntregaCompleta";
import useRegionales from "../hooks/useRegionales";
import useCiudades from "../hooks/useCiudades";
import useLocalidades from "../hooks/useLocalidades";
import Swal from "sweetalert2";

type EditEntregaModalProps = {
  asignacionId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function EditEntregaModal({ asignacionId, isOpen, onClose, onSuccess }: EditEntregaModalProps) {
  const { entrega, loading: loadingEntrega, error: errorEntrega, fetchEntrega } = useEntregaCompleta();
  const { regionales } = useRegionales();
  const [selectedRegional, setSelectedRegional] = useState("");
  const [selectedCiudad, setSelectedCiudad] = useState("");
  const { ciudades } = useCiudades(selectedRegional);
  const { localidades } = useLocalidades(selectedCiudad);
  
  const [formData, setFormData] = useState<EntregaCompleta | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (asignacionId && isOpen) {
      fetchEntrega(asignacionId);
    }
  }, [asignacionId, isOpen]);

  useEffect(() => {
    if (entrega) {
      setFormData(entrega);
      setSelectedRegional(entrega.oficina.regional);
      setSelectedCiudad(entrega.oficina.ciudad);
    }
  }, [entrega]);

  const handleSave = async () => {
    if (!formData) return;

    try {
      setIsSaving(true);

      // 1. Actualizar oficina
      const { error: oficinaError } = await supabase
        .from("oficinas")
        .update({
          regional: formData.oficina.regional,
          ciudad: formData.oficina.ciudad,
          departamento: formData.oficina.departamento,
          localidad: formData.oficina.localidad,
          empresa: formData.oficina.empresa,
          nombre: formData.oficina.nombre,
          direccion: formData.oficina.direccion,
          area: formData.oficina.area,
          responsable_nombre: formData.oficina.responsable_nombre,
          responsable_documento: formData.oficina.responsable_documento,
          telefono: formData.oficina.telefono,
          email: formData.oficina.email,
        })
        .eq("id", formData.oficina.id);

      if (oficinaError) throw oficinaError;

      // 2. Actualizar usuario
      const { error: usuarioError } = await supabase
        .from("usuarios")
        .update({
          nombre: formData.usuario.nombre,
          documento: formData.usuario.documento,
          email: formData.usuario.email,
          telefono: formData.usuario.telefono,
          area: formData.usuario.area,
        })
        .eq("id", formData.usuario.id);

      if (usuarioError) throw usuarioError;

      // 3. Actualizar envío
      const { error: envioError } = await supabase
        .from("envios")
        .update({
          numero_guia: formData.envio.numero_guia,
          empresa_envio: formData.envio.empresa_envio,
          fecha_envio: formData.envio.fecha_envio,
          estado_envio: formData.envio.estado_envio,
          observaciones: formData.envio.observaciones,
        })
        .eq("id", formData.envio.id);

      if (envioError) throw envioError;

      // 4. Actualizar asignación
      const { error: asignacionError } = await supabase
        .from("asignaciones")
        .update({
          estado: formData.estado,
          fecha_asignacion: formData.fecha_asignacion,
        })
        .eq("id", formData.asignacion_id);

      if (asignacionError) throw asignacionError;

      await Swal.fire({
        icon: "success",
        title: "¡Cambios guardados!",
        text: "La entrega se ha actualizado correctamente",
        confirmButtonColor: "#0d6efd",
        timer: 2000
      });

      onSuccess();
      onClose();
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : "Error al guardar";
      Swal.fire({
        icon: "error",
        title: "Error al guardar",
        text: mensaje,
        confirmButtonColor: "#0d6efd"
      });
      console.error("Error saving entrega:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const isBogotaCiudad = selectedCiudad && selectedCiudad.startsWith("Bogotá");

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-xl modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">✏️ Editar Entrega</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {loadingEntrega && <div className="text-center py-4">Cargando datos...</div>}
            
            {errorEntrega && (
              <div className="alert alert-danger">{errorEntrega}</div>
            )}

            {formData && (
              <div>
                {/* Sección Oficina */}
                <div className="card p-3 mb-3">
                  <h6 className="fw-bold mb-3" style={{ color: "#5FB3A2" }}>🏢 Oficina que recibe</h6>
                  <div className="row g-2">
                    <div className="col-md-6">
                      <label className="form-label small">Regional</label>
                      <select
                        className="form-select"
                        value={formData.oficina.regional}
                        onChange={(e) => {
                          setSelectedRegional(e.target.value);
                          setFormData({
                            ...formData,
                            oficina: { ...formData.oficina, regional: e.target.value, ciudad: "", localidad: "" }
                          });
                        }}
                      >
                        <option value="">Selecciona una regional</option>
                        {regionales.map((reg) => (
                          <option key={reg.id} value={reg.nombre}>{reg.nombre}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small">Ciudad</label>
                      <select
                        className="form-select"
                        value={formData.oficina.ciudad}
                        onChange={(e) => {
                          setSelectedCiudad(e.target.value);
                          setFormData({
                            ...formData,
                            oficina: { ...formData.oficina, ciudad: e.target.value, localidad: "" }
                          });
                        }}
                      >
                        <option value="">Selecciona una ciudad</option>
                        {ciudades.map((ciudad) => (
                          <option key={ciudad.id} value={ciudad.nombre}>{ciudad.nombre}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small">Departamento</label>
                      <input
                        className="form-control"
                        value={formData.oficina.departamento}
                        onChange={(e) => setFormData({
                          ...formData,
                          oficina: { ...formData.oficina, departamento: e.target.value }
                        })}
                      />
                    </div>

                    {isBogotaCiudad && (
                      <div className="col-md-6">
                        <label className="form-label small">Localidad</label>
                        <select
                          className="form-select"
                          value={formData.oficina.localidad || ""}
                          onChange={(e) => setFormData({
                            ...formData,
                            oficina: { ...formData.oficina, localidad: e.target.value }
                          })}
                        >
                          <option value="">Selecciona una localidad</option>
                          {localidades.map((loc) => (
                            <option key={loc.id} value={loc.nombre}>{loc.nombre}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="col-md-6">
                      <label className="form-label small">Nombre Oficina</label>
                      <input
                        className="form-control"
                        value={formData.oficina.nombre}
                        onChange={(e) => setFormData({
                          ...formData,
                          oficina: { ...formData.oficina, nombre: e.target.value }
                        })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small">Empresa</label>
                      <input
                        className="form-control"
                        value={formData.oficina.empresa}
                        onChange={(e) => setFormData({
                          ...formData,
                          oficina: { ...formData.oficina, empresa: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                </div>

                {/* Sección Usuario */}
                <div className="card p-3 mb-3">
                  <h6 className="fw-bold mb-3" style={{ color: "#5FB3A2" }}>👤 Usuario final</h6>
                  <div className="row g-2">
                    <div className="col-md-6">
                      <label className="form-label small">Nombre</label>
                      <input
                        className="form-control"
                        value={formData.usuario.nombre}
                        onChange={(e) => setFormData({
                          ...formData,
                          usuario: { ...formData.usuario, nombre: e.target.value }
                        })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small">Documento</label>
                      <input
                        className="form-control"
                        value={formData.usuario.documento}
                        onChange={(e) => setFormData({
                          ...formData,
                          usuario: { ...formData.usuario, documento: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                </div>

                {/* Sección Envío */}
                <div className="card p-3 mb-3">
                  <h6 className="fw-bold mb-3" style={{ color: "#5FB3A2" }}>🚚 Datos de envío</h6>
                  <div className="row g-2">
                    <div className="col-md-6">
                      <label className="form-label small">Número de guía</label>
                      <input
                        className="form-control"
                        value={formData.envio.numero_guia}
                        onChange={(e) => setFormData({
                          ...formData,
                          envio: { ...formData.envio, numero_guia: e.target.value }
                        })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small">Empresa de envío</label>
                      <input
                        className="form-control"
                        value={formData.envio.empresa_envio}
                        onChange={(e) => setFormData({
                          ...formData,
                          envio: { ...formData.envio, empresa_envio: e.target.value }
                        })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small">Estado</label>
                      <select
                        className="form-select"
                        value={formData.estado}
                        onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                      >
                        <option value="En tránsito">En tránsito</option>
                        <option value="Entregado">Entregado</option>
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Activos (solo lectura) */}
                <div className="card p-3">
                  <h6 className="fw-bold mb-3" style={{ color: "#5FB3A2" }}>💻 Equipos</h6>
                  <ul className="list-group">
                    {formData.activos.map((activo) => (
                      <li key={activo.id} className="list-group-item">
                        <strong>{activo.tipo}</strong> - {activo.marca} {activo.modelo} - <code>{activo.serial}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSaving}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSave} disabled={isSaving || !formData}>
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
