import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Me.css";
import { apiFetch } from "../../api/apiClient";
import { useLanguage } from "../../context/LanguageContext";

const RARITY_LABEL = {
  legendary: "Legendary",
  epic: "Epic",
  rare: "Rare",
  common: "Common",
};

const Me = () => {
  const [user, setUser] = useState(null);
  const [badges, setBadges] = useState([]);
  const [activeBadge, setActiveBadge] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const getAccessToken = () =>
    localStorage.getItem("access_token") || sessionStorage.getItem("access_token");

  const loadUser = async () => {
    const data = await apiFetch("/api/profile/me");

    if (!data?.user) return navigate("/login");

    const baseUser = {
      ...data.user,
      username: data.user.username ?? data.user.email,
      avatar: data.user.avatar || null,
      achievements: data.user.achievements || [],
    };

    setUser(baseUser);
    setBadges(Array.isArray(data.user.badges) ? data.user.badges : []);
  };

  const syncBadges = async () => {
    const token = getAccessToken();
    if (!token) return navigate("/login");

    setSyncing(true);

    try {
      const res = await fetch("/api/profile/me/badges/sync", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;

      const data = await res.json();
      setBadges(data.badges || []);


    } catch {
      // silent
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    loadUser().then(() => syncBadges());
  }, []);

  if (!user) return <div className="me-loading">{t("account.loading")}</div>;

  return (
    <div className="me-layout">
      <main className="me-content">

        {/* Header */}
        <div className="me-header">
          <div className="avatar">
            {user.avatar ? (
              <img src={user.avatar} alt={user.username} />
            ) : (
              <span>{user.email?.charAt(0).toUpperCase() || "?"}</span>
            )}
          </div>
          <div>
            <h2>{user.username}</h2>
            <p className="me-email">{user.email}</p>
          </div>
        </div>

        {/* Badges */}
        <div className="me-section">
          <div className="me-section-header">
            <h3 className="me-section-title">{t("account.me.badges")}</h3>
            {user.username ? (
              <a
                href={`/user/${user.username}`}
                target="_blank"
                rel="noreferrer"
                className="me-profile-link"
              >
                Öffentliches Profil →
              </a>
            ) : null}
          </div>

          {syncing ? (
            <p className="me-sync-msg">Badges werden geladen…</p>
          ) : null}

          {!syncing && badges.length === 0 ? (
            <p className="me-empty">Noch keine Badges verdient.</p>
          ) : (
            <div className="badge-cards-grid">
              {badges.map((b) => (
                <button
                  key={b.id}
                  className="badge-card"
                  onClick={() => setActiveBadge(b)}
                >
                  <span className="badge-card-icon" style={{ background: b.color }}>
                    {b.name?.[0] ?? "?"}
                  </span>
                  <div className="badge-card-body">
                    <span className="badge-card-name">{b.name}</span>
                    <span className="badge-card-rarity" data-rarity={b.rarity}>
                      {RARITY_LABEL[b.rarity] ?? b.rarity}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Achievements */}
        {user.achievements.length > 0 ? (
          <div className="me-section">
            <h3 className="me-section-title">{t("account.me.achievements")}</h3>
            <div>
              {user.achievements.map((a, i) => (
                <div key={i} className="achievement">
                  {a.name}
                </div>
              ))}
            </div>
          </div>
        ) : null}

      </main>

      {/* Badge Detail Modal */}
      {activeBadge ? (
        <div
          className="badge-modal-backdrop"
          onClick={() => setActiveBadge(null)}
        >
          <div
            className="badge-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="badge-modal-hero"
              style={{ background: activeBadge.color }}
            >
              <span className="badge-modal-initial">
                {activeBadge.name?.[0] ?? "?"}
              </span>
            </div>

            <div className="badge-modal-body">
              <h4 className="badge-modal-name">{activeBadge.name}</h4>
              <span
                className="badge-card-rarity"
                data-rarity={activeBadge.rarity}
              >
                {RARITY_LABEL[activeBadge.rarity] ?? activeBadge.rarity}
              </span>
              <p className="badge-modal-desc">{activeBadge.description}</p>
              {activeBadge.earned_at ? (
                <p className="badge-modal-date">
                  Erhalten am{" "}
                  {new Date(activeBadge.earned_at).toLocaleDateString("de-DE", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              ) : null}
            </div>

            <div className="badge-modal-footer">
              <button
                className="badge-modal-close-btn"
                onClick={() => setActiveBadge(null)}
              >
                Schließen
              </button>
              {user.username ? (
                <a
                  href={`/u/${user.username}`}
                  target="_blank"
                  rel="noreferrer"
                  className="badge-modal-profile-btn"
                >
                  Öffentliches Profil →
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Me;

