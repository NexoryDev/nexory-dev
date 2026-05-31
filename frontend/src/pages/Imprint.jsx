import '../styles/Legal.css';
import { useLanguage } from '../context/LanguageContext';

export default function Imprint() {
  const { t } = useLanguage();

  return (
    <main className="legal-page">
      <div className="legal-container">
        <header className="legal-header">
          <p className="legal-label">{t('imprint.label')}</p>
          <h1 className="legal-title">{t('imprint.title')}</h1>
          <p className="legal-subtitle">{t('imprint.subtitle')}</p>
        </header>

        <section className="legal-section">
          <h2>{t('imprint.responsible')}</h2>
          <p>
            Luca Bohnet<br />
            Vogelsangweg 3<br />
            72202 Nagold<br />
            Germany<br />
            Phone: +49 7452 8866722
          </p>
          <p>
            <strong>Email:</strong>{' '}
            <a href="mailto:support@nexory-dev.de">support@nexory-dev.de</a>
          </p>
        </section>

        <section className="legal-section">
          <h2>{t('imprint.disclaimer')}</h2>

          <h3>{t('imprint.liability_content')}</h3>
          <p>
            The content of this website is created with highest possible care. However, we cannot
            guarantee that the information is always complete, correct, or up to date. We are
            therefore liable only according to applicable legal provisions.
          </p>
          <p>
            This imprint is provided for legal compliance and informational purposes only and does
            not constitute legal advice.
          </p>

          <h3>{t('imprint.liability_links')}</h3>
          <p>
            This website may contain links to third-party websites. We have no influence on the
            content of external websites and therefore assume no liability for them. The respective
            provider or operator of the linked pages is solely responsible for their content.
          </p>
          <p>
            At the time of linking, no illegal content was apparent. A permanent content control of
            the linked pages is not possible without concrete evidence of a violation of law.
          </p>

          <h3>{t('imprint.copyright')}</h3>
          <p>
            The content and works published on this website by the operator are subject to German
            and international copyright law. Reproduction, editing, distribution, or any form of
            commercialization of such material beyond the scope of copyright law requires the prior
            written consent of the respective author or creator.
          </p>
          <p>
            Downloads and copies of this website are permitted solely for private, non-commercial
            use.
          </p>
        </section>

        <footer className="legal-foot">
          <p>{t('imprint.last_updated')}</p>
        </footer>
      </div>
    </main>
  );
}
