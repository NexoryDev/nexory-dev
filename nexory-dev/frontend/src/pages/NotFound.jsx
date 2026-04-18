import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import '../styles/NotFound.css';

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <main className="not-found-page">
      <section className="not-found-hero">
        <div className="not-found-card">
          <div className="not-found-badge">404</div>
          <h1>{t('notfound.title')}</h1>
          <p className="not-found-text">{t('notfound.message')}</p>
          <p className="not-found-subtext">{t('notfound.hint')}</p>

          <div className="not-found-actions">
            <Link to="/home" className="not-found-btn primary">
              {t('notfound.home')}
            </Link>
            <Link to="/github" className="not-found-btn secondary">
              {t('notfound.github')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
