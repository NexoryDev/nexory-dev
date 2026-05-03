import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import "../styles/Login.css";

export default function VerifyEmail() {
  const { token } = useParams();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [status, setStatus] = useState("verifying");
  const called = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus("failed");
      return;
    }

    if (called.current) return;
    called.current = true;

    fetch(`/api/auth/verify/${token}`)
      .then((res) => res.json().catch(() => ({})))
      .then((data) => {
        if (data.status === "verified") {
          setStatus("success");
        } else {
          setStatus("failed");
        }
      })
      .catch(() => setStatus("failed"));
  }, [token]);

  return (
    <div className="login-hero">
      <div className="login-box">
        <h1>{t("verify.title")}</h1>

        {status === "verifying" && (
          <p className="form-info">{t("verify.verifying")}</p>
        )}

        {status === "success" && (
          <>
            <div className="form-success">{t("verify.success")}</div>
            <button onClick={() => navigate("/login")}>
              {t("verify.back_to_login")}
            </button>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="form-error">{t("verify.failed")}</div>
            <button onClick={() => navigate("/login")}>
              {t("verify.back_to_login")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
