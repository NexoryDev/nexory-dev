import "../styles/Legal.css";
import { useLanguage } from "../context/LanguageContext";

const SUPPORT_EMAIL = "support@nexory-dev.de";

function ContactAddress({ country = "Deutschland" }) {
  return (
    <p>
      Luca Bohnet<br />
      Vogelsangweg 3<br />
      72202 Nagold<br />
      {country}
    </p>
  );
}

function GermanPrivacy() {
  return (
    <>
      <section className="legal-section">
        <h2>1. Verantwortlicher</h2>
        <ContactAddress />
        <p>
          Telefon: +49 7452 8866722<br />
          E-Mail: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        </p>
      </section>

      <section className="legal-section">
        <h2>2. Allgemeine Hinweise</h2>
        <p>
          Diese Datenschutzerklärung informiert gemäß Art. 12 bis 14 DSGVO darüber, wie personenbezogene Daten beim
          Besuch dieser Website, bei der Nutzung eines Benutzerkontos und bei freiwillig verbundenen Diensten
          verarbeitet werden. Die DSGVO gilt für die Verarbeitung durch den in Deutschland ansässigen
          Verantwortlichen unabhängig vom Aufenthaltsort der betroffenen Person.
        </p>
        <p>
          Personenbezogene Daten werden nur verarbeitet, soweit dies für den Betrieb, die Sicherheit und die
          angeforderten Funktionen erforderlich ist oder eine Einwilligung erteilt wurde.
        </p>
      </section>

      <section className="legal-section">
        <h2>3. Hosting, Auslieferung und Server-Protokolle</h2>
        <p>
          Beim Aufruf der Website verarbeiten der Webserver und der eingesetzte Hostinganbieter insbesondere
          IP-Adresse, Datum und Uhrzeit, aufgerufene Ressource, HTTP-Status, übertragene Datenmenge, Referrer sowie
          Browser- und Betriebssysteminformationen. Die Verarbeitung ist für die Auslieferung der Website sowie zur
          Erkennung und Abwehr von Angriffen erforderlich.
        </p>
        <p>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes Interesse liegt im sicheren, stabilen und
          fehlerfreien Betrieb des Angebots. Anwendungsbezogene Sicherheitsprotokolle werden in der
          Produktionsumgebung grundsätzlich spätestens nach 90 Tagen gelöscht, sofern sie nicht zur Aufklärung eines
          konkreten Sicherheitsvorfalls länger benötigt werden. Infrastrukturprotokolle des Hostinganbieters werden
          nach dessen vertraglichen Löschfristen entfernt.
        </p>
        <p>
          Empfänger können der Hostinganbieter und technische Dienstleister sein, die als Auftragsverarbeiter nach
          Art. 28 DSGVO eingesetzt werden. Der konkret eingesetzte Hostinganbieter und dessen Serverstandort richten
          sich nach der jeweiligen Bereitstellungskonfiguration.
        </p>
      </section>

      <section className="legal-section">
        <h2>4. Cookies und Speicher im Browser</h2>
        <p>
          Es werden keine Analyse-, Werbe- oder Profiling-Cookies eingesetzt. Für Anmeldung und Einstellungen werden
          ausschließlich technisch erforderliche Speichermechanismen verwendet. Rechtsgrundlage für den Zugriff auf
          die Endeinrichtung ist § 25 Abs. 2 Nr. 2 TDDDG; die anschließende Verarbeitung erfolgt nach Art. 6 Abs. 1
          lit. b oder lit. f DSGVO.
        </p>
        <ul>
          <li><strong>refresh_token:</strong> HttpOnly-Cookie für die Anmeldung; Sitzungsdauer oder höchstens 7 Tage bei „angemeldet bleiben“.</li>
          <li><strong>access_token:</strong> kurzlebiges Authentifizierungstoken im Session- oder Local Storage; technisch 15 Minuten gültig.</li>
          <li><strong>remember_me:</strong> speichert lokal, ob die dauerhafte Anmeldung gewählt wurde.</li>
          <li><strong>device_id:</strong> zufällige lokale Gerätekennung zur Verwaltung von Anmeldesitzungen.</li>
          <li><strong>language:</strong> speichert die gewählte Sprache bis zur Löschung durch den Nutzer.</li>
          <li><strong>gh_connect_token:</strong> vorübergehendes Token im Session Storage während einer GitHub-Verknüpfung.</li>
        </ul>
        <p>Diese Daten können über die Browserfunktionen gelöscht werden; dadurch kann eine erneute Anmeldung erforderlich werden.</p>
      </section>

      <section className="legal-section">
        <h2>5. Registrierung und Benutzerkonto</h2>
        <p>
          Für Registrierung, Anmeldung und Kontoverwaltung verarbeiten wir E-Mail-Adresse, Passwort-Hash,
          Verifikationsstatus, Benutzer-ID, Erstellungszeitpunkt und optional einen Benutzernamen. Zur Absicherung von
          Sitzungen werden außerdem Token-Hash, Ablaufzeit, IP-Adresse, User-Agent, Gerätekennung und die Auswahl
          „angemeldet bleiben“ verarbeitet.
        </p>
        <p>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO. E-Mail-Adresse und Passwort sind für die Bereitstellung eines
          Kontos erforderlich. Ohne diese Angaben kann kein Konto erstellt werden. IP-Adresse und Sitzungsmetadaten
          werden zusätzlich auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO zur Missbrauchs- und Angriffserkennung
          verarbeitet.
        </p>
        <p>
          Kontodaten werden bis zur Kontolöschung gespeichert. Abgelaufene oder widerrufene Sitzungstoken werden
          regelmäßig gelöscht. Nicht dauerhaft angemeldete Sitzungen laufen nach 24 Stunden, dauerhaft angemeldete
          Sitzungen nach 7 Tagen ab.
        </p>
      </section>

      <section className="legal-section">
        <h2>6. E-Mail-Verifikation und Passwort-Zurücksetzung</h2>
        <p>
          Für Verifikations- und Passwort-Zurücksetzungsnachrichten werden E-Mail-Adresse und ein einmalig nutzbarer
          Link an <strong>Resend</strong>, einen Dienst von Plus Five Five, Inc. in den USA, übermittelt. Resend wird als
          Auftragsverarbeiter eingesetzt. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO.
        </p>
        <p>
          Verifikationstoken sind 24 Stunden, Passwort-Reset-Token eine Stunde gültig und werden nach Nutzung oder
          Ablauf gelöscht. Für Übermittlungen in die USA werden die im Auftragsverarbeitungsvertrag vorgesehenen
          Garantien, insbesondere EU-Standardvertragsklauseln, verwendet, soweit kein Angemessenheitsbeschluss greift.
          Weitere Informationen: <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Resend Privacy Policy</a> und{' '}
          <a href="https://resend.com/legal/dpa" target="_blank" rel="noopener noreferrer">Data Processing Addendum</a>.
        </p>
      </section>

      <section className="legal-section">
        <h2>7. Zwei-Faktor-Authentifizierung</h2>
        <p>
          Bei freiwilliger Aktivierung werden ein TOTP-Geheimnis, gehashte Einmal-Backupcodes und kurzfristige
          Anmelde-Challenges verarbeitet. Ausstehende Einrichtungsdaten verfallen nach 10 Minuten,
          Anmelde-Challenges nach 5 Minuten. Das TOTP-Geheimnis bleibt bis zur Deaktivierung der Zwei-Faktor-
          Authentifizierung oder Kontolöschung gespeichert. Ein verwendeter Backupcode wird unmittelbar gelöscht.
        </p>
        <p>Rechtsgrundlagen sind Art. 6 Abs. 1 lit. b und lit. f DSGVO; unser berechtigtes Interesse ist die Kontosicherheit.</p>
      </section>

      <section className="legal-section">
        <h2>8. Öffentliches Profil und Avatare</h2>
        <p>
          Verifizierte Nutzer können durch das Setzen eines Benutzernamens ein öffentlich abrufbares Profil unter
          <code> /user/&lt;username&gt;</code> bereitstellen. Öffentlich erscheinen können Benutzername, selbst
          hochgeladener Avatar, Biografie, gewählter Standort, daraus abgeleitete Zeitzone und Ortszeit, GitHub-
          Benutzername, Abzeichen sowie Monat und Jahr der Mitgliedschaft.
        </p>
        <p>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, da das Profil auf Wunsch des Nutzers bereitgestellt wird.
          Freiwillige Angaben können jederzeit geändert oder entfernt werden. Durch Entfernen des Benutzernamens ist
          das öffentliche Profil nicht mehr über den bisherigen Profilpfad abrufbar.
        </p>
        <p>
          Hochgeladene Avatare werden lokal geprüft, quadratisch zugeschnitten, auf 400 × 400 Pixel verkleinert und als
          JPEG unter einem zufälligen Dateinamen gespeichert. Originaldatei und ursprünglicher Dateiname werden nicht
          dauerhaft gespeichert. Beim Austausch und bei Kontolöschung wird die bisherige Avatar-Datei gelöscht.
        </p>
      </section>

      <section className="legal-section">
        <h2>9. GitHub-Inhalte und GitHub OAuth</h2>
        <p>
          Zur Darstellung der Open-Source-Aktivitäten ruft unser Server öffentlich verfügbare Organisations-,
          Repository-, Mitglieds- und Beitragsdaten über die GitHub API ab und speichert sie kurzzeitig zwischen.
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO; das berechtigte Interesse besteht in der Darstellung unserer
          öffentlich zugänglichen Projekte. Beim bloßen Seitenbesuch wird keine direkte Browseranfrage an die GitHub API ausgelöst.
        </p>
        <p>
          Nutzer können ihr Konto freiwillig über GitHub OAuth verbinden. Angefordert wird der Umfang
          <code> read:user</code>. Dauerhaft gespeichert werden GitHub-Benutzername und numerische GitHub-ID. Das
          temporäre OAuth-Zugriffstoken wird nur zum Abruf des Profils verwendet und nicht dauerhaft gespeichert.
          Bei der Abzeichenprüfung werden öffentlich zugängliche Beitragsdaten mit dem verknüpften GitHub-Profil
          verglichen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. a DSGVO. Die Einwilligung kann jederzeit durch Trennen der
          Verbindung in den Kontoeinstellungen widerrufen werden; die gespeicherte GitHub-ID und der Benutzername
          werden dabei gelöscht.
        </p>
        <p>
          Empfänger ist GitHub, Inc., USA. Bei Nutzung von GitHub kann eine Verarbeitung in den USA stattfinden.
          Informationen zur Verarbeitung und zu Übermittlungsgrundlagen enthält die{' '}
          <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer">GitHub-Datenschutzerklärung</a>.
        </p>
      </section>

      <section className="legal-section">
        <h2>10. Discord-Bot</h2>
        <p>
          Soweit der Discord-Bot „Nexory“ unter Verantwortung des oben genannten Verantwortlichen genutzt wird,
          können für die angeforderte Funktion Discord-Nutzer-ID, Server-ID, Befehlsinhalt und Konfigurationsdaten
          verarbeitet werden. Rechtsgrundlagen sind Art. 6 Abs. 1 lit. b und lit. f DSGVO. Das berechtigte Interesse
          besteht in Betriebssicherheit und Missbrauchsvermeidung. Funktionsdaten werden gelöscht, wenn sie für die
          Funktion nicht mehr erforderlich sind oder der Bot vom Server entfernt wird; Sicherheitsprotokolle
          spätestens nach 90 Tagen, sofern kein Vorfall eine längere Aufbewahrung erfordert.
        </p>
        <p>
          Discord ist ein eigenständiger Anbieter und kann Daten in Drittländern verarbeiten. Es gilt ergänzend die{' '}
          <a href="https://discord.com/privacy" target="_blank" rel="noopener noreferrer">Datenschutzerklärung von Discord</a>.
        </p>
      </section>

      <section className="legal-section">
        <h2>11. Empfänger und Auftragsverarbeitung</h2>
        <p>
          Daten erhalten nur Stellen, die sie für die genannten Zwecke benötigen. Dazu gehören Hosting- und
          Infrastrukturprovider, Resend für transaktionale E-Mails sowie GitHub beziehungsweise Discord bei
          freiwilliger Nutzung der jeweiligen Dienste. Interne Datenbank-, Redis- und Virenscan-Komponenten werden
          innerhalb der betriebenen Infrastruktur eingesetzt. Auftragsverarbeiter werden nach Art. 28 DSGVO
          vertraglich verpflichtet.
        </p>
      </section>

      <section className="legal-section">
        <h2>12. Drittlandübermittlungen</h2>
        <p>
          Bei Resend, GitHub und Discord kann eine Verarbeitung außerhalb der EU oder des EWR, insbesondere in den
          USA, stattfinden. Eine Übermittlung erfolgt nur auf Grundlage eines Angemessenheitsbeschlusses nach Art. 45
          DSGVO oder geeigneter Garantien nach Art. 46 DSGVO, insbesondere EU-Standardvertragsklauseln. Trotz dieser
          Garantien kann in Drittländern ein von der EU abweichendes Datenschutzniveau bestehen.
        </p>
      </section>

      <section className="legal-section">
        <h2>13. Löschung und Aufbewahrung</h2>
        <p>
          Soweit oben keine konkrete Frist genannt ist, werden Daten gelöscht, sobald der Zweck entfällt und keine
          gesetzlichen Aufbewahrungspflichten oder berechtigten Gründe für eine weitere Speicherung bestehen. Bei
          Kontolöschung werden Konto-, Profil-, Sitzungs-, 2FA- und Verknüpfungsdaten sowie lokal gespeicherte Avatare
          gelöscht. Gesetzlich aufzubewahrende Daten werden bis zum Ende der jeweiligen Frist gesperrt.
        </p>
      </section>

      <section className="legal-section">
        <h2>14. Betroffenenrechte</h2>
        <p>
          Betroffene haben nach Maßgabe der gesetzlichen Voraussetzungen das Recht auf Auskunft (Art. 15 DSGVO),
          Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung (Art. 18), Datenübertragbarkeit (Art. 20) und
          Widerspruch (Art. 21). Eine Einwilligung kann jederzeit mit Wirkung für die Zukunft widerrufen werden, ohne
          dass die Rechtmäßigkeit der vorherigen Verarbeitung berührt wird.
        </p>
        <p>Anfragen können an <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> gerichtet werden.</p>
      </section>

      <section className="legal-section">
        <h2>15. Widerspruch gegen berechtigte Interessen</h2>
        <p>
          Soweit die Verarbeitung auf Art. 6 Abs. 1 lit. f DSGVO beruht, kann aus Gründen, die sich aus der besonderen
          Situation der betroffenen Person ergeben, jederzeit Widerspruch eingelegt werden. Wir verarbeiten die Daten
          dann nicht weiter, sofern keine zwingenden schutzwürdigen Gründe oder Rechtsansprüche entgegenstehen.
        </p>
      </section>

      <section className="legal-section">
        <h2>16. Beschwerderecht</h2>
        <p>
          Es besteht das Recht, sich bei einer Datenschutzaufsichtsbehörde zu beschweren. Zuständig für den
          Verantwortlichen ist der Landesbeauftragte für den Datenschutz und die Informationsfreiheit Baden-Württemberg,
          Lautenschlagerstraße 20, 70173 Stuttgart. Weitere Informationen:{' '}
          <a href="https://www.baden-wuerttemberg.datenschutz.de/" target="_blank" rel="noopener noreferrer">baden-wuerttemberg.datenschutz.de</a>.
        </p>
      </section>

      <section className="legal-section">
        <h2>17. Automatisierte Entscheidungen und Minderjährige</h2>
        <p>
          Es findet keine ausschließlich automatisierte Entscheidungsfindung einschließlich Profiling im Sinne von
          Art. 22 DSGVO statt. Das Angebot richtet sich nicht gezielt an Kinder unter 16 Jahren. Personen unter 16
          Jahren sollen kein Konto ohne Zustimmung der Erziehungsberechtigten erstellen.
        </p>
      </section>

      <section className="legal-section">
        <h2>18. Änderungen</h2>
        <p>Diese Erklärung wird angepasst, wenn sich Funktionen, Dienstleister oder die Rechtslage ändern.</p>
      </section>
    </>
  );
}

