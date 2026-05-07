import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Me.css";
import { apiFetch } from "../../api/apiClient";
import { useLanguage } from "../../context/LanguageContext";
import supportIcon from "../../components/icons/support_icon.png";
import devIcon from "../../components/icons/dev_icon.png";
import contributorIcon from "../../components/icons/constributor_icon.png";

const RARITY_GLOW = {
  legendary: "rgba(245,158,11,0.35)",
  epic:      "rgba(236,72,153,0.35)",
  rare:      "rgba(139,92,246,0.35)",
  common:    "rgba(16,185,129,0.25)",
};

const BADGE_ICONS = {
  day_one_supporter: supportIcon,
  nexory_contributor: contributorIcon,
  verified_dev: devIcon,
};

const BADGE_DESCRIPTION_KEYS = {
  day_one_supporter: "badge.desc.day_one_supporter",
  waitlister: "badge.desc.waitlister",
  nexory_contributor: "badge.desc.nexory_contributor",
  verified_dev: "badge.desc.verified_dev",
};

function getBadgeDescription(t, badge) {
  const key = BADGE_DESCRIPTION_KEYS[badge?.id];
  if (key) {
    return t(key);
  }
  if (typeof badge?.description === "string" && badge.description.startsWith("badge.desc.")) {
    return t(badge.description);
  }
  return badge?.description ?? "";
}

function BadgeIcon({ id, color }) {
  const src = BADGE_ICONS[id];
  if (src) {
    return (
      <img
        src={src}
        alt={id}
        width={40}
        height={40}
        aria-hidden
        style={{ objectFit: "cover", display: "block", width: "100%", height: "100%" }}
      />
    );
  }
  const props = { width: 26, height: 26, viewBox: "0 0 24 24", fill: "none", "aria-hidden": true };
  switch (id) {
    case "waitlister":
      return (
        <svg {...props}>
          <defs>
            <linearGradient id="me-grad-wl" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#c4b5fd" /><stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <path d="M6 3h12v4l-4 5 4 5v4H6v-4l4-5-4-5V3z" fill="url(#me-grad-wl)" opacity="0.9" />
          <path d="M6 3h12" stroke="#c4b5fd" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M6 21h12" stroke="#c4b5fd" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M8 17l4-4 4 4" fill="#fff" opacity="0.5" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" fill={color} opacity="0.8" />
          <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#fff" fontWeight="bold">?</text>
        </svg>
      );
  }
}

const Me = () => {
  const [user, setUser] = useState(null);
  const [badges, setBadges] = useState([]);
  const [activeBadge, setActiveBadge] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const navigate = useNavigate();
  const { t, language } = useLanguage();

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
                {t("account.me.public_profile")}
              </a>
            ) : null}
          </div>

          {syncing ? (
            <div className="me-badges-loading">
              <div className="me-badges-spinner" />
              <span>{t("account.me.badges_loading")}</span>
            </div>
          ) : null}

          {!syncing && badges.length === 0 ? (
            <p className="me-empty">{t("account.me.badges_empty")}</p>
          ) : null}

          {!syncing && badges.length > 0 ? (
            <div className="me-badge-grid">
              {badges.map((b) => (
                <button
                  key={b.id}
                  className={`me-badge-card me-badge-card--${b.rarity}`}
                  onClick={() => setActiveBadge(b)}
                  style={{ "--badge-color": b.color, "--badge-glow": RARITY_GLOW[b.rarity] ?? "transparent" }}
                >
                  <div className="me-badge-icon-wrap">
                    <BadgeIcon id={b.id} color={b.color} />
                  </div>
                  <div className="me-badge-body">
                    <span className="me-badge-name">{b.name}</span>
                    <span className="me-badge-rarity" data-rarity={b.rarity}>
                      {t(`badge.rarity.${b.rarity}`) ?? b.rarity}
                    </span>
                  </div>
                  <svg className="me-badge-arrow" width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ))}
            </div>
          ) : null}
        </div>

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

      {activeBadge ? (
        <div className="badge-modal-backdrop" onClick={() => setActiveBadge(null)}>
          <div
            className="badge-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ "--badge-color": activeBadge.color, "--badge-glow": RARITY_GLOW[activeBadge.rarity] ?? "transparent" }}
          >
            <div className="badge-modal-hero" data-rarity={activeBadge.rarity}>
              <div className="badge-modal-icon-wrap">
                <BadgeIcon id={activeBadge.id} color={activeBadge.color} />
              </div>
              <div
                className="badge-modal-glow"
                style={{ background: `radial-gradient(ellipse at center, ${RARITY_GLOW[activeBadge.rarity] ?? "transparent"} 0%, transparent 70%)` }}
              />
            </div>
            <div className="badge-modal-body">
              <div className="badge-modal-title-row">
                <h4 className="badge-modal-name">{activeBadge.name}</h4>
                <span className="me-badge-rarity" data-rarity={activeBadge.rarity}>
                  {t(`badge.rarity.${activeBadge.rarity}`) ?? activeBadge.rarity}
                </span>
              </div>
              <p className="badge-modal-desc">{getBadgeDescription(t, activeBadge)}</p>
              {activeBadge.earned_at ? (
                <p className="badge-modal-date">
                  {t("badge.earned_at")}{" "}
                  {new Date(activeBadge.earned_at).toLocaleDateString(
                    language === "de" ? "de-DE" : "en-US",
                    { day: "numeric", month: "long", year: "numeric" }
                  )}
                </p>
              ) : null}
            </div>
            <div className="badge-modal-footer">
              <button className="badge-modal-close-btn" onClick={() => setActiveBadge(null)}>
                {t("badge.close")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Me;

