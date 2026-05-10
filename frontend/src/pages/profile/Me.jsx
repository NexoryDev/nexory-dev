import React, { useEffect, useRef, useState } from "react";
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

const LOCATION_OPTIONS = [
  { value: "de_berlin", de: "Berlin, Deutschland", en: "Berlin, Germany", timezone: "Europe/Berlin" },
  { value: "de_hamburg", de: "Hamburg, Deutschland", en: "Hamburg, Germany", timezone: "Europe/Berlin" },
  { value: "de_munich", de: "München, Deutschland", en: "Munich, Germany", timezone: "Europe/Berlin" },
  { value: "de_cologne", de: "Köln, Deutschland", en: "Cologne, Germany", timezone: "Europe/Berlin" },
  { value: "at_vienna", de: "Wien, Oesterreich", en: "Vienna, Austria", timezone: "Europe/Vienna" },
  { value: "ch_zurich", de: "Zürich, Schweiz", en: "Zurich, Switzerland", timezone: "Europe/Zurich" },
  { value: "ch_geneva", de: "Genf, Schweiz", en: "Geneva, Switzerland", timezone: "Europe/Zurich" },
  { value: "nl_amsterdam", de: "Amsterdam, Niederlande", en: "Amsterdam, Netherlands", timezone: "Europe/Amsterdam" },
  { value: "be_brussels", de: "Brüssel, Belgien", en: "Brussels, Belgium", timezone: "Europe/Brussels" },
  { value: "fr_paris", de: "Paris, Frankreich", en: "Paris, France", timezone: "Europe/Paris" },
  { value: "es_madrid", de: "Madrid, Spanien", en: "Madrid, Spain", timezone: "Europe/Madrid" },
  { value: "pt_lisbon", de: "Lissabon, Portugal", en: "Lisbon, Portugal", timezone: "Europe/Lisbon" },
  { value: "it_rome", de: "Rom, Italien", en: "Rome, Italy", timezone: "Europe/Rome" },
  { value: "dk_copenhagen", de: "Kopenhagen, Danemark", en: "Copenhagen, Denmark", timezone: "Europe/Copenhagen" },
  { value: "se_stockholm", de: "Stockholm, Schweden", en: "Stockholm, Sweden", timezone: "Europe/Stockholm" },
  { value: "no_oslo", de: "Oslo, Norwegen", en: "Oslo, Norway", timezone: "Europe/Oslo" },
  { value: "fi_helsinki", de: "Helsinki, Finnland", en: "Helsinki, Finland", timezone: "Europe/Helsinki" },
  { value: "pl_warsaw", de: "Warschau, Polen", en: "Warsaw, Poland", timezone: "Europe/Warsaw" },
  { value: "cz_prague", de: "Prag, Tschechien", en: "Prague, Czechia", timezone: "Europe/Prague" },
  { value: "uk_london", de: "London, Vereinigtes Königreich", en: "London, United Kingdom", timezone: "Europe/London" },
  { value: "ie_dublin", de: "Dublin, Irland", en: "Dublin, Ireland", timezone: "Europe/Dublin" },
  { value: "us_new_york", de: "New York, USA", en: "New York, USA", timezone: "America/New_York" },
  { value: "us_chicago", de: "Chicago, USA", en: "Chicago, USA", timezone: "America/Chicago" },
  { value: "us_denver", de: "Denver, USA", en: "Denver, USA", timezone: "America/Denver" },
  { value: "us_los_angeles", de: "Los Angeles, USA", en: "Los Angeles, USA", timezone: "America/Los_Angeles" },
  { value: "ca_toronto", de: "Toronto, Kanada", en: "Toronto, Canada", timezone: "America/Toronto" },
  { value: "ca_vancouver", de: "Vancouver, Kanada", en: "Vancouver, Canada", timezone: "America/Vancouver" },
  { value: "br_sao_paulo", de: "Sao Paulo, Brasilien", en: "Sao Paulo, Brazil", timezone: "America/Sao_Paulo" },
  { value: "ar_buenos_aires", de: "Buenos Aires, Argentinien", en: "Buenos Aires, Argentina", timezone: "America/Argentina/Buenos_Aires" },
  { value: "za_johannesburg", de: "Johannesburg, Südafrika", en: "Johannesburg, South Africa", timezone: "Africa/Johannesburg" },
  { value: "eg_cairo", de: "Kairo, Ägypten", en: "Cairo, Egypt", timezone: "Africa/Cairo" },
  { value: "in_delhi", de: "Neu-Delhi, Indien", en: "New Delhi, India", timezone: "Asia/Kolkata" },
  { value: "ae_dubai", de: "Dubai, VAE", en: "Dubai, UAE", timezone: "Asia/Dubai" },
  { value: "sg_singapore", de: "Singapur", en: "Singapore", timezone: "Asia/Singapore" },
  { value: "jp_tokyo", de: "Tokio, Japan", en: "Tokyo, Japan", timezone: "Asia/Tokyo" },
  { value: "kr_seoul", de: "Seoul, Südkorea", en: "Seoul, South Korea", timezone: "Asia/Seoul" },
  { value: "cn_shanghai", de: "Shanghai, China", en: "Shanghai, China", timezone: "Asia/Shanghai" },
  { value: "au_sydney", de: "Sydney, Australien", en: "Sydney, Australia", timezone: "Australia/Sydney" },
  { value: "au_perth", de: "Perth, Australien", en: "Perth, Australia", timezone: "Australia/Perth" },
  { value: "nz_auckland", de: "Auckland, Neuseeland", en: "Auckland, New Zealand", timezone: "Pacific/Auckland" },
];

