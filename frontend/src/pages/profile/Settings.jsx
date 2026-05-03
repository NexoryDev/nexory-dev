import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { useLanguage } from "../../context/LanguageContext";
import "../../styles/Me.css";

const API = "http://localhost:5000";

const Settings = () => {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { clearAuth } = useAuth();
  const { t } = useLanguage();

  const getAccessToken = () => {
    return localStorage.getItem("access_token");
  };

  const saveNewAccessToken = (accessToken) => {
    if (!accessToken) return;
    localStorage.setItem("access_token", accessToken);
  };

  const loadUser = async () => {
    const token = getAccessToken();
    if (!token) return navigate("/login");

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/api/profile/me`, {
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
      setAvatar(nextUser?.avatar || "");
    } catch {
      setError(t("account.settings.errors.load_failed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const save = async () => {
    const token = getAccessToken();
    if (!token) return navigate("/login");

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`${API}/api/profile/me/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          username: username.trim(),
          avatar
        })
      });

      if (!res.ok) {
        setError(t("account.settings.errors.save_failed"));
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
      await fetch(`${API}/api/auth/logout`, {
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
      const res = await fetch(`${API}/api/profile/me/delete`, {
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

      await fetch(`${API}/api/auth/logout`, {
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

  const onAvatarSelect = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setAvatar("");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
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
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t("account.settings.profile.username_placeholder")}
            />

            <input
              type="file"
              onChange={onAvatarSelect}
            />

            <button className="settings-save-btn" onClick={save} disabled={saving || deleting}>
              {saving ? t("account.settings.actions.saving") : t("account.settings.actions.save_changes")}
            </button>
          </section>

          <section className="settings-section">
            <h3 className="settings-title">{t("account.settings.security.title")}</h3>
            <p className="settings-help">{t("account.settings.security.help")}</p>

            <input type="password" placeholder={t("account.settings.security.new_password_placeholder")} />
            <input type="password" placeholder={t("account.settings.security.confirm_password_placeholder")} />

            <button className="settings-password-btn">{t("account.settings.actions.change_password")}</button>
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
