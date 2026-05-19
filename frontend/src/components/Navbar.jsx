import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useLanguage } from "../context/LanguageContext";

import "../styles/Navbar.css";

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();

  const location = useLocation();
  const navigate = useNavigate();
  const isHomeRoute = location.pathname === "/" || location.pathname === "/home";

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  function isActive(path) {
    return location.pathname.startsWith(path);
  }

  function toggleMenu() {
    setMenuOpen((prev) => !prev);
  }

  return (
    <nav className={`navbar navbar-home ${scrolled ? "scrolled" : ""}`.trim()}>

      <div className="navbar-left">

        <Link to="/home" className="logo-wrapper logo-wrapper-home">

          <img
            src="/favicon.ico"
            alt="NexoryDev Logo"
            className="logo logo-home-round"
          />

          <span className="logo-text logo-text-home">
            NexoryDev
          </span>

        </Link>

      </div>

      <ul className={`navbar-menu navbar-menu-home ${menuOpen ? "active" : ""}`.trim()}>

        <li>
          <Link
            to="/home"
            className={`nav-link-featured ${isHomeRoute || isActive("/home") ? "active" : ""}`.trim()}
          >
            {t("nav.home")}
          </Link>
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

        <li className="navbar-menu-controls">
          <div className="language-switch language-switch-home">

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

          <button
            className="login-btn login-btn-home"
            onClick={() => navigate("/login")}
          >
            {t("nav.login")}
          </button>
        </li>

      </ul>

      <div className="navbar-right navbar-right-home">

        <div className="language-switch language-switch-home">

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

        <button
          className="login-btn login-btn-home"
          onClick={() => navigate("/login")}
        >
          {t("nav.login")}
        </button>

      </div>

      <div
        className={`navbar-toggle ${menuOpen ? "active" : ""}`}
        onClick={toggleMenu}
      >
        <span />
        <span />
        <span />
      </div>

    </nav>
  );
}