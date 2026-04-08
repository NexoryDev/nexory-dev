import '../styles/Legal.css';

export default function Privacy() {
  return (
    <main className="legal-page">
      <div className="legal-container">

        <header className="legal-header">
          <p className="legal-label">Legal</p>
          <h1 className="legal-title">Privacy Policy</h1>
          <p className="legal-subtitle">How we handle your data on nexory-dev.de</p>
        </header>

        <section className="legal-section">
          <h2>1. Overview</h2>
          <p>
            The protection of your personal data is important to us. This privacy policy explains
            what data is collected when you visit nexory-dev.de, how it is used, and what rights you
            have regarding your data.
          </p>
          <p>
            This website is operated as a personal, non-commercial open-source project. We collect
            only the minimum data necessary to operate the site.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Responsible Party (Controller)</h2>
          <p>Luca Bohnet</p>
          <p>
            <strong>E-Mail:</strong>{' '}
            <a href="mailto:support@nexory-dev.de">support@nexory-dev.de</a>
          </p>
        </section>

        <section className="legal-section">
          <h2>3. Data Collected Automatically</h2>

          <h3>Server Log Files</h3>
          <p>
            When you visit this website, the web server automatically stores certain technical
            information in log files. This includes:
          </p>
          <ul>
            <li>IP address (anonymized where possible)</li>
            <li>Date and time of the request</li>
            <li>URL of the requested page</li>
            <li>HTTP status code</li>
            <li>Browser type and operating system (User-Agent)</li>
            <li>Referrer URL</li>
          </ul>
          <p>
            This data is processed on the basis of Art. 6 (1)(f) GDPR (legitimate interest) to
            ensure the security and stable operation of the website. Log files are deleted after
            a maximum of 30 days unless a concrete suspicion of unlawful use requires longer
            retention.
          </p>

          <h3>Session Cookies</h3>
          <p>
            We use a strictly necessary session cookie to remember your language preference during
            a browsing session. This cookie contains no personal data, is not shared with third
            parties, and expires when you close your browser. No consent is required for this
            cookie as it is technically essential (Art. 6 (1)(b) GDPR).
          </p>
        </section>

        <section className="legal-section">
          <h2>4. Contact Form</h2>
          <p>
            If you use the contact form, the data you enter (e.g. your name, e-mail address, and
            message) is transmitted to us and processed solely for the purpose of responding to
            your enquiry. This data is not passed on to third parties and is deleted as soon as
            it is no longer needed and no statutory retention periods apply.
          </p>
          <p>
            Legal basis: Art. 6 (1)(b) GDPR (performance of a contract or pre-contractual
            measures) or Art. 6 (1)(f) GDPR (legitimate interest in processing enquiries).
          </p>
        </section>

        <section className="legal-section">
          <h2>5. External Services — GitHub API</h2>
          <p>
            When you visit the <strong>GitHub</strong> page of this website, your browser connects
            directly to the GitHub REST API (<code>api.github.com</code>), operated by GitHub, Inc.,
            a subsidiary of Microsoft Corporation (USA). This connection causes your IP address and
            browser information (User-Agent) to be transmitted to GitHub's servers in the United States.
          </p>
          <p>
            The legal basis for this transfer is Art. 6 (1)(f) GDPR (legitimate interest in displaying
            publicly available open-source repository data). GitHub, Inc. participates in the EU–US Data
            Privacy Framework, which provides an adequate level of data protection pursuant to Art. 45 GDPR.
          </p>
          <p>
            No personal data entered by you is transmitted to GitHub. Only the technical connection data
            (IP address, browser type) is transferred as part of the HTTP request.
          </p>
          <p>
            GitHub's privacy policy is available at:{' '}
            <a
              href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
              target="_blank"
              rel="noopener noreferrer"
            >
              docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement
            </a>
          </p>
        </section>

        <section className="legal-section">
          <h2>6. Your Rights</h2>
          <p>Under the GDPR you have the following rights regarding your personal data:</p>
          <ul>
            <li><strong>Right of access</strong> (Art. 15 GDPR)</li>
            <li><strong>Right to rectification</strong> (Art. 16 GDPR)</li>
            <li><strong>Right to erasure</strong> (Art. 17 GDPR)</li>
            <li><strong>Right to restriction of processing</strong> (Art. 18 GDPR)</li>
            <li><strong>Right to data portability</strong> (Art. 20 GDPR)</li>
            <li><strong>Right to object</strong> (Art. 21 GDPR)</li>
          </ul>
          <p>
            To exercise any of these rights, please contact us at{' '}
            <a href="mailto:support@nexory-dev.de">support@nexory-dev.de</a>.
            You also have the right to lodge a complaint with a supervisory authority.
          </p>
          <p>
            Competent supervisory authority for Baden-Württemberg:{' '}
            <a
              href="https://www.baden-wuerttemberg.datenschutz.de"
              target="_blank"
              rel="noopener noreferrer"
            >
              Landesbeauftragter für den Datenschutz und die Informationsfreiheit Baden-Württemberg
            </a>
          </p>
        </section>

        <footer className="legal-foot">
          <p>Last updated: 8 April 2026</p>
        </footer>

      </div>
    </main>
  );
}
