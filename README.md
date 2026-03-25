# Gestión de Activos IT

> Aplicación web para registrar entregas de activos de TI, administrar operadores y auditar las acciones realizadas por cada usuario. Construida con React + TypeScript + Supabase.

## 🚀 Descripción general

La plataforma centraliza todo el ciclo de entrega de activos: captura datos del solicitante, asigna equipos, genera información de envío y mantiene una bitácora de auditoría. Los administradores controlan catálogos y usuarios desde un panel exclusivo.

## ✨ Funcionalidades

- Autenticación con Supabase Auth y roles (`admin`, `operador`).
- Flujo obligatorio de cambio de contraseña la primera vez que un operador inicia sesión.
- Registro completo de entregas (oficina, usuario, envío y activos) con selects dinámicos y opción “Otra”.
- Panel administrativo (solo admin) para:
  - Listar usuarios y estados.
  - Gestionar catálogos: tipos, marcas, empresas de envío.
  - Revisar la bitácora `audit_log`.
- Tema claro/oscuro y UI Bootstrap responsiva.

## 🧱 Stack y dependencias

- React 18 + TypeScript
- Vite
- Supabase JS
- Bootstrap 5 + Bootstrap Icons
- SweetAlert2

Consulta `package.json` para la lista completa.

## 📋 Requisitos previos

1. Node.js 18+ y npm.
2. Proyecto Supabase activo (URL + anon key).
3. Acceso al editor SQL de Supabase.

## ⚙️ Configuración

1. **Clonar repositorio**

   ```bash
   git clone <repo-url>
   cd Gestion_activos_IT
   ```

2. **Variables de entorno**

   Copia `.env.example` a `.env` y define:

   ```dotenv
   VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
   VITE_SUPABASE_ANON_KEY=<tu_anon_key>
   ```

3. **Instalar dependencias**

   ```bash
   npm install
   ```

4. **Base de datos**
   - Ejecuta `database/schema.sql` en Supabase para crear tablas, catálogos y seeds.
   - Luego corre `database/rls_policies.sql` para habilitar la función `is_admin()` y las políticas RLS.

5. **Usuarios iniciales**

   - Crea usuarios en **Authentication → Users** (por ejemplo `admin@empresa.com`).
   - Copia el `id` (UUID) y crea el registro en `profiles`:

     ```sql
     INSERT INTO profiles (id, nombre, cargo, username, rol, must_change_password, activo)
     VALUES ('<uuid>', 'Administrador', 'Infraestructura', 'admin@empresa.com', 'admin', false, true);
     ```

   - Para operadores usa `rol = 'operador'` y `must_change_password = true`. Contraseña inicial sugerida: `Operador#12345`.

## ▶️ Scripts

| Comando          | Descripción                                |
|------------------|--------------------------------------------|
| `npm run dev`    | Levanta Vite en modo desarrollo.           |
| `npm run build`  | Genera la build de producción.             |
| `npm run preview`| Previsualiza la build generada localmente. |

La app se sirve en `http://localhost:5173` por defecto.

## 🧑‍💻 Uso de la aplicación

1. **Inicio de sesión**
   - Ingresa correo y contraseña. El botón “ojo” permite mostrar/ocultar la clave.
   - Si el usuario tiene `must_change_password = true`, se le exige definir una nueva contraseña antes de continuar.

2. **Dashboard**
   - Presenta métricas y un mensaje “Bienvenido, {usuario}”.
   - Desde las pestañas puedes navegar a “Registrar Entrega”, “Consultar Entregas” y (si eres admin) “Administración”.

3. **Registrar entrega**
   - Sección para ingresar datos de oficina, usuario final, envío y activos (con opción “Otra” para entradas personalizadas).
   - Cada activo se añade a la lista lateral donde puedes editar o eliminar.

4. **Consultar entregas**
   - Vista para filtrar y revisar asignaciones existentes.

5. **Panel administrativo (solo admin)**
   - **Usuarios:** muestra perfiles, estado y flags de cambio de contraseña.
   - **Catálogos:** permite agregar, activar/desactivar o eliminar opciones de los selects.
   - **Auditoría:** lista los últimos registros de `audit_log` y permite refrescar.

## 🤝 Contribuciones

- Ejecuta las migraciones cada vez que cambies `database/`.
- Mantén sincronizados los catálogos en la UI con los catálogos de Supabase.
- Abre issues o PRs describiendo claramente el contexto y la solución propuesta.

---

Con esto podrás instalar, configurar y operar la aplicación de Gestión de Activos IT en tu entorno. ¡Gracias por usarla y seguir mejorándola!
