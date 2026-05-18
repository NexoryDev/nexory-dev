import '../styles/Legal.css';
import { useLanguage } from '../context/LanguageContext';

const GITHUB_PROFILE_URL = 'https://github.com/NexoryDev';

export default function Contact() {
  const { t } = useLanguage();

  return (
    <main className="legal-page">
      <div className="legal-container">
        <header className="legal-header">
          <p className="legal-label">{t('contact.label')}</p>
          <h1 className="legal-title">{t('contact.title')}</h1>
          <p className="legal-subtitle">{t('contact.subtitle')}</p>
        </header>

        <section className="legal-section">
          <p>
            {t('contact.coming_soon')}{' '}
            <a
              href={GITHUB_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/NexoryDev
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}