-- 🗄️ BASE DE DATOS
CREATE DATABASE Gestion_activos_IT;

-- 🗺️ REGIONALES
CREATE TABLE regionales (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    departamentos TEXT
);

-- Insertar regionales predefinidas
INSERT INTO regionales (nombre, departamentos) VALUES
('Caribe', 'Guajira, Cesár, Magdalena, Atlántico, Bolívar, Sucre, Córdoba y San Andrés Islas'),
('Pacífico', 'Chocó, Valle Del Cauca, Cauca'),
('Sur', 'Nariño, Putumayo, Amazonas'),
('Oriente', 'Meta, Casanare, Arauca, Vichada'),
('Boyacá', 'Boyacá'),
('Santander', 'Santander y Barrancabermeja'),
('Norte de Santander', 'Norte de Santander y Aguachica-Cesar'),
('Antioquia', 'Antioquia'),
('Tolima', 'Tolima'),
('Huila', 'Huila y Caquetá'),
('Cundinamarca', 'Excepto Bogotá'),
('Bogotá', 'Bogotá D.C');

-- 🏙️ CIUDADES
CREATE TABLE ciudades (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    regional_nombre VARCHAR(50) NOT NULL,
    FOREIGN KEY (regional_nombre) REFERENCES regionales(nombre)
);

-- Insertar ciudades por regional (55 ciudades en total)
INSERT INTO ciudades (nombre, regional_nombre) VALUES
-- Caribe (8)
('Riohacha', 'Caribe'), ('Valledupar', 'Caribe'), ('Santa Marta', 'Caribe'), ('Barranquilla', 'Caribe'),
('Cartagena', 'Caribe'), ('Sincelejo', 'Caribe'), ('Montería', 'Caribe'), ('San Andrés', 'Caribe'),
-- Pacífico (4)
('Quibdó', 'Pacífico'), ('Cali', 'Pacífico'), ('Buenaventura', 'Pacífico'), ('Popayán', 'Pacífico'),
-- Sur (5)
('Pasto', 'Sur'), ('Ipiales', 'Sur'), ('Tumaco', 'Sur'), ('Mocoa', 'Sur'), ('Leticia', 'Sur'),
-- Oriente (4)
('Villavicencio', 'Oriente'), ('Yopal', 'Oriente'), ('Arauca', 'Oriente'), ('Puerto Carreño', 'Oriente'),
-- Boyacá (3)
('Tunja', 'Boyacá'), ('Sogamoso', 'Boyacá'), ('Chiquinquirá', 'Boyacá'),
-- Santander (3)
('Bucaramanga', 'Santander'), ('Barrancabermeja', 'Santander'), ('San Gil', 'Santander'),
-- Norte de Santander (4)
('Cúcuta', 'Norte de Santander'), ('Ocaña', 'Norte de Santander'), ('Pamplona', 'Norte de Santander'), ('Aguachica-Cesar', 'Norte de Santander'),
-- Antioquia (2)
('Medellín', 'Antioquia'), ('Turbo', 'Antioquia'),
-- Tolima (2)
('Ibagué', 'Tolima'), ('El Espinal', 'Tolima'),
-- Huila (3)
('Neiva', 'Huila'), ('Pitalito', 'Huila'), ('Florencia-Caquetá', 'Huila'),
-- Cundinamarca (9)
('Chía', 'Cundinamarca'), ('Facatativá', 'Cundinamarca'), ('Mosquera', 'Cundinamarca'), ('La Mesa', 'Cundinamarca'),
('Girardot', 'Cundinamarca'), ('Sopó', 'Cundinamarca'), ('Soacha', 'Cundinamarca'), ('Zipaquirá', 'Cundinamarca'), ('Fusagasugá', 'Cundinamarca'),
-- Bogotá (4)
('Bogotá Norte', 'Bogotá'), ('Bogotá Sur', 'Bogotá'), ('Bogotá Centro', 'Bogotá'), ('Bogotá Occidente', 'Bogotá');

-- 🏘️ LOCALIDADES (Solo para Bogotá)
CREATE TABLE localidades (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    ciudad_nombre VARCHAR(50) NOT NULL,
    FOREIGN KEY (ciudad_nombre) REFERENCES ciudades(nombre)
);

-- Insertar localidades por ciudad de Bogotá
INSERT INTO localidades (nombre, ciudad_nombre) VALUES
-- Bogotá Norte (4)
('Usaquén', 'Bogotá Norte'),
('Suba', 'Bogotá Norte'),
('Barrios Unidos', 'Bogotá Norte'),
('Chapinero', 'Bogotá Norte'),
-- Bogotá Centro (4)
('Teusaquillo', 'Bogotá Centro'),
('Santa Fé', 'Bogotá Centro'),
('Los Mártires', 'Bogotá Centro'),
('La Candelaria', 'Bogotá Centro'),
-- Bogotá Occidente (5)
('Engativá', 'Bogotá Occidente'),
('Fontibón', 'Bogotá Occidente'),
('Puente Aranda', 'Bogotá Occidente'),
('Kennedy', 'Bogotá Occidente'),
('Bosa', 'Bogotá Occidente'),
-- Bogotá Sur (6)
('Antonio Nariño', 'Bogotá Sur'),
('Rafael Uribe Uribe', 'Bogotá Sur'),
('San Cristobal', 'Bogotá Sur'),
('Usme', 'Bogotá Sur'),
('Ciudad Bolívar', 'Bogotá Sur'),
('Tunjuelito', 'Bogotá Sur');