const LOCATION_TIMEZONE_BY_VALUE = LOCATION_OPTIONS.reduce((acc, item) => {
  acc[item.value] = item.timezone;
  return acc;
}, {});

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
  const [profileSaving, setProfileSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [profileForm, setProfileForm] = useState({
    bio: "",
    location: "",
    timezone: "",
  });
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const avatarInputRef = useRef(null);

  const getAccessToken = () =>
    localStorage.getItem("access_token") || sessionStorage.getItem("access_token");

  const loadUser = async () => {
    const data = await apiFetch("/api/profile/me");

    if (!data?.user) return navigate("/login");

    const baseUser = {
      ...data.user,
      username: data.user.username ?? data.user.email,
      avatar: data.user.avatar || null,
      bio: data.user.bio || "",
      location: data.user.location || "",
      timezone: data.user.timezone || LOCATION_TIMEZONE_BY_VALUE[data.user.location] || "",
      achievements: data.user.achievements || [],
    };

    setUser(baseUser);
    setProfileForm({
      bio: baseUser.bio,
      location: baseUser.location,
      timezone: baseUser.timezone,
    });
    setAvatarPreview("");
    setAvatarFile(null);
    setBadges(Array.isArray(data.user.badges) ? data.user.badges : []);
  };

  const onAvatarClick = () => {
    if (profileSaving || avatarUploading) return;
    avatarInputRef.current?.click();
  };

  const onAvatarFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProfileError(t("account.me.avatar_invalid"));
      return;
    }

    setProfileError("");
    setProfileSuccess("");
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const uploadAvatar = async (token) => {
    if (!avatarFile) return user?.avatar || null;

    setAvatarUploading(true);
    const formData = new FormData();
    formData.append("file", avatarFile);

    try {
      const res = await fetch("/api/profile/me/avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.avatar) {
        throw new Error("avatar_upload_failed");
      }

      return data.avatar;
    } finally {
      setAvatarUploading(false);
    }
  };

  const saveProfile = async () => {
    const token = getAccessToken();
    if (!token) return navigate("/login");

    setProfileSaving(true);
    setProfileError("");
    setProfileSuccess("");

    try {
      const uploadedAvatar = await uploadAvatar(token);
      const payload = {
        bio: profileForm.bio,
        location: profileForm.location,
        timezone: profileForm.timezone,
      };

      if (uploadedAvatar !== user?.avatar) {
        payload.avatar = uploadedAvatar;
      }

      const res = await fetch("/api/profile/me/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.error) {
        throw new Error(data.error || "save_failed");
      }

      setUser((prev) => ({
        ...prev,
        bio: profileForm.bio,
        location: profileForm.location,
        timezone: profileForm.timezone,
        ...(uploadedAvatar && uploadedAvatar !== prev?.avatar ? { avatar: uploadedAvatar } : {}),
      }));

      setAvatarFile(null);
      setAvatarPreview("");
      if (avatarInputRef.current) avatarInputRef.current.value = "";

      setProfileSuccess(t("account.me.profile_saved"));
      setTimeout(() => setProfileSuccess(""), 5000);
    } catch {
      setProfileError(t("account.me.profile_save_failed"));
    } finally {
      setProfileSaving(false);
    }
  };

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

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

        {profileError ? <p className="settings-error me-top-msg">{profileError}</p> : null}
        {profileSuccess ? <p className="settings-success me-top-msg">{profileSuccess}</p> : null}

        <div className="me-header">
          <div
            className="avatar avatar-editable"
            onClick={onAvatarClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onAvatarClick();
              }
            }}
            aria-label={t("account.me.avatar_change")}
            title={t("account.me.avatar_change")}
          >
            {avatarPreview || user.avatar ? (
              <img src={avatarPreview || user.avatar} alt={user.username} />
            ) : (
              <span>{user.email?.charAt(0).toUpperCase() || "?"}</span>
            )}
            <span className="avatar-edit-label">{t("account.me.avatar_change")}</span>
          </div>
          <div className="me-header-info">
            <div className="me-header-top">
              <h2>{user.username}</h2>
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
            <p className="me-email">{user.email}</p>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="me-hidden-input"
              onChange={onAvatarFileChange}
            />
          </div>
        </div>

        <div className="me-section me-section-first">
          <h3 className="me-section-title">{t("account.me.profile_details")}</h3>

          <div className="me-profile-grid">
            <label className="me-field">
              <span>{t("account.me.bio_label")}</span>
              <textarea
                value={profileForm.bio}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, bio: e.target.value }))}
                maxLength={25}
                placeholder={t("account.me.bio_placeholder")}
              />
              <span className="me-bio-counter">{profileForm.bio.length}/25</span>
            </label>

            <label className="me-field">
              <span>{t("account.me.location_label")}</span>
              <select
                value={profileForm.location}
                onChange={(e) => {
                  const nextLocation = e.target.value;
                  setProfileForm((prev) => ({
                    ...prev,
                    location: nextLocation,
                    timezone: LOCATION_TIMEZONE_BY_VALUE[nextLocation] || "",
                  }));
                }}
              >
                <option value="">{language === "de" ? "Standort auswaehlen" : "Select location"}</option>
                {LOCATION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {language === "de" ? option.de : option.en}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="me-divider" />

        <div className="me-section">
          <div className="me-section-header">
            <h3 className="me-section-title">{t("account.me.badges")}</h3>
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

        <div className="me-divider" />

        <div className="me-save-row">
          <button
            className="settings-save-btn me-save-btn"
            onClick={saveProfile}
            disabled={profileSaving || avatarUploading}
          >
            {profileSaving ? t("account.me.saving_profile") : t("account.me.save_profile")}
          </button>
        </div>

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

