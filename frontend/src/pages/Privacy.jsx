import "../styles/Legal.css";

export default function Privacy() {
  return (
    <main className="legal-page">
      <div className="legal-container">
        <header className="legal-header">
          <p className="legal-label">Rechtliches</p>
          <h1 className="legal-title">Datenschutzerklaerung</h1>
          <p className="legal-subtitle">Informationen zur Verarbeitung personenbezogener Daten auf nexory-dev.de</p>
        </header>

        <section className="legal-section">
          <h2>1. Verantwortlicher</h2>
          <p>
            Luca Bohnet<br />
          </p>
          <p>
            <strong>E-Mail:</strong>{" "}
            <a href="mailto:support@nexory-dev.de">support@nexory-dev.de</a>
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Allgemeines zur Datenverarbeitung</h2>
          <p>
            Der Schutz deiner personenbezogenen Daten ist uns wichtig. Wir verarbeiten personenbezogene Daten nur,
            soweit dies zur Bereitstellung einer funktionsfaehigen Website, zur Bereitstellung unseres Nutzerkontosystems
            sowie zur Gewaehrleistung von Sicherheit und Stabilitaet erforderlich ist.
          </p>
          <p>
            Rechtsgrundlagen sind insbesondere Art. 6 Abs. 1 lit. b DSGVO (Vertrag / vorvertragliche Massnahmen)
            und Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an sicherem, stabilem und effizientem Betrieb).
          </p>
        </section>

        <section className="legal-section">
          <h2>3. Hosting und Server-Logfiles</h2>
          <p>
            Die Website wird auf einem Server in Deutschland betrieben. Beim Aufruf der Website werden automatisch
            technisch erforderliche Verbindungsdaten verarbeitet, insbesondere:
          </p>
          <ul>
            <li>IP-Adresse</li>
            <li>Datum und Uhrzeit der Anfrage</li>
            <li>angeforderte URL</li>
            <li>HTTP-Statuscode</li>
            <li>User-Agent (Browser, Betriebssystem)</li>
            <li>Referrer-URL (falls übermittelt)</li>
          </ul>
          <p>
            Die Verarbeitung erfolgt zur Gewaehrleistung von Systemsicherheit und technischem Betrieb
            (Art. 6 Abs. 1 lit. f DSGVO).
          </p>
        </section>

        <section className="legal-section">
          <h2>4. Cookies, Local Storage und Session Storage</h2>

          <h3>Technisch erforderlicher Cookie</h3>
          <ul>
            <li>
              <strong>refresh_token</strong> (httpOnly, Secure, SameSite): dient der Sitzungsverwaltung
              nach erfolgreichem Login. Der Cookie ist nicht über JavaScript auslesbar.
            </li>
          </ul>

          <h3>Browser-Speicher</h3>
          <ul>
            <li><strong>language</strong>: gewaehlte Sprache (de/en)</li>
            <li><strong>access_token</strong>: kurzlebiges JWT für API-Authentifizierung</li>
            <li><strong>remember_me</strong>: merkt, ob "Angemeldet bleiben" aktiviert wurde</li>
            <li><strong>device_id</strong>: technische Geraete-ID für Login-Sitzungen</li>
            <li><strong>home_github_stats</strong>: temporarer Cache öffentlicher GitHub-Statistiken</li>
          </ul>
          <p>
            Es werden keine Tracking- oder Marketing-Cookies eingesetzt.
          </p>
        </section>

        <section className="legal-section">
          <h2>5. Nutzerkonto und Authentifizierung</h2>
          <p>
            Bei Registrierung und Nutzung eines Kontos verarbeiten wir insbesondere folgende Daten:
          </p>
          <ul>
            <li><strong>E-Mail-Adresse</strong> (Pflichtfeld)</li>
            <li><strong>Passwort-Hash</strong> (kein Klartext-Passwort)</li>
            <li><strong>Username</strong> (optional, öffentlich sichtbar wenn gesetzt)</li>
            <li><strong>Avatar</strong> (optional)</li>
            <li><strong>Verifizierungsstatus</strong> und Konto-Metadaten</li>
            <li><strong>Refresh-Token-Metadaten</strong> (Token-Hash, Ablaufzeit, User-Agent, IP, device_id)</li>
            <li><strong>GitHub-Nutzername und GitHub-ID</strong> (nur bei freiwilliger Verbindung, siehe Abschnitt 9a)</li>
          </ul>
          <p>
            Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Bereitstellung des Kontosystems).
          </p>
        </section>

        <section className="legal-section">
          <h2>6. Zwei-Faktor-Authentifizierung (2FA)</h2>
          <p>
            Wenn du 2FA aktivierst, werden zusaetzlich folgende Daten verarbeitet:
          </p>
          <ul>
            <li><strong>TOTP-Secret</strong> zur Erzeugung zeitbasierter Einmalcodes</li>
            <li><strong>Backup-Codes</strong> in gehashter Form (einmal nutzbar)</li>
            <li><strong>Kurzlebige MFA-Challenges</strong> waehrend des Login-Prozesses</li>
          </ul>
          <p>
            Der 2FA-Code selbst wird nur zur Verifikation verwendet. Backup-Codes werden nicht im Klartext gespeichert.
            Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO sowie Art. 6 Abs. 1 lit. f DSGVO (Sicherheitsinteresse).
          </p>
        </section>

        <section className="legal-section">
          <h2>7. Profil, Avatar und öffentliche Profile</h2>
          <p>
            Wenn ein Username gesetzt ist, kann ein öffentliches Profil unter <code>/user/&lt;username&gt;</code>
            abrufbar sein. Dort werden Username, Avatar (falls gesetzt), Mitglied seit sowie Badges angezeigt.
          </p>
          <p>
            Avatar-Uploads werden serverseitig verarbeitet, auf ein quadratisches Format zugeschnitten und gespeichert.
          </p>
        </section>

        <section className="legal-section">
          <h2>8. E-Mail-Versand</h2>
          <p>
            Für transaktionale E-Mails (z. B. Verifizierung, Passwort-Reset) wird ein externer Versanddienst eingesetzt.
            Dabei wird deine E-Mail-Adresse ausschliesslich zum Versand dieser technisch erforderlichen Nachrichten verarbeitet.
          </p>
        </section>

        <section className="legal-section">
          <h2>9. GitHub-Daten (öffentliche Organisationsdaten)</h2>
          <p>
            In Teilen der Website werden öffentlich verfügbare Daten aus der GitHub-API angezeigt,
            insbesondere zur GitHub-Organisation <strong>NexoryDev</strong>
            (z. B. Repositories, Sterne, Commits, Mitglieder und Projektinformationen).
          </p>
          <p>
            Die Abfragen erfolgen über unsere eigenen API-Endpunkte. Zweck ist die Darstellung
            öffentlicher Open-Source-Informationen (Art. 6 Abs. 1 lit. f DSGVO).
          </p>
          <p>
            Die zugehörige Organisation ist erreichbar unter{" "}
            <a href="https://github.com/NexoryDev" target="_blank" rel="noopener noreferrer">
              https://github.com/NexoryDev
            </a>
            .
          </p>
          <p>
            GitHub ist ein Dienst der GitHub, Inc. Weitere Informationen zur Datenverarbeitung durch
            GitHub findest du unter{" "}
            <a
              href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement
            </a>
            .
          </p>
        </section>
        <section className="legal-section">
          <h2>9a. GitHub-Kontoverbindung (OAuth)</h2>
          <p>
            Du kannst deinen GitHub-Account freiwillig mit deinem Nexory-Konto verbinden, um GitHub-basierte
            Badges (z. B. &bdquo;Nexory Contributor&ldquo;) freizuschalten.
          </p>
          <p>
            Dabei werden ausschliesslich folgende Daten aus dem öffentlichen GitHub-Profil dauerhaft gespeichert:
          </p>
          <ul>
            <li><strong>GitHub-Nutzername</strong> (Login-Name, öffentlich auf GitHub)</li>
            <li><strong>GitHub-User-ID</strong> (numerische ID zur eindeutigen Zuordnung)</li>
          </ul>
          <p>
            Es werden <strong>keine</strong> E-Mail-Adressen, keine privaten Repository-Daten,
            keine OAuth-Tokens und kein Schreibzugriff auf GitHub abgefragt oder gespeichert.
            Der verwendete OAuth-Scope ist auf <code>read:user</code> beschraenkt.
          </p>
          <p>
            Der während der Verbindung temporär ausgestellte GitHub-OAuth-Token wird
            ausschliesslich zum Abruf des öffentlichen Profils verwendet und danach
            <strong> nicht</strong> persistiert.
          </p>
          <p>
            Die Verbindung ist freiwillig. Du kannst sie jederzeit in den Einstellungen
            deines Nexory-Kontos trennen. Dabei werden GitHub-Nutzername und GitHub-ID
            sofort aus der Datenbank gelöscht.
          </p>
          <p>
            Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung durch aktives Verbinden).
          </p>
        </section>
        <section className="legal-section">
          <h2>10. Discord-Bot Nexory</h2>
          <p>
            NexoryDev betreibt den Discord-Bot <strong>Nexory</strong>. Der Qüllcode ist öffentlich
            einsehbar unter{" "}
            <a href="https://github.com/NexoryDev/Nexory" target="_blank" rel="noopener noreferrer">
              https://github.com/NexoryDev/Nexory
            </a>
            .
          </p>
          <p>
            Bei Nutzung des Bots können folgende Daten verarbeitet werden: Discord User-ID,
            Discord Server-ID (Guild-ID), Bot-Konfigurationen sowie in Commands eingegebene Inhalte,
            soweit dies für die jeweilige Bot-Funktion erforderlich ist.
          </p>
          <p>
            Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Bereitstellung der angeforderten
            Bot-Funktionen) sowie Art. 6 Abs. 1 lit. f DSGVO (Sicherheit, Stabilitaet und
            Missbrauchspraevention).
          </p>
          <p>
            Discord selbst ist ein externer Plattformanbieter. Bei Nutzung von Discord gelten
            zusaetzlich die Datenschutzbestimmungen von Discord:
            {" "}
            <a href="https://discord.com/privacy" target="_blank" rel="noopener noreferrer">
              https://discord.com/privacy
            </a>
            .
          </p>
        </section>

        <section className="legal-section">
          <h2>11. Speicherdaür</h2>
          <ul>
            <li>Konto- und Profildaten: bis zur Löschung des Kontos</li>
            <li>Refresh-Tokens: bis Ablauf oder Widerruf</li>
            <li>E-Mail-Verifizierungen und Passwort-Reset-Tokens: nur befristet</li>
            <li>2FA-Backup-Codes: bis Verbrauch, Regenerierung oder Deaktivierung von 2FA</li>
            <li>GitHub-Nutzername und GitHub-ID: bis zur Trennung der Verbindung oder Kontolöschung</li>
            <li>Discord-Bot-Daten: bis zur Löschung durch Nutzer/Guild-Admins oder Entfernung des Bots</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>12. Deine Rechte</h2>
          <p>Du hast nach der DSGVO insbesondere folgende Rechte:</p>
          <ul>
            <li>Auskunft (Art. 15 DSGVO)</li>
            <li>Berichtigung (Art. 16 DSGVO)</li>
            <li>Löschung (Art. 17 DSGVO)</li>
            <li>Einschraenkung der Verarbeitung (Art. 18 DSGVO)</li>
            <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
            <li>Widerspruch (Art. 21 DSGVO)</li>
          </ul>
          <p>
            Zur Ausübung deiner Rechte kontaktiere uns bitte unter{" "}
            <a href="mailto:support@nexory-dev.de">support@nexory-dev.de</a>.
          </p>
        </section>

        <section className="legal-section">
          <h2>13. Beschwerderecht bei Aufsichtsbehörden</h2>
          <p>
            Du hast das Recht, dich bei einer Datenschutzaufsichtsbehörde zu beschweren,
            wenn du der Ansicht bist, dass die Verarbeitung deiner personenbezogenen Daten
            nicht rechtmaessig erfolgt.
          </p>
        </section>

        <footer className="legal-foot">
          <p>Stand: 8. Mai 2026</p>
        </footer>
      </div>
    </main>
  );
}