-- 🏢 OFICINAS
CREATE TABLE oficinas (
    id SERIAL PRIMARY KEY,
    regional VARCHAR(135),
    ciudad VARCHAR(100),
    departamento VARCHAR(80),
    localidad VARCHAR(100),
    empresa VARCHAR(140),
    nombre VARCHAR(140), -- oficina
    direccion VARCHAR(150),
    area VARCHAR(130),
    responsable_nombre VARCHAR(160),
    responsable_documento VARCHAR(125),
    telefono VARCHAR(110),
    email VARCHAR(100)
);

-- 👤 USUARIOS
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(140),
    documento VARCHAR(130),
    email VARCHAR(100),
    telefono VARCHAR(130),
    area VARCHAR(135),
    oficina_id INT,
    
    FOREIGN KEY (oficina_id) REFERENCES oficinas(id)
);

-- 💻 ACTIVOS
CREATE TABLE activos (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(120),
    marca VARCHAR(100),
    modelo VARCHAR(90),
    serial VARCHAR(130),
    fecha_compra DATE,
    estado VARCHAR(50), -- disponible, asignado
    observaciones TEXT
);

-- 🚚 ENVIOS
CREATE TABLE envios (
    id SERIAL PRIMARY KEY,
    numero_guia VARCHAR(160),
    empresa_envio VARCHAR(115),
    fecha_envio DATE,
    oficina_id INT,
    estado_envio VARCHAR(50),
    observaciones TEXT,

    FOREIGN KEY (oficina_id) REFERENCES oficinas(id)
);

-- 🔄 ASIGNACIONES
CREATE TABLE asignaciones (
    id SERIAL PRIMARY KEY,
    activo_id INT,
    usuario_id INT,
    envio_id INT,
    fecha_asignacion DATE,
    estado VARCHAR(50),

    FOREIGN KEY (activo_id) REFERENCES activos(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (envio_id) REFERENCES envios(id)
);

-- 👥 PERFILES (Metadatos vinculados a Supabase Auth)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre VARCHAR(140) NOT NULL,
    cargo VARCHAR(140),
    username VARCHAR(150) NOT NULL UNIQUE,
    rol TEXT NOT NULL DEFAULT 'operador' CHECK (rol IN ('admin', 'operador')),
    must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.set_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_profiles_updated_at();

-- 🧾 TIPO ENUM PARA AUDITORÍA
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_action') THEN
    CREATE TYPE audit_action AS ENUM (
      'CREATE_ENTREGA','UPDATE_ENTREGA','DELETE_ENTREGA',
      'MANAGE_CATALOG','MANAGE_USER','EXPORT_REPORT'
    );
  END IF;
END$$;

-- 📜 AUDITORÍA DE ACCIONES
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    username VARCHAR(150),
    rol TEXT,
    accion audit_action NOT NULL,
    entidad TEXT NOT NULL,
    entidad_id TEXT,
    detalle JSONB,
    ip TEXT,
    user_agent TEXT
);

-- 📚 CATÁLOGOS EDITABLES
CREATE TABLE tipos_equipo_catalogo (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL UNIQUE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE marcas_equipo_catalogo (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL UNIQUE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE empresas_envio_catalogo (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL UNIQUE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_tipos_equipo_catalogo_updated
BEFORE UPDATE ON tipos_equipo_catalogo
FOR EACH ROW EXECUTE FUNCTION public.set_profiles_updated_at();

CREATE TRIGGER trg_marcas_equipo_catalogo_updated
BEFORE UPDATE ON marcas_equipo_catalogo
FOR EACH ROW EXECUTE FUNCTION public.set_profiles_updated_at();

CREATE TRIGGER trg_empresas_envio_catalogo_updated
BEFORE UPDATE ON empresas_envio_catalogo
FOR EACH ROW EXECUTE FUNCTION public.set_profiles_updated_at();

-- Datos iniciales para catálogos principales
INSERT INTO tipos_equipo_catalogo (nombre) VALUES
  ('Impresora'), ('Fotocopiadora'), ('Escáner'), ('Impresora térmica'),
  ('Portátil'), ('PC Todo en Uno'), ('PC de escritorio'), ('Monitor'),
  ('Scanner'), ('Video beam'), ('Teclado'), ('Teclado numérico'),
  ('Mouse'), ('Parlantes'), ('Combo teclado y mouse'), ('Audífonos diadema'),
  ('Tablet'), ('Celular'), ('Licencia de software'), ('Switch de Red'),
  ('Camara web'), ('Cámara IP'), ('Proyector'), ('Tabla digitalizadora'),
  ('Lápiz óptico');

INSERT INTO marcas_equipo_catalogo (nombre) VALUES
  ('Genius'), ('Clon'), ('HP'), ('Acer'), ('Lenovo'), ('Asus'), ('Apple'),
  ('Dell'), ('Logitech'), ('Corsair'), ('Razer'), ('Master'), ('Samsung'),
  ('LG'), ('AOC'), ('Microsoft'), ('MSI'), ('Epson'), ('VTA'), ('Canon'),
  ('Xiaomi'), ('Motorola'), ('Kalley'), ('Xtech'), ('Belkin'), ('Huawei'),
  ('Esenses'), ('Sony'), ('Honor'), ('ZTE'), ('VIVO'), ('Oppo'),
  ('Challenger'), ('Panasonic'), ('Olimpo'), ('Tapo');

INSERT INTO empresas_envio_catalogo (nombre) VALUES
  ('4-72'), ('Coordinadora'), ('Deprisa'), ('Envía'),
  ('Inter Rapidísimo'), ('Servientrega'), ('TCC');
