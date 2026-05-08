import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const GitHubCallback = () => {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");

      if (!code || !state) {
        setStatus("error");
        setMessage(t("account.settings.github.callback_missing_params"));
        return;
      }

      const token =
        sessionStorage.getItem("gh_connect_token") ||
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch("/api/github/connect/callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ code, state }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          const errorMap = {
            invalid_state: t("account.settings.github.callback_invalid_state"),
            github_already_linked: t("account.settings.github.already_linked"),
            github_token_exchange_failed: t("account.settings.github.callback_error"),
            github_profile_fetch_failed: t("account.settings.github.callback_error"),
          };
          setStatus("error");
          setMessage(errorMap[data.error] || t("account.settings.github.callback_error"));
          return;
        }

        sessionStorage.removeItem("gh_connect_token");
        setStatus("success");
        setMessage(
          t("account.settings.github.callback_success").replace(
            "{login}",
            data.github_username
          )
        );

        setTimeout(() => navigate("/me/settings"), 2000);
      } catch {
        setStatus("error");
        setMessage(t("account.settings.github.callback_error"));
      }
    };

    run();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        gap: 16,
        padding: 32,
        textAlign: "center",
      }}
    >
      {status === "loading" && (
        <p style={{ opacity: 0.7 }}>{t("account.settings.github.callback_loading")}</p>
      )}
      {status === "success" && (
        <p style={{ color: "#10b981", fontWeight: 600 }}>{message}</p>
      )}
      {status === "error" && (
        <>
          <p style={{ color: "#f85149", fontWeight: 600 }}>{message}</p>
          <button
            className="settings-save-btn"
            onClick={() => navigate("/me/settings")}
          >
            {t("account.settings.actions.back")}
          </button>
        </>
      )}
    </div>
  );
};

export default GitHubCallback;
