import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/UserProfile.css";

const RARITY_LABEL = {
  legendary: "Legendary",
  epic: "Epic",
  rare: "Rare",
  common: "Common",
};

/* ── Per-badge SVG icons ─────────────────────────────────────── */
function BadgeIcon({ id, color }) {
  const props = {
    width: 28,
    height: 28,
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": true,
  };

  switch (id) {
    case "early_adopter":
      return (
        <svg {...props}>
          <defs>
            <radialGradient id="grad-ea" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#fde68a" />
              <stop offset="100%" stopColor="#f59e0b" />
            </radialGradient>
          </defs>
          {/* Rocket */}
          <path
            d="M12 2C9 5.5 7.5 9 7.5 13a4.5 4.5 0 009 0C16.5 9 15 5.5 12 2z"
            fill="url(#grad-ea)"
          />
          <ellipse cx="8.5" cy="14.5" rx="1.5" ry="2.5" fill={color} opacity="0.7" transform="rotate(-20 8.5 14.5)" />
          <ellipse cx="15.5" cy="14.5" rx="1.5" ry="2.5" fill={color} opacity="0.7" transform="rotate(20 15.5 14.5)" />
          <path d="M10.5 22c0-2 3-2 3 0" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="12" cy="10" r="1.5" fill="#fff" opacity="0.9" />
        </svg>
      );

    case "waitlister":
      return (
        <svg {...props}>
          <defs>
            <linearGradient id="grad-wl" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#c4b5fd" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          {/* Hourglass */}
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

    case "nexory_contributor":
      return (
        <svg {...props}>
          <defs>
            <linearGradient id="grad-nc" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f9a8d4" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
          {/* Git merge / branch */}
          <circle cx="6" cy="6" r="2.5" fill="url(#grad-nc)" />
          <circle cx="18" cy="6" r="2.5" fill="url(#grad-nc)" />
          <circle cx="12" cy="18" r="2.5" fill="url(#grad-nc)" />
          <path d="M6 8.5v2c0 2 1.5 3.5 3.5 3.5H12" stroke="#f9a8d4" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M18 8.5v2c0 2-1.5 3.5-3.5 3.5H12" stroke="#f9a8d4" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M12 15.5v2" stroke="#f9a8d4" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case "verified_dev":
      return (
        <svg {...props}>
          <defs>
            <linearGradient id="grad-vd" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6ee7b7" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
          {/* Shield + checkmark */}
          <path
            d="M12 2L4 5.5V11c0 4.4 3.4 8.5 8 9.5 4.6-1 8-5.1 8-9.5V5.5L12 2z"
            fill="url(#grad-vd)"
          />
          <path
            d="M8.5 12l2.5 2.5 4.5-5"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
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

/* ── Rarity glow colors ──────────────────────────────────────── */
const RARITY_GLOW = {
  legendary: "rgba(245,158,11,0.35)",
  epic:      "rgba(236,72,153,0.35)",
  rare:      "rgba(139,92,246,0.35)",
  common:    "rgba(16,185,129,0.25)",
};

export default function UserProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
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
          <p className="up-loading-text">Profil wird geladen…</p>
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
          <p>Dieses Profil existiert nicht.</p>
          <button className="up-back-btn" onClick={() => navigate(-1)}>
            ← Zurück
          </button>
        </div>
      </div>
    );
  }

  const memberSince = profile.member_since
    ? new Date(profile.member_since).toLocaleDateString("de-DE", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="up-hero">
      <div className="up-card">

        <button className="up-back-btn" onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Zurück
        </button>

        {/* ── Header ── */}
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
                Mitglied seit {memberSince}
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

        {/* ── Badges ── */}
        <div className="up-section">
          <h2 className="up-section-title">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M8 1l1.8 3.6L14 5.6l-3 2.9.7 4.1L8 10.4l-3.7 2.2.7-4.1L2 5.6l4.2-.9L8 1z" fill="currentColor" />
            </svg>
            Badges
          </h2>
          {profile.badges.length === 0 ? (
            <p className="up-empty">Noch keine Badges verdient.</p>
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
                      {RARITY_LABEL[b.rarity] ?? b.rarity}
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

        {/* ── Footer ── */}
        <div className="up-footer">
          <button className="up-share-btn" onClick={copyLink}>
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M3 8l4 4 6-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Link kopiert
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M10 3H13v3M13 3l-6 6M7 5H3v8h8V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Profil-Link teilen
              </>
            )}
          </button>
        </div>

      </div>

      {/* ── Modal ── */}
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
                  {RARITY_LABEL[activeBadge.rarity] ?? activeBadge.rarity}
                </span>
              </div>
              <p className="up-modal-desc">{activeBadge.description}</p>
              {activeBadge.earned_at && (
                <p className="up-earned-on">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden style={{ opacity: 0.5, verticalAlign: "middle", marginRight: 4 }}>
                    <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M5 1v3M11 1v3M2 7h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  Erhalten am{" "}
                  {new Date(activeBadge.earned_at).toLocaleDateString("de-DE", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
            <div className="up-modal-actions">
              <button onClick={() => setActiveBadge(null)}>Schließen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
