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

const BADGE_DESCRIPTION_KEYS = {
  day_one_supporter: "badge.desc.day_one_supporter",
  waitlister: "badge.desc.waitlister",
  nexory_contributor: "badge.desc.nexory_contributor",
  verified_dev: "badge.desc.verified_dev",
};

const LOCATION_OPTIONS = [
  { value: "de_berlin", de: "Berlin, Deutschland", en: "Berlin, Germany", timezone: "Europe/Berlin" },
  { value: "de_hamburg", de: "Hamburg, Deutschland", en: "Hamburg, Germany", timezone: "Europe/Berlin" },
  { value: "de_munich", de: "Muenchen, Deutschland", en: "Munich, Germany", timezone: "Europe/Berlin" },
  { value: "de_cologne", de: "Koeln, Deutschland", en: "Cologne, Germany", timezone: "Europe/Berlin" },
  { value: "at_vienna", de: "Wien, Oesterreich", en: "Vienna, Austria", timezone: "Europe/Vienna" },
  { value: "ch_zurich", de: "Zuerich, Schweiz", en: "Zurich, Switzerland", timezone: "Europe/Zurich" },
  { value: "ch_geneva", de: "Genf, Schweiz", en: "Geneva, Switzerland", timezone: "Europe/Zurich" },
  { value: "nl_amsterdam", de: "Amsterdam, Niederlande", en: "Amsterdam, Netherlands", timezone: "Europe/Amsterdam" },
  { value: "be_brussels", de: "Bruessel, Belgien", en: "Brussels, Belgium", timezone: "Europe/Brussels" },
  { value: "fr_paris", de: "Paris, Frankreich", en: "Paris, France", timezone: "Europe/Paris" },
  { value: "es_madrid", de: "Madrid, Spanien", en: "Madrid, Spain", timezone: "Europe/Madrid" },
  { value: "pt_lisbon", de: "Lissabon, Portugal", en: "Lisbon, Portugal", timezone: "Europe/Lisbon" },
  { value: "it_rome", de: "Rom, Italien", en: "Rome, Italy", timezone: "Europe/Rome" },
  { value: "dk_copenhagen", de: "Kopenhagen, Daenemark", en: "Copenhagen, Denmark", timezone: "Europe/Copenhagen" },
  { value: "se_stockholm", de: "Stockholm, Schweden", en: "Stockholm, Sweden", timezone: "Europe/Stockholm" },
  { value: "no_oslo", de: "Oslo, Norwegen", en: "Oslo, Norway", timezone: "Europe/Oslo" },
  { value: "fi_helsinki", de: "Helsinki, Finnland", en: "Helsinki, Finland", timezone: "Europe/Helsinki" },
  { value: "pl_warsaw", de: "Warschau, Polen", en: "Warsaw, Poland", timezone: "Europe/Warsaw" },
  { value: "cz_prague", de: "Prag, Tschechien", en: "Prague, Czechia", timezone: "Europe/Prague" },
  { value: "uk_london", de: "London, Vereinigtes Koenigreich", en: "London, United Kingdom", timezone: "Europe/London" },
  { value: "ie_dublin", de: "Dublin, Irland", en: "Dublin, Ireland", timezone: "Europe/Dublin" },
  { value: "us_new_york", de: "New York, USA", en: "New York, USA", timezone: "America/New_York" },
  { value: "us_chicago", de: "Chicago, USA", en: "Chicago, USA", timezone: "America/Chicago" },
  { value: "us_denver", de: "Denver, USA", en: "Denver, USA", timezone: "America/Denver" },
  { value: "us_los_angeles", de: "Los Angeles, USA", en: "Los Angeles, USA", timezone: "America/Los_Angeles" },
  { value: "ca_toronto", de: "Toronto, Kanada", en: "Toronto, Canada", timezone: "America/Toronto" },
  { value: "ca_vancouver", de: "Vancouver, Kanada", en: "Vancouver, Canada", timezone: "America/Vancouver" },
  { value: "br_sao_paulo", de: "Sao Paulo, Brasilien", en: "Sao Paulo, Brazil", timezone: "America/Sao_Paulo" },
  { value: "ar_buenos_aires", de: "Buenos Aires, Argentinien", en: "Buenos Aires, Argentina", timezone: "America/Argentina/Buenos_Aires" },
  { value: "za_johannesburg", de: "Johannesburg, Suedafrika", en: "Johannesburg, South Africa", timezone: "Africa/Johannesburg" },
  { value: "eg_cairo", de: "Kairo, Aegypten", en: "Cairo, Egypt", timezone: "Africa/Cairo" },
  { value: "in_delhi", de: "Neu-Delhi, Indien", en: "New Delhi, India", timezone: "Asia/Kolkata" },
  { value: "ae_dubai", de: "Dubai, VAE", en: "Dubai, UAE", timezone: "Asia/Dubai" },
  { value: "sg_singapore", de: "Singapur", en: "Singapore", timezone: "Asia/Singapore" },
  { value: "jp_tokyo", de: "Tokio, Japan", en: "Tokyo, Japan", timezone: "Asia/Tokyo" },
  { value: "kr_seoul", de: "Seoul, Suedkorea", en: "Seoul, South Korea", timezone: "Asia/Seoul" },
  { value: "cn_shanghai", de: "Shanghai, China", en: "Shanghai, China", timezone: "Asia/Shanghai" },
  { value: "au_sydney", de: "Sydney, Australien", en: "Sydney, Australia", timezone: "Australia/Sydney" },
  { value: "au_perth", de: "Perth, Australien", en: "Perth, Australia", timezone: "Australia/Perth" },
  { value: "nz_auckland", de: "Auckland, Neuseeland", en: "Auckland, New Zealand", timezone: "Pacific/Auckland" },
];

