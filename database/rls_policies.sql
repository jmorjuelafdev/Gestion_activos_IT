-- � POLÍTICAS RLS PARA PRODUCCIÓN
-- Ejecutar en el SQL Editor de Supabase

-- 1. Habilitar RLS en tablas core
ALTER TABLE oficinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE activos ENABLE ROW LEVEL SECURITY;
ALTER TABLE envios ENABLE ROW LEVEL SECURITY;
ALTER TABLE asignaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_equipo_catalogo ENABLE ROW LEVEL SECURITY;
ALTER TABLE marcas_equipo_catalogo ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresas_envio_catalogo ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- 2. Función helper para saber si el usuario autenticado es admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND rol = 'admin' AND activo = true
  );
$$ LANGUAGE sql STABLE;

-- 3. Políticas para perfiles
CREATE POLICY "Profiles select own" ON profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Profiles update self" ON profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Profiles admin insert" ON profiles
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Profiles admin update" ON profiles
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Profiles admin delete" ON profiles
  FOR DELETE USING (public.is_admin());

-- 4. Políticas para catálogos (lectura para todos los autenticados, CRUD solo admin)
CREATE POLICY "Catalogos select" ON tipos_equipo_catalogo
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Catalogos tipos insert" ON tipos_equipo_catalogo
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Catalogos tipos update" ON tipos_equipo_catalogo
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Catalogos tipos delete" ON tipos_equipo_catalogo
  FOR DELETE USING (public.is_admin());

CREATE POLICY "Catalogos marca select" ON marcas_equipo_catalogo
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Catalogos marca insert" ON marcas_equipo_catalogo
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Catalogos marca update" ON marcas_equipo_catalogo
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Catalogos marca delete" ON marcas_equipo_catalogo
  FOR DELETE USING (public.is_admin());

CREATE POLICY "Catalogos empresa select" ON empresas_envio_catalogo
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Catalogos empresa insert" ON empresas_envio_catalogo
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Catalogos empresa update" ON empresas_envio_catalogo
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Catalogos empresa delete" ON empresas_envio_catalogo
  FOR DELETE USING (public.is_admin());

-- 5. Políticas para tablas operativas (oficinas, usuarios, activos, envíos, asignaciones)
-- Se permite a cualquier usuario autenticado realizar CRUD, pero puedes ajustar a tus reglas
CREATE POLICY "Oficinas select" ON oficinas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Oficinas insert admin" ON oficinas FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Oficinas update admin" ON oficinas FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Oficinas delete admin" ON oficinas FOR DELETE USING (public.is_admin());

CREATE POLICY "Usuarios select" ON usuarios FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Usuarios insert admin" ON usuarios FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Usuarios update admin" ON usuarios FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Usuarios delete admin" ON usuarios FOR DELETE USING (public.is_admin());

CREATE POLICY "Activos select" ON activos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Activos insert" ON activos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Activos update" ON activos FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Activos delete" ON activos FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Envios select" ON envios FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Envios insert" ON envios FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Envios update" ON envios FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Envios delete" ON envios FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Asignaciones select" ON asignaciones FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Asignaciones insert" ON asignaciones FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Asignaciones update" ON asignaciones FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Asignaciones delete" ON asignaciones FOR DELETE USING (auth.role() = 'authenticated');

-- 6. Auditoría: solo admin puede leer, todos pueden insertar
CREATE POLICY "Audit insert" ON audit_log FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Audit select admin" ON audit_log FOR SELECT USING (public.is_admin());
