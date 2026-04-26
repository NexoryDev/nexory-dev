import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useLanguage } from '../context/LanguageContext';
import "../styles/Login.css";

export default function Login() {
  const { t } = useLanguage();
  const API = "http://localhost:5000";

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verifyToken, setVerifyToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  function toast(text, type = "info") {
    const id = Date.now();
    setToasts((t) => [...t, { id, text, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 2800);
  }

  async function csrf() {
    const res = await fetch(`${API}/api/csrf`, {
      credentials: "include",
    });
    const data = await res.json();
    return data.csrf_token;
  }

  async function api(path, body) {
    const token = await csrf();

    const res = await fetch(`${API}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
      credentials: "include",
      body: JSON.stringify(body),
    });

    return res.json();
  }

  async function login() {
    setLoading(true);
    const res = await api("/api/auth/login", { email, password });

    if (res.status === "logged in") {
      toast("Login erfolgreich", "success");
    } else {
      toast(res.error || "Login fehlgeschlagen", "error");
    }

    setLoading(false);
  }

  async function register() {
    setLoading(true);
    const res = await api("/api/auth/register", { email, password });

    if (res.verify) {
      setVerifyToken(res.verify);
      toast("Account erstellt", "success");
    } else {
      toast(res.error || "Fehler bei Registrierung", "error");
    }

    setLoading(false);
  }

  async function verify() {
    setLoading(true);
    const res = await fetch(`${API}/api/auth/verify/${verifyToken}`);
    const data = await res.json();

    if (data.status === "verified") {
      toast("Account bestätigt", "success");
      setVerifyToken(null);
    } else {
      toast("Verifizierung fehlgeschlagen", "error");
    }

    setLoading(false);
  }

  return (
    <div className="login-hero">
      <div className="login-box">
        <h1>{mode === "login" ? t('login.login_header') : t('login.register_header')}</h1>

        <input
          placeholder={t('login.mail')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            placeholder={t('login.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {mode === "login" ? (
          <button onClick={login} disabled={loading}>
            {loading ? "..." : t('login.login')}
          </button>
        ) : (
          <button onClick={register} disabled={loading}>
            {loading ? "..." : t('login.register')}
          </button>
        )}

        {verifyToken && (
          <button className="verify" onClick={verify}>
            {t('login.verify')}
          </button>
        )}

        <div className="switch">
          {mode === "login" ? (
            <button className="link-btn" onClick={() => setMode("register")}>
              {t('login.register_btn')}
            </button>
          ) : (
            <button className="link-btn" onClick={() => setMode("login")}>
              {t('login.login_btn')}
            </button>
          )}
        </div>
      </div>

      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}