function EnglishPrivacy() {
  return (
    <>
      <section className="legal-section">
        <h2>1. Controller</h2>
        <ContactAddress country="Germany" />
        <p>
          Phone: +49 7452 8866722<br />
          Email: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        </p>
      </section>

      <section className="legal-section">
        <h2>2. General information</h2>
        <p>
          This policy provides the information required by Articles 12 to 14 GDPR about processing when visiting the
          website, using an account, or voluntarily connecting third-party services. The GDPR applies to processing by
          the controller established in Germany regardless of the user's place of residence.
        </p>
      </section>

      <section className="legal-section">
        <h2>3. Hosting and server logs</h2>
        <p>
          The web server and hosting provider process the IP address, date and time, requested resource, HTTP status,
          transferred data volume, referrer, browser, and operating-system information to deliver and secure the site.
          The legal basis is Art. 6(1)(f) GDPR, based on our interest in secure and reliable operation.
        </p>
        <p>
          Application security logs in production are normally deleted after no more than 90 days unless required for
          investigating a specific incident. Infrastructure logs are deleted under the hosting provider's contractual
          retention rules. Hosting and technical providers may act as processors under Art. 28 GDPR. The provider and
          server location depend on the deployment configuration in use.
        </p>
      </section>

      <section className="legal-section">
        <h2>4. Cookies and browser storage</h2>
        <p>
          We do not use analytics, advertising, or profiling cookies. Access to the user's device is limited to
          technically necessary storage under Section 25(2)(2) TDDDG; subsequent processing is based on Art. 6(1)(b)
          or (f) GDPR.
        </p>
        <ul>
          <li><strong>refresh_token:</strong> HttpOnly login cookie; session duration or up to 7 days when “stay signed in” is selected.</li>
          <li><strong>access_token:</strong> authentication token in session or local storage; technically valid for 15 minutes.</li>
          <li><strong>remember_me:</strong> stores the persistent-login choice locally.</li>
          <li><strong>device_id:</strong> random local identifier used to manage login sessions.</li>
          <li><strong>language:</strong> stores the selected language until removed by the user.</li>
          <li><strong>gh_connect_token:</strong> temporary session-storage token during GitHub linking.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>5. Registration and accounts</h2>
        <p>
          We process email address, password hash, verification status, user ID, account creation time, and an optional
          username. Session security additionally uses token hash, expiry, IP address, user agent, device ID, and the
          persistent-login choice. Art. 6(1)(b) GDPR is the legal basis. Email and password are required to create an
          account. Security metadata is additionally processed under Art. 6(1)(f) GDPR to prevent abuse and attacks.
        </p>
        <p>
          Account data is retained until account deletion. Non-persistent sessions expire after 24 hours and persistent
          sessions after 7 days. Expired or revoked tokens are removed regularly.
        </p>
      </section>

      <section className="legal-section">
        <h2>6. Verification and password reset emails</h2>
        <p>
          Email addresses and single-use links are sent to <strong>Resend</strong>, a service of Plus Five Five, Inc. in
          the United States, acting as a processor. The legal basis is Art. 6(1)(b) GDPR. Verification tokens are valid
          for 24 hours and password-reset tokens for one hour, and are removed after use or expiry.
        </p>
        <p>
          Transfers to the United States rely on the safeguards in the processing agreement, including EU Standard
          Contractual Clauses where no adequacy decision applies. See the{' '}
          <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Resend Privacy Policy</a> and{' '}
          <a href="https://resend.com/legal/dpa" target="_blank" rel="noopener noreferrer">Data Processing Addendum</a>.
        </p>
      </section>

      <section className="legal-section">
        <h2>7. Two-factor authentication</h2>
        <p>
          If enabled voluntarily, we process a TOTP secret, hashed single-use backup codes, and short-lived login
          challenges. Pending setup data expires after 10 minutes and login challenges after 5 minutes. The TOTP secret
          remains until 2FA is disabled or the account is deleted. A used backup code is deleted immediately. The legal
          bases are Art. 6(1)(b) and (f) GDPR, based on our interest in account security.
        </p>
      </section>

      <section className="legal-section">
        <h2>8. Public profiles and avatars</h2>
        <p>
          A verified user can create a public profile by setting a username. It may display the username, uploaded
          avatar, bio, selected location, derived timezone and local time, GitHub username, badges, and membership month
          and year. The legal basis is Art. 6(1)(b) GDPR because the profile is provided at the user's request. Optional
          fields can be changed or removed at any time; removing the username disables the existing public profile path.
        </p>
        <p>
          Uploaded avatars are scanned locally, cropped, resized to 400 × 400 pixels, and stored as JPEG under a random
          filename. The original file and filename are not retained. Previous avatar files are deleted when replaced or
          when the account is deleted.
        </p>
      </section>

      <section className="legal-section">
        <h2>9. GitHub content and OAuth</h2>
        <p>
          Our server retrieves publicly available organization, repository, member, and contribution data from the
          GitHub API and caches it briefly to present our open-source work. The basis is Art. 6(1)(f) GDPR. A normal page
          visit does not cause the browser to contact the GitHub API directly.
        </p>
        <p>
          Users may voluntarily link GitHub with the <code>read:user</code> scope. We retain only the GitHub username
          and numeric ID. The temporary OAuth token is used to retrieve the profile and is not retained. Public
          contribution data is compared when checking badges. The legal basis is consent under Art. 6(1)(a) GDPR. It
          can be withdrawn by disconnecting GitHub, which deletes the stored username and ID.
        </p>
        <p>
          GitHub, Inc. in the United States is a recipient. See the{' '}
          <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer">GitHub Privacy Statement</a>.
        </p>
      </section>

      <section className="legal-section">
        <h2>10. Discord bot</h2>
        <p>
          Where the “Nexory” Discord bot is operated by the controller above, Discord user ID, server ID, command input,
          and configuration data may be processed for the requested function. The bases are Art. 6(1)(b) and (f) GDPR.
          Function data is removed when no longer needed or when the bot is removed; security logs are retained for no
          more than 90 days unless an incident requires longer retention. Discord may process data in third countries.
          See <a href="https://discord.com/privacy" target="_blank" rel="noopener noreferrer">Discord's Privacy Policy</a>.
        </p>
      </section>

      <section className="legal-section">
        <h2>11. Recipients and international transfers</h2>
        <p>
          Data is disclosed only to providers needed for the purposes above, including hosting and infrastructure
          providers, Resend, GitHub, and Discord where applicable. Processors are bound under Art. 28 GDPR. Transfers
          outside the EU/EEA rely on an adequacy decision under Art. 45 GDPR or appropriate safeguards under Art. 46,
          particularly EU Standard Contractual Clauses. Internal database, Redis, and malware-scanning components run
          within the operated infrastructure.
        </p>
      </section>

      <section className="legal-section">
        <h2>12. Deletion and retention</h2>
        <p>
          Unless a specific period is stated above, data is deleted when its purpose ends and no legal retention duty
          or overriding legitimate reason remains. Account deletion removes account, profile, session, 2FA, linked-
          service data, and locally stored avatars. Data subject to statutory retention is restricted until expiry.
        </p>
      </section>

      <section className="legal-section">
        <h2>13. Your rights</h2>
        <p>
          Subject to the legal requirements, you have rights of access (Art. 15 GDPR), rectification (Art. 16), erasure
          (Art. 17), restriction (Art. 18), portability (Art. 20), and objection (Art. 21). Consent can be withdrawn at
          any time for the future without affecting prior lawful processing. Contact{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> to exercise these rights.
        </p>
        <p>
          Where processing relies on Art. 6(1)(f) GDPR, you may object for reasons arising from your particular
          situation. Processing will stop unless compelling legitimate grounds or legal claims override the objection.
        </p>
      </section>

      <section className="legal-section">
        <h2>14. Complaint, automated decisions, and minors</h2>
        <p>
          You may complain to a supervisory authority. The competent authority is the State Commissioner for Data
          Protection and Freedom of Information Baden-Württemberg, Lautenschlagerstraße 20, 70173 Stuttgart:{' '}
          <a href="https://www.baden-wuerttemberg.datenschutz.de/" target="_blank" rel="noopener noreferrer">baden-wuerttemberg.datenschutz.de</a>.
        </p>
        <p>
          We do not use solely automated decision-making or profiling under Art. 22 GDPR. The service is not directed
          at children under 16, who should not create an account without parental consent.
        </p>
      </section>

      <section className="legal-section">
        <h2>15. Changes</h2>
        <p>This policy will be updated when functions, providers, or legal requirements change.</p>
      </section>
    </>
  );
}

export default function Privacy() {
  const { t, language } = useLanguage();

  return (
    <main className="legal-page">
      <div className="legal-container">
        <header className="legal-header">
          <p className="legal-label">{t("privacy.label")}</p>
          <h1 className="legal-title">{t("privacy.title")}</h1>
          <p className="legal-subtitle">{t("privacy.subtitle")}</p>
        </header>

        {language === "de" ? <GermanPrivacy /> : <EnglishPrivacy />}

        <footer className="legal-foot">
          <p>{language === "de" ? "Stand: 12. Juni 2026 · Version 3" : "Effective: 12 June 2026 · Version 3"}</p>
        </footer>
      </div>
    </main>
  );
}
