import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { useLanguage } from "../../context/LanguageContext";
import "../../styles/Me.css";

const Settings = () => {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [error, setError] = useState("");
  const [usernameError, setUsernameError] = useState(false);

  const [githubConnecting, setGithubConnecting] = useState(false);
  const [githubDisconnecting, setGithubDisconnecting] = useState(false);
  const [githubError, setGithubError] = useState("");
  const [githubSuccess, setGithubSuccess] = useState("");
  const [badgeSyncing, setBadgeSyncing] = useState(false);
  const [badgeSyncMsg, setBadgeSyncMsg] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [twoFaBusy, setTwoFaBusy] = useState(false);
  const [twoFaCode, setTwoFaCode] = useState("");
  const [twoFaSecret, setTwoFaSecret] = useState("");
  const [twoFaOtpauthUrl, setTwoFaOtpauthUrl] = useState("");
  const [twoFaBackupCodes, setTwoFaBackupCodes] = useState([]);
  const [twoFaError, setTwoFaError] = useState("");
  const [twoFaSuccess, setTwoFaSuccess] = useState("");

  const navigate = useNavigate();
  const { clearAuth } = useAuth();
  const { t } = useLanguage();

  const getAccessToken = () => {
    return localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
  };

  const saveNewAccessToken = (accessToken) => {
    if (!accessToken) return;
    const storage = localStorage.getItem("remember_me") === "1" ? localStorage : sessionStorage;
    storage.setItem("access_token", accessToken);
  };

  const loadUser = async () => {
    const token = getAccessToken();
    if (!token) return navigate("/login");

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/profile/me", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        clearAuth();
        return navigate("/login");
      }

      const data = await res.json();

      saveNewAccessToken(data.access_token);

      const nextUser = data.user || data;
      setUser(nextUser);
      setUsername(nextUser?.username || nextUser?.email || "");
      await loadTwoFaStatus(token);
    } catch {
      setError(t("account.settings.errors.load_failed"));
    } finally {
      setLoading(false);
    }
  };

  const loadTwoFaStatus = async (tokenOverride) => {
    const token = tokenOverride || getAccessToken();
    if (!token) return;

    try {
      const res = await fetch("/api/auth/2fa/status", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) return;
      const data = await res.json().catch(() => ({}));
      setTwoFaEnabled(Boolean(data.enabled));
    } catch {
    }
  };

  const startTwoFaSetup = async () => {
    const token = getAccessToken();
    if (!token) return navigate("/login");

    setTwoFaBusy(true);
    setTwoFaError("");
    setTwoFaSuccess("");
    setTwoFaBackupCodes([]);

    try {
      const res = await fetch("/api/auth/2fa/setup", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const map = {
          already_enabled: t("account.settings.twofa.errors.already_enabled"),
        };
        setTwoFaError(map[data.error] || t("account.settings.twofa.errors.setup_failed"));
        return;
      }

      setTwoFaSecret(data.secret || "");
      setTwoFaOtpauthUrl(data.otpauth_url || "");
      setTwoFaSuccess(t("account.settings.twofa.setup_ready"));
    } catch {
      setTwoFaError(t("account.settings.twofa.errors.setup_failed"));
    } finally {
      setTwoFaBusy(false);
    }
  };

  const enableTwoFa = async () => {
    const token = getAccessToken();
    if (!token) return navigate("/login");

    if (!twoFaCode.trim()) {
      setTwoFaError(t("account.settings.twofa.errors.code_required"));
      return;
    }

    setTwoFaBusy(true);
    setTwoFaError("");
    setTwoFaSuccess("");

    try {
      const res = await fetch("/api/auth/2fa/enable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: twoFaCode.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const map = {
          setup_not_started: t("account.settings.twofa.errors.setup_not_started"),
          invalid_code: t("account.settings.twofa.errors.invalid_code"),
        };
        setTwoFaError(map[data.error] || t("account.settings.twofa.errors.enable_failed"));
        return;
      }

      setTwoFaEnabled(true);
      setTwoFaBackupCodes(Array.isArray(data.backup_codes) ? data.backup_codes : []);
      setTwoFaSecret("");
      setTwoFaOtpauthUrl("");
      setTwoFaCode("");
      setTwoFaSuccess(t("account.settings.twofa.enabled"));
    } catch {
      setTwoFaError(t("account.settings.twofa.errors.enable_failed"));
    } finally {
      setTwoFaBusy(false);
    }
  };

  const disableTwoFa = async () => {
    const token = getAccessToken();
    if (!token) return navigate("/login");

    if (!twoFaCode.trim()) {
      setTwoFaError(t("account.settings.twofa.errors.code_required"));
      return;
    }

    setTwoFaBusy(true);
    setTwoFaError("");
    setTwoFaSuccess("");

    try {
      const res = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: twoFaCode.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const map = {
          not_enabled: t("account.settings.twofa.errors.not_enabled"),
          invalid_code: t("account.settings.twofa.errors.invalid_code"),
        };
        setTwoFaError(map[data.error] || t("account.settings.twofa.errors.disable_failed"));
        return;
      }

      setTwoFaEnabled(false);
      setTwoFaCode("");
      setTwoFaBackupCodes([]);
      setTwoFaSuccess(t("account.settings.twofa.disabled"));
    } catch {
      setTwoFaError(t("account.settings.twofa.errors.disable_failed"));
    } finally {
      setTwoFaBusy(false);
    }
  };

  const regenerateBackupCodes = async () => {
    const token = getAccessToken();
    if (!token) return navigate("/login");

    if (!twoFaCode.trim()) {
      setTwoFaError(t("account.settings.twofa.errors.code_required"));
      return;
    }

    setTwoFaBusy(true);
    setTwoFaError("");
    setTwoFaSuccess("");

    try {
      const res = await fetch("/api/auth/2fa/backup/regenerate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: twoFaCode.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const map = {
          not_enabled: t("account.settings.twofa.errors.not_enabled"),
          invalid_code: t("account.settings.twofa.errors.invalid_code"),
        };
        setTwoFaError(map[data.error] || t("account.settings.twofa.errors.regenerate_failed"));
        return;
      }

      setTwoFaBackupCodes(Array.isArray(data.backup_codes) ? data.backup_codes : []);
      setTwoFaSuccess(t("account.settings.twofa.backup_regenerated"));
    } catch {
      setTwoFaError(t("account.settings.twofa.errors.regenerate_failed"));
    } finally {
      setTwoFaBusy(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const connectGithub = async () => {
    const token = getAccessToken();
    if (!token) return navigate("/login");

    setGithubConnecting(true);
    setGithubError("");
    setGithubSuccess("");

    try {
      const res = await fetch("/api/github/connect/start", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setGithubError(data.error === "github_oauth_not_configured"
          ? t("account.settings.github.not_configured")
          : t("account.settings.errors.save_failed"));
        return;
      }

      // Store access token so the callback page can use it
      sessionStorage.setItem("gh_connect_token", token);
      window.location.href = data.url;
    } catch {
      setGithubError(t("account.settings.errors.save_failed"));
    } finally {
      setGithubConnecting(false);
    }
  };

  const disconnectGithub = async () => {
    const token = getAccessToken();
    if (!token) return navigate("/login");

    setGithubDisconnecting(true);
    setGithubError("");
    setGithubSuccess("");

    try {
      const res = await fetch("/api/profile/me/github", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setGithubError(t("account.settings.errors.save_failed"));
        return;
      }

      setUser((prev) => prev ? { ...prev, github_username: null, github_id: null } : prev);
      setGithubSuccess(t("account.settings.github.disconnected"));
    } catch {
      setGithubError(t("account.settings.errors.save_failed"));
    } finally {
      setGithubDisconnecting(false);
    }
  };

  const syncBadges = async () => {
    const token = getAccessToken();
    if (!token) return navigate("/login");

    setBadgeSyncing(true);
    setBadgeSyncMsg("");

    try {
      const res = await fetch("/api/profile/me/badges/sync", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setBadgeSyncMsg(t("account.settings.github.sync_failed"));
        return;
      }

      const count = Array.isArray(data.newly_earned) ? data.newly_earned.length : 0;
      setBadgeSyncMsg(count > 0
        ? t("account.settings.github.sync_new").replace("{count}", count)
        : t("account.settings.github.sync_none"));
    } catch {
      setBadgeSyncMsg(t("account.settings.github.sync_failed"));
    } finally {
      setBadgeSyncing(false);
    }
  };

  const changePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword.length < 6) {
      setPasswordError(t("reset.weak_password"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(t("reset.passwords_dont_match"));
      return;
    }

    const token = getAccessToken();
    if (!token) return navigate("/login");

    setChangingPassword(true);

    try {
      const res = await fetch("/api/profile/me/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ password: newPassword })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setPasswordError(data.error === "weak_password" ? t("reset.weak_password") : t("account.settings.errors.save_failed"));
        return;
      }

      setPasswordSuccess(t("account.settings.security.success"));
      setNewPassword("");
      setConfirmPassword("");

      clearAuth();
      navigate("/login");
    } catch {
      setPasswordError(t("account.settings.errors.save_failed"));
    } finally {
      setChangingPassword(false);
    }
  };

  const save = async () => {
    const token = getAccessToken();
    if (!token) return navigate("/login");

    setSaving(true);
    setError("");
    setUsernameError(false);

    try {
      const res = await fetch("/api/profile/me/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: username.trim() }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (body.error === "username_taken") {
          setUsernameError(true);
        } else if (body.error === "username_too_long") {
          setUsernameError(true);
        } else {
          setError(t("account.settings.errors.save_failed"));
        }
        return;
      }

      navigate("/me");
    } catch {
      setError(t("account.settings.errors.save_failed"));
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });
    } catch {
      
        }

    clearAuth();
    navigate("/login");
  };

  const deleteAccount = async () => {
    const token = getAccessToken();
    if (!token) return navigate("/login");

    setDeleting(true);
    setError("");

    try {
      const res = await fetch("/api/profile/me/delete", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        credentials: "include"
      });

      if (!res.ok) {
        setError(t("account.settings.errors.delete_failed"));
        return;
      }

      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });

      clearAuth();
      navigate("/login");
    } catch {
      setError(t("account.settings.errors.delete_failed"));
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setDeleteConfirmText("");
    }
  };

  if (loading || !user) return <div className="me-loading">{t("account.loading")}</div>;

  return (
    <div className="me-layout settings-layout">
      <main className="me-content settings-content">
        <div className="me-settings">
          <h1 className="settings-page-title">{t("account.settings.title")}</h1>
          <p className="settings-page-subtitle">{t("account.settings.subtitle")}</p>

          {error ? <p className="settings-error">{error}</p> : null}

          <section className="settings-section">
            <h3 className="settings-title">{t("account.settings.profile.title")}</h3>
            <p className="settings-help">{t("account.settings.profile.help")}</p>

            <input
              value={username}
              onChange={(e) => { setUsername(e.target.value); setUsernameError(false); }}
              placeholder={t("account.settings.profile.username_placeholder")}
              style={usernameError ? { borderColor: "#f85149", boxShadow: "0 0 0 3px rgba(248,81,73,0.2)" } : undefined}
            />
            {usernameError ? (
              <p className="settings-username-error">
                {username.trim().length > 15
                  ? t("account.settings.errors.username_too_long")
                  : t("account.settings.errors.username_taken_inline")}
              </p>
            ) : null}

            <button className="settings-save-btn" onClick={save} disabled={saving || deleting}>
              {saving ? t("account.settings.actions.saving") : t("account.settings.actions.save_changes")}
            </button>
          </section>

          <section className="settings-section">
            <h3 className="settings-title">{t("account.settings.github.title")}</h3>
            <p className="settings-help">{t("account.settings.github.help")}</p>

            {githubError ? <p className="settings-error">{githubError}</p> : null}
            {githubSuccess ? <p className="settings-success">{githubSuccess}</p> : null}

            {user?.github_id ? (
              <div className="settings-github-connected">
                <span className="settings-github-badge">
                  ✓ {t("account.settings.github.connected_as").replace("{login}", user.github_username)}
                </span>
                <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                  <button
                    className="danger-btn delete-btn"
                    onClick={disconnectGithub}
                    disabled={githubDisconnecting || badgeSyncing}
                  >
                    {githubDisconnecting ? "..." : t("account.settings.github.disconnect")}
                  </button>
                </div>
                {badgeSyncMsg ? <p className="settings-help" style={{ marginTop: 8 }}>{badgeSyncMsg}</p> : null}
              </div>
            ) : (
              <button
                className="settings-password-btn"
                onClick={connectGithub}
                disabled={githubConnecting}
              >
                {githubConnecting ? "..." : t("account.settings.github.connect")}
              </button>
            )}
          </section>

          <section className="settings-section">
            <h3 className="settings-title">{t("account.settings.security.title")}</h3>
            <p className="settings-help">{t("account.settings.security.help")}</p>

            {passwordError ? <p className="settings-error">{passwordError}</p> : null}
            {passwordSuccess ? <p className="settings-success">{passwordSuccess}</p> : null}

            <input
              type="password"
              placeholder={t("account.settings.security.new_password_placeholder")}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder={t("account.settings.security.confirm_password_placeholder")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button
              className="settings-password-btn"
              onClick={changePassword}
              disabled={changingPassword || saving || deleting}
            >
              {changingPassword ? "..." : t("account.settings.actions.change_password")}
            </button>

            <div style={{ marginTop: 20 }}>
              <h4 className="settings-title" style={{ marginBottom: 8 }}>{t("account.settings.twofa.title")}</h4>
              <p className="settings-help" style={{ marginBottom: 12 }}>
                {twoFaEnabled ? t("account.settings.twofa.status_enabled") : t("account.settings.twofa.status_disabled")}
              </p>

              {twoFaError ? <p className="settings-error">{twoFaError}</p> : null}
              {twoFaSuccess ? <p className="settings-success">{twoFaSuccess}</p> : null}

              {!twoFaEnabled ? (
                <>
                  <button
                    className="settings-password-btn"
                    onClick={startTwoFaSetup}
                    disabled={twoFaBusy || saving || deleting}
                  >
                    {twoFaBusy ? "..." : t("account.settings.twofa.start_setup")}
                  </button>

                  {twoFaSecret ? (
                    <div style={{ marginTop: 12 }}>
                      <p className="settings-help">{t("account.settings.twofa.secret_label")}: <strong>{twoFaSecret}</strong></p>
                      {twoFaOtpauthUrl ? (
                        <a href={twoFaOtpauthUrl} className="me-profile-link" style={{ display: "inline-block", marginBottom: 10 }}>
                          {t("account.settings.twofa.otpauth_link")}
                        </a>
                      ) : null}
                      <input
                        value={twoFaCode}
                        onChange={(e) => setTwoFaCode(e.target.value)}
                        placeholder={t("account.settings.twofa.code_placeholder")}
                      />
                      <button
                        className="settings-password-btn"
                        onClick={enableTwoFa}
                        disabled={twoFaBusy || saving || deleting}
                      >
                        {twoFaBusy ? "..." : t("account.settings.twofa.enable")}
                      </button>
                    </div>
                  ) : null}
                </>
              ) : (
                <>
                  <input
                    value={twoFaCode}
                    onChange={(e) => setTwoFaCode(e.target.value)}
                    placeholder={t("account.settings.twofa.code_or_backup_placeholder")}
                  />
                  <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                    <button
                      className="settings-password-btn"
                      onClick={regenerateBackupCodes}
                      disabled={twoFaBusy || saving || deleting}
                    >
                      {twoFaBusy ? "..." : t("account.settings.twofa.regenerate_backup")}
                    </button>
                    <button
                      className="danger-btn delete-btn"
                      onClick={disableTwoFa}
                      disabled={twoFaBusy || saving || deleting}
                    >
                      {twoFaBusy ? "..." : t("account.settings.twofa.disable")}
                    </button>
                  </div>
                </>
              )}

              {twoFaBackupCodes.length > 0 ? (
                <div style={{ marginTop: 12 }}>
                  <p className="settings-help">{t("account.settings.twofa.backup_codes_label")}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {twoFaBackupCodes.map((code) => (
                      <span
                        key={code}
                        style={{
                          border: "1px solid rgba(110,118,129,0.3)",
                          borderRadius: 8,
                          padding: "6px 10px",
                          fontFamily: "monospace",
                          fontSize: 12,
                        }}
                      >
                        {code}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <section className="settings-section danger-zone">
            <h3 className="settings-title">{t("account.settings.management.title")}</h3>
            <p className="settings-help">{t("account.settings.management.help")}</p>

            <button className="danger-btn logout-btn" onClick={logout} disabled={saving || deleting}>
              {t("account.settings.actions.logout")}
            </button>

            <button className="danger-btn delete-btn" onClick={() => setShowDeleteModal(true)} disabled={saving || deleting}>
              {t("account.settings.actions.delete_account")}
            </button>
          </section>
        </div>

        {showDeleteModal ? (
          <div className="settings-modal-backdrop" onClick={() => !deleting && setShowDeleteModal(false)}>
            <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
              <div className="settings-modal-header">
                <h4>{t("account.settings.modal.title")}</h4>
                <button
                  className="settings-modal-close"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  aria-label={t("account.settings.actions.cancel")}
                >
                  ×
                </button>
              </div>

              <div className="settings-modal-body">
                <p>{t("account.settings.modal.text")}</p>
                <p className="settings-help">{t("account.settings.modal.confirm_help")}</p>
                <input
                  className="settings-confirm-input"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder={t("account.settings.modal.confirm_token")}
                  autoFocus
                />
              </div>

              <div className="settings-modal-actions">
                <button className="settings-modal-cancel" onClick={() => setShowDeleteModal(false)} disabled={deleting}>{t("account.settings.actions.cancel")}</button>
                <button
                  className="delete-btn settings-modal-delete"
                  onClick={deleteAccount}
                  disabled={deleting || deleteConfirmText.trim() !== t("account.settings.modal.confirm_token")}
                >
                  {deleting ? t("account.settings.actions.deleting") : t("account.settings.actions.confirm_delete")}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default Settings;
