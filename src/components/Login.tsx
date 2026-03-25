import { useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";

interface LoginProps {
  onSuccess: (session: Session) => void;
}

const Login = ({ onSuccess }: LoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else if (data.session) {
      onSuccess(data.session);
    }

    setLoading(false);
  };

  return (
    <div className="card shadow-sm border-0" style={{ maxWidth: "420px", width: "100%" }}>
      <div className="card-body p-4">
        <div className="text-center mb-4">
          <div className="stat-icon" style={{ width: 72, height: 72, margin: "0 auto" }}>
            <i className="bi bi-shield-lock" style={{ color: "#5FB3A2", fontSize: "2rem" }}></i>
          </div>
          <h2 className="fw-bold mt-3" style={{ color: "#5FB3A2" }}>Iniciar sesión</h2>
          <p className="text-muted mb-0">Ingresa tus credenciales corporativas</p>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="d-grid gap-3">
          <div>
            <label className="form-label fw-semibold">Correo electrónico</label>
            <input
              type="email"
              className="form-control"
              placeholder="tu.correo@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="form-label fw-semibold">Contraseña</label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2 fw-bold"
            disabled={loading}
          >
            {loading ? "Iniciando..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
