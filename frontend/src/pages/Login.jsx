import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import "../styles/Login.css";

export default function Login() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken } = useAuth();

  const API = "http://localhost:5000";

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verifyToken, setVerifyToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [resetEmail, setResetEmail] = useState("");
  const [resetStep, setResetStep] = useState(false);

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  function getDeviceId() {
    let id = localStorage.getItem("device_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("device_id", id);
    }
    return id;
  }

  async function api(path, body) {
    try {
      const res = await fetch(`${API}${path}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Language": language,
        },
        body: JSON.stringify(body),
      });

      return await res.json().catch(() => ({}));
    } catch {
      return { error: t("login.network_error") };
    }
  }

  function validate() {
    const newErrors = {};

    if (!email.includes("@")) newErrors.email = t("login.invalid_email");
    if (!password || password.length < 6)
      newErrors.password = t("login.invalid_password");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function login() {
    setLoading(true);
    setFormError("");
    setFormSuccess("");

    if (!validate()) {
      setLoading(false);
      return;
    }

    const res = await api("/api/auth/login", {
      email,
      password,
      remember_me: rememberMe,
      device_id: getDeviceId(),
    });

    if (res.access_token) {
      await setToken(res.access_token);
      navigate("/me", { replace: true });
    } else {
      setFormError(res.error || t("login.login_failed"));
    }

    setLoading(false);
  }

  async function register() {
    setLoading(true);
    setFormError("");
    setFormSuccess("");

    const res = await api("/api/auth/register", {
      email,
      password,
    });

    if (res.status === "registered") {
      setFormSuccess(t("login.check_email"));
      setMode("login");
    } else {
      setFormError(res.error || t("login.register_failed"));
    }

    setLoading(false);
  }

  async function requestReset() {
    setLoading(true);
    setFormError("");
    setFormSuccess("");

    const res = await api("/api/auth/password/request", {
      email: resetEmail,
    });

    if (res.status === "ok") {
      setFormSuccess("Reset email sent");
      setResetStep(false);
      setMode("login");
    } else {
      setFormError(res.error || "Error");
    }

    setLoading(false);
  }

  async function verify(tokenFromUrl) {
    const token = tokenFromUrl || verifyToken;

    if (!token) return;

    try {
      const res = await fetch(`${API}/api/auth/verify/${token}`);
      const data = await res.json().catch(() => ({}));

      if (data.status === "verified") {
        setVerifyToken(null);
        setFormSuccess(t("login.verified"));
        setMode("login");
      } else {
        setFormError(t("login.verify_failed"));
      }
    } catch {
      setFormError(t("login.network_error"));
    }
  }

  useEffect(() => {
    const params = location.pathname.split("/verify/");
    if (params[1]) {
      setVerifyToken(params[1]);
      verify(params[1]);
    }
  }, []);

  return (
    <div className="login-hero">
      <div className="login-box">

        <h1>
          {resetStep
            ? "Reset Password"
            : mode === "login"
              ? t("login.login_header")
              : t("login.register_header")}
        </h1>

        {formError && <div className="form-error">{formError}</div>}
        {formSuccess && <div className="form-success">{formSuccess}</div>}

        {!resetStep ? (
          <>
            <input
              className={errors.email ? "input-error" : ""}
              placeholder={t("login.mail")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="password-wrapper">
              <input
                className={errors.password ? "input-error" : ""}
                type={showPassword ? "text" : "password"}
                placeholder={t("login.password")}
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

            {mode === "login" && (
              <label className="remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                {t("login.remember_me")}
              </label>
            )}

            {mode === "login" ? (
              <button onClick={login} disabled={loading}>
                {loading ? "..." : t("login.login")}
              </button>
            ) : (
              <button onClick={register} disabled={loading}>
                {loading ? "..." : t("login.register")}
              </button>
            )}

            {mode === "login" && (
              <button
                className="link-btn"
                onClick={() => setResetStep(true)}
              >
                Forgot Password
              </button>
            )}

            <div className="switch">
              {mode === "login" ? (
                <button className="link-btn" onClick={() => setMode("register")}>
                  {t("login.register_btn")}
                </button>
              ) : (
                <button className="link-btn" onClick={() => setMode("login")}>
                  {t("login.login_btn")}
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <input
              placeholder="Email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
            />

            <button onClick={requestReset} disabled={loading}>
              {loading ? "..." : "Send reset link"}
            </button>

            <button
              className="link-btn"
              onClick={() => setResetStep(false)}
            >
              Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}
