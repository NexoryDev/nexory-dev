import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import "../styles/Login.css";

export default function ResetPassword() {
  const { token } = useParams();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  async function handleReset() {
    setFormError("");
    setFormSuccess("");

    if (password.length < 6) {
      setFormError(t("reset.weak_password"));
      return;
    }

    if (password !== confirmPassword) {
      setFormError(t("reset.passwords_dont_match"));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/auth/password/reset/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json().catch(() => ({}));

      if (data.status === "password_updated") {
        setFormSuccess(t("reset.success"));
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setFormError(t("reset.failed"));
      }
    } catch {
      setFormError(t("reset.failed"));
    }

    setLoading(false);
  }

  return (
    <div className="login-hero">
      <div className="login-box">
        <h1>{t("reset.title")}</h1>

        {formError && <div className="form-error">{formError}</div>}
        {formSuccess && <div className="form-success">{formSuccess}</div>}

        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            placeholder={t("reset.new_password")}
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

        <input
          type="password"
          placeholder={t("reset.confirm_password")}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button onClick={handleReset} disabled={loading}>
          {loading ? "..." : t("reset.submit")}
        </button>

        <button className="link-btn" onClick={() => navigate("/login")}>
          {t("reset.back_to_login")}
        </button>
      </div>
    </div>
  );
}
