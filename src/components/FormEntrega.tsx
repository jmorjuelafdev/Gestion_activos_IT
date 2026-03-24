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

const SUR_CIUDAD_CONFIG: Record<string, CiudadConfig> = {
  Ipiales: {
    departamento: "Nariño",
    empresa: "Empresa1",
    direccion: "Ipiales, Nariño",
    oficinas: ["Suc. Ipiales"],
  },
  Pasto: {
    departamento: "Nariño",
    empresa: "Empresa1",
    direccion: "Pasto, Nariño",
    oficinas: ["Suc. Pasto", "Sede Regional Nariño"],
  },
  Tumaco: {
    departamento: "Nariño",
    empresa: "Empresa1",
    direccion: "Tumaco, Nariño",
    oficinas: ["Suc. Tumaco"],
  },
  Mocoa: {
    departamento: "Putumayo",
    empresa: "Empresa1",
    direccion: "Mocoa, Putumayo",
    oficinas: ["Suc. Putumayo"],
  },
};

const TOLIMA_CIUDAD_CONFIG: Record<string, CiudadConfig> = {
  "El Espinal": {
    departamento: "Tolima",
    empresa: "Empresa1",
    direccion: "El Espinal, Tolima",
    oficinas: ["Suc. El Espinal"],
  },
  Ibagué: {
    departamento: "Tolima",
    empresa: "Empresa1",
    direccion: "Ibagué, Tolima",
    oficinas: ["Suc. Ibagué", "Sede Regional Tolima"],
  },
  Honda: {
    departamento: "Tolima",
    empresa: "Empresa1",
    direccion: "Honda, Tolima",
    oficinas: ["Suc. Honda"],
  },
};

const SANTANDER_CIUDAD_CONFIG: Record<string, CiudadConfig> = {
  Barbosa: {
    departamento: "Santander",
    empresa: "Empresa1",
    direccion: "Barbosa, Santander",
    oficinas: ["Suc. Barbosa"],
  },
  Arauca: {
    departamento: "Arauca",
    empresa: "Empresa1",
    direccion: "Arauca, Arauca",
    oficinas: ["Suc. Arauca"],
  },
  Bucaramanga: {
    departamento: "Santander",
    empresa: "Empresa1",
    direccion: "Bucaramanga, Santander",
    oficinas: ["Suc. Bucaramanga", "Sede Regional Santander"],
  },
  Barrancabermeja: {
    departamento: "Santander",
    empresa: "Empresa1",
    direccion: "Barrancabermeja, Santander",
    oficinas: ["Suc.Barrancabermeja"],
  },
  "San Gil": {
    departamento: "Santander",
    empresa: "Empresa1",
    direccion: "San Gil, Santander",
    oficinas: ["Suc. San Gil"],
  },
};

const PACIFICO_CIUDAD_CONFIG: Record<string, CiudadConfig> = {
  Buenaventura: {
    departamento: "Valle del Cauca",
    empresa: "Empresa1",
    direccion: "Buenaventura, Valle del Cauca",
    oficinas: ["Suc. Buenaventura"],
  },
  Buga: {
    departamento: "Valle del Cauca",
    empresa: "Empresa1",
    direccion: "Buga, Valle del Cauca",
    oficinas: ["Suc. Buga"],
  },
  Cali: {
    departamento: "Valle del Cauca",
    empresa: "Empresa1",
    direccion: "Cali, Valle del Cauca",
    oficinas: [
      "Suc. Cali Centro",
      "Suc. Cali Norte",
      "Suc. Cali Sur",
      "Sede Regional Valle del Cauca",
    ],
  },
  Popayán: {
    departamento: "Cauca",
    empresa: "Empresa1",
    direccion: "Popayán, Cauca",
    oficinas: ["Suc. Popayán"],
  },
  Quibdó: {
    departamento: "Chocó",
    empresa: "Empresa1",
    direccion: "Quibdó, Chocó",
    oficinas: ["Suc. Quibdó"],
  },
};

const EJE_CAFETERO_CIUDAD_CONFIG: Record<string, CiudadConfig> = {
  Pereira: {
    departamento: "Risaralda",
    empresa: "Empresa1",
    direccion: "Pereira, Risaralda",
    oficinas: ["Suc. Pereira", "Sede Regional Eje Cafetero"],
  },
  Armenia: {
    departamento: "Quindío",
    empresa: "Empresa1",
    direccion: "Armenia, Quindío",
    oficinas: ["Suc. Armenia"],
  },
  Cartago: {
    departamento: "Valle del Cauca",
    empresa: "Empresa1",
    direccion: "Cartago, Valle",
    oficinas: ["Suc. Cartago"],
  },
  "La Dorada": {
    departamento: "Caldas",
    empresa: "Empresa1",
    direccion: "La Dorada, Caldas",
    oficinas: ["Suc. La Dorada"],
  },
  Manizales: {
    departamento: "Caldas",
    empresa: "Empresa1",
    direccion: "Manizales, Caldas",
    oficinas: ["Suc. Manizales"],
  },
};

const NORTE_SANTANDER_CIUDAD_CONFIG: Record<string, CiudadConfig> = {
  "Cúcuta": {
    departamento: "Norte de Santander",
    empresa: "Empresa1",
    direccion: "Cúcuta, Norte de Santander",
    oficinas: ["Suc. Cúcuta", "Sede Norte de Santander"],
  },
  Aguachica: {
    departamento: "Cesar",
    empresa: "Empresa1",
    direccion: "Aguachica, Cesar",
    oficinas: ["Suc. Aguachica"],
  },
  "Ocaña": {
    departamento: "Norte de Santander",
    empresa: "Empresa1",
    direccion: "Ocaña, Norte de Santander",
    oficinas: ["Suc. Ocaña"],
  },
  Pamplona: {
    departamento: "Norte de Santander",
    empresa: "Empresa1",
    direccion: "Pamplona, Norte de Santander",
    oficinas: ["Suc. Pamplona"],
  },
};

