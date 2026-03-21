-- 🗄️ BASE DE DATOS
CREATE DATABASE Gestion_activos_IT;

-- 🏢 OFICINAS
CREATE TABLE oficinas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    direccion VARCHAR(150),
    ciudad VARCHAR(100),
    regional VARCHAR(100),
    empresa VARCHAR(100),
    responsable VARCHAR(100)
);

-- 👤 USUARIOS
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    documento VARCHAR(50),
    email VARCHAR(100),
    telefono VARCHAR(50),
    area VARCHAR(100),
    cargo VARCHAR(100),
    oficina_id INT,
    FOREIGN KEY (oficina_id) REFERENCES oficinas(id)
);

-- 💻 ACTIVOS
CREATE TABLE activos (
    id SERIAL PRIMARY KEY,
    serial VARCHAR(100),
    tipo VARCHAR(50),
    marca VARCHAR(50),
    modelo VARCHAR(50),
    estado VARCHAR(50),
    fecha_compra DATE,
    observaciones TEXT
);

-- 🚚 ENVIOS
CREATE TABLE envios (
    id SERIAL PRIMARY KEY,
    numero_guia VARCHAR(100),
    empresa_envio VARCHAR(100),
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
    fecha_devolucion DATE,
    estado VARCHAR(50),
    FOREIGN KEY (activo_id) REFERENCES activos(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (envio_id) REFERENCES envios(id)
);