const LOCATION_BY_VALUE = LOCATION_OPTIONS.reduce((acc, item) => {
  acc[item.value] = item;
  return acc;
}, {});

function inferTimezoneFromLocation(location) {
  if (!location || typeof location !== "string") return null;

  const normalized = location.trim().toLowerCase();

  if (
    normalized.includes("berlin") ||
    normalized.includes("hamburg") ||
    normalized.includes("deutschland") ||
    normalized.includes("germany")
  ) {
    return "Europe/Berlin";
  }

  if (
    normalized.includes("wien") ||
    normalized.includes("vienna") ||
    normalized.includes("osterreich") ||
    normalized.includes("österreich") ||
    normalized.includes("austria")
  ) {
    return "Europe/Vienna";
  }

  if (
    normalized.includes("zurich") ||
    normalized.includes("zürich") ||
    normalized.includes("schweiz") ||
    normalized.includes("switzerland")
  ) {
    return "Europe/Zurich";
  }

  if (
    normalized.includes("london") ||
    normalized.includes("united kingdom") ||
    normalized.includes("vereinigtes konigreich") ||
    normalized.includes("vereinigtes königreich") ||
    normalized.includes("uk")
  ) {
    return "Europe/London";
  }

  if (
    normalized.includes("new york") ||
    normalized.includes("nyc")
  ) {
    return "America/New_York";
  }

  if (
    normalized.includes("los angeles") ||
    normalized.includes("la")
  ) {
    return "America/Los_Angeles";
  }

  if (normalized.includes("tokyo") || normalized.includes("tokio") || normalized.includes("japan")) {
    return "Asia/Tokyo";
  }

  return null;
}

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
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="9" fill={color} opacity="0.8" />
        <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#fff" fontWeight="bold">
          ?
        </text>
      </svg>
    );
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

  const locationOption = LOCATION_BY_VALUE[profile.location];
  const locationLabel = locationOption ? (language === "de" ? locationOption.de : locationOption.en) : profile.location;
  const resolvedTimezone = profile.timezone || locationOption?.timezone || inferTimezoneFromLocation(profile.location) || null;

  let profileLocalTime = null;
  if (resolvedTimezone) {
    try {
      profileLocalTime = new Intl.DateTimeFormat(
        language === "de" ? "de-DE" : "en-US",
        {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: resolvedTimezone,
          hour12: false,
        }
      ).format(new Date());
    } catch {
      profileLocalTime = null;
    }
  }

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
          {/* ── Profile meta ── */}
          {(profile.bio || locationLabel || profileLocalTime || profile.github_username) && (
            <div className="up-section-inner">
              <h2 className="up-section-title">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M8 1.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zM2.5 14a5.5 5.5 0 0 1 11 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                {t("profile.section.about")}
              </h2>

              {profile.bio && <p className="up-bio">{profile.bio}</p>}

              <div className="up-info-list">
                {locationLabel && (
                  <div className="up-info-row">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <path d="M8 1.5a5 5 0 0 1 5 5c0 3.5-5 8-5 8s-5-4.5-5-8a5 5 0 0 1 5-5z" stroke="currentColor" strokeWidth="1.4" />
                      <circle cx="8" cy="6.5" r="1.5" fill="currentColor" />
                    </svg>
                    <span>{locationLabel}</span>
                  </div>
                )}
                {profileLocalTime && (
                  <div className="up-info-row">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
                      <path d="M8 4.5V8l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>{profileLocalTime}&ensp;<span className="up-tz">{resolvedTimezone}</span></span>
                  </div>
                )}
                {profile.github_username && (
                  <div className="up-info-row">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                      <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38v-1.34C3.73 14.36 3.26 12.97 3.26 12.97c-.36-.92-.88-1.16-.88-1.16-.72-.49.06-.48.06-.48.79.06 1.21.81 1.21.81.7 1.2 1.84.85 2.29.65.07-.51.27-.85.5-1.05-1.74-.2-3.57-.87-3.57-3.87 0-.86.31-1.56.81-2.11-.08-.2-.35-1 .08-2.08 0 0 .66-.21 2.17.81a7.55 7.55 0 0 1 1.97-.27c.67 0 1.34.09 1.97.27 1.5-1.02 2.16-.81 2.16-.81.43 1.08.16 1.88.08 2.08.5.55.81 1.25.81 2.11 0 3.01-1.84 3.67-3.59 3.86.28.24.53.72.53 1.46v2.16c0 .21.14.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                    </svg>
                    <span>@{profile.github_username}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {(profile.bio || locationLabel || profileLocalTime || profile.github_username) && (
            <div className="up-divider" />
          )}

          {/* ── Badges ── */}
          <div className="up-section-inner">
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
              <p className="up-modal-desc">{getBadgeDescription(t, activeBadge)}</p>
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