const ORIENTE_CIUDAD_CONFIG: Record<string, CiudadConfig> = {
  "Puerto Carreño": {
    departamento: "Vichada",
    empresa: "Empresa1",
    direccion: "Puerto Carreño, Vichada",
    oficinas: ["Suc. Puerto Carreño"],
  },
  Villavicencio: {
    departamento: "Meta",
    empresa: "Empresa1",
    direccion: "Villavicencio, Meta",
    oficinas: ["Suc. Villavicencio", "Sede Regional Oriente"],
  },
  Yopal: {
    departamento: "Casanare",
    empresa: "Empresa1",
    direccion: "Yopal, Casanare",
    oficinas: ["Suc. Yopal"],
  },
};

const HUILA_CIUDAD_CONFIG: Record<string, CiudadConfig> = {
  Florencia: {
    departamento: "Caquetá",
    empresa: "Empresa1",
    direccion: "Florencia, Caquetá",
    oficinas: ["Suc.Florencia"],
  },
  Neiva: {
    departamento: "Huila",
    empresa: "Empresa1",
    direccion: "Neiva, Huila",
    oficinas: ["Suc.Neiva", "Sede Regional Huila"],
  },
  Pitalito: {
    departamento: "Huila",
    empresa: "Empresa1",
    direccion: "Pitalito, Huila",
    oficinas: ["Suc.Pitalito"],
  },
};

const CORDOBA_CIUDAD_CONFIG: Record<string, CiudadConfig> = {
  Montería: {
    departamento: "Córdoba",
    empresa: "Empresa1",
    direccion: "Montería, Córdoba",
    oficinas: ["Suc. Montería", "Sede Regional Córdoba"],
  },
  Sincelejo: {
    departamento: "Sucre",
    empresa: "Empresa1",
    direccion: "Sincelejo, Sucre",
    oficinas: ["Suc.Sincelejo"],
  },
};

const sortStrings = (values: string[]) =>
  [...values].sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));

type CiudadConfig = {
  departamento: string;
  empresa: string;
  direccion: string;
  oficinas: string[];
  localidad?: string;
};

const CARIBE_CIUDAD_CONFIG: Record<string, CiudadConfig> = {
  Barranquilla: {
    departamento: "Atlántico",
    empresa: "Empresa1",
    direccion: "Barranquilla, Atlántico",
    oficinas: ["Suc. Barranquilla", "Sede Regional Caribe"],
  },
  Cartagena: {
    departamento: "Bolívar",
    empresa: "Empresa1",
    direccion: "Cartagena, Bolívar",
    oficinas: ["Suc. Cartagena"],
  },
  Riohacha: {
    departamento: "Guajira",
    empresa: "Empresa1",
    direccion: "Riohacha, Guajira",
    oficinas: ["Suc. Riohacha"],
  },
  "San Andrés": {
    departamento: "San Andrés Islas",
    empresa: "Empresa1",
    direccion: "San Andrés, San Andrés Islas",
    oficinas: ["Suc. San Andrés"],
  },
  "Santa Marta": {
    departamento: "Magdalena",
    empresa: "Empresa1",
    direccion: "Santa Marta, Magdalena",
    oficinas: ["Suc. Santa Marta"],
  },
  Fundación: {
    departamento: "Magdalena",
    empresa: "Empresa1",
    direccion: "Fundación, Magdalena",
    oficinas: ["Suc. Fundación"],
  },
  Sincelejo: {
    departamento: "Sucre",
    empresa: "Empresa1",
    direccion: "Sincelejo, Sucre",
    oficinas: ["Suc. Sincelejo"],
  },
  Valledupar: {
    departamento: "Cesar",
    empresa: "Empresa1",
    direccion: "Valledupar, Cesar",
    oficinas: ["Suc. Valledupar"],
  },
};

const BOYACA_CIUDAD_CONFIG: Record<string, CiudadConfig> = {
  Chiquinquirá: {
    departamento: "Boyacá",
    empresa: "Empresa1",
    direccion: "Chiquinquirá, Boyacá",
    oficinas: ["Suc. Chiquinquirá"],
  },
  "Puerto Boyacá": {
    departamento: "Boyacá",
    empresa: "Empresa1",
    direccion: "Puerto Boyacá, Boyacá",
    oficinas: ["Suc. Puerto Boyacá"],
  },
  Sogamoso: {
    departamento: "Boyacá",
    empresa: "Empresa1",
    direccion: "Sogamoso, Boyacá",
    oficinas: ["Suc. Sogamoso"],
  },
  Tunja: {
    departamento: "Boyacá",
    empresa: "Empresa1",
    direccion: "Tunja, Boyacá",
    oficinas: ["Suc. Tunja", "Sede Regional Boyacá"],
  },
};

const DEPARTAMENTOS_COLOMBIA = [
  "Amazonas",
  "Antioquia",
  "Arauca",
  "Atlántico",
  "Bolívar",
  "Bogotá D.C",
  "Boyacá",
  "Caldas",
  "Caquetá",
  "Casanare",
  "Cauca",
  "Cesar",
  "Chocó",
  "Córdoba",
  "Cundinamarca",
  "Guajira",
  "Guaviare",
  "Huila",
  "Magdalena",
  "Meta",
  "Nariño",
  "Norte de Santander",
  "Putumayo",
  "Quindío",
  "Risaralda",
  "San Andrés Islas",
  "Santander",
  "Sucre",
  "Tolima",
  "Valle del Cauca",
  "Vichada"
];

