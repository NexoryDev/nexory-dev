import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { useLanguage } from "../context/LanguageContext";
import { SvgProfile, SvgSettings, SvgProducts } from "../components/icons/svgs";
import "../styles/Navbar.css";
import "../styles/ProfileNavbar.css";

export default function ProfileNavbar() {
  const { user, clearAuth } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const isHomeRoute = location.pathname === "/" || location.pathname === "/home";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  function isActive(path) {
    return location.pathname.startsWith(path);
  }

  function toggleMenu() {
    setMenuOpen((v) => !v);
  }

  function onToggleKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleMenu();
    }
  }

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const displayName = user?.username || user?.email || "?";
  const initial = displayName.charAt(0).toUpperCase();
  const avatar = user?.avatar;

  return (
    <nav className={`navbar ${isHomeRoute ? "navbar-home" : ""} ${scrolled ? "scrolled" : ""}`.trim()}>
      <div className="navbar-left">
        <Link to="/home" className={`logo-wrapper ${isHomeRoute ? "logo-wrapper-home" : ""}`}>
          <img src="/favicon.ico" alt="NexoryDev Logo" className={`logo ${isHomeRoute ? "logo-home-round" : ""}`} />
          <span className={`logo-text ${isHomeRoute ? "logo-text-home" : ""}`}>NexoryDev</span>
        </Link>
      </div>

      <ul className={`navbar-menu ${isHomeRoute ? "navbar-menu-home" : ""} ${menuOpen ? "active" : ""}`.trim()}>
        <li>
          <Link
            to="/home"
            className={`nav-link-featured ${isActive("/home") ? "active" : ""}`.trim()}
          >
            {t("nav.home")}
          </Link>
        </li>
        <li className="navbar-menu-controls">
          <div className={`language-switch ${isHomeRoute ? "language-switch-home" : ""}`} aria-label={t("nav.language_switcher")}> 
            <button className={language === "de" ? "active" : ""} onClick={() => setLanguage("de")}>DE</button>
            <button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>EN</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            <Link to="/me" onClick={() => setMenuOpen(false)} className="login-btn">{t('profile.dropdown.my_profile')}</Link>
            <Link to="/me/products" onClick={() => setMenuOpen(false)} className="login-btn">{t('profile.dropdown.products')}</Link>
            <Link to="/me/settings" onClick={() => setMenuOpen(false)} className="login-btn">{t('profile.dropdown.settings')}</Link>
            <button onClick={() => { setMenuOpen(false); handleLogout(); }} style={{ marginTop: 4 }} className="login-btn">{t('profile.dropdown.logout')}</button>
          </div>
        </li>
        <li>
          <Link
            to="/github"
            className={`nav-link-featured ${isActive("/github") ? "active" : ""}`.trim()}
          >
            {t("nav.github")}
          </Link>
        </li>
        <li>
          <Link
            to="/contact"
            className={`nav-link-featured ${isActive("/contact") ? "active" : ""}`.trim()}
          >
            {t("nav.contact")}
          </Link>
        </li>
      </ul>

      <div className={`navbar-right ${isHomeRoute ? "navbar-right-home" : ""}`}>
        <div className={`language-switch ${isHomeRoute ? "language-switch-home" : ""}`} aria-label={t("nav.language_switcher")}>
          <button
            className={language === "de" ? "active" : ""}
            onClick={() => setLanguage("de")}
          >
            DE
          </button>
          <button
            className={language === "en" ? "active" : ""}
            onClick={() => setLanguage("en")}
          >
            EN
          </button>
        </div>

        <div className="user-menu" ref={dropdownRef}>
          <button
            className={`user-menu__btn${dropdownOpen ? " open" : ""}`}
            onClick={() => setDropdownOpen((v) => !v)}
            aria-expanded={dropdownOpen}
            aria-label={t("profile.dropdown.aria_label")}
          >
          <span className="user-menu__avatar">
            {avatar && !avatarError ? (
              <img
                src={avatar}
                alt={displayName}
                width={22}
                height={22}
                style={{ width: 22, height: 22, objectFit: "cover", borderRadius: "50%", display: "block" }}
                onError={() => setAvatarError(true)}
              />
            ) : (
              <span className="user-menu__initial">{initial}</span>
            )}
          </span>
            <span className="user-menu__label">{displayName || user?.email}</span>
            <svg className="user-menu__chevron" width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="user-menu__dropdown">
              <div className="user-menu__dropdown-header">
                <span className="user-menu__dropdown-email">{user?.email}</span>
              </div>
              <div className="user-menu__divider" />
              <button className="user-menu__item" onClick={() => navigate("/me")}>
                <SvgProfile size={14} />
                {t("profile.dropdown.my_profile")}
              </button>
              <button className="user-menu__item" onClick={() => navigate("/me/products")}>
                <SvgProducts size={14} />
                {t("profile.dropdown.products")}
              </button>
              <button className="user-menu__item" onClick={() => navigate("/me/settings")}>
                <SvgSettings size={14} />
                {t("profile.dropdown.settings")}
              </button>
              <div className="user-menu__divider" />
              <button className="user-menu__item user-menu__item--danger" onClick={handleLogout}>
                <svg width="14" height="14" viewBox="0 0 15 15" fill="none"><path d="M5 13H3a1 1 0 01-1-1V3a1 1 0 011-1h2M10 10l3-2.5L10 5M13 7.5H6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {t("profile.dropdown.logout")}
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        className={`navbar-toggle ${menuOpen ? "active" : ""}`}
        onClick={toggleMenu}
        role="button"
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
        tabIndex={0}
        onKeyDown={onToggleKeyDown}
      >
        <span />
        <span />
        <span />
      </div>
    </nav>
  );
}
