-- 🔓 DESHABILITAR RLS PARA DESARROLLO
-- Ejecuta estos comandos en el SQL Editor de Supabase

-- Deshabilitar RLS en todas las tablas
ALTER TABLE oficinas DISABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE activos DISABLE ROW LEVEL SECURITY;
ALTER TABLE envios DISABLE ROW LEVEL SECURITY;
ALTER TABLE asignaciones DISABLE ROW LEVEL SECURITY;

-- ⚠️ ALTERNATIVA: Si prefieres mantener RLS habilitado pero permitir acceso público
-- Descomenta las siguientes líneas y comenta las de arriba:

/*
-- Habilitar RLS
ALTER TABLE oficinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE activos ENABLE ROW LEVEL SECURITY;
ALTER TABLE envios ENABLE ROW LEVEL SECURITY;
ALTER TABLE asignaciones ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir todo (SELECT, INSERT, UPDATE, DELETE) a usuarios anónimos
CREATE POLICY "Permitir todo en oficinas" ON oficinas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en usuarios" ON usuarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en activos" ON activos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en envios" ON envios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en asignaciones" ON asignaciones FOR ALL USING (true) WITH CHECK (true);
*/