type FormEntregaProps = {
  onEntregaRegistrada?: () => void;
};

const EMPRESAS = ["Empresa0", "Empresa1", "Empresa2", "Empresa3", "Otra"];

const OFICINAS_POR_EMPRESA: Record<string, string[]> = {
  Empresa0: ["Sede Nacional Zona Franca Bogotá", "Otra"],
};

const OFICINAS_POR_REGIONAL: Record<string, string[]> = {
  Antioquia: [
    "Sede Regional Antioquia",
    "Suc. Bello",
    "Suc. Caucasia",
    "Suc. Medellín Centro",
    "Suc. Medellín Norte",
    "Suc. Medellín Sur",
    "Suc. Puerto Berrío",
    "Suc. Rionegro",
    "Suc. Turbo",
    "Otra",
  ],
  Caribe: [
    "Sede Regional Caribe",
    "Suc. Barranquilla",
    "Suc. Cartagena",
    "Suc. Riohacha",
    "Suc. San Andrés",
    "Suc. Santa Marta",
    "Suc. Fundación",
    "Suc. Valledupar",
    "Otra",
  ],
  "Eje Cafetero": [
    "Sede Regional Eje Cafetero",
    "Suc. Armenia",
    "Suc. Cartago",
    "Suc. La Dorada",
    "Suc. Manizales",
    "Suc. Pereira",
    "Otra",
  ],
  Huila: [
    "Sede Regional Huila",
    "Suc.Florencia",
    "Suc.Neiva",
    "Suc.Pitalito",
    "Otra",
  ],
  Córdoba: [
    "Sede Regional Córdoba",
    "Suc. Montería",
    "Suc.Sincelejo",
    "Otra",
  ],
  Cundinamarca: [
    "Sede Regional Cundinamarca",
    "Suc. Leticia",
    "Suc. Facatativá",
    "Suc. Fusagasugá",
    "Suc. Girardot",
    "Suc. La Mesa",
    "Suc. Mosquera",
    "Suc. Soacha",
    "Suc. Sopó",
    "Suc. Villeta",
    "Suc. Zipaquirá",
    "Otra",
  ],
  Boyacá: [
    "Sede Regional Boyacá",
    "Suc. Tunja",
    "Suc. Chiquinquirá",
    "Suc. Puerto Boyacá",
    "Suc. Sogamoso",
    "Otra",
  ],
  "Norte de Santander": [
    "Sede Norte de Santander",
    "Suc. Aguachica",
    "Suc. Cúcuta",
    "Suc. Ocaña",
    "Suc. Pamplona",
    "Otra",
  ],
  Oriente: [
    "Sede Regional Oriente",
    "Suc. Puerto Carreño",
    "Suc. Villavicencio",
    "Suc. Yopal",
    "Otra",
  ],
  Pacífico: [
    "Sede Regional Valle del Cauca",
    "Suc. Buenaventura",
    "Suc. Buga",
    "Suc. Cali Centro",
    "Suc. Cali Norte",
    "Suc. Cali Sur",
    "Suc. Popayán",
    "Suc. Quibdó",
    "Otra",
  ],
  Santander: [
    "Sede Regional Santander",
    "Suc. Arauca",
    "Suc. Barbosa",
    "Suc. Barrancabermeja",
    "Suc. Bucaramanga",
    "Suc. San Gil",
    "Otra",
  ],
  Sur: [
    "Sede Regional Nariño",
    "Suc. Ipiales",
    "Suc. Pasto",
    "Suc. Tumaco",
    "Suc. Putumayo",
    "Otra",
  ],
  Tolima: [
    "Sede Regional Tolima",
    "Suc. El Espinal",
    "Suc. Honda",
    "Suc. Ibagué",
    "Otra",
  ],
};

const ANTIOQUIA_CIUDAD_CONFIG: Record<string, CiudadConfig> = {
  Bello: {
    departamento: "Antioquia",
    empresa: "Empresa1",
    direccion: "Bello, Antioquia",
    oficinas: ["Suc. Bello"],
  },
  Caucasia: {
    departamento: "Antioquia",
    empresa: "Empresa1",
    direccion: "Caucasia, Antioquia",
    oficinas: ["Suc. Caucasia"],
  },
  Medellín: {
    departamento: "Antioquia",
    empresa: "Empresa1",
    direccion: "Medellín, Antioquia",
    oficinas: [
      "Sede Regional Antioquia",
      "Suc. Medellín Centro",
      "Suc. Medellín Norte",
      "Suc. Medellín Sur",
    ],
  },
  "Puerto Berrío": {
    departamento: "Antioquia",
    empresa: "Empresa1",
    direccion: "Puerto Berrío, Antioquia",
    oficinas: ["Suc. Puerto Berrío"],
  },
  Rionegro: {
    departamento: "Antioquia",
    empresa: "Empresa1",
    direccion: "Rionegro, Antioquia",
    oficinas: ["Suc. Rionegro"],
  },
  Turbo: {
    departamento: "Antioquia",
    empresa: "Empresa1",
    direccion: "Turbo, Antioquia",
    oficinas: ["Suc. Turbo"],
  },
};

