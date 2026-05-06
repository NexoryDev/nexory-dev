import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/UserProfile.css";
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

function BadgeIcon({ id, color }) {
  const src = BADGE_ICONS[id];
  if (src) {
    return (
      <img
        src={src}
        alt={id}
        width={46}
        height={46}
        aria-hidden
        style={{ objectFit: "cover", display: "block", width: "100%", height: "100%" }}
      />
    );
  }
  const props = {
    width: 28,
    height: 28,
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": true,
  };
  switch (id) {
    case "waitlister":
      return (
        <svg {...props}>
          <defs>
            <linearGradient id="grad-wl" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#c4b5fd" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <path
            d="M6 3h12v4l-4 5 4 5v4H6v-4l4-5-4-5V3z"
            fill="url(#grad-wl)"
            opacity="0.9"
          />
          <path d="M6 3h12" stroke="#c4b5fd" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M6 21h12" stroke="#c4b5fd" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M8 17l4-4 4 4" fill="#fff" opacity="0.5" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" fill={color} opacity="0.8" />
          <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#fff" fontWeight="bold">
            ?
          </text>
        </svg>
      );
  }
}

export default function UserProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeBadge, setActiveBadge] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/profile/public/${encodeURIComponent(username)}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d) => { if (d) setProfile(d); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [username]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className="up-hero">
        <div className="up-loading-wrap">
          <div className="up-spinner" />
          <p className="up-loading-text">{t("profile.loading")}</p>
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="up-hero">
        <div className="up-not-found">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="10" stroke="#30363d" strokeWidth="1.5" />
            <path d="M9 9h.01M15 9h.01" stroke="#6e7681" strokeWidth="2" strokeLinecap="round" />
            <path d="M8 15s1.5-2 4-2 4 2 4 2" stroke="#6e7681" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <p>{t("profile.not_found")}</p>
          <button className="up-back-btn" onClick={() => navigate(-1)}>
            ← {t("profile.back")}
          </button>
        </div>
      </div>
    );
  }

  const memberSince = profile.member_since
    ? new Date(profile.member_since).toLocaleDateString(
        language === "de" ? "de-DE" : "en-US",
        { month: "long", year: "numeric" }
      )
    : null;

  return (
    <div className="up-hero">
      <div className="up-card">

        <button className="up-back-btn" onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t("profile.back")}
        </button>

        <div className="up-header">
          <div className="up-avatar">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.username} />
            ) : (
              <span>{profile.username?.[0]?.toUpperCase() ?? "?"}</span>
            )}
          </div>
          <div className="up-header-info">
            <h1 className="up-username">{profile.username}</h1>
            {memberSince && (
              <p className="up-since">
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden style={{ opacity: 0.5, verticalAlign: "middle", marginRight: 4 }}>
                  <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M5 1v3M11 1v3M2 7h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                {t("profile.member_since")} {memberSince}
              </p>
            )}
            {profile.badges.length > 0 && (
              <div className="up-badge-count-row">
                <span className="up-badge-count-pill">
                  {profile.badges.length} Badge{profile.badges.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="up-section">
          <h2 className="up-section-title">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M8 1l1.8 3.6L14 5.6l-3 2.9.7 4.1L8 10.4l-3.7 2.2.7-4.1L2 5.6l4.2-.9L8 1z" fill="currentColor" />
            </svg>
            {t("profile.section.badges")}
          </h2>
          {profile.badges.length === 0 ? (
            <p className="up-empty">{t("profile.badges_empty")}</p>
          ) : (
            <div className="up-badges-grid">
              {profile.badges.map((b) => (
                <button
                  key={b.id}
                  className={`up-badge-card up-badge-card--${b.rarity}`}
                  onClick={() => setActiveBadge(b)}
                  style={{
                    "--badge-color": b.color,
                    "--badge-glow": RARITY_GLOW[b.rarity] ?? "transparent",
                  }}
                >
                  <div className="up-badge-icon-wrap">
                    <BadgeIcon id={b.id} color={b.color} />
                  </div>
                  <div className="up-badge-body">
                    <span className="up-badge-name">{b.name}</span>
                    <span className="up-rarity" data-rarity={b.rarity}>
                      {t(`badge.rarity.${b.rarity}`) ?? b.rarity}
                    </span>
                  </div>
                  <svg className="up-badge-arrow" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="up-footer">
          <button className="up-share-btn" onClick={copyLink}>
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M3 8l4 4 6-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t("profile.link_copied")}
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M10 3H13v3M13 3l-6 6M7 5H3v8h8V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t("profile.copy_link")}
              </>
            )}
          </button>
        </div>

      </div>

      {activeBadge && (
        <div className="up-modal-backdrop" onClick={() => setActiveBadge(null)}>
          <div
            className="up-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ "--badge-color": activeBadge.color, "--badge-glow": RARITY_GLOW[activeBadge.rarity] ?? "transparent" }}
          >
            <div className="up-modal-hero" data-rarity={activeBadge.rarity}>
              <div className="up-modal-icon-wrap">
                <BadgeIcon id={activeBadge.id} color={activeBadge.color} />
              </div>
              <div
                className="up-modal-glow"
                style={{ background: `radial-gradient(ellipse at center, ${RARITY_GLOW[activeBadge.rarity] ?? "transparent"} 0%, transparent 70%)` }}
              />
            </div>
            <div className="up-modal-body">
              <div className="up-modal-title-row">
                <h3 className="up-modal-name">{activeBadge.name}</h3>
                <span className="up-rarity" data-rarity={activeBadge.rarity}>
                  {t(`badge.rarity.${activeBadge.rarity}`) ?? activeBadge.rarity}
                </span>
              </div>
              <p className="up-modal-desc">{t(activeBadge.description)}</p>
              {activeBadge.earned_at && (
                <p className="up-earned-on">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden style={{ opacity: 0.5, verticalAlign: "middle", marginRight: 4 }}>
                    <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M5 1v3M11 1v3M2 7h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  {t("badge.earned_at")}{" "}
                  {new Date(activeBadge.earned_at).toLocaleDateString(
                    language === "de" ? "de-DE" : "en-US",
                    { day: "numeric", month: "long", year: "numeric" }
                  )}
                </p>
              )}
            </div>
            <div className="up-modal-actions">
              <button onClick={() => setActiveBadge(null)}>{t("badge.close")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
