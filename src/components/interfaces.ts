/**
 * Una interfaz en TypeScript es una forma de definir la estructura de un objeto. Proporciona un contrato que especifica qué propiedades y métodos deben estar presentes en un objeto para que sea considerado de cierto tipo
 interface Persona {
  nombre: string;
  edad: number;
}

la interfaz Persona tiene dos propiedades: nombre, que debe ser una cadena (string), y edad, que debe ser un número (number). Esto significa que cualquier objeto que se ajuste a esta interfaz debe tener estas dos propiedades con estos tipos de datos.

function imprimirInformacion(persona: Persona) {
  console.log(`Nombre: ${persona.nombre}, Edad: ${persona.edad}`);
}

const usuario: Persona = { nombre: 'Juan', edad: 30 };

imprimirInformacion(usuario); // Output: Nombre: Juan, Edad: 30

La función imprimirInformacion que espera un objeto que cumpla con la interfaz Persona. Luego creamos un objeto usuario que tiene las propiedades nombre y edad requeridas por la interfaz Persona. Finalmente, llamamos a la función imprimirInformacion pasando el objeto usuario como argumento, y se imprimirá su información en la consola.
 */


// Define la interfaz para un activo, con las propiedades específicas que se esperan para cada activo.
export interface ActivoFormData {
  serial: string;
  tipo: string;
  marca: string;
  modelo: string;
  estado: string;
  fecha_compra: string;
  observaciones: string;
}

export type ActivoDetalle = ActivoFormData;

export interface ListaDeActivosProps {
  activos: ActivoFormData[];
  setActivos: React.Dispatch<React.SetStateAction<ActivoFormData[]>>;
  setMostrarDetalles: React.Dispatch<React.SetStateAction<boolean>>;
  setActivoSeleccionado: React.Dispatch<React.SetStateAction<ActivoDetalle | null>>;
  setShowEditar: React.Dispatch<React.SetStateAction<boolean>>;
  setDataToEdit: React.Dispatch<React.SetStateAction<ActivoDetalle | null>>;
}

export interface FormularioActivoProps {
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  serialRef: React.RefObject<HTMLInputElement>;
  tipoRef: React.RefObject<HTMLInputElement>;
  marcaRef: React.RefObject<HTMLInputElement>;
  modeloRef: React.RefObject<HTMLInputElement>;
  estadoRef: React.RefObject<HTMLSelectElement>;
  fechaCompraRef: React.RefObject<HTMLInputElement>;
  observacionesRef: React.RefObject<HTMLTextAreaElement>;
}

export interface FormularioEditActivoProps {
  idUpdateRef: React.RefObject<HTMLInputElement>;
  handleSubmitUpdate: (event: React.FormEvent<HTMLFormElement>) => void;
  serialUpdateRef: React.RefObject<HTMLInputElement>;
  tipoUpdateRef: React.RefObject<HTMLInputElement>;
  marcaUpdateRef: React.RefObject<HTMLInputElement>;
  modeloUpdateRef: React.RefObject<HTMLInputElement>;
  estadoUpdateRef: React.RefObject<HTMLSelectElement>;
  fechaCompraUpdateRef: React.RefObject<HTMLInputElement>;
  observacionesUpdateRef: React.RefObject<HTMLTextAreaElement>;
  dataToEdit: ActivoDetalle | null;
}

export interface UsuarioFormData {
  nombre: string;
  documento: string;
  email: string;
  telefono: string;
  area: string;
  cargo: string;
  oficina_id: number | "";
}

export interface Oficina {
  id: number;
  nombre: string;
  direccion: string;
  ciudad: string;
  regional?: string;
  empresa?: string;
  responsable?: string;
}

export interface UsuarioOption {
  id: number;
  nombre: string;
  documento: string;
  email: string;
}

export interface EnvioFormData {
  numero_guia: string;
  empresa_envio: string;
  fecha_envio: string;
  oficina_id: number | "";
  estado_envio: string;
  observaciones: string;
}

export interface AsignacionFormData {
  fecha_asignacion: string;
  fecha_devolucion?: string;
  estado: string;
}

export interface EnvioResumen {
  id: number;
  numero_guia: string;
  empresa_envio: string;
  estado_envio: string;
}

export interface ActivoResumen {
  id: number;
  serial: string;
  tipo: string;
  marca: string;
  modelo: string;
}

export interface UsuarioBasico extends UsuarioOption {
  telefono?: string;
}

export interface AsignacionListado {
  id: number;
  estado: string;
  fecha_asignacion: string | null;
  fecha_devolucion: string | null;
  usuario: UsuarioBasico | null;
  envio: EnvioResumen | null;
  activo: ActivoResumen | null;
}

export interface ListaAsignacionesProps {
  asignaciones: AsignacionListado[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export interface ListaDeEmpleadosProps {
  empleados: UsuarioFormData[]; 
  URL_API: string;
  //mostarDetallesEmpleado: boolean;
  setEmpleados: React.Dispatch<React.SetStateAction<UsuarioFormData[]>>;
  setMostarDetallesEmpleado: React.Dispatch<React.SetStateAction<boolean>>;
  setEmpleadoSeleccionado: React.Dispatch<React.SetStateAction<UsuarioFormData | null>>;
  setShowEditarEmpl: React.Dispatch<React.SetStateAction<boolean>>;
  setDataToEdit: React.Dispatch<React.SetStateAction<UsuarioFormData | null>>;
}

// Define las propiedades esperadas para el componente SelectEdad.
export interface SelectEdadProps {
  edadRef: React.RefObject<HTMLSelectElement>;
}

// Define las propiedades esperadas para el componente SelectCargo.
export interface SelectCargoProps {
  cargoRef: React.RefObject<HTMLSelectElement>;
}