const CUNDINAMARCA_CIUDAD_CONFIG: Record<string, CiudadConfig> = {
  "Sede Regional Cundinamarca": {
    departamento: "Bogotá D.C",
    empresa: "Empresa1",
    direccion: "Centro Empresarial BOG Américas, Bogotá",
    oficinas: ["Sede Regional Cundinamarca"],
    localidad: "Puente Aranda",
  },
  Leticia: {
    departamento: "Amazonas",
    empresa: "Empresa1",
    direccion: "Leticia, Amazonas",
    oficinas: ["Suc. Leticia"],
  },
  Facatativá: {
    departamento: "Cundinamarca",
    empresa: "Empresa1",
    direccion: "Facatativá, Cundinamarca",
    oficinas: ["Suc. Facatativá"],
  },
  Fusagasugá: {
    departamento: "Cundinamarca",
    empresa: "Empresa1",
    direccion: "Fusagasugá, Cundinamarca",
    oficinas: ["Suc. Fusagasugá"],
  },
  Girardot: {
    departamento: "Cundinamarca",
    empresa: "Empresa1",
    direccion: "Girardot, Cundinamarca",
    oficinas: ["Suc. Girardot"],
  },
  "La Mesa": {
    departamento: "Cundinamarca",
    empresa: "Empresa1",
    direccion: "La Mesa, Cundinamarca",
    oficinas: ["Suc. La Mesa"],
  },
  Mosquera: {
    departamento: "Cundinamarca",
    empresa: "Empresa1",
    direccion: "Mosquera, Cundinamarca",
    oficinas: ["Suc. Mosquera"],
  },
  Soacha: {
    departamento: "Cundinamarca",
    empresa: "Empresa1",
    direccion: "Soacha, Cundinamarca",
    oficinas: ["Suc. Soacha"],
  },
  Sopó: {
    departamento: "Cundinamarca",
    empresa: "Empresa1",
    direccion: "Sopó, Cundinamarca",
    oficinas: ["Suc. Sopó"],
  },
  Villeta: {
    departamento: "Cundinamarca",
    empresa: "Empresa1",
    direccion: "Villeta, Cundinamarca",
    oficinas: ["Suc. Villeta"],
  },
  Zipaquirá: {
    departamento: "Cundinamarca",
    empresa: "Empresa1",
    direccion: "Zipaquirá, Cundinamarca",
    oficinas: ["Suc. Zipaquirá"],
  },
};

const BOGOTA_CITY_ORDER = [
  "Bogotá Norte",
  "Bogotá Centro",
  "Bogotá Occidente",
  "Bogotá Sur",
  "Sede Regional Bogotá",
];

const BOGOTA_CITY_CONFIG: Record<
  string,
  {
    departamento: string;
    empresa: string;
    localidades: Record<string, string[]>;
  }
> = {
  "Bogotá Norte": {
    departamento: "Bogotá D.C",
    empresa: "Empresa1",
    localidades: {
      Suba: ["Suc. Bulevar Niza", "Suc. Suba La Gaitana"],
      "Usaquén": ["Suc. Toberín", "Suc. Usaquén Centro"],
      Chapinero: ["Suc. Chapinero", "Suc. El Lago"],
      "Barrios Unidos": ["Suc. Castellana", "Suc. Siete de Agosto"],
    },
  },
  "Bogotá Centro": {
    departamento: "Bogotá D.C",
    empresa: "Empresa1",
    localidades: {
      Teusaquillo: ["Suc. Galerías", "Suc. Gran Estación"],
      "Santa Fé": ["Suc. Centro Internacional"],
      "Los Mártires": ["Suc. Paloquemao", "Suc. Santa Isabel"],
      "La Candelaria": ["Suc. La Candelaria"],
    },
  },
  "Bogotá Occidente": {
    departamento: "Bogotá D.C",
    empresa: "Empresa1",
    localidades: {
      "Engativá": ["Suc. Portal 80", "Suc. Normandía", "Suc. Engativá Centro"],
      "Fontibón": ["Suc. Fontibón Centro", "Suc. Ciudad Salitre"],
      Kennedy: ["Suc. Kennedy Central", "Suc. Castilla", "Suc. Patio Bonito"],
      "Puente Aranda": ["Suc. Américas", "Suc. Ciudad Montes"],
      Bosa: ["Suc. Bosa Centro", "Suc. El Porvenir"],
    },
  },
  "Bogotá Sur": {
    departamento: "Bogotá D.C",
    empresa: "Empresa1",
    localidades: {
      "Antonio Nariño": ["Suc. Restrepo"],
      "Rafaél Uribe Uribe": ["Suc. Olaya"],
      "San Cristobal": ["Suc. 20 de Julio", "Suc. La Victoria"],
      Usme: ["Suc. Santa Librada", "Suc. Usme Centro"],
      Tunjuelito: ["Suc. Venecia", "Suc. El Tunal"],
      "Ciudad Bolívar": ["Suc. El Ensueño", "Suc. Paseo Del Río"],
    },
  },
};

const normalizeText = (value: string) =>
  value.normalize("NFD").replace(/[^\p{ASCII}]/gu, "").toLowerCase();

