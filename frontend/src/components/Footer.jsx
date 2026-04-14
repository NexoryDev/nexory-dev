import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import '../styles/Footer.css';

const GITHUB_PROFILE_URL = 'https://github.com/NexoryDev';

export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <span className="footer-logo">nexory-dev.de</span>
          <p className="footer-tagline">{t('footer.tagline')}</p>
        </div>

        <div className="footer-section">
          <h4 className="footer-section-title">{t('footer.nav_heading')}</h4>
          <ul className="footer-nav-list">
            <li><Link to="/home">{t('nav.home')}</Link></li>
            <li><Link to="/github">{t('nav.github')}</Link></li>
            <li><Link to="/contact">{t('nav.contact')}</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-section-title">{t('footer.nav_section_title')}</h4>
          <ul className="footer-nav-list">
            <li><Link to="/imprint">{t('nav.imprint')}</Link></li>
            <li><Link to="/privacy">{t('nav.policy')}</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-section-title">{t('footer.links_heading')}</h4>
          <ul className="footer-nav-list">
            <li>
              <a
                href={GITHUB_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
              >
                <span className="icon">
                  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
                      0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53
                      .63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95
                      0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0
                      1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0
                      3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013
                      8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                  </svg>
                </span>
                <span className="text">NexoryDev</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {year} nexory-dev.de</p>
      </div>
    </footer>
  );
}
