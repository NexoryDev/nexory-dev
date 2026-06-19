import "../styles/Legal.css";
import { useLanguage } from "../context/LanguageContext";

export default function Imprint() {
  const { t, language } = useLanguage();
  const german = language === "de";

  return (
    <main className="legal-page">
      <div className="legal-container">
        <header className="legal-header">
          <p className="legal-label">{t("imprint.label")}</p>
          <h1 className="legal-title">{t("imprint.title")}</h1>
          <p className="legal-subtitle">{t("imprint.subtitle")}</p>
        </header>

        <section className="legal-section">
          <h2>{german ? "Angaben gemäß § 5 DDG" : "Information pursuant to Section 5 DDG"}</h2>
          <p>
            Luca Bohnet<br />
            Vogelsangweg 3<br />
            72202 Nagold<br />
            Deutschland
          </p>
          <p>
            {german ? "Telefon" : "Phone"}: +49 7452 8866722<br />
            E-Mail: <a href="mailto:support@nexory-dev.de">support@nexory-dev.de</a>
          </p>
        </section>

        <section className="legal-section">
          <h2>{german ? "Verantwortlich für redaktionelle Inhalte" : "Responsible for editorial content"}</h2>
          <p>
            {german
              ? "Verantwortlich gemäß § 18 Abs. 2 MStV, soweit journalistisch-redaktionelle Inhalte angeboten werden:"
              : "Responsible under Section 18(2) of the German State Media Treaty where journalistic-editorial content is provided:"}
          </p>
          <p>Luca Bohnet, Vogelsangweg 3, 72202 Nagold, Deutschland</p>
        </section>

        <section className="legal-section">
          <h2>{german ? "Verbraucherstreitbeilegung" : "Consumer dispute resolution"}</h2>
          <p>
            {german
              ? "Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen."
              : "We are neither willing nor obliged to participate in dispute-resolution proceedings before a consumer arbitration board."}
          </p>
        </section>

        <section className="legal-section">
          <h2>{german ? "Haftung für Inhalte" : "Liability for content"}</h2>
          <p>
            {german
              ? "Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Eine Verpflichtung zur Überwachung übermittelter oder gespeicherter fremder Informationen besteht nur im Rahmen der gesetzlichen Vorschriften. Verpflichtungen zur Entfernung oder Sperrung von Informationen nach den allgemeinen Gesetzen bleiben unberührt."
              : "As a service provider, we are responsible for our own content under general law. Duties to monitor third-party information arise only where required by law. Statutory obligations to remove or block information remain unaffected."}
          </p>
        </section>

        <section className="legal-section">
          <h2>{german ? "Haftung für Links" : "Liability for links"}</h2>
          <p>
            {german
              ? "Unser Angebot enthält Links zu externen Websites, auf deren Inhalte wir keinen Einfluss haben. Für diese fremden Inhalte ist der jeweilige Anbieter verantwortlich. Bei Bekanntwerden konkreter Rechtsverletzungen werden entsprechende Links unverzüglich entfernt."
              : "This service contains links to external websites whose content we cannot control. The respective provider is responsible for that content. Links will be removed promptly if a specific legal violation becomes known."}
          </p>
        </section>

        <section className="legal-section">
          <h2>{german ? "Urheberrecht" : "Copyright"}</h2>
          <p>
            {german
              ? "Die durch den Betreiber erstellten Inhalte und Werke unterliegen dem deutschen Urheberrecht. Vervielfältigung, Bearbeitung, Verbreitung und Verwertung außerhalb der gesetzlichen Grenzen bedürfen der vorherigen Zustimmung des jeweiligen Rechteinhabers. Rechte Dritter werden beachtet und entsprechende Inhalte als solche gekennzeichnet."
              : "Content and works created by the operator are subject to German copyright law. Reproduction, adaptation, distribution, or exploitation beyond statutory limits requires prior permission from the respective rights holder. Third-party rights are respected and relevant content is identified accordingly."}
          </p>
        </section>

        <footer className="legal-foot">
          <p>{german ? "Stand: 12. Juni 2026" : "Last updated: 12 June 2026"}</p>
        </footer>
      </div>
    </main>
  );
}
