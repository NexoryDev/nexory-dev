import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { useLanguage } from "../context/LanguageContext";
import "../styles/Navbar.css";
import "../styles/ProfileNavbar.css";

export default function ProfileNavbar() {
  const { user, clearAuth } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
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
    <nav className={`navebar${scrolled ? " scrolled" : ""}`}>
      <div className="logo-container">
        <Link to="/home">
          <img src="/favicon.ico" alt="Logo" className="logo" />
        </Link>
      </div>

      <ul className={`navebar-menu${menuOpen ? " active" : ""}`}>
        <li>
          <Link to="/home" className={isActive("/home") ? "active" : ""}>
            {t("nav.home")}
          </Link>
        </li>
        <li>
          <Link to="/github" className={isActive("/github") ? "active" : ""}>
            {t("nav.github")}
          </Link>
        </li>
        <li>
          <Link to="/contact" className={isActive("/contact") ? "active" : ""}>
            {t("nav.contact")}
          </Link>
        </li>
      </ul>

      <div className="right-controls">
        <div className="language-switch" aria-label={t("nav.language_switcher")}>
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
            aria-label="Benutzermenü"
          >
            <span className="user-menu__avatar">
              {avatar ? (
                <img src={avatar} alt={displayName} />
              ) : (
                <span className="user-menu__initial">{initial}</span>
              )}
            </span>
            <span className="user-menu__label">{user?.email || displayName}</span>
            <svg className="user-menu__chevron" width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="user-menu__dropdown">
              <div className="user-menu__dropdown-header">
                <span className="user-menu__dropdown-email">{user?.email}</span>
                {user?.username && (
                  <span className="user-menu__dropdown-username">@{user.username}</span>
                )}
              </div>
              <div className="user-menu__divider" />
              <button className="user-menu__item" onClick={() => navigate("/me")}>
                <svg width="14" height="14" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.25"/><path d="M2 13c0-3.038 2.462-5.5 5.5-5.5S13 9.962 13 13" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/></svg>
                Mein Profil
              </button>
              <button className="user-menu__item" onClick={() => navigate("/me/products")}>
                <svg width="14" height="14" viewBox="0 0 15 15" fill="none"><rect x="1.5" y="2.5" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.25"/><path d="M5 2.5V5m5-2.5V5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/></svg>
                Produkte
              </button>
              <button className="user-menu__item" onClick={() => navigate("/me/settings")}>
                <svg width="14" height="14" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.25"/><path d="M7.5 1v1.5M7.5 12.5V14M1 7.5h1.5M12.5 7.5H14M2.636 2.636l1.06 1.06M11.304 11.304l1.06 1.06M2.636 12.364l1.06-1.06M11.304 3.696l1.06-1.06" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/></svg>
                Einstellungen
              </button>
              <div className="user-menu__divider" />
              <button className="user-menu__item user-menu__item--danger" onClick={handleLogout}>
                <svg width="14" height="14" viewBox="0 0 15 15" fill="none"><path d="M5 13H3a1 1 0 01-1-1V3a1 1 0 011-1h2M10 10l3-2.5L10 5M13 7.5H6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Abmelden
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        className={`navebar-toggle${menuOpen ? " active" : ""}`}
        onClick={toggleMenu}
        role="button"
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
        tabIndex={0}
        onKeyDown={onToggleKeyDown}
      >
        <span /><span /><span /><span />
      </div>
    </nav>
  );
}