const getCiudadConfig = (map: Record<string, CiudadConfig>, ciudad: string) => {
  const normalizedCiudad = normalizeText(ciudad);
  for (const [key, value] of Object.entries(map)) {
    if (normalizeText(key) === normalizedCiudad) {
      return value;
    }
  }
  return undefined;
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

  const [empresaCustom, setEmpresaCustom] = useState("");
  const [oficinaNombreCustom, setOficinaNombreCustom] = useState("");
  const [usarNombreOficinaOtra, setUsarNombreOficinaOtra] = useState(false);

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
      setEmpresaCustom("");
      setOficinaNombreCustom("");
      setUsarNombreOficinaOtra(false);
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
        empresaCustom={empresaCustom}
        setEmpresaCustom={setEmpresaCustom}
        oficinaNombreCustom={oficinaNombreCustom}
        setOficinaNombreCustom={setOficinaNombreCustom}
        usarNombreOficinaOtra={usarNombreOficinaOtra}
        setUsarNombreOficinaOtra={setUsarNombreOficinaOtra}
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
  empresaCustom,
  setEmpresaCustom,
  oficinaNombreCustom,
  setOficinaNombreCustom,
  usarNombreOficinaOtra,
  setUsarNombreOficinaOtra,
  errores,
  onClearError,
}: {
  oficina: OficinaFormData;
  setOficina: React.Dispatch<React.SetStateAction<OficinaFormData>>;
  empresaCustom: string;
  setEmpresaCustom: React.Dispatch<React.SetStateAction<string>>;
  oficinaNombreCustom: string;
  setOficinaNombreCustom: React.Dispatch<React.SetStateAction<string>>;
  usarNombreOficinaOtra: boolean;
  setUsarNombreOficinaOtra: React.Dispatch<React.SetStateAction<boolean>>;
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
  const normalizarCiudadNombre = (nombre: string) =>
    nombre === "San Andrés Islas" ? "San Andrés" : nombre;
  const regionalesOrdenados = [...regionales].sort((a, b) => a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" }));
  const localidadesOrdenadas = [...localidades].sort((a, b) => a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" }));

  const regionalNormalizado = normalizeText(oficina.regional);
  const isBogotaRegional = regionalNormalizado === normalizeText("Bogotá");
  const isCundinamarcaRegional = regionalNormalizado === normalizeText("Cundinamarca");
  const localidadFijaValue =
    isBogotaRegional && oficina.ciudad === "Sede Nacional"
      ? "Fontibón"
      : isBogotaRegional && oficina.ciudad === "Sede Regional Bogotá"
      ? "Puente Aranda"
      : isCundinamarcaRegional && oficina.ciudad === "Sede Regional Cundinamarca"
      ? "Puente Aranda"
      : null;
  const bogotaCityConfig = isBogotaRegional ? BOGOTA_CITY_CONFIG[oficina.ciudad] : undefined;
  const bogotaLocalidades = bogotaCityConfig ? sortStrings(Object.keys(bogotaCityConfig.localidades)) : [];
  const bogotaOficinasPorLocalidad = bogotaCityConfig && oficina.localidad
    ? bogotaCityConfig.localidades[oficina.localidad]
    : undefined;
  const opcionesBogotaOficinas = bogotaOficinasPorLocalidad
    ? sortStrings([
        ...bogotaOficinasPorLocalidad,
        ...(bogotaOficinasPorLocalidad.includes("Otra") ? [] : ["Otra"]),
      ])
    : undefined;
  const esRegionalAntioquia = regionalNormalizado === normalizeText("Antioquia");
  const esRegionalBoyaca = regionalNormalizado === normalizeText("Boyacá");
  const esRegionalCaribe = regionalNormalizado === normalizeText("Caribe");
  const esRegionalCundinamarca = regionalNormalizado === normalizeText("Cundinamarca");
  const esRegionalEjeCafetero = regionalNormalizado === normalizeText("Eje Cafetero");
  const esRegionalHuila = regionalNormalizado === normalizeText("Huila");
  const esRegionalCordoba = regionalNormalizado === normalizeText("Córdoba");
  const esRegionalNorteSantander = regionalNormalizado === normalizeText("Norte de Santander");
  const esRegionalOriente = regionalNormalizado === normalizeText("Oriente");
  const esRegionalPacifico = regionalNormalizado === normalizeText("Pacífico");
  const esRegionalSantander = regionalNormalizado === normalizeText("Santander");
  const esRegionalSur = regionalNormalizado === normalizeText("Sur");
  const esRegionalTolima = regionalNormalizado === normalizeText("Tolima");
  const ciudadesEspeciales = esRegionalAntioquia
    ? sortStrings(Object.keys(ANTIOQUIA_CIUDAD_CONFIG))
    : esRegionalBoyaca
    ? sortStrings(Object.keys(BOYACA_CIUDAD_CONFIG))
    : esRegionalCaribe
    ? sortStrings(Object.keys(CARIBE_CIUDAD_CONFIG))
    : esRegionalCundinamarca
    ? sortStrings(Object.keys(CUNDINAMARCA_CIUDAD_CONFIG))
    : esRegionalEjeCafetero
    ? sortStrings(Object.keys(EJE_CAFETERO_CIUDAD_CONFIG))
    : esRegionalHuila
    ? sortStrings(Object.keys(HUILA_CIUDAD_CONFIG))
    : esRegionalCordoba
    ? sortStrings(Object.keys(CORDOBA_CIUDAD_CONFIG))
    : esRegionalNorteSantander
    ? sortStrings(Object.keys(NORTE_SANTANDER_CIUDAD_CONFIG))
    : esRegionalOriente
    ? sortStrings(Object.keys(ORIENTE_CIUDAD_CONFIG))
    : esRegionalPacifico
    ? sortStrings(Object.keys(PACIFICO_CIUDAD_CONFIG))
    : esRegionalSantander
    ? sortStrings(Object.keys(SANTANDER_CIUDAD_CONFIG))
    : esRegionalSur
    ? sortStrings(Object.keys(SUR_CIUDAD_CONFIG))
    : esRegionalTolima
    ? sortStrings(Object.keys(TOLIMA_CIUDAD_CONFIG))
    : [];
  const ciudadesOptions = oficina.regional
    ? sortStrings(
        Array.from(
          new Set([
            ...ciudades.map((ciudad) => normalizarCiudadNombre(ciudad.nombre)),
            ...ciudadesEspeciales,
          ])
        )
      )
    : [];
  const regionalCiudadConfig = esRegionalAntioquia
    ? getCiudadConfig(ANTIOQUIA_CIUDAD_CONFIG, oficina.ciudad)
    : esRegionalBoyaca
    ? getCiudadConfig(BOYACA_CIUDAD_CONFIG, oficina.ciudad)
    : esRegionalCaribe
    ? getCiudadConfig(CARIBE_CIUDAD_CONFIG, oficina.ciudad)
    : esRegionalCundinamarca
    ? getCiudadConfig(CUNDINAMARCA_CIUDAD_CONFIG, oficina.ciudad)
    : esRegionalEjeCafetero
    ? getCiudadConfig(EJE_CAFETERO_CIUDAD_CONFIG, oficina.ciudad)
    : esRegionalHuila
    ? getCiudadConfig(HUILA_CIUDAD_CONFIG, oficina.ciudad)
    : esRegionalCordoba
    ? getCiudadConfig(CORDOBA_CIUDAD_CONFIG, oficina.ciudad)
    : esRegionalNorteSantander
    ? getCiudadConfig(NORTE_SANTANDER_CIUDAD_CONFIG, oficina.ciudad)
    : esRegionalOriente
    ? getCiudadConfig(ORIENTE_CIUDAD_CONFIG, oficina.ciudad)
    : esRegionalPacifico
    ? getCiudadConfig(PACIFICO_CIUDAD_CONFIG, oficina.ciudad)
    : esRegionalSantander
    ? getCiudadConfig(SANTANDER_CIUDAD_CONFIG, oficina.ciudad)
    : esRegionalSur
    ? getCiudadConfig(SUR_CIUDAD_CONFIG, oficina.ciudad)
    : esRegionalTolima
    ? getCiudadConfig(TOLIMA_CIUDAD_CONFIG, oficina.ciudad)
    : undefined;
  const oficinasCiudadEspecial = regionalCiudadConfig
    ? sortStrings([
        ...regionalCiudadConfig.oficinas,
        ...(regionalCiudadConfig.oficinas.includes("Otra") ? [] : ["Otra"]),
      ])
    : undefined;
  const opcionesOficinaGenerales: string[] | undefined = oficinasCiudadEspecial
    ?? (OFICINAS_POR_EMPRESA[oficina.empresa] ? sortStrings(OFICINAS_POR_EMPRESA[oficina.empresa]) : undefined)
    ?? (OFICINAS_POR_REGIONAL[oficina.regional] ? sortStrings(OFICINAS_POR_REGIONAL[oficina.regional]) : undefined);
  const bogotaCityOptions = sortStrings(BOGOTA_CITY_ORDER);

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
              const esBogota = newRegional === "Bogotá";
              const esAntioquia = newRegional === "Antioquia";
              setOficina({ 
                ...oficina, 
                regional: newRegional,
                ciudad: esBogota ? "Sede Nacional" : "",
                localidad: esBogota ? "Fontibón" : "",
                departamento: esBogota ? "Bogotá D.C" : esAntioquia ? "Antioquia" : "",
                empresa: esBogota ? "Empresa0" : esAntioquia ? "Empresa1" : "",
                nombre: esBogota ? "Sede Nacional Zona Franca Bogotá" : "",
                direccion: esBogota
                  ? "Zona Franca Bogotá, Bogotá"
                  : esAntioquia
                  ? ""
                  : oficina.direccion,
              });
              setEmpresaCustom("");
              setOficinaNombreCustom("");
              setUsarNombreOficinaOtra(false);
              if (errores.regional) onClearError('regional');
            }}
            disabled={loading}
          >
            <option value="">Selecciona una regional</option>
            {regionalesOrdenados.map((reg) => (
              <option key={reg.id} value={reg.nombre}>
                {reg.nombre}
              </option>
            ))}
          </select>
          {errores.regional && <div className="invalid-feedback d-block">{errores.regional}</div>}
        </div>

        <div className="col-md-6">
          <label className="form-label small text-muted">Ciudad *</label>
          {isBogotaRegional ? (
            <select
              className={`form-select ${errores.ciudad ? 'is-invalid' : ''}`}
              value={oficina.ciudad}
              onChange={(e) => {
                const newCiudad = e.target.value;
                if (newCiudad === "Sede Nacional") {
                  setOficina({
                    ...oficina,
                    ciudad: newCiudad,
                    localidad: "Fontibón",
                    departamento: "Bogotá D.C",
                    empresa: "Empresa0",
                    nombre: "Sede Nacional Zona Franca Bogotá",
                    direccion: "Zona Franca Bogotá, Bogotá",
                  });
                } else if (newCiudad === "Sede Regional Bogotá") {
                  setOficina({
                    ...oficina,
                    ciudad: newCiudad,
                    localidad: "Puente Aranda",
                    departamento: "Bogotá D.C",
                    empresa: "Empresa1",
                    nombre: "Sede Regional Bogotá",
                    direccion: "Centro Empresarial BOG Américas, Bogotá",
                  });
                } else {
                  const ciudadConfig = BOGOTA_CITY_CONFIG[newCiudad];
                  setOficina({
                    ...oficina,
                    ciudad: newCiudad,
                    localidad: "",
                    departamento: ciudadConfig?.departamento || oficina.departamento,
                    empresa: ciudadConfig?.empresa || oficina.empresa,
                    nombre: "",
                  });
                }
                setEmpresaCustom("");
                setOficinaNombreCustom("");
                setUsarNombreOficinaOtra(false);
                if (errores.ciudad) onClearError('ciudad');
              }}
            >
              <option value="">Selecciona una ciudad</option>
              <option value="Sede Nacional">Sede Nacional</option>
              {bogotaCityOptions.map((ciudad) => (
                <option key={ciudad} value={ciudad}>
                  {ciudad}
                </option>
              ))}
            </select>
          ) : (
            <select
              className={`form-select ${errores.ciudad ? 'is-invalid' : ''}`}
              value={oficina.ciudad}
              onChange={(e) => {
                const newCiudad = e.target.value;
                const esAntioquia = regionalNormalizado === normalizeText("Antioquia");
                const esBoyaca = regionalNormalizado === normalizeText("Boyacá");
                const esCaribe = regionalNormalizado === normalizeText("Caribe");
                const esCundinamarca = regionalNormalizado === normalizeText("Cundinamarca");
                const esEjeCafetero = regionalNormalizado === normalizeText("Eje Cafetero");
                const esHuila = regionalNormalizado === normalizeText("Huila");
                const esCordoba = regionalNormalizado === normalizeText("Córdoba");
                const esNorteSantander = regionalNormalizado === normalizeText("Norte de Santander");
                const esOriente = regionalNormalizado === normalizeText("Oriente");
                const esPacifico = regionalNormalizado === normalizeText("Pacífico");
                const esSantander = regionalNormalizado === normalizeText("Santander");
                const esSur = regionalNormalizado === normalizeText("Sur");
                const esTolima = regionalNormalizado === normalizeText("Tolima");
                const ciudadConfig = esAntioquia
                  ? getCiudadConfig(ANTIOQUIA_CIUDAD_CONFIG, newCiudad)
                  : esBoyaca
                  ? getCiudadConfig(BOYACA_CIUDAD_CONFIG, newCiudad)
                  : esCaribe
                  ? getCiudadConfig(CARIBE_CIUDAD_CONFIG, newCiudad)
                  : esCundinamarca
                  ? getCiudadConfig(CUNDINAMARCA_CIUDAD_CONFIG, newCiudad)
                  : esEjeCafetero
                  ? getCiudadConfig(EJE_CAFETERO_CIUDAD_CONFIG, newCiudad)
                  : esHuila
                  ? getCiudadConfig(HUILA_CIUDAD_CONFIG, newCiudad)
                  : esCordoba
                  ? getCiudadConfig(CORDOBA_CIUDAD_CONFIG, newCiudad)
                  : esNorteSantander
                  ? getCiudadConfig(NORTE_SANTANDER_CIUDAD_CONFIG, newCiudad)
                  : esOriente
                  ? getCiudadConfig(ORIENTE_CIUDAD_CONFIG, newCiudad)
                  : esPacifico
                  ? getCiudadConfig(PACIFICO_CIUDAD_CONFIG, newCiudad)
                  : esSantander
                  ? getCiudadConfig(SANTANDER_CIUDAD_CONFIG, newCiudad)
                  : esSur
                  ? getCiudadConfig(SUR_CIUDAD_CONFIG, newCiudad)
                  : esTolima
                  ? getCiudadConfig(TOLIMA_CIUDAD_CONFIG, newCiudad)
                  : undefined;
                const baseOficina = {
                  ...oficina,
                  ciudad: newCiudad,
                  localidad: "",
                };

                let updatedOficina = baseOficina;

                if (ciudadConfig) {
                  updatedOficina = {
                    ...baseOficina,
                    departamento: ciudadConfig.departamento,
                    empresa: ciudadConfig.empresa,
                    direccion: "direccion" in ciudadConfig ? ciudadConfig.direccion : baseOficina.direccion,
                    nombre: ciudadConfig.oficinas[0] || "",
                    localidad: ciudadConfig.localidad ?? baseOficina.localidad,
                  };
                  setEmpresaCustom("");
                  setOficinaNombreCustom("");
                  setUsarNombreOficinaOtra(false);
                }

                setOficina(updatedOficina);
                if (errores.ciudad) onClearError('ciudad');
              }}
              disabled={!oficina.regional || loadingCiudades}
            >
              <option value="">{!oficina.regional ? "Selecciona primero una regional" : "Selecciona una ciudad"}</option>
              {ciudadesOptions.map((ciudadNombre) => (
                <option key={ciudadNombre} value={ciudadNombre}>
                  {ciudadNombre}
                </option>
              ))}
            </select>
          )}
          {errores.ciudad && <div className="invalid-feedback d-block">{errores.ciudad}</div>}
        </div>

        {localidadFijaValue ? (
          <div className="col-md-6">
            <label className="form-label small text-muted">Localidad</label>
            <input className="form-control" value={localidadFijaValue} readOnly />
          </div>
        ) : bogotaCityConfig ? (
          <div className="col-md-6">
            <label className="form-label small text-muted">Localidad *</label>
            <select
              className="form-select"
              value={oficina.localidad || ""}
              onChange={(e) => {
                const nuevaLocalidad = e.target.value;
                const oficinasLocalidad = bogotaCityConfig.localidades[nuevaLocalidad] || [];
                setOficina({
                  ...oficina,
                  localidad: nuevaLocalidad,
                  nombre: oficinasLocalidad[0] || "",
                });
                setOficinaNombreCustom("");
                setUsarNombreOficinaOtra(false);
              }}
            >
              <option value="">Selecciona una localidad</option>
              {bogotaLocalidades.map((localidad) => (
                <option key={localidad} value={localidad}>
                  {localidad}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="col-md-6">
            <label className="form-label small text-muted">Localidad</label>
            <select
              className="form-select"
              value={oficina.localidad || ""}
              onChange={(e) => setOficina({ ...oficina, localidad: e.target.value })}
              disabled={!oficina.ciudad || loadingLocalidades}
            >
              <option value="">Selecciona una localidad</option>
              {localidadesOrdenadas.map((localidad) => (
                <option key={localidad.id} value={localidad.nombre}>
                  {localidad.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="col-md-6">
          <label className="form-label small text-muted">Departamento *</label>
          <select
            className={`form-select ${errores.departamento ? 'is-invalid' : ''}`}
            value={oficina.departamento}
            onChange={(e) => {
              setOficina({ ...oficina, departamento: e.target.value });
              if (errores.departamento) onClearError('departamento');
            }}
          >
            <option value="">Selecciona un departamento</option>
            {sortStrings(DEPARTAMENTOS_COLOMBIA).map((dep) => (
              <option key={dep} value={dep}>
                {dep}
              </option>
            ))}
          </select>
          {errores.departamento && <div className="invalid-feedback d-block">{errores.departamento}</div>}
        </div>

        <div className="col-md-6">
          <label className="form-label small text-muted">Empresa *</label>
          <select
            className={`form-select ${errores.empresa ? 'is-invalid' : ''}`}
            value={EMPRESAS.includes(oficina.empresa) ? oficina.empresa : "Otra"}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "Otra") {
                setOficina({ ...oficina, empresa: empresaCustom, nombre: "" });
              } else {
                const opcionesEmpresa = OFICINAS_POR_EMPRESA[value];
                setOficina({ 
                  ...oficina, 
                  empresa: value,
                  nombre: opcionesEmpresa ? opcionesEmpresa[0] : oficina.nombre
                });
                setEmpresaCustom("");
                setOficinaNombreCustom("");
                setUsarNombreOficinaOtra(false);
              }
              if (errores.empresa) onClearError('empresa');
            }}
          >
            <option value="">Selecciona una empresa</option>
            {sortStrings(EMPRESAS).map((empresa) => (
              <option key={empresa} value={empresa}>
                {empresa}
              </option>
            ))}
          </select>
          {errores.empresa && <div className="invalid-feedback d-block">{errores.empresa}</div>}

          {(!oficina.empresa || !EMPRESAS.includes(oficina.empresa) || oficina.empresa === "Otra") && (
            <input
              className="form-control mt-2"
              placeholder="Nombre de la empresa"
              value={empresaCustom}
              onChange={(e) => {
                const value = e.target.value;
                setEmpresaCustom(value);
                setOficina({ ...oficina, empresa: value });
              }}
            />
          )}
        </div>

        <div className="col-md-6">
          <label className="form-label small text-muted">Nombre de la Oficina *</label>
          {bogotaCityConfig ? (
            <>
              <select
                className={`form-select ${errores.nombre ? 'is-invalid' : ''}`}
                value={usarNombreOficinaOtra ? "Otra" : oficina.nombre}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "Otra") {
                    setUsarNombreOficinaOtra(true);
                    setOficina({ ...oficina, nombre: oficinaNombreCustom });
                  } else {
                    setUsarNombreOficinaOtra(false);
                    setOficina({ ...oficina, nombre: value });
                    setOficinaNombreCustom("");
                  }
                  if (errores.nombre) onClearError('nombre');
                }}
                disabled={!opcionesBogotaOficinas}
              >
                <option value="">
                  {opcionesBogotaOficinas ? "Selecciona una oficina" : "Selecciona primero una localidad"}
                </option>
                {opcionesBogotaOficinas?.map((nombre) => (
                  <option key={nombre} value={nombre}>
                    {nombre}
                  </option>
                ))}
              </select>
              {usarNombreOficinaOtra && (
                <input
                  className={`form-control mt-2 ${errores.nombre ? 'is-invalid' : ''}`}
                  placeholder="Nombre de la oficina"
                  value={oficinaNombreCustom}
                  onChange={(e) => {
                    const value = e.target.value;
                    setOficinaNombreCustom(value);
                    setOficina({ ...oficina, nombre: value });
                  }}
                />
              )}
            </>
          ) : opcionesOficinaGenerales ? (
            <>
              <select
                className={`form-select ${errores.nombre ? 'is-invalid' : ''}`}
                value={usarNombreOficinaOtra ? "Otra" : oficina.nombre}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "Otra") {
                    setUsarNombreOficinaOtra(true);
                    setOficina({ ...oficina, nombre: oficinaNombreCustom });
                  } else {
                    setUsarNombreOficinaOtra(false);
                    setOficina({ ...oficina, nombre: value });
                    setOficinaNombreCustom("");
                  }
                  if (errores.nombre) onClearError('nombre');
                }}
              >
                <option value="">Selecciona una oficina</option>
                {opcionesOficinaGenerales.map((nombre) => (
                  <option key={nombre} value={nombre}>
                    {nombre}
                  </option>
                ))}
              </select>
              {usarNombreOficinaOtra && (
                <input
                  className={`form-control mt-2 ${errores.nombre ? 'is-invalid' : ''}`}
                  placeholder="Nombre de la oficina"
                  value={oficinaNombreCustom}
                  onChange={(e) => {
                    const value = e.target.value;
                    setOficinaNombreCustom(value);
                    setOficina({ ...oficina, nombre: value });
                  }}
                />
              )}
            </>
          ) : (
            <input
              className={`form-control ${errores.nombre ? 'is-invalid' : ''}`}
              placeholder="Nombre de la Oficina"
              value={oficina.nombre}
              onChange={(e) => {
                setOficina({ ...oficina, nombre: e.target.value });
                if (errores.nombre) onClearError('nombre');
              }}
            />
          )}
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
