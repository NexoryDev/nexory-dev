import '../styles/Legal.css';

export default function Imprint() {
  return (
    <main className="legal-page">
      <div className="legal-container">

        <header className="legal-header">
          <p className="legal-label">Legal</p>
          <h1 className="legal-title">Imprint</h1>
          <p className="legal-subtitle">Information pursuant to § 5 TMG (German Telemedia Act)</p>
        </header>

        <section className="legal-section">
          <h2>Responsible Party</h2>
          <p>
            Luca Bohnet<br />
            Vogelsangweg 3<br />
            72202 Nagold<br />
            07452 8866722
          </p>
          <p>
            <strong>E-Mail:</strong>{' '}
            <a href="mailto:support@nexory-dev.de">support@nexory-dev.de</a>
          </p>
        </section>

        <section className="legal-section">
          <h2>Disclaimer</h2>

          <h3>Liability for Content</h3>
          <p>
            The contents of this website have been created with the utmost care. However, we cannot
            guarantee the accuracy, completeness, or timeliness of the content. As a service provider
            we are responsible for our own content on these pages in accordance with general law.
            However, we are not obligated to monitor transmitted or stored third-party information or
            to investigate circumstances that indicate illegal activity.
          </p>

          <h3>Liability for Links</h3>
          <p>
            Our website contains links to external websites over which we have no control. Therefore
            we cannot accept any liability for these external contents. The respective provider or
            operator of the linked pages is always responsible for their content. The linked pages
            were checked for possible legal violations at the time of linking. Illegal content was
            not recognizable at the time of linking.
          </p>

          <h3>Copyright</h3>
          <p>
            The content and works created by the site operators on these pages are subject to
            copyright law. Duplication, processing, distribution, or any form of commercialization
            of such material beyond the scope of copyright law requires the prior written consent of
            its respective author or creator. Downloads and copies of this site are only permitted
            for private, non-commercial use.
          </p>
        </section>

        <footer className="legal-foot">
          <p>Last updated: April 2026</p>
        </footer>

      </div>
    </main>
  );
}
