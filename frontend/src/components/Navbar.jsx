import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import '../styles/Navbar.css';

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  function isActive(path) {
    return location.pathname.startsWith(path);
  }

  function toggleMenu() {
    setMenuOpen(current => !current);
  }

  function onToggleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleMenu();
    }
  }

  return (
    <nav className={`navebar${scrolled ? ' scrolled' : ''}`}>
      <div className="logo-container">
        <Link to="/home">
          <img src="/favicon.ico" alt="Logo" className="logo" />
        </Link>
      </div>

      <ul className={`navebar-menu${menuOpen ? ' active' : ''}`}>
        <li>
          <Link to="/home" className={isActive('/home') ? 'active' : ''}>
            {t('nav.home')}
          </Link>
        </li>
        <li>
          <Link to="/github" className={isActive('/github') ? 'active' : ''}>
            {t('nav.github')}
          </Link>
        </li>
        <li>
          <Link to="/contact" className={isActive('/contact') ? 'active' : ''}>
            {t('nav.contact')}
          </Link>
        </li>
      </ul>

      <div className="language-switch" aria-label={t('nav.language_switcher')}>
        <button
          className={language === 'de' ? 'active' : ''}
          onClick={() => setLanguage('de')}
        >
          DE
        </button>
        <button
          className={language === 'en' ? 'active' : ''}
          onClick={() => setLanguage('en')}
        >
          EN
        </button>
      </div>

      <div
        className={`navebar-toggle${menuOpen ? ' active' : ''}`}
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